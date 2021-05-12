import Bundler from '.';

describe('Bundler', () => {
  beforeEach(() => {
    expect.hasAssertions();
    const styleTags = document.getElementsByTagName('style');

    // avoid css sideeffects of previous tests
    for (let i = 0; i < styleTags.length; i++) {
      styleTags[i].remove();
    }
  });

  it('should generate the right dependencies', async () => {
    const bundler = new Bundler({
      files: {
        '/index.js': {
          content: `
            import {hello} from './hello';
  
            hello()
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

    const depGraph = await bundler.bundle();

    expect(depGraph['/index.js'].dependencies).toEqual(['./hello']);
  });

  it('should throw error when module is not found', async () => {
    const bundler = new Bundler({
      files: {
        '/index.js': {
          content: `
            import {hello} from './hello.js';
  
            hello()
          `
        }
      }
    });

    try {
      await bundler.bundle();
    } catch (err) {
      expect(err).toEqual(
        new Error(`Cannot find module '/hello.js' from '/index.js'`)
      );
    }
  });

  it('should run the files', async () => {
    const files = {
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
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    expect(document.body.innerHTML).toEqual('Hello world Ameer');
  });

  it('should support css files', async () => {
    const indexCSS = `
      h1 {
        color: red;
      }
    `;
    const files = {
      '/index.css': {
        content: indexCSS
      },
      '/index.js': {
        content: `
          import './index.css';

          document.body.innerHTML = '<h1>Hello World!</h1>';
      `
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    const styleTag = document.head.getElementsByTagName('style')[0];

    expect(styleTag.innerHTML).toEqual(indexCSS);
  });

  it('should support json files', async () => {
    const json = `
      {
        "name": "Ameer",
        "city": "Bangalore"
      }
    `;
    const files = {
      '/person.json': {
        content: json
      },
      '/index.js': {
        content: `
          import {name, city} from './person.json';

          document.body.innerHTML = 'Welcome ' + name +  ' from ' + city;
      `
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    expect(document.body.innerHTML).toEqual('Welcome Ameer from Bangalore');
  });

  it('should throw for invalid json file import', async () => {
    const json = `
      {
        "name": "Ameer",
        "city": "Bangalor
      }
    `;
    const files = {
      '/person.json': {
        content: json
      },
      '/index.js': {
        content: `
          import {name, city} from './person.json';

          document.body.innerHTML = 'Welcome ' + name +  ' from ' + city;
      `
      }
    };
    const bundler = new Bundler({ files });

    try {
      await bundler.bundle();
    } catch (err) {
      expect(err).toEqual(
        new Error(
          `Invalid json module '/person.json' imported from '/index.js'`
        )
      );
    }
  });

  it('should update the files and rerun', async () => {
    const files = {
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
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    expect(document.body.innerHTML).toEqual('Hello world Ameer');

    await bundler.update({
      '/hello/index.js': {
        content: `
          export function hello(message = 'from browserpack') {
            document.body.innerHTML = \`Hello world edited \${message}\`;
          }
        `
      }
    });

    expect(document.body.innerHTML).toEqual('Hello world edited Ameer');
  });

  it('should update the files and rerun for deep dependencies', async () => {
    const files = {
      '/index.js': {
        content: `
          import {hello} from './hello';
          
          hello('Ameer');
      `
      },
      '/hello/index.js': {
        content: `
          import {say} from '../lib';

          export function hello(message = 'from browserpack') {
            say(\`Hello world \${message}\`);
          }
      `
      },
      '/lib/index.js': {
        content: `
          export function say(message) {
            document.body.innerHTML = message;
          }
        `
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    expect(document.body.innerHTML).toEqual('Hello world Ameer');

    await bundler.update({
      '/lib/index.js': {
        content: `
          export function say(message) {
            document.body.innerHTML = 'edited lib';
          }
        `
      }
    });

    expect(document.body.innerHTML).toEqual('edited lib');
  });

  it('should remove css styles when they are not imported anymore', async () => {
    const indexCSS = `
      h1 {
        color: red;
      }
    `;
    const files = {
      '/index.css': {
        content: indexCSS
      },
      '/index.js': {
        content: `
          import './index.css';

          document.body.innerHTML = '<h1>Hello World!</h1>';
      `
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    const styleTag = document.head.getElementsByTagName('style')[0];

    expect(styleTag.innerHTML).toEqual(indexCSS);

    bundler.update({
      '/index.js': {
        content: `
          document.body.innerHTML = '<h1>Hello World!</h1>';
        `
      }
    });

    expect(document.head.getElementsByTagName('style')[0].innerHTML).toEqual(
      ''
    );
  });
});
