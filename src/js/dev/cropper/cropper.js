import * as transform from "./cropper.canvas-transform.js";
import * as canvasElement from "./cropper.canvas-element.js";
import * as canvas from "./cropper.canvas.js";
import * as topBar from "./cropper.top-bar.js";
import * as leftBar from "./cropper.left-bar.js";
import * as bottomBar from "./cropper.bottom-bar.js";
import * as rightBar from "./cropper.right-bar.js";
import * as resize from "./cropper.resize.js";
import * as images from "./cropper.images.js";
import * as dataInput from "./cropper.data-input.js";
import * as events from "./cropper.canvas-events.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as direction from "./cropper.direction.js";
import * as angle from "./cropper.angle.js";
import * as quality from "./cropper.quality.js";

const cropperElement = (function() {
    const cropper = document.getElementById("js-crop");

    function show() {
        cropper.classList.add("show");
    }

    function hide() {
        cropper.classList.remove("show");
    }

    return { show, hide };
})();

const mousePosition = (function() {
    let mousePosition = null;

    function setPosition(pos) {
        mousePosition = pos;
    }

    function getPosition() {
        return mousePosition;
    }

    return {
        set: setPosition,
        get: getPosition
    };
})();

function getImageData(image, area, ctx, angle, translated) {
    ctx.save();
    if (angle) {
        const centerX = area.x + area.width / 2;
        const centerY = area.y + area.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(-angle);
        ctx.translate(-centerX, -centerY);
    }
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.restore();

    return ctx.getImageData(area.x + translated.x, area.y + translated.y, area.width, area.height);
}

function getCroppedCanvas(image, area) {
    const croppedCanvas = document.createElement("canvas");
    const ctx = croppedCanvas.getContext("2d");
    const translated = transform.getTranslated();

    croppedCanvas.width = image.width + translated.x * 2;
    croppedCanvas.height = image.height + translated.y * 2;
    ctx.translate(translated.x, translated.y);

    const imageData = getImageData(image, area, ctx, angle.get(), translated);

    croppedCanvas.width = imageData.width;
    croppedCanvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    return croppedCanvas;
}

function updateTransformedArea(area, canvasReset) {
    const { x, y } = transform.getTransformedPoint(area.x, area.y);
    const pt = transform.getTransformedPoint(area.x + area.width, area.y + area.height);
    const width = pt.x - x;
    const height = pt.y - y;
    const transformedArea = selectedArea.setTransformed({ x, y, width, height });

    if (canvasReset) {
        transformedArea.x = 0;
        transformedArea.y = 0;
    }
    dataInput.update(transformedArea);
}

function toggleCanvasElementEventListeners(action) {
    canvasElement[`${action}EventListener`]("wheel", handleScroll, { passive: true });
    canvasElement[`${action}EventListener`]("mousedown", onSelectionStart);
    canvasElement[`${action}EventListener`]("mousemove", trackMousePosition);
    canvasElement[`${action}EventListener`]("mouseleave", bottomBar.hideMousePosition);
}

function init(loadedImages) {
    images.set(loadedImages);
    canvasElement.resetDimensions();
    setupInitialImage(loadedImages[0]);
    leftBar.init(loadedImages);
    bottomBar.init();
    resize.enable();
    toggleCanvasElementEventListeners("add");
    cropperElement.show();
}

function draw() {
    const image = canvas.image.get(quality.useImageWithQuality());
    const currentAngle = angle.get();
    const area = selectedArea.get();
    const areaDrawn = selectedArea.isDrawn();

    canvas.drawCanvas(image, area, currentAngle, areaDrawn);
    if (rightBar.isVisible()) {
        const transformed = selectedArea.getTransformed();

        rightBar.preview.draw(image, transformed);
    }
}

function setupInitialImage(image) {
    topBar.displayImageName(image.name.original);
    bottomBar.disableButton("crop", "preview");
    canvas.drawInitialImage(image.uri, scaleImageToFitCanvas)
    .then(() => {
        const translated = transform.getTranslated();

        selectedArea.setDefaultPos(translated.x, translated.y);
    });
}

function onSelectionStart(event) {
    if (event.which !== 1) {
        return;
    }

    const { x, y } = canvasElement.getMousePosition(event);
    const area = selectedArea.get();
    const hasArea = area.width && area.height;
    const currentAngle = angle.get();
    const newDirection = direction.set(x, y, area);
    let eventToEnable = "select";

    if (event.shiftKey) {
        mousePosition.set(transform.getTransformedPoint(x, y));
        eventToEnable = "drag";
    }
    else if (event.ctrlKey && hasArea) {
        if (selectedArea.isInside(area, x, y, currentAngle)) {
            mousePosition.set({
                x: x - area.x,
                y: y - area.y
            });
            eventToEnable = "move";
        }
        else {
            eventToEnable = "rotate";
        }
    }
    else if (newDirection && hasArea && !currentAngle) {
        eventToEnable = "resize";
    }
    else {
        resetAreaAndAngle();
        selectedArea.setProp("x", x);
        selectedArea.setProp("y", y);

        const pt = transform.getTransformedPoint(x, y);

        dataInput.update({
            x: pt.x,
            y: pt.y,
            width: 0,
            height: 0
        });
    }
    events.toggleEvent(eventToEnable);
    requestAnimationFrame(draw);
}

function resetAreaAndAngle() {
    selectedArea.reset();
    angle.reset();
    dataInput.setValue("angle", 0);
    rightBar.preview.clean();
}

function resetData() {
    quality.reset();
    dataInput.setValue("scale", 100);
    dataInput.setValue("quality", 0.92);
    dataInput.setValue("quality-display", 0.92);
    resetAreaAndAngle();
    updateTransformedArea(selectedArea.get(), true);
}

function scaleToPoint(x, y, scale) {
    const ctx = canvasElement.getContext();

    transform.translate(ctx, x, y);
    transform.scale(ctx, scale / 100);
    transform.translate(ctx, -x, -y);
}

function scaleImage(x, y, scale) {
    const area = selectedArea.get();

    scaleToPoint(x, y, scale);

    if (area.width && area.height) {
        updateTransformedArea(area);
    }
    else {
        const { e: translatedX, f: translatedY } = transform.get();

        selectedArea.setProp("x", translatedX);
        selectedArea.setProp("y", translatedY);
    }
    dataInput.setValue("scale", scale);
    requestAnimationFrame(draw);
}

function adjustScale(scale) {
    if (scale < 10) {
        scale = 10;
    }
    else if (scale > 4000) {
        scale = 4000;
    }
    return scale;
}

function handleScroll(event) {
    const { x, y } = canvasElement.getMousePosition(event);
    const pt = transform.getTransformedPoint(x, y);
    let scale = Number.parseInt(dataInput.getValue("scale"), 10) || 100;

    if (event.deltaY > 0) {
        scale *= 0.8;
    }
    else {
        scale /= 0.8;
    }
    scale = adjustScale(Math.floor(scale));
    scaleImage(pt.x, pt.y, scale);
}

function trackMousePosition(event) {
    const { x, y } = canvasElement.getMousePosition(event);
    const pt = transform.getTransformedPoint(x, y);
    const mousePosX = Math.floor(pt.x);
    const mousePosY = Math.floor(pt.y);

    bottomBar.setMousePosition(`${mousePosX}, ${mousePosY}`);
}

function loadNextImage(image) {
    resetData();
    selectedArea.containsArea(false);
    canvasElement.hide();
    setTimeout(() => {
        setupInitialImage(image);
    }, 240);
}

function getScale(imageDimension1, imageDimension2, canvasDimension1, canvasDimension2) {
    let scale = 100;

    function getDimensionScale(scale, imageDimension, canvasDimension) {
        const excess = imageDimension - canvasDimension;

        return scale - 100 / (imageDimension / excess);
    }

    if (imageDimension1 > canvasDimension1) {
        scale = getDimensionScale(scale, imageDimension1, canvasDimension1);

        if (imageDimension2 * scale / 100 > canvasDimension2) {
            scale = getDimensionScale(100, imageDimension2, canvasDimension2);
        }
    }
    return scale;
}

function setDefaultImagePosition(x, y) {
    if (rightBar.isVisible()) {
        x -= 200;
    }
    if (leftBar.isVisible()) {
        x += 100;
    }
    transform.setDefaultTranslation(x / 2, y / 2);
}

function getRealCanvasWidth(width) {
    if (rightBar.isVisible()) {
        width -= 200;
    }
    if (leftBar.isVisible()) {
        width -= 100;
    }
    return width;
}

function scaleImageToFitCanvas(image) {
    const { width: canvasWidth, height: canvasHeight } = canvasElement.getDimensions();
    const { width, height } = image;
    const realWidth = getRealCanvasWidth(canvasWidth);
    let scale = 100;

    if (width > height) {
        scale = getScale(width, height, realWidth, canvasHeight);
    }
    else {
        scale = getScale(height, width, canvasHeight, realWidth);
    }

    const x = canvasWidth - width * scale / 100;
    const y = canvasHeight - height * scale / 100;
    const ctx = canvasElement.getContext();

    setDefaultImagePosition(x, y);
    transform.reset(ctx);
    scaleImage(0, 0, scale);
    canvas.drawImage(ctx, image);
}

export {
    init,
    draw,
    cropperElement,
    mousePosition,
    updateTransformedArea,
    getCroppedCanvas,
    resetData,
    scaleImageToFitCanvas,
    adjustScale,
    scaleImage,
    loadNextImage,
    toggleCanvasElementEventListeners
};
