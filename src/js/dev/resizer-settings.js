"use strict";

import { showMessage } from "./dropbox.js";

const dimensionInputContainer = document.getElementById("js-dimension-inputs"),
    imageName = document.getElementById("js-image-name"),
    imageNameSeperator = document.getElementById("js-image-name-seperator"),
    qualitySlider = document.getElementById("js-image-quality");

(function loadFromLocalStorage() {
    let selections = localStorage.getItem("selections");

    if (!selections) {
        return;
    }
    selections = JSON.parse(selections);

    appendInputs(dimensionInputContainer, selections.dimensionInputValues.length);
    assignValuesToInputs(dimensionInputContainer.children, selections.dimensionInputValues);

    imageName.value = selections.imageName;
    imageNameSeperator.value = selections.imageNameSeperator;
    qualitySlider.value = selections.imageQuality;
})();

function saveToLocalStorage() {
    const selections = {
        dimensionInputValues: getInputValues(dimensionInputContainer.children),
        imageName: imageName.value || "",
        imageNameSeperator: imageNameSeperator.value || "",
        imageQuality: qualitySlider.value
    };

    localStorage.setItem("selections", JSON.stringify(selections));
}

function verifyValues(width, height) {
    const regex = /^\d+(px|%)?$|^same$|^original$|^width$|^height$/,
        isWidthValid = regex.test(width) && !(width === "same" && (!height || height === "same")),
        isHeightValid = regex.test(height) && !(height === "same" && (!width || width === "same"));

    return isWidthValid || isHeightValid;
}

function assignValuesToInputs(inputs, values) {
    Array.prototype.forEach.call(inputs, (input, index) => {
        input.value = values[index];
    });
}

function getInputValues(inputs) {
    return Array.prototype.map.call(inputs, input => input.value)
        .filter(value => value);
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
    const children = [...dimensionInputContainer.children],
        targetInputIndex = children.indexOf(event.target),
        isWidthInput = targetInputIndex % 2 === 0 && !children[targetInputIndex + 2],
        isHeightInput = targetInputIndex % 2 !== 0 && !children[targetInputIndex + 1];

    if (isWidthInput || isHeightInput) {
        dimensionInputContainer.appendChild(createInputs(2));
    }
}

qualitySlider.addEventListener("input", updateImageQuality, false);
dimensionInputContainer.addEventListener("focus", onDimensionInputFocus, true);

export { dimensionInputContainer, saveToLocalStorage, verifyValues };
