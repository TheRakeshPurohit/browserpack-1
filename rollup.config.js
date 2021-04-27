import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';
import tsConfigPaths from 'rollup-plugin-ts-paths';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import cleaner from 'rollup-plugin-cleaner';
import htmlPlugin from './lib/html-plugin';
import webWorkerPlugin from './lib/web-worker-plugin';
import jsonPlugin from '@rollup/plugin-json';
import builtinsPlugin from 'rollup-plugin-node-builtins';
import nodeGlobalsPlugin from 'rollup-plugin-node-globals';

const outputDir = 'dist';
const extensions = [
  '.js', '.jsx', '.ts', '.tsx',
];

const plugins = [
  resolve({ extensions, preferBuiltins: true, browser: true }),
  commonjs({
    include: ["node_modules/**"]
  }),
  builtinsPlugin(),
  nodeGlobalsPlugin(),
  typescript(),
  tsConfigPaths(),
  htmlPlugin(),
  jsonPlugin(),
  cleaner({
    targets: [
      outputDir
    ]
  }),
  webWorkerPlugin()
];
const isDev = process.env.NODE_ENV === 'development';

// dev only plugins
if (isDev) {
  plugins.push(...[
    serve({
      contentBase: outputDir,
      port: process.env.PORT || 3000
    })
  ])
}

const rollupConfig = {
  input: './src/preview/index.ts',
  output: {
    sourcemap: true,
    format: 'cjs',
    dir: outputDir
  },
  onwarn: function (message) {
    if (message.code === 'CIRCULAR_DEPENDENCY') return;
    
    console.error(message);
  },
  plugins
}

export default rollupConfig;
