import WebWorker from 'web-worker:./worker.ts';

export default class Browserpack {
  run() {
    const webWorker = new WebWorker();

    webWorker.postMessage('hello world!');

    console.log('running bundler...');
  }
}
