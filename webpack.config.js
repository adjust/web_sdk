/* eslint-disable */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const webpack = require('webpack')

module.exports = {
  output: {
    path: path.resolve(__dirname, 'example'),
    filename: '[name].js'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html')
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
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
            "@babel/preset-env"
          ]
        }
      }
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
          loader: "html-loader",
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
}
