import { getElementByAttr } from "./utils";
import { updateCropPanelInputs } from "./crop-panel";

let activePanelName = "";
let panelVisible = false;

function getPanelElement(name) {
  return document.getElementById(`js-top-bar-${name}-panel`);
}

function hidePanel() {
  const element = getPanelElement(activePanelName);
  panelVisible = false;
  activePanelName = "";
  element.classList.remove("visible");
  window.removeEventListener("mousedown", handleClickOutsidePanel);
}

function handleClickOutsidePanel(event) {
  if (event.target.closest(".js-top-bar-item")) {
    return;
  }
  hidePanel();
}

function isPanelVisible() {
  return panelVisible;
}

document.getElementById("js-top-bar-header").addEventListener("click", event => {
  const element = getElementByAttr("data-panel-name", event.target, event.currentTarget);

  if (!element) {
    return;
  }
  const { attrValue } = element;

  if (activePanelName) {
    const element = getPanelElement(activePanelName);
    element.classList.remove("visible");
  }

  if (attrValue === activePanelName) {
    panelVisible = false;
    activePanelName = "";
    window.removeEventListener("mousedown", handleClickOutsidePanel);
  }
  else {
    const element = getPanelElement(attrValue);
    panelVisible = true;
    activePanelName = attrValue;
    element.classList.add("visible");
    window.addEventListener("mousedown", handleClickOutsidePanel);

    if (attrValue === "crop") {
      updateCropPanelInputs();
    }
  }
});

export {
  isPanelVisible
};
