/* global saveAs */

import * as resizer from "./resizer.js";
import * as tools from "./tools.js";
import * as cropper from "./cropper/cropper.js";

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
    };
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
                message.show("Images are ready for downloading");
                button.show("download");
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

const progress = (function() {
    const progressBar = document.getElementById("js-progress");
    const progressLabel = document.getElementById("js-progress-label");

    function showProgressBar() {
        progressBar.classList.add("show");
    }

    function hideProgressBar() {
        progressBar.classList.remove("show");
    }

    function setProgressLabel(text) {
        progressLabel.textContent = text;
    }

    function updateProgress(value) {
        progressBar.value += value;
    }

    function resetProgress() {
        progressBar.classList.remove("show");
        progressBar.value = 0;
    }

    return {
        show: showProgressBar,
        hide: hideProgressBar,
        setLabel: setProgressLabel,
        update: updateProgress,
        reset: resetProgress
    };
})();

const message = (function() {
    const msgElem = document.getElementById("js-msg");
    let timeout = 0;

    function hideMessage(delay) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(showMessage, delay);
    }

    function showMessage(message = "") {
        msgElem.textContent = message;
        if (!message) {
            return;
        }
        hideMessage(2000);
    }

    return {
        show: showMessage
    };
})();

const button = (function() {
    function toggleButton(action, button) {
        document.getElementById("js-" + button).classList[action]("show");
    }

    function showButton(button) {
        toggleButton("add", button);
    }

    function hideButton(button) {
        toggleButton("remove", button);
    }

    return {
        show: showButton,
        hide: hideButton
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

function removeMasksAndLabel() {
    progress.setLabel("");
    toggleMasks("remove");
}

function beforeWork() {
    toggleMasks("add");
    state.set(1);
    progress.show();
    button.hide("process");
    button.show("cancel");
}

function resetDropbox(newState = -1) {
    state.set(newState);
    button.hide("cancel");
    progress.reset();
    removeMasksAndLabel();
}

function doneReadingFiles() {
    if (state.get() === 0) {
        return;
    }

    if (!images.getCount()) {
        resetDropbox();
        message.show("No images to process");
        return;
    }

    if (tools.getCurrentTool() === "cropper") {
        resetDropbox();
        cropper.init();
    }
    else {
        progress.reset();
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
    progress.setLabel("Generating archive");
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

    progress.setLabel(`Reading: ${file.name}`);
    if (isImage(file.type)) {
        readImage(file);
    }

    progress.update(inc);
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

function cancelWork() {
    images.reset();
    resetDropbox(0);
    message.show("Work canceled");
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
    button.hide("download");
    beforeWork();
    readFiles([...files], inc);
}

function onBtnClick(event) {
    const btn = event.target.getAttribute("data-btn");

    if (btn === "process") {
        resizer.processImages();
    }
    else if (btn === "download") {
        worker.post({ action: "download" });
    }
    else if (btn === "cancel") {
        cancelWork();
    }
}

function onUpload(event) {
    const files = event.target.files;

    event.preventDefault();
    if (files.length) {
        onFiles(files);
    }
}

document.getElementById("js-dropbox-btns").addEventListener("click", onBtnClick, false);
document.getElementById("js-image-select").addEventListener("change", onUpload, false);

export {
    state,
    images,
    worker,
    progress,
    message,
    button,
    onFiles,
	beforeWork,
    generateZip,
	resetDropbox,
	removeMasksAndLabel
};
