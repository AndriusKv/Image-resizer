"use strict";

import { toggleElement } from "./main.js";
import * as process from "./process.js";

const cropping = document.getElementById("js-crop");
const canvas = document.getElementById("js-canvas");
const ctx = canvas.getContext("2d");
const cropButton = document.getElementById("js-crop-ok");
const skipButton = document.getElementById("js-crop-skip");
const closeButton = document.getElementById("js-crop-close");
const image = new Image();
const scaledSelectionArea = {};
const mousePosition = {};
    
let selectionArea = {};
let position = "";
let moveSelectedArea = "";

function toggleButton(button, disabled) {
    button.disabled = disabled;
}

function toggleSkipButton(imageCount) {
    if (imageCount > 1) {
        toggleButton(skipButton, false);
    }
    else {
        toggleButton(skipButton, true);
    }
}

function updateRemainingImageIndicator(action) {
    const remainingImageIndicator = document.getElementById("js-crop-remaining");
    
    if (action === "remove") {
        remainingImageIndicator.textContent = "";
        return;
    }
    
    remainingImageIndicator.textContent = `${process.images.length - 1} images remaining`;
}

function displayImageName(name) {
    document.getElementById("js-crop-image-name").textContent = name;
}

function updateMeasurmentDisplay(width, height) {
    document.getElementById("js-crop-width").textContent = width < 0 ? -width + "px" : width + "px";
    document.getElementById("js-crop-height").textContent = height < 0 ? -height + "px" : height + "px";
}

function strokeRect() {
    const area = selectionArea;
    
    ctx.lineJoin = "miter";
    ctx.lineCap = "square";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.strokeRect(area.x, area.y, area.width, area.height);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(area.x, area.y, area.width, area.height);
}

function drawRect() {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    strokeRect();
}

function drawInitialImage(uri) {
    image.addEventListener("load", () => {
        const ratio = image.width / image.height;
        const maxHeight = window.innerHeight - 66;
        
        let width = window.innerWidth - 10;
        let height = width / ratio;
        
        toggleElement("add", cropping);
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
                
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    });

    image.src = uri;
}

function convertImageDataToUri(croppedImage) {
    return new Promise(resolve => {
        const image = new Image();

        image.addEventListener("load", () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const area = scaledSelectionArea;

            canvas.width = image.width;
            canvas.height = image.height;

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(area.x, area.y, area.width, area.height);

            canvas.width = imageData.width;
            canvas.height = imageData.height;
            ctx.putImageData(imageData, 0, 0);

            process.worker.postMessage({
                action: "add",
                image: {
                    name: croppedImage.name.setByUser,
                    uri: canvas.toDataURL(croppedImage.type),
                    type: croppedImage.type.slice(6)
                }
            });
            resolve();
        });

        image.src = croppedImage.uri;
    });
}

function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function getPositionName(x, y) {
    const margin = 4;
    const x2 = selectionArea.x;
    const y2 = selectionArea.y;
    const x3 = x2 + selectionArea.width;
    const y3 = y2 + selectionArea.height;
    const inXBound = x >= x2 - margin && x <= x3 + margin || x <= x2 + margin && x >= x3 - margin;
    const inYBound = y >= y2 - margin && y <= y3 + margin || y <= y2 + margin && y >= y3 - margin;
    const inNorthBound = y >= y2 - margin && y <= y2 + margin;
    const inEastBound = x >= x3 - margin && x <= x3 + margin;
    const inSouthBound = y >= y3 - margin && y <= y3 + margin;
    const inWestBound = x >= x2 - margin && x <= x2 + margin;
    
    if (inNorthBound) {
        if (inWestBound) {
            return "nw";
        }

        if (inEastBound) {
            return "ne";
        }
        
        if (inXBound) {
            return "n";
        }
    }
    
    if (inSouthBound) {
        if (inEastBound) {
            return "se";
        }

        if (inWestBound) {
            return "sw";
        }
        
        if (inXBound) {
            return "s";
        }
    }
    
    if (inYBound) {
        if (inEastBound) {
            return "e";
        }
        if (inWestBound) {
            return "w";
        }
    }
    
    return "";
}

function isMouseInsideSelectedArea(x, y) {
    const x2 = selectionArea.x;
    const y2 = selectionArea.y;
    const x3 = x2 + selectionArea.width;
    const y3 = y2 + selectionArea.height;
    const inXBound = x >= x2 && x <= x3 || x <= x2 && x >= x3;
    const inYBound = y >= y2 && y <= y3 || y <= y2 && y >= y3;
    
    return inXBound && inYBound;
}

function adjustOutsideCanvasXCoord(x) {
    if (x < 0) {
        return 0;
    }
    
    if (x > canvas.width) {
        return canvas.width;
    }
    
    return x;
}

function adjustOutsideCanvasYCoord(y) {
    if (y < 0) {
        return 0;
    }
    
    if (y > canvas.height) {
        return canvas.height;
    }
    
    return y;
}

function resizeSelectedArea(event) {
    const area = selectionArea;
    const adjustedSelectedArea = {};
    
    let { x, y } = getMousePosition(event);
    let selectedPosition = "";
    
    x = adjustOutsideCanvasXCoord(x);
    y = adjustOutsideCanvasYCoord(y);
    
    switch (position) {
        case "nw":
            adjustedSelectedArea.x = x;
            adjustedSelectedArea.y = y;
            adjustedSelectedArea.width = area.x - x + area.width;
            adjustedSelectedArea.height = area.y - y + area.height;
            selectedPosition = getReversePosition("nw", "ne");
            break;
        case "ne":
            adjustedSelectedArea.y = y;
            adjustedSelectedArea.height = area.y - y + area.height;
            adjustedSelectedArea.width = x - area.x;
            selectedPosition = getReversePosition("ne", "nw");
            break;
        case "se":
            adjustedSelectedArea.width = x - area.x;
            adjustedSelectedArea.height = y - area.y;
            selectedPosition = getReversePosition("se", "sw");
            break;
        case "sw":
            adjustedSelectedArea.x = x;
            adjustedSelectedArea.width = area.x - x + area.width;
            adjustedSelectedArea.height = y - area.y;
            selectedPosition = getReversePosition("sw", "se");
            break;
        case "n":
            adjustedSelectedArea.y = y;
            adjustedSelectedArea.height = area.y - y + area.height;
            break;
        case "e":
            adjustedSelectedArea.width = x - area.x;
            break;
        case "s":
            adjustedSelectedArea.height = y - area.y;
            break;
        case "w":
            adjustedSelectedArea.x = x;
            adjustedSelectedArea.width = area.x - x + area.width;
            break;
    }
    
    if (selectedPosition) {
        canvas.style.cursor = selectedPosition + "-resize";
    }
    
    Object.assign(selectionArea, adjustedSelectedArea);
    
    requestAnimationFrame(drawRect);
    
    updateScaledArea();
}

function adjustSelectedAreaPosition(coord, dimension) {
    const coordMeasurment = selectionArea[coord];
    const dimensionMeasurment = selectionArea[dimension];
    const canvasMeasurment = canvas[dimension];
    
    if (coordMeasurment < 0) {
        selectionArea[coord] = 0;
    }
    
    if (coordMeasurment + dimensionMeasurment > canvasMeasurment) {
        selectionArea[coord] = canvasMeasurment - dimensionMeasurment;
    }
    else if (coordMeasurment + dimensionMeasurment < 0) {
        selectionArea[coord] = -dimensionMeasurment;
    }
    else if (coordMeasurment > canvasMeasurment) {
        selectionArea[coord] = canvasMeasurment;
    }
}

function getDistanceBetweenPoints(x, y) {
    const xDiff = x - selectionArea.x;
    const yDiff = y - selectionArea.y;
    
    return function(event) {
        if (!event.ctrlKey) {
            return;
        }
        
        const { x, y } = getMousePosition(event);

        selectionArea.x = x - xDiff;
        selectionArea.y = y - yDiff;

        adjustSelectedAreaPosition("x", "width");
        adjustSelectedAreaPosition("y", "height");

        drawRect();
    };
}

function onSelectionStart(event) {
    if (event.which !== 1) {
        return;
    }
    
    const { x, y } = getMousePosition(event);
        
    position = getPositionName(x, y);
    
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    canvas.removeEventListener("mousemove", changeCursor, false);
    document.removeEventListener("keydown", changeCursorToMove, false);
    
    if (position && selectionArea.width && selectionArea.height) {
        strokeRect();
        
        cropping.addEventListener("mousemove", resizeSelectedArea, false);
        cropping.addEventListener("mouseup", lockAdjustedArea, false);
    }
    else if (event.ctrlKey && isMouseInsideSelectedArea(x, y)) {
        moveSelectedArea = getDistanceBetweenPoints(x, y);
        
        strokeRect();
        
        cropping.addEventListener("mousemove", moveSelectedArea, false);
        cropping.addEventListener("mouseup", lockMovedArea, false);
    }
    else {
        selectionArea.x = x;
        selectionArea.y = y;
        selectionArea.width = 0;
        selectionArea.height = 0;
                
        cropping.addEventListener("mousemove", selectArea, false);
        cropping.addEventListener("mouseup", lockSelectedArea, false);
    }
}

function selectArea(event) {
    let { x, y } = getMousePosition(event);
    
    x = adjustOutsideCanvasXCoord(x);
    y = adjustOutsideCanvasYCoord(y);
    
    selectionArea.width = x - selectionArea.x;
    selectionArea.height = y - selectionArea.y;

    requestAnimationFrame(drawRect);
    
    updateScaledArea();
}

function removeMoveCursor() {
    canvas.style.cursor = "default";
    document.removeEventListener("keyup", removeMoveCursor, false);
}

function changeCursorToMove(event) {
    if (event.ctrlKey && isMouseInsideSelectedArea(mousePosition.x, mousePosition.y)) {
        canvas.style.cursor = "move";
        document.addEventListener("keyup", removeMoveCursor, false);
    }
}

function updateScaledArea() {
    const widthRatio = image.width / canvas.width;
    const heightRatio = image.height / canvas.height;
    
    scaledSelectionArea.x = Math.round(selectionArea.x * widthRatio);
    scaledSelectionArea.y = Math.round(selectionArea.y * heightRatio);
    scaledSelectionArea.width = Math.round(selectionArea.width * widthRatio);
    scaledSelectionArea.height = Math.round(selectionArea.height * heightRatio);
    
    updateMeasurmentDisplay(scaledSelectionArea.width, scaledSelectionArea.height);
}

function toggleCropButton() {
    if (selectionArea.width && selectionArea.height) {
        canvas.addEventListener("mousemove", changeCursor, false);
        document.addEventListener("keydown", changeCursorToMove, false);
        toggleButton(cropButton, false);
    }
    else {
        selectionArea = {};
        updateMeasurmentDisplay(0, 0);
        canvas.style.cursor = "default";
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        toggleButton(cropButton, true);
    }
}

function getReversePosition(position, reversePosition) {
    const x = selectionArea.x;
    const y = selectionArea.y;
    const x2 = x + selectionArea.width;
    const y2 = y + selectionArea.height;
        
    if (x2 > x) {
        if (y2 < y) {
            return reversePosition;
        }
    }
    else if (y2 > y) {
        return reversePosition;
    }
    
    return position;
}

function changeCursor(event) {
    const { x, y } = getMousePosition(event);
    
    mousePosition.x = x;
    mousePosition.y = y;
    
    if (event.ctrlKey && isMouseInsideSelectedArea(x, y)) {
        canvas.style.cursor = "move";
        return;
    }
    
    let position = getPositionName(x, y);
    
    switch (position) {
        case "nw":
            position = getReversePosition("nw", "ne");
            break;
        case "ne":
            position = getReversePosition("ne", "nw");
            break;
        case "sw":
            position = getReversePosition("sw", "se");
            break;
        case "se":
            position = getReversePosition("se", "sw");
            break;
    }
    
    canvas.style.cursor = position ? position + "-resize" : "default";
}

function lockAdjustedArea() {
    cropping.removeEventListener("mousemove", resizeSelectedArea, false);
    cropping.removeEventListener("mouseup", lockAdjustedArea, false);

    toggleCropButton();
}

function lockMovedArea() {
    cropping.removeEventListener("mousemove", moveSelectedArea, false);
    cropping.removeEventListener("mouseup", lockMovedArea, false);
    
    toggleCropButton();
}

function lockSelectedArea() {
    cropping.removeEventListener("mousemove", selectArea, false);
    cropping.removeEventListener("mouseup", lockSelectedArea, false);
    
    toggleCropButton();
}

function init() {
    const image = process.images[0];
    
    process.initWorker();
    displayImageName(image.name.original);
    drawInitialImage(image.uri);
    toggleButton(cropButton, true);
    toggleSkipButton(process.images.length);
    canvas.addEventListener("mousedown", onSelectionStart, false);
    
    if (process.images.length > 1) {
        updateRemainingImageIndicator();
    }
}

function loadNextImage(image) {
    toggleSkipButton(process.images.length);
    toggleButton(cropButton, true);
    
    if (process.images.length) {
        updateRemainingImageIndicator();
        selectionArea = {};
        displayImageName(image.name.original);
        updateMeasurmentDisplay(0, 0);
        drawInitialImage(image.uri);
    }
}

function cropImage() {
    const image = process.images.splice(0, 1)[0];
    
    convertImageDataToUri(image)
        .then(() => {
            loadNextImage(process.images[0]);

            if (!process.images.length) {
                updateRemainingImageIndicator("remove");
                canvas.removeEventListener("mousedown", onSelectionStart, false);
                toggleElement("remove", cropping);
                process.generateZip();
            }
        });
}

function skipImage() {
    process.images.splice(0, 1);
    
    loadNextImage(process.images[0]);
}

function closeCropping() {
    selectionArea = {};
    updateMeasurmentDisplay(0, 0);
    updateRemainingImageIndicator("remove");
    toggleElement("remove", cropping);
    process.worker.postMessage({ action: "generate" });
}

cropButton.addEventListener("click", cropImage, false);
skipButton.addEventListener("click", skipImage, false);
closeButton.addEventListener("click", closeCropping, false);

export { init };
