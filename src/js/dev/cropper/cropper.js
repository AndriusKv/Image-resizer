import * as worker from "./../editor.worker.js";
import * as dropbox from "./../dropbox/dropbox.js";
import * as transform from "./cropper.canvas-transform.js";
import * as canvasElement from "./cropper.canvas-element.js";
import * as canvas from "./cropper.canvas.js";
import * as leftBar from "./cropper.left-bar.js";
import * as rightBar from "./cropper.right-bar.js";
import * as preview from "./cropper.preview.js";
import * as images from "./cropper.images.js";
import * as dataInput from "./cropper.data-input.js";
import * as events from "./cropper.canvas-events.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as direction from "./cropper.direction.js";
import * as angle from "./cropper.angle.js";
import * as quality from "./cropper.quality.js";

let postedToWorker = false;

const cropper = (function() {
    const cropper = document.getElementById("js-crop");

    function showCropper() {
        cropper.classList.add("show");
    }

    function hideCropper() {
        cropper.classList.remove("show");
    }

    return {
        show: showCropper,
        hide: hideCropper
    };
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

const redrawOnResize = (function() {
    let running = false;

    function resetCanvasProperties() {
        const ctx = canvasElement.getContext();
        const xform = transform.get();

        canvasElement.resetDimensions();
        transform.set(ctx, xform.a, xform.b, xform.c, xform.d, xform.e, xform.f);
    }

    function onResize() {
        if (running) {
            return;
        }
        running = true;
        requestAnimationFrame(() => {
            resetCanvasProperties();
            draw();
            running = false;
        });
    }

    function enable() {
        window.addEventListener("resize", onResize);
    }

    function disable() {
        window.removeEventListener("resize", onResize);
    }

    return {
        enable,
        disable
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

function sendImageToWorker(imageToCrop) {
    return new Promise(resolve => {
        const image = new Image();

        image.onload = function() {
            const scaledArea = selectedArea.get(true);
            const croppedCanvas = getCroppedCanvas(image, scaledArea);

            postedToWorker = true;
            worker.post({
                action: "add",
                image: {
                    name: imageToCrop.name.setByUser,
                    type: imageToCrop.type.slice(6),
                    uri: croppedCanvas.toDataURL(imageToCrop.type, quality.get())
                }
            });
            resolve();
        };
        image.src = imageToCrop.uri;
    });
}

function displayImageName(name) {
    document.getElementById("js-crop-image-name").textContent = name;
}

function updateTransformedArea(area, canvasReset) {
    const { x, y } = transform.getTransformedPoint(area.x, area.y);
    const pt = transform.getTransformedPoint(area.x + area.width, area.y + area.height);
    const width = pt.x - x;
    const height = pt.y - y;
    const transformedArea = selectedArea.set({
        x: x,
        y: y,
        width: width,
        height: height
    }, true);

    if (canvasReset) {
        transformedArea.x = 0;
        transformedArea.y = 0;
    }

    dataInput.update(transformedArea);
}

function init(loadedImages) {
    images.set(loadedImages);
    canvasElement.resetDimensions();
    setupInitialImage(loadedImages[0]);
    canvasElement.addEventListener("wheel", handleScroll);
    canvasElement.addEventListener("mousedown", onSelectionStart);
    canvasElement.addEventListener("mousemove", trackMousePosition);
    canvasElement.addEventListener("mouseleave", hideMousePosition);
    worker.init();
    leftBar.init(loadedImages);
    redrawOnResize.enable();
    cropper.show();
}

function draw(strokeColor) {
    const image = canvas.image.get(quality.useImageWithQuality());
    const currentAngle = angle.get();
    const area = selectedArea.get();
    const areaDrawn = selectedArea.isDrawn();

    canvas.drawCanvas(image, area, currentAngle, areaDrawn, strokeColor);
    if (rightBar.isVisible()) {
        const scaledArea = selectedArea.get(true);

        rightBar.preview.draw(image, scaledArea);
    }
}

function setupInitialImage(image) {
    displayImageName(image.name.original);
    rightBar.toggleButton(true, "crop", "preview");
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

function resetCropper() {
    cropper.hide();
    resetData();
    selectedArea.containsArea(false);
    events.toggleCursorEvents();
    canvasElement.removeEventListener("wheel", handleScroll);
    canvasElement.removeEventListener("mousedown", onSelectionStart);
    canvasElement.removeEventListener("mousemove", trackMousePosition);
    canvasElement.removeEventListener("mouseleave", hideMousePosition);
    redrawOnResize.disable();

    if (postedToWorker) {
        postedToWorker = false;
        dropbox.generateZip();
    }
}

function resetData() {
    quality.reset();
    dataInput.setValue("scale", 100);
    dataInput.setValue("quality", 0.92);
    dataInput.setValue("quality-display", 0.92);
    resetAreaAndAngle();
    updateTransformedArea(selectedArea.get(), true);
}

function scaleImage(x, y, scale) {
    const ctx = canvasElement.getContext();
    const area = selectedArea.get();

    transform.translate(ctx, x, y);
    transform.scale(ctx, scale / 100);
    transform.translate(ctx, -x, -y);

    if (area.width && area.height) {
        updateTransformedArea(area);
    }
    else {
        const { e: translatedX, f: translatedY } = transform.get();

        selectedArea.setProp("x", translatedX);
        selectedArea.setProp("y", translatedY);
    }
    requestAnimationFrame(draw);
}

function handleScroll(event) {
    const { x, y } = canvasElement.getMousePosition(event);
    const pt = transform.getTransformedPoint(x, y);
    let scale = dataInput.getValue("scale");

    if (event.deltaY > 0) {
        scale *= 0.8;
    }
    else {
        scale /= 0.8;
    }
    scaleImage(pt.x, pt.y, scale);
    dataInput.setValue("scale", Math.round(scale));
}

function trackMousePosition(event) {
    const { x, y } = canvasElement.getMousePosition(event);
    const pt = transform.getTransformedPoint(x, y);
    const mousePosX = Math.floor(pt.x);
    const mousePosY = Math.floor(pt.y);

    document.getElementById("js-crop-mouse-pos").textContent = `${mousePosX}, ${mousePosY}`;
}

function hideMousePosition() {
    document.getElementById("js-crop-mouse-pos").textContent = "";
}

function loadNextImage(image) {
    resetData();
    selectedArea.containsArea(false);
    canvasElement.hide();
    setTimeout(() => {
        setupInitialImage(image);
    }, 240);
}

function cropImage() {
    const messageElem = document.getElementById("js-crop-message");

    draw("crimson");
    messageElem.classList.add("show");
    sendImageToWorker(images.getActive())
    .then(() => {
        setTimeout(() => {
            draw();
            messageElem.classList.remove("show");
        }, 200);
    });
}

function showPreview() {
    const area = selectedArea.get(true);
    const image = canvas.image.get(quality.useImageWithQuality());
    const croppedCanvas = getCroppedCanvas(image, area);
    const uri = croppedCanvas.toDataURL("image/jpeg");

    preview.show(uri);
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

function scaleImageToFitCanvas(image) {
    const ctx = canvasElement.getContext();
    const { width: canvasWidth, height: canvasHeight } = canvasElement.getDimensions();
    const { width, height } = image;
    let realWidth = canvasWidth;
    let scale = 100;

    if (rightBar.isVisible()) {
        realWidth -= 200;
    }
    if (leftBar.isVisible()) {
        realWidth -= 100;
    }

    if (width > height) {
        scale = getScale(width, height, realWidth, canvasHeight);
    }
    else {
        scale = getScale(height, width, canvasHeight, realWidth);
    }

    const x = canvasWidth - width * scale / 100;
    const y = canvasHeight - height * scale / 100;

    setDefaultImagePosition(x, y);
    transform.reset(ctx);
    scaleImage(0, 0, scale);
    dataInput.setValue("scale", Math.round(scale));
    canvas.drawImage(image);
}

function resetCanvas() {
    const translated = transform.getTranslated();

    resetData();
    selectedArea.setDefaultPos(translated.x, translated.y);
    selectedArea.containsArea(false);
    scaleImageToFitCanvas(canvas.image.get());
    rightBar.toggleButton(true, "crop", "preview");
}

function onTopBarBtnClick({ target }) {
    const btn = target.getAttribute("data-btn");

    switch (btn) {
        case "images":
            leftBar.toggle();
            break;
        case "reset":
            resetCanvas();
            break;
        case "close":
            resetCropper();
            break;
    }
}

function onBottomBarBtnClick({ target }) {
    const btn = target.getAttribute("data-btn");

    switch (btn) {
        case "crop":
            cropImage();
            break;
        case "preview":
            showPreview();
            break;
        case "toggle":
            rightBar.toggle(target);
            break;
    }
}

document.getElementById("js-crop-top-bar").addEventListener("click", onTopBarBtnClick);
document.getElementById("js-crop-bottom-btns").addEventListener("click", onBottomBarBtnClick);

export {
    init,
    draw,
    mousePosition,
    updateTransformedArea,
    getCroppedCanvas,
    scaleImage,
    loadNextImage
};
