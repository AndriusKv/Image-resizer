const worker = new Worker(new URL("./ww.js", import.meta.url), { type: "module" });

worker.onmessage = async function({ data: { type, data } }) {
  if (type === "zip") {
    const { default: saveAs } = await import("file-saver");

    saveAs(data, "images.zip");
  }
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
