"use strict";

import { toggleElement } from "./main.js";
import * as process from "./process.js";
import * as quality from "./cropper-quality.js";

const cropping = document.getElementById("js-crop"),
    canvas = document.getElementById("js-canvas"),
    ctx = canvas.getContext("2d"),
    closeButton = document.getElementById("js-crop-close"),
    cropPreview = document.getElementById("js-crop-preview"),
    xInput = document.getElementById("js-crop-x"),
    yInput = document.getElementById("js-crop-y"),
    widthInput = document.getElementById("js-crop-width"),
    heightInput = document.getElementById("js-crop-height"),
    angleInput = document.getElementById("js-crop-angle"),
    cropData = document.getElementById("js-crop-data"),
    mousePosition = {},
    canvasImage = {
        original: new Image(),
        withQuality: new Image()
    };

let changeCanvasQuality = null,
    selectedArea = {},
    direction = "",
    isPreviewOpen = false,
    theta = 0,
    moveSelectedArea;

const ratio = (function() {
    const ratio = {};

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
        return false;
    }
    ctx.drawImage(canvasImage.original, 0, 0, canvas.width, canvas.height);
}

function addMask() {
    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function strokeRect(area) {
    ctx.strokeStyle = "#006494";
    ctx.strokeRect(area.x, area.y, area.width, area.height);
}

function drawSelectedArea(area) {
    const hasArea = area.width && area.height;
    
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

    if (theta) {
        drawRotatedSelectedArea(selectedArea, theta);
    }
    else {
        drawSelectedArea(selectedArea);
    }
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
        changeCanvasQuality = loadCanvasWithQuality();
        ratio.setRatio("width", imageWidth / canvas.width);
        ratio.setRatio("height", imageHeight / canvas.height);

        canvas.classList.add("show");
    });
    canvasImage.original.src = uri;
}

function getScaledSelectedArea() {
    return {
        x: Number.parseInt(xInput.value, 10),
        y: Number.parseInt(yInput.value, 10),
        width: Number.parseInt(widthInput.value, 10),
        height: Number.parseInt(heightInput.value, 10)
    };
}

function getImageData(image, area, ctx) {
    ctx.drawImage(image, 0, 0, image.width, image.height);

    return ctx.getImageData(area.x, area.y, area.width, area.height);
}

function getRotatedImageData(image, area, ctx) {
    ctx.save();
    ctx.translate(area.x + area.width / 2, area.y + area.height / 2);
    ctx.rotate(-theta);
    ctx.drawImage(image, -(area.x + area.width / 2), -(area.y + area.height / 2));
    ctx.restore();

    return ctx.getImageData(area.x, area.y, area.width, area.height);
}

function getCroppedImage(image, imageType = "image/jpeg") {
    const canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        area = getScaledSelectedArea();

    canvas.width = image.width;
    canvas.height = image.height;

    const imageData = theta ? getRotatedImageData(image, area, ctx) : getImageData(image, area, ctx);

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
            resetData();
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

function isMouseInsideSelectedArea(area, x, y) {
    const x2 = area.x,
        y2 = area.y,
        x3 = x2 + area.width,
        y3 = y2 + area.height,
        inXBound = x >= x2 && x <= x3 || x <= x2 && x >= x3,
        inYBound = y >= y2 && y <= y3 || y <= y2 && y >= y3;
    
    return inXBound && inYBound;
}

function resizeSelectedArea(event) {
    const { x, y } = getMousePosition(event),
        area = selectedArea,
        adjustedSelectedArea = {};

    let selectedDirection = "";

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

        updatePointDisplay(selectedArea.x, selectedArea.y);
        requestAnimationFrame(drawCanvas);
    };
}

function onSelectionStart(event) {
    if (event.which !== 1) {
        return;
    }

    const { x, y } = getMousePosition(event),
        area = selectedArea,
        hasArea = area.width && area.height;

    direction = getDirection(x, y);
    drawImage();

    canvas.removeEventListener("mousemove", changeCursor, false);
    document.removeEventListener("keydown", changeCursorToMove, false);

    if (event.ctrlKey) {
        const isInsideArea = theta ? isMouseInsideRotatedSelectedArea : isMouseInsideSelectedArea;

        if (isInsideArea(area, x, y)) {
            if (theta) {
                drawRotatedSelectedArea(area, theta);
            }
            else {
                drawSelectedArea(area);
            }
            moveSelectedArea = getDistanceBetweenPoints(x, y);
            cropping.addEventListener("mousemove", moveSelectedArea, false);
            cropping.addEventListener("mouseup", lockMovedArea, false);
            return;
        }
        drawRotatedSelectedArea(area, theta);
        cropping.addEventListener("mousemove", rotateSelectedArea, false);
        cropping.addEventListener("mouseup", lockRotatedArea, false);
    }
    else if (direction && hasArea && !theta) {
        drawSelectedArea(area);
        cropping.addEventListener("mousemove", resizeSelectedArea, false);
        cropping.addEventListener("mouseup", lockAdjustedArea, false);
    }
    else {
        if (hasArea) {
            if (theta) {
                drawRotatedSelectedArea(area, theta);
            }
            else {
                drawSelectedArea(area);
            }
        }

        theta = 0;
        selectedArea.x = x;
        selectedArea.y = y;
        selectedArea.width = 0;
        selectedArea.height = 0;

        cropping.addEventListener("mousemove", selectArea, false);
        cropping.addEventListener("mouseup", lockSelectedArea, false);
    }
}

function selectArea(event) {
    const { x, y } = getMousePosition(event);

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
    const isInsideArea = theta ? isMouseInsideRotatedSelectedArea : isMouseInsideSelectedArea,
        area = selectedArea,
        x = mousePosition.x,
        y = mousePosition.y;

    if (event.ctrlKey && isInsideArea(area, x, y)) {
        canvas.style.cursor = "move";
    }
    document.addEventListener("keyup", removeMoveCursor, false);
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

function changeResizeCursor(x, y) {
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

function isMouseInsideRotatedSelectedArea(area, x, y) {
    const transaltedX = x - (area.x + area.width / 2),
        transaltedY = y - (area.y + area.height / 2),
        newX = transaltedX * Math.cos(-theta) - transaltedY * Math.sin(-theta),
        newY = transaltedX * Math.sin(-theta) + transaltedY * Math.cos(-theta),
        translatedArea = {
            x: -area.width / 2,
            y: -area.height / 2,
            width: area.width,
            height: area.height
        };

    return isMouseInsideSelectedArea(translatedArea, newX, newY);
}

function changeCursor(event) {
    const { x, y } = getMousePosition(event),
        area = selectedArea;

    mousePosition.x = x;
    mousePosition.y = y;

    if (event.ctrlKey) {
        const isInsideArea = theta ? isMouseInsideRotatedSelectedArea : isMouseInsideSelectedArea;

        if (isInsideArea(area, x, y)) {
            canvas.style.cursor = "move";
            return;
        }
        canvas.style.cursor = "default";
        return;
    }

    if (!theta) {
        changeResizeCursor(x, y);
    }
}

function getAngleInRadians(event) {
    const { x, y } = getMousePosition(event),
        area = selectedArea,
        x2 = area.x + area.width / 2,
        y2 = area.y + area.height / 2;

    return Math.atan2(y2 - y, x2 - x);
}

function convertRadiansToDegrees(radians) {
    let degrees = Math.round(radians * 180 / Math.PI);

    if (degrees < 0) {
        degrees += 360;
    }
    return degrees;
}

function drawRotatedSelectedArea(area, radians) {
    const width = area.width > 0 ? area.width : -area.width,
        height = area.height > 0 ? area.height : -area.height;

    ctx.save();
    ctx.translate(area.x + area.width / 2, area.y + area.height / 2);
    ctx.rotate(radians);
    ctx.strokeRect(-area.width / 2, -area.height / 2, area.width, area.height);
    ctx.beginPath();
    ctx.rect(-width / 2, -height / 2, width, height);
    ctx.restore();
    ctx.rect(canvas.width, 0, -canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fill();
}

function rotateSelectedArea(event) {
    let degrees = 0;

    theta = getAngleInRadians(event);
    degrees = convertRadiansToDegrees(theta);
    angleInput.value = degrees;

    if (degrees === 0 || degrees === 360) {
        theta = 0;
    }
    requestAnimationFrame(drawCanvas);
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

function lockRotatedArea() {
    onMouseup(rotateSelectedArea, lockRotatedArea);
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
    angleInput.value = 0;
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
    resetData();
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
    const croppedImage = getCroppedImage(canvasImage.original),
        img = new Image();

    isPreviewOpen = true;

    img.classList.add("crop-preview-image");
    img.addEventListener("load", () => {
        let width = croppedImage.width,
            height = croppedImage.height;

        const maxWidth = window.innerWidth - 8,
            maxHeight = window.innerHeight - 40,
            ratio = width / height;

        if (width > maxWidth) {
            width = maxWidth;
            height = Math.floor(width / ratio);
        }

        if (height > maxHeight) {
            height = maxHeight;
            width = Math.floor(height * ratio);
        }

        img.style.width = width + "px";
        img.style.height = height + "px";

        cropPreview.appendChild(img);
        toggleElement("add", cropPreview);
    });

    img.src = croppedImage.uri;
}

function loadCanvasWithQuality() {
    const canvasWithQuality = document.createElement("canvas"),
        ctx2 = canvasWithQuality.getContext("2d"),
        canvasOriginalImage = canvasImage.original;

    let loading = false;

    canvasWithQuality.width = canvasOriginalImage.width;
    canvasWithQuality.height = canvasOriginalImage.height;
    ctx2.drawImage(canvasOriginalImage, 0, 0, canvasWithQuality.width, canvasWithQuality.height);

    canvasImage.withQuality.addEventListener("load", () => {
        requestAnimationFrame(() => {
            drawCanvas();
            loading = false;
        });
    });

    return function(quality) {
        if (!loading) {
            loading = true;
            canvasImage.withQuality.src = canvasWithQuality.toDataURL("image/jpeg", quality);
        }
    };
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

function convertDegreesToRadians(degrees) {
    if (degrees > 180) {
        degrees -= 360;
    }
    return degrees * Math.PI / 180;
}

function updateCanvasWithCropData(event) {
    const target = event.target,
        key = getKey(event),
        input = target.getAttribute("data-input"),
        backspace = key === "Backspace" || key === 8,
        enter = key === "Enter" || key === 13;

    if (input && /\d|-/.test(key)) {
        const hyphen = key === "-" || key === 45;

        if (hyphen && input !== "x" && input !== "y") {
            event.preventDefault();
            return;
        }

        const inputRatio = ratio.getRatio(input),
            inputValue = insertChar(target, key);

        if (input === "angle") {
            theta = convertDegreesToRadians(inputValue);
        }
        else {
            selectedArea[input] = inputValue / inputRatio || 0;
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
        const target = event.target,
            input = target.getAttribute("data-input");

        if (input === "angle") {
            theta = convertDegreesToRadians(target.value);
        }
        else {
            updateSelectedArea();
        }
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

export { init, changeCanvasQuality };
