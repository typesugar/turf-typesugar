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
| Runtime | Each touched package's `bench.ts`, A/B against the previous stage, interleaved in the same CI job (`.github/workflows/case-study-bench.yml`), median of N runs with spread |
| Bundle size | `packages/turf/turf.min.js` and per-package `dist/esm/index.js`: raw, gzip, brotli |
| Emitted code | Diff of `dist/esm` against the previous stage; every residual typesugar runtime reference is listed and explained |
| Build / type-check time | `lerna run build`, `tsc --noEmit` for touched packages, median of 3 |
| Adoption cost | Lines changed in source, new imports, friction notes |

Local runs are only for development; the published numbers come from CI so the
A and B sides share a machine and readers can re-run them.

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

_Filled in as stages land: what changed, numbers, findings, typesugar fixes._

## Findings

_typesugar bugs, gaps and design lessons, each with a link to its fix or issue._
