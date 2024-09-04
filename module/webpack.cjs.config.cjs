const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
const path = require("path");

module.exports = merge(baseConfig, {
  output: {
    path: path.resolve(__dirname, "dist", "cjs"),
    filename: "index.cjs.js",
    libraryTarget: "commonjs2",
    library: "FuncNodesReact",
  },
});
