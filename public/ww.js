/* global JSZip */

importScripts("./libs/jszip.min.js");

const zip = new JSZip();

self.onmessage = async function(event) {
  event.data.forEach(image => {
    zip.folder("images").file(image.name, image.file);
  });
  postMessage(await zip.generateAsync({ type:"blob" }));
};
