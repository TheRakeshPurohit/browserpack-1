import {
  Asset,
  DepGraph,
  Files,
  ProjectTemplate,
  ProjectTemplateDefintion
} from '@common/api';
import * as babelParser from '@babel/parser';
import babelTraverse from '@babel/traverse';
import * as Babel from '@babel/standalone';
import path from 'path';
import { getFileExtension, isExternalDep } from '@common/utils';

export async function createAsset(
  filePath: string,
  importer: string,
  files: Files
): Promise<Asset | null> {
  if (isExternalDep(filePath)) {
    return {
      code: '',
      dependencies: []
    };
  }

  const dependencies: string[] = [];
  const resolvedFileExtension = getFileExtension(path.basename(filePath));
  const file = files[filePath];

  if (['js', 'ts'].includes(resolvedFileExtension)) {
    const ast = babelParser.parse(file.content, {
      sourceType: 'module',
      plugins: ['jsx', 'decorators-legacy', 'classProperties']
    });

    babelTraverse(ast, {
      ImportDeclaration: (importDeclaration) => {
        dependencies.push(importDeclaration.node.source.value);
      }
    });

    const code = Babel.transform(file.content, {
      presets: ['env', 'react'],
      plugins: [
        [Babel.availablePlugins['proposal-decorators'], { legacy: true }],
        Babel.availablePlugins['proposal-class-properties']
      ]
    }).code;

    return {
      code,
      dependencies
    };
  } else if (resolvedFileExtension === 'css') {
    return {
      code: file.content,
      dependencies: []
    };
  } else if (resolvedFileExtension === 'json') {
    // check the validity of the json
    try {
      JSON.parse(file.content);
    } catch {
      throw new Error(
        `Invalid json module '${filePath}' imported from '${importer}'`
      );
    }

    const transformedCode = `
      module.exports = ${file.content};
    `;

    return {
      code: transformedCode,
      dependencies: []
    };
  } else {
    return null;
  }
}

export function findRemovedFiles(
  oldDepGraph: DepGraph,
  newDepGraph: DepGraph
): string[] {
  const removedFiles = [];

  for (const file in oldDepGraph) {
    if (!newDepGraph[file]) removedFiles.push(file);
  }

  return removedFiles;
}

export function getPackageJSON(files: Files, filePath = '/') {
  const packageJSONPath = path.resolve(filePath, 'package.json');
  const packageJSONStr = files[packageJSONPath].content || '{}';

  return JSON.parse(packageJSONStr);
}

export function detectTemplate(files: Files): ProjectTemplate {
  const packageJSON = getPackageJSON(files);
  const dependencies = packageJSON.dependencies || {};

  if (dependencies['react']) return 'react';
  else if (dependencies['@angular/core']) return 'angular';
  else return 'vanilla';
}

export function getProjectTemplateDefintion(
  template: ProjectTemplate
): ProjectTemplateDefintion {
  switch (template) {
    case 'react': {
      return {
        htmlEntry: '/public/index.html',
        entry: ['src/index.js']
      };
    }
    case 'angular': {
      return {
        htmlEntry: '/src/index.html',
        entry: ['/src/main.ts', '/src/polyfill.ts']
      };
    }
    default: {
      return {
        htmlEntry: '/index.html',
        entry: ['/index.js']
      };
    }
  }
}
