"use strict";

import * as resizer from "./resizer.js";
import * as tools from "./tools.js";
import * as crop from "./cropper.js";

const dropboxElem = document.getElementById("js-dropbox");
const progressBar = document.getElementById("js-progress");
const processBtn = document.getElementById("js-process");
const downloadBtn = document.getElementById("js-download");
const cancelBtn = document.getElementById("js-cancel");
let timeout = 0;
let counter = 0;

const state = (function() {

    // -1 - default
    // 0 - canceled
    // 1 - working
    let state = -1;

    function getCurrentState() {
        return state;
    }

    function setState(newState) {
        state = newState;
    }

    return {
        get: getCurrentState,
        set: setState
    }
})();

const images = (function() {
    const images = [];

    function getAll() {
        return images;
    }
    function getFirst() {
        return images[0];
    }

    function getImageCount() {
        return images.length;
    }

    function removeImage(index) {
        return images.splice(index, 1)[0];
    }

    function addImage(image) {
        images.push(image);
    }

    function resetImages() {
        images.length = 0;
    }

    return {
        add: addImage,
        remove: removeImage,
        getCount: getImageCount,
        reset: resetImages,
        getAll,
        getFirst
    };
})();

const worker = (function() {
    let worker;

    function initWorker() {
        if (worker) {
            return;
        }
        worker = new Worker("js/workers/worker1.js");
        worker.onmessage = function(event) {
            const data = event.data;

            if (data.action === "download") {
                saveZip(data.content);
            }
            else if (data.action === "notify") {
                state.set(-1);
                removeMasksAndLabel();
                showMessage("Images are ready for downloading");
                downloadBtn.classList.add("show");
            }
        };
        worker.onerror = function(event) {
            console.log(event);
        };
    }

    function postMessage(message) {
        worker.postMessage(message);
    }

    function isWorkerInitialized() {
        return !!worker;
    }

    return {
        init: initWorker,
        post: postMessage,
        isInited: isWorkerInitialized
    };
})();

function saveZip(data) {
    try {
        saveAs(data, "images.zip");
    }
    catch (error) {
        const script = document.createElement("script");

        script.setAttribute("src", "js/libs/FileSaver.min.js");
        document.getElementsByTagName("body")[0].appendChild(script);
        script.onload = function() {
            saveAs(data, "images.zip");
        };
    }
}

function toggleMasks(action) {
    document.getElementById("js-dropbox-label").classList[action]("mask");
    document.getElementById("js-mask").classList[action]("show");
}

function hideMessage(delay) {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(showMessage, delay);
}

function showMessage(message = "") {
    document.getElementById("js-msg").textContent = message;
    if (!message) {
        return;
    }
    hideMessage(2000);
}

function setProgressLabel(text) {
    document.getElementById("js-progress-label").textContent = text;
}

function updateProgress(value) {
    progressBar.value += value;
}

function resetProgress() {
    progressBar.value = 0;
}

function removeMasksAndLabel() {
    setProgressLabel("");
    toggleMasks("remove");
}

function beforeWork() {
    toggleMasks("add");
    state.set(1);
    progressBar.classList.add("show");
    processBtn.classList.remove("show");
    cancelBtn.classList.add("show");
}

function resetDropbox() {
    state.set(-1);
    progressBar.classList.remove("show");
    cancelBtn.classList.remove("show");
    resetProgress();
    removeMasksAndLabel();
}

function doneReadingFiles() {
    if (state.get() === 0) {
        return;
    }

    if (!images.getCount()) {
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
        resizer.processImages();
    }
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

function generateZip() {
    setProgressLabel("Generating archive");
    worker.post({ action: "generate" });
}

function readImage(image) {
    const reader = new FileReader();

    reader.readAsDataURL(image);
    reader.onloadend = function(event) {
        images.add({
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
    const file = files.splice(0, 1)[0];

    setProgressLabel(`Reading: ${file.name}`);
    if (isImage(file.type)) {
        readImage(file);
    }

    updateProgress(inc);
    if (!files.length) {
        setTimeout(doneReadingFiles, 1200);
        return;
    }

    const delay = file.size / 1e6 * 100 + 120;

    setTimeout(() => {
        if (state.get() !== 0) {
            readFiles(files, inc);
        }
    }, delay);
}

function downloadImages() {
    worker.post({ action: "download" });
}

function cancelWork() {
    state.set(0);
    images.reset();
    resetDropbox();
    showMessage("Work canceled");
}

function onFiles(files) {
    const inc = 100 / files.length;

    if (worker.isInited()) {
        worker.post({ action: "remove" });
    }

    if (images.getCount()) {
        images.reset();
    }

    state.set(-1);
    downloadBtn.classList.remove("show");
    beforeWork();
    readFiles([...files], inc);
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
    if (state.get() === 1) {
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

    if (state.get() === 1) {
        return;
    }
    counter += 1;
    dropboxElem.classList.add("over");
}

function onDragleave() {
    if (state.get() === 1) {
        return;
    }
    counter -= 1;
    if (!counter) {
        dropboxElem.classList.remove("over");
    }
}

processBtn.addEventListener("click", resizer.processImages, false);
downloadBtn.addEventListener("click", downloadImages, false);
cancelBtn.addEventListener("click", cancelWork, false);
document.getElementById("js-image-select").addEventListener("change", onUpload, false);
dropboxElem.addEventListener("dragover", onDragover, false);
dropboxElem.addEventListener("dragenter", onDragenter, false);
dropboxElem.addEventListener("dragleave", onDragleave, false);
dropboxElem.addEventListener("drop", onDrop, false);
dropboxElem.addEventListener("click", event => {
    if (state.get() === 1) {
        event.preventDefault();
    }
});

export {
    images,
    worker,
	cancelBtn,
	beforeWork,
	processBtn,
    progressBar,
	downloadBtn,
    generateZip,
    showMessage,
	resetDropbox,
	resetProgress,
	updateProgress,
	setProgressLabel,
	removeMasksAndLabel
};
