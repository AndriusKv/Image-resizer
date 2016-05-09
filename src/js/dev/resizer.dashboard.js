import * as message from "./dropbox/dropbox.message.js";
import * as button from "./dropbox/dropbox.buttons.js";

const dimensionInputContainer = document.getElementById("js-dimension-inputs");
const imageName = document.getElementById("js-image-name");
const imageNameSeperator = document.getElementById("js-image-name-seperator");
const qualitySlider = document.getElementById("js-image-quality");

(function loadFromLocalStorage() {
    let selections = localStorage.getItem("selections");

    if (!selections) {
        return;
    }
    selections = JSON.parse(selections);

    const inputValues = flattenInputValues(selections.dimensionInputValues);

    appendInputs(dimensionInputContainer, inputValues.length);
    assignValuesToInputs(dimensionInputContainer.children, inputValues);

    imageName.value = selections.imageName;
    imageNameSeperator.value = selections.imageNameSeperator;
    qualitySlider.value = selections.imageQuality;
})();

function saveToLocalStorage(inputValues) {
    const selections = {
        dimensionInputValues: inputValues,
        imageName: imageName.value || "",
        imageNameSeperator: imageNameSeperator.value || "",
        imageQuality: qualitySlider.value
    };

    localStorage.setItem("selections", JSON.stringify(selections));
}

function flattenInputValues(values) {
    return values.reduce((arr, value) => {
        arr.push(value.width, value.height);
        return arr;
    }, []);
}

function getInputValues() {
    const inputs = dimensionInputContainer.children;
    const values = [];

    for (let i = 0, l = inputs.length; i < l; i += 2) {
        const width = inputs[i].value;
        const height = inputs[i + 1].value;

        if (width || height) {
            values.push({ width, height });
        }
    }
    return verifyValues(values);
}

function verifyValues(values) {
    if (!values.length) {
        message.show("No dimensions specified");
        button.show("process");
    }
    else {
        values = values.filter(value => isDimensionsValid(value.width, value.height));
        if (!values.length) {
            message.show("No valid values");
            button.show("process");
        }
    }
    return values;
}

function isDimensionsValid(width, height) {
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
    message.show(`Image quality set to: ${event.target.value}%`);
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

export { saveToLocalStorage, getInputValues };
