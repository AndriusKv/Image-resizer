"use strict";

import "./process.js";
import "./resizer-settings.js";
import "./tools.js";
import "./dropbox.js";

function removeTransitionPrevention() {
    const elems = [...document.querySelectorAll(".preload")];

    elems.forEach(elem => {
        elem.classList.remove("preload");
    });
    window.removeEventListener("load", removeTransitionPrevention, false);
}

window.addEventListener("load", removeTransitionPrevention, false);

// prevent file drop outside dropbox
window.addEventListener("drop", event => {
    event.preventDefault();
}, false);
window.addEventListener("dragover", event => {
    event.preventDefault();
}, false);
