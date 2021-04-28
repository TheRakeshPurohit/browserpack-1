import { Asset, Files } from "./types";
import * as babelParser from '@babel/parser';
import babelTraverse from '@babel/traverse';
import * as Babel from '@babel/standalone';

export function createAsset(filePath: string, importer: string, files: Files): Asset {
  const file = files[filePath];
  const dependencies: string[] = [];

  if (file) {
    const ast = babelParser.parse(file.content, {
      sourceType: "module"
    });

    babelTraverse(ast, {
      ImportDeclaration: (importDeclaration) => {
        dependencies.push(importDeclaration.node.source.value);
      }
    });

    const code = Babel.transform(file.content, {
      sourceType: "module"
    }).code;

    return {
      code,
      dependencies
    }
  } else {
    throw new Error(`Cannot find module '${filePath}' from '${importer}'`);
  }
}