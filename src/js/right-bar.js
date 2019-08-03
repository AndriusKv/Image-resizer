import { getElementByAttr } from "./utils.js";

let activeTabName = "";
let keepVisible = false;

function getTabElement(name) {
  return document.getElementById(`js-right-bar-${name}-tab`);
}

function handleClickOutsideModal(event) {
  if (keepVisible || event.target.closest(".js-right-bar-item")) {
    keepVisible = false;
    return;
  }
  const element = getTabElement(activeTabName);
  activeTabName = "";
  element.classList.remove("visible");
  window.removeEventListener("click", handleClickOutsideModal, true);
  window.removeEventListener("mousedown", preventModalHiding, true);
}

function preventModalHiding(event) {
  if (event.target.closest(".js-right-bar-item")) {
    keepVisible = true;
  }
}

document.getElementById("js-right-bar-header").addEventListener("click", event => {
  const element = getElementByAttr("data-tab-name", event.target, event.currentTarget);

  if (!element) {
    return;
  }
  const { attrValue } = element;

  if (activeTabName) {
    const element = getTabElement(activeTabName);
    element.classList.remove("visible");
  }

  if (attrValue === activeTabName) {
    activeTabName = "";
    window.removeEventListener("click", handleClickOutsideModal, true);
    window.removeEventListener("mousedown", preventModalHiding, true);
  }
  else {
    const element = getTabElement(attrValue);
    activeTabName = attrValue;
    element.classList.add("visible");
    window.addEventListener("click", handleClickOutsideModal, true);
    window.addEventListener("mousedown", preventModalHiding, true);
  }
});
