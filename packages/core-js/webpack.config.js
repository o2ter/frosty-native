const webpack = require('webpack')

module.exports = {
  context: __dirname + '/src',
  entry: './index.mjs',
  mode: 'production',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  }
}