/* global saveAs */

"use strict";

import * as dropbox from "./dropbox.js";
import * as settings from "./resizer-settings.js";
import { toggleElement } from "./main.js";

let images = [],
    worker,
    zip;

function showMessageWithButton(message, button) {
    dropbox.showMessage(message);
    toggleElement("add", button);
}

function initWorker() {
    if (!worker) {
        worker = new Worker("js/workers/worker1.js");

        worker.onmessage = function(event) {
            zip = event.data;
            dropbox.isWorking = false;
            dropbox.removeMasksAndLabel();
            showMessageWithButton("Images are ready for downloading.", dropbox.downloadBtn);
            worker.postMessage({ action: "remove" });
        };
        worker.onerror = function(event) {
            console.log(event);
        };
    }
}

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

function getSecondDimension(dimension) {
    return dimension === "width" ? "height" : "width";
}

function convertMeasurement(dimension, measurement, originalMeasurement) {
    const dimension2 = getSecondDimension(dimension);
    const value = measurement[dimension] === "same" ? measurement[dimension2] : measurement[dimension];
    const originalValue = originalMeasurement[dimension];

    if (value.includes("%")) {
        return originalValue * (Number.parseInt(value, 10) / 100);
    }
    else if (value === "original" || value === dimension) {
        return Number.parseInt(originalValue, 10);
    }
    else if (value === dimension2) {
        return Number.parseInt(originalMeasurement[dimension2], 10);
    }

    return Number.parseInt(value, 10);
}

function convertMeasurements(measurement, originalMeasurement) {
    const ratio = originalMeasurement.width / originalMeasurement.height;

    let newWidth = 0;
    let newHeight = 0;

    if (measurement.width) {
        newWidth = convertMeasurement("width", measurement, originalMeasurement);

        if (!measurement.height) {
            newHeight = newWidth / ratio;
        }
        else if (measurement.width === "same") {
            newHeight = newWidth;
        }
    }

    if (!newHeight && measurement.height) {
        newHeight = convertMeasurement("height", measurement, originalMeasurement);

        if (!measurement.width) {
            newWidth = newHeight * ratio;
        }
        else if (!newWidth && measurement.height === "same") {
            newWidth = newHeight;
        }
    }

    return {
        width: newWidth,
        height: newHeight
    };
}

function getUri(image, type, { width: width, height: height }) {
    const canvas = document.createElement("canvas");
    const quality = document.getElementById("js-image-quality").value / 100;

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);

    return canvas.toDataURL(type, quality);
}

function generateZip() {
    dropbox.setProgressLabel("Generating Archive");
    worker.postMessage({ action: "generate" });
}

function doneResizing() {
    setTimeout(() => {
        if (dropbox.isCanceled) {
            return;
        }

        toggleElement("remove", dropbox.progressBar);
        toggleElement("remove", dropbox.cancelBtn);
        dropbox.resetProgress();
        generateZip();
    }, 1000);
}

function resizeImage(image, imageToResize) {
    return function resize(dimensions, inc) {
        const dimension = dimensions.splice(0, 1)[0];

        dropbox.updateProgress(inc);

        worker.postMessage({
            action: "add",
            image: {
                name: imageToResize.name.setByUser,
                uri: getUri(image, imageToResize.type, dimension),
                type: imageToResize.type.slice(6)
            }
        });

        if (dropbox.isDone()) {
            doneResizing();
        }

        if (dimensions.length) {
            const delay = imageToResize.size * dimension.width * dimension.height / 2000 + 100;

            setTimeout(() => {
                if (dropbox.isCanceled) {
                    return;
                }

                resize(dimensions, inc);
            }, delay);
        }
    };
}

function processImage(images, measurments) {
    const inc = 100 / (images.length * measurments.length);

    return function process() {
        const image = new Image();
        const imageToResize = images.splice(0, 1)[0];

        image.onload = function() {
            if (dropbox.isCanceled) {
                return;
            }

            const resize = resizeImage(image, imageToResize);
            const imageMeasurment = {
                width: image.width,
                height: image.height
            };
            const adjustedDimensions = measurments.map(measurment => convertMeasurements(measurment, imageMeasurment));

            dropbox.setProgressLabel(`Processing: ${imageToResize.name.original}`);
            resize(adjustedDimensions, inc);
        };

        image.src = imageToResize.uri;

        if (images.length) {
            const delay = imageToResize.size * 400 + 100;

            setTimeout(() => {
                if (dropbox.isCanceled) {
                    return;
                }
                process();
            }, delay);
        }
    };
}

function verifyValues(values) {
    if (!values.length) {
        showMessageWithButton("No dimensions specified", dropbox.processBtn);
    }
    else {
        values = values.filter(value => settings.verifyValues(value.width, value.height));

        if (!values.length) {
            showMessageWithButton("No valid values", dropbox.processBtn);
        }
    }
    return values;
}

function getInputValues(inputs) {
    const values = [];

    for (let i = 0, l = inputs.length; i < l; i += 2) {
        const width = inputs[i].value,
            height = inputs[i + 1].value;

        if (width || height) {
            values.push({ width, height });
        }
    }
    return values;
}

function processImages() {
    let inputValues = getInputValues(settings.dimensionInputContainer.children);

    inputValues = verifyValues(inputValues);

    if (!inputValues.length) {
        dropbox.resetDropbox();
        return;
    }

    const process = processImage(images, inputValues);

    initWorker();
    dropbox.beforeWork();
    process();
    settings.saveToLocalStorage(inputValues);
}

function downloadImages() {
    saveZip(zip);
}

function cancelWork() {
    dropbox.isCanceled = true;
    zip = null;
    images.length = 0;
    dropbox.resetDropbox();
    dropbox.showMessage("Work canceled");
}

dropbox.processBtn.addEventListener("click", processImages, false);
dropbox.downloadBtn.addEventListener("click", downloadImages, false);
dropbox.cancelBtn.addEventListener("click", cancelWork, false);

export { zip, images, worker, processImages, initWorker, generateZip, getInputValues };
