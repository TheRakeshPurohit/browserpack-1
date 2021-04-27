import Bundler from '@bundler';

const bundler = new Bundler({
  files: {
    '/index.js': {
      content: `
        import {hello} from './hello.js';

        hello();
      `
    },
    '/hello.js': {
      content: `
        export function hello() {
          console.log('hello world from browserpack');
        }
      `
    }
  }
});

bundler.bundle().then(console.log);
