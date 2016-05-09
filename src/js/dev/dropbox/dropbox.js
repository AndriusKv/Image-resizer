import * as state from "./../editor.state.js";
import * as worker from "./../editor.worker.js";
import * as images from "./dropbox.images.js";
import * as progress from "./dropbox.progress.js";
import * as message from "./dropbox.message.js";
import * as button from "./dropbox.buttons.js";
import * as resizer from "./../resizer.js";
import * as tools from "./../tools.js";
import * as cropper from "./../cropper/cropper.js";

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
    if (images.getStoredImageCount()) {
        images.resetStoredImageCount();
        progress.setLabel("Generating archive");
        worker.post({ action: "generate" });
    }
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
    onFiles,
	beforeWork,
    generateZip,
	resetDropbox,
	removeMasksAndLabel
};
