const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const FlowWebpackPlugin = require('flow-webpack-plugin')
const webpack = require('webpack')

module.exports = (env, argv) => ({
  devServer: {
    host: '0.0.0.0'
  },
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'demo'),
    filename: '[name].js'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html')
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new webpack.DefinePlugin({
      __ADJUST__NAMESPACE: JSON.stringify(require('./package.json').name),
      __ADJUST__SDK_VERSION: JSON.stringify(require('./package.json').version),
      __ADJUST__ENV: JSON.stringify(argv && argv.mode || 'production')
    }),
    new FlowWebpackPlugin()
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
      use: 'babel-loader'
    }, {
      test: /(\.css|\.scss)$/,
      use: [
        MiniCssExtractPlugin.loader,
        {loader: 'css-loader'},
        {loader: 'sass-loader'}
      ]
    }, {
      test: /\.html$/,
      use: [
        {
          loader: 'html-loader',
          options: {
            minimize: true,
            interpolate: true
          }
        }
      ]
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: 'assets/images/[hash].[ext]'
          }
        }
      ]
    }]
  }
})
