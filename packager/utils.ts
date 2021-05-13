import babelTraverse from '@babel/traverse';
import * as BabelParser from '@babel/parser';
import { findRootPathOfPackage, isExternalDep } from '@common/utils';
import { Asset, Files } from '@common/api';
import { getPackageFiles } from './npm';
import semver from 'semver';

export async function createAsset(
  files: Files,
  filePath: string
): Promise<Asset | null> {
  const fileContent = files[filePath].content;

  if (!fileContent) return null;

  let dependencies: string[] = [];
  const packageRootPath = findRootPathOfPackage(filePath);
  const packageJSON = JSON.parse(
    files[`${packageRootPath}/package.json`].content || '{}'
  );
  const assetDependencies = packageJSON.dependencies || {};

  const ast = BabelParser.parse(fileContent, {
    sourceType: 'module'
  });

  if (!ast) return null;

  babelTraverse(ast, {
    CallExpression: (callExpression) => {
      const functionName = (callExpression.node.callee as any).name;

      if (functionName === 'require') {
        const dependency = (callExpression.node.arguments[0] as any).value;

        dependencies.push(dependency);
      }
    }
  });

  for (const dependency of dependencies) {
    if (isExternalDep(dependency)) {
      const packageName = (() => {
        const depNameParts = dependency.split('/');

        if (depNameParts[0].startsWith('@')) {
          return `${depNameParts[0]}/${depNameParts[1]}`;
        } else {
          return depNameParts[0];
        }
      })();

      if (
        !files[`${packageRootPath}/node_modules/${packageName}/package.json`]
      ) {
        const packageVersion = assetDependencies[packageName];

        if (packageVersion) {
          const packageSemVer = semver.minVersion(packageVersion);

          if (!packageSemVer) {
            throw new Error(
              `invalid package version specified for ${packageName}`
            );
          }

          const packageFiles = await getPackageFiles(
            packageName,
            packageSemVer.version,
            `${packageRootPath}/node_modules`
          );

          for (const packageFile in packageFiles) {
            files[packageFile] = {
              content: packageFiles[packageFile].content
            };
          }
        }
      }
    }
  }

  return {
    code: fileContent,
    dependencies
  };
}
