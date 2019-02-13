/* eslint-disable */
const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: {
    sdk: path.resolve(__dirname, 'src/sdk/main.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'adjustSDK',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  plugins: [
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(require('./package.json').version),
      IS_TEST: false
    })
  ],
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      use: 'eslint-loader'
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env'
          ]
        }
      }
    }]
  }
}
