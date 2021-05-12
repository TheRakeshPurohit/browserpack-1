import { BundlerWorkerMessage } from '../types';
import { generateDepGraph } from './dep-graph';
import path from 'path';
import { getFileExtension } from '../utils';
import * as Babel from '@babel/standalone';

function sendMesssage(message: BundlerWorkerMessage) {
  self.postMessage(message);
}

self.onmessage = (evt: MessageEvent<BundlerWorkerMessage>) => {
  switch (evt.data.type) {
    case 'BUILD_DEP_GRAPH': {
      const { files, entryPoint } = evt.data.payload;

      try {
        const depGraph = generateDepGraph(files, entryPoint);

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
