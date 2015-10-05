"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

require("./dropbox.js");

require("./selections.js");

require("./read.js");

require("./process.js");

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

    timeout = setTimeout(function () {
        showMessage("");
    }, delay);
}

function showMessage(message) {
    requestAnimationFrame(function () {
        document.getElementById("js-msg").innerHTML = message;
    });

    if (!message) {
        return;
    }

    hideMessageAfter(2000);
}

exports.addMasks = addMasks;
exports.removeMasks = removeMasks;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.showElement = showElement;
exports.hideElement = hideElement;
exports.showMessage = showMessage;