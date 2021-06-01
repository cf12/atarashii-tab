const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "build"),
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new CopyWebpackPlugin({
      patterns: [{ from: "./src/manifest.json" }],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
}
