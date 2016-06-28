import * as dropbox from "./../dropbox/dropbox.js";
import * as cropper from "./cropper.js";
import * as leftBar from "./cropper.left-bar.js";
import * as bottomBar from "./cropper.bottom-bar.js";
import * as transform from "./cropper.canvas-transform.js";
import * as canvas from "./cropper.canvas.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as events from "./cropper.canvas-events.js";
import * as resize from "./cropper.resize.js";

function displayImageName(name) {
    document.getElementById("js-crop-image-name").textContent = name;
}

function resetCanvas() {
    const translated = transform.getTranslated();

    cropper.resetData();
    selectedArea.setDefaultPos(translated.x, translated.y);
    selectedArea.containsArea(false);
    cropper.scaleImageToFitCanvas(canvas.image.get());
    bottomBar.disableButton("crop", "preview");
}

function resetCropper() {
    cropper.cropperElement.hide();
    cropper.resetData();
    selectedArea.containsArea(false);
    events.toggleCursorEvents();
    cropper.toggleCanvasElementEventListeners("remove");
    resize.disable();
    dropbox.generateZip();
}

document.getElementById("js-crop-top-bar").addEventListener("click", ({target}) => {
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
});

export {
    displayImageName
};
