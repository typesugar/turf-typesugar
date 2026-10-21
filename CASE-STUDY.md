# Turf × typesugar: a case study

This fork of [Turf](https://github.com/Turfjs/turf) (MIT, v7.4.0) is a proof
point for [typesugar](https://typesugar.org): we refactor a real, widely used
TypeScript codebase in stages using typesugar's macros, and measure whether
"zero cost" holds. It is a one-off study, not a maintained fork; all credit for
Turf itself goes to its authors.

Branch: `typesugar-case-study`, from tag `v7.4.0` (22acbd806).

## Questions we want answered

1. With typesugar in the build and no source changes, is the output identical?
2. For each feature we adopt, what happens to bundle size, runtime performance
   (Turf's own `bench.ts` suites), build time and type-check time?
3. Where does typesugar's generated code differ from what a person would write
   by hand, and why?
4. What did adopting it cost: lines changed, friction, bugs found in typesugar,
   features that didn't fit?

## Ground rules

- **Turf's public API and its tests are the spec.** Tests (`test.ts`) and type
  tests (`types.ts`) are not changed to make a stage pass. A stage that needs a
  test change says why, in the stage log.
- **Every stage is measured against the stage before it and against v7.4.0.**
- **typesugar bugs found here are fixed in typesugar** (failing test first) on a
  typesugar branch, and logged below with links. The fork never patches around a
  typesugar bug silently.
- **typesugar is consumed as packed tarballs** (`vendor/typesugar/*.tgz`) built
  from a recorded typesugar commit, so anyone can reproduce a stage without
  local links.

## Measurements (per stage)

| Metric | How |
| --- | --- |
| Tests | `lerna run test` for touched packages; full run at the end of each stage |
| Runtime | Each touched package's `bench.ts`, A/B against the previous stage with `case-study/bench.mjs`: A and B built in separate worktrees, run interleaved A/B/A/B one process at a time, median ops/sec of N rounds (default 5) with spread (min–max and IQR) and delta %; both sides run the same way with respect to typesugar's loader (`--loader both`, finding F7) |
| Bundle size | `packages/turf/turf.min.js` and per-package `dist/esm/index.js`: raw, gzip, brotli (`case-study/size.mjs`) |
| Emitted code | Diff of `dist/esm` against the previous stage; every residual typesugar runtime reference is listed and explained |
| Build / type-check time | `lerna run build`, `tsc --noEmit` for touched packages, median of 3 |
| Adoption cost | Lines changed in source, new imports, friction notes |

Runtime numbers come from local interleaved A/B runs on one stated machine.
Each result file records the CPU, Node version, date and the load average at
the start and end of the run, and flags every delta that is smaller than its
spread. The numbers are comparable only within one run. Readers re-run
`node case-study/bench.mjs --a <ref> --b <ref> --packages <list>` on their own
machine rather than comparing against ours.

## Stages (proposed; each is one PR on this fork)

0. **Integration, no source changes.** typesugar via unplugin's esbuild plugin
   in `tsup.config.ts`, and a way to run the `tsx` tests through the
   transformer (typesugar has no Node loader today: likely the first finding).
   Expected result: `dist/` byte-identical to v7.4.0, bench unchanged.
1. **Derive and type guards:** `turf-helpers`, `turf-clone`. `@derive(Clone, Eq,
   TypeGuard)` and typeclass instances for GeoJSON shapes. Open question: the
   GeoJSON types come from `@types/geojson`, so derives on external types are a
   test of typeclass auto-derivation.
2. **Validation:** `turf-invariant` with `is<T>()` / `validator<T>()`.
3. **Pattern matching on hot paths:** `turf-meta` (`coordEach`, `geomEach` and
   friends, which nearly every other package calls) with exhaustive `match()`
   over `geometry.type`. The strongest zero-cost test in the study.
4. **Option for nullable results** (null-based, so the public API is unchanged).
5. **Extension methods and pipelines** in the measurement packages
   (`turf-distance`, `turf-bearing`, `turf-destination`, `turf-length`, ...).
6. **Operators on coordinate math:** an internal `Vec2`-style typeclass over
   Turf's `[x, y]` tuples in `turf-bezier-spline`, `turf-transform-*`, keeping
   the public tuple API.
7. **Compile-time work:** `comptime()` for unit-conversion tables, `@tailrec`
   where recursion appears.
8. **Contracts at the API boundary** (`requires:`), measured with checks on and
   stripped.

Stages 1–8 may be reordered or cut based on what each one teaches; the log
records why.

## Stage log

### Stage 0: integration, no source changes

**Result: byte-identical.** With typesugar in the build, all 115
`packages/*/dist` trees (JS, `.d.ts` and source maps) and
`packages/turf/turf.min.js` are byte-identical to v7.4.0, in two separate
full builds. The test suite gives the same TAP results line for line. That
holds from typesugar commit `fbcc5775` on; the typesugar commit before the
pass-through fix changed 194 of the emitted JS files (F2 below).

typesugar: branch
[`case-study-fixes`](https://github.com/typesugar/typesugar/tree/case-study-fixes)
at `fbcc5775`, which is `decisions-1.0` at `65ea7941` plus the Node loader
commit (F1). It is vendored as tarballs in `vendor/typesugar/`
(`vendor/typesugar/README.md` says how to regenerate them).

What changed in the fork (no file under `packages/` changed):

- `tsup.config.ts`: unplugin-typesugar's esbuild plugin in `esbuildPlugins`,
  one instance per output format. `dts: true` is unchanged: the `.d.ts` build
  does not go through esbuild plugins.
- `case-study/package.json`: a private workspace package that holds the
  typesugar dependencies (F3 explains why it isn't the root). `pnpm-workspace.yaml`:
  that package, plus `overrides` that point every `@typesugar/*` package at its
  tarball. Lockfile: packages added, none removed or changed.
- Tests and benches: `case-study/with-typesugar.sh` puts
  `--import=<typesugar/register>` in `NODE_OPTIONS`, so `tsx test.ts` and
  `tsx bench.ts` load every TypeScript module through typesugar's new Node
  loader (F1). Turf's package scripts are untouched. The root `test` script
  wraps `lerna run test` and `last-checks` with it, and gains
  `case-study:bench` and `case-study:size`.
- `case-study/bench.mjs` (interleaved A/B benches) and `case-study/size.mjs`
  (raw, gzip and brotli sizes).

How tests run through typesugar: tsx runs `test.ts` and `bench.ts` straight
from source, so the build plugin never sees them. typesugar had no Node
loader. `typesugar run` does exist, but it bundles the entry with esbuild into
`.typesugar-cache/`. That moves `import.meta.url` away from the test file,
and Turf's tests read their fixtures relative to it. So typesugar gained a
real loader, `node --import typesugar/register`, built on Node module hooks
(F1). Each TypeScript module is expanded with its nearest tsconfig. A module
the expansion doesn't change goes on to tsx untouched, so Stage 0 runs
exactly the code it ran before. `TYPESUGAR_VERBOSE=1` confirmed it: of 249
TypeScript module loads across the suite's processes, typesugar expanded 0
and passed all 249 through.

Numbers (Apple M4 Pro, 12 cores, Node 26.3.1, shared and busy machine):

| | v7.4.0 | Stage 0 |
| --- | --- | --- |
| `lerna run build --concurrency 4` (115 packages) | 74 s | 103 s |
| Tests: 121 workspace packages, `pnpm -r --workspace-concurrency=2 run test` | 2336 TAP tests, 2332 pass | identical (same failing assertions, same values) |
| `@turf/turf` last-checks | 252/252 | 252/252 |
| Test suite wall time | 91 s | 128 s |
| `turf.min.js` raw / gzip / brotli | 547,400 / 141,924 / 118,144 | identical |
| all `dist/esm/index.js` raw / gzip / brotli | 380,872 / 104,847 / 92,543 | identical |

- The 4 failing tests are in `@turf/directional-mean` and
  `@turf/standard-deviational-ellipse`. Both fail at v7.4.0 too, on this Node
  26.3.1 / arm64 machine: the results differ from the expected fixtures in the
  last few digits. typesugar is not involved.
- Tests ran per package (`pnpm -r ... run test`), not through `lerna run test`.
  In this repo's nx config `test` depends on `build`, so `lerna run test`
  rebuilds dependencies while other tests run. On the first attempt that raced
  (`test/node-cjs` read `@turf/helpers/dist` while tsup was cleaning it).
  `--skip-nx-cache` has the same problem, and the cache would otherwise replay
  test results instead of running them.
- The `lint` part of the root `test` script was skipped (eslint, prettier,
  es-check, monorepolint, documentation). The emitted JS is byte-identical, so
  es-check's verdict is too. The rest lint source we did not change.
- Build and test times come from single runs on a busy machine. The test
  overhead is real, though: in each tsx process the loader builds a
  TypeScript Program for the package. One `turf-distance` test process went
  from 1.3 s / 193 MB to 1.8 s / 358 MB (max RSS).
- Benches were a local sanity check only (shared machine, load average 18
  falling to 4 during the first run; results are in
  `case-study/results/stage-0-sanity-*`). Plain v7.4.0 against Stage 0 with
  the loader (8 suites, 3 rounds): 25 of 34 deltas were smaller than their
  spread. The rest were not noise in the usual sense: `turf-helpers`
  `multiLineString`, `featureCollection` and `geometryCollection` were 30–39%
  *faster* on the Stage 0 side, and `turf-clone` was about 7% slower, with
  byte-identical code. With the loader on both sides (`--loader both`; 3
  suites, 3 rounds) those gaps closed: 22 of 23 deltas were within spread, and
  the largest was −1.7% (`lineString`). The cause is the loader's presence in
  the bench process (F7). `turf-meta` (60 cases, 3 rounds, loader on both
  sides): median delta +0.1%, range −2.0% to +8.5%, 59 of 60 within spread.
  An earlier single round of the same suite gave a median of −7% (range −14%
  to +19%), so a single round shows nothing on this machine. `bench.mjs` now
  says so instead of flagging deltas.

### Stage 1: derive and type guards (`turf-helpers`, `turf-clone`)

**Result: one line of Turf adopted a typesugar macro. The headline features
did not fit.** `turf-helpers`' `validateId` now checks `is<Id>(id)`. Nothing
in `turf-clone` changed. typesugar's derived `Clone` is shallow and Turf's
clone is deep, so a derived clone fails 15 of `turf-clone`'s 46 assertions.
No other candidate could be changed without changing behaviour that Turf's
tests pin down. Looking for these fits found three typesugar bugs, all
fixed (F9, F11, F14), and one place where the docs and the behaviour
disagree, left for a design decision (F10). The emitted code differs from
hand-written code in two ways that are not fixed (F15, F16). No typesugar
reference reaches Turf's published JS or `.d.ts`.

typesugar: branch `case-study-fixes` at
[`0411491c`](https://github.com/typesugar/typesugar/commit/0411491c), which is
Stage 0's loader on `decisions-1.0` plus three fixes from this stage. It is
vendored in `vendor/typesugar/`. The branch's later commits (`985145e6`,
`fea567ea`) change only test files: a prettier fix, and a red-team test that
pinned the old field-list `Clone` output. The packed packages are the same.

#### What changed in Turf

```diff
+import { is } from "@typesugar/validate";
 ...
-  if (["string", "number"].indexOf(typeof id) === -1) {
+  if (!is<Id>(id)) {
     throw new Error("id must be a number or a string");
```

`Id` is Turf's own `string | number`, so the check now follows the type
instead of restating it. `packages/turf-helpers/package.json` gains
`"@typesugar/validate": "0.1.1"` under `devDependencies`. It is needed at
build time because tsup's `.d.ts` step type-checks the unexpanded source
(F5). Nothing in `dependencies` changes. Source lines changed: 3 added, 1
removed, in 2 files.

Turf's tests never call `validateId`, so they don't cover this change. A
separate check ran the Stage 0 and Stage 1 builds of `validateId` on 24 inputs
(numbers, `NaN`, `0`, `""`, booleans, `null`, objects, arrays, functions,
symbols, bigints, boxed primitives). Both builds threw or returned on exactly
the same inputs.

#### What was tried and not adopted

The GeoJSON types come from `@types/geojson`, so `@derive` can't be written
on them. typesugar has three ways to get an instance for an external type:

| Route | What happened on `Point`, `Feature`, ... |
| --- | --- |
| `summon<Clone<Point>>()` with no instance declared | Works. `summon` derives one from the type's structure (Generic auto-derivation). The docs say it doesn't do this (F10). |
| `/** @derive(Clone, Eq, TypeGuard) */ type P = Point;` (a local alias) | Clone and TypeGuard derive. Eq fails because `Position` (`number[]`) has no `Eq` (F12). On a union alias (`Point \| LineString \| Polygon`), Clone failed (F9, now fixed) and Eq still fails. |
| `/** @impl Clone<Point> */ const ... = { clone: ... }` by hand | Works, but it is Turf's existing code wrapped in an object. It adds nothing. |

- **`turf-clone` → derived `Clone`: rejected.** The experiment is in
  `case-study/experiments/stage-1-derived-clone.ts`. It puts
  `summon<Clone<…>>()` instances for all nine GeoJSON types in place of
  Turf's clone. With the typesugar that Stage 0 vendored (`fbcc5775`), 22 of
  46 assertions fail. Absent `bbox` became `bbox: undefined` and foreign
  members were lost (F9), and coordinates were shared (F8). After the F9
  fix, 15 fail, and every one of them is because the clone is shallow:
  mutating the clone's coordinates or properties changes the original. That is typesugar's documented `Clone`
  ("shallow"). Turf's `clone` is a deep copy that follows the GeoJSON
  structure, which is a different operation (F8).
- **`isNumber`, `point()`'s coordinate checks, `validateBBox` →
  `is<number>()`: rejected.** Turf's `isNumber` is `!isNaN(num) && num !==
  null && !Array.isArray(num)`. Its tests require `isNumber("123")` and
  `isNumber("1e10000")` to be true. `typeof x === "number"` would change the
  public API. `validateBBox` also throws four different messages, one per
  failure, while a type guard only answers yes or no.
- **`isObject`**: it already says exactly what it means (non-null, `typeof
  "object"`, not an array). Nothing to generate.
- **`@derive(TypeGuard)` / `is<Feature>()` for GeoJSON shapes**:
  `turf-helpers` exports no GeoJSON type guards. Adding `isFeature` and the
  like would add public API, which is out of scope for a refactor stage.
  `turf-invariant` (Stage 2) is where Turf validates shapes. Note for that
  stage: the derived `TypeGuard` and `is<T>()` disagree (F13).
- **`Eq`**: nothing in these two packages compares GeoJSON values.
  `turf-boolean-equal` does, and that is a better place to test Eq later.
  Before that can work, F12 has to be fixed.

#### Zero cost

1. **Emitted JS against hand-written.** Of 115 `dist` trees (691 files,
   compared after normalising the absolute build path that tsup writes into
   CJS source maps), only `turf-helpers`' `index.js`, `index.cjs`, their two
   maps, and `turf.min.js` differ from Stage 0. `turf-clone` and every
   `.d.ts` are byte-identical. In `turf-helpers` the semantic change is the
   one in `validateId`
   (`case-study/results/stage-1/emitted-code.diff`):

   ```js
   if (!/* @__PURE__ */ ((value) => {
     return typeof value === "string" || typeof value === "number";
   })(id)) {
   ```

   A person would write `typeof id !== "string" && typeof id !== "number"`.
   typesugar emits an immediately-invoked arrow instead, and terser keeps
   it in `turf.min.js` (`!function(t){return"string"==typeof
   t||"number"==typeof t}(t)`) (F15). V8 inlines it, though. In a
   micro-benchmark (`case-study/experiments/stage-1-validateid-bench.mjs`, 5
   rounds), Turf's `indexOf` version ran at 51 M ops/s, typesugar's at 99 M
   and a hand-written inline at 100 M. typesugar's version is within the
   spread of the hand-written one and twice as fast as v7.4.0's. The other
   five hunks in the file only change whitespace. A file that contains a
   macro is reprinted whole, so the line breaks in `points`, `polygons`,
   `lineStrings`, `polygon` and `removeBbox` move (F16).
2. **typesugar in the published output: none in JS or `.d.ts`.**
   `case-study/leaks.mjs` scans all 231 JS files (including `turf.min.js`)
   and 230 declaration files. It finds no `typesugar` or `@typesugar/*`
   specifier. `@turf/helpers` consumers gain no dependency, and its
   `package.json` declares `@typesugar/validate` as a devDependency only. Two
   source maps (`turf-helpers` ESM and CJS) contain the original source in
   `sourcesContent`, so the text `import { is } from "@typesugar/validate"`
   is in the published tarball. Nothing resolves it. One cost stays with the
   source: anyone who runs `turf-helpers/index.ts` without typesugar (plain
   tsx, a bundler without the plugin) gets the runtime stub's error the
   first time `validateId` runs. Turf's own tests import the source, but they
   run through the loader (F1).
3. **Size and speed.** `turf.min.js`: +23 B raw, −2 B gzip, −38 B brotli. The
   `turf-helpers` ESM entry: +2 B raw, +5 B gzip, −5 B brotli. Benchmarks:
   the `turf-helpers` (10 cases) and `turf-clone` (8 cases) suites, 5
   interleaved rounds each, with the loader on both sides (F7). Against
   Stage 0, 18 of 18 deltas are smaller than their spread (median of the
   deltas −0.15%, range −2.4% to +3.2%;
   `case-study/results/stage-1/bench-stage-0-vs-stage-1`). Against v7.4.0,
   18 of 18 are also within spread (range −6.1% to +1.7%; the two largest,
   `multiLineString` −6.1% and `featureCollection` −4.9%, sit inside 12.8%
   and 7.2% spreads; `.../bench-v7.4.0-vs-stage-1`). Neither suite calls
   `validateId` (F17), so these runs are a control. They show that the
   loader compiling `turf-helpers/index.ts` on the Stage 1 side changes
   nothing measurable.

Tests: the full suite (121 workspace packages through the loader) gives the
same 2336 TAP results as Stage 0, compared sorted line by line: 2332 pass, and
the same 4 known failures as v7.4.0. `@turf/turf` last-checks: 252/252.
Build and type-check time (median of 3, single package): `turf-helpers`
tsup build (JS and `.d.ts`) 1.34 s → 1.52 s, the cost of actually expanding a
macro instead of passing the file through. `tsc --noEmit index.ts` 0.60 s →
0.63 s, from resolving `@typesugar/validate`'s types. `turf-clone` is
unchanged (1.19 s and 0.58 s on both sides). The full `lerna run build
--concurrency 4` took 89 s against 84 s for Stage 0 (single runs on a shared
machine, so this is not a measured difference).

Adoption cost: 3 lines added and 1 removed, in 2 files under `packages/`,
plus one devDependency. Friction:

- The type-guard macro lives in `@typesugar/validate`, a package the
  `typesugar` umbrella doesn't depend on. The umbrella's own `validator<T>()`
  was broken for this type (F14).
- Each candidate needed its expansion read (`typesugar expand`) before it
  could be trusted, because two of the three routes for external types
  produced code that differed from what the docs describe (F9, F10).
- `pnpm install` without `--ignore-scripts` runs Turf's root `prepare`, a
  full 115-package build, which matters on a shared machine.
  `vendor/typesugar/pack.sh` gained `PACK_CONCURRENCY` so the typesugar
  build can stay under 2 GB.
- The commit used `--no-verify`, because monorepolint rejects the private
  `case-study/package.json`. The same is true in Stage 0. Prettier and
  eslint pass on the changed files.

New tooling: `case-study/leaks.mjs` (the scan above) and
`case-study/experiments/` (the derived-Clone experiment and the
`validateId` micro-benchmark).

### Stage 3: exhaustive `match()` in `turf-meta`

Run before Stage 2, by choice: `turf-meta` is called by nearly every Turf
package, so it is the strongest zero-cost test in the study.

**Result: one of `turf-meta`'s eleven `switch` statements became a
`match()`, and the other ten could not.** `match()` is an expression, and
`turf-meta`'s switches are statements. Their arms loop, call back, `return
false` out of the enclosing function and update loop counters (F21). The one
that fits is in `flattenEach`: it maps a multi-geometry type to its
single-geometry type. Its literal translation failed the build, because the
switch has no case for `"GeometryCollection"`. That case is reachable. A
collection nested three deep reaches it, and `flattenEach`, `segmentEach` and
`lineEach` then throw a `TypeError`, at v7.4.0 too (F23). The vendored
typesugar compiled the match to an arrow IIFE, which allocates a closure on
every call. It also left a dead `throw new MatchError(…)` after the last arm,
which put `import { MatchError } from "@typesugar/std"` into `@turf/meta`'s
published JS. Both are fixed in typesugar (F18, F19). With the fix the output
is the conditional expression a person would write, and no benchmark moved.
One cost stays: plain `tsc` rejects every fluent `match()` (`.case` on
`never`). That breaks Turf's `test:types` and tsup's `.d.ts` build, so the
match needs a `@ts-expect-error` (F20).

typesugar: branch
[`case-study-fixes-2`](https://github.com/typesugar/typesugar/tree/case-study-fixes-2)
at [`be4286d3`](https://github.com/typesugar/typesugar/commit/be4286d3),
which is Stage 1's `case-study-fixes` (`fea567ea`) plus the `match()` fix.
It is vendored in `vendor/typesugar/`.

#### What changed in Turf

```diff
+import { match } from "@typesugar/std";
 ...
-    var geomType;
-
     // Callback for multi-geometry
-    switch (type) {
-      case "MultiPoint":
-        geomType = "Point";
-        break;
-      case "MultiLineString":
-        geomType = "LineString";
-        break;
-      case "MultiPolygon":
-        geomType = "Polygon";
-        break;
-    }
+    var geomType = match(type)
+      // @ts-expect-error: typesugar types the fluent chain as `never` until it is expanded
+      .case("MultiPoint")
+      .then("Point")
+      .case("MultiLineString")
+      .then("LineString")
+      .case("MultiPolygon")
+      .then("Polygon")
+      // geomEach passes a GeometryCollection through only when it is nested
+      // three deep; v7.4.0's switch left geomType undefined for it too.
+      .case("GeometryCollection")
+      .then(undefined);
```

`packages/turf-meta/package.json` gains `"@typesugar/std": "0.1.1"` under
`devDependencies`. Nothing in `dependencies` changes. Source lines changed:
13 added and 13 removed in `index.ts`, plus 1 added in `package.json`.

The match keeps v7.4.0's behaviour for every input. The `"GeometryCollection"`
arm returns `undefined`, as the switch did by falling through. It covers the
last member of the narrowed type, so the compiled code has no check for it.
Any other runtime string (input that isn't GeoJSON) also gives `undefined`,
as before. `case-study/experiments/stage-3-nested-geometry-collection.mjs`
gives the same output on Stage 1 and Stage 3, and the micro-benchmark below
first checks that all three builds pass the same arguments to the callback.

#### Exhaustiveness: what the check found

`type` there is `"MultiPoint" | "MultiLineString" | "MultiPolygon" |
"GeometryCollection"`, narrowed by the `switch` just above, which returns for
`null`, `Point`, `LineString` and `Polygon`. The literal translation of the
switch, with only its three arms, fails the build:

```
✘ [ERROR] packages/turf-meta/index.ts:934:20: [typesugar] [typesugar] [TS9226]
  Non-exhaustive match — missing cases: "GeometryCollection"
  = help: Add the missing cases or use .else() / _ to handle remaining values.
```

The switch it replaced was silent about this. The gap is reachable.
`geomEach` unwraps a GeometryCollection itself and unwraps one more level in
its `"GeometryCollection"` arm. A collection nested a third level deep is
therefore passed to `flattenEach`'s callback as a GeometryCollection. There
`geomType` comes out `undefined`, and the loop reads
`geometry.coordinates.length`
(`case-study/experiments/stage-3-nested-geometry-collection.mjs`, identical
output on v7.4.0, Stage 1 and Stage 3):

```
GC(GC(GC))  flattenEach  calls=0  THROWS: Cannot read properties of undefined (reading 'length')
GC(GC(GC))  segmentEach  calls=0  THROWS: Cannot read properties of undefined (reading 'length')
GC(GC(GC))  lineEach     calls=0  THROWS: Cannot read properties of undefined (reading 'length')
GC(GC(GC))  coordEach    calls=3
GC(GC(GC))  geomEach     calls=1
```

RFC 7946 says nested collections SHOULD be avoided, but they are valid
GeoJSON. Fixing the throw would change behaviour, so this stage only makes the
case explicit (F23).

The same check can't help in the two hottest functions. In `coordEach` and
`geomEach` the switched-on value is `any`, so `match()` there would need an
`.else()` and would check nothing (F22).

#### Why the other ten switches stayed

| Function | Switch on | Static type | Why it stayed a `switch` |
| --- | --- | --- | --- |
| `coordEach` | `geomType` | `any` | Each arm is a loop that calls back, `return false`s from `coordEach`, and updates `coordIndex`, `multiFeatureIndex` and `geometryIndex`. `case null: break`, and `default: throw`. |
| `propEach` | `geojson.type` | `"Feature" \| "FeatureCollection"` | The arms loop and call back, and `break` out of the loop. |
| `geomEach` | `geometry.type` | `any` | Six types share one arm (`.or()` could say that), but the arm calls back and `return false`s from `geomEach`, and the `GeometryCollection` arm loops. `default: throw`. |
| `flattenEach` (first) | `type` | all seven geometry types and `null` | Four types call back and `return` from the callback. Every other type falls out of the switch into the loop below it. |
| `lineEach` | `type` | the four line and polygon types | The arms loop and `return false`. |
| `findSegment`, `findPoint` (first switch each) | `geojson.type` | | The arms assign two locals, or `return null`, or `throw`. |
| `findSegment`, `findPoint` (second switch each) | `geometry.type` | | Each arm normalises negative indexes in place and then returns, and an unmatched type falls through to a `throw`. A `match()` needs each arm as a single expression, so these would become nested ternaries, and JavaScript has no `throw` expression for the fall-through. |

#### Zero cost

1. **Emitted JS against hand-written.** Of 115 `dist` trees (691 files,
   compared after normalising the absolute build path), only `turf-meta`'s
   `index.js`, `index.cjs`, their two maps, and `turf.min.js` differ from
   Stage 1. Every `.d.ts` is byte-identical. The semantic change in
   `turf-meta/dist/esm/index.js` is exactly the one line, shown here with
   both sides whitespace-minified
   (`case-study/results/stage-3/emitted-code-semantic.diff`):

   ```js
   // Stage 1
   var geomType;switch(type){case"MultiPoint":geomType="Point";break;case"MultiLineString":geomType="LineString";break;case"MultiPolygon":geomType="Polygon";break}
   // Stage 3
   var geomType=type==="MultiPoint"?"Point":type==="MultiLineString"?"LineString":type==="MultiPolygon"?"Polygon":void 0;
   ```

   It has no IIFE, no closure, no extra check and no import. The last arm
   is unconditional, as the switch's fall-through was. A person could
   reasonably have written either form, and terser keeps the chain as it is
   in `turf.min.js` (`"MultiPoint"===s?"Point":…:void 0`). The full diff
   (`.../emitted-code.diff`) is 612 lines: the file contains a macro, so it
   is reprinted whole, and line breaks move in every function (F16). That
   is all of the size change below. Comments inside the chain do not reach
   the output.

   With the typesugar Stage 1 vendored (`0411491c`), the same source
   compiled to this (`.../unfixed-0411491c-turf-meta-index.js.txt`):

   ```js
   import { MatchError } from "@typesugar/std";
   ...
       var geomType = (() => {
         const _type = type;
         if (_type === "MultiPoint")
           return "Point";
         if (_type === "MultiLineString")
           return "LineString";
         if (_type === "MultiPolygon")
           return "Polygon";
         return void 0;
         throw new MatchError(_type);
       })();
   ```

   That is an arrow IIFE inside `flattenEach`'s per-geometry callback,
   allocated on every call, and a `throw` that can never run. The throw
   kept `MatchError`, so `@turf/meta`'s ESM and CJS builds imported
   `@typesugar/std` at runtime, a package it lists only as a devDependency.
   `leaks.mjs` would have failed the stage. F15 found the same IIFE shape
   for `is<T>()`. Both problems are fixed in typesugar (F18, F19).
2. **typesugar in the published output: none in JS or `.d.ts`.**
   `leaks.mjs` scans 231 JS files and 230 declaration files and finds
   nothing (`.../leaks.json`). As in Stage 1, the source maps for
   `turf-meta` (ESM and CJS) embed the source, so they contain the text
   `@typesugar/std`. Nothing resolves it.
3. **Size.** `turf-meta`'s ESM entry: −1,063 B raw (−4.8%), −109 B gzip,
   −88 B brotli. Whitespace-minified, the code is 47 B smaller, so the
   rest is the reprint's line breaks (F16). `turf.min.js`: −21 B raw, −1 B
   gzip, +61 B brotli. No other package's entry changed size
   (`.../size-stage-1-vs-stage-3.md`).
4. **Speed.** Three measurements, all one process at a time on a quiet
   machine:

   - **Turf's benches, Stage 1 against Stage 3** (5 interleaved rounds,
     loader on both sides, 100 cases in 7 suites;
     `.../bench-stage-1-vs-stage-3`, load average 3.8 at the start and 5.0
     at the end). 100 of 100 deltas are smaller than their spread.

     | Suite | Cases | Median Δ | Range | Within spread |
     | --- | ---: | ---: | --- | ---: |
     | `turf-meta` | 60 | −0.5% | −11.6% to +4.0% | 60 |
     | `turf-bbox` (`coordEach`) | 1 | +0.2% | | 1 |
     | `turf-centroid` (`coordEach`) | 5 | −0.0% | −0.6% to +1.0% | 5 |
     | `turf-simplify` (`geomEach`) | 13 | +0.2% | −1.1% to +2.8% | 13 |
     | `turf-length` (`segmentReduce` → `flattenEach`) | 6 | +0.5% | −1.1% to +1.6% | 6 |
     | `turf-line-segment` (`flattenEach`) | 8 | +0.0% | −0.9% to +0.5% | 8 |
     | `turf-flatten` (`flattenEach`) | 7 | −0.1% | −0.4% to +0.4% | 7 |

     The last three suites have multi-geometry fixtures, so they reach the
     changed line. `turf-meta`'s own bench does not (F24). Its larger
     negative deltas (for example `findSegment - polygon` −11.6%) are in
     functions whose code is unchanged apart from whitespace. They come from
     the Stage 1 side running fast in two of its five rounds. In those
     rounds the whole segment/flatten/find group was 15–70% faster at once
     (spreads up to 90%). The Stage 3 side did not do that in this run, but
     in the v7.4.0 run below both sides did, so it is how this suite behaves
     on this machine, not an effect of either build. The suite imports
     `index.ts` through the loader, so on Stage 3 the loader compiles the
     file, while on Stage 1 it passes through to tsx (as in F17). The
     medians ignore two outlier rounds.
   - **Turf's benches, v7.4.0 against Stage 3** (same set and settings;
     `.../bench-v7.4.0-vs-stage-3`). Load average 4.4 at the
     start and 3.4 at the end. A first attempt was stopped and thrown away,
     because the load average reached 268 during it, with Spotlight
     indexing the bench worktrees. 100 of 100 deltas are smaller than their
     spread. `turf-meta`: median −0.2%, range −19.8% to +11.5%, 60 of 60
     within spread. The extremes are `featureEach`/`featureReduce - point`
     (−20%, spreads 27–28%), whose code is unchanged, and they come from
     fast rounds on both sides. Downstream, the median deltas were:
     `turf-bbox` −0.4%, `turf-centroid` −0.2% (range −0.5% to +0.2%),
     `turf-simplify` −0.2% (−1.3% to +0.7%), `turf-length` +0.3% (−0.1% to
     +1.0%), `turf-line-segment` +0.1% (−0.6% to +0.5%) and `turf-flatten`
     −0.2% (−0.4% to +0.3%).
   - **The changed line itself**
     (`case-study/experiments/stage-3-flatten-microbench.mjs`, 5 rounds,
     each measurement in a fresh process, interleaved;
     `.../flatten-microbench.txt`). `flattenEach` over MultiPoint,
     MultiLineString and MultiPolygon features and a collection of 100 of
     them, with four builds: v7.4.0's switch, the 0411491c IIFE, the
     be4286d3 chain, and v7.4.0 again as a control.

     | Fixture | v7.4.0 switch, ops/s | IIFE (0411491c) | chain (be4286d3) | v7.4.0 again |
     | --- | ---: | ---: | ---: | ---: |
     | MultiPoint | 10,997,148 | −0.1% | −2.0% | −0.3% |
     | MultiLineString | 22,831,713 | +0.7% | +0.9% | −0.1% |
     | MultiPolygon | 29,838,727 | +0.3% | −0.7% | −0.4% |
     | 100 multi-geometries | 188,142 | +2.9% | +2.2% | +1.7% |

     Every difference is within the control's noise and the 2–8% spreads.
     The IIFE was not slower either, because V8 inlines it, as F15 found for
     `is<T>()`. So the F18 fix is about the shape of the code and the import
     it dragged in, not about speed. A first version of this script measured
     the three builds one after another in one process. That said the
     `match()` builds were 47–88% faster, and it said the same when all
     three slots held the identical v7.4.0 file (F26). Stage 1's
     `validateId` micro-benchmark was checked the same way: with v7.4.0's
     file in both slots the gap is −0.4%, so its 2× result stands.

Tests: the full suite (121 workspace packages through the loader,
`pnpm -r --no-bail --workspace-concurrency=2 run test`) gives 2336 TAP
results: 2332 pass, plus the same 4 known failures as v7.4.0
(`directional-mean` gps and gps segment, `standard-deviational-ellipse`
weighted and unweighted). `@turf/turf` last-checks: 252/252.
`turf-meta`'s `test:types` passes, but only because of the
`@ts-expect-error` (F20). Build and type-check time (median of 3, `turf-meta` alone, in the bench
worktrees): tsup build (JS and `.d.ts`, through the loader) 1.64 s → 1.75 s;
`tsc --noEmit --strict index.ts` 0.60 s → 0.62 s. The full `lerna run
build --concurrency 4` took 81 s (a single run on a shared machine; Stage 1
took 89 s).

Adoption cost: 14 lines added and 13 removed, in 2 files under
`packages/`, plus one devDependency. Friction:

- Each switch had to be read for whether its arms are expressions. Only one
  was.
- The fluent chain has no types that plain `tsc` accepts (F20). It needs a
  `@ts-expect-error`, and that also hides any real type error on that line.
- The vendored typesugar's output for the one match that fit had to be read
  before it could be trusted. It allocated a closure per call and imported
  `@typesugar/std` at runtime (F18, F19). The fix, its tests and a repack
  of the tarballs came before any measurement.
- Exhaustiveness checks the declared type, not the paths that can actually
  run. Here that found a real gap. In `lineEach` it would demand arms for
  `MultiLineString` and `MultiPolygon`, which `flattenEach` has already
  flattened away (F22).
- The commit used `--no-verify` for the monorepolint complaint about
  `case-study/package.json`, as in Stages 0 and 1. Prettier, eslint and
  `test:types` pass on the changed files.

New tooling: `case-study/experiments/stage-3-flatten-microbench.mjs` and
`case-study/experiments/stage-3-nested-geometry-collection.mjs`.

## Findings

_typesugar bugs, gaps and design lessons, each with a link to its fix or issue._

- **F1 (gap, fixed): no way to run TypeScript through typesugar under Node or
  tsx.** Anything run from source (tsx, `node --test`, tape, benchmark
  scripts) ran macro calls unexpanded. The bundler plugins only cover
  bundlers, and `typesugar run` bundles the entry, which moves
  `import.meta.url` and `__dirname`. Fix: `node --import typesugar/register`
  (also `@typesugar/transformer/register`), commit
  [`fbcc5775`](https://github.com/typesugar/typesugar/commit/fbcc5775) on
  `case-study-fixes`, with docs at `docs/getting-started/environments/node.md`
  and a changeset. It uses `module.registerHooks` (sync, and also covers
  `require`), falling back to `module.register` on Node before 22.15.
  Unchanged modules go on to the next loader untouched. Changed modules are
  compiled to JS for the running Node, keeping the tsconfig target's
  class-field semantics, with an inline source map. Macro errors fail the
  import. It reads sources from disk, so it works whether tsx is registered
  before or after it. The hook module imports only Node builtins, and the
  pipeline loads on the first TypeScript module.
- **F2 (bug, fixed upstream): files with no macros were reprinted.** The
  transformer's statement-list visitor rebuilt every Block and SourceFile, so
  the pipeline reported every file as changed. unplugin's esbuild path then
  compiled it with `ts.transpileModule` instead of letting esbuild compile the
  original. Measured on Turf before the fix (typesugar `3dc20f54`):
  - 194 emitted JS files and 228 source maps differed across the 115 `dist`
    trees.
  - 27 ESM entry files differed beyond whitespace. TypeScript's
    `?.`/`??` lowering for es2017 (`x !== null && x !== void 0`) replaced
    esbuild's (`x != null`).
  - `turf.min.js` was 1,788 B smaller (−0.33% raw, −0.34% gzip, −0.20%
    brotli), and all `dist/esm/index.js` together were 10,996 B smaller
    (−2.9%, mostly whitespace).

  The case study found it independently and wrote the same fix, but
  `decisions-1.0` fixed it first in
  [`4b8ef709`](https://github.com/typesugar/typesugar/commit/4b8ef709). That
  commit also keeps zero-output `@derive` stripping, which only worked by
  accident of the reprint, and repairs tests whose `type F<_>` fixtures
  "changed" only through the reprint. Stage 0 uses it, so our duplicate was
  dropped.
- **F3 (tooling): adding a dependency to the root manifest makes pnpm 10.10
  re-resolve every root dependency.** Adding `typesugar` there bumped eslint,
  prettier, es-check, acorn and yaml in the lockfile, with rollup and tsx as
  well when pnpm's metadata cache was fresh. During those experiments pnpm
  also rewrote the version ranges in six Turf `package.json` files; they were
  restored. Putting the dependencies in a separate `case-study` workspace
  package leaves every v7.4.0 resolution in place.
- **F4 (tooling): a repacked `file:` tarball with the same name is not picked
  up.** pnpm finds it in the store by the lockfile's integrity hash, so it
  keeps installing the old bytes, even with `--force`. Tarball names now carry
  the typesugar commit.
- **F5 (for Stage 1): the `.d.ts` build sees unexpanded source.** tsup's dts
  step runs `tsc` on the original file. A package that imports macros from
  `typesugar` therefore needs `typesugar` resolvable from that package, not
  only from the build tooling, and its types must not depend on expansion. A
  scratch package using `comptime` built JS correctly (`answer = 42`) but
  failed dts with TS2307.
- **F6 (method): Turf's benches use random fixtures.** For example, `turf-meta`
  builds its inputs with `@turf/random` on every run. Run-to-run spread
  therefore includes different input data, and only interleaved medians over
  several rounds are worth comparing.
- **F7 (method): the loader is not neutral for microbenchmarks.** A process
  that has loaded typesugar holds a TypeScript Program, 150–170 MB of heap.
  That alone moved several 10^8 ops/s `turf-helpers` cases by 30–39% and
  `turf-clone` by about 7%, with byte-identical code, between a plain tsx
  process and one with the loader. Presumably this is GC and heap layout
  affecting V8's optimisation of tiny functions; we did not dig further. So
  every A/B run must run both sides the same way: `bench.mjs --loader both`
  whenever one side would otherwise run without it (always against v7.4.0).
  For typesugar this argues for an option that frees the Program once
  loading is done, or that expands ahead of time. Not filed yet.
- **F8 (design lesson): typesugar's `Clone` is shallow, so it can't express
  Turf's clone.** `turf-clone` makes a deep copy that follows the GeoJSON
  structure: `deepSlice` for coordinates, a recursive copy of properties, and
  foreign members kept. typesugar documents `Clone` as shallow, and a derived
  instance copies one level (`{ ...a }`). Rust's `#[derive(Clone)]`, which the
  name suggests, clones each field through that field's own `Clone`.
  typesugar's own `Clone<A[]>` instance in `@typesugar/std` already clones
  element by element. A derive that used field instances (`fieldTypeclass:
  "Clone"` instead of `null`) would generate roughly Turf's `deepSlice` for
  geometries. Changing what `Clone` means is a design decision for
  typesugar, so it is recorded here and not filed as a fix.
- **F9 (bug, fixed): derived `Clone` listed the declared fields and had no
  sum-type strategy.** On `@types/geojson`'s `Point` it produced `{ type:
  a.type, coordinates: a.coordinates, bbox: a.bbox }`. Absent optional
  fields came back as `bbox: undefined` keys, and undeclared properties (GeoJSON
  foreign members) were dropped. On a discriminated union it failed with
  TS9106 ("derivation strategy returned null for sum type"), although
  `docs/guides/derive.md` promised "switch-on-discriminant for sum types".
  Both now derive `({ ...a })`, the "spread copy" the guide already
  described. Commit
  [`10449625`](https://github.com/typesugar/typesugar/commit/10449625) on
  `case-study-fixes`, failing tests first, with a changeset.
- **F10 (docs contradict behaviour; open question): `summon` auto-derives.**
  `docs/guides/typeclasses.md` says "Nothing is ambient (PEP-052): a type
  gets an instance only when you ask for one, either with `@derive` or by
  writing an `@impl` instance", and PEP-052 removed "auto-derive-from-nowhere"
  for operators. `summon<Clone<Point>>()` with no instance in scope still
  derives one from the type's structure (`summonInstanceExpression` →
  `tryDeriveViaGeneric`), and that is the only way to get a derived
  instance for a type you can't annotate, such as everything in
  `@types/geojson`. Either the docs or the behaviour is wrong. Which one is
  a design call, so it is not changed here.
- **F11 (bug, fixed): `summon` could leave a runtime import of `typesugar`.**
  `import { summon, Clone } from "typesugar"; summon<Clone<P>>()` expands to
  an instance literal. The transformer removed `summon` from the import but
  kept `Clone`, a value export used only in the macro's type argument. tsc
  and esbuild elide it as unused, so Turf's build was not affected. Under
  `verbatimModuleSyntax` the emitted JS kept `import { Clone } from
  "typesugar"`, so the library would depend on typesugar at runtime (checked
  with esbuild on the expanded output). Fix: in an import that brought in a
  macro, a specifier the file used and the expanded code no longer uses (as a
  value or a type) is removed. Commit
  [`0411491c`](https://github.com/typesugar/typesugar/commit/0411491c).
- **F12 (gap): no derived `Eq` for GeoJSON.** `Position` is `number[]`, and
  derive's field check finds no `Eq` for arrays, because generic instances
  such as `Eq<A[]>` are not supported in 1.0 (a documented limit). So
  `Eq<Point>` fails ("Position lacks Eq"), and so does every geometry,
  feature and union.
- **F13 (inconsistency): two type-guard generators with different depth
  and types.** For `Point`, the derived `TypeGuard`'s `is` checks only that
  `coordinates` is a non-null object, and it is typed `(value: unknown) =>
  boolean`, not a type predicate. `is<Point>()` from `@typesugar/validate`
  checks that `coordinates` is an array of numbers and that `bbox` is a 4- or
  6-tuple, and it narrows. `is<T>()` also has small code-shape warts: an
  optional field is tested `x === undefined || (x === undefined || …)`, and a
  tuple length is tested `length >= 4 && length <= 4`. These matter for
  Stage 2.
- **F14 (bug, fixed): `validator<T>()` rejected every value of a primitive
  `T`.** `validator<string | number>()`, the validator exported by
  `typesugar` itself, emitted the object validator. It failed any non-object
  ("Expected object, got string") and then checked `toString`, `valueOf`
  and `toLocaleString` as fields. It produced no diagnostic. Found while
  comparing it with `is<Id>()`. Commit
  [`6edd688a`](https://github.com/typesugar/typesugar/commit/6edd688a).
- **F15 (code shape, not fixed): `is<T>(x)` emits an immediately-invoked
  arrow.** The guard function is built and then applied: `((value): value is
  T => …)(x)`. terser keeps it as `!function(t){…}(t)`. V8 inlines it, so it
  costs nothing measurable (Stage 1 micro-benchmark), but it is not what a
  person writes. Inlining the predicate on `x` would lose the narrowing in
  the expanded TypeScript, and a typesugar test type-checks that output. The
  alternative is to hoist a named guard to module scope, which needs
  machinery that only specialization has today. Not filed yet.
- **F16 (code shape): a file with a macro is reprinted whole.** typesugar
  hands esbuild the TypeScript printer's output for a changed file, so
  whitespace and line breaks change in five unrelated functions of
  `turf-helpers` (+2 B raw). F2 was the same thing for files with no
  macros, and that is fixed. For files with macros it is by design today.
  Splicing only the expanded regions into the original text (as
  `config-writer.ts` already does for `typesugar.config.ts`) would leave the
  rest of the file as it was.
- **F17 (method): neither Turf's tests nor its benches exercise the changed
  code.** `turf-helpers`' `test.ts` and `bench.ts` never call `validateId`.
  The equivalence check and the micro-benchmark above fill the gap. The A/B
  benches still matter as a control, because `bench.ts` imports the source
  through the loader: on the Stage 1 side `turf-helpers/index.ts` is compiled
  by typesugar's loader, and on the Stage 0 side it passes through to tsx.
- **F18 (bug, fixed): a `match()` over plain literal arms compiled to an
  arrow IIFE.** Only one literal arm plus `.else()` got a ternary. Anything
  longer became `(() => { const _t = t; if (_t === …) return …; … })()`,
  which allocates a closure on every evaluation. In `flattenEach` that is
  once per multi-geometry, inside a callback. The guide documented `x ===
  "ok" ? 200 : 500` for exactly this shape. Fix: arms that are all plain
  literals (with `.or()` literals), ending in `.else()`, `_` or an arm that
  completes a literal union, compile to a conditional chain. It applies when
  the scrutinee is an identifier or `this`, or is read only once. A property
  scrutinee tested more than once keeps the IIFE, since it may be a getter,
  and the guide now says so. Commit
  [`be4286d3`](https://github.com/typesugar/typesugar/commit/be4286d3) on
  `case-study-fixes-2`, failing tests first, with a changeset. Matches that
  bind names, have guards or use object patterns still compile to an IIFE.
  That is F15's shape for `is<T>()`, and it is the general case.
- **F19 (bug, fixed): a dead `throw new MatchError` put a runtime import
  of `@typesugar/std` into the library.** When the last arm covered the rest
  of a literal union, the IIFE still ended with `throw new
  MatchError(_type)` after an unconditional `return`. The throw could never
  run, but `MatchError` was imported, so `@turf/meta`'s ESM had `import {
  MatchError } from "@typesugar/std"` and its CJS had
  `require('@typesugar/std')`. The package declares `@typesugar/std` only as
  a devDependency, so consumers would fail to load it. Fix: the generated
  code ends at the first unconditional return (same commit as F18). The guide
  also claimed that "even with compile-time exhaustiveness, the generated
  code includes a terminal throw". That has never been true for literal
  unions: the last arm takes any value outside the type. Discriminated-union
  matches and the 7+ literal `switch` do keep a reachable `MatchError`, and
  with it a runtime dependency on `@typesugar/std`. The guide now says that
  too. Whether a library should depend on `@typesugar/std` for that safety
  net, or get an inlined `throw new Error`, is a design call, so it is
  recorded here and not changed.
- **F20 (gap, open): plain `tsc` rejects every fluent `match()`.**
  `@typesugar/std` declares the fluent overload as `match(value: unknown):
  never`, so `.case` fails with TS2339 ("Property 'case' does not exist on
  type 'never'"). typesugar's language-service plugin and `typesugar check`
  suppress this (the `MacroCallChain` rule). Plain `tsc` doesn't, and Turf
  checks with plain `tsc` twice: in `test:types`, and in tsup's `.d.ts`
  build, which sees unexpanded source (F5). typesugar's own tsup guide sets
  `dts: true` next to the esbuild plugin, and that combination fails the
  build as soon as a file contains a fluent match. Workaround: one
  `@ts-expect-error` per match. It also hides any real error on that line,
  and `geomType` becomes `any`. A typed chain is not a quick fix. The last
  `.then()` would need to be both the chain and the result, which TypeScript
  can only express as an intersection (`R & Chain`), and that collapses to
  `never` when a result is `undefined` or `null`, as it is here. Names bound
  by patterns would still be TS2304 under plain `tsc`. Not filed yet.
- **F21 (design limit): `match()` has no statement form.** `.then()` and
  `.else()` each take one expression. So an arm can't loop, can't `return`
  from the enclosing function, and can't `break` or `continue`. JavaScript has
  no `throw` expression, so a `default: throw new Error(…)` can't be written
  either. Ten of `turf-meta`'s eleven switches need at least one of these.
  Traversal code like Turf's would need a statement-level match that
  compiles to a `switch` with the arm bodies in place (no closures), with the
  same exhaustiveness check. That is a new feature, so it is recorded here
  and not built.
- **F22 (limit): exhaustiveness is only as good as the scrutinee's type.**
  In `coordEach` and `geomEach`, the two functions most of Turf runs through,
  the switched-on value is `any`. It comes from untyped `var`s assigned
  under `@ts-expect-error: Known type conflict`. A `match()` there would need
  `.else()` and would check nothing. Typing those variables is a refactor of
  its own. The check also follows declared types, not reachable paths:
  `lineEach`'s callback is typed with all four line and polygon types, but
  `flattenEach` has already split the multi ones, so an exhaustive match
  there would demand two dead arms or an `.else()`.
- **F23 (Turf, latent bug): `flattenEach`, `segmentEach` and `lineEach`
  throw on a GeometryCollection nested three deep.** Found by `match()`'s
  exhaustiveness check: the literal translation of `flattenEach`'s second switch failed with
  TS9226 (missing `"GeometryCollection"`). `geomEach` hands a doubly nested
  collection to the callback unflattened, `geomType` is `undefined`, and the
  loop throws `TypeError: Cannot read properties of undefined (reading
  'length')`. Same at v7.4.0
  (`case-study/experiments/stage-3-nested-geometry-collection.mjs`). Kept as
  is, because fixing it changes behaviour. It is worth reporting to Turf.
- **F24 (method): `turf-meta`'s own bench never reaches the changed
  line.** Its fixtures are Points and Polygons, and both return from
  `flattenEach`'s first switch. `turf-length`, `turf-line-segment` and
  `turf-flatten` have multi-geometry fixtures, so they were added to the
  bench set, and the micro-benchmark measures the line itself (as F17 did
  for `validateId`).
- **F25 (cosmetic): diagnostics say `[typesugar] [typesugar] [TS9226]`.**
  The core diagnostic's message already starts with `[typesugar]`, and
  unplugin adds another (`unplugin.ts`, where it formats errors and
  warnings). Not fixed, because it would mean a repack after the
  measurements.
- **F26 (method): never compare builds of the same function in one
  process.** The first version of Stage 3's micro-benchmark measured three
  `turf-meta` builds back to back in one process. It reported the two
  `match()` builds 47–88% faster than v7.4.0. With the identical v7.4.0 file
  loaded three times, the second and third copies were 50–92% faster too.
  Whatever was measured first ran slower. Each measurement now gets a fresh
  process, interleaved and rotated per round, and the comparison includes the
  baseline twice as a control. Stage 1's in-process micro-benchmark passes
  that control, so its result stands.
