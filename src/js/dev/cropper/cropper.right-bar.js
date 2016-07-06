import * as cropper from "./cropper.js";
import * as bottomBar from "./cropper.bottom-bar.js";
import * as transform from "./cropper.canvas-transform.js";
import * as canvasElement from "./cropper.canvas-element.js";
import * as canvas from "./cropper.canvas.js";
import * as dataInput from "./cropper.data-input.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as angle from "./cropper.angle.js";
import * as quality from "./cropper.quality.js";
import * as scale from "./cropper.scale.js";

const cropData = document.getElementById("js-crop-data");
let rightBarVisible = true;

const preview = (function(transform) {
    const preview = document.getElementById("js-right-bar-preview");
    const previewCtx = preview.getContext("2d");
    const maxWidth = 192;
    const maxHeight = 150;

    preview.width = maxWidth;
    preview.height = maxHeight;

    function getImageSize(width, height, maxWidth, maxHeight) {
        const ratio = width / height;

        if (width >= height) {
            width = maxWidth;
            height = width / ratio;
        }
        if (width < height || height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
        }
        return { width, height };
    }

    function clean() {
        previewCtx.clearRect(0, 0, maxWidth, maxHeight);
    }

    function getCroppedCanvasCtx(image) {
        const croppedCanvas = document.createElement("canvas");
        const { x, y } = transform.getTranslated();

        croppedCanvas.width = image.width + x * 2;
        croppedCanvas.height = image.height + y * 2;
        return croppedCanvas.getContext("2d");
    }

    function getImageData(image, area, angle) {
        const xform = transform.get();
        const ctx = getCroppedCanvasCtx(image);

        ctx.save();
        if (angle) {
            const centerX = area.x + area.width / 2;
            const centerY = area.y + area.height / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate(-angle);
            ctx.translate(-centerX, -centerY);
        }
        ctx.translate(xform.e, xform.f);
        ctx.scale(xform.a, xform.a);
        ctx.drawImage(image, 0, 0, image.width, image.height);
        ctx.restore();
        return ctx.getImageData(area.x, area.y, area.width, area.height);
    }

    function drawPreview(imageData) {
        const croppedCanvas = document.createElement("canvas");
        const croppedCanvasCtx = croppedCanvas.getContext("2d");
        const { width, height } = getImageSize(imageData.width, imageData.height, maxWidth, maxHeight);
        const x = (maxWidth - width) / 2;
        const y = (maxHeight - height) / 2;

        croppedCanvas.width = imageData.width;
        croppedCanvas.height = imageData.height;
        croppedCanvasCtx.putImageData(imageData, 0, 0);
        previewCtx.drawImage(croppedCanvas, x, y, width, height);
    }

    function draw(image, area, angle) {
        const imageData = getImageData(image, area, angle);

        clean();
        drawPreview(imageData);
    }

    return { clean, draw };
})(transform);

function isVisible() {
    return rightBarVisible;
}

function updateCanvasOnInput(input, inputValue) {
    if (input === "scale") {
        const { width, height } = canvasElement.getDimensions();

        inputValue = inputValue ? scale.adjustScale(inputValue) : 100;
        scale.scaleImage(width / 2, height / 2, inputValue);
        return;
    }

    if (input === "angle") {
        angle.setInDegrees(inputValue);
    }
    else {
        selectedArea.update(input, inputValue, transform.get());
    }

    const area = selectedArea.get();
    const hasArea = area.width && area.height;

    bottomBar.toggleButton(!hasArea, "crop", "preview");
    if (hasArea) {
        requestAnimationFrame(cropper.draw);
    }
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
    }
    else if (enter) {
        updateCanvasOnInput(input, Number.parseInt(target.value, 10));
    }
    else if (!backspace) {
        event.preventDefault();
        return;
    }
}

function adjustQuality(event) {
    const newQuality = Number.parseFloat(event.target.value);

    canvas.spareCanvas.adjustQuality(newQuality, cropper.draw);
    dataInput.setValue("quality-display", newQuality);
    quality.set(newQuality);
}

function toggleRightBar(btn) {
    const { classList } = document.getElementById("js-crop-right-bar");

    rightBarVisible = !rightBarVisible;
    btn.classList.toggle("icon-angle-double-left");
    btn.classList.toggle("icon-angle-double-right");
    classList.toggle("hide");
}

cropData.addEventListener("keypress", updateCanvasWithCropData);
document.getElementById("js-crop-quality").addEventListener("input", adjustQuality);

export {
    toggleRightBar as toggle,
    isVisible,
    preview
};
