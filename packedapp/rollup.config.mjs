import sass from "rollup-plugin-sass";
import css from "rollup-plugin-import-css";
import json from '@rollup/plugin-json';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import alias from "@rollup/plugin-alias";
import { terser } from "rollup-plugin-terser";
import nodePolyfills from 'rollup-plugin-node-polyfills';
import typescript from '@rollup/plugin-typescript';
import pkg from "./package.json"  with { type: "json" };
import replace from '@rollup/plugin-replace';
import inject from '@rollup/plugin-inject';

const shared = {

    external:  [],  // Exclude zlib from being bundled
    plugins: [typescript({
        resolveJsonModule: true,
        compilerOptions: { declaration: false }
    }),
        alias({
          entries: {
          // zlib: "browserify-zlib",  // Redirects `zlib` to a browser-compatible version
          },
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('production'),
          'global': 'window',
          preventAssignment: true,
        }),
        resolve({
          browser: true,
          // preferBuiltins: false,
        }),
        json(),
        css(),
        sass({ insert: true }),

        babel({
          babelHelpers: 'bundled',
          exclude: "../node_modules/**",
        }),
        nodePolyfills({}),
        commonjs(),

      ],
      output:{
        banner: "window.global = window;",
        assetFileNames: "[name][extname]",
        plugins: [
          // terser()
        ],
        sourcemap: true,
        globals: {
			    global: 'window',
		    }
      }
}


const nonmin={
  ...shared.output,

  dir: "dist/ru/",
  format: "esm",
  exports: "named",
  strict: true,
}

const min={
  ...shared.output,

  dir: "dist/ru_min/",
  format: "esm",
  exports: "named",
  strict: false,
  sourcemap: false,

}
min.plugins=[...min.plugins,terser()]

export default [
  {
    input: "src/index.tsx",
    output: [
      nonmin,
      min,
    ],
    external: [...shared.external,],
    plugins: [...shared.plugins,],
  },
];
