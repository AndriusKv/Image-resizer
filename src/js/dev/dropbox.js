"use strict";

import { toggleMasks, toggleElement } from "./main.js";

const progressBar = document.getElementById("js-progress");
const processBtn = document.getElementById("js-process");
const downloadBtn = document.getElementById("js-download");
const cancelBtn = document.getElementById("js-cancel");

let isCanceled = false;
let isWorking = false;
let timeout = 0;

function hideMessageAfter(delay) {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
        showMessage();
    }, delay);
}

function showMessage(message = "") {
    requestAnimationFrame(() => {
        document.getElementById("js-msg").innerHTML = message;
    });

    if (!message) {
        return;
    }
    hideMessageAfter(2000);
}

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
    toggleMasks("remove");
}

function beforeWork() {
    toggleMasks("add");
    isWorking = true;
    toggleElement("add", progressBar);
    toggleElement("remove", processBtn);
    toggleElement("add", cancelBtn);
}

function resetDropbox() {
    isWorking = false;
    toggleElement("remove", progressBar);
    toggleElement("remove", cancelBtn);
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
    showMessage,
	resetDropbox,
	resetProgress,
	updateProgress,
	setProgressLabel,
	removeMasksAndLabel
};
