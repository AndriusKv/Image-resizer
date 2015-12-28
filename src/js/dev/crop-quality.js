"use strict";

import { changeCanvasQuality } from "./crop.js";

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

function resetQualitySlider() {
    customQuality = false;
    qualitySlider.value = 92;
    updateQualityDisplay(defaultQuality);
}

function getImageQuality() {
    return customQuality ? quality : defaultQuality;
}

function useImageWithQuality() {
    return customQuality;
}

function adjustQuality(event) {
    const newQuality = event.target.value / 100;

    setImageQuality(newQuality);
    changeCanvasQuality(newQuality);
}

qualitySlider.addEventListener("input", adjustQuality, false);

export {
    useImageWithQuality,
    resetQualitySlider,
    getImageQuality
};
