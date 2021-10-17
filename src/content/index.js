import browser from 'webextension-polyfill';
import { toCamelCase } from '@/utils/helper';
import elementSelector from './element-selector';
import * as blocksHandler from './blocks-handler';

function onConnectListener() {
  browser.runtime.onConnect.addListener((port) => {
    console.log('Connect');
    port.onMessage.addListener((data) => {
      const handler = blocksHandler[toCamelCase(data.name)];
      console.log(`${data.name}(${toCamelCase(data.name)}):`, data);
      if (handler) {
        handler(data).then((result) => {
          port.postMessage({ type: data.name, data: result });
        });
      } else {
        console.error(`"${data.name}" doesn't have a handler`);
      }
    });
  });
}

browser.runtime.onMessage.addListener(({ type }) => {
  return new Promise((resolve) => {
    if (type === 'content-script-exists') {
      resolve(true);
    } else if (type === 'select-element') {
      elementSelector();
      resolve(true);
    }
  });
});

if (document.readyState === 'complete') onConnectListener();
else window.addEventListener('load', onConnectListener);
