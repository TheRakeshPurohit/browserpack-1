import Bundler from './';

describe('Sample test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    console.info = jest.fn();

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
            console.info(\`Hello world \${message}\`);
          }
      `
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    expect(console.info).toHaveBeenCalledWith('Hello world Ameer');
  });
});
