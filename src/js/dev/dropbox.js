"use strict";

import { addMasks, removeMasks, showElement, hideElement } from "./main.js";

var progressBar = document.getElementById("js-progress"),
    processBtn = document.getElementById("js-process"),
    downloadBtn = document.getElementById("js-download"),
    cancelBtn = document.getElementById("js-cancel"),
    isCanceled = false,
    isWorking = false;

function setProgressLabel(text) {
    requestAnimationFrame(() => {
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
    removeMasks();
}

function beforeWork() {
    addMasks();
    isWorking = true;
    showElement(progressBar);
    hideElement(processBtn);
    showElement(cancelBtn);
}

function resetDropbox() {
    isWorking = false;
    hideElement(progressBar);
    hideElement(cancelBtn);
    resetProgress();
    removeMasksAndLabel();
}

export {
	isDone,
	cancelBtn,
	isWorking,
	beforeWork,
	isCanceled,
	processBtn,
    progressBar,
	downloadBtn,
	resetDropbox,
	resetProgress,
	updateProgress,
	setProgressLabel,
	removeMasksAndLabel
};
