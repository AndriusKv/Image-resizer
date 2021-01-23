import { getElementByAttr } from "./utils.js";
import { drawCanvas } from "./canvas.js";

const flip = {
  flipH: 1,
  flipV: 1
};

function getFlip() {
  return flip;
}

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
