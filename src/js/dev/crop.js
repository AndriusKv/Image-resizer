"use strict";

import { toggleElement } from "./main.js";
import * as process from "./process.js";

const cropping = document.getElementById("js-crop");
const canvas = document.getElementById("js-canvas");
const ctx = canvas.getContext("2d");
const cropButton = document.getElementById("js-crop-ok");
const skipButton = document.getElementById("js-crop-skip");
const closeButton = document.getElementById("js-crop-close");
const previewButton = document.getElementById("js-crop-preview-btn");
const cropPreview = document.getElementById("js-crop-preview");
const image = new Image();
const scaledSelectionArea = {};
const mousePosition = {};
    
let selectionArea = {};
let position = "";
let moveSelectedArea = "";
let widthRatio = 1;
let heightRatio = 1;
let isPreviewOpen = false;

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

function updatePointDisplay(x = 0, y = 0) {
    if (x) {
        if (selectionArea.width > 0) {
            x = selectionArea.x;
        }
        else {
            x = selectionArea.x + selectionArea.width;
        }
    }

    if (y) {
        if (selectionArea.height > 0) {
            y = selectionArea.y;
        }
        else {
            y = selectionArea.y + selectionArea.height;
        }
    }

    document.getElementById("js-crop-x").textContent = Math.round(x * widthRatio);
    document.getElementById("js-crop-y").textContent = Math.round(y * heightRatio);
}

function updateMeasurmentDisplay(width, height) {
    document.getElementById("js-crop-width").textContent = width < 0 ? -width : width;
    document.getElementById("js-crop-height").textContent = height < 0 ? -height : height;
}

function strokeRect() {
    const area = selectionArea;
    
    let x = area.x;
    let y = area.y;
    let imageData;

    if (area.width && area.height) {
        imageData = ctx.getImageData(area.x, area.y, area.width, area.height);

        if (area.width < 0) {
            x = x + area.width;
        }

        if (area.height < 0) {
            y = y + area.height;
        }
    }

    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (imageData) {
        ctx.putImageData(imageData, x, y);
    }

    ctx.strokeStyle = "#006494";
    ctx.strokeRect(area.x + 0.5, area.y + 0.5, area.width, area.height);
}

function drawRect() {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    strokeRect();
}

function drawInitialImage(uri) {
    image.addEventListener("load", () => {
        const ratio = image.width / image.height;
        const maxWidth = window.innerWidth - 212;
        const maxHeight = window.innerHeight - 40;

        let width = image.width;
        let height = image.height;

        toggleElement("add", cropping);
        
        if (width > maxWidth) {
            width = maxWidth;
            height = width / ratio;
        }

        if (height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;

        widthRatio = image.width / canvas.width;
        heightRatio = image.height / canvas.height;

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    });

    image.src = uri;
}

function getCroppedImage(image, imageType = "image/jpg") {
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

    return {
        uri: canvas.toDataURL(imageType),
        width: canvas.width,
        height: canvas.height
    };
}

function sendImageToWorker(imageToCrop) {
    const image = new Image();

    image.addEventListener("load", () => {
        const croppedImage = getCroppedImage(image, imageToCrop.type);

        process.worker.postMessage({
            action: "add",
            image: {
                name: imageToCrop.name.setByUser,
                type: imageToCrop.type.slice(6),
                uri: croppedImage.uri
            }
        });

        if (!process.images.length) {
            updateRemainingImageIndicator("remove");
            canvas.removeEventListener("mousedown", onSelectionStart, false);
            toggleElement("remove", cropping);
            process.generateZip();
        }
    });

    image.src = imageToCrop.uri;
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

    updatePointDisplay(selectionArea.x, selectionArea.y);
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

    updatePointDisplay(selectionArea.x, selectionArea.y);
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

        requestAnimationFrame(drawRect);
        updateScaledArea();
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
        ctx.fillStyle = "rgba(0, 0, 0, .4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    updatePointDisplay(x, y);
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
    scaledSelectionArea.x = Math.round(selectionArea.x * widthRatio);
    scaledSelectionArea.y = Math.round(selectionArea.y * heightRatio);
    scaledSelectionArea.width = Math.round(selectionArea.width * widthRatio);
    scaledSelectionArea.height = Math.round(selectionArea.height * heightRatio);
    
    updateMeasurmentDisplay(scaledSelectionArea.width, scaledSelectionArea.height);
}

function onMouseup(mousemoveCallback, mouseupCallback) {
    cropping.removeEventListener("mousemove", mousemoveCallback, false);
    cropping.removeEventListener("mouseup", mouseupCallback, false);

    if (selectionArea.width && selectionArea.height) {
        canvas.addEventListener("mousemove", changeCursor, false);
        document.addEventListener("keydown", changeCursorToMove, false);
        toggleButton(cropButton, false);
        toggleButton(previewButton, false);
    }
    else {
        selectionArea = {};
        updatePointDisplay(0, 0);
        updateMeasurmentDisplay(0, 0);
        canvas.style.cursor = "default";
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        toggleButton(cropButton, true);
        toggleButton(previewButton, true);
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
    onMouseup(resizeSelectedArea, lockAdjustedArea);
}

function lockMovedArea() {
    onMouseup(moveSelectedArea, lockMovedArea);
}

function lockSelectedArea() {
    onMouseup(selectArea, lockSelectedArea);
}

function init() {
    const image = process.images[0];
    
    process.initWorker();
    displayImageName(image.name.original);
    drawInitialImage(image.uri);
    toggleButton(cropButton, true);
    toggleButton(previewButton, true);
    toggleSkipButton(process.images.length);
    canvas.addEventListener("mousedown", onSelectionStart, false);
    
    if (process.images.length > 1) {
        updateRemainingImageIndicator();
    }
}

function loadNextImage(image) {
    toggleSkipButton(process.images.length);
    toggleButton(cropButton, true);
    toggleButton(previewButton, true);
    
    if (process.images.length) {
        updateRemainingImageIndicator();
        selectionArea = {};
        displayImageName(image.name.original);
        updatePointDisplay(0, 0);
        updateMeasurmentDisplay(0, 0);
        drawInitialImage(image.uri);
    }
}

function cropImage() {
    const image = process.images.splice(0, 1)[0];
    
    sendImageToWorker(image);
    loadNextImage(process.images[0]);
}

function skipImage() {
    process.images.splice(0, 1);
    
    loadNextImage(process.images[0]);
}

function closeCropping() {
    if (isPreviewOpen) {
        isPreviewOpen = false;
        toggleElement("remove", cropPreview);
        return;
    }

    selectionArea = {};
    updatePointDisplay(0, 0);
    updateMeasurmentDisplay(0, 0);
    updateRemainingImageIndicator("remove");
    toggleElement("remove", cropping);
    process.worker.postMessage({ action: "generate" });
}

function showPreview() {
    const croppedImage = getCroppedImage(image);
    const maxWidth = window.innerWidth - 8;
    const maxHeight = window.innerHeight - 40;
    const img = cropPreview.children[0];

    let width = croppedImage.width;
    let height = croppedImage.height;
    let ratio = width / height;

    isPreviewOpen = true;
    toggleElement("add", cropPreview);

    if (width > maxWidth) {
        width = maxWidth;
        height = width / ratio;
    }

    if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
    }

    img.style.width = Math.floor(width) + "px";
    img.style.height = Math.floor(height) + "px";
    img.src = croppedImage.uri;
}

function removeTransitionPrevention() {
    cropping.classList.remove("preload");
    window.removeEventListener("load", removeTransitionPrevention, false);
}

cropButton.addEventListener("click", cropImage, false);
skipButton.addEventListener("click", skipImage, false);
closeButton.addEventListener("click", closeCropping, false);
previewButton.addEventListener("click", showPreview, false);
window.addEventListener("load", removeTransitionPrevention, false);

export { init };
