"use strict";

import { changeClass } from "./main.js";

var widthInputCointaner = document.getElementById("js-width-input-container"),
    heightInputContainer = document.getElementById("js-height-input-container"),
    checkbox = document.getElementById("js-checkbox"),
    select = document.getElementById("js-select");

(function loadFromLocalStorage() {
    var selections = localStorage.getItem("Selections");

    if (!selections) {
        return;
    }
    
    selections = JSON.parse(selections);

    checkbox.checked = selections.checked;
    select.value = selections.numberOfInputs;

    appendInputs(widthInputCointaner, selections.numberOfInputs);
    appendInputs(heightInputContainer, selections.numberOfInputs);
    
    assignValuesToInputs(widthInputCointaner.children, selections.widthInputValues);
    assignValuesToInputs(heightInputContainer.children, selections.heightInputValues);
    
    document.getElementById("js-image-name").value = selections.imageName;
    document.getElementById("js-image-name-seperator").value = selections.imageNameSeperator;
})();

function saveToLocalStorage() {
    var selections = {
        numberOfInputs: select.value,
        checked: checkbox.checked,
        widthInputValues: getInputValues(widthInputCointaner.children),
        heightInputValues: getInputValues(heightInputContainer.children),
        imageName: document.getElementById("js-image-name").value || "",
        imageNameSeperator: document.getElementById("js-image-name-seperator").value || ""
    };

    localStorage.setItem("Selections", JSON.stringify(selections));
}

function indicateInput(input) {
    changeClass("add", input, "invalid");

    setTimeout(() => {
        changeClass("remove", input, "invalid");
    }, 400);
}

function isValid(inputs) {
    var regex = /^\d+(px|%)?$/,
        valid = true;
	
    Array.prototype.forEach.call(inputs, input => {
        if (input.value && !regex.test(input.value)) {
            indicateInput(input);
            valid = false;
        }
    });
	
    return valid;
}

function hasValue(inputs) {    
    return Array.prototype.some.call(inputs, input => {
        return input.value; 
    });
}

function assignValuesToInputs(inputs, values) {
    Array.prototype.forEach.call(inputs, (input, index) => {
        input.value = values[index];
    });
}

function getInputValues(inputs) {
    return Array.prototype.map.call(inputs, input => {
        return input.value; 
    });
}

function createInput() {
    var input = document.createElement("input");

    input.setAttribute("type", "text");
    input.classList.add("image-input");

    return input;
}

function createInputs(num) {
    var fragment = document.createDocumentFragment();

    for (let i = 0; i < num; i++) {
        fragment.appendChild(createInput());
    }

    return fragment;
}

function appendInputs(element, num) {
    const totalChildren = element.children.length;

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

function toggleClass(elementId) {
    document.getElementById(elementId).classList.toggle("show");
}

function toggleSettings(event) {
    let button = event.target;
    
    button.innerHTML = button.innerHTML === "Settings" ? "Selections" : "Settings";
    
    toggleClass("js-selections");
    toggleClass("js-settings");
}

select.addEventListener("input", onSelection, false);

document.getElementById("js-settings-toggle").addEventListener("click", toggleSettings, false);

export { widthInputCointaner, heightInputContainer, saveToLocalStorage, hasValue, isValid, checkbox };
