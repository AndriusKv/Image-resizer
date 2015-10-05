"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mainJs = require("./main.js");

var progressBar = document.getElementById("js-progress"),
    processBtn = document.getElementById("js-process"),
    downloadBtn = document.getElementById("js-download"),
    cancelBtn = document.getElementById("js-cancel"),
    isCanceled = false,
    isWorking = false;

function setProgressLabel(text) {
    requestAnimationFrame(function () {
        document.getElementById("js-progress-label").textContent = text;
    });
}

function updateProgress(value) {
    progressBar.value += value;
}

function resetProgress() {
    progressBar.value = 0;
}

function isDone() {
    return Math.round(progressBar.value) === 100;
}

function removeMasksAndLabel() {
    setProgressLabel("");
    (0, _mainJs.removeMasks)();
}

function beforeWork() {
    (0, _mainJs.addMasks)();
    exports.isWorking = isWorking = true;
    (0, _mainJs.showElement)(progressBar);
    (0, _mainJs.hideElement)(processBtn);
    (0, _mainJs.showElement)(cancelBtn);
}

function resetDropbox() {
    exports.isWorking = isWorking = false;
    (0, _mainJs.hideElement)(progressBar);
    (0, _mainJs.hideElement)(cancelBtn);
    resetProgress();
    removeMasksAndLabel();
}

exports.isDone = isDone;
exports.cancelBtn = cancelBtn;
exports.isWorking = isWorking;
exports.beforeWork = beforeWork;
exports.isCanceled = isCanceled;
exports.processBtn = processBtn;
exports.progressBar = progressBar;
exports.downloadBtn = downloadBtn;
exports.resetDropbox = resetDropbox;
exports.resetProgress = resetProgress;
exports.updateProgress = updateProgress;
exports.setProgressLabel = setProgressLabel;
exports.removeMasksAndLabel = removeMasksAndLabel;