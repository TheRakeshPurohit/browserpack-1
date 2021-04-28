module.exports = function() {
  let noop = () => null;
  let self = {
    onmessage: noop
  };
  let messageListeners = [];
  this.onmessage = noop;

  self.postMessage = (message) => {
    const evt = { data: message };

    this.onmessage(evt);

    for (const listner of messageListeners) {
      listner(evt);
    }
  }

  //worker-code

  this.postMessage = (message) => {
    const evt = { data: message };

    self.onmessage(evt);
  };

  this.addEventListener = (event, listener) => {
    switch (event) {
      case 'message': {
        messageListeners.push(listener);

        break;
      }
      default: {
        throw new Error(`${event} not handled in jest web worker transformer`)
      }
    }
  }

  this.removeEventListener = (event, listener) => {
    switch (event) {
      case 'message': {
        messageListeners = messageListeners.filter(messageListener => messageListener !== listener);

        break;
      }
      default: {
        throw new Error(`${event} not handled in jest web worker transformer`)
      }
    }
  }
}
