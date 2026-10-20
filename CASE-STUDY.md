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
