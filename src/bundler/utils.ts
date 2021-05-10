import { Asset, Files } from './types';
import * as babelParser from '@babel/parser';
import babelTraverse from '@babel/traverse';
import * as Babel from '@babel/standalone';
import { resolveFile } from './resolver';
import path from 'path';

export function createAsset(
  filePath: string,
  importer: string,
  files: Files
): Asset {
  const resolvedFilePath = resolveFile(files, filePath);
  const dependencies: string[] = [];

  if (resolvedFilePath) {
    const resolvedFileExtension = getFileExtension(
      path.basename(resolvedFilePath)
    );
    const file = files[resolvedFilePath];

    if (['js', 'ts'].includes(resolvedFileExtension)) {
      const ast = babelParser.parse(file.content, {
        sourceType: 'module'
      });

      babelTraverse(ast, {
        ImportDeclaration: (importDeclaration) => {
          dependencies.push(importDeclaration.node.source.value);
        }
      });

      const code = Babel.transform(file.content, {
        presets: ['env']
      }).code;

      return {
        code,
        dependencies
      };
    } else if (['css'].includes(resolvedFileExtension)) {
      return {
        code: file.content,
        dependencies: []
      };
    } else {
      throw new Error(
        `No handler found for module '${filePath}' imported by '${importer}'`
      );
    }
  } else {
    throw new Error(`Cannot find module '${filePath}' from '${importer}'`);
  }
}

export function getFileExtension(filename: string) {
  const filenameParts = filename.split('.');

  if (filenameParts.length === 1) return '';

  return filenameParts[filenameParts.length - 1];
}
