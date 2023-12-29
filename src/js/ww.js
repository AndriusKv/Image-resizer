import JSZip from "jszip";

onmessage = async function({ data: { type, data } }) {
  if (type === "zip") {
    const zip = new JSZip();

    data.forEach(image => {
      zip.folder("images").file(image.name, image.file);
    });
    postMessage({
      type,
      data: await zip.generateAsync({ type: "blob" })
    });
  }
};
