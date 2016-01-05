"use strict";

import { toggleElement } from "./main.js";
import * as process from "./process.js";
import * as quality from "./crop-quality.js";

const cropping = document.getElementById("js-crop");
const canvas = document.getElementById("js-canvas");
const ctx = canvas.getContext("2d");
const closeButton = document.getElementById("js-crop-close");
const cropPreview = document.getElementById("js-crop-preview");
const xInput = document.getElementById("js-crop-x");
const yInput = document.getElementById("js-crop-y");
const widthInput = document.getElementById("js-crop-width");
const heightInput = document.getElementById("js-crop-height");
const cropData = document.getElementById("js-crop-data");
const mousePosition = {};
const canvasImage = {
    original: new Image(),
    withQuality: new Image()
};

let selectedArea = {};
let direction = "";
let moveSelectedArea = "";
let isPreviewOpen = false;

const ratio = (function() {
    let ratio = {};

    function getRatio(name) {
        if (name === "x") {
            name = "width";
        }
        else if (name === "y") {
            name = "height";
        }

        return ratio[name];
    }

    function setRatio(name, value) {
        ratio[name] = value;
    }

    return { getRatio, setRatio };
})();

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
    const remainingImageIndicator = document.getElementById("js-crop-remaining"),
        remaining = process.images.length - 1;
    
    if (action === "remove") {
        remainingImageIndicator.textContent = "";
        return;
    }
    
    if (remaining === 1) {
        remainingImageIndicator.textContent = `${remaining} image remaining`;
        return;
    }
    remainingImageIndicator.textContent = `${remaining} images remaining`;
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
    const widthRatio = ratio.getRatio("width"),
        heightRatio = ratio.getRatio("height");

    x = getPointToUpdate(x, "x", "width");
    y = getPointToUpdate(y, "y", "height");

    xInput.value = Math.round(x * widthRatio);
    yInput.value = Math.round(y * heightRatio);
}

function updateMeasurmentDisplay(width, height) {
    width = Math.round(width * ratio.getRatio("width"));
    height = Math.round(height * ratio.getRatio("height"));

    widthInput.value = width < 0 ? -width : width;
    heightInput.value = height < 0 ? -height : height;
}

function drawImage() {
    if (quality.useImageWithQuality()) {
        ctx.drawImage(canvasImage.withQuality, 0, 0, canvas.width, canvas.height);
        return;
    }

    ctx.drawImage(canvasImage.original, 0, 0, canvas.width, canvas.height);
}

function addMask() {
    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function strokeRect(area) {
    let x = area.x % 2 === 0 ? area.x : area.x + 0.5,
        y = area.y % 2 === 0 ? area.y : area.y + 0.5;

    ctx.strokeStyle = "#006494";
    ctx.strokeRect(x, y, area.width - 0.5, area.height - 0.5);
}

function drawSelectedArea() {
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
    strokeRect(area);
}

function drawCanvas() {
    drawImage();
    drawSelectedArea();
}

function drawInitialImage(uri) {
    canvasImage.original.addEventListener("load", () => {
        const imageWidth = canvasImage.original.width,
            imageHeight = canvasImage.original.height,
            imageRatio = imageWidth / imageHeight,
            maxWidth = window.innerWidth - 212,
            maxHeight = window.innerHeight - 40;

        let width = imageWidth,
            height = imageHeight;

        toggleElement("add", cropping);
        
        if (width > maxWidth) {
            width = maxWidth;
            height = width / imageRatio;
        }

        if (height > maxHeight) {
            height = maxHeight;
            width = height * imageRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(canvasImage.original, 0, 0, canvas.width, canvas.height);

        ratio.setRatio("width", imageWidth / canvas.width);
        ratio.setRatio("height", imageHeight / canvas.height);

        canvas.classList.add("show");
    });
    canvasImage.original.src = uri;
}

function getScaledSelectedArea() {
    return {
        x: xInput.value,
        y: yInput.value,
        width: widthInput.value,
        height: heightInput.value
    };
}

function getCroppedImage(image, imageType = "image/jpeg") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const area = getScaledSelectedArea();

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(area.x, area.y, area.width, area.height);

    canvas.width = imageData.width;
    canvas.height = imageData.height;

    ctx.putImageData(imageData, 0, 0);

    return {
        uri: canvas.toDataURL(imageType, quality.get()),
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
            quality.reset();
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
    updatePointDisplay(selectedArea.x, selectedArea.y);
    updateMeasurmentDisplay(selectedArea.width, selectedArea.height);
}

function adjustSelectedAreaPosition(coordMeasurment, dimension) {
    const dimensionMeasurment = selectedArea[dimension],
        canvasMeasurment = canvas[dimension];

    if (dimensionMeasurment < 0) {
        if (coordMeasurment > canvasMeasurment) {
            coordMeasurment = canvasMeasurment;
        }

        if (coordMeasurment + dimensionMeasurment < 0) {
            coordMeasurment = -dimensionMeasurment;
        }
    }
    else {
        if (coordMeasurment < 0) {
            coordMeasurment = 0;
        }

        if (coordMeasurment + dimensionMeasurment > canvasMeasurment) {
            coordMeasurment = canvasMeasurment - dimensionMeasurment;
        }
    }
    return coordMeasurment;
}

function getDistanceBetweenPoints(x, y) {
    const xDiff = x - selectedArea.x;
    const yDiff = y - selectedArea.y;
    
    return function(event) {
        if (!event.ctrlKey) {
            return;
        }
        
        const { x, y } = getMousePosition(event),
            newX = x - xDiff,
            newY = y - yDiff;

        selectedArea.x = adjustSelectedAreaPosition(newX, "width");
        selectedArea.y = adjustSelectedAreaPosition(newY, "height");

        updatePointDisplay(selectedArea.x, selectedArea.y);
        requestAnimationFrame(drawCanvas);
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
        drawSelectedArea();
        
        cropping.addEventListener("mousemove", resizeSelectedArea, false);
        cropping.addEventListener("mouseup", lockAdjustedArea, false);
    }
    else if (event.ctrlKey && isMouseInsideSelectedArea(x, y)) {
        moveSelectedArea = getDistanceBetweenPoints(x, y);
        drawSelectedArea();
        
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

function updateSelectedArea() {
    const widthRatio = ratio.getRatio("width"),
        heightRatio = ratio.getRatio("height");

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

function resetCropper() {
    quality.reset();
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

    quality.reset();
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
    const croppedImage = getCroppedImage(canvasImage.original);
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
    const canvasWithQuality = document.createElement("canvas");
    const ctx2 = canvasWithQuality.getContext("2d");

    canvasImage.withQuality.addEventListener("load", () => {
        requestAnimationFrame(drawCanvas);
    });

    canvasWithQuality.width = canvasImage.original.width;
    canvasWithQuality.height = canvasImage.original.height;
    ctx2.drawImage(canvasImage.original, 0, 0, canvasWithQuality.width, canvasWithQuality.height);
    canvasImage.withQuality.src = canvasWithQuality.toDataURL("image/jpeg", quality);
}

function insertChar(target, char) {
    const start = target.selectionStart,
        end = target.selectionEnd;

    let string = target.value;

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
        requestAnimationFrame(drawCanvas);
    }

    toggleButtons(!hasArea);
}

function updateInput(target, value, input) {
    const inputRatio = ratio.getRatio(input);

    target.value = Math.round(value * inputRatio);
}

function updateSelectedAreaPoint(event, inputValue, dimension) {
    if (selectedArea[dimension] < 0) {
        if (inputValue - selectedArea[dimension] > canvas[dimension]) {
            inputValue = canvas[dimension];
            event.preventDefault();
            updateInput(event.target, canvas[dimension] + selectedArea[dimension], dimension);
        }
        else {
            inputValue = inputValue - selectedArea[dimension];
        }
    }
    else if (inputValue + selectedArea[dimension] > canvas[dimension]) {
        inputValue = canvas[dimension] - selectedArea[dimension];
        event.preventDefault();
        updateInput(event.target, inputValue, dimension);
    }

    return inputValue;
}

function updateSelectedAreaDimension(event, inputValue, dimension, point) {
    if (selectedArea[dimension] < 0) {
        selectedArea[point] = selectedArea[dimension] + selectedArea[point];
    }

    if (selectedArea[point] + inputValue > canvas[dimension]) {
        inputValue = canvas[dimension] - selectedArea[point];
        event.preventDefault();
        updateInput(event.target, inputValue, dimension);
    }

    return inputValue;
}

function getKey(event) {
    if (event.key) {
        return event.key;
    }

    const code = event.keyCode || event.which;

    if (code) {
        if (code === 8 || code === 13) {
            return code;
        }

        return String.fromCharCode(code);
    }
}

function updateCanvasWithCropData(event) {
    const target = event.target,
        key = getKey(event),
        input = target.getAttribute("data-input"),
        backspace = key === "Backspace" || key === 8,
        enter = key === "Enter" || key === 13;

    if (input && /\d/.test(key)) {
        const inputRatio = ratio.getRatio(input);

        let inputValue = insertChar(target, key);

        inputValue = inputValue / inputRatio;

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
    else if (!backspace && !enter) {
        event.preventDefault();
    }
}

function updateSelectedAreaWithCropData(event) {
    const key = getKey(event),
        backspace = key === "Backspace" || key === 8,
        enter = key === "Enter" || key === 13;

    if (backspace || enter) {
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
document.getElementById("js-crop-data-btns").addEventListener("click", onSidebarBtnClick, false);
window.addEventListener("load", removeTransitionPrevention, false);

export { init, changeCanvasQuality };
