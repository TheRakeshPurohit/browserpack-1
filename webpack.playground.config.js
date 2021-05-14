const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv').config();
const webpack = require('webpack');

const isDev = process.env.NODE_ENV === 'development';
const htmlTemplatePath = path.resolve(__dirname, 'playground', 'index.html');
const distDir = path.join(__dirname, 'playground', 'dist');
const devServerPort = process.env.PORT || 3000;

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: './playground/index.ts',
  devServer: {
    contentBase: distDir,
    compress: true,
    port: devServerPort,
    writeToDisk: true
  },
  devtool: isDev && 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@bundler': path.resolve(__dirname, 'bundler/index.ts'),
      '@common': path.resolve(__dirname, 'common'),
      '@client': path.resolve(__dirname, 'client')
    }
  },
  output: {
    path: distDir,
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    clean: true
  },
  plugins: [
    new NodePolyfillPlugin(),
    new HtmlWebpackPlugin({
      template: htmlTemplatePath
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed)
    })
  ]
};
