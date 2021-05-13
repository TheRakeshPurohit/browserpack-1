import { getFileExtension } from './utils';

describe('common utils', () => {
  describe('getFileExtension()', () => {
    it('should return the file extension', () => {
      expect(getFileExtension('hello.test.js')).toEqual('js');
    });

    it('should return empty string when there is no extension', () => {
      expect(getFileExtension('hello')).toEqual('');
    });
  });
});
