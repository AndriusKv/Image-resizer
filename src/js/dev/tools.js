"use strict";

import { changeClass } from "./main.js";
import { showMessage } from "./dropbox.js";

let cropperEnabled = false,
    activeTool = "resizer";

function removeActiveTool() {
    const btns = [...document.querySelectorAll(".tool-selection-btn")];

    btns.forEach(btn => {
        if (btn.classList.contains("active")) {
            const toolSettings = document.getElementById(`js-${btn.getAttribute("data-tool")}-settings`);

            changeClass("remove", btn, "active");
            if (toolSettings) {
                changeClass("remove", toolSettings, "active");
            }
        }
    });
}

function enableTool(target, tool) {
    const toolSettings = document.getElementById(`js-${tool}-settings`);

    changeClass("add", target, "active");

    if (toolSettings) {
        changeClass("add", toolSettings, "active");
    }
}

function toggleTool(event) {
    const target = event.target,
        tool = target.getAttribute("data-tool");

    if (!tool || tool === activeTool) {
        return;
    }
    activeTool = tool;
    removeActiveTool();
    enableTool(target, tool);
    showMessage(`${tool} enabled`);
    cropperEnabled = tool === "cropper";
}

document.getElementById("js-tools-btns").addEventListener("click", toggleTool, false);

export { cropperEnabled };
