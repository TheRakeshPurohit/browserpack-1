import { ClientMessage } from '@common/api';

export function sendMessage(message: ClientMessage) {
  window.postMessage(message, '*');
}
