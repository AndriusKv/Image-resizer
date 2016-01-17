"use strict";

import { showMessage } from "./dropbox.js";

const dimensionInputContainer = document.getElementById("js-dimension-inputs");
const imageName = document.getElementById("js-image-name");
const imageNameSeperator = document.getElementById("js-image-name-seperator");
const qualitySlider = document.getElementById("js-image-quality");

(function loadFromLocalStorage() {
    let settings = localStorage.getItem("settings");

    if (!settings) {
        return;
    }
    settings = JSON.parse(settings);

    const inputValues = flattenInputValues(settings.dimensionInputValues);

    appendInputs(dimensionInputContainer, inputValues.length);
    assignValuesToInputs(dimensionInputContainer.children, inputValues);

    imageName.value = settings.imageName;
    imageNameSeperator.value = settings.imageNameSeperator;
    qualitySlider.value = settings.imageQuality;
})();

function saveToLocalStorage(inputValues) {
    const settings = {
        dimensionInputValues: inputValues,
        imageName: imageName.value || "",
        imageNameSeperator: imageNameSeperator.value || "",
        imageQuality: qualitySlider.value
    };

    localStorage.setItem("settings", JSON.stringify(settings));
}

function flattenInputValues(values) {
    return values.reduce((arr, value) => {
        arr.push(value.width, value.height);
        return arr;
    }, []);
}

function verifyValues(width, height) {
    const regex = /^\d+(px|%)?$|^same$|^original$|^width$|^height$/;
    const isWidthValid = regex.test(width) && !(width === "same" && (!height || height === "same"));
    const isHeightValid = regex.test(height) && !(height === "same" && (!width || width === "same"));

    return isWidthValid || isHeightValid;
}

function assignValuesToInputs(inputs, values) {
    Array.prototype.forEach.call(inputs, (input, index) => {
        input.value = values[index];
    });
}

function createInput() {
    const input = document.createElement("input");

    input.setAttribute("type", "text");
    input.classList.add("image-input");

    return input;
}

function createInputs(num) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < num; i++) {
        fragment.appendChild(createInput());
    }
    return fragment;
}

function appendInputs(element, num) {
    const totalChildren = element.children.length;

    if (totalChildren < num) {
        const toAppend = num - totalChildren;

        element.appendChild(createInputs(toAppend));
    }
}

function updateImageQuality(event) {
    showMessage(`Image quality set to: ${event.target.value}%`);
}

function onDimensionInputFocus(event) {
    const children = [...dimensionInputContainer.children];
    const targetInputIndex = children.indexOf(event.target);
    const isWidthInput = targetInputIndex % 2 === 0 && !children[targetInputIndex + 2];
    const isHeightInput = targetInputIndex % 2 !== 0 && !children[targetInputIndex + 1];

    if (isWidthInput || isHeightInput) {
        dimensionInputContainer.appendChild(createInputs(2));
    }
}

qualitySlider.addEventListener("input", updateImageQuality, false);
dimensionInputContainer.addEventListener("focus", onDimensionInputFocus, true);

export { dimensionInputContainer, saveToLocalStorage, verifyValues };
