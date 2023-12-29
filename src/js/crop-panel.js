import { getArea } from "./area";
import { getTransform } from "./transform";
import { allowCropAreaModification, drawCanvas } from "./canvas";

const panel = document.getElementById("js-top-bar-crop-panel");

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
  const transformedArea = {
    x: Math.round(area.x / scale - translated.x),
    y: Math.round(area.y / scale - translated.y),
    width: Math.round(area.width / scale),
    height: Math.round(area.height / scale)
  };

  for (const element of panel.querySelectorAll("[data-value]")) {
    const key = element.getAttribute("data-value");

    element.value = transformedArea[key];
  }
}

function resetCropPanelInputs() {
  for (const element of panel.querySelectorAll("[data-value]")) {
    element.value = "";
  }
}

function updateCropArea() {
  const values = {};

  for (const element of panel.querySelectorAll("[data-value]")) {
    if (!element.validity.valid) {
      return;
    }
    const key = element.getAttribute("data-value");
    values[key] = Number.parseInt(element.value, 10) || 0;
  }

  if (Object.keys(values).length === 4) {
    const { a: scale, e: x, f: y } = getTransform();
    const area = getArea();

    area.x = values.x * scale + x;
    area.y = values.y * scale + y;
    area.width = values.width * scale;
    area.height = values.height * scale;

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
