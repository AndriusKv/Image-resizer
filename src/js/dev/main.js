"use strict";

import "./dropbox.js";
import "./tools.js";
import "./resizer-settings.js";
import "./read.js";
import "./process.js";

function changeClass(action, target, classToChange) {
    target.classList[action](classToChange);
}

function toggleElement(action, element) {
    changeClass(action, element, "show");
}

function toggleMasks(action) {
    changeClass(action, document.getElementById("js-dropbox-label"), "mask");
    changeClass(action, document.getElementById("js-mask"), "show");
}

function removeTransitionPrevention() {
    const elems = [...document.querySelectorAll(".preload")];

    elems.forEach(elem => {
        elem.classList.remove("preload");
    });
    window.removeEventListener("load", removeTransitionPrevention, false);
}

window.addEventListener("load", removeTransitionPrevention, false);

export { toggleMasks, changeClass, toggleElement };
