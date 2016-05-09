/* global saveAs */

import * as state from "./editor.state.js";
import { removeMasksAndLabel } from "./dropbox/dropbox.js";
import * as message from "./dropbox/dropbox.message.js";
import * as button from "./dropbox/dropbox.buttons.js";

let worker;

function saveZip(data) {
    try {
        saveAs(data, "images.zip");
    }
    catch (error) {
        const script = document.createElement("script");

        script.setAttribute("src", "js/libs/FileSaver.min.js");
        document.getElementsByTagName("body")[0].appendChild(script);
        script.onload = function() {
            saveAs(data, "images.zip");
        };
    }
}

function initWorker() {
    if (worker) {
        return;
    }
    worker = new Worker("js/workers/worker1.js");
    worker.onmessage = function(event) {
        const data = event.data;

        if (data.action === "download") {
            saveZip(data.content);
        }
        else if (data.action === "notify") {
            state.set(-1);
            removeMasksAndLabel();
            message.show("Images are ready for downloading");
            button.show("download");
        }
    };
    worker.onerror = function(event) {
        console.log(event);
    };
}

function postMessage(message) {
    worker.postMessage(message);
}

function isWorkerInitialized() {
    return !!worker;
}

export {
    initWorker as init,
    postMessage as post,
    isWorkerInitialized as isInited
};
