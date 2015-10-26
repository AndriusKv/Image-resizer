(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mainJs = require("./main.js");

var progressBar = document.getElementById("js-progress"),
    processBtn = document.getElementById("js-process"),
    downloadBtn = document.getElementById("js-download"),
    cancelBtn = document.getElementById("js-cancel"),
    isCanceled = false,
    isWorking = false;

function setProgressLabel(text) {
    requestAnimationFrame(function () {
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
    (0, _mainJs.removeMasks)();
}

function beforeWork() {
    (0, _mainJs.addMasks)();
    exports.isWorking = isWorking = true;
    (0, _mainJs.showElement)(progressBar);
    (0, _mainJs.hideElement)(processBtn);
    (0, _mainJs.showElement)(cancelBtn);
}

function resetDropbox() {
    exports.isWorking = isWorking = false;
    (0, _mainJs.hideElement)(progressBar);
    (0, _mainJs.hideElement)(cancelBtn);
    resetProgress();
    removeMasksAndLabel();
}

exports.isDone = isDone;
exports.cancelBtn = cancelBtn;
exports.isWorking = isWorking;
exports.beforeWork = beforeWork;
exports.isCanceled = isCanceled;
exports.processBtn = processBtn;
exports.progressBar = progressBar;
exports.downloadBtn = downloadBtn;
exports.resetDropbox = resetDropbox;
exports.resetProgress = resetProgress;
exports.updateProgress = updateProgress;
exports.setProgressLabel = setProgressLabel;
exports.removeMasksAndLabel = removeMasksAndLabel;
},{"./main.js":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

require("./dropbox.js");

require("./selections.js");

require("./read.js");

require("./process.js");

var dropboxLabel = document.getElementById("js-dropbox-label"),
    settingsMask = document.getElementById("js-selections-mask"),
    timeout;

function addClass(target, classToAdd) {
    var targetClassList = target.classList;

    if (!targetClassList.contains(classToAdd)) {
        targetClassList.add(classToAdd);
    }
}

function removeClass(target, classToRemove) {
    var targetClassList = target.classList;

    if (targetClassList.contains(classToRemove)) {
        targetClassList.remove(classToRemove);
    }
}

function showElement(element) {
    addClass(element, "show");
}

function hideElement(element) {
    removeClass(element, "show");
}

function addMasks() {
    addClass(dropboxLabel, "mask");
    addClass(settingsMask, "mask");
}

function removeMasks() {
    removeClass(dropboxLabel, "mask");
    removeClass(settingsMask, "mask");
}

function hideMessageAfter(delay) {
    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(function () {
        showMessage("");
    }, delay);
}

function showMessage(message) {
    requestAnimationFrame(function () {
        document.getElementById("js-msg").innerHTML = message;
    });

    if (!message) {
        return;
    }

    hideMessageAfter(2000);
}

exports.addMasks = addMasks;
exports.removeMasks = removeMasks;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.showElement = showElement;
exports.hideElement = hideElement;
exports.showMessage = showMessage;
},{"./dropbox.js":1,"./process.js":3,"./read.js":4,"./selections.js":5}],3:[function(require,module,exports){
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

function convertToPixels(value, percentage) {
    return value * (Number.parseInt(percentage, 10) / 100);
}

function convertDimension(dimenion, imageDimenion) {
    if (!dimenion) {
        return;
    }

    if (dimenion.includes("%")) {
        return convertToPixels(imageDimenion, dimenion);
    }

    return Number.parseInt(dimenion, 10);
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
            if (dropbox.isCanceled) {
                return;
            }

            var resize = resizeImage(image, imageToResize, inc),
                ratio = image.width / image.height,
                adjustedDimensions = [];

            adjustedDimensions = dimensions.map(function (dimension) {
                return {
                    width: convertDimension(dimension.width, image.width),
                    height: convertDimension(dimension.height, image.height)
                };
            }).map(function (dimension) {
                return cb(dimension, ratio);
            });

            console.log(adjustedDimensions);
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
        showMessageWithButton("Only values in pixels or percents are allowed.", dropbox.processBtn);
        return false;
    }

    return true;
}

function getDimensions() {
    var widths = select.widthInputCointaner.children,
        heights = select.heightInputContainer.children,
        dimensions = [];

    for (var i = 0, l = widths.length; i < l; i++) {
        var width = widths[i].value,
            height = heights[i].value;

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
},{"./dropbox.js":1,"./main.js":2,"./selections.js":5}],4:[function(require,module,exports){
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
},{"./dropbox.js":1,"./main.js":2,"./process.js":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mainJs = require("./main.js");

var widthInputCointaner = document.getElementById("js-width-input-container"),
    heightInputContainer = document.getElementById("js-height-input-container"),
    checkbox = document.getElementById("js-checkbox"),
    select = document.getElementById("js-select");

(function loadFromLocalStorage() {
    var selections = localStorage.getItem("Selections");

    if (!selections) {
        return;
    }

    selections = JSON.parse(selections);

    checkbox.checked = selections.checked;
    select.value = selections.numberOfInputs;

    appendInputs(widthInputCointaner, selections.numberOfInputs);
    appendInputs(heightInputContainer, selections.numberOfInputs);

    assignValuesToInputs(widthInputCointaner.children, selections.widthInputValues);
    assignValuesToInputs(heightInputContainer.children, selections.heightInputValues);
})();

function saveToLocalStorage() {
    var selections = {
        numberOfInputs: select.value,
        checked: checkbox.checked,
        widthInputValues: getInputValues(widthInputCointaner.children),
        heightInputValues: getInputValues(heightInputContainer.children)
    };

    localStorage.setItem("Selections", JSON.stringify(selections));
}

function indicateInput(input) {
    (0, _mainJs.addClass)(input, "invalid");

    setTimeout(function () {
        (0, _mainJs.removeClass)(input, "invalid");
    }, 400);
}

function isValid(inputs) {
    var regex = /^\d+(px|%)?$/,
        valid = true;

    Array.prototype.forEach.call(inputs, function (input) {
        if (input.value && !regex.test(input.value)) {
            indicateInput(input);
            valid = false;
        }
    });

    return valid;
}

function hasValue(inputs) {
    return Array.prototype.some.call(inputs, function (input) {
        return input.value;
    });
}

function assignValuesToInputs(inputs, values) {
    Array.prototype.forEach.call(inputs, function (input, index) {
        input.value = values[index];
    });
}

function getInputValues(inputs) {
    return Array.prototype.map.call(inputs, function (input) {
        return input.value;
    });
}

function createInput() {
    var input = document.createElement("input");

    input.setAttribute("type", "text");
    input.classList.add("image-input");

    return input;
}

function createInputs(num) {
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < num; i++) {
        fragment.appendChild(createInput());
    }

    return fragment;
}

function appendInputs(element, num) {
    var totalChildren = element.children.length;

    if (totalChildren < num) {
        var toAppend = num - totalChildren;

        element.appendChild(createInputs(toAppend));
    } else {
        var toRemove = totalChildren - num;

        while (toRemove--) {
            totalChildren = element.children.length;
            element.removeChild(element.children[totalChildren - 1]);
        }
    }
}

function onSelection(event) {
    var numberOfInputs = Number.parseInt(event.target.value, 10);

    appendInputs(widthInputCointaner, numberOfInputs);
    appendInputs(heightInputContainer, numberOfInputs);
}

select.addEventListener("input", onSelection, false);

exports.widthInputCointaner = widthInputCointaner;
exports.heightInputContainer = heightInputContainer;
exports.saveToLocalStorage = saveToLocalStorage;
exports.hasValue = hasValue;
exports.isValid = isValid;
exports.checkbox = checkbox;
},{"./main.js":2}]},{},[2]);

//# sourceMappingURL=main.js.map
