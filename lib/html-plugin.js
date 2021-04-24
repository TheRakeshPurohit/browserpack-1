import { getModule } from './utils';
import ejs from 'ejs';
import { promises as fs } from 'fs';

export default function htmlPlugin() {
  return {
    name: 'html-plugin',
    async generateBundle(opts, bundle) {
      const template = await fs.readFile('./src/preview/index.html', 'utf-8');
      const entryModule = getModule('./src/preview/index.ts', bundle);
      const entryJSFile =  `/${entryModule.fileName}`;
      const html = ejs.render(template, { entryJSFile });

      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: html
      });
    }
  } 
}
