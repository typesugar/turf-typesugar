// Stage 3 (CASE-STUDY.md): what turf-meta does with GeometryCollections
// nested one, two and three deep. geomEach unwraps one level itself and one
// more in its GeometryCollection arm, so a collection nested three deep is
// handed to the callback as a GeometryCollection. flattenEach's multi-type
// mapping had no case for it (the gap match()'s exhaustiveness check
// reported), so flattenEach, segmentEach and lineEach throw a TypeError.
// Same output at v7.4.0, Stage 1 and Stage 3.
//
//   node case-study/experiments/stage-3-nested-geometry-collection.mjs \
//     <absolute path to packages/turf-meta/dist/esm/index.js>
const meta = await import(process.argv[2]);
const pt = { type: "Point", coordinates: [1, 2] };
const line = {
  type: "LineString",
  coordinates: [
    [0, 0],
    [1, 1],
  ],
};
const gc1 = { type: "GeometryCollection", geometries: [pt, line] };
const gc2 = { type: "GeometryCollection", geometries: [gc1] };
const gc3 = { type: "GeometryCollection", geometries: [gc2] };
for (const [name, g] of [
  ["GC", gc1],
  ["GC(GC)", gc2],
  ["GC(GC(GC))", gc3],
]) {
  for (const fn of [
    "flattenEach",
    "segmentEach",
    "lineEach",
    "coordEach",
    "geomEach",
  ]) {
    let n = 0,
      err = null;
    try {
      meta[fn](g, () => {
        n++;
      });
    } catch (e) {
      err = e.message;
    }
    console.log(
      `${name.padEnd(11)} ${fn.padEnd(12)} calls=${n}${err ? "  THROWS: " + err : ""}`
    );
  }
}
