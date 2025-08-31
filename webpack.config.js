const path = require("path")
const fs = require("fs")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackInlineSVGPlugin = require("html-webpack-inline-svg-plugin")

const package = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"))
)

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "build"),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new HtmlWebpackInlineSVGPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./src/icons/icon-128.png", to: "icon-128.png" },
        { from: "./src/icons/icon-48.png", to: "icon-48.png" },
        { from: "./src/icons/icon-16.png", to: "icon-16.png" },
        {
          from: "./src/manifest.json",
          transform: (content, path) => {
            return Buffer.from(
              JSON.stringify({
                description: package.description,
                version: package.version,
                ...JSON.parse(content.toString()),
              })
            )
          },
        },
      ],
    }),
    new MiniCssExtractPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.m?js$/,
        include: path.resolve(__dirname, "src"),
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  // https://stackoverflow.com/questions/61462586
  devtool: process.env.NODE_ENV === "development" ? "inline-source-map" : false,
}
