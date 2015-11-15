"use strict";

import "./dropbox.js";
import "./selections.js";
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
    changeClass(action, document.getElementById("js-selections-mask"), "mask");
}

export { toggleMasks, changeClass, toggleElement };
