import path from 'path';

export function getModule(fileName, bundle) {
  const moduleId = path.join(process.cwd(), fileName);

  for (const key in bundle) {
    if (bundle[key].facadeModuleId === moduleId) {
      return bundle[key];
    }  
  }
}
