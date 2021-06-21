import { BundlerWorkerMessage } from '@common/api';
import { generateDepGraph } from './dep-graph';
import path from 'path';
import { getFileExtension } from '@common/utils';
import * as Babel from '@babel/standalone';
import assetCache from '../cache/asset-cache';
import { getProjectTemplateDefintion } from '@common/utils';

function sendMesssage(message: BundlerWorkerMessage) {
  self.postMessage(message);
}

self.onmessage = async (evt: MessageEvent<BundlerWorkerMessage>) => {
  switch (evt.data.type) {
    case 'BUILD_DEP_GRAPH': {
      const { files, entryPoint, invalidateFiles } = evt.data.payload;
      const templateDefintion = getProjectTemplateDefintion(files);

      try {
        if (invalidateFiles.length === 0) {
          assetCache.reset();
        } else {
          for (const file of invalidateFiles) {
            assetCache.remove(file);
          }
        }

        const depGraph = await generateDepGraph(
          files,
          entryPoint || templateDefintion.entry
        );

        sendMesssage({
          type: 'DEP_GRAPH_READY',
          payload: {
            depGraph
          }
        });
      } catch (err) {
        sendMesssage({
          type: 'ERR',
          payload: {
            err
          }
        });
      }

      break;
    }
    case 'TRANSFORM': {
      const { filePath, code } = evt.data.payload;
      const fileExtension = getFileExtension(path.basename(filePath));

      if (fileExtension === 'js') {
        const transformResult = Babel.transform(code, {
          presets: ['env']
        });

        sendMesssage({
          type: 'TRANSFORM_READY',
          payload: {
            filePath,
            transformedCode: transformResult.code || ''
          }
        });
      }
    }
  }
};
