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

const templateUrlRegex = /templateUrl\s*:(\s*['"`](.*?)['"`]\s*([,}]))/gm;
const stylesRegex = /styleUrls *:(\s*\[[^\]]*?\])/g;
const stringRegex = /(['`"])((?:[^\\]\\\1|.)*?)\1/g;

function replaceStringsWithRequires(string: string) {
  return string.replace(stringRegex, function (match, quote, url) {
    if (url.charAt(0) !== '.') {
      url = './' + url;
    }
    return "rawRequire('" + url + "')";
  });
}

function angularTemplateTransform(source: string) {
  const styleProperty = 'styles';
  const templateProperty = 'template';
  const transformedSource = source
    .replace(templateUrlRegex, function (match, url) {
      // replace: templateUrl: './path/to/template.html'
      // with: template: require('./path/to/template.html')
      // or: templateUrl: require('./path/to/template.html')
      // if `keepUrl` query parameter is set to true.
      return templateProperty + ':' + replaceStringsWithRequires(url);
    })
    .replace(stylesRegex, function (match, urls) {
      // replace: stylesUrl: ['./foo.css', "./baz.css", "./index.component.css"]
      // with: styles: [require('./foo.css'), require("./baz.css"), require("./index.component.css")]
      // or: styleUrls: [require('./foo.css'), require("./baz.css"), require("./index.component.css")]
      // if `keepUrl` query parameter is set to true.
      return styleProperty + ':' + replaceStringsWithRequires(urls);
    });

  return transformedSource;
}

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
  const template = detectTemplate(files);

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

    let code = Babel.transform(file.content, {
      presets: ['env', 'react'],
      plugins: [
        [Babel.availablePlugins['proposal-decorators'], { legacy: true }],
        Babel.availablePlugins['proposal-class-properties']
      ]
    }).code;

    if (code && template === 'angular') {
      code = angularTemplateTransform(code);
    }

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
  const packageJSONStr = files[packageJSONPath]?.content || '{}';

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
  files: Files
): ProjectTemplateDefintion {
  const template = detectTemplate(files);

  switch (template) {
    case 'react': {
      return {
        htmlEntry: '/public/index.html',
        entry: '/src/index.js'
      };
    }
    case 'angular': {
      return {
        htmlEntry: '/src/index.html',
        entry: '/src/main.ts'
      };
    }
    default: {
      return {
        htmlEntry: '/index.html',
        entry: '/index.js'
      };
    }
  }
}

export function getHTMLParts(html: string) {
  if (html.includes('<body>')) {
    const bodyMatcher = /<body.*>([\s\S]*)<\/body>/m;
    const headMatcher = /<head>([\s\S]*)<\/head>/m;

    const headMatch = html.match(headMatcher);
    const bodyMatch = html.match(bodyMatcher);
    const head = headMatch && headMatch[1] ? headMatch[1] : '';
    const body = bodyMatch && bodyMatch[1] ? bodyMatch[1] : html;

    return { body, head };
  }

  return { head: '', body: html };
}
