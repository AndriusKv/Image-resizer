"use strict";

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _mainJs = require("./main.js");

var _dropboxJs = require("./dropbox.js");

var dropbox = _interopRequireWildcard(_dropboxJs);

var _processJs = require("./process.js");

var process = _interopRequireWildcard(_processJs);

var dropboxElement = document.getElementById("js-dropbox"),
    counter = 0;

function doneReadingFiles() {
    setTimeout(function () {
        if (dropbox.isCanceled) {
            return;
        }

        if (process.images.length) {
            dropbox.resetProgress();
            process.processImages();
        } else {
            dropbox.resetDropbox();
            (0, _mainJs.showMessage)("No images to process.");
        }
    }, 1200);
}

function isImage(type) {
    return type.includes("image");
}

function readImage(image) {
    var reader = new FileReader();

    reader.readAsDataURL(image);
    reader.onloadend = function (event) {
        process.images.push({
            name: image.name,
            type: image.type,
            size: image.size / 1e6,
            uri: event.target.result
        });
    };
}

function readFiles(files, inc) {
    var file = files[0];

    dropbox.setProgressLabel("Reading: " + file.name);
    files = Array.prototype.slice.call(files, 1);

    if (isImage(file.type)) {
        readImage(file);
    }

    dropbox.updateProgress(inc);

    if (!files.length) {
        doneReadingFiles();
    }

    if (files.length) {
        var delay = file.size / 1e6 * 100 + 100;

        setTimeout(function () {
            if (dropbox.isCanceled) {
                return;
            }

            readFiles(files, inc);
        }, delay);
    }
}

function onFiles(files) {
    var inc = 100 / files.length;

    if (process.worker) {
        process.worker.postMessage({ action: "remove" });
    }

    process.zip = null;
    dropbox.isCanceled = false;
    (0, _mainJs.hideElement)(dropbox.downloadBtn);
    dropbox.beforeWork();
    readFiles(files, inc);
}

function onUpload(event) {
    var files = event.target.files;

    event.preventDefault();

    if (files.length) {
        onFiles(files);
    }
}

function onDrop(event) {
    counter = 0;
    (0, _mainJs.removeClass)(event.target, "over");

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
    (0, _mainJs.addClass)(event.target, "over");
}

function onDragleave(event) {
    if (dropbox.isWorking) {
        return;
    }

    counter -= 1;

    if (!counter) {
        (0, _mainJs.removeClass)(event.target, "over");
    }
}

document.getElementById("js-image-select").addEventListener("change", onUpload, false);
dropboxElement.addEventListener("dragover", onDragover, false);
dropboxElement.addEventListener("dragenter", onDragenter, false);
dropboxElement.addEventListener("dragleave", onDragleave, false);
dropboxElement.addEventListener("drop", onDrop, false);
dropboxElement.addEventListener("click", function (event) {
    if (dropbox.isWorking) {
        event.preventDefault();
    }
});