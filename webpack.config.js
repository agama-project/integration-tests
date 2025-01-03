/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

const plugins = [
  new webpack.SourceMapDevToolPlugin({
    filename: "[file].map",
    // skip the source maps for the vendor.js bundle, it is huge and in most cases (all?) we do
    // not need detailed backtrace in the puppeteer sources and its dependencies
    exclude: "vendor.js",
  }),
  // ignore the webpack warnings about the dynamic imports in yargs module,
  // it is used in the browser download code in puppeteer which is never used
  // by the integration tests as we use the system browser
  new webpack.ContextReplacementPlugin(/\/(yargs|yargs-parser)\//, (data) => {
    data.dependencies.forEach((d) => delete d.critical);
    return data;
  }),
  // prepend a hashbang at the beginning of the generated file
  new webpack.BannerPlugin({ banner: "#! /usr/bin/env node", raw: true, test: /^test_.*\.js$/ }),
  // make the test JS files executable
  function () {
    this.hooks.done.tap("Change permissions", (data) => {
      Object.keys(data.compilation.assets).forEach((file) => {
        if (file.match(/^test_.*\.js$/)) {
          fs.chmodSync(path.join(__dirname, "dist", file), 0o755);
        }
      });
    });
  },
];

// for some reason the ESlint installation fails when building the RPM package in OBS,
// as a workaround make the dependency optional and omit it in OBS,
// linting during RPM package build is pointless anyway
try {
  const ESLintPlugin = require("eslint-webpack-plugin");

  if (process.env.ESLINT !== "0")
    plugins.push(
      new ESLintPlugin({
        configType: "flat",
        extensions: ["js", "jsx", "ts", "tsx"],
        failOnWarning: true,
      }),
    );
} catch (error) {
  if (error.code === "MODULE_NOT_FOUND") {
    // require() failed
    console.log("Cannot initialize ESlint, skipping the ESlint checks");
  } else {
    // some other unexpected error, just print it and exit
    console.log(error);
    process.exit(1);
  }
}

// process all ./src/test_*.ts files
const entry = {};
fs.readdirSync("./src")
  .filter((f) => f.startsWith("test_") && f.endsWith(".ts"))
  .forEach((f) => {
    entry[path.basename(f, ".ts")] = "./src/" + f;
  });

module.exports = {
  target: "node",
  entry,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  // source maps are configured using the SourceMapDevToolPlugin below
  devtool: false,
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
        },
      },
    },
  },
  watchOptions: {
    // wait a little bit when saving multiple files
    aggregateTimeout: 100,
    ignored: /node_modules/,
  },
  plugins,
};
