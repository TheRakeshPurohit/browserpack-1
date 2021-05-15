const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@hackbox': path.resolve(__dirname, 'src')
    },
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['css', 'javascript', 'typescript', 'html', 'css', 'json']
      })
    ]
  }
};
