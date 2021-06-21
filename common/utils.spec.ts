import { getFileExtension, isExternalDep } from './utils';

describe('common utils', () => {
  describe('getFileExtension()', () => {
    it('should return the file extension', () => {
      expect(getFileExtension('hello.test.js')).toEqual('js');
    });

    it('should return empty string when there is no extension', () => {
      expect(getFileExtension('hello')).toEqual('');
    });
  });

  describe('isExternalDep()', () => {
    it('should detect internal dependencies', () => {
      expect(isExternalDep('../hello')).toBeFalsy();
      expect(isExternalDep('./hello')).toBeFalsy();
      expect(isExternalDep('/hello')).toBeFalsy();
    });

    it('should detect external dependencies', () => {
      expect(isExternalDep('react')).toBeTruthy();
      expect(isExternalDep('react/index.js')).toBeTruthy();
      expect(isExternalDep('@chakra-ui/core')).toBeTruthy();
    });
  });
});
