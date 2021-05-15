const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
const rewireBabelLoader = require('craco-babel-loader');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = {
  webpack: {
    alias: {
      '@app': path.resolve(__dirname, 'src'),
      '@common': path.resolve(__dirname, '..', 'common'),
      '@client': path.resolve(__dirname, '..', 'client')
    },
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['css', 'javascript', 'typescript', 'html', 'css', 'json']
      })
    ],
    configure: (webpackConfig) => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) =>
          constructor && constructor.name === 'ModuleScopePlugin'
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);

      return webpackConfig;
    }
  },
  plugins: [
    {
      plugin: rewireBabelLoader,
      options: {
        includes: [resolveApp('../client'), resolveApp('../common')]
      }
    }
  ]
};
