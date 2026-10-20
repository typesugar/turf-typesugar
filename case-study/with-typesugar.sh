#!/usr/bin/env sh
# Run a command with typesugar's Node loader in NODE_OPTIONS, so every Node
# process under it (lerna, pnpm scripts, tsx test.ts, tsx bench.ts) expands
# TypeScript through typesugar. Turf's own package scripts stay unchanged.
#
#   case-study/with-typesugar.sh npx lerna run test --concurrency 2
#   case-study/with-typesugar.sh pnpm --dir packages/turf-meta run bench
#
# typesugar is a dependency of the case-study workspace package, so the
# loader is resolved from there and passed to Node as an absolute URL that
# works from any package directory.
set -eu
here="$(cd "$(dirname "$0")" && pwd)"
register="$(cd "$here" && node --input-type=module -e 'process.stdout.write(import.meta.resolve("typesugar/register"))')"
NODE_OPTIONS="--import=${register}${NODE_OPTIONS:+ $NODE_OPTIONS}"
export NODE_OPTIONS
exec "$@"
