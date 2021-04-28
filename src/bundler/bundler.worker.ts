import { BundlerWorkerMessage } from './types';
import { generateDepGraph } from './dep-graph';

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
  }
};
