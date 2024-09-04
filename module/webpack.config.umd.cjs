// webpack.config.umd.js
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
const path = require("path");

module.exports = merge(baseConfig, {
  output: {
    path: path.resolve(__dirname, "dist", "umd"),
    filename: "index.umd.js",
    library: {
      name: "FuncNodesReact", // The global variable name used if the library is included via a script tag
      type: "umd",
    },
    globalObject: "this", // This ensures compatibility with both browser and Node.js environments
  },
});
