import * as cropper from "./cropper.js";
import * as bottomBar from "./cropper.bottom-bar.js";
import * as transform from "./cropper.canvas-transform.js";
import * as canvasElement from "./cropper.canvas-element.js";
import * as canvas from "./cropper.canvas.js";
import * as dataInput from "./cropper.data-input.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as angle from "./cropper.angle.js";
import * as quality from "./cropper.quality.js";

const cropData = document.getElementById("js-crop-data");
let rightBarVisible = true;

const preview = (function(cropper) {
    const preview = document.getElementById("js-right-bar-preview");
    const ctx = preview.getContext("2d");
    const maxWidth = 192;
    const maxHeight = 150;
    let updating = false;

    preview.width = maxWidth;
    preview.height = maxHeight;

    function getImageSize({width, height }, maxWidth, maxHeight) {
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
        ctx.clearRect(0, 0, maxWidth, maxHeight);
    }

    function draw(image, area) {
        if (updating) {
            return;
        }
        if (!area.width || !area.height) {
            clean();
            return;
        }
        updating = true;
        requestAnimationFrame(() => {
            const croppedCanvas = cropper.getCroppedCanvas(image, area);
            const { width, height } = getImageSize(croppedCanvas, maxWidth, maxHeight);
            const x = (maxWidth - width) / 2;
            const y = (maxHeight - height) / 2;

            clean();
            ctx.drawImage(croppedCanvas, x, y, width, height);
            updating = false;
        });
    }

    return { clean, draw };
})(cropper);

function isVisible() {
    return rightBarVisible;
}

function updateCanvasOnInput(input, inputValue) {
    if (input === "scale") {
        const { width, height } = canvasElement.getDimensions();

        inputValue = inputValue ? cropper.adjustScale(inputValue) : 100;
        cropper.scaleImage(width / 2, height / 2, inputValue);
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
