import { getElementByAttr } from "./utils.js";
import { drawCanvas } from "./canvas.js";

const rotationElement = document.getElementById("js-bottom-bar-rotation");
let theta = 0;

function convertDegreesToRadians(degrees) {
  if (degrees > 180) {
    degrees -= 360;
  }
  return degrees * Math.PI / 180;
}

function clampRadians(radians) {
  const max = Math.PI * 2;
  const min = -max;

  if (radians > max) {
    radians -= max;
  }
  else if (radians < min) {
    radians -= min;
  }
  return radians;
}

function convertRadiansToDegrees(radians) {
  let degrees = Math.round(clampRadians(radians) * 180 / Math.PI);

  if (degrees < 0) {
    degrees += 360;
  }
  return degrees === 360 ? 0 : degrees;
}

function setRotationInDegrees(degrees) {
  theta = convertDegreesToRadians(degrees);
  return theta;
}

function getRotation() {
  return theta;
}

function resetRotation() {
  theta = 0;
  updateRotationValue(0);
}

function updateRotationValue(value) {
  const element = document.getElementById("js-rotation-input");

  element.value = value;
  element.previousElementSibling.textContent = `${value}°`;
}

function handleInputBlur({ currentTarget }) {
  currentTarget.classList.remove("visible");
  currentTarget.previousElementSibling.classList.add("visible");

  if (currentTarget.value < 0 || currentTarget.value > 359) {
    currentTarget.value = convertRadiansToDegrees(theta);
  }
}

document.getElementById("js-rotation-input").addEventListener("input", ({ target }) => {
  let value = parseInt(event.target.value, 10) || 0;

  if (value < 0) {
    value = 0;
  }
  else if (value > 360) {
    value %= 360;
  }
  const radians = setRotationInDegrees(value);
  const degrees = convertRadiansToDegrees(radians);
  requestAnimationFrame(drawCanvas);
  target.previousElementSibling.textContent = `${degrees}°`;
});

rotationElement.addEventListener("click", event => {
  const element = getElementByAttr("data-type", event.target, event.currentTarget);

  if (!element) {
    return;
  }
  const radians = convertDegreesToRadians(15);

  if (element.attrValue === "left") {
    theta -= radians;
  }
  else if (element.attrValue === "right") {
    theta += radians;
  }
  const degress = convertRadiansToDegrees(theta);
  requestAnimationFrame(drawCanvas);
  updateRotationValue(degress);
});

rotationElement.addEventListener("focus", ({ target }) => {
  if (target.nodeName === "SPAN") {
    const inputElement = target.nextElementSibling;

    target.classList.remove("visible");
    inputElement.classList.add("visible");
    inputElement.focus();
    inputElement.addEventListener("blur", handleInputBlur, { once: true });
  }
}, true);

export {
  getRotation,
  resetRotation
};
