import { Files } from './api';
import { resolveFile } from './resolver';

describe('resolver', () => {
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

    it('should resolve npm packages', () => {
      const files: Files = {
        '/node_modules/react/index.js': {
          content: `module.exports = {}`
        }
      };

      expect(resolveFile(files, 'react', '/hello.js')).toEqual(
        '/node_modules/react/index.js'
      );
    });

    it('should resolve npm packages', () => {
      const files: Files = {
        '/node_modules/react/node_modules/object-assign/index.js': {
          content: `module.exports = {}`
        },
        '/node_modules/react/package.json': {
          content: `{
            "dependencies": { "object-assign": "latest" }
          }`
        }
      };

      expect(
        resolveFile(files, 'object-assign', '/node_modules/react/index.js')
      ).toEqual('/node_modules/react/node_modules/object-assign/index.js');
    });
  });
});
