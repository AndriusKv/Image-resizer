import { showMessage } from "./dropbox.js";

let cropperEnabled = false;
let activeTool = "resizer";

function toggleTool(tool, elem) {
    const toolSettings = document.getElementById(`js-${tool}-settings`);

    elem.classList.toggle("active");
    if (toolSettings) {
        toolSettings.classList.toggle("active");
    }
}

function removeActiveTool() {
    const btns = [...document.querySelectorAll(".tool-selection-btn")];

    btns.forEach(btn => {
        if (btn.classList.contains("active")) {
            const tool = btn.getAttribute("data-tool");

            toggleTool(tool, btn);
        }
    });
}

function switchTool(event) {
    const target = event.target;
    const tool = target.getAttribute("data-tool");

    if (!tool || tool === activeTool) {
        return;
    }
    activeTool = tool;
    removeActiveTool();
    toggleTool(tool, target);
    showMessage(`${tool} enabled`);
    cropperEnabled = tool === "cropper";
}

document.getElementById("js-tools-btns").addEventListener("click", switchTool, false);

export { cropperEnabled };
