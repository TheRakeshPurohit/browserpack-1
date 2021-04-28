import Bundler from '@bundler';

const bundler = new Bundler({
  files: {
    '/index.js': {
      content: `
        import {hello} from './hello.js';

        hello('Ameer');
      `
    },
    '/hello.js': {
      content: `
        export function hello(message) {
          document.write(\`Hello world from \${message}\`);
        }
      `
    }
  }
});

bundler.bundle().then(() => {
  bundler.run();
});
