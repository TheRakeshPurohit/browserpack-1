const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDev? 'development': 'production',
  entry: './src/preview/index.ts',
  performance: {
    maxAssetSize: 5e+6,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" },
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@bundler': path.resolve(__dirname, 'src/bundler/index.ts')
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
};
