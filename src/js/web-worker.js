import { saveAs } from "file-saver";

const worker = new Worker("./ww.js");

worker.onmessage = function(event) {
  saveAs(event.data, "images.zip");
};

worker.onerror = function(event) {
  console.log(event);
};

function postMessageToWorker(message) {
  worker.postMessage(message);
}

export {
  postMessageToWorker
};
