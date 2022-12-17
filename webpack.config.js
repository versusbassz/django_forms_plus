const path = require('path');
const webpack = require('webpack');

// eslint-disable-next-line no-unused-vars
module.exports = (env, argv) => {
  const PREFIX = 'DFP'
  const isModeProduction = argv.mode === 'production';

  const mode = isModeProduction ? 'production' : 'development';
  if (! argv.profile) {
    console.log(`[${PREFIX}] Webpack mode = ${mode}`);
  }

  // Devtool
  const sourceMaps = isModeProduction ? 'source-map' : 'inline-source-map';

  // Plugins
  const plugins = [];

  const entry = isModeProduction ? 'dist' : 'dev'

  return {
    mode,
    entry: `./front/src/${entry}.js`,
    output: {
      filename: 'dfp.build.js',
      path: path.resolve(__dirname, './django_forms_plus/static/django_forms_plus'),
      clean: true,
    },
    devtool: sourceMaps,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: '/node_modules/',
          include: [
            path.resolve(__dirname, 'front/src'),
          ],
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    externals: {},
    plugins,
  };
};
