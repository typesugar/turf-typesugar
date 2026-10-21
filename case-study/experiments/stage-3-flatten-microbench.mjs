// Stage 3 micro-benchmark (CASE-STUDY.md): flattenEach over multi-geometries,
// the only inputs that reach the line Stage 3 changed (the multi→single type
// mapping). turf-meta's own bench.ts never gets there: its fixtures are
// Points and Polygons. Builds of turf-meta's dist/esm/index.js, by label:
//
//   node case-study/experiments/stage-3-flatten-microbench.mjs [--rounds 5] \
//     "v7.4.0 switch=<stage-1 index.js>" \
//     "match() 0411491c (IIFE)=<index.js built with typesugar 0411491c>" \
//     "match() be4286d3 (chain)=<stage-3 index.js>" \
//     "v7.4.0 switch, again=<stage-1 index.js>"
//
// Every measurement runs in a fresh process, one at a time, interleaved
// A, B, C, ... per round (the order rotates each round). Measuring several
// builds in ONE process is not valid here: the same file measured second or
// third in a process ran 50-90% faster than when measured first. Pass the
// first build twice, as above, to see the noise floor. Each file must
// resolve @turf/helpers (and the 0411491c one @typesugar/std), so put the
// copies under packages/turf-meta/.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const args = process.argv.slice(2);

if (args[0] === "--child") {
  await child(args[1]);
} else {
  driver();
}

function fixtures() {
  const ring = (x, y) => [
    [x, y],
    [x + 1, y],
    [x + 1, y + 1],
    [x, y + 1],
    [x, y],
  ];
  const line = (y) => Array.from({ length: 10 }, (_, i) => [i, y]);
  const feature = (geometry) => ({ type: "Feature", properties: {}, geometry });
  return {
    MultiPoint: feature({ type: "MultiPoint", coordinates: line(0) }),
    MultiLineString: feature({
      type: "MultiLineString",
      coordinates: [line(0), line(1), line(2)],
    }),
    MultiPolygon: feature({
      type: "MultiPolygon",
      coordinates: [[ring(0, 0)], [ring(5, 5), ring(5.2, 5.2)]],
    }),
    "FeatureCollection of 100 multi-geometries": {
      type: "FeatureCollection",
      features: Array.from({ length: 100 }, (_, i) =>
        feature(
          i % 3 === 0
            ? { type: "MultiPoint", coordinates: line(i) }
            : i % 3 === 1
              ? { type: "MultiLineString", coordinates: [line(i), line(i + 1)] }
              : { type: "MultiPolygon", coordinates: [[ring(i, i)]] }
        )
      ),
    },
  };
}

/** One build, all fixtures: prints {fixture: ops/s} and the callback trace. */
async function child(file) {
  const require = createRequire(
    new URL("../../packages/turf-meta/package.json", import.meta.url)
  );
  const Benchmark = require("benchmark");
  const { flattenEach } = await import(pathToFileURL(file).href);
  const fx = fixtures();
  const trace = [];
  for (const geojson of Object.values(fx)) {
    flattenEach(geojson, (f, i, j) => trace.push([f.geometry.type, i, j]));
  }
  let sink = 0;
  const cb = (f, i, j) => {
    sink += j;
  };
  const hz = {};
  for (const [name, geojson] of Object.entries(fx)) {
    const bench = new Benchmark(name, () => flattenEach(geojson, cb));
    bench.run();
    hz[name] = bench.hz;
  }
  process.stdout.write(
    JSON.stringify({ hz, trace: JSON.stringify(trace), sink: sink > 0 })
  );
}

function driver() {
  let rounds = 5;
  const variants = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--rounds") rounds = Number(args[++i]);
    else {
      const at = args[i].lastIndexOf("=");
      variants.push({
        label: args[i].slice(0, at),
        file: args[i].slice(at + 1),
      });
    }
  }
  if (variants.length < 2) {
    console.error("usage: see the header of this file");
    process.exit(1);
  }
  const self = fileURLToPath(import.meta.url);
  const samples = variants.map(() => ({}));
  const traces = new Set();
  for (let r = 0; r < rounds; r++) {
    for (let k = 0; k < variants.length; k++) {
      const v = (r + k) % variants.length;
      const res = spawnSync(
        process.execPath,
        [self, "--child", variants[v].file],
        { encoding: "utf8" }
      );
      if (res.status !== 0)
        throw new Error(`${variants[v].label}: ${res.stderr}`);
      const out = JSON.parse(res.stdout);
      traces.add(out.trace);
      for (const [name, hz] of Object.entries(out.hz)) {
        (samples[v][name] ??= []).push(hz);
      }
    }
  }
  if (traces.size !== 1)
    throw new Error("builds disagree on the callback arguments");

  const median = (xs) => {
    const s = [...xs].sort((p, q) => p - q);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  console.log(
    `node ${process.version}, ${rounds} rounds, one process per measurement, ` +
      `all builds passed the same callback arguments`
  );
  for (const name of Object.keys(samples[0])) {
    console.log(`\n${name}`);
    const base = median(samples[0][name]);
    variants.forEach((v, i) => {
      const xs = samples[i][name];
      const m = median(xs);
      const spread = ((Math.max(...xs) - Math.min(...xs)) / m) * 100;
      console.log(
        `  ${v.label.padEnd(28)} median ${Math.round(m).toLocaleString().padStart(12)} ops/s ` +
          `(min-max ${spread.toFixed(1)}%), ${(((m - base) / base) * 100).toFixed(1)}% vs ${variants[0].label}`
      );
    });
  }
}
