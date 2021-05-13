import {
  findRootPathOfPackage,
  getExactPackageVersion,
  getFileExtension,
  isExternalDep
} from './utils';

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

  describe('findRootPathOfPackage()', () => {
    it('should find the root path of package', () => {
      expect(
        findRootPathOfPackage('/node_modules/react/dist/index.js')
      ).toEqual('/node_modules/react');
    });

    it('should find the root path of scoped package', () => {
      expect(
        findRootPathOfPackage('/node_modules/@chakra-ui/core/dist/index.js')
      ).toEqual('/node_modules/@chakra-ui/core');
    });

    it('should return / when it is a direact dependency', () => {
      expect(findRootPathOfPackage('/hello.js')).toEqual('');
    });
  });
});
