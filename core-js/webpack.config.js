const webpack = require('webpack')

module.exports = {
  context: __dirname + "/src",
  entry: "./index.mjs",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  }
}