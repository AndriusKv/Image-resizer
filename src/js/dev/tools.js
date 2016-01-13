"use strict";

import { changeClass } from "./main.js";
import { showMessage } from "./dropbox.js";

let cropperEnabled = false;

function removeActiveTool() {
    const btns = [...document.querySelectorAll(".tool-selection-btn")];
    
    btns.forEach(btn => {
        if (btn.classList.contains("active")) {
            const toolSelections = document.getElementById(`js-${btn.getAttribute("data-tool")}-selections`);

            changeClass("remove", btn, "active");
            if (toolSelections) {
                changeClass("remove", toolSelections, "active");
            }
        }
    });
}

function enableTool(target, tool) {
    const toolSelections = document.getElementById(`js-${tool}-selections`);
    
    changeClass("add", target, "active");
    
    if (toolSelections) {
        changeClass("add", toolSelections, "active");
    }
}

function toggleTool(event) {
    const target = event.target,
        tool = target.getAttribute("data-tool");
    
    if (!tool) {
        return;
    }
    removeActiveTool();
    enableTool(target, tool);
    showMessage(`${tool} enabled`);
    cropperEnabled = tool === "cropper";
}

document.getElementById("js-tools-btns").addEventListener("click", toggleTool, false);

export { cropperEnabled };
