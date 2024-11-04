// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  context: __dirname,
  entry: "./src/index.tsx",
  target: "web",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "static/js/[name].js",
    chunkFilename: "static/js/[name].[contenthash].js", // Ensure consistent naming for chunks
    publicPath: "auto", // Add this line
  },

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
    static: [
      {
        directory: path.resolve(__dirname, "public"),
        publicPath: "/static",
      },
      {
        directory: path.resolve(__dirname, "public"),
        publicPath: "/",
      },
    ],
    historyApiFallback: true,
    headers: {
      "Cache-Control": "no-store", // Disable caching in development
    },
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
      filename: "static/css/style.css",
      chunkFilename: "static/css/[name].css",
    }),

    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
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
      "@linkdlab/funcnodes_react_flow": path.resolve(
        __dirname,
        "../module/dist/esm/index.esm.js"
      ),
    },
    mainFields: ["module", "main"], // Prefers 'module' over 'main' for ES modules
  },

  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
