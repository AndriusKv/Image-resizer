import * as worker from "./../editor.worker.js";
import * as dropbox from "./../dropbox/dropbox.js";
import * as images from "./../dropbox/dropbox.images.js";
import * as canvas from "./cropper.canvas.js";
import * as sidebar from "./cropper.sidebar.js";
import * as dataInput from "./cropper.data-input.js";
import * as events from "./cropper.canvas-events.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as direction from "./cropper.direction.js";
import * as angle from "./cropper.angle.js";
import * as quality from "./cropper.quality.js";

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

const preview = (function() {
    const cropPreview = document.getElementById("js-crop-preview");
    const imageContainer = cropPreview.firstElementChild;

    function showPreview(uri) {
        const image = new Image();

        image.onload = function() {
            let width = image.width;
            let height = image.height;
            const maxWidth = window.innerWidth - 8;
            const maxHeight = window.innerHeight - 8;
            const ratio = width / height;

            if (width > maxWidth) {
                width = maxWidth;
                height = Math.floor(width / ratio);
            }

            if (height > maxHeight) {
                height = maxHeight;
                width = Math.floor(height * ratio);
            }

            image.style.width = `${width}px`;
            image.style.height = `${height}px`;
        };
        image.src = uri;
        imageContainer.appendChild(image);
        cropPreview.classList.add("show");
    }

    function hidePreview() {
        cropPreview.classList.remove("show");

        // remove preview image after animation finished running.
        setTimeout(() => {
            imageContainer.removeChild(imageContainer.lastElementChild);
        }, 600);
    }

    return {
        show: showPreview,
        hide: hidePreview
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

    function onResize() {
        if (running) {
            return;
        }
        running = true;
        requestAnimationFrame(() => {
            resetCanvasProperties(sidebar.isVisible());
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
    const translated = canvas.transform.getTranslated();

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

            worker.post({
                action: "add",
                image: {
                    name: imageToCrop.name.setByUser,
                    type: imageToCrop.type.slice(6),
                    uri: croppedCanvas.toDataURL(imageToCrop.type, quality.get())
                }
            });
            images.incStoredImageCount();
            resolve();
        };
        image.src = imageToCrop.uri;
    });
}

function updateImageCount(count, multiple) {
    const remaining = count - 1;
    let value = "";

    if (remaining > 1 || multiple) {
        value = `${remaining} images remaining`;
    }
    else if (remaining === 1) {
        value = `${remaining} image remaining`;
    }
    document.getElementById("js-crop-remaining").textContent = value;
}

function displayImageName(name) {
    document.getElementById("js-crop-image-name").textContent = name;
}

function updateTransformedArea(area, canvasReset) {
    const getTransformedPoint = canvas.transform.getTransformedPoint;
    const { x, y } = getTransformedPoint(area.x, area.y);
    const pt = getTransformedPoint(area.x + area.width, area.y + area.height);
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

function init() {
    const image = images.getFirst();

    canvas.resetDimensions(sidebar.isVisible());
    setupInitialImage(image);
    canvas.addEventListener("wheel", handleScroll);
    canvas.addEventListener("mousedown", onSelectionStart);
    canvas.addEventListener("mousemove", trackMousePosition);
    canvas.addEventListener("mouseleave", hideMousePosition);
    redrawOnResize.enable();
    worker.init();
    cropper.show();
}

function draw() {
    const image = canvas.image.get(quality.useImageWithQuality());
    const currentAngle = angle.get();
    const area = selectedArea.get();
    const areaDrawn = selectedArea.isDrawn();

    canvas.drawCanvas(image, area, currentAngle, areaDrawn);
    if (sidebar.isVisible()) {
        const scaledArea = selectedArea.get(true);

        sidebar.preview.draw(image, scaledArea);
    }
}

function setupInitialImage(image, multiple) {
    const imageCount = images.getCount();

    updateImageCount(imageCount, multiple);
    displayImageName(image.name.original);
    sidebar.toggleButton(true, "crop", "preview");
    sidebar.toggleButton(imageCount <= 1, "skip");
    canvas.drawInitialImage(image.uri, scaleImageToFitCanvas)
    .then(() => {
        const translated = canvas.transform.getTranslated();

        selectedArea.setDefaultPos(translated.x, translated.y);
    });
}

function onSelectionStart(event) {
    if (event.which !== 1) {
        return;
    }

    const { x, y } = canvas.getMousePosition(event);
    const area = selectedArea.get();
    const hasArea = area.width && area.height;
    const currentAngle = angle.get();
    const newDirection = direction.set(x, y, area);
    let eventToEnable = "select";

    if (event.shiftKey) {
        mousePosition.set(canvas.transform.getTransformedPoint(x, y));
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

        const area = selectedArea.get(true);
        const pt = canvas.transform.getTransformedPoint(x, y);

        dataInput.updatePoint(area, pt.x, pt.y);
    }
    events.toggleEvent(eventToEnable);
    requestAnimationFrame(draw);
}

function resetAreaAndAngle(canvasReset) {
    const area = selectedArea.reset();

    angle.reset();
    dataInput.setValue("angle", 0);
    sidebar.preview.clean();
    updateTransformedArea(area, canvasReset);
}

function resetCropper() {
    cropper.hide();
    updateImageCount(0);
    resetData();
    events.toggleCursorEvents();
    canvas.removeEventListener("wheel", handleScroll);
    canvas.removeEventListener("mousedown", onSelectionStart);
    canvas.removeEventListener("mousemove", trackMousePosition);
    canvas.removeEventListener("mouseleave", hideMousePosition);
    redrawOnResize.disable();
    dropbox.generateZip();
}

function resetData() {
    quality.reset();
    dataInput.setValue("scale", 100);
    dataInput.setValue("quality", 0.92);
    dataInput.setValue("quality-display", 0.92);
    resetAreaAndAngle(true);
}

function scaleImage(x, y, scale) {
    const area = selectedArea.get();
    const transform = canvas.transform;

    transform.translate(x, y);
    transform.scale(scale / 100);
    transform.translate(-x, -y);

    if (area.width && area.height) {
        updateTransformedArea(area);
    }
    else {
        const { e: translatedX, f: translatedY } = transform.getTransform();

        selectedArea.setProp("x", translatedX);
        selectedArea.setProp("y", translatedY);
    }
    requestAnimationFrame(draw);
}

function handleScroll(event) {
    const { x, y } = canvas.getMousePosition(event);
    const pt = canvas.transform.getTransformedPoint(x, y);
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
    const { x, y } = canvas.getMousePosition(event);
    const pt = canvas.transform.getTransformedPoint(x, y);
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
    canvas.hide();
    setTimeout(() => {
        setupInitialImage(image, true);
    }, 240);
}

function cropImage() {
    const image = images.remove(0);

    sendImageToWorker(image)
    .then(() => {
        if (!images.getCount()) {
            resetCropper();
        }
        else {
            loadNextImage(images.getFirst());
        }
    });
}

function showPreview() {
    const area = selectedArea.get(true);
    const image = canvas.image.get(quality.useImageWithQuality());
    const croppedCanvas = getCroppedCanvas(image, area);
    const uri = croppedCanvas.toDataURL("image/jpeg");

    preview.show(uri);
}

function skipImage() {
    images.remove(0);

    const nextImage = images.getFirst();

    if (nextImage) {
        loadNextImage(nextImage);
    }
}

function resetCanvasProperties(sidebarVisible) {
    const transform = canvas.transform.getTransform();

    canvas.resetDimensions(sidebarVisible);
    canvas.transform.setTransform(
        transform.a, transform.b,
        transform.c, transform.d,
        transform.e, transform.f
    );
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

function scaleImageToFitCanvas(image) {
    const { width: canvasWidth, height: canvasHeight } = canvas.getDimensions();
    const { width, height } = image;
    let scale = 100;

    if (width > height) {
        scale = getScale(width, height, canvasWidth, canvasHeight);
    }
    else {
        scale = getScale(height, width, canvasHeight, canvasWidth);
    }
    canvas.setDefaultImagePosition(width * scale / 100, height * scale / 100, canvasWidth, canvasHeight);
    canvas.transform.resetTransform();
    scaleImage(0, 0, scale);
    dataInput.setValue("scale", Math.round(scale));
    canvas.drawImage(image);
}

function resetCanvas() {
    const translated = canvas.transform.getTranslated();

    resetData();
    selectedArea.setDefaultPos(translated.x, translated.y);
    selectedArea.containsArea(false);
    scaleImageToFitCanvas(canvas.image.get());
    sidebar.toggleButton(true, "crop", "preview");
}

function onTopBarBtnClick({ target }) {
    const btn = target.getAttribute("data-btn");

    switch (btn) {
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
        case "skip":
            skipImage();
            break;
        case "toggle":
            sidebar.toggle(target);
            break;
    }
}

document.getElementById("js-crop-top-btns").addEventListener("click", onTopBarBtnClick);
document.getElementById("js-crop-bottom-btns").addEventListener("click", onBottomBarBtnClick);
document.getElementById("js-crop-preview-close").addEventListener("click", preview.hide);

export {
    init,
    draw,
    mousePosition,
    updateTransformedArea,
    getCroppedCanvas,
    scaleImage,
    resetCanvasProperties
};
