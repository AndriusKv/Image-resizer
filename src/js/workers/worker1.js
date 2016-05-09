/* global importScripts, JSZip, onmessage, postMessage */

importScripts("../libs/jszip.min.js");

const zip = new JSZip();
let content = null;
let i = 0;

function zipImages(name, uri, type) {
    zip.folder("images").file(`${name}.${type}`, uri, { base64: true });
}

function changeFileType(type) {
    return type !== "jpeg" ? type : "jpg";
}

function truncateUri(uri, type) {
    if (type.length === 4) {
        return uri.slice(23);
    }
    return uri.slice(22);
}

onmessage = function(event) {
    const data = event.data;

    switch (data.action) {
        case "add":
            const image = data.image;
            const type = changeFileType(image.type);
            const uri = truncateUri(image.uri, type);

            zipImages(image.name + i, uri, type);
            i += 1;
            break;
        case "generate":
            i = 0;
            if (Object.keys(zip.files).length) {
                zip.generateAsync({ type:"blob" })
                .then(data => {
                    content = data;
                    postMessage({ action: "notify" });
                });
            }
            break;
        case "download":
            if (content) {
                postMessage({
                    action: "download",
                    content
                });
            }
            break;
        case "remove":
            content = null;
            zip.remove("images");
            break;
    }
};
