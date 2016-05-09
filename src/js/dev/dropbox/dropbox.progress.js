const progressBar = document.getElementById("js-progress");
const progressLabel = document.getElementById("js-progress-label");

function showProgressBar() {
    progressBar.classList.add("show");
}

function hideProgressBar() {
    progressBar.classList.remove("show");
}

function setProgressLabel(text) {
    progressLabel.textContent = text;
}

function updateProgress(value) {
    progressBar.value += value;
}

function resetProgress() {
    progressBar.classList.remove("show");
    progressBar.value = 0;
}

export {
    showProgressBar as show,
    hideProgressBar as hide,
    setProgressLabel as setLabel,
    updateProgress as update,
    resetProgress as reset 
};
