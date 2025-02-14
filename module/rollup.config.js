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


const shared = {
    input: "src/index.tsx",
    plugins: [typescript({
        resolveJsonModule: true,
        compilerOptions: { declaration: false }
    }),
        alias({
          entries: [
            { find: "hooks", replacement: "./hooks" },
            { find: "components", replacement: "./components" },
            { find: "renderProps", replacement: "./renderProps" },
          ],
        }),
        resolve({browser: true,}),
        json(),
        css(),
        sass({api:"modern",
       //   insert: true
        }),
        nodePolyfills(),
        babel({
          babelHelpers: 'bundled',
          exclude: "../node_modules/**",
        }),
        commonjs(),
      ],
      external: ["react", "react-dom"],
      output:{
        // banner: "'use client';",
        plugins: [
          // terser()
        ],
        sourcemap: true,
      },

      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      }
}

export default [
  {
    input: shared.input,
    output: [
      {
        ...shared.output,
        file: pkg.main,
        format: "cjs",
        exports: "named",
        strict: false,
      },
      // {
      //   ...shared.output,
      //   file: pkg.main_min,
      //   format: "cjs",
      //   exports: "named",
      //   strict: false,
      // },
    ],
    external: [...shared.external,],
    plugins: [...shared.plugins,],
    onwarn:shared.onwarn,
  },
  {
    input: shared.input,
    output: [
      {
        ...shared.output,
        file: pkg.module,
        format: "esm",
      },
    ],
    external: [...shared.external,],
    plugins: [

        ...shared.plugins,
    ],
    onwarn:shared.onwarn,
  },
];
