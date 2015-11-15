/* global saveAs */

"use strict";

import * as select from "./selections.js";
import * as dropbox from "./dropbox.js";
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
        let script = document.createElement("script");
        
        script.setAttribute("src", "js/libs/FileSaver.min.js");
        
        document.getElementsByTagName("body")[0].appendChild(script);
        
        script.onload = function() {
            saveAs(data, "images.zip");
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

function getDimensionsWithoutRatio({width: width, height: height}) {
    if (width && !height) {
        height = width;
    }
    else if (!width && height) {
        width = height;
    }

    return { width, height };
}

function getDimensionsWithRatio({width: width, height: height}, ratio) {
    if (width) {
        height = width / ratio;
    }
    else if (height) {
        width = height * ratio;
    }
	
    return { width, height };
}

function getUri(image, type, {width: width, height: height}) {
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

function resizeImage(image, imageToResize, inc) {
    return function resize(dimensions) {
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
            let delay = imageToResize.size * dimension.width * dimension.height / 2000 + 100;
            
            setTimeout(() => {
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

        image.onload = function() {
            if (dropbox.isCanceled) {
                return;
            }
            
            let resize = resizeImage(image, imageToResize, inc),
                ratio = image.width / image.height,
                adjustedDimensions = [];
            
            adjustedDimensions = dimensions
                .map(dimension => {
                    return {
                        width: convertDimension(dimension.width, image.width),
                        height: convertDimension(dimension.height, image.height)
                    };
                })
                .map(dimension => cb(dimension, ratio));
            
            dropbox.setProgressLabel(`Processing: ${imageToResize.name.original}`);
            resize(adjustedDimensions);
        };
        image.src = imageToResize.uri;
        
        if (images.length) {
            let delay = imageToResize.size * 400 + 100;
            
            setTimeout(() => {
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
    
    let isValidWidth = select.isValid(widths),
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
    
    for (let i = 0, l = widths.length; i < l; i++) {
        let width = widths[i].value,
            height = heights[i].value;

        if (width || height) {
            dimensions.push({ width, height });
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
	
    let dimensions = getDimensions(),
        process = processImage(images, dimensions);
    
    if (select.checkbox.checked) {
        process(getDimensionsWithRatio);
    }
    else {
        process(getDimensionsWithoutRatio);
    }
    
    select.saveToLocalStorage();
}

function downloadImages() {
    saveZip(zip);
}

function cancelWork() {
    dropbox.isCanceled = true;
    zip = null;
    images.length = 0;
    dropbox.resetDropbox();
    dropbox.showMessage("Work canceled.");
}

dropbox.processBtn.addEventListener("click", processImages, false);
dropbox.downloadBtn.addEventListener("click", downloadImages, false);
dropbox.cancelBtn.addEventListener("click", cancelWork, false);

export { zip, images, worker, processImages };
