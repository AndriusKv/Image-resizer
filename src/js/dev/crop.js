"use strict";

import { toggleElement } from "./main.js";
import * as process from "./process.js";

const cropping = document.getElementById("js-crop");
const canvas = document.getElementById("js-canvas");
const ctx = canvas.getContext("2d");
const closeButton = document.getElementById("js-crop-close");
const cropPreview = document.getElementById("js-crop-preview");
const qualitySlider = document.getElementById("js-crop-quality");
const xInput = document.getElementById("js-crop-x");
const yInput = document.getElementById("js-crop-y");
const widthInput = document.getElementById("js-crop-width");
const heightInput = document.getElementById("js-crop-height");
const cropData = document.getElementById("js-crop-data");
const image = new Image();
const imageWithQuality = new Image();
const scaledSelectedArea = {};
const mousePosition = {};

let selectedArea = {};
let direction = "";
let moveSelectedArea = "";
let widthRatio = 1;
let heightRatio = 1;
let isPreviewOpen = false;
let customQuality = false;

function toggleButton(button, disabled) {
    button.disabled = disabled;
}

function toggleButtons(disabled) {
    const cropButton = document.getElementById("js-crop-ok"),
        previewButton = document.getElementById("js-crop-preview-btn");

    toggleButton(cropButton, disabled);
    toggleButton(previewButton, disabled);
}

function toggleSkipButton(imageCount) {
    const skipButton = document.getElementById("js-crop-skip"),
        hasImages = imageCount > 1;

    toggleButton(skipButton, !hasImages);
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

function getPointToUpdate(pointValue, point, dimension) {
    if (pointValue) {
        if (selectedArea[dimension] > 0) {
            return selectedArea[point];
        }

        return selectedArea[point] + selectedArea[dimension];
    }

    return 0;
}

function updatePointDisplay(x, y) {
    x = getPointToUpdate(x, "x", "width");
    y = getPointToUpdate(y, "y", "height");

    xInput.value = Math.round(x * widthRatio);
    yInput.value = Math.round(y * heightRatio);
}

function updateMeasurmentDisplay(width, height) {
    width = Math.round(width * widthRatio);
    height = Math.round(height * heightRatio);

    widthInput.value = width < 0 ? -width : width;
    heightInput.value = height < 0 ? -height : height;
}

function updateQualityValue(quality) {
    document.getElementById("js-quality-value").textContent = quality;
}

function drawImage() {
    if (customQuality) {
        ctx.drawImage(imageWithQuality, 0, 0, canvas.width, canvas.height);
        return;
    }

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function addMask() {
    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function strokeRect() {
    const area = selectedArea,
        hasArea = area.width && area.height;
    
    let x = area.x,
        y = area.y,
        imageData;

    if (hasArea) {
        imageData = ctx.getImageData(x, y, area.width, area.height);

        if (area.width < 0) {
            x = x + area.width;
        }

        if (area.height < 0) {
            y = y + area.height;
        }
    }

    if (x || y || hasArea) {
        addMask();
    }

    if (imageData) {
        ctx.putImageData(imageData, x, y);
    }

    ctx.strokeStyle = "#006494";
    ctx.strokeRect(area.x + 0.5, area.y + 0.5, area.width, area.height);
}

function drawCanvas() {
    drawImage();
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

        canvas.classList.add("show");
    });

    image.src = uri;
}

function getCroppedImage(image, imageType = "image/jpeg") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const area = scaledSelectedArea;

    let quality = 0.92;

    if (customQuality) {
        quality = qualitySlider.value / 100;
    }

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(area.x, area.y, area.width, area.height);

    canvas.width = imageData.width;
    canvas.height = imageData.height;

    ctx.putImageData(imageData, 0, 0);

    return {
        uri: canvas.toDataURL(imageType, quality),
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
            resetCropper();
            process.generateZip();
            canvas.removeEventListener("mousedown", onSelectionStart, false);
        }
        else {
            resetQualitySlider();
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

function getDirection(x, y) {
    const margin = 4;
    const x2 = selectedArea.x;
    const y2 = selectedArea.y;
    const x3 = x2 + selectedArea.width;
    const y3 = y2 + selectedArea.height;
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
    const x2 = selectedArea.x;
    const y2 = selectedArea.y;
    const x3 = x2 + selectedArea.width;
    const y3 = y2 + selectedArea.height;
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
    const area = selectedArea;
    const adjustedSelectedArea = {};
    
    let { x, y } = getMousePosition(event);
    let selectedDirection = "";
    
    x = adjustOutsideCanvasXCoord(x);
    y = adjustOutsideCanvasYCoord(y);
    
    switch (direction) {
        case "nw":
            adjustedSelectedArea.x = x;
            adjustedSelectedArea.y = y;
            adjustedSelectedArea.width = area.x - x + area.width;
            adjustedSelectedArea.height = area.y - y + area.height;
            selectedDirection = getOppositeDirection("nw", "ne");
            break;
        case "ne":
            adjustedSelectedArea.y = y;
            adjustedSelectedArea.height = area.y - y + area.height;
            adjustedSelectedArea.width = x - area.x;
            selectedDirection = getOppositeDirection("ne", "nw");
            break;
        case "se":
            adjustedSelectedArea.width = x - area.x;
            adjustedSelectedArea.height = y - area.y;
            selectedDirection = getOppositeDirection("se", "sw");
            break;
        case "sw":
            adjustedSelectedArea.x = x;
            adjustedSelectedArea.width = area.x - x + area.width;
            adjustedSelectedArea.height = y - area.y;
            selectedDirection = getOppositeDirection("sw", "se");
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
    
    if (selectedDirection) {
        canvas.style.cursor = selectedDirection + "-resize";
    }
    
    Object.assign(selectedArea, adjustedSelectedArea);

    requestAnimationFrame(drawCanvas);

    updateScaledSelectedArea();
    updatePointDisplay(selectedArea.x, selectedArea.y);
    updateMeasurmentDisplay(selectedArea.width, selectedArea.height);
}

function adjustSelectedAreaPosition(coord, dimension) {
    const coordMeasurment = selectedArea[coord];
    const dimensionMeasurment = selectedArea[dimension];
    const canvasMeasurment = canvas[dimension];
    
    if (coordMeasurment < 0) {
        selectedArea[coord] = 0;
    }
    
    if (coordMeasurment + dimensionMeasurment > canvasMeasurment) {
        selectedArea[coord] = canvasMeasurment - dimensionMeasurment;
    }
    else if (coordMeasurment + dimensionMeasurment < 0) {
        selectedArea[coord] = -dimensionMeasurment;
    }
    else if (coordMeasurment > canvasMeasurment) {
        selectedArea[coord] = canvasMeasurment;
    }

    updatePointDisplay(selectedArea.x, selectedArea.y);
}

function getDistanceBetweenPoints(x, y) {
    const xDiff = x - selectedArea.x;
    const yDiff = y - selectedArea.y;
    
    return function(event) {
        if (!event.ctrlKey) {
            return;
        }
        
        const { x, y } = getMousePosition(event);

        selectedArea.x = x - xDiff;
        selectedArea.y = y - yDiff;

        adjustSelectedAreaPosition("x", "width");
        adjustSelectedAreaPosition("y", "height");

        requestAnimationFrame(drawCanvas);
        updateScaledSelectedArea();
    };
}

function onSelectionStart(event) {
    if (event.which !== 1) {
        return;
    }
    
    const { x, y } = getMousePosition(event),
        hasArea = selectedArea.width && selectedArea.height;
    
    direction = getDirection(x, y);
    drawImage();

    canvas.removeEventListener("mousemove", changeCursor, false);
    document.removeEventListener("keydown", changeCursorToMove, false);
    
    if (direction && hasArea) {
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
        if (hasArea) {
            addMask();
        }

        selectedArea.x = x;
        selectedArea.y = y;
        selectedArea.width = 0;
        selectedArea.height = 0;

        cropping.addEventListener("mousemove", selectArea, false);
        cropping.addEventListener("mouseup", lockSelectedArea, false);
    }
}

function selectArea(event) {
    let { x, y } = getMousePosition(event);
    
    x = adjustOutsideCanvasXCoord(x);
    y = adjustOutsideCanvasYCoord(y);
    
    selectedArea.width = x - selectedArea.x;
    selectedArea.height = y - selectedArea.y;

    requestAnimationFrame(drawCanvas);

    updateScaledSelectedArea();
    updatePointDisplay(x, y);
    updateMeasurmentDisplay(selectedArea.width, selectedArea.height);
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

function updateScaledSelectedArea() {
    scaledSelectedArea.x = selectedArea.x * widthRatio;
    scaledSelectedArea.y = selectedArea.y * heightRatio;
    scaledSelectedArea.width = selectedArea.width * widthRatio;
    scaledSelectedArea.height = selectedArea.height * heightRatio;
}

function updateSelectedArea() {
    selectedArea.x = xInput.value / widthRatio;
    selectedArea.y = yInput.value / heightRatio;
    selectedArea.width = widthInput.value / widthRatio;
    selectedArea.height = heightInput.value / heightRatio;
}

function onMouseup(mousemoveCallback, mouseupCallback) {
    const hasArea = selectedArea.width && selectedArea.height;

    cropping.removeEventListener("mousemove", mousemoveCallback, false);
    cropping.removeEventListener("mouseup", mouseupCallback, false);

    if (hasArea) {
        canvas.addEventListener("mousemove", changeCursor, false);
        document.addEventListener("keydown", changeCursorToMove, false);
    }
    else {
        resetData();
        drawImage();
        canvas.style.cursor = "default";
    }

    toggleButtons(!hasArea);
}

function getOppositeDirection(direction, oppositeDirection) {
    const x = selectedArea.x;
    const y = selectedArea.y;
    const x2 = x + selectedArea.width;
    const y2 = y + selectedArea.height;

    if (x2 > x) {
        if (y2 < y) {
            return oppositeDirection;
        }
    }
    else if (y2 > y) {
        return oppositeDirection;
    }
    
    return direction;
}

function changeCursor(event) {
    const { x, y } = getMousePosition(event);
    
    mousePosition.x = x;
    mousePosition.y = y;
    
    if (event.ctrlKey && isMouseInsideSelectedArea(x, y)) {
        canvas.style.cursor = "move";
        return;
    }
    
    let direction = getDirection(x, y);
    
    switch (direction) {
        case "nw":
            direction = getOppositeDirection("nw", "ne");
            break;
        case "ne":
            direction = getOppositeDirection("ne", "nw");
            break;
        case "sw":
            direction = getOppositeDirection("sw", "se");
            break;
        case "se":
            direction = getOppositeDirection("se", "sw");
            break;
    }
    
    canvas.style.cursor = direction ? direction + "-resize" : "default";
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
    toggleButtons(true);
    toggleSkipButton(process.images.length);
    canvas.addEventListener("mousedown", onSelectionStart, false);
    
    if (process.images.length > 1) {
        updateRemainingImageIndicator();
    }
}

function loadNextImage(image) {
    canvas.classList.remove("show");

    toggleSkipButton(process.images.length);
    toggleButtons(true);
    
    if (process.images.length) {
        resetData();
        updateRemainingImageIndicator();
        displayImageName(image.name.original);

        setTimeout(() => {
            drawInitialImage(image.uri);
        }, 200);
    }
}

function resetData() {
    selectedArea = {};
    updatePointDisplay(0, 0);
    updateMeasurmentDisplay(0, 0);
}

function resetQualitySlider() {
    customQuality = false;
    qualitySlider.value = 92;
    updateQualityValue(0.92);
}

function resetCropper() {
    resetQualitySlider();
    resetData();
    updateRemainingImageIndicator("remove");
    toggleElement("remove", cropping);
}

function cropImage() {
    const image = process.images.splice(0, 1)[0];
    
    sendImageToWorker(image);
    loadNextImage(process.images[0]);
}

function skipImage() {
    process.images.splice(0, 1);

    resetQualitySlider();
    loadNextImage(process.images[0]);
}

function closeCropping() {
    if (isPreviewOpen) {
        isPreviewOpen = false;
        toggleElement("remove", cropPreview);

        setTimeout(()=> {
            cropPreview.removeChild(cropPreview.children[0]);
        }, 600);

        return;
    }

    resetCropper();
    process.worker.postMessage({ action: "generate" });
}

function showPreview() {
    const croppedImage = getCroppedImage(image);
    const img = new Image();

    isPreviewOpen = true;

    img.classList.add("crop-preview-image");
    img.addEventListener("load", () => {
        const maxWidth = window.innerWidth - 8;
        const maxHeight = window.innerHeight - 40;

        let width = croppedImage.width;
        let height = croppedImage.height;
        let ratio = width / height;

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

        cropPreview.appendChild(img);
        toggleElement("add", cropPreview);
    });

    img.src = croppedImage.uri;
}

function removeTransitionPrevention() {
    cropping.classList.remove("preload");
    window.removeEventListener("load", removeTransitionPrevention, false);
}

function changeCanvasQuality(quality) {
    const canvas2 = document.createElement("canvas");
    const ctx2 = canvas2.getContext("2d");

    imageWithQuality.addEventListener("load", () => {
        drawCanvas();
    });

    canvas2.width = image.width;
    canvas2.height = image.height;
    ctx2.drawImage(image, 0, 0, canvas2.width, canvas2.height);

    imageWithQuality.src = canvas2.toDataURL("image/jpeg", quality);
}

function adjustQuality(event) {
    const quality = event.target.value / 100;

    customQuality = quality < 0.92;

    changeCanvasQuality(quality);
    updateQualityValue(quality);
}

function getRatio(input) {
    return input === "x" || input === "width" ? widthRatio : heightRatio;
}

function insertChar(string, char, start, end) {
    if (start === end) {
        string = string.slice(0, start) + char + string.slice(start, string.length);
    }
    else {
        string = string.slice(0, start) + char + string.slice(end, string.length);
    }

    return Number.parseInt(string, 10);
}

function updateCanvasOnInput() {
    const hasArea = selectedArea.width && selectedArea.height;

    if (hasArea) {
        drawCanvas();
        updateScaledSelectedArea();
    }

    toggleButtons(!hasArea);
}

function updateSelectedAreaPoint(event, inputValue, dimension) {
    const ratio = getRatio(dimension);

    inputValue = inputValue / ratio;

    if (selectedArea[dimension] < 0) {
        if (inputValue - selectedArea[dimension] > canvas[dimension]) {
            inputValue = canvas[dimension];
            event.preventDefault();
            event.target.value = Math.round((canvas[dimension] + selectedArea[dimension]) * ratio);
        }
        else {
            inputValue = inputValue - selectedArea[dimension];
        }
    }
    else if (inputValue + selectedArea[dimension] > canvas[dimension]) {
        inputValue = canvas[dimension] - selectedArea[dimension];
        event.preventDefault();
        event.target.value = Math.round(inputValue * ratio);
    }

    return inputValue;
}

function updateSelectedAreaDimension(event, inputValue, dimension, point) {
    const ratio = getRatio(dimension);

    inputValue = inputValue / ratio;

    if (selectedArea[dimension] < 0) {
        selectedArea[point] = selectedArea[dimension] + selectedArea[point];
    }

    if (selectedArea[point] + inputValue > canvas[dimension]) {
        inputValue = canvas[dimension] - selectedArea[point];
        event.preventDefault();
        event.target.value = Math.round(inputValue * ratio);
    }

    return inputValue;
}

function updateCanvasWithCropData(event) {
    const target = event.target,
        char = String.fromCharCode(event.keyCode),
        input = target.getAttribute("data-input");

    if (input && /\d/.test(char)) {
        const inputValue = insertChar(target.value, char, target.selectionStart, target.selectionEnd);

        switch (input) {
            case "x":
                selectedArea[input] = updateSelectedAreaPoint(event, inputValue, "width");
                break;
            case "y":
                selectedArea[input] = updateSelectedAreaPoint(event, inputValue, "height");
                break;
            case "width":
                selectedArea[input] = updateSelectedAreaDimension(event, inputValue, input, "x");
                break;
            case "height":
                selectedArea[input] = updateSelectedAreaDimension(event, inputValue, input, "y");
                break;
        }

        updateCanvasOnInput();
        return;
    }

    event.preventDefault();
}

function updateSelectedAreaWithCropData(event) {
    if (event.keyCode === 8 || event.keyCode === 13) {
        updateSelectedArea();
        updateCanvasOnInput();
    }
}

function onSidebarBtnClick(event) {
    const btn = event.target.getAttribute("data-btn");

    switch (btn) {
        case "crop":
            cropImage();
            break;
        case "preview":
            showPreview();
            break;
        case "skip":
            skipImage();
            break;
    }
}

closeButton.addEventListener("click", closeCropping, false);
cropData.addEventListener("keypress", updateCanvasWithCropData, false);
cropData.addEventListener("keyup", updateSelectedAreaWithCropData, false);
qualitySlider.addEventListener("input", adjustQuality, false);
document.getElementById("js-crop-data-btns").addEventListener("click", onSidebarBtnClick, false);
window.addEventListener("load", removeTransitionPrevention, false);

export { init };
