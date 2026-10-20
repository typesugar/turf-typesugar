#!/usr/bin/env node
// Does any typesugar reference survive in what Turf publishes?
//
//   node case-study/leaks.mjs [--json out.json]
//
// Scans every packages/*/dist file and packages/turf/turf.min.js for the
// module specifiers `typesugar` and `@typesugar/<pkg>`:
//   - JS (.js, .cjs, .mjs) and declarations (.d.ts, .d.cts): any mention is a
//     leak. An import or require of one would make the package's consumers
//     need it at runtime (JS) or for type-checking (.d.ts), so the package
//     would have to list it under "dependencies".
//   - Source maps (.map): reported separately. Their sourcesContent embeds
//     the original TypeScript, so a macro import in the source shows up
//     there; nothing resolves it, but it is in the published tarball.
// Exits 1 when a JS or declaration file mentions one.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const jsonOut = args.includes("--json")
  ? args[args.indexOf("--json") + 1]
  : undefined;

// A quoted module specifier: "typesugar", 'typesugar/register', "@typesugar/validate", ...
// (quotes may be backslash-escaped, as in a source map's sourcesContent).
const SPEC =
  /\\?["'`](@typesugar\/[a-z0-9-]+|typesugar)(\/[^"'`\\]*)?\\?["'`]/g;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const files = [];
const pkgs = path.join(repo, "packages");
for (const name of fs.readdirSync(pkgs)) {
  const dist = path.join(pkgs, name, "dist");
  if (fs.existsSync(dist)) files.push(...walk(dist));
}
const min = path.join(pkgs, "turf", "turf.min.js");
if (fs.existsSync(min)) files.push(min);

const kind = (f) =>
  f.endsWith(".map")
    ? "map"
    : /\.d\.c?ts$/.test(f)
      ? "dts"
      : /\.(c|m)?js$/.test(f)
        ? "js"
        : "other";

const hits = { js: [], dts: [], map: [], other: [] };
const counts = { js: 0, dts: 0, map: 0, other: 0 };
for (const f of files) {
  const k = kind(f);
  counts[k]++;
  const text = fs.readFileSync(f, "utf8");
  const found = [...text.matchAll(SPEC)].map((m) => m[1] + (m[2] ?? ""));
  if (found.length > 0) {
    hits[k].push({
      file: path.relative(repo, f),
      specifiers: [...new Set(found)],
    });
  }
}

const out = { scanned: counts, hits };
for (const k of ["js", "dts", "other", "map"]) {
  process.stdout.write(
    `${k.padEnd(5)} ${String(counts[k]).padStart(5)} files scanned, ${hits[k].length} mention typesugar\n`
  );
  for (const h of hits[k])
    process.stdout.write(`  ${h.file}: ${h.specifiers.join(", ")}\n`);
}
if (jsonOut)
  fs.writeFileSync(path.resolve(jsonOut), JSON.stringify(out, null, 2) + "\n");
process.exit(hits.js.length + hits.dts.length > 0 ? 1 : 0);
