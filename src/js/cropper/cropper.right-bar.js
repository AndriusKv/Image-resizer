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
import { getAllCroppedImages, removeCroppedImage, getCroppedImage } from "./cropper.cropped-images.js";
import { showPreview } from "./cropper.preview.js";

let rightBarVisible = true;
let isFirstCrop = true;

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

    bottomBar.toggleButton(!hasArea, "crop");
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
        updateCanvasOnInput(input, parseInt(target.value, 10));
    }
    else if (!backspace) {
        event.preventDefault();
        return;
    }
}

function adjustQuality(event) {
    const newQuality = parseFloat(event.target.value);

    canvas.spareCanvas.adjustQuality(newQuality, cropper.draw);
    dataInput.setValue("quality-display", newQuality);
    quality.set(newQuality);
}

function toggleRightBar(btn) {
    const { classList } = document.getElementById("js-crop-right-bar");

    rightBarVisible = !rightBarVisible;
    btn.classList.toggle("icon-angle-double-left");
    btn.classList.toggle("icon-angle-double-right");
    classList.toggle("hidden");
}

function toggleSection({ target }) {
    const button = target.getAttribute("data-section-btn");

    if (button) {
        const sectionElement = target.parentElement;
        const sectionElementBody = sectionElement.children[1];

        if (sectionElementBody.children.length) {
            sectionElementBody.classList.toggle("hidden");
        }
    }
}

function displayCroppedImages() {
    const containerElement = document.getElementById("js-cropped-image-items");
    const images = getAllCroppedImages();

    containerElement.innerHTML = images.map((image, index) => {
        return `
            <li class="cropped-image-item">
                <div class="cropped-image-item-btns">
                    <button class="icon-search btn-transparent" data-preview="${index}"></button>
                    <button class="icon-cancel btn-transparent" data-remove="${index}"></button>
                </div>
                <image src=${image.uri} class="cropped-image">
            </li>
        `;
    }).join("");

    if (isFirstCrop) {
        containerElement.classList.remove("hidden");
        isFirstCrop = false;
    }
    if (!images.length) {
        isFirstCrop = true;
        document.getElementById("js-cropped-image-items").classList.add("hidden");
    }
}

document.getElementById("js-crop-right-bar").addEventListener("click", toggleSection);
document.getElementById("js-crop-data").addEventListener("keypress", updateCanvasWithCropData);
document.getElementById("js-crop-quality").addEventListener("input", adjustQuality);
document.getElementById("js-cropped-image-items").addEventListener("click", ({ target }) => {
    const previewIndex = target.getAttribute("data-preview");
    const removeIndex = target.getAttribute("data-remove");

    if (previewIndex) {
        const { uri } = getCroppedImage(previewIndex);

        showPreview(uri);
    }
    else if (removeIndex) {
        removeCroppedImage(removeIndex);
        displayCroppedImages();
    }
});

export {
    isVisible,
    toggleRightBar,
    displayCroppedImages
};
