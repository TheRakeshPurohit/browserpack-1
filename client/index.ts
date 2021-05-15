import { Files } from '@common/api';
import { listenForWindowMessage, sendMessageFromClient } from '@common/utils';

class Browserpack {
  private onReadyHandler: () => void;
  private isBundlerReady: boolean;
  private iframeElement: HTMLIFrameElement | null;
  private isBundleReady: boolean;

  constructor(
    private iframeContainerId: string,
    private files: Files = {},
    private previewURL = 'http://localhost:3001'
  ) {
    this.onReadyHandler = () => {};
    this.isBundlerReady = false;
    this.isBundleReady = false;
    this.iframeElement = null;
  }

  init(files?: Files) {
    if (files) this.files = files;

    this.iframeElement = document.createElement('iframe');
    this.iframeElement.setAttribute('src', this.previewURL);
    this.iframeElement.height = '100%';
    this.iframeElement.width = '100%';
    this.iframeElement.setAttribute('frameBorder', '0');

    const iframeContainer = document.querySelector(this.iframeContainerId);

    if (!iframeContainer) {
      throw new Error(
        `iframe container element ${this.iframeContainerId} not found`
      );
    }

    iframeContainer?.appendChild(this.iframeElement);

    listenForWindowMessage((evt) => {
      if (evt.data.type === 'BUNDLER_READY') {
        this.isBundlerReady = true;
        this.onReadyHandler();
      }
    });
  }

  onReady(readyHandler: () => void) {
    this.onReadyHandler = readyHandler;

    if (this.isBundlerReady) {
      this.onReadyHandler();
    }
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

        if (this.iframeElement) {
          sendMessageFromClient(this.iframeElement, {
            type: 'BUNDLE',
            payload: {
              files: this.files
            }
          });
        }
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
      if (this.iframeElement) {
        sendMessageFromClient(this.iframeElement, {
          type: 'RUN'
        });
      }
    }
  }

  patch(files: Files) {
    if (!this.isBundlerReady) {
      throw new Error('Bundler is not yet ready');
    } else if (this.isBundleReady) {
      throw new Error('You need to bundle before running');
    } else {
      if (this.iframeElement) {
        sendMessageFromClient(this.iframeElement, {
          type: 'PATCH',
          payload: {
            files
          }
        });
      }
    }
  }
}

export default Browserpack;
