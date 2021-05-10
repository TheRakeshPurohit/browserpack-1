import Bundler from '@bundler';

const bundler = new Bundler({
  files: {
    '/index.css': {
      content: `
        h1 {
          color: red;
        }
      `
    },
    '/index.js': {
      content: `
        import {hello} from './hello.js';
        import './index.css';

        hello('Ameer');
      `
    },
    '/hello.js': {
      content: `
        export function hello(message) {
          document.getElementById('root').innerHTML = \`<h1>Hello world from \${message}!</h1>\`;
        }
      `
    }
  }
});

bundler.bundle().then(() => {
  bundler.run();
});
