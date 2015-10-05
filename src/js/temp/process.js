/* global saveAs */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _selectionsJs = require("./selections.js");

var select = _interopRequireWildcard(_selectionsJs);

var _dropboxJs = require("./dropbox.js");

var dropbox = _interopRequireWildcard(_dropboxJs);

var _mainJs = require("./main.js");

var images = [],
    worker,
    zip;

function showMessageWithButton(message, button) {
    (0, _mainJs.showMessage)(message);
    (0, _mainJs.showElement)(button);
}

function initWorker() {
    if (!worker) {
        exports.worker = worker = new Worker("js/workers/worker1.js");

        worker.onmessage = function (event) {
            exports.zip = zip = event.data;
            dropbox.isWorking = false;
            dropbox.removeMasksAndLabel();
            showMessageWithButton("Images are ready for downloading.", dropbox.downloadBtn);
            worker.postMessage({ action: "remove" });
        };
        worker.onerror = function (event) {
            console.log(event);
        };
    }
}

function saveZip(data) {
    try {
        saveAs(data, "images.zip");
    } catch (error) {
        var script = document.createElement("script");

        script.setAttribute("src", "js/libs/FileSaver.min.js");

        document.getElementsByTagName("body")[0].appendChild(script);

        script.onload = function () {
            saveZip(data);
        };
    }
}

function getDimensionsWithoutRatio(_ref) {
    var width = _ref.width;
    var height = _ref.height;

    if (width && !height) {
        height = width;
    } else if (!width && height) {
        width = height;
    }

    return { width: width, height: height };
}

function getDimensionsWithRatio(_ref2, ratio) {
    var width = _ref2.width;
    var height = _ref2.height;

    if (width) {
        height = width / ratio;
    } else if (height) {
        width = height * ratio;
    }

    return { width: width, height: height };
}

function getUri(image, type, _ref3) {
    var width = _ref3.width;
    var height = _ref3.height;

    var canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);

    return canvas.toDataURL(type);
}

function generateZip() {
    dropbox.setProgressLabel("Generating Archive");
    worker.postMessage({ action: "generate" });
}

function doneResizing() {
    setTimeout(function () {
        if (dropbox.isCanceled) {
            return;
        }

        (0, _mainJs.hideElement)(dropbox.progressBar);
        (0, _mainJs.hideElement)(dropbox.cancelBtn);
        dropbox.resetProgress();
        generateZip();
    }, 1000);
}

function resizeImage(image, imageToResize, inc) {
    return function resize(dimensions) {
        var dimension = dimensions.splice(0, 1)[0];

        dropbox.updateProgress(inc);

        worker.postMessage({
            action: "add",
            image: {
                name: imageToResize.name,
                uri: getUri(image, imageToResize.type, dimension),
                type: imageToResize.type.slice(6)
            }
        });

        if (dropbox.isDone()) {
            doneResizing();
        }

        if (dimensions.length) {
            var delay = imageToResize.size * dimension.width * dimension.height / 2000 + 100;

            setTimeout(function () {
                if (dropbox.isCanceled) {
                    return;
                }

                resize(dimensions);
            }, delay);
        }
    };
}

function processImage(images, dimensions) {
    var inc = 100 / (images.length * dimensions.length);

    return function process(cb) {
        var image = new Image(),
            imageToResize = images.splice(0, 1)[0];

        image.onload = function () {
            var ratio = image.width / image.height,
                adjustedDimensions = dimensions.map(function (dimension) {
                return cb(dimension, ratio);
            }),
                resize = resizeImage(image, imageToResize, inc);

            if (dropbox.isCanceled) {
                return;
            }

            dropbox.setProgressLabel("Processing: " + imageToResize.name);
            resize(adjustedDimensions);
        };
        image.src = imageToResize.uri;

        if (images.length) {
            var delay = imageToResize.size * 400 + 100;

            setTimeout(function () {
                if (dropbox.isCanceled) {
                    return;
                }

                process(cb);
            }, delay);
        }
    };
}

function inputsValid() {
    var widths = select.widthInputCointaner.children,
        heights = select.heightInputContainer.children;

    if (!select.hasValue(widths) && !select.hasValue(heights)) {
        showMessageWithButton("No dimensions specified.", dropbox.processBtn);
        return false;
    }

    var isValidWidth = select.isValid(widths),
        isValidHeight = select.isValid(heights);

    if (!isValidWidth || !isValidHeight) {
        showMessageWithButton("Only numbers allowed.", dropbox.processBtn);
        return false;
    }

    return true;
}

function getDimensions() {
    var widths = select.widthInputCointaner.children,
        heights = select.heightInputContainer.children,
        dimensions = [];

    for (var i = 0, l = widths.length; i < l; i++) {
        var width = Number.parseInt(widths[i].value, 10),
            height = Number.parseInt(heights[i].value, 10);

        if (width || height) {
            dimensions.push({ width: width, height: height });
        }
    }

    return dimensions;
}

function processImages() {
    if (!inputsValid()) {
        dropbox.resetDropbox();
        return;
    }

    initWorker();
    dropbox.beforeWork();

    var dimensions = getDimensions(),
        process = processImage(images, dimensions);

    if (select.checkbox.checked) {
        process(getDimensionsWithRatio);
    } else {
        process(getDimensionsWithoutRatio);
    }

    select.saveToLocalStorage();
}

function downloadImages() {
    saveZip(zip);
}

function cancelWork() {
    dropbox.isCanceled = true;
    exports.zip = zip = null;
    images.length = 0;
    dropbox.resetDropbox();
    (0, _mainJs.showMessage)("Work canceled.");
}

dropbox.processBtn.addEventListener("click", processImages, false);
dropbox.downloadBtn.addEventListener("click", downloadImages, false);
dropbox.cancelBtn.addEventListener("click", cancelWork, false);

exports.zip = zip;
exports.images = images;
exports.worker = worker;
exports.processImages = processImages;