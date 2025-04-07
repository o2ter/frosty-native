
const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => ({
  options: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src/'),
      },
    },
  },
})