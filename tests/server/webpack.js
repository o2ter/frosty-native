/* eslint no-var: 0 */

const _ = require('lodash');
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {

  const babelLoaderConfiguration = ({ server }) => ({
    test: /\.(ts|tsx|m?js)?$/i,
    use: {
      loader: 'babel-loader',
      options: {
        compact: false,
        cacheDirectory: true,
        configFile: false,
        presets: [
          ['@babel/preset-env', {
            exclude: [
              '@babel/plugin-transform-regenerator',
              '@babel/plugin-transform-async-generator-functions',
              '@babel/plugin-transform-async-to-generator',
            ],
            targets: server ? { node: 'current' } : 'defaults',
          }],
          [
            "@babel/preset-react",
            {
              runtime: 'automatic',
              importSource: 'frosty',
            }
          ],
          '@babel/preset-typescript',
        ]
      },
    },
    resolve: {
      fullySpecified: false,
    },
  });

  const webpackConfiguration = {
    mode: false ? 'production' : 'development',
    devtool: false ? false : 'cheap-module-source-map',
    experiments: {
      topLevelAwait: true,
    },
    optimization: {
      minimize: false
    },
  };

  const webpackPlugins = [
    new Dotenv({ path: path.join(process.cwd(), '.env') }),
    new Dotenv({ path: path.join(process.cwd(), '.env.local') }),
  ];

  const moduleSuffixes = {
    client: ['.browser', '.web', ''],
    server: ['.node', '.server', '.web', ''],
  };

  return [
    {
      ...webpackConfiguration,
      plugins: webpackPlugins,
      entry: {
        main_bundle: [
          'core-js/stable',
          path.resolve(__dirname, './main/index.tsx'),
        ],
      },
      output: {
        path: path.join(__dirname, 'dist/public'),
      },
      resolve: {
        ...webpackConfiguration.resolve,
        extensions: [
          ...moduleSuffixes.client.flatMap(x => [`${x}.tsx`, `${x}.jsx`]),
          ...moduleSuffixes.client.flatMap(x => [`${x}.ts`, `${x}.mjs`, `${x}.js`]),
          '...'
        ],
      },
      module: {
        rules: [
          babelLoaderConfiguration({ server: false }),
        ]
      }
    },
    {
      ...webpackConfiguration,
      target: 'node',
      plugins: webpackPlugins,
      entry: {
        server: [
          'core-js/stable',
          path.resolve(__dirname, './index.tsx'),
        ],
      },
      output: {
        path: path.resolve(__dirname, 'dist'),
      },
      resolve: {
        ...webpackConfiguration.resolve,
        extensions: [
          ...moduleSuffixes.server.flatMap(x => [`${x}.tsx`, `${x}.jsx`]),
          ...moduleSuffixes.server.flatMap(x => [`${x}.ts`, `${x}.mjs`, `${x}.js`]),
          '...'
        ],
      },
      module: {
        rules: [
          babelLoaderConfiguration({ server: true }),
          {
            test: /\.node$/,
            use: {
              loader: 'node-loader',
              options: {
                name: '[name].[contenthash].[ext]',
              }
            }
          },
        ]
      },
      performance: {
        hints: false,
      }
    }
  ];
};
