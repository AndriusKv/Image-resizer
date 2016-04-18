"use strict";

/* global importScripts, JSZip, onmessage, postMessage */

importScripts("../libs/jszip.min.js");

var zip = new JSZip();
var content = null;
var i = 0;

function zipImages(name, uri, type) {
    zip.folder("images").file(name + "." + type, uri, { base64: true });
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

onmessage = function onmessage(event) {
    var data = event.data;

    switch (data.action) {
        case "add":
            var image = data.image;
            var type = changeFileType(image.type);
            var uri = truncateUri(image.uri, type);

            zipImages(image.name + i, uri, type);
            i += 1;
            break;
        case "generate":
            i = 0;
            if (Object.keys(zip.files).length) {
                content = zip.generate({ type: "blob" });
                postMessage({ action: "notify" });
            }
            break;
        case "download":
            if (content) {
                postMessage({
                    action: "download",
                    content: content
                });
            }
            break;
        case "remove":
            content = null;
            zip.remove("images");
            break;
    }
};
