import { getElementByAttr } from "./utils.js";
import { drawCanvas, getCanvasDimensions } from "./canvas.js";
import { getScale, scaleContext, translateContext, resetTransform, getTransformedPoint } from "./transform.js";

const zoomElement = document.getElementById("js-bottom-bar-zoom");

function scaleImage(x, y, scale) {
  translateContext(x, y);
  scaleContext(scale);
  translateContext(-x, -y);
  requestAnimationFrame(drawCanvas);
}

function clampZoomLevel(value) {
  const minValue = 0.08;
  const maxValue = 80;

  if (value < minValue) {
    value = minValue;
  }
  else if (value > maxValue) {
    value = maxValue;
  }
  return value;
}

function getDimensionScale(imageDimension, canvasDimension) {
  const excess = imageDimension - canvasDimension;

  return 1 - 1 / (imageDimension / excess);
}

function clampScale(imageDimension1, imageDimension2, canvasDimension1, canvasDimension2) {
  let scale = 1;

  if (imageDimension1 > canvasDimension1) {
    // Get scale from first dimension comparison
    scale = getDimensionScale(imageDimension1, canvasDimension1);

    // If image scaled down with first dimension comparison still doesn't with in canvas,
    // when get scale using second dimension comparison
    if (imageDimension2 * scale > canvasDimension2) {
      scale = getDimensionScale(imageDimension2, canvasDimension2);
    }
  }
  return scale;
}

function scaleImageToFitCanvas(image) {
  const { canvasWidth, canvasHeight } = getCanvasDimensions();
  const { width: imageWidth, height: imageHeight } = image;
  let scale = getScale();

  if (imageWidth > imageHeight) {
    scale = clampScale(imageWidth, imageHeight, canvasWidth, canvasHeight);
  }
  else {
    scale = clampScale(imageHeight, imageWidth, canvasHeight, canvasWidth);
  }
  const x = canvasWidth - imageWidth * scale;
  const y = canvasHeight - imageHeight * scale;

  resetTransform(x / 2, y / 2);
  scaleImage(0, 0, scale);
  updateZoomLevelValue(scale);
}

function updateZoomLevelValue(zoomLevel) {
  const element = document.getElementById("js-zoom-input");
  zoomLevel = Math.round(zoomLevel * 100);

  element.value = zoomLevel;
  element.previousElementSibling.textContent = `${zoomLevel}%`;
}

function applyScaleMultiplier(multiplier, scalePointX, scalePointY) {
  const scale = getScale();
  const { x, y } = getTransformedPoint(scalePointX, scalePointY);
  const zoomLevel = clampZoomLevel(scale * multiplier);

  scaleImage(x, y, zoomLevel);
  updateZoomLevelValue(zoomLevel);
}

function handleInputBlur({ currentTarget }) {
  currentTarget.classList.remove("visible");
  currentTarget.previousElementSibling.classList.add("visible");

  if (currentTarget.value < 8) {
    currentTarget.value = 8;
  }
}

document.getElementById("js-zoom-input").addEventListener("input", ({ target }) => {
  const { canvasWidth, canvasHeight } = getCanvasDimensions();
  const { x, y } = getTransformedPoint(canvasWidth / 2, canvasHeight / 2);
  const value = parseInt(target.value, 10) || 0;
  const zoomLevel = clampZoomLevel(value / 100);
  const zoomLevelPercent = Math.round(zoomLevel * 100);

  scaleImage(x, y, zoomLevel);

  if (value > zoomLevelPercent) {
    target.value = zoomLevelPercent;
  }
  target.previousElementSibling.textContent = `${zoomLevelPercent}%`;
});

zoomElement.addEventListener("click", event => {
  const element = getElementByAttr("data-type", event.target, event.currentTarget);

  if (!element) {
    return;
  }
  const { canvasWidth, canvasHeight } = getCanvasDimensions();
  const multiplier = element.attrValue === "out" ? 0.8 : 1.25;

  applyScaleMultiplier(multiplier, canvasWidth / 2, canvasHeight / 2);
});

zoomElement.addEventListener("focus", ({ target }) => {
  if (target.nodeName === "SPAN") {
    const inputElement = target.nextElementSibling;

    target.classList.remove("visible");
    inputElement.classList.add("visible");
    inputElement.focus();
    inputElement.addEventListener("blur", handleInputBlur, { once: true });
  }
}, true);

export {
  applyScaleMultiplier,
  scaleImageToFitCanvas
};
