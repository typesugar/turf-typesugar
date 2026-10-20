#!/usr/bin/env node
// Bundle sizes for the case study: raw, gzip and brotli bytes of
// packages/turf/turf.min.js and every packages/*/dist/esm/index.js.
//
//   node case-study/size.mjs [--root <turf checkout>] [--json out.json] [--md out.md]
//   node case-study/size.mjs --compare a.json b.json [--md out.md]
//
// Run it after `lerna run build`. gzip is level 9 and brotli quality 11, so
// the numbers are stable across machines for the same bytes.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

function sizes(file) {
  const buf = fs.readFileSync(file);
  return {
    raw: buf.length,
    gzip: zlib.gzipSync(buf, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(buf, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
      },
    }).length,
  };
}

function measure(root) {
  const files = {};
  const min = path.join(root, "packages/turf/turf.min.js");
  if (fs.existsSync(min)) files["turf/turf.min.js"] = sizes(min);
  const pkgs = fs.readdirSync(path.join(root, "packages")).sort();
  for (const p of pkgs) {
    const f = path.join(root, "packages", p, "dist/esm/index.js");
    if (fs.existsSync(f)) files[`${p}/dist/esm/index.js`] = sizes(f);
  }
  const total = { raw: 0, gzip: 0, brotli: 0 };
  for (const [k, v] of Object.entries(files)) {
    if (k === "turf/turf.min.js") continue;
    for (const m of Object.keys(total)) total[m] += v[m];
  }
  return {
    root: path.resolve(root),
    date: new Date().toISOString(),
    files,
    esmTotal: total,
  };
}

const fmtDelta = (a, b) =>
  a === b
    ? "0"
    : `${b - a > 0 ? "+" : ""}${b - a} (${(((b - a) / a) * 100).toFixed(2)}%)`;

function markdown(a, b) {
  const lines = [];
  if (!b) {
    lines.push(
      "| File | Raw | gzip | brotli |",
      "| --- | ---: | ---: | ---: |"
    );
    const row = (k, v) =>
      lines.push(`| ${k} | ${v.raw} | ${v.gzip} | ${v.brotli} |`);
    if (a.files["turf/turf.min.js"])
      row("turf/turf.min.js", a.files["turf/turf.min.js"]);
    row("**all dist/esm/index.js**", a.esmTotal);
    return lines.join("\n") + "\n";
  }
  lines.push(
    "| File | Raw A | Raw B | Δ raw | gzip Δ | brotli Δ |",
    "| --- | ---: | ---: | ---: | ---: | ---: |"
  );
  const row = (k, x, y) =>
    lines.push(
      `| ${k} | ${x.raw} | ${y.raw} | ${fmtDelta(x.raw, y.raw)} | ${fmtDelta(x.gzip, y.gzip)} | ${fmtDelta(x.brotli, y.brotli)} |`
    );
  const keys = Object.keys({ ...a.files, ...b.files });
  const min = "turf/turf.min.js";
  if (a.files[min] && b.files[min]) row(min, a.files[min], b.files[min]);
  row("**all dist/esm/index.js**", a.esmTotal, b.esmTotal);
  const changed = keys.filter(
    (k) =>
      k !== min && a.files[k] && b.files[k] && a.files[k].raw !== b.files[k].raw
  );
  for (const k of changed) row(k, a.files[k], b.files[k]);
  const only = keys.filter((k) => !a.files[k] || !b.files[k]);
  if (only.length) lines.push("", `Only on one side: ${only.join(", ")}`);
  lines.push("", `${changed.length} per-package file(s) changed size.`);
  return lines.join("\n") + "\n";
}

let out;
let md;
if (args[0] === "--compare") {
  const a = JSON.parse(fs.readFileSync(args[1], "utf8"));
  const b = JSON.parse(fs.readFileSync(args[2], "utf8"));
  md = markdown(a, b);
} else {
  out = measure(opt("--root") ?? process.cwd());
  md = markdown(out);
  if (opt("--json"))
    fs.writeFileSync(opt("--json"), JSON.stringify(out, null, 2) + "\n");
}
if (opt("--md")) fs.writeFileSync(opt("--md"), md);
process.stdout.write(md);
