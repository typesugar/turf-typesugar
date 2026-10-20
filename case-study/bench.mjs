#!/usr/bin/env node
// A/B benchmark runner for the case study.
//
//   node case-study/bench.mjs --a v7.4.0 --b stage-0 \
//     --packages turf-meta,turf-helpers [--rounds 5] [--out case-study/results/<name>]
//
// For each ref it makes a separate git worktree under --work (default
// $TMPDIR/turf-case-study-bench), installs it and builds the packages being
// benched plus their workspace dependencies. Pass --a-dir / --b-dir instead
// of a ref to use a tree you have already installed and built.
//
// Then, one process at a time, it runs each package's `bench.ts` (the
// package's own `pnpm run bench`) interleaved A, B, A, B, ... for N rounds,
// and writes summary.json and summary.md: median ops/sec per benchmark and
// side, the spread (min-max and IQR, as % of the median), and the delta of
// the B median against A. A delta smaller than the spread is flagged as noise.
//
// --loader decides which side runs its benches through typesugar's Node loader
// (case-study/with-typesugar.sh):
//   auto (default)  each tree that has the wrapper uses it; v7.4.0 does not
//   both            both sides use it (the wrapper from whichever tree has
//                   it), so A and B processes differ only in the code they run
//   none            neither side
// Use `both` whenever one side would otherwise run without it. The loader
// keeps a TypeScript Program in the bench process, and that alone moves some
// microbenchmarks by tens of percent with identical code (Stage 0 finding F7).
//
// Numbers are only comparable within one run: same machine, same process
// ordering, interleaved. The output records the machine, Node version, date
// and the load average at start and end.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const flag = (name) => args.includes(name);

if (flag("--help") || (!opt("--a") && !opt("--a-dir"))) {
  process.stdout.write(
    fs
      .readFileSync(fileURLToPath(import.meta.url), "utf8")
      .split("\n")
      .filter((l) => l.startsWith("//"))
      .map((l) => l.replace(/^\/\/ ?/, ""))
      .join("\n") + "\n"
  );
  process.exit(flag("--help") ? 0 : 1);
}

const packages = (opt("--packages", "") || "")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);
if (packages.length === 0) {
  console.error("error: --packages turf-meta,turf-helpers,... is required");
  process.exit(1);
}
const rounds = Number(opt("--rounds", "5"));
const loaderMode = opt("--loader", "auto");
if (!["auto", "both", "none"].includes(loaderMode)) {
  console.error("error: --loader must be auto, both or none");
  process.exit(1);
}
const work = path.resolve(
  opt("--work", path.join(os.tmpdir(), "turf-case-study-bench"))
);
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = path.resolve(
  opt("--out", path.join(repo, "case-study", "results", `bench-${stamp}`))
);

const sh = (cmd, argv, cwd) =>
  execFileSync(cmd, argv, {
    cwd,
    stdio: ["ignore", "pipe", "inherit"],
    encoding: "utf8",
  }).trim();

/** A tree to bench: an existing dir, or a worktree of `ref` that we install and build. */
function prepare(label, ref, dir) {
  if (dir) {
    dir = path.resolve(dir);
    return {
      label,
      ref: ref ?? null,
      dir,
      sha: sh("git", ["rev-parse", "HEAD"], dir),
    };
  }
  const sha = sh("git", ["rev-parse", `${ref}^{commit}`], repo);
  const tree = path.join(work, `${label}-${sha.slice(0, 12)}`);
  if (!fs.existsSync(tree)) {
    fs.mkdirSync(work, { recursive: true });
    sh("git", ["worktree", "add", "--detach", tree, sha], repo);
  }
  console.error(`[bench] ${label}: ${ref} (${sha.slice(0, 12)}) in ${tree}`);
  // --ignore-scripts: skip the root `prepare` (husky + a full build); we
  // build only what the benches import.
  run("pnpm", ["install", "--frozen-lockfile", "--ignore-scripts"], tree);
  const scopes = packages.flatMap((p) => ["--scope", packageName(tree, p)]);
  run(
    "npx",
    [
      "lerna",
      "run",
      "build",
      ...scopes,
      "--include-dependencies",
      "--concurrency",
      "4",
    ],
    tree,
    withTypesugar(tree)
  );
  return { label, ref, dir: tree, sha };
}

function run(cmd, argv, cwd, wrap) {
  const [c, a] = wrap ? [wrap, [cmd, ...argv]] : [cmd, argv];
  const r = spawnSync(c, a, { cwd, stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error(`${c} ${a.join(" ")} failed in ${cwd}`);
}

function packageName(tree, pkg) {
  return JSON.parse(
    fs.readFileSync(path.join(tree, "packages", pkg, "package.json"), "utf8")
  ).name;
}

function withTypesugar(tree) {
  const w = path.join(tree, "case-study", "with-typesugar.sh");
  return fs.existsSync(w) ? w : undefined;
}

/** The wrapper a side's benches run under, per --loader. */
function benchWrapper(tree) {
  if (loaderMode === "none") return undefined;
  if (loaderMode === "auto") return withTypesugar(tree.dir);
  const w = withTypesugar(A.dir) ?? withTypesugar(B.dir);
  if (!w)
    throw new Error(
      "--loader both: neither tree has case-study/with-typesugar.sh"
    );
  return w;
}

const LINE =
  /^(.*?) x ([\d,]+(?:\.\d+)?) ops\/sec ±([\d.]+)% \((\d+) runs? sampled\)/;

/** Run one package's bench once in one tree; returns { name: opsPerSec }. */
function benchOnce(tree, pkg) {
  const wrap = benchWrapper(tree);
  const cwd = path.join(tree.dir, "packages", pkg);
  const [c, a] = wrap
    ? [wrap, ["pnpm", "run", "bench"]]
    : ["pnpm", ["run", "bench"]];
  const t0 = Date.now();
  const r = spawnSync(c, a, {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) {
    throw new Error(
      `bench failed: ${pkg} in ${tree.label}\n${r.stdout}\n${r.stderr}`
    );
  }
  const results = {};
  for (const line of r.stdout.split("\n")) {
    const m = LINE.exec(line.trim());
    if (m)
      results[m[1].trim()] = {
        hz: Number(m[2].replace(/,/g, "")),
        rme: Number(m[3]),
      };
  }
  return { results, seconds: (Date.now() - t0) / 1000 };
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const quantile = (xs, q) => {
  const s = [...xs].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
};

function stats(xs) {
  const med = median(xs);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  const q1 = quantile(xs, 0.25);
  const q3 = quantile(xs, 0.75);
  return {
    n: xs.length,
    median: med,
    min,
    max,
    q1,
    q3,
    rangePct: med ? ((max - min) / med) * 100 : 0,
    iqrPct: med ? ((q3 - q1) / med) * 100 : 0,
    samples: xs,
  };
}

const machine = () => ({
  cpu: os.cpus()[0]?.model ?? "unknown",
  cores: os.cpus().length,
  memoryGB: Math.round(os.totalmem() / 2 ** 30),
  platform: `${os.platform()} ${os.release()} ${os.arch()}`,
  node: process.version,
});

// ---------------------------------------------------------------------------

const loadStart = os.loadavg();
const started = new Date().toISOString();
const A = prepare("A", opt("--a"), opt("--a-dir"));
const B = prepare("B", opt("--b"), opt("--b-dir"));

const raw = {}; // pkg -> bench name -> { A: [], B: [] }
const durations = {};
for (const pkg of packages) {
  raw[pkg] = {};
  durations[pkg] = { A: [], B: [] };
  for (let round = 1; round <= rounds; round++) {
    for (const tree of [A, B]) {
      console.error(`[bench] ${pkg} round ${round}/${rounds} ${tree.label}`);
      const { results, seconds } = benchOnce(tree, pkg);
      durations[pkg][tree.label].push(seconds);
      for (const [name, { hz }] of Object.entries(results)) {
        raw[pkg][name] ??= { A: [], B: [] };
        raw[pkg][name][tree.label].push(hz);
      }
    }
  }
}
const loadEnd = os.loadavg();

const summary = [];
for (const pkg of packages) {
  for (const [name, sides] of Object.entries(raw[pkg])) {
    if (!sides.A.length || !sides.B.length) continue;
    const a = stats(sides.A);
    const b = stats(sides.B);
    const deltaPct = ((b.median - a.median) / a.median) * 100;
    const spreadPct = Math.max(a.rangePct, b.rangePct);
    summary.push({
      package: pkg,
      benchmark: name,
      A: a,
      B: b,
      deltaPct,
      spreadPct,
      // One round has no spread, so it cannot tell signal from noise.
      noise: rounds < 2 ? null : spreadPct > Math.abs(deltaPct),
    });
  }
}

const report = {
  started,
  finished: new Date().toISOString(),
  machine: machine(),
  loadAverage: { start: loadStart, end: loadEnd },
  rounds,
  order: "A,B per round, one process at a time",
  loader: loaderMode,
  A: { ref: A.ref, sha: A.sha, typesugarLoader: Boolean(benchWrapper(A)) },
  B: { ref: B.ref, sha: B.sha, typesugarLoader: Boolean(benchWrapper(B)) },
  durationsSeconds: durations,
  results: summary,
};

const f0 = (x) => Math.round(x).toLocaleString("en-US");
const f1 = (x) => x.toFixed(1);
const la = (l) => l.map((x) => x.toFixed(2)).join(" ");
const md = [
  `# Bench A/B: ${A.ref ?? A.dir} vs ${B.ref ?? B.dir}`,
  "",
  `- A: \`${A.sha.slice(0, 12)}\`${report.A.typesugarLoader ? " (typesugar loader)" : ""}; B: \`${B.sha.slice(0, 12)}\`${report.B.typesugarLoader ? " (typesugar loader)" : ""}`,
  `- Machine: ${report.machine.cpu}, ${report.machine.cores} cores, ${report.machine.memoryGB} GB, ${report.machine.platform}; Node ${report.machine.node}`,
  `- Date: ${started} to ${report.finished}`,
  `- Load average (1/5/15 min): start ${la(loadStart)}, end ${la(loadEnd)}`,
  `- ${rounds} rounds, interleaved A/B, one process at a time. Spread is the larger side's (max-min)/median.`,
  "",
  "| Package | Benchmark | A median ops/s | B median ops/s | Δ % | Spread % (A / B) | IQR % (A / B) | |",
  "| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |",
  ...summary.map(
    (r) =>
      `| ${r.package} | ${r.benchmark.replace(/\|/g, "\\|")} | ${f0(r.A.median)} | ${f0(r.B.median)} | ${r.deltaPct >= 0 ? "+" : ""}${f1(r.deltaPct)} | ${f1(r.A.rangePct)} / ${f1(r.B.rangePct)} | ${f1(r.A.iqrPct)} / ${f1(r.B.iqrPct)} | ${r.noise ? "noise: spread > Δ" : ""} |`
  ),
  "",
  rounds < 2
    ? "One round: no spread, so no delta here can be told apart from noise."
    : `${summary.filter((r) => r.noise).length} of ${summary.length} deltas are smaller than their spread.`,
  "",
].join("\n");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "summary.json"),
  JSON.stringify(report, null, 2) + "\n"
);
fs.writeFileSync(path.join(outDir, "summary.md"), md);
process.stdout.write(md);
for (const r of summary.filter((r) => r.noise)) {
  console.error(
    `[bench] warning: ${r.package} "${r.benchmark}": spread ${f1(r.spreadPct)}% exceeds delta ${f1(r.deltaPct)}%`
  );
}
console.error(`[bench] wrote ${outDir}/summary.{json,md}`);
