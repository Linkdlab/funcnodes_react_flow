
import scssloader from "rollup-plugin-scss";
// import sassloader from 'rollup-plugin-sass';
import json from '@rollup/plugin-json';
import resolve from "@rollup/plugin-node-resolve";
// import postcss from 'rollup-plugin-postcss'
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import alias from "@rollup/plugin-alias";
import { terser } from "rollup-plugin-terser";
import nodePolyfills from 'rollup-plugin-node-polyfills';
import typescript from '@rollup/plugin-typescript';
import pkg from "./package.json"  with { type: "json" };
import * as sass from "sass";
import path from "path";
import { dts } from "rollup-plugin-dts";
import replace from '@rollup/plugin-replace';
import copy from "rollup-plugin-copy";

const production = !process.env.ROLLUP_WATCH;
const peers = Object.keys(pkg.peerDependencies || {});

const moduleConfig = {
  input: "src/index.tsx",
  external: peers ,
  onwarn(warning, warn) {
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
      return
    }
    warn(warning)
  },
  plugins: [typescript({
    resolveJsonModule: true,
    compilerOptions: { declaration: false }
}),
    alias({
      entries: [
      ],
    }),
    commonjs({
    }),
    resolve({browser: true,}),
    json(),
    // scssloader({
    //   fileName: "style.css",
    //   sass: sass,
    // }),
    // sassloader({
    //   api: 'modern'
    // }),
    nodePolyfills(),

    babel({
      babelHelpers: 'bundled',
      presets: ["@babel/preset-react",{
        "runtime": "automatic"
      }] ,
      exclude: /node_modules/,

    }),

    production&&terser(),
  ],

  output: [
    {file: path.resolve(__dirname, pkg.module),
      format: "esm",
      sourcemap: true,
      assetFileNames: "[name][extname]",
    },
    {
      file:  path.resolve(__dirname,pkg.main),
      format: "cjs",
      exports: "named",
      strict: false,
      sourcemap: true,
      assetFileNames: "[name][extname]",
    },
  ]

}

const styleConfig = {
  input: "src/index.scss",
  plugins: [
      scssloader({
        fileName: "style.css",
        sass: sass,
        outputStyle: production?"compressed":undefined,
      }),
      production &&
      copy({
        targets: [
          {
            src: "public/style.css",
            dest: "../funcnodes_react_flow/static/css",
          },
        ],
        hook: "writeBundle",
      }),
  ].filter(Boolean),
  output:[
    {
      file: path.resolve(__dirname, pkg.style),
      sourcemap: false,

    },
    {
      file: path.resolve(__dirname, "public","style.css"),
      sourcemap: false,

    },
  ]
}

const dtsConfig={
  input: moduleConfig.input,
  output: [{ file: path.resolve(__dirname, pkg.types), format: "es" }],
  external: [/\.scss$/,"react", "react-dom"],
  plugins: [dts()],
};


const bundleConfig={
  ...moduleConfig,
  external: [],
  input: "src/browser_index.tsx",
  plugins: [
    ...moduleConfig.plugins,
    replace({
      'process.env.NODE_ENV': production ? JSON.stringify('production') : JSON.stringify('development'),
      'global': 'window',
      preventAssignment: true,
    }),
    production &&
      copy({
        targets: [
          {
            src: "public/index.js",
            dest: "../funcnodes_react_flow/static/js",
          },
          {
            src: "public/index.js.map",
            dest: "../funcnodes_react_flow/static/js",
          },
        ],
        hook: "writeBundle",
      }),
  ].filter(Boolean),

  output: [
    {
      banner: 'var global = window;',
      file: path.resolve(__dirname, "public","index.js"),
      format: "iife",
      sourcemap: true,
      assetFileNames: "[name][extname]",
    },
  ],
}

export default [
  bundleConfig,
  styleConfig,
  dtsConfig,
  moduleConfig,

];
