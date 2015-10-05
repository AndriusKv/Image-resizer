"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mainJs = require("./main.js");

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
})();

function saveToLocalStorage() {
    var selections = {
        numberOfInputs: select.value,
        checked: checkbox.checked,
        widthInputValues: getInputValues(widthInputCointaner.children),
        heightInputValues: getInputValues(heightInputContainer.children)
    };

    localStorage.setItem("Selections", JSON.stringify(selections));
}

function indicateInput(input) {
    (0, _mainJs.addClass)(input, "invalid");

    setTimeout(function () {
        (0, _mainJs.removeClass)(input, "invalid");
    }, 400);
}

function isValid(inputs) {
    var valid = true;

    Array.prototype.forEach.call(inputs, function (input) {
        if (/\D/g.test(input.value)) {
            indicateInput(input);
            valid = false;
        }
    });

    return valid;
}

function hasValue(inputs) {
    return Array.prototype.some.call(inputs, function (input) {
        return input.value;
    });
}

function assignValuesToInputs(inputs, values) {
    Array.prototype.forEach.call(inputs, function (input, index) {
        input.value = values[index];
    });
}

function getInputValues(inputs) {
    return Array.prototype.map.call(inputs, function (input) {
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

    for (var i = 0; i < num; i++) {
        fragment.appendChild(createInput());
    }

    return fragment;
}

function appendInputs(element, num) {
    var totalChildren = element.children.length;

    if (totalChildren < num) {
        var toAppend = num - totalChildren;

        element.appendChild(createInputs(toAppend));
    } else {
        var toRemove = totalChildren - num;

        while (toRemove--) {
            totalChildren = element.children.length;
            element.removeChild(element.children[totalChildren - 1]);
        }
    }
}

function onSelection(event) {
    var numberOfInputs = Number.parseInt(event.target.value, 10);

    appendInputs(widthInputCointaner, numberOfInputs);
    appendInputs(heightInputContainer, numberOfInputs);
}

select.addEventListener("input", onSelection, false);

exports.widthInputCointaner = widthInputCointaner;
exports.heightInputContainer = heightInputContainer;
exports.saveToLocalStorage = saveToLocalStorage;
exports.hasValue = hasValue;
exports.isValid = isValid;
exports.checkbox = checkbox;