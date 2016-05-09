import * as state from "./editor.state.js";
import * as worker from "./editor.worker.js";
import * as dropbox from "./dropbox/dropbox.js";
import * as images from "./dropbox/dropbox.images.js";
import * as progress from "./dropbox/dropbox.progress.js";
import * as button from "./dropbox/dropbox.buttons.js";
import * as dashboard from "./resizer.dashboard.js";

const imageCount = (function() {
    let imageCount = 0;

    function setImageCount(count) {
        imageCount = count;
    }

    function getImageCount() {
        return imageCount;
    }

    function decrementImageCount() {
        imageCount -= 1;
    }

    return {
        set: setImageCount,
        get: getImageCount,
        decrement: decrementImageCount
    };
})();

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

function getUri(image, type, { width, height }) {
    const canvas = document.createElement("canvas");
    const quality = document.getElementById("js-image-quality").value / 100;

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);
    return canvas.toDataURL(type, quality);
}

function doneResizing() {
    if (state.get() === 0) {
        return;
    }
    button.hide("cancel");
    progress.reset();
    progress.setLabel("");
    dropbox.generateZip();
}

function resizeImage(image, imageToResize, measurments) {
    const imageMeasurment = {
        width: image.width,
        height: image.height
    };
    const adjustedDimensions = measurments.map(measurment => convertMeasurements(measurment, imageMeasurment));

    progress.setLabel(`Processing: ${imageToResize.name.original}`);

    return function resize(inc) {
        const dimension = adjustedDimensions.splice(0, 1)[0];

        progress.update(inc);
        worker.post({
            action: "add",
            image: {
                name: imageToResize.name.setByUser,
                uri: getUri(image, imageToResize.type, dimension),
                type: imageToResize.type.slice(6)
            }
        });
        imageCount.decrement();
        images.incStoredImageCount();
        if (!imageCount.get()) {
            setTimeout(doneResizing, 1600);
            return;
        }

        if (adjustedDimensions.length) {
            const delay = imageToResize.size * dimension.width * dimension.height / 2000 + 120;

            setTimeout(() => {
                if (state.get() !== 0) {
                    resize(inc);
                }
            }, delay);
        }
    };
}

function processImage(images, measurments) {
    const imageTotal = images.length * measurments.length;
    const inc = 100 / imageTotal;

    imageCount.set(imageTotal);
    return function process() {
        const image = new Image();
        const imageToResize = images.splice(0, 1)[0];

        image.onload = function() {
            if (state.get() !== 0) {
                const resize = resizeImage(image, imageToResize, measurments);

                resize(inc);
            }
        };
        image.src = imageToResize.uri;
        if (images.length) {
            const delay = imageToResize.size * 400 + 100;

            setTimeout(() => {
                if (state.get() !== 0) {
                    process();
                }
            }, delay);
        }
    };
}

function processImages() {
    const inputValues = dashboard.getInputValues();

    if (inputValues.length) {
        const imagesToProcess = images.getAll();
        const process = processImage(imagesToProcess, inputValues);

        worker.init();
        dropbox.beforeWork();
        process();
        dashboard.saveToLocalStorage(inputValues);
    }
    else {
        dropbox.resetDropbox();
    }
}

export { processImages };
