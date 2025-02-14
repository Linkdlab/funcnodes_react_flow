// webpack.config.esm.js
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
const path = require("path");

module.exports = merge(baseConfig, {
  output: {
    path: path.resolve(__dirname, "dist", "esm"),
    filename: "index.esm.js",
    libraryTarget: "module",
  },
  experiments: {
    outputModule: true,
  },
  // Add this to ensure externals are treated as ESM imports:
  externalsType: "module",
});
