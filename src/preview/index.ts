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
    '/static/person.json': {
      content: `
        {
          "name": "Ameer Jhan"
        }
      `
    },
    '/index.js': {
      content: `
        import {hello} from './hello.js';
        import person from './static/person.json';
        import './index.css';

        hello(person.name);
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

(async () => {
  await bundler.bundle();

  bundler.run();

  setTimeout(async () => {
    await bundler.update({
      '/index.js': {
        content: `
          import {hello} from './hello.js';
          import person from './static/person.json';

          hello(person.name);
        `
      }
    });

    console.log('done');
  }, 2000);
})();
