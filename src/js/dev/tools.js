import * as message from "./dropbox/dropbox.message.js";

let activeTool = "resizer";

function getCurrentTool() {
    return activeTool;
}

function toggleToolSettings(tool) {
    const toolSettings = document.getElementById(`js-${tool}-settings`);

    if (toolSettings) {
        toolSettings.classList.toggle("active");
    }
}

function switchTool({ target }) {
    const tool = target.getAttribute("data-tool");

    if (!tool || tool === activeTool) {
        return;
    }
    document.querySelector(`[data-tool=${activeTool}]`).classList.remove("active");
    target.classList.add("active");
    toggleToolSettings(activeTool);
    toggleToolSettings(tool);
    message.show(`${tool} enabled`);
    activeTool = tool;
}

document.getElementById("js-tool-selection").addEventListener("click", switchTool);

export {
    getCurrentTool
};
