// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const BundleAnalyzerPlugin =
//   require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  context: __dirname,
  entry: "./src/index.tsx",
  target: "web",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].js",
  },

  // mode: "production",
  mode: "development",
  module: {
    rules: [
      //typescript
      {
        test: /\.(tsx|ts)$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.json",
            },
          },
        ],
        exclude: /node_modules/,
      },
      //css
      {
        test: /\.css$/,
        use: [
          // "style-loader",
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { importLoaders: 5 } },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("autoprefixer"), require("cssnano")],
              },
            },
          },
        ],
        sideEffects: true,
      },
      //javascript
      {
        test: /\.js$/,
        use: "babel-loader",
      },
      //scss
      {
        test: /\.scss$/,
        sideEffects: true,
        use: [
          MiniCssExtractPlugin.loader,
          // "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 5,
              url: true, // Ensure CSS loader handles URL() paths
            },
          },

          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("autoprefixer"), require("cssnano")],
              },
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
    ],
  },

  devServer: {
    static: "./public",
    historyApiFallback: true,

    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (
            error.message ===
            "ResizeObserver loop completed with undelivered notifications."
          ) {
            return false;
          }
          return true;
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "css/style.css",
      chunkFilename: "css/[name].css",
    }),

    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    // new BundleAnalyzerPlugin(),
  ],
  resolve: {
    extensions: [
      ".js",
      ".jsx",
      ".tsx",
      ".ts",
      ".html",
      ".scss",
      ".css",
      ".ttf",
    ],
    alias: {
      //Modules: path.resolve(__dirname, "..", "node_modules"),
      "@linkdlab/funcnodes_react_flow": path.resolve(
        __dirname,
        "../module/dist/esm/index.esm.js"
      ),
      //   react: require.resolve("react"), // Ensure we use the same React instance
      //   "react-dom": require.resolve("react-dom"), // Ensure we use the same ReactDom instance
    },
    mainFields: ["module", "main"], // Prefers 'module' over 'main' for ES modules
  },

  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
