"use strict";

import { toggleElement } from "./main.js";

let widthInputCointaner = document.getElementById("js-width-input-container"),
    heightInputContainer = document.getElementById("js-height-input-container"),
    select = document.getElementById("js-select");

(function loadFromLocalStorage() {
    let selections = localStorage.getItem("Selections");

    if (!selections) {
        return;
    }
    
    selections = JSON.parse(selections);

    select.value = selections.numberOfInputs;

    appendInputs(widthInputCointaner, selections.numberOfInputs);
    appendInputs(heightInputContainer, selections.numberOfInputs);
    
    assignValuesToInputs(widthInputCointaner.children, selections.widthInputValues);
    assignValuesToInputs(heightInputContainer.children, selections.heightInputValues);
    
    document.getElementById("js-image-name").value = selections.imageName;
    document.getElementById("js-image-name-seperator").value = selections.imageNameSeperator;
})();

function saveToLocalStorage() {
    let selections = {
        numberOfInputs: select.value,
        widthInputValues: getInputValues(widthInputCointaner.children),
        heightInputValues: getInputValues(heightInputContainer.children),
        imageName: document.getElementById("js-image-name").value || "",
        imageNameSeperator: document.getElementById("js-image-name-seperator").value || ""
    };

    localStorage.setItem("Selections", JSON.stringify(selections));
}

function verifyValue(value, value2) {
    const regex = /^\d+(px|%)?$|^same$|^original$|^width$|^height$/;
    
    return regex.test(value) && !(value === "same" && (!value2 || value2 === "same"));
}

function assignValuesToInputs(inputs, values) {
    Array.prototype.forEach.call(inputs, (input, index) => {
        input.value = values[index];
    });
}

function getInputValues(inputs) {
    return Array.prototype.map.call(inputs, input => input.value);
}

function createInput() {
    let input = document.createElement("input");

    input.setAttribute("type", "text");
    input.classList.add("image-input");

    return input;
}

function createInputs(num) {
    let fragment = document.createDocumentFragment();

    for (let i = 0; i < num; i++) {
        fragment.appendChild(createInput());
    }

    return fragment;
}

function appendInputs(element, num) {
    let totalChildren = element.children.length;

    if (totalChildren < num) {
        let toAppend = num - totalChildren;
        
        element.appendChild(createInputs(toAppend));
    }
    else {
        let toRemove = totalChildren - num;

        while (toRemove--) {
            totalChildren = element.children.length;
            element.removeChild(element.children[totalChildren - 1]);
        }
    }
}

function onSelection(event) {
    const numberOfInputs = Number.parseInt(event.target.value, 10);

    appendInputs(widthInputCointaner, numberOfInputs);
    appendInputs(heightInputContainer, numberOfInputs);
}

function toggleSettings(event) {
    let button = event.target;
    
    button.innerHTML = button.innerHTML === "Settings" ? "Selections" : "Settings";
    
    toggleElement("toggle", document.getElementById("js-selections"));
    toggleElement("toggle", document.getElementById("js-settings"));
}

select.addEventListener("input", onSelection, false);

document.getElementById("js-settings-toggle").addEventListener("click", toggleSettings, false);

export { widthInputCointaner, heightInputContainer, saveToLocalStorage, verifyValue };
