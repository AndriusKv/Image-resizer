import * as dropbox from "./dropbox.js";

const dropboxElem = document.getElementById("js-dropbox");
let counter = 0;

function onDragover(event) {
    event.stopPropagation();
    event.preventDefault();
}

function onDragenter(event) {
    event.preventDefault();

    if (dropbox.state.get() === 1) {
        return;
    }
    counter += 1;
    dropboxElem.classList.add("over");
}

function onDragleave() {
    if (dropbox.state.get() === 1) {
        return;
    }
    counter -= 1;
    if (!counter) {
        dropboxElem.classList.remove("over");
    }
}

function onDrop(event) {
    counter = 0;
    dropboxElem.classList.remove("over");
    event.stopPropagation();
    event.preventDefault();
    if (dropbox.state.get() === 1) {
        event.dataTransfer.dropEffect = "none";
        return;
    }
    event.dataTransfer.dropEffect = "copy";
    dropbox.onFiles(event.dataTransfer.files);
}

function onClick(event) {
    if (dropbox.state.get() === 1) {
        event.preventDefault();
    }
}

dropboxElem.addEventListener("dragover", onDragover, false);
dropboxElem.addEventListener("dragenter", onDragenter, false);
dropboxElem.addEventListener("dragleave", onDragleave, false);
dropboxElem.addEventListener("drop", onDrop, false);
dropboxElem.addEventListener("click", onClick, false);
