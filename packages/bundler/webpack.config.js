
const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const appConfig = require(path.resolve(process.cwd(), 'app.config.js'));

module.exports = (env, argv) => {

  const { PLATFORM, ENTRY_FILE, OUTPUT_DIR } = env;

  const config = _.isFunction(appConfig) ? appConfig(env, argv) : appConfig;
  const IS_PRODUCTION = argv.mode !== 'development';

  const babelLoaderConfiguration = () => ({
    test: /\.(ts|tsx|m?js)?$/i,
    use: {
      loader: 'babel-loader',
      options: {
        compact: IS_PRODUCTION,
        cacheDirectory: true,
        configFile: false,
        presets: [
          '@babel/preset-flow',
          ['@babel/preset-env', {
            exclude: [
              '@babel/plugin-transform-regenerator',
              '@babel/plugin-transform-async-generator-functions',
              '@babel/plugin-transform-async-to-generator',
            ],
            targets: 'defaults',
          }],
          [
            "@babel/preset-react",
            {
              runtime: 'automatic',
              importSource: 'frosty',
            }
          ],
          '@babel/preset-typescript',
        ],
      },
    },
    resolve: {
      fullySpecified: false,
    },
  });

  const imageLoaderConfiguration = () => ({
    test: /\.(gif|jpe?g|a?png|svg)$/i,
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[contenthash].[ext]',
        publicPath: '/images',
        outputPath: '/images',
      }
    }
  });

  const fontLoaderConfiguration = () => ({
    test: /\.ttf$/i,
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[contenthash].[ext]',
        publicPath: '/fonts',
        outputPath: '/fonts',
      }
    }
  });

  const webpackOptimization = () => ({
    minimize: IS_PRODUCTION,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          sourceMap: false,
          compress: true,
          format: {
            comments: !IS_PRODUCTION,
          },
        },
      }),
    ],
  });

  const webpackConfiguration = {
    mode: IS_PRODUCTION ? 'production' : 'development',
    devtool: IS_PRODUCTION ? false : 'cheap-module-source-map',
    experiments: {
      topLevelAwait: true,
    },
    resolve: {
      ...config.options?.resolve ?? {},
      alias: {
        ...config.options?.resolve?.alias ?? {},
      },
    },
    externals: config.options?.externals,
  };

  const webpackPlugins = [
    new webpack.DefinePlugin({ __DEV__: JSON.stringify(!IS_PRODUCTION) }),
    new webpack.ProvidePlugin({
      _: 'lodash',
    }),
    ...config.options?.plugins ?? [],
  ];

  const moduleSuffixes = {
    android: config.moduleSuffixes?.android ?? ['.android', '.native', ''],
    apple: config.moduleSuffixes?.apple ?? ['.apple', '.native', ''],
    web: config.moduleSuffixes?.web ?? ['.browser', '.web', ''],
  };

  return [
    {
      ...webpackConfiguration,
      optimization: webpackOptimization(),
      plugins: _.compact([
        ...webpackPlugins,
        ...config.options?.plugins ?? [],
        config.assets && new CopyPlugin({ patterns: config.assets }),
      ]),
      entry: {
        jsbundle: [
          'core-js/full',
          path.resolve(process.cwd(), ENTRY_FILE),
        ],
      },
      output: {
        path: OUTPUT_DIR,
      },
      resolve: {
        ...webpackConfiguration.resolve,
        extensions: [
          ...moduleSuffixes[PLATFORM].flatMap(x => [`${x}.tsx`, `${x}.jsx`]),
          ...moduleSuffixes[PLATFORM].flatMap(x => [`${x}.ts`, `${x}.mjs`, `${x}.js`]),
          '...'
        ],
      },
      module: {
        rules: [
          babelLoaderConfiguration(),
          imageLoaderConfiguration(),
          fontLoaderConfiguration(),
          {
            test: /\.node$/,
            use: {
              loader: 'node-loader',
              options: {
                name: '[name].[contenthash].[ext]',
              }
            }
          },
          ...config.options?.module?.rules ?? [],
        ]
      },
      performance: {
        hints: false,
      }
    }
  ];
};
