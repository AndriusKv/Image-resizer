"use strict";

/* global importScripts, JSZip, onmessage, postMessage */

importScripts("../js/libs/jszip.min.js");

var zip = new JSZip();
var content = null;
var i = 0;

function addToFolder(name, uri, type) {
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

function zipImage(image, i) {
    var type = changeFileType(image.type);
    var uri = truncateUri(image.uri, type);
    var name = image.name + i;

    addToFolder(name, uri, type);
}

onmessage = function onmessage(event) {
    var data = event.data;

    switch (data.action) {
        case "add":
            zipImage(data.image, i);
            i += 1;
            break;
        case "add-bulk":
            data.images.forEach(zipImage);
            break;
        case "generate":
            i = 0;
            if (Object.keys(zip.files).length) {
                postMessage({ action: "generating" });
                zip.generateAsync({ type: "blob" }).then(function (data) {
                    content = data;
                    postMessage({ action: "done" });
                });
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
