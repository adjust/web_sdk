const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const FlowWebpackPlugin = require('flow-webpack-plugin')

module.exports = () => ({
  mode: 'production',
  entry: {
    'sdk': path.resolve(__dirname, 'src/sdk/main.js'),
    'sdk.min': path.resolve(__dirname, 'src/sdk/main.js')
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
      __ADJUST__NAMESPACE: JSON.stringify(require('./package.json').name),
      __ADJUST__SDK_VERSION: JSON.stringify(require('./package.json').version)
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
