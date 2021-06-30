const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const FlowWebpackPlugin = require('flow-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const webpack = require('webpack')
const loaderUtils = require('loader-utils')
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
      enforce: 'pre',
      test: /\.(js|ts)$/,
      exclude: /node_modules/,
      use: 'eslint-loader'
    }, {
      test: /\.(js|ts)$/,
      exclude: /node_modules/,
      use: 'babel-loader'
    }, {
      test: /(\.css|\.scss)$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            modules: true,
            getLocalIdent: (loaderContext, localIdentName, localName, options) => {
              if (!loaderContext.resourcePath.includes('smart-banner') > 0) {
                return localName
              }

              if (!options.context) {
                // eslint-disable-next-line no-param-reassign
                options.context = loaderContext.rootContext;
              }

              const request = path
                .relative(options.context, loaderContext.resourcePath)
                .replace(/\\/g, '/');

              // eslint-disable-next-line no-param-reassign
              options.content = `${options.hashPrefix + request}+${localName}`;

              // eslint-disable-next-line no-param-reassign
              localIdentName = localIdentName.replace(/\[local\]/gi, localName);

              const hash = loaderUtils.interpolateName(
                loaderContext,
                localIdentName,
                options
              );

              return hash
                .replace(new RegExp('[^a-zA-Z0-9\\-_\u00A0-\uFFFF]', 'g'), '-')
                .replace(/^((-?[0-9])|--)/, '_$1');
            }
          },
        },
        { loader: 'sass-loader' }
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
