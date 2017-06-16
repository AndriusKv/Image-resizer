import * as state from "./editor.state.js";
import * as dropbox from "./dropbox/dropbox.js";
import * as images from "./dropbox/dropbox.images.js";
import * as progress from "./dropbox/dropbox.progress.js";
import * as button from "./dropbox/dropbox.buttons.js";
import * as dashboard from "./resizer.dashboard.js";
import { postMessageToWorker } from "./editor.worker.js";

function getSecondDimension(dimension) {
    return dimension === "width" ? "height" : "width";
}

function convertMeasurement(dimension, measurement, originalMeasurement) {
    const dimension2 = getSecondDimension(dimension);
    const value = measurement[dimension] === "same" ? measurement[dimension2] : measurement[dimension];
    const originalValue = originalMeasurement[dimension];

    if (value.includes("%")) {
        return originalValue * (parseInt(value, 10) / 100);
    }
    else if (value === "original" || value === dimension) {
        return parseInt(originalValue, 10);
    }
    else if (value === dimension2) {
        return parseInt(originalMeasurement[dimension2], 10);
    }
    return parseInt(value, 10);
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

function getAdjustedDimensions(measurments, imageMeasurment) {
    return measurments.map(measurment => convertMeasurements(measurment, imageMeasurment));
}

function getUri(image, type, { width, height }) {
    const canvas = document.createElement("canvas");
    const quality = document.getElementById("js-image-quality").value / 100;

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);
    return canvas.toDataURL(type, quality);
}

function doneResizing() {
    button.hide("cancel");
    progress.reset();
    progress.setLabel("");
    dropbox.generateZip();
}

function storeImage(image, imageToResize, dimension) {
    return new Promise(resolve => {
        postMessageToWorker({
            action: "add",
            image: {
                name: imageToResize.name.setByUser,
                uri: getUri(image, imageToResize.type, dimension),
                type: imageToResize.type.slice(6)
            }
        });
        resolve();
    });
}

function resizeImage(image, imageToResize, adjustedDimensions, inc) {
    const dimension = adjustedDimensions.splice(0, 1)[0];

    return storeImage(image, imageToResize, dimension)
        .then(() => {
            progress.update(inc);

            if (state.get() !== 0 && adjustedDimensions.length) {
                resizeImage(image, imageToResize, adjustedDimensions, inc);
            }
        });
}

function processImage(images, measurments, inc) {
    const image = new Image();
    const imageToResize = images.splice(0, 1)[0];

    image.onload = function() {
        if (state.get() === 0) {
            return;
        }
        const imageMeasurment = {
            width: image.width,
            height: image.height
        };
        const adjustedDimensions = getAdjustedDimensions(measurments, imageMeasurment);

        progress.setLabel(`Processing: ${imageToResize.name.original}`);
        resizeImage(image, imageToResize, adjustedDimensions, inc)
        .then(() => {
            if (state.get() !== 0) {
                if (!images.length) {
                    setTimeout(doneResizing, 1000);
                    return;
                }
                processImage(images, measurments, inc);
            }
        });
    };
    image.src = imageToResize.uri;
}

function processImages() {
    const inputValues = dashboard.getInputValues();

    if (!inputValues.length) {
        dropbox.resetDropbox();
        return;
    }

    const imagesToProcess = images.getAll();
    const imageTotal = imagesToProcess.length * inputValues.length;
    const inc = 100 / imageTotal;

    dropbox.beforeWork();
    processImage(imagesToProcess, inputValues, inc);
    dashboard.saveToLocalStorage(inputValues);
}

export { processImages };
