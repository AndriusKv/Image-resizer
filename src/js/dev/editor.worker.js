/* global saveAs */

import * as state from "./editor.state.js";
import { removeMasksAndLabel } from "./dropbox/dropbox.js";
import * as progress from "./dropbox/dropbox.progress.js";
import * as message from "./dropbox/dropbox.message.js";
import * as button from "./dropbox/dropbox.buttons.js";

let worker = null;

(function () {
    worker = new Worker("js/ww.js");
    worker.onmessage = function(event) {
        const data = event.data;

        if (data.action === "download") {
            saveZip(data.content);
        }
        else if (data.action === "generating") {
            progress.setLabel("Generating archive");
        }
        else if (data.action === "done") {
            state.set(-1);
            removeMasksAndLabel();
            message.show("Images are ready for downloading");
            button.show("download");
        }
    };
    worker.onerror = function(event) {
        console.log(event);
    };
})();

function postMessageToWorker(message) {
    worker.postMessage(message);
}

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

export {
    postMessageToWorker
};
