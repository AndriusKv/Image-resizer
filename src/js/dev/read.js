"use strict";

import { changeClass, toggleElement } from "./main.js";
import * as dropbox from "./dropbox.js";
import * as process from "./process.js";
import * as tools from "./tools.js";
import * as crop from "./cropper.js";

const dropboxElement = document.getElementById("js-dropbox");
let counter = 0;

function doneReadingFiles() {
    setTimeout(() => {
        if (dropbox.isCanceled) {
            return;
        }

        if (!process.images.length) {
            dropbox.resetDropbox();
            dropbox.showMessage("No images to process.");
            return;
        }

        if (tools.cropperEnabled) {
            dropbox.resetDropbox();
            crop.init();
        }
        else {
            dropbox.resetProgress();
            process.processImages();
        }
    }, 1200);
}

function isImage(type) {
    return type.includes("image");
}

function removeFileType(fileName) {
    return fileName.slice(0, fileName.lastIndexOf("."));
}

function setImageName(name) {
    const imageName = document.getElementById("js-image-name").value || removeFileType(name);
    const imageNameSeperator = document.getElementById("js-image-name-seperator").value || "-";

    return imageName + imageNameSeperator;
}

function readImage(image) {
    const reader = new FileReader();

    reader.readAsDataURL(image);
    reader.onloadend = function(event) {
        process.images.push({
            name: {
                original: image.name,
                setByUser: setImageName(image.name)
            },
            type: image.type,
            size: image.size / 1e6,
            uri: event.target.result
        });
    };
}

function readFiles(files, inc) {
    const file = files[0];

    dropbox.setProgressLabel(`Reading: ${file.name}`);

    files = Array.prototype.slice.call(files, 1);

    if (isImage(file.type)) {
        readImage(file);
    }

    dropbox.updateProgress(inc);

    if (!files.length) {
        doneReadingFiles();
    }

    if (files.length) {
        const delay = file.size / 1e6 * 100 + 100;

        setTimeout(() => {
            if (dropbox.isCanceled) {
                return;
            }

            readFiles(files, inc);
        }, delay);
    }
}

function onFiles(files) {
    const inc = 100 / files.length;

    if (process.worker) {
        process.worker.postMessage({ action: "remove" });
    }

    if (process.images.length) {
        process.images.length = 0;
    }

    process.zip = null;
    dropbox.isCanceled = false;
    toggleElement("remove", dropbox.downloadBtn);
    dropbox.beforeWork();
    readFiles(files, inc);
}

function onUpload(event) {
    const files = event.target.files;

    event.preventDefault();

    if (files.length) {
        onFiles(files);
    }
}

function onDrop(event) {
    counter = 0;
    changeClass("remove", event.target, "over");

    event.stopPropagation();
    event.preventDefault();

    if (dropbox.isWorking) {
        event.dataTransfer.dropEffect = "none";
        return;
    }

    event.dataTransfer.dropEffect = "copy";
    onFiles(event.dataTransfer.files);
}

function onDragover(event) {
    event.stopPropagation();
    event.preventDefault();
}

function onDragenter(event) {
    event.preventDefault();

    if (dropbox.isWorking) {
        return;
    }

    counter += 1;
    changeClass("add", event.target, "over");
}

function onDragleave(event) {
    if (dropbox.isWorking) {
        return;
    }

    counter -= 1;

    if (!counter) {
        changeClass("remove", event.target, "over");
    }
}

document.getElementById("js-image-select").addEventListener("change", onUpload, false);
dropboxElement.addEventListener("dragover", onDragover, false);
dropboxElement.addEventListener("dragenter", onDragenter, false);
dropboxElement.addEventListener("dragleave", onDragleave, false);
dropboxElement.addEventListener("drop", onDrop, false);
dropboxElement.addEventListener("click", event => {
    if (dropbox.isWorking) {
        event.preventDefault();
    }
});
