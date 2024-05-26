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

  // Paths
  const srcPath = path.resolve(__dirname, 'front/src');

  return {
    mode,
    entry: `./front/src/${entry}.tsx`,
    output: {
      filename: 'dfp.build.js',
      path: path.resolve(__dirname, './django_forms_plus/static/django_forms_plus'),
      clean: true,
    },
    devtool: sourceMaps,
    resolve: {
      // see https://webpack.js.org/configuration/resolve/#resolveextensions
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: '/node_modules/',
          include: [srcPath],
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
