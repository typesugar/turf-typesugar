# Vendored typesugar

The case study consumes typesugar as packed tarballs, the same files
`npm publish` would upload, so a stage can be reproduced without a local
typesugar checkout or `pnpm link`.

- Which commit: see [`COMMIT`](./COMMIT) (commit, branch, pack date, Node version
  and the SHA-256 of every tarball).
- Wiring: the `case-study` workspace package (`case-study/package.json`)
  depends on `typesugar` and `unplugin-typesugar` as
  `file:../vendor/typesugar/*.tgz`, and the `overrides` in
  `pnpm-workspace.yaml` point every typesugar package at its tarball, so the
  transitive `@typesugar/*` dependencies resolve to these files as well,
  never to the npm registry. The dependencies live in that package rather
  than the root `package.json` because changing the root manifest's
  dependencies makes pnpm re-resolve all of the root's dependencies (eslint,
  prettier, ...), which would move the lockfile away from v7.4.0's. As it is,
  the lockfile diff against v7.4.0 only adds packages.
- `tsup.config.ts` and `case-study/with-typesugar.sh` resolve typesugar from
  the `case-study` package.

## Regenerate

From a clean typesugar checkout (or worktree) at the commit you want:

```sh
vendor/typesugar/pack.sh /path/to/typesugar
pnpm install
```

`pack.sh` runs `pnpm install --frozen-lockfile` in the typesugar checkout,
builds the packages listed in it (two at a time), runs `pnpm pack` for each
into this directory, and rewrites `COMMIT`. Tarball names carry the first 8
characters of the commit (`typesugar-core-0.1.1-fbcc5775.tgz`), and `pack.sh`
rewrites the references in `case-study/package.json` and
`pnpm-workspace.yaml` to match. That matters: pnpm keys a `file:` tarball's
store entry on the integrity hash in the lockfile, so repacking under an
unchanged name silently keeps installing the old bytes, even with
`pnpm install --force`.

Packed set: `typesugar`, `unplugin-typesugar` and `@typesugar/{core, macros,
transformer, transformer-core, lsp-common, reflect, derive, typeclass,
type-system, std, fp, contracts, validate}`.
