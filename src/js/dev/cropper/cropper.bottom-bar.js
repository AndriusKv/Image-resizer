import * as cropper from "./cropper.js";
import * as canvas from "./cropper.canvas.js";
import * as preview from "./cropper.preview.js";
import * as images from "./cropper.images.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as quality from "./cropper.quality.js";
import { toggleRightBar, displayCroppedImages} from "./cropper.right-bar.js";
import { addCroppedImage } from "./cropper.cropped-images.js";

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

function getCroppedImage(imageToCrop) {
    return new Promise(resolve => {
        const image = new Image();

        image.onload = function() {
            const transformedArea = selectedArea.getTransformed();
            const croppedCanvas = cropper.getCroppedCanvas(image, transformedArea);

            resolve({
                name: imageToCrop.name.setByUser,
                type: imageToCrop.type.slice(6),
                uri: croppedCanvas.toDataURL(imageToCrop.type, quality.get())
            });
        };
        image.src = imageToCrop.uri;
    });
}

function cropImage() {
    getCroppedImage(images.getActive())
    .then(addCroppedImage)
    .then(displayCroppedImages);
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
            toggleRightBar(target);
            break;
    }
});

export {
    setMousePosition,
    hideMousePosition,
    toggleButton,
    disableButton
};
