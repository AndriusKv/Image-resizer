import { message } from "./dropbox.js";

let activeTool = "resizer";

function getCurrentTool() {
    return activeTool;
}

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
    message.show(`${tool} enabled`);
}

document.getElementById("js-tools-btns").addEventListener("click", switchTool, false);

export { getCurrentTool };
