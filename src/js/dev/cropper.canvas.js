import * as cropper from "./cropper.js";
import * as sidebar from "./cropper.sidebar.js";
import * as quality from "./cropper.quality.js";

const canvas = document.getElementById("js-canvas");
const ctx = canvas.getContext("2d");
const mousePosition = {};
const canvasImage = {
    original: new Image(),
    withQuality: new Image()
};
let changeCanvasQuality = null;
let dragStartPos = null;
let moveSelectedArea;
let canvasTransform;
const addBackground = getPattern();

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

    return {
        get: getRatio,
        set: setRatio
    };
})();

const direction = (function() {
    let direction = "";

    function getDirection() {
        return direction;
    }

    function getVerticalDirection(direction, inWestBound, inEastBound) {
        if (inWestBound) {
            direction += "w";
        }
        else if (inEastBound) {
            direction += "e";
        }
        return direction;
    }

    function reverseDirection(direction, oppositeDirection, area) {
        const x = area.x;
        const y = area.y;
        const x2 = x + area.width;
        const y2 = y + area.height;

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

    function getOppositeDirection(x, y, area) {
        const newDirection = setDirection(x, y, area);

        switch (newDirection) {
            case "nw":
                return reverseDirection(newDirection, "ne", area);
            case "ne":
                return reverseDirection(newDirection, "nw", area);
            case "sw":
                return reverseDirection(newDirection, "se", area);
            case "se":
                return reverseDirection(newDirection, "sw", area);
            default:
                return newDirection;
        }
    }

    function setDirection(x, y, area) {
        const margin = 4;
        const x2 = area.x;
        const y2 = area.y;
        const x3 = x2 + area.width;
        const y3 = y2 + area.height;
        const inXBound = x >= x2 - margin && x <= x3 + margin || x <= x2 + margin && x >= x3 - margin;
        const inYBound = y >= y2 - margin && y <= y3 + margin || y <= y2 + margin && y >= y3 - margin;

        direction = "";
        if (inXBound && inYBound) {
            const inNorthBound = y >= y2 - margin && y <= y2 + margin;
            const inEastBound = x >= x3 - margin && x <= x3 + margin;
            const inSouthBound = y >= y3 - margin && y <= y3 + margin;
            const inWestBound = x >= x2 - margin && x <= x2 + margin;

            if (inNorthBound) {
                direction = getVerticalDirection("n", inWestBound, inEastBound);
            }
            else if (inSouthBound) {
                direction = getVerticalDirection("s", inWestBound, inEastBound);
            }
            else if (inEastBound) {
                direction = "e";
            }
            else if (inWestBound) {
                direction = "w";
            }
        }
        return direction;
    }

    return {
        get: getDirection,
        getOpposite: getOppositeDirection,
        set: setDirection,
        reverse: reverseDirection
    };
})();

const selectedArea = (function() {
    const area = {};
    const transformedArea = {};
    let hasArea;

    function getArea(transformed) {
        return transformed ? transformedArea : area;
    }

    function getScaledArea() {
        const widthRatio = ratio.get("width");
        const heightRatio = ratio.get("height");

        return {
            x: area.x * widthRatio,
            y: area.y * heightRatio,
            width: area.width * widthRatio,
            height: area.height * heightRatio
        };
    }

    function getAreaProp(key) {
        return area[key];
    }

    function setArea(newArea, transformed) {
        if (transformed) {
            Object.assign(transformedArea, newArea);
            return transformedArea;
        }
        Object.assign(area, newArea);
        return area;
    }

    function setAreaProp(key, value, transformed) {
        if (transformed) {
            transformedArea[key] = value;
        }
        else {
            area[key] = value;
        }
        return value;
    }

    function resetArea() {
        area.x = 0;
        area.y = 0;
        area.width = 0;
        area.height = 0;
        Object.assign(transformedArea, area);
        return area;
    }

    function updateAreaFromInput(input, inputValue) {
        const inputRatio = ratio.get(input);
        const transform = canvasTransform.getTransform();
        const scale = transform.a;
        let areaValue = 0;

        transformedArea[input] = inputValue / inputRatio * scale || 0;
        if (input === "x") {
            const translatedX = transform.e;

            areaValue = translatedX;
            if (area.width < 0) {
                area.width = -area.width;
            }
        }
        else if (input === "y") {
            const translatedY = transform.f;

            areaValue = translatedY;
            if (area.height < 0) {
                area.height = -area.height;
            }
        }
        else if (input === "width") {
            if (area[input] < 0) {
                area.x = area.x + area[input];
            }
        }
        else if (input === "height") {
            if (area[input] < 0) {
                area.y = area.y + area[input];
            }
        }
        area[input] = areaValue + transformedArea[input];
    }

    function setHasArea(area) {
        hasArea = area;
        return hasArea;
    }
    function getHasArea() {
        return hasArea;
    }

    return {
        get: getArea,
        getScaled: getScaledArea,
        set: setArea,
        getProp: getAreaProp,
        setProp: setAreaProp,
        reset: resetArea,
        update: updateAreaFromInput,
        setHasArea: setHasArea,
        getHasArea: getHasArea
    };
})();

function updateTransformedArea(area, canvasReset) {
    let { x, y } = canvasTransform.getTransformedPoint(area.x, area.y);
    const pt2 = canvasTransform.getTransformedPoint(area.x + area.width, area.y + area.height);
    const width = pt2.x - x;
    const height = pt2.y - y;

    selectedArea.set({
        x: x,
        y: y,
        width: width,
        height: height
    }, true);

    if (canvasReset) {
        x = 0;
        y = 0;
    }
    sidebar.updatePointDisplay(x, y);
    sidebar.updateMeasurmentDisplay(width, height);
}

function drawImage(image) {
    const width = canvasImage.width;
    const height = canvasImage.height;

    if (quality.useImageWithQuality()) {
        image = canvasImage.withQuality;
    }
    else if (!image) {
        image = canvasImage.original;
    }
    ctx.drawImage(image, 0, 0, width, height);
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

    // +0.5 to get line width of 1px
    ctx.strokeRect(area.x + 0.5, area.y + 0.5, area.width, area.height);
}

function drawArea(area) {
    const width = area.width;
    const height = area.height;
    const hasArea = width && height;
    let x = area.x;
    let y = area.y;
    let imageData;

    if (hasArea) {
        imageData = ctx.getImageData(x, y, width, height);
        if (width < 0) {
            x = x + width;
        }
        if (height < 0) {
            y = y + height;
        }
    }
    if (hasArea || selectedArea.getHasArea()) {
        addMask();
    }
    if (imageData) {
        ctx.putImageData(imageData, x, y);
    }
    strokeRect(area);
}

function drawRotatedArea(area, radians) {
    const width = area.width > 0 ? area.width : -area.width;
    const height = area.height > 0 ? area.height : -area.height;

    ctx.save();

    // +0.5 to get line width of 1px
    ctx.translate(area.x + 0.5 + area.width / 2, area.y + 0.5 + area.height / 2);
    ctx.rotate(radians);
    ctx.strokeRect(-area.width / 2, -area.height / 2, area.width, area.height);
    ctx.beginPath();
    ctx.rect(-width / 2, -height / 2, width, height);
    ctx.restore();
    ctx.rect(canvas.width, 0, -canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fill();
}

function drawCanvas() {
    const image = quality.useImageWithQuality() ? canvasImage.withQuality : canvasImage.original;
    const angle = sidebar.angle.get();
    const area = selectedArea.get();

    addBackground();
    drawImage(image);

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#006494";
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (angle) {
        drawRotatedArea(area, angle);
    }
    else {
        drawArea(area);
    }
    ctx.restore();
    sidebar.preview.draw(image);
}

function getImageSize({ width, height }, maxWidth, maxHeight, ratio) {
    if (width > maxWidth) {
        width = maxWidth;
        height = width / ratio;
    }
    if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
    }
    return { width, height };
}

function drawInitialImage(uri) {
    canvasImage.original.addEventListener("load", () => {
        const { width: imageWidth, height: imageHeight } = canvasImage.original;
        const imageRatio = imageWidth / imageHeight;
        const maxWidth = window.innerWidth - 212;
        const maxHeight = window.innerHeight - 40;
        const { width, height } = getImageSize(canvasImage.original, maxWidth, maxHeight, imageRatio);
        const translatedWidth = canvasTransform.setTranslated("width", (maxWidth - width) / 2);
        const translatedHeight = canvasTransform.setTranslated("height", (maxHeight - height) / 2);

        canvas.width = maxWidth;
        canvas.height = maxHeight;
        canvasImage.width = width;
        canvasImage.height = height;
        addBackground();
        canvasTransform.resetTransform();
        canvasTransform.translate(translatedWidth, translatedHeight);
        ctx.drawImage(canvasImage.original, 0, 0, width, height);
        changeCanvasQuality = loadCanvasWithQuality();
        ratio.set("width", imageWidth / width);
        ratio.set("height", imageHeight / height);
        canvas.classList.add("show");
    });
    canvasImage.original.src = uri;
}

function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
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
    const newDirection = direction.get();
    const area = selectedArea.get();
    let oppositeDirection = "";

    if (newDirection.indexOf("n") !== -1) {
        selectedArea.setProp("height", area.y - y + area.height);
        selectedArea.setProp("y", y);
        oppositeDirection = "n";
    }
    else if (newDirection.indexOf("s") !== -1) {
        selectedArea.setProp("height", y - area.y);
        oppositeDirection = "s";
    }

    if (newDirection.indexOf("w") !== -1) {
        selectedArea.setProp("width", area.x - x + area.width);
        selectedArea.setProp("x", x);
        oppositeDirection += "e";
    }
    else if (newDirection.indexOf("e") !== -1) {
        selectedArea.setProp("width", x - area.x);
        oppositeDirection += "w";
    }

    if (oppositeDirection.length > 1) {
        const selectedDirection = direction.reverse(newDirection, oppositeDirection, area);

        canvas.style.cursor = selectedDirection + "-resize";
    }
    requestAnimationFrame(drawCanvas);
    updateTransformedArea(area);
}

function getDistanceBetweenPoints(x, y) {
    const area = selectedArea.get();
    const xDiff = x - area.x;
    const yDiff = y - area.y;

    return function(event) {
        if (!event.ctrlKey) {
            return;
        }

        const { x, y } = getMousePosition(event);
        const newX = selectedArea.setProp("x", x - xDiff);
        const newY = selectedArea.setProp("y", y - yDiff);

        requestAnimationFrame(drawCanvas);

        const pt = canvasTransform.getTransformedPoint(newX, newY);

        sidebar.updatePointDisplay(pt.x, pt.y);
    };
}

function onSelectionStart(event) {
    if (event.which !== 1) {
        return;
    }

    const { x, y } = getMousePosition(event);
    const area = selectedArea.get();
    const hasArea = area.width && area.height;
    const angle = sidebar.angle.get();
    const newDirection = direction.set(x, y, area);

    canvas.removeEventListener("mousemove", changeCursor, false);
    window.removeEventListener("keydown", changeCursorToMove, false);

    if (event.shiftKey) {
        dragStartPos = canvasTransform.getTransformedPoint(x, y);
        cropper.cropping.toggleEventListeners("add", dragImage, lockDraggedImage);
    }
    else if (event.ctrlKey && hasArea) {
        const isInsideArea = angle ? isMouseInsideRotatedSelectedArea : isMouseInsideSelectedArea;

        if (isInsideArea(area, x, y)) {
            moveSelectedArea = getDistanceBetweenPoints(x, y);
            cropper.cropping.toggleEventListeners("add", moveSelectedArea, lockMovedArea);
            return;
        }
        cropper.cropping.toggleEventListeners("add", rotateSelectedArea, lockRotatedArea);
    }
    else if (newDirection && hasArea && !angle) {
        cropper.cropping.toggleEventListeners("add", resizeSelectedArea, lockAdjustedArea);
    }
    else {
        resetData();
        sidebar.angle.reset();
        selectedArea.setProp("x", x);
        selectedArea.setProp("y", y);
        sidebar.updatePointDisplay(x, y);
        cropper.cropping.toggleEventListeners("add", selectArea, lockSelectedArea);
    }
    requestAnimationFrame(drawCanvas);
}

function selectArea(event) {
    const { x, y } = getMousePosition(event);
    const area = selectedArea.get();

    selectedArea.setProp("width", x - area.x);
    selectedArea.setProp("height", y - area.y);
    selectedArea.setHasArea(true);
    requestAnimationFrame(drawCanvas);
    updateTransformedArea(area);
}

function removeMoveCursor() {
    canvas.style.cursor = "default";
    window.removeEventListener("keyup", removeMoveCursor, false);
}

function changeCursorToMove(event) {
    const angle = sidebar.angle.get();
    const isInsideArea = angle ? isMouseInsideRotatedSelectedArea : isMouseInsideSelectedArea;
    const area = selectedArea;
    const x = mousePosition.x;
    const y = mousePosition.y;

    if (event.ctrlKey && isInsideArea(area, x, y)) {
        canvas.style.cursor = "move";
    }
    window.addEventListener("keyup", removeMoveCursor, false);
}

function onMouseup(mousemoveCallback, mouseupCallback) {
    const area = selectedArea.get();
    const hasArea = area.width && area.height;

    cropper.cropping.toggleEventListeners("remove", mousemoveCallback, mouseupCallback);
    if (hasArea) {
        canvas.addEventListener("mousemove", changeCursor, false);
        window.addEventListener("keydown", changeCursorToMove, false);
    }
    else {
        const transform = canvasTransform.getTransform();
        const area = selectedArea.reset();

        sidebar.updateDataDisplay(area);
        selectedArea.setProp("x", transform.e);
        selectedArea.setProp("y", transform.f);
        addBackground();
        drawImage();
        canvas.style.cursor = "default";
    }
    selectedArea.setHasArea(hasArea);
    sidebar.toggleButtons(!hasArea);
}

function changeResizeCursor(x, y) {
    const area = selectedArea.get();
    const newDirection = direction.getOpposite(x, y, area);

    canvas.style.cursor = newDirection ? newDirection + "-resize" : "default";
}

function isMouseInsideRotatedSelectedArea(area, x, y) {
    const angle = sidebar.angle.get();
    const transaltedX = x - (area.x + area.width / 2);
    const transaltedY = y - (area.y + area.height / 2);
    const newX = transaltedX * Math.cos(-angle) - transaltedY * Math.sin(-angle);
    const newY = transaltedX * Math.sin(-angle) + transaltedY * Math.cos(-angle);
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
    const area = selectedArea.get();
    const angle = sidebar.angle.get();

    mousePosition.x = x;
    mousePosition.y = y;

    if (event.ctrlKey) {
        const isInsideArea = angle ? isMouseInsideRotatedSelectedArea : isMouseInsideSelectedArea;

        if (isInsideArea(area, x, y)) {
            canvas.style.cursor = "move";
            return;
        }
        canvas.style.cursor = "default";
        return;
    }

    if (!angle) {
        changeResizeCursor(x, y);
    }
}

function getAngleInRadians(event) {
    const { x, y } = getMousePosition(event);
    const area = selectedArea.get();
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

function rotateSelectedArea(event) {
    const radians = getAngleInRadians(event);
    const degrees = convertRadiansToDegrees(radians);

    sidebar.cropDataInputs.setValue("angle", degrees);
    if (degrees === 0 || degrees === 360) {
        sidebar.angle.reset();
    }
    else {
        sidebar.angle.set(radians);
    }
    requestAnimationFrame(drawCanvas);
}

function dragImage(event) {
    if (dragStartPos) {
        const { x, y } = getMousePosition(event);
        const pt = canvasTransform.getTransformedPoint(x, y);
        const area = selectedArea.get();

        canvasTransform.translate(pt.x - dragStartPos.x, pt.y - dragStartPos.y);
        requestAnimationFrame(drawCanvas);
        if (area.width && area.height) {
            const pt = canvasTransform.getTransformedPoint(area.x, area.y);

            sidebar.updatePointDisplay(pt.x, pt.y);
        }
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

function init(image) {
    drawInitialImage(image.uri);
    canvasTransform = trackTransforms(ctx);
    canvas.addEventListener("mousedown", onSelectionStart, false);
}

function resetData(canvasReset) {
    const area = selectedArea.reset();

    sidebar.cropDataInputs.setValue("angle", 0);
    sidebar.preview.clean();
    updateTransformedArea(area, canvasReset);
}

function resetCropper() {
    sidebar.cropDataInputs.setValue("scale", 100);
    quality.reset();
    resetData(true);
    cropper.updateRemainingImageIndicator("remove");
    cropper.cropping.hide();
    canvas.removeEventListener("mousedown", onSelectionStart, false);
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

function trackTransforms(ctx) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const translatedDimension = {};
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

    function setTranslatedDimension(dimension, value) {
        translatedDimension[dimension] = value;
        return value;
    }

    function getTranslated() {
        return translatedDimension;
    }

    return {
        setTranslated: setTranslatedDimension,
        getTranslated,
        getTransform,
        scale,
        translate,
        getTransformedPoint,
        resetTransform
    };
}

function scaleImage(x, y, scale) {
    const area = selectedArea.get();

    canvasTransform.translate(x, y);
    canvasTransform.scale(scale / 100);
    canvasTransform.translate(-x, -y);

    if (area.width && area.height) {
        updateTransformedArea(area);
    }
}

function handleScroll(event) {
    const { x, y } = getMousePosition(event);
    const pt = canvasTransform.getTransformedPoint(x, y);
    let scale = sidebar.cropDataInputs.getValue("scale");

    if (event.deltaY > 0) {
        scale *= 0.8;
    }
    else {
        scale /= 0.8;
    }
    scaleImage(pt.x, pt.y, scale);
    requestAnimationFrame(drawCanvas);
    sidebar.cropDataInputs.setValue("scale", Math.round(scale));
}

canvas.addEventListener("wheel", handleScroll, false);

export {
    init,
    ratio,
    canvas,
    scaleImage,
    canvasImage,
    drawInitialImage,
    canvasTransform,
    getImageSize,
    selectedArea,
    drawCanvas,
    drawImage,
    addBackground,
    resetData,
    resetCropper,
    changeCanvasQuality
};
