import { BundlerWorkerMessage } from "./types";
import { generateDepGraph } from './dep-graph';

function sendMesssage(message: BundlerWorkerMessage) {
  self.postMessage(message);
}

self.onmessage = async (evt: MessageEvent<BundlerWorkerMessage>) =>  {
  switch (evt.data.type) {
    case 'BUILD_DEP_GRAPH': {
      const { files, entryPoint } = evt.data.payload;
      const depGraph = await generateDepGraph(files, entryPoint);

      sendMesssage({
        type: 'DEP_GRAPH_READY',
        payload: {
          depGraph
        }
      });

      break;
    }
  }
}
