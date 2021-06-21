const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv').config();
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV === 'development';
const htmlTemplatePath = path.resolve(__dirname, 'index.html');
const distDir = path.join(__dirname, 'dist');
const devServerPort = process.env.PORT || 3000;

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: './playground/index.tsx',
  context: path.resolve(__dirname, '..'),
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
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@bundler': path.resolve(__dirname, '..', 'bundler/index.ts'),
      '@common': path.resolve(__dirname, '..', 'common'),
      '@client': path.resolve(__dirname, '..', 'client')
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
    }),
    new MiniCssExtractPlugin()
  ]
};
