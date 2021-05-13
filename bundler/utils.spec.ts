import { resolveFile } from '../common/resolver';

describe('bundler utils', () => {
  describe('resolveDependency()', () => {
    it('should check for absolute path', () => {
      const files = {
        '/hello.js': {
          content: `console.log('hello');`
        }
      };

      expect(resolveFile(files, '/hello.js')).toEqual('/hello.js');
    });

    it('should check with default extension', () => {
      const files = {
        '/hello.js': {
          content: `console.log('hello');`
        },
        '/test.ts': {
          content: `console.log('im ts')`
        }
      };

      expect(resolveFile(files, '/hello')).toEqual('/hello.js');
      expect(resolveFile(files, '/test')).toEqual('/test.ts');
    });

    it('should check for index.js in the folder name', () => {
      const files = {
        '/hello/index.js': {
          content: `console.log('hello');`
        }
      };

      expect(resolveFile(files, '/hello')).toEqual('/hello/index.js');
    });

    it('should respect package.json', () => {
      const files = {
        '/react/dist/index.js': {
          content: `console.log('hello');`
        },
        '/react/package.json': {
          content: `{
            "main": "dist/index.js"
          }`
        }
      };

      expect(resolveFile(files, '/react')).toEqual('/react/dist/index.js');
    });

    it('should throw when module is not found', () => {
      const files = {
        'hello.js': {
          content: `console.log('hello');`
        }
      };

      expect(resolveFile(files, '/notfound.js')).toBeNull();
    });
  });
});
