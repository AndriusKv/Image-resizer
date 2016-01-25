"use strict";

import { toggleElement } from "./main.js";
import * as process from "./process.js";
import * as quality from "./cropper-quality.js";

const cropping = document.getElementById("js-crop");
const canvas = document.getElementById("js-canvas");
const ctx = canvas.getContext("2d");
const closeButton = document.getElementById("js-crop-close");
const cropPreview = document.getElementById("js-crop-preview");
const resetButton = document.getElementById("js-crop-reset");
const xInput = document.getElementById("js-crop-x");
const yInput = document.getElementById("js-crop-y");
const widthInput = document.getElementById("js-crop-width");
const heightInput = document.getElementById("js-crop-height");
const angleInput = document.getElementById("js-crop-angle");
const scaleInput = document.getElementById("js-crop-scale");
const cropData = document.getElementById("js-crop-data");
const mousePosition = {};
const canvasImage = {
    original: new Image(),
    withQuality: new Image()
};

let changeCanvasQuality = null;
let selectedArea = {};
let direction = "";
let isPreviewOpen = false;
let theta = 0;
let dragStartPos = null;
let moveSelectedArea;
let canvasTransform;
let addBackground;

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

const sidebarPreview = (function() {
    const preview = document.getElementById("js-sidebar-preview");
    const ctx = preview.getContext("2d");
    const maxWidth = 192;
    const maxHeight = 150;
    let updating = false;

    preview.width = maxWidth;
    preview.height = maxHeight;

    function clean() {
        ctx.clearRect(0, 0, maxWidth, maxHeight);
    }

    function draw(image) {
        const area = getScaledSelectedArea();

        if (updating || !area.width || !area.height) {
            return;
        }
        updating = true;
        requestAnimationFrame(() => {
            const croppedCanvas = getCroppedCanvas(image, area);
            let width = croppedCanvas.width;
            let height = croppedCanvas.height;
            const ratio = width / height;

            if (width > maxWidth) {
                width = maxWidth;
                height = width / ratio;
            }

            if (height > maxHeight) {
                height = maxHeight;
                width = height * ratio;
            }
            clean();
            ctx.drawImage(croppedCanvas, (maxWidth - width) / 2, (maxHeight - height) / 2, width, height);
            updating = false;
        });
    }

    return {
        clean,
        draw
    };
})();

function toggleButton(button, disabled) {
    button.disabled = disabled;
}

function toggleButtons(disabled) {
    const cropButton = document.getElementById("js-crop-ok");
    const previewButton = document.getElementById("js-crop-preview-btn");

    toggleButton(cropButton, disabled);
    toggleButton(previewButton, disabled);
}

function toggleSkipButton(imageCount) {
    const skipButton = document.getElementById("js-crop-skip");
    const hasImages = imageCount > 1;

    toggleButton(skipButton, !hasImages);
}

function updateRemainingImageIndicator(action) {
    const remainingImageIndicator = document.getElementById("js-crop-remaining");
    const remaining = process.images.length - 1;

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
    const widthRatio = ratio.getRatio("width");
    const heightRatio = ratio.getRatio("height");

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

function drawImage(image) {
    if (image) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        return;
    }

    if (quality.useImageWithQuality()) {
        ctx.drawImage(canvasImage.withQuality, 0, 0, canvas.width, canvas.height);
        return;
    }
    ctx.drawImage(canvasImage.original, 0, 0, canvas.width, canvas.height);
}

function getPattern() {
    const image = new Image();
    let pattern;

    image.addEventListener("load", () => {
        pattern = ctx.createPattern(image, "repeat");
    });
    image.src = "images/pattern.png";

    return function() {
        ctx.fillStyle = pattern;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        addMask();
        ctx.restore();
    };
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
    let x = area.x;
    let y = area.y;
    let imageData = null;

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
    const image = quality.useImageWithQuality() ? canvasImage.withQuality : canvasImage.original;

    addBackground();
    drawImage(image);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (theta) {
        drawRotatedSelectedArea(selectedArea, theta);
    }
    else {
        drawSelectedArea(selectedArea);
    }
    ctx.restore();
    sidebarPreview.draw(image);
}

function drawInitialImage(uri) {
    canvasImage.original.addEventListener("load", () => {
        const imageWidth = canvasImage.original.width;
        const imageHeight = canvasImage.original.height;
        const imageRatio = imageWidth / imageHeight;
        const maxWidth = window.innerWidth - 212;
        const maxHeight = window.innerHeight - 40;
        let width = imageWidth;
        let height = imageHeight;

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
    const xform = canvasTransform.getTransform();
    const translatedX = xform.e * ratio.getRatio("width");
    const translatedY = xform.f * ratio.getRatio("height");

    ctx.save();
    ctx.translate(translatedX, translatedY);
    ctx.scale(xform.a, xform.a);
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.restore();

    return ctx.getImageData(area.x, area.y, area.width, area.height);
}

function getRotatedImageData(image, area, ctx) {
    const xform = canvasTransform.getTransform();
    const translatedX = xform.e * ratio.getRatio("width");
    const translatedY = xform.f * ratio.getRatio("height");
    const centerX = (area.x + area.width / 2);
    const centerY = (area.y + area.height / 2);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-theta);
    ctx.translate(-centerX, -centerY);
    ctx.translate(translatedX, translatedY);
    ctx.scale(xform.a, xform.a);
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.restore();

    return ctx.getImageData(area.x, area.y, area.width, area.height);
}

function getCroppedCanvas(image, area) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;

    const imageData = theta ? getRotatedImageData(image, area, ctx) : getImageData(image, area, ctx);

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    return canvas;
}

function sendImageToWorker(imageToCrop) {
    const image = new Image();

    image.addEventListener("load", () => {
        const area = getScaledSelectedArea();
        const croppedCanvas = getCroppedCanvas(image, area);

        process.worker.postMessage({
            action: "add",
            image: {
                name: imageToCrop.name.setByUser,
                type: imageToCrop.type.slice(6),
                uri: croppedCanvas.toDataURL(imageToCrop.type, quality.get())
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
    const x2 = area.x;
    const y2 = area.y;
    const x3 = x2 + area.width;
    const y3 = y2 + area.height;
    const inXBound = x >= x2 && x <= x3 || x <= x2 && x >= x3;
    const inYBound = y >= y2 && y <= y3 || y <= y2 && y >= y3;

    return inXBound && inYBound;
}

function resizeSelectedArea(event) {
    const { x, y } = getMousePosition(event);
    const area = selectedArea;
    const adjustedSelectedArea = {};
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

    const { x, y } = getMousePosition(event);
    const area = selectedArea;
    const hasArea = area.width && area.height;

    direction = getDirection(x, y);
    requestAnimationFrame(drawCanvas);
    canvas.removeEventListener("mousemove", changeCursor, false);
    document.removeEventListener("keydown", changeCursorToMove, false);

    if (event.shiftKey) {
        dragStartPos = canvasTransform.getTransformedPoint(x, y);
        cropping.addEventListener("mousemove", dragImage, false);
        cropping.addEventListener("mouseup", lockDraggedImage, false);
    }
    else if (event.ctrlKey) {
        const isInsideArea = theta ? isMouseInsideRotatedSelectedArea : isMouseInsideSelectedArea;

        if (isInsideArea(area, x, y)) {
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
        cropping.addEventListener("mousemove", resizeSelectedArea, false);
        cropping.addEventListener("mouseup", lockAdjustedArea, false);
    }
    else {
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
    const isInsideArea = theta ? isMouseInsideRotatedSelectedArea : isMouseInsideSelectedArea;
    const area = selectedArea;
    const x = mousePosition.x;
    const y = mousePosition.y;

    if (event.ctrlKey && isInsideArea(area, x, y)) {
        canvas.style.cursor = "move";
    }
    document.addEventListener("keyup", removeMoveCursor, false);
}

function updateSelectedArea() {
    const widthRatio = ratio.getRatio("width");
    const heightRatio = ratio.getRatio("height");

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
        addBackground();
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
    const transaltedX = x - (area.x + area.width / 2);
    const transaltedY = y - (area.y + area.height / 2);
    const newX = transaltedX * Math.cos(-theta) - transaltedY * Math.sin(-theta);
    const newY = transaltedX * Math.sin(-theta) + transaltedY * Math.cos(-theta);
    const translatedArea = {
        x: -area.width / 2,
        y: -area.height / 2,
        width: area.width,
        height: area.height
    };

    return isMouseInsideSelectedArea(translatedArea, newX, newY);
}

function changeCursor(event) {
    const { x, y } = getMousePosition(event);
    const area = selectedArea;

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
    const { x, y } = getMousePosition(event);
    const area = selectedArea;
    const x2 = area.x + area.width / 2;
    const y2 = area.y + area.height / 2;

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
    const width = area.width > 0 ? area.width : -area.width;
    const height = area.height > 0 ? area.height : -area.height;

    ctx.save();
    ctx.translate(area.x + area.width / 2, area.y + area.height / 2);
    ctx.rotate(radians);
    ctx.strokeStyle = "#006494";
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

function dragImage(event) {
    if (dragStartPos) {
        const { x, y } = getMousePosition(event);
        const pt = canvasTransform.getTransformedPoint(x, y);

        canvasTransform.translate(pt.x - dragStartPos.x, pt.y - dragStartPos.y);
        requestAnimationFrame(drawCanvas);
    }
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

function lockDraggedImage() {
    dragStartPos = null;
    onMouseup(dragImage, lockDraggedImage);
}

function init() {
    const image = process.images[0];

    process.initWorker();
    canvasTransform = trackTransforms(ctx);
    addBackground = getPattern();
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
    angleInput.value = 0;
    sidebarPreview.clean();
    updatePointDisplay(0, 0);
    updateMeasurmentDisplay(0, 0);
}

function resetCropper() {
    scaleInput.value = 100;
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

        // remove preview image after animation finished running.
        setTimeout(()=> {
            cropPreview.removeChild(cropPreview.children[0]);
        }, 600);
        return;
    }
    resetCropper();
    process.worker.postMessage({ action: "generate" });
}

function showPreview() {
    const area = getScaledSelectedArea();
    const croppedCanvas = getCroppedCanvas(canvasImage.original, area);
    const image = new Image();

    isPreviewOpen = true;
    image.classList.add("crop-preview-image");
    image.addEventListener("load", () => {
        let width = croppedCanvas.width;
        let height = croppedCanvas.height;

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

        image.style.width = width + "px";
        image.style.height = height + "px";

        cropPreview.appendChild(image);
        toggleElement("add", cropPreview);
    });
    image.src = croppedCanvas.toDataURL("image/jpeg", quality.get());
}

function loadCanvasWithQuality() {
    const canvasWithQuality = document.createElement("canvas");
    const ctx = canvasWithQuality.getContext("2d");
    const canvasOriginalImage = canvasImage.original;
    let loading = false;

    canvasWithQuality.width = canvasOriginalImage.width;
    canvasWithQuality.height = canvasOriginalImage.height;
    ctx.drawImage(canvasOriginalImage, 0, 0, canvasWithQuality.width, canvasWithQuality.height);

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
    const start = target.selectionStart;
    const end = target.selectionEnd;
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
    const target = event.target;
    const key = getKey(event);
    const input = target.getAttribute("data-input");
    const backspace = key === "Backspace" || key === 8;
    const enter = key === "Enter" || key === 13;

    if (input && /\d|-/.test(key)) {
        const hyphen = key === "-" || key === 45;

        if (hyphen && input !== "x" && input !== "y") {
            event.preventDefault();
            return;
        }

        const inputValue = insertChar(target, key);

        if (input === "scale") {
            scaleImage(canvas.width / 2, canvas.height / 2, inputValue);
            requestAnimationFrame(drawCanvas);
            return;
        }

        if (input === "angle") {
            theta = convertDegreesToRadians(inputValue);
        }
        else {
            const inputRatio = ratio.getRatio(input);
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
    const key = getKey(event);
    const backspace = key === "Backspace" || key === 8;
    const enter = key === "Enter" || key === 13;

    if (backspace || enter) {
        const target = event.target;
        const input = target.getAttribute("data-input");

        if (input === "scale") {
            scaleImage(canvas.width / 2, canvas.height / 2, target.value);
            requestAnimationFrame(drawCanvas);
            return;
        }

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

function trackTransforms(ctx) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let xform = svg.createSVGMatrix();

    function getTransform() {
        return xform;
    }

    function scale(scale) {
        xform.a = 1;
        xform.d = 1;
        xform = xform.scale(scale, scale);
        ctx.setTransform(xform.a, 0, 0, xform.a, xform.e, xform.f);
    }

    function translate(dx, dy) {
        xform = xform.translate(dx, dy);
        ctx.translate(dx, dy);
    }

    function getTransformedPoint(x, y) {
        const pt = svg.createSVGPoint();

        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }

    function resetTransform() {
        xform.a = 1;
        xform.b = 0;
        xform.c = 0;
        xform.d = 1;
        xform.e = 0;
        xform.f = 0;
        ctx.resetTransform();
    }

    return {
        getTransform,
        scale,
        translate,
        getTransformedPoint,
        resetTransform
    };
}

function scaleImage(x, y, scale) {
    canvasTransform.translate(x, y);
    canvasTransform.scale(scale / 100);
    canvasTransform.translate(-x, -y);
}

function handleScroll(event) {
    const { x, y } = getMousePosition(event);
    const pt = canvasTransform.getTransformedPoint(x, y);
    let scale = scaleInput.value;

    if (event.deltaY > 0) {
        scale *= 0.8;
    }
    else {
        scale /= 0.8;
    }
    scaleImage(pt.x, pt.y, scale);
    requestAnimationFrame(drawCanvas);
    scaleInput.value = Math.round(scale);
}

function resetCanvas() {
    theta = 0;
    scaleInput.value = 100;
    canvasTransform.resetTransform();
    quality.reset();
    resetData();
    drawImage();
}

closeButton.addEventListener("click", closeCropping, false);
cropData.addEventListener("keypress", updateCanvasWithCropData, false);
cropData.addEventListener("keyup", updateSelectedAreaWithCropData, false);
document.getElementById("js-crop-data-btns").addEventListener("click", onSidebarBtnClick, false);
canvas.addEventListener("wheel", handleScroll, false);
resetButton.addEventListener("click", resetCanvas, false);

export { init, changeCanvasQuality };
