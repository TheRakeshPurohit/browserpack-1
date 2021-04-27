import { Asset, Files } from "./types";
import * as babelParser from '@babel/parser';
import babelTraverse from '@babel/traverse';
import * as Babel from '@babel/standalone';

export async function createAsset(filePath: string, importer: string, files: Files): Promise<Asset> {
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


    return new Promise((resolve, reject) => {
      Babel.transformFromAst(ast, "", {}, (err, transformResult) => {
        if (!err) {
          resolve({
            code: transformResult?.code,
            dependencies
          })
        } else {
          reject(err);
        }
      })
    })
  } else {
    throw new Error(`Cannot find module '${filePath}' from '${importer}'`);
  }
}