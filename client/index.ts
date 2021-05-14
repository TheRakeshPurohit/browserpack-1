import { Files } from '@common/api';
import { listenForWindowMessage, sendMessageFromClient } from '@common/utils';

class Browserpack {
  private onReadyHandler: () => void;
  private isBundlerReady: boolean;
  private iframeElement: HTMLIFrameElement;
  private isBundleReady: boolean;

  constructor(iframeContainerId: string, private files: Files) {
    this.onReadyHandler = () => {};
    this.iframeElement = document.createElement('iframe');
    this.iframeElement.setAttribute('src', 'http://localhost:3001');
    this.iframeElement.height = '100%';
    this.iframeElement.width = '100%';

    const iframeContainer = document.querySelector(iframeContainerId);

    if (!iframeContainer) {
      throw new Error(
        `iframe container element ${iframeContainerId} not found`
      );
    }

    iframeContainer?.appendChild(this.iframeElement);

    this.isBundlerReady = false;
    this.isBundleReady = false;

    listenForWindowMessage((evt) => {
      if (evt.data.type === 'BUNDLER_READY') {
        this.isBundlerReady = true;
        this.onReadyHandler();
      }
    });
  }

  onReady(readyHandler: () => void) {
    this.onReadyHandler = readyHandler;
  }

  bundle() {
    if (this.isBundlerReady) {
      return new Promise((resolve, reject) => {
        const removeListener = listenForWindowMessage((evt) => {
          if (evt.data.type === 'BUNDLE_READY') {
            resolve(null);

            removeListener();
          } else if (evt.data.type === 'ERR') {
            reject(evt.data.payload);

            removeListener();
          }
        });

        sendMessageFromClient(this.iframeElement, {
          type: 'BUNDLE',
          payload: {
            files: this.files
          }
        });
      });
    } else {
      throw new Error('Bundler is not yet ready');
    }
  }

  run() {
    if (!this.isBundlerReady) {
      throw new Error('Bundler is not yet ready');
    } else if (this.isBundleReady) {
      throw new Error('You need to bundle before running');
    } else {
      sendMessageFromClient(this.iframeElement, {
        type: 'RUN'
      });
    }
  }

  patch(files: Files) {
    if (!this.isBundlerReady) {
      throw new Error('Bundler is not yet ready');
    } else if (this.isBundleReady) {
      throw new Error('You need to bundle before running');
    } else {
      sendMessageFromClient(this.iframeElement, {
        type: 'PATCH',
        payload: {
          files
        }
      });
    }
  }
}

export default Browserpack;
