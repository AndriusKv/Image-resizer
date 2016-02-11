"use strict";

import * as process from "./process.js";
import * as tools from "./tools.js";
import * as crop from "./cropper.js";

const dropboxElem = document.getElementById("js-dropbox");
const progressBar = document.getElementById("js-progress");
const processBtn = document.getElementById("js-process");
const downloadBtn = document.getElementById("js-download");
const cancelBtn = document.getElementById("js-cancel");
let isCanceled = false;
let working = false;
let timeout = 0;
let counter = 0;

function setWorking(isWorking) {
    working = isWorking;
}

function isWorking() {
    return working;
}

function toggleMasks(action) {
    document.getElementById("js-dropbox-label").classList[action]("mask");
    document.getElementById("js-mask").classList[action]("show");
}

function hideMessageAfter(delay) {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
        showMessage();
    }, delay);
}

function showMessage(message = "") {
    requestAnimationFrame(() => {
        document.getElementById("js-msg").innerHTML = message;
    });
    if (!message) {
        return;
    }
    hideMessageAfter(2000);
}

function setProgressLabel(text) {
    requestAnimationFrame(() => {
        document.getElementById("js-progress-label").textContent = text;
    });
}

function updateProgress(value) {
    progressBar.value += value;
}

function resetProgress() {
    progressBar.value = 0;
}

function isDone() {
    return Math.round(progressBar.value) === 100;
}

function removeMasksAndLabel() {
    setProgressLabel("");
    toggleMasks("remove");
}

function beforeWork() {
    toggleMasks("add");
    setWorking(true);
    progressBar.classList.add("show");
    processBtn.classList.remove("show");
    cancelBtn.classList.add("show");
}

function resetDropbox() {
    setWorking(false);
    progressBar.classList.remove("show");
    cancelBtn.classList.remove("show");
    resetProgress();
    removeMasksAndLabel();
}

function doneReadingFiles() {
    setTimeout(() => {
        if (isCanceled) {
            return;
        }

        if (!process.images.length) {
            resetDropbox();
            showMessage("No images to process");
            return;
        }

        if (tools.cropperEnabled) {
            resetDropbox();
            crop.init();
        }
        else {
            resetProgress();
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

    setProgressLabel(`Reading: ${file.name}`);
    files = Array.prototype.slice.call(files, 1);

    if (isImage(file.type)) {
        readImage(file);
    }

    updateProgress(inc);

    if (!files.length) {
        doneReadingFiles();
    }

    if (files.length) {
        const delay = file.size / 1e6 * 100 + 100;

        setTimeout(() => {
            if (isCanceled) {
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
    isCanceled = false;
    downloadBtn.classList.remove("show");
    beforeWork();
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
    dropboxElem.classList.remove("over");
    event.stopPropagation();
    event.preventDefault();
    if (isWorking()) {
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

    if (isWorking()) {
        return;
    }
    counter += 1;
    dropboxElem.classList.add("over");
}

function onDragleave() {
    if (isWorking()) {
        return;
    }
    counter -= 1;
    if (!counter) {
        dropboxElem.classList.remove("over");
    }
}

document.getElementById("js-image-select").addEventListener("change", onUpload, false);
dropboxElem.addEventListener("dragover", onDragover, false);
dropboxElem.addEventListener("dragenter", onDragenter, false);
dropboxElem.addEventListener("dragleave", onDragleave, false);
dropboxElem.addEventListener("drop", onDrop, false);
dropboxElem.addEventListener("click", event => {
    if (isWorking()) {
        event.preventDefault();
    }
});

export {
	isDone,
	cancelBtn,
    setWorking,
	isWorking,
	beforeWork,
	isCanceled,
	processBtn,
    progressBar,
	downloadBtn,
    showMessage,
	resetDropbox,
	resetProgress,
	updateProgress,
	setProgressLabel,
	removeMasksAndLabel
};
