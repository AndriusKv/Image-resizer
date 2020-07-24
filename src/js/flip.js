import { getElementByAttr } from "./utils.js";
import { drawCanvas } from "./canvas.js";

const flip = {
  flipH: 1,
  flipV: 1
};
let visible = false;

function getFlip() {
  return flip;
}

function handleWindowClick({ target }) {
  const closestContainer = target.closest(".panel-container");
  let hideDropdown = true;

  if (closestContainer) {
    hideDropdown = false;
  }

  if (hideDropdown) {
    visible = false;
    document.getElementById("js-bottom-bar-flip-toggle-items").classList.remove("visible");
    window.removeEventListener("click", handleWindowClick);
  }
}

document.getElementById("js-bottom-bar-flip-toggle-btn").addEventListener("click", ({ currentTarget }) => {
  const container = currentTarget.nextElementSibling;
  visible = !visible;
  container.classList.toggle("visible", visible);

  if (visible) {
    window.addEventListener("click", handleWindowClick);
  }
  else {
    window.removeEventListener("click", handleWindowClick);
  }
});

document.getElementById("js-bottom-bar-flip-toggle-items").addEventListener("click", ({ target, currentTarget }) => {
  const element = getElementByAttr("data-item", target, currentTarget);

  if (!element) {
    return;
  }
  flip[element.attrValue] *= -1;
  requestAnimationFrame(drawCanvas);
});

export {
  getFlip
};
