const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const htmlTemplatePath = path.resolve(__dirname, 'preview', 'index.html');

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: './preview/index.ts',
  performance: {
    maxAssetSize: 5e6
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
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
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@bundler': path.resolve(__dirname, 'bundler/index.ts')
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    clean: true
  },
  plugins: [
    new NodePolyfillPlugin(),
    new HtmlWebpackPlugin({
      template: htmlTemplatePath
    })
  ]
};
