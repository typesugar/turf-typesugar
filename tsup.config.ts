import { defineConfig, type Options } from "tsup";
import { createRequire } from "node:module";

// typesugar (case study). unplugin-typesugar is a dependency of the
// case-study workspace package, not of the root, so resolve it from there.
const caseStudyRequire = createRequire(
  new URL("./case-study/package.json", import.meta.url)
);
const typesugarEsbuild = caseStudyRequire("unplugin-typesugar/esbuild");
const typesugar: (options?: {
  tsconfig?: string;
}) => NonNullable<Options["esbuildPlugins"]>[number] =
  typesugarEsbuild.default ?? typesugarEsbuild;

const baseOptions: Options = {
  clean: true,
  dts: true,
  entry: ["index.?s"], // while we have a mix of TS and JS packages
  minify: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: "es2017",
  tsconfig: "./tsconfig.json",
  // treeshake: true, causes "chunk.default" warning, breaks CJS exports?
  cjsInterop: true,
  splitting: true,
};

// typesugar macro expansion (case study). One plugin instance per output
// format: each esbuild build gets its own pipeline. tsup runs from the
// package directory, so "./tsconfig.json" is that package's tsconfig. The
// .d.ts build (dts: true) does not go through esbuild plugins.
const typesugarPlugin = () => typesugar({ tsconfig: "./tsconfig.json" });

export default [
  defineConfig({
    ...baseOptions,
    outDir: "dist/cjs",
    format: "cjs",
    esbuildPlugins: [typesugarPlugin()],
  }),
  defineConfig({
    ...baseOptions,
    outDir: "dist/esm",
    format: "esm",
    esbuildPlugins: [typesugarPlugin()],
  }),
];
