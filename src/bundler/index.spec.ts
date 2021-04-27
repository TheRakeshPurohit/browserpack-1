import Bundler from './';

describe('Sample test', () => {
  const bundler = new Bundler({
    files: {
      '/index.js': {
        content: `
          import {hello} from './hello.js;

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

  it('should generate the right dependencies', async () => {
    const depGraph = await bundler.bundle();
    
    expect(depGraph['/index.js'].dependencies).toEqual(['./hello.js']);
  });
});
