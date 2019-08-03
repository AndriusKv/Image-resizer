/* global JSZip */

importScripts("./libs/jszip.min.js");

const zip = new JSZip();

self.onmessage = async function(event) {
  event.data.forEach((image, index) => {
    const arr = image.name.split(".");
    arr[0] += `-${index}`;
    const name = arr.join(".");

    zip.folder("images").file(name, image.file);
  });
  postMessage(await zip.generateAsync({ type:"blob" }));
  // postMessage({
  //   action: "download",
  //   content: await zip.generateAsync({ type:"blob" })
  // });
};
