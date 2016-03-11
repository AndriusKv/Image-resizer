import * as dropbox from "./dropbox.js";
import * as cropper from "./cropper.js";
import * as cropperCanvas from "./cropper.canvas.js";
import * as quality from "./cropper.quality.js";

const cropData = document.getElementById("js-crop-data");

const cropDataInputs = (function() {
    function getInputValue(name) {
        return document.getElementById("js-crop-" + name).value;
    }

    function setInputValue(name, value) {
        document.getElementById("js-crop-" + name).value = value;
    }

    return {
        getValue: getInputValue,
        setValue: setInputValue
    };
})();

const angle = (function() {
    let theta = 0;

    function setAngle(angle) {
        theta = angle;
    }

    function getAngle() {
        return theta;
    }

    function resetAngle() {
        theta = 0;
    }

    return {
        set: setAngle,
        get: getAngle,
        reset: resetAngle
    };
})();

const preview = (function() {
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
        const area = cropperCanvas.selectedArea.getScaled();

        if (updating || !area.width || !area.height) {
            return;
        }
        updating = true;
        requestAnimationFrame(() => {
            const croppedCanvas = getCroppedCanvas(image, area);
            const ratio = croppedCanvas.width / croppedCanvas.height;
            const { width, height } = cropperCanvas.getImageSize(croppedCanvas, maxWidth, maxHeight, ratio);

            clean();
            ctx.drawImage(croppedCanvas, (maxWidth - width) / 2, (maxHeight - height) / 2, width, height);
            updating = false;
        });
    }

    return { clean, draw };
})();

function sendImageToWorker(imageToCrop) {
    const image = new Image();

    image.addEventListener("load", () => {
        const area = cropperCanvas.selectedArea.getScaled();
        const croppedCanvas = getCroppedCanvas(image, area);

        dropbox.worker.post({
            action: "add",
            image: {
                name: imageToCrop.name.setByUser,
                type: imageToCrop.type.slice(6),
                uri: croppedCanvas.toDataURL(imageToCrop.type, quality.get())
            }
        });

        if (!dropbox.images.getCount()) {
            cropperCanvas.resetCropper();
            dropbox.generateZip();
        }
        else {
            quality.reset();
            cropperCanvas.resetData();
        }
    });
    image.src = imageToCrop.uri;
}

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

function getImageData(image, area, ctx, rotated) {
    const xform = cropperCanvas.canvasTransform.getTransform();
    const translatedX = xform.e * cropperCanvas.ratio.get("width");
    const translatedY = xform.f * cropperCanvas.ratio.get("height");
    const scale = xform.a;

    ctx.save();
    if (rotated) {
        const centerX = area.x + area.width / 2;
        const centerY = area.y + area.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(-rotated);
        ctx.translate(-centerX, -centerY);
    }
    ctx.translate(translatedX, translatedY);
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.restore();
    return ctx.getImageData(area.x, area.y, area.width, area.height);
}

function getCroppedCanvas(image, area) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const translated = cropperCanvas.canvasTransform.getTranslated();
    const translatedWidth = translated.width * cropperCanvas.ratio.get("width");
    const traslatedHeight = translated.height * cropperCanvas.ratio.get("height");

    canvas.width = image.width + translatedWidth * 2;
    canvas.height = image.height + traslatedHeight * 2;

    const imageData = getImageData(image, area, ctx, angle.get());

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function getCoordToUpdate(coordValue, dimensionValue) {
    if (coordValue && dimensionValue) {
        if (dimensionValue > 0) {
            return coordValue;
        }
        return dimensionValue + coordValue;
    }
    return 0;
}

function updatePointDisplay(x, y) {
    const area = cropperCanvas.selectedArea.get(true);

    x = getCoordToUpdate(x, area.width);
    y = getCoordToUpdate(y, area.height);

    cropDataInputs.setValue("x", Math.round(x * cropperCanvas.ratio.get("width")));
    cropDataInputs.setValue("y", Math.round(y * cropperCanvas.ratio.get("height")));
}

function updateMeasurmentDisplay(width, height) {
    width = Math.round(width * cropperCanvas.ratio.get("width"));
    height = Math.round(height * cropperCanvas.ratio.get("height"));

    cropDataInputs.setValue("width", width < 0 ? -width : width);
    cropDataInputs.setValue("height", height < 0 ? -height : height);
}

function updateDataDisplay(area) {
    updatePointDisplay(area.x, area.y);
    updateMeasurmentDisplay(area.width, area.height);
}

function resetCanvas() {
    const translated = cropperCanvas.canvasTransform.getTranslated();

    angle.reset();
    quality.reset();
    cropDataInputs.setValue("scale", 100);
    cropperCanvas.canvasTransform.resetTransform();
    cropperCanvas.canvasTransform.translate(translated.width, translated.height);
    cropperCanvas.resetData();
    cropperCanvas.addBackground();
    cropperCanvas.drawImage();
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

function convertDegreesToRadians(degrees) {
    if (degrees > 180) {
        degrees -= 360;
    }
    return degrees * Math.PI / 180;
}

function updateCanvasOnInput(input, inputValue) {
    if (input === "scale") {
        cropperCanvas.scaleImage(cropperCanvas.canvas.width / 2, cropperCanvas.canvas.height / 2, inputValue);
        requestAnimationFrame(cropperCanvas.drawCanvas);
        return;
    }

    if (input === "angle") {
        const radians = convertDegreesToRadians(inputValue);

        angle.set(radians);
    }
    else {
        cropperCanvas.selectedArea.update(input, inputValue);
    }

    const area = cropperCanvas.selectedArea.get();
    const hasArea = area.width && area.height;

    if (hasArea) {
        requestAnimationFrame(cropperCanvas.drawCanvas);
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

        updateCanvasOnInput(input, inputValue);
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

        updateCanvasOnInput(input, target.value);
    }
}

function loadNextImage(image) {
    const imageCount = dropbox.images.getCount();

    cropperCanvas.canvas.classList.remove("show");
    toggleSkipButton(imageCount);
    toggleButtons(true);

    if (imageCount) {
        cropper.updateRemainingImageIndicator();
        cropper.displayImageName(image.name.original);

        setTimeout(() => {
            cropperCanvas.drawInitialImage(image.uri);
        }, 200);
    }
}

function cropImage() {
    const images = dropbox.images;
    const image = images.remove(0);

    sendImageToWorker(image);
    loadNextImage(images.getFirst());
}

function showPreview() {
    const area = cropperCanvas.selectedArea.getScaled();
    const croppedCanvas = getCroppedCanvas(cropperCanvas.canvasImage.original, area);
    const image = new Image();

    cropper.preview.setState(true);
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

        cropper.preview.show(image);
    });
    image.src = croppedCanvas.toDataURL("image/jpeg", quality.get());
}

function skipImage() {
    const images = dropbox.images;

    images.remove(0);
    quality.reset();
    cropperCanvas.resetData();
    loadNextImage(images.getFirst());
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

document.getElementById("js-crop-reset").addEventListener("click", resetCanvas, false);
cropData.addEventListener("keypress", updateCanvasWithCropData, false);
cropData.addEventListener("keyup", updateSelectedAreaWithCropData, false);
document.getElementById("js-crop-data-btns").addEventListener("click", onSidebarBtnClick, false);

export {
    angle,
    preview,
    toggleButtons,
    toggleSkipButton,
    updatePointDisplay,
    updateMeasurmentDisplay,
    updateDataDisplay,
    cropDataInputs
};
