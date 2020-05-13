const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const FlowWebpackPlugin = require('flow-webpack-plugin')
const packageJson = require('./package.json')
const namespace = 'adjust-sdk'
const version = packageJson.version

module.exports = () => ({
  mode: 'production',
  entry: {
    'adjust-latest': path.resolve(__dirname, 'src/sdk/main.js'),
    'adjust-latest.min': path.resolve(__dirname, 'src/sdk/main.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'Adjust',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      include: /\.min\.js$/
    })]
  },
  plugins: [
    new webpack.DefinePlugin({
      __ADJUST__NAMESPACE: JSON.stringify(namespace),
      __ADJUST__SDK_VERSION: JSON.stringify(version)
    }),
    new FlowWebpackPlugin()
  ],
  module: {
    rules: [{
      use: 'eslint-loader',
      test: /\.js$/,
      enforce: 'pre',
      exclude: /node_modules/
    }, {
      use: 'babel-loader',
      test: /\.js$/,
      exclude: /node_modules/
    }]
  }
})
