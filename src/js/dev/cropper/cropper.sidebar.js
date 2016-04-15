import * as cropper from "./cropper.js";
import * as canvas from "./cropper.canvas.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as ratio from "./cropper.ratio.js";
import * as angle from "./cropper.angle.js";
import * as quality from "./cropper.quality.js";

const cropData = document.getElementById("js-crop-data");

const cropDataInputs = (function() {
    function getDataInput(name) {
        return document.getElementById(`js-crop-${name}`);
    }

    function getInputValue(name) {
        const input = getDataInput(name);

        return input.value;
    }

    function setInputValue(name, value) {
        const input = getDataInput(name);

        input.value = value;
    }

    return {
        getValue: getInputValue,
        setValue: setInputValue
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
            const { width, height } = cropper.getImageSize(croppedCanvas, maxWidth, maxHeight);
            const x = (maxWidth - width) / 2;
            const y = (maxHeight - height) / 2;

            clean();
            ctx.drawImage(croppedCanvas, x, y, width, height);
            updating = false;
        });
    }

    return { clean, draw };
})();

function setQualityDisplayValue(value = 0.92) {
    document.getElementById("js-quality-value").textContent = value;
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

    toggleButton(skipButton, imageCount <= 1);
}

function getCoordToUpdate(coordValue, dimensionValue) {
    if (coordValue) {
        if (dimensionValue > 0) {
            return coordValue;
        }
        return dimensionValue + coordValue;
    }
    return 0;
}

function updatePointDisplay(area, x = area.x, y = area.y) {
    const { width: widthRatio, height: heightRatio } = ratio.get();

    if (area.width && area.height) {
        x = getCoordToUpdate(x, area.width);
        y = getCoordToUpdate(y, area.height);
    }

    cropDataInputs.setValue("x", Math.floor(x * widthRatio));
    cropDataInputs.setValue("y", Math.floor(y * heightRatio));
}

function updateMeasurmentDisplay(width, height) {
    const { width: widthRatio, height: heightRatio } = ratio.get();

    width = Math.floor(width * widthRatio);
    height = Math.floor(height * heightRatio);

    cropDataInputs.setValue("width", width < 0 ? -width : width);
    cropDataInputs.setValue("height", height < 0 ? -height : height);
}

function updateDataDisplay(area) {
    updatePointDisplay(area);
    updateMeasurmentDisplay(area.width, area.height);
}

function resetQualityAndScaleDisplay() {
    cropDataInputs.setValue("scale", 100);
    cropDataInputs.setValue("quality", 0.92);
    setQualityDisplayValue();
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

function updateCanvasOnInput(input, inputValue) {
    if (input === "scale") {
        const { width, height } = canvas.getCanvasDimensions();

        cropper.scaleImage(width / 2, height / 2, inputValue);
        return;
    }

    if (input === "angle") {
        angle.set(inputValue, "rad");
    }
    else {
        const transform = canvas.transform.getTransform();
        const inputRatio = ratio.get(input);

        selectedArea.update(input, inputValue, inputRatio, transform);
    }

    const area = selectedArea.get();
    const hasArea = area.width && area.height;

    toggleButtons(!hasArea);
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

function adjustQuality(event) {
    const newQuality = Number.parseFloat(event.target.value);
    const changeCanvasQuality = canvas.getModifyQualityCb();

    changeCanvasQuality(newQuality, cropper.draw);
    setQualityDisplayValue(newQuality);
    quality.set(newQuality);
}

cropData.addEventListener("keypress", updateCanvasWithCropData);
cropData.addEventListener("keyup", updateSelectedAreaWithCropData);
document.getElementById("js-crop-quality").addEventListener("input", adjustQuality);

export {
    preview,
    cropDataInputs,
    toggleButtons,
    toggleSkipButton,
    updatePointDisplay,
    updateMeasurmentDisplay,
    updateDataDisplay,
    resetQualityAndScaleDisplay
};
