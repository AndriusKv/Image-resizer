import { getArea } from "./area";
import { getTransform } from "./transform";
import { allowCropAreaModification, drawCanvas } from "./canvas";

const panel = document.getElementById("js-top-bar-crop-panel");

function getInputs() {
  return panel.querySelectorAll("[data-value]");
}

function updateCropPanelInputs() {
  const area = getArea();

  if (!area.width || !area.height) {
    return;
  }
  const { a: scale, e: x, f: y } = getTransform();
  const translated = {
    x: x / scale,
    y: y / scale
  };
  let areaX = area.x;
  let areaWidth = area.width;
  let areaY = area.y;
  let areaHeight = area.height;

  if (areaWidth < 0) {
    areaX += areaWidth;
    areaWidth *= -1;
  }

  if (areaHeight < 0) {
    areaY += areaHeight;
    areaHeight *= -1;
  }
  const transformedValues = [
    Math.round(areaX / scale - translated.x),
    Math.round(areaY / scale - translated.y),
    Math.round(areaWidth / scale),
    Math.round(areaHeight / scale)
  ];
  const inputs = getInputs();

  for (let i = 0; i < inputs.length; i += 1) {
    inputs[i].value = transformedValues[i];
  }
}

function resetCropPanelInputs() {
  const inputs = getInputs();

  for (let i = 0; i < inputs.length; i += 1) {
    inputs[i].value = "";
  }
}

function updateCropArea() {
  const inputs = getInputs();
  const values = [];

  for (const input of inputs) {
    if (!input.validity.valid) {
      return;
    }
    values.push(parseInt(input.value, 10) || 0);
  }

  if (values.length === 4) {
    const { a: scale, e: x, f: y } = getTransform();
    const area = getArea();

    area.x = Math.round(values[0] * scale + x);
    area.y = Math.round(values[1] * scale + y);
    area.width = Math.round(values[2] * scale);
    area.height = Math.round(values[3] * scale);
    requestAnimationFrame(drawCanvas);
    allowCropAreaModification();
  }
}

panel.addEventListener("change", updateCropArea);
document.getElementById("js-crop-panel-btn").addEventListener("click", updateCropArea);

export {
  updateCropPanelInputs,
  resetCropPanelInputs
};
