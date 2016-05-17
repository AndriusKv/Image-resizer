import * as cropper from "./cropper.js";
import * as canvas from "./cropper.canvas.js";
import * as dataInput from "./cropper.data-input.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as angle from "./cropper.angle.js";
import * as quality from "./cropper.quality.js";

const cropData = document.getElementById("js-crop-data");
let sidebarVisible = true;

const preview = (function(cropper) {
    const preview = document.getElementById("js-sidebar-preview");
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

function toggleButton(disabled, ...buttons) {
    buttons.forEach(button => {
        document.getElementById(`js-cropper-${button}`).disabled = disabled;
    });
}

function isVisible() {
    return sidebarVisible;
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
        const { width, height } = canvas.getDimensions();

        cropper.scaleImage(width / 2, height / 2, inputValue);
        return;
    }

    if (input === "angle") {
        angle.set(inputValue, "rad");
    }
    else {
        const transform = canvas.transform.getTransform();

        selectedArea.update(input, inputValue, transform);
    }

    const area = selectedArea.get();
    const hasArea = area.width && area.height;

    toggleButton(!hasArea, "crop", "preview");
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
    dataInput.setValue("quality-display", newQuality);
    quality.set(newQuality);
}

function toggleSidebar(btn) {
    const { classList } = document.getElementById("js-crop-sidebar");

    sidebarVisible = !sidebarVisible;
    cropper.resetCanvasProperties(sidebarVisible);
    requestAnimationFrame(cropper.draw);
    if (classList.contains("hide")) {
        btn.setAttribute("title", "Hide sidebar");
        btn.style.transform = "rotateZ(0)";
    }
    else {
        btn.setAttribute("title", "Show sidebar");
        btn.style.transform = "rotateZ(180deg)";
    }
    classList.toggle("hide");
}

cropData.addEventListener("keypress", updateCanvasWithCropData);
cropData.addEventListener("keyup", updateSelectedAreaWithCropData);
document.getElementById("js-crop-quality").addEventListener("input", adjustQuality);

export {
    toggleSidebar as toggle,
    isVisible,
    preview,
    toggleButton
};
