"use strict";

import { changeCanvasQuality } from "./cropper.js";

const qualitySlider = document.getElementById("js-crop-quality");

let defaultQuality = 0.92,
    customQuality = false,
    quality = defaultQuality;

function updateQualityDisplay(quality) {
    document.getElementById("js-quality-value").textContent = quality;
}

function setImageQuality(newQuality) {
    customQuality = newQuality !== defaultQuality;
    quality = newQuality;
    updateQualityDisplay(newQuality);
}

function resetImageQuality() {
    customQuality = false;
    qualitySlider.value = 0.92;
    updateQualityDisplay(defaultQuality);
}

function getImageQuality() {
    return customQuality ? quality : defaultQuality;
}

function useImageWithQuality() {
    return customQuality;
}

function adjustQuality(event) {
    const quality = Number.parseFloat(event.target.value);

    setImageQuality(quality);
    changeCanvasQuality(quality);
}

qualitySlider.addEventListener("input", adjustQuality, false);

export {
    useImageWithQuality,
    resetImageQuality as reset,
    getImageQuality as get
};
