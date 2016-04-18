import * as dropbox from "./../dropbox.js";
import * as canvas from "./cropper.canvas.js";
import * as sidebar from "./cropper.sidebar.js";
import * as events from "./cropper.canvas-events.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as direction from "./cropper.direction.js";
import * as ratio from "./cropper.ratio.js";
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

    translated.x = translated.x * ratio.get("width");
    translated.y = translated.y * ratio.get("height");

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
            const scaledArea = selectedArea.getScaled(ratio.get());
            const croppedCanvas = getCroppedCanvas(image, scaledArea);

            dropbox.worker.post({
                action: "add",
                image: {
                    name: imageToCrop.name.setByUser,
                    type: imageToCrop.type.slice(6),
                    uri: croppedCanvas.toDataURL(imageToCrop.type, quality.get())
                }
            });
            dropbox.images.incStoredImageCount();
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

function getImageSize({ width, height }, maxWidth, maxHeight) {
    const ratio = width / height;

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

    sidebar.updateDataDisplay(transformedArea);
}

function init() {
    const image = dropbox.images.getFirst();

    setupInitialImage(image);
    canvas.addEventListener("wheel", handleScroll);
    canvas.addEventListener("mousedown", onSelectionStart);
    canvas.addEventListener("mousemove", trackMousePosition);
    canvas.addEventListener("mouseleave", hideMousePosition);
    dropbox.worker.init();
    cropper.show();
}

function draw() {
    const image = canvas.getImage(quality.useImageWithQuality());
    const currentAngle = angle.get();
    const area = selectedArea.get();
    const scaledArea = selectedArea.getScaled(ratio.get());
    const areaDrawn = selectedArea.getHasArea();

    canvas.drawCanvas(image, area, currentAngle, areaDrawn);
    sidebar.preview.draw(image.src, scaledArea);
}

function setupInitialImage(image, multiple) {
    const imageCount = dropbox.images.getCount();

    updateImageCount(imageCount, multiple);
    displayImageName(image.name.original);
    sidebar.toggleButtons(true);
    sidebar.toggleSkipButton(imageCount);
    canvas.drawInitialImage(image.uri, getImageSize)
    .then(data => {
        selectedArea.setDefaultPos(data.translated.x, data.translated.y);
        ratio.set(data.widthRatio, data.heightRatio);
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

        sidebar.updatePointDisplay(area, pt.x, pt.y);
    }
    events.toggleEvent(eventToEnable);
    requestAnimationFrame(draw);
}

function resetAreaAndAngle(canvasReset) {
    const area = selectedArea.reset();

    angle.reset();
    sidebar.cropDataInputs.setValue("angle", 0);
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
    dropbox.generateZip();
}

function resetData() {
    quality.reset();
    sidebar.resetQualityAndScaleDisplay();
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
    let scale = sidebar.cropDataInputs.getValue("scale");

    if (event.deltaY > 0) {
        scale *= 0.8;
    }
    else {
        scale /= 0.8;
    }
    scaleImage(pt.x, pt.y, scale);
    sidebar.cropDataInputs.setValue("scale", Math.round(scale));
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
    selectedArea.setHasArea(false);
    canvas.hideCanvas();
    setTimeout(() => {
        setupInitialImage(image, true);
    }, 240);
}

function cropImage() {
    const images = dropbox.images;
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
    const area = selectedArea.getScaled(ratio.get());
    const { src: image } = canvas.getImage(quality.useImageWithQuality());
    const croppedCanvas = getCroppedCanvas(image, area);
    const uri = croppedCanvas.toDataURL("image/jpeg");

    preview.show(uri);
}

function skipImage() {
    const images = dropbox.images;

    images.remove(0);

    const nextImage = images.getFirst();

    if (nextImage) {
        loadNextImage(nextImage);
    }
}

function toggleSidebar(btn) {
    const { classList } = document.getElementById("js-crop-sidebar");
    const transform = canvas.transform.getTransform();

    if (classList.contains("hide")) {
        btn.setAttribute("title", "hide sidebar");
        btn.style.transform = "rotateZ(0)";
        canvas.setCanvasDimensions(window.innerWidth - 200);
    }
    else {
        btn.setAttribute("title", "show sidebar");
        btn.style.transform = "rotateZ(180deg)";
        canvas.setCanvasDimensions(window.innerWidth);
    }
    canvas.transform.setTransform(
        transform.a, transform.b,
        transform.c, transform.d,
        transform.e, transform.f
    );
    classList.toggle("hide");
    requestAnimationFrame(draw);
}

function resetCanvas() {
    const translated = canvas.transform.getTranslated();

    resetData();
    selectedArea.setDefaultPos(translated.x, translated.y);
    selectedArea.setHasArea(false);
    canvas.transform.resetTransform();
    canvas.drawImage(canvas.getImage());
    sidebar.toggleButtons(true);
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
            toggleSidebar(target);
            break;
    }
}

document.getElementById("js-crop-top-btns").addEventListener("click", onTopBarBtnClick);
document.getElementById("js-crop-bottom-btns").addEventListener("click", onBottomBarBtnClick);
document.getElementById("js-crop-preview-close").addEventListener("click", preview.hide);

export {
    init,
    draw,
    preview,
    mousePosition,
    getImageSize,
    updateTransformedArea,
    getCroppedCanvas,
    scaleImage,
    resetData,
    cropImage,
    showPreview,
    skipImage
};
