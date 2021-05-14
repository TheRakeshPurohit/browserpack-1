import Browserpack from '@client';
import { Files } from '@common/api';

const files: Files = {
  '/index.js': {
    content: `
      import {hello} from './hello';
      
      hello('Ameer');
  `
  },
  '/hello/index.js': {
    content: `
      export function hello(message = 'from browserpack') {
        document.body.innerHTML = \`Hello world \${message}\`;
      }
  `
  }
};

const browserpack = new Browserpack('#preview', files);

browserpack.onReady(async () => {
  await browserpack.bundle();

  browserpack.run();

  setTimeout(() => {
    browserpack.patch({
      '/hello/index.js': {
        content: `
          export function hello(message = 'from browserpack') {
            document.body.innerHTML = \`Hello world edited \${message}\`;
          }
      `
      }
    });
  }, 5000);
});
