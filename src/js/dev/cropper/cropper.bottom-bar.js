import * as worker from "./../editor.worker.js";
import * as cropper from "./cropper.js";
import * as canvas from "./cropper.canvas.js";
import * as rightBar from "./cropper.right-bar.js";
import * as preview from "./cropper.preview.js";
import * as images from "./cropper.images.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as quality from "./cropper.quality.js";

function init() {
    worker.init();
}

function setMousePosition(position) {
    document.getElementById("js-crop-mouse-pos").textContent = position;
}

function hideMousePosition() {
    setMousePosition("");
}

function toggleButton(disabled, ...buttons) {
    buttons.forEach(button => {
        document.getElementById(`js-cropper-${button}`).disabled = disabled;
    });
}

function disableButton(...buttons) {
    toggleButton(true, ...buttons);
}

function sendImageToWorker(imageToCrop) {
    return new Promise(resolve => {
        const image = new Image();

        image.onload = function() {
            const transformedArea = selectedArea.getTransformed();
            const croppedCanvas = cropper.getCroppedCanvas(image, transformedArea);

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

function cropImage() {
    const messageElem = document.getElementById("js-crop-message");

    messageElem.classList.add("visible");
    sendImageToWorker(images.getActive())
    .then(() => {
        setTimeout(() => {
            messageElem.classList.remove("visible");
        }, 200);
    });
}

function showPreview() {
    const transformedArea = selectedArea.getTransformed();
    const image = canvas.image.get(quality.useImageWithQuality());
    const croppedCanvas = cropper.getCroppedCanvas(image, transformedArea);
    const uri = croppedCanvas.toDataURL("image/jpeg");

    preview.show(uri);
}

document.getElementById("js-crop-bottom-btns").addEventListener("click", ({target}) => {
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
});

export {
    init,
    setMousePosition,
    hideMousePosition,
    toggleButton,
    disableButton
};
