// Stage 1 micro-benchmark (CASE-STUDY.md): validateId as Turf ships it
// (indexOf over an array literal), as typesugar emits it (is<Id>(id): an
// immediately-invoked arrow) and as a person would inline it by hand. Turf
// has no bench for validateId, so this is a separate, single-process check.
//
//   node case-study/experiments/stage-1-validateid-bench.mjs \
//     <stage-0 turf-helpers dist/esm/index.js> <stage-1 turf-helpers dist/esm/index.js> [rounds]
import { createRequire } from "node:module";
const require = createRequire(
  new URL("../../packages/turf-helpers/package.json", import.meta.url)
);
const Benchmark = require("benchmark");

const [a, b, rounds = "5"] = process.argv.slice(2);
const shipped = (await import(a)).validateId;
const typesugar = (await import(b)).validateId;
function byHand(id) {
  if (!id) throw new Error("id is required");
  if (typeof id !== "string" && typeof id !== "number") {
    throw new Error("id must be a number or a string");
  }
}
const inputs = ["feature-1", 42, "x", 7.5];
const variants = {
  "v7.4.0 (indexOf)": shipped,
  "typesugar is<Id>()": typesugar,
  "by hand": byHand,
};
const results = Object.fromEntries(Object.keys(variants).map((k) => [k, []]));

for (let r = 0; r < Number(rounds); r++) {
  for (const [name, fn] of Object.entries(variants)) {
    const bench = new Benchmark(name, () => {
      for (let i = 0; i < inputs.length; i++) fn(inputs[i]);
    });
    bench.run();
    results[name].push(bench.hz);
  }
}
const median = (xs) => [...xs].sort((p, q) => p - q)[Math.floor(xs.length / 2)];
const base = median(results["v7.4.0 (indexOf)"]);
for (const [name, xs] of Object.entries(results)) {
  const m = median(xs);
  const lo = Math.min(...xs),
    hi = Math.max(...xs);
  console.log(
    `${name.padEnd(20)} median ${Math.round(m).toLocaleString()} ops/s ` +
      `(min-max ${(((hi - lo) / m) * 100).toFixed(1)}%), ${(((m - base) / base) * 100).toFixed(1)}% vs v7.4.0`
  );
}
