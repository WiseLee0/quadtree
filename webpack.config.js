const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "index_bundle.js",
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "./index.html"),
    }),
    new CopyPlugin({
      patterns: [
        { from: 'node_modules/canvaskit-wasm/bin/canvaskit.wasm' }
      ],
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /.(jsx?)|(tsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets:
                    "iOS 9, Android 4.4, last 2 versions, > 0.2%, not dead", // 根据项目去配置
                  useBuiltIns: "usage", // 会根据配置的目标环境找出需要的polyfill进行部分引入
                  corejs: 3, // 使用 core-js@3 版本
                },
              ],
              ["@babel/preset-typescript"],
              ["@babel/preset-react"],
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".mjs", ".js", ".json", ".jsx", ".ts", ".tsx"],
    fallback: {
      path: require.resolve("path-browserify"),
      fs: false
    }
  },
  mode: "development",
  cache: {
    type: 'filesystem',
  },
  target: 'web',
  devServer: {
    client: {
      logging: "verbose",
      progress: true,
    },
    host: "localhost",
    port: "3000",
    hot: true,
    // liveReload: false,
  },
  stats: "normal",
};
