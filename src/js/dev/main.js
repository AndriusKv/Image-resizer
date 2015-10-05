"use strict";

import "./dropbox.js";
import "./selections.js";
import "./read.js";
import "./process.js";

var dropboxLabel = document.getElementById("js-dropbox-label"),
    settingsMask = document.getElementById("js-selections-mask"),
    timeout;

function addClass(target, classToAdd) {
    var targetClassList = target.classList;

    if (!targetClassList.contains(classToAdd)) {
        targetClassList.add(classToAdd);
    }
}

function removeClass(target, classToRemove) {
    var targetClassList = target.classList;

    if (targetClassList.contains(classToRemove)) {
        targetClassList.remove(classToRemove);
    }
}

function showElement(element) {
    addClass(element, "show");
}

function hideElement(element) {
    removeClass(element, "show");
}

function addMasks() {
    addClass(dropboxLabel, "mask");
    addClass(settingsMask, "mask");
}

function removeMasks() {
    removeClass(dropboxLabel, "mask");
    removeClass(settingsMask, "mask");
}

function hideMessageAfter(delay) {
    if (timeout) {
        clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
        showMessage("");
    }, delay);
}

function showMessage(message) {
    requestAnimationFrame(() => {
        document.getElementById("js-msg").innerHTML = message;
    });
    
    if (!message) {
        return;
    }

    hideMessageAfter(2000);
}

export { addMasks, removeMasks, addClass, removeClass, showElement, hideElement, showMessage };
