const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const TerserPlugin = require('terser-webpack-plugin')
const FlowWebpackPlugin = require('flowtype-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const webpack = require('webpack')
const packageJson = require('./package.json')
const namespace = 'adjust-sdk'
const version = packageJson.version

module.exports = () => ({
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'demo'),
    filename: '[name].js'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true
      }),
      new CssMinimizerPlugin()
    ]
  },
  plugins: [
    new ESLintPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html')
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new webpack.DefinePlugin({
      __ADJUST__NAMESPACE: JSON.stringify(namespace),
      __ADJUST__SDK_VERSION: JSON.stringify(version)
    }),
    new FlowWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [{
      test: /\.(js|ts)$/,
      exclude: /node_modules/,
      use: 'babel-loader'
    }, {
      test: /\.s?css$/,
      exclude: /\.module\.s?css$/,
      use: [
        MiniCssExtractPlugin.loader,
        { loader: 'css-loader', },
        { loader: 'sass-loader' }
      ]
    }, {
      test: /\.html$/,
      use: [
        {
          loader: 'html-loader',
          options: {
            minimize: true,
          }
        },
        {
          loader: 'template-ejs-loader'
        }
      ]
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      type: 'asset/resource'
    }]
  }
})
