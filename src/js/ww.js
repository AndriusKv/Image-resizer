import JSZip from "jszip";

onmessage = async function(event) {
  const zip = new JSZip();

  event.data.forEach(image => {
    zip.folder("images").file(image.name, image.file);
  });
  postMessage(await zip.generateAsync({ type:"blob" }));
};
