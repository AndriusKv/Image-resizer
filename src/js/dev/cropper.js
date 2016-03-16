import * as dropbox from "./dropbox.js";
import * as cropperCanvas from "./cropper.canvas.js";
import * as sidebar from "./cropper.sidebar.js";

const closeButton = document.getElementById("js-crop-close");

const cropping = (function() {
    const cropping = document.getElementById("js-crop");

    function showCropping() {
        cropping.classList.add("show");
    }

    function hideCropping() {
        cropping.classList.remove("show");
    }

    function toggleEventListeners(action, mousemoveCallback, mouseupCallback) {
        cropping[action + "EventListener"]("mousemove", mousemoveCallback, false);
        cropping[action + "EventListener"]("mouseup", mouseupCallback, false);
    }

    return {
        show: showCropping,
        hide: hideCropping,
        toggleEventListeners
    };
})();

const preview = (function() {
    const cropPreview = document.getElementById("js-crop-preview");
    let previewState = false;

    function showPreview(preview) {
        cropPreview.appendChild(preview);
        cropPreview.classList.add("show");
    }

    function hidePreview() {
        cropPreview.classList.remove("show");

        // remove preview image after animation finished running.
        setTimeout(() => {
            cropPreview.removeChild(cropPreview.children[0]);
        }, 600);
    }

    function getState() {
        return previewState;
    }

    function setState(state) {
        previewState = state;
    }

    return {
        show: showPreview,
        hide: hidePreview,
        getState,
        setState
    };
})();

function updateRemainingImageIndicator(action) {
    const remainingImageElem = document.getElementById("js-crop-remaining");
    const imageCount = dropbox.images.getCount();
    const remaining = imageCount - 1;
    let value = "";

    if (action === "remove") {
        value = "";
    }
    else if (remaining === 1) {
        value = `${remaining} image remaining`;
    }
    else {
        value = `${remaining} images remaining`;
    }
    remainingImageElem.textContent = value;
}

function displayImageName(name) {
    document.getElementById("js-crop-image-name").textContent = name;
}

function init() {
    const images = dropbox.images;
    const imageCount = images.getCount();
    const image = images.getFirst();

    dropbox.worker.init();
    displayImageName(image.name.original);
    cropperCanvas.init(image);
    sidebar.toggleButtons(true);
    sidebar.toggleSkipButton(imageCount);
    cropping.show();

    if (imageCount > 1) {
        updateRemainingImageIndicator();
    }
}

function closeCropping() {
    if (preview.getState()) {
        preview.setState(false);
        preview.hide();
        return;
    }
    cropperCanvas.resetCropper();
    dropbox.worker.post({ action: "generate" });
}

closeButton.addEventListener("click", closeCropping, false);

export {
    init,
    preview,
    cropping,
    displayImageName,
    updateRemainingImageIndicator
};
