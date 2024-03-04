import { getRotation, resetRotation } from "./rotation.js";
import { applyScaleMultiplier, scaleImageToFitCanvas } from "./zoom.js";
import { getFlip, resetFlip } from "./flip.js";
import { getUniqueImageName, renderAddedFolderImage } from "./image-folder.js";
import { getImages, getActiveImage, readImages, setActiveImage } from "./uploaded-images.js";
import { getArea, hasArea, normalizeArea, resetArea, isInsideArea, getResizeSquares, setDirection, getDirection, setDirectionString } from "./area.js";
import { setTransformContext, getTransform, setTransform, translateContext, getTransformedPoint } from "./transform.js";
import { resetCropPanelInputs } from "./crop-panel";
import { isPanelVisible } from "./top-bar";

const canvasImage = new Image();
const editorElement = document.getElementById("js-editor");
const cropBtnElement = document.getElementById("js-crop-btn");
const isMobile = window.orientation !== undefined;
let canvas = null;
let canvasWidth = 0;
let canvasHeight = 0;
let pointerPosition = null;
let transformedPointerPosition = null;
let eventToEnable = "";
let keepMask = false;
let snapArea = false;
let handlingMove = false;
let currentTool = "pan";
let areaWithGrid = false;

function initCanvasElement(blobUrl) {
  canvas = document.getElementById("js-canvas");
  setTransformContext(canvas.getContext("2d", { willReadFrequently: true }));
  resetCanvasDimensions();
  loadImageFile(blobUrl);

  canvas.addEventListener("wheel", handleScroll, { passive: true });
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("dblclick", handleDoubleClick);
}

function initCanvas(blobUrl) {
  editorElement.insertAdjacentHTML("beforeend", `<canvas id="js-canvas"></canvas>`);
  editorElement.classList.remove("hidden");
  document.getElementById("js-intro").remove();
  initCanvasElement(blobUrl);
  enableViewportResizeHandler();
}

function getCanvasElement() {
  return canvas;
}

function getCanvasDimensions() {
  return { canvasWidth, canvasHeight };
}

function resetCanvasDimensions() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  canvasWidth = w;
  canvasHeight = h;
}

function clearCanvas(ctx) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
}

function addMask(ctx) {
  ctx.fillStyle = "rgba(0, 0, 0, .4)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawImage(ctx, image = canvasImage) {
  const radians = getRotation();
  const { flipH, flipV } = getFlip();

  clearCanvas(ctx);
  ctx.save();

  if (radians) {
    const centerX = image.width / 2;
    const centerY = image.height / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate(radians);
    ctx.translate(-centerX, -centerY);
  }
  ctx.scale(flipH, flipV);
  ctx.translate(flipH === -1 ? -image.width : 0, flipV === -1 ? -image.height : 0);
  ctx.drawImage(image, 0, 0, image.width, image.height);
  ctx.restore();
}

function drawArea(ctx) {
  const area = getArea();
  const areaWidth = Math.round(area.width);
  const areaHeight = Math.round(area.height);
  const x = Math.round(area.x);
  const y = Math.round(area.y);
  let imageData;

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#006494";
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (areaWidth && areaHeight) {
    imageData = ctx.getImageData(x, y, areaWidth, areaHeight);
  }

  if (areaWidth || areaHeight || keepMask) {
    addMask(ctx);
  }

  if (imageData) {
    ctx.putImageData(imageData, x, y);
  }

  if (areaWidth && areaHeight) {
    if (currentTool === "cut" || currentTool === "pan" && areaWithGrid) {
      areaWithGrid = true;
      drawGrid(ctx, area);
    }
    drawResizeSquares(ctx, area);
  }
  ctx.strokeRect(area.x + 0.5, area.y + 0.5, areaWidth, areaHeight);
  ctx.restore();
}

function drawCanvas() {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  drawImage(ctx);
  drawArea(ctx);
}

function drawResizeSquares(ctx) {
  const areas = getResizeSquares(isMobile);

  for (const area of areas) {
    ctx.strokeRect(area.x + 0.5, area.y + 0.5, area.width, area.height);
  }
}

function drawGrid(ctx, area) {
  const cells = 3;
  const cellWidth = Math.round(area.width / cells);
  const cellHeight = Math.round(area.height / cells);

  for (let i = 1; i < cells; i += 1) {
    ctx.beginPath();
    ctx.moveTo(area.x + cellWidth * i, area.y);
    ctx.lineTo(area.x + cellWidth * i, area.y + area.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(area.x, area.y + cellHeight * i);
    ctx.lineTo(area.x + area.width, area.y + cellHeight * i);
    ctx.stroke();
  }
}

function setCanvasCursor(name = "default") {
  canvas.style.cursor = name;
}

function resetCanvasProperties() {
  const t = getTransform();

  resetCanvasDimensions();
  setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
}

function handleScroll(event) {
  applyScaleMultiplier(event.deltaY > 0 ? 0.8 : 1.25, event.clientX, event.clientY);
}

function handlePointerDown(event) {
  if (event.which !== 1 || isPanelVisible()) {
    return;
  }
  const { clientX: x, clientY: y } = event;
  const area = getArea();
  const areaDrawn = hasArea();
  const direction = setDirection(x, y);

  keepMask = areaDrawn;

  if (currentTool === "select" || currentTool === "cut") {
    if (direction && areaDrawn) {
      eventToEnable = "resize";
      pointerPosition = {
        x: x - area.x,
        y: y - area.y
      };
    }
    else if ((event.ctrlKey || isMobile) && areaDrawn && isInsideArea(x, y)) {
      eventToEnable = "move";
      pointerPosition = {
        x: x - area.x,
        y: y - area.y
      };
    }
    else {
      eventToEnable = "select";
      pointerPosition = { x, y };
      resetArea({ x, y });
    }
  }
  else if (currentTool === "pan") {
    eventToEnable = "drag";
    transformedPointerPosition = getTransformedPoint(x, y);
  }
  editorElement.style.userSelect = "none";
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.removeEventListener("pointermove", changeCursor);
}

function handlePointerMove({ clientX, clientY }) {
  if (handlingMove || !eventToEnable) {
    return;
  }
  handlingMove = true;

  const x = clientX > 0 ? clientX : 0;
  const y = clientY > 0 ? clientY : 0;

  switch (eventToEnable) {
    case "select":
      selectArea(x, y);
      break;
    case "resize":
      resizeArea(x, y);
      break;
    case "move":
      moveArea(x, y);
      break;
    case "drag":
      dragImage(x, y);
      break;
  }
  requestAnimationFrame(() => {
    drawCanvas();
    handlingMove = false;
  });
}

function handlePointerUp() {
  const area = getArea();

  pointerPosition = null;
  transformedPointerPosition = null;
  editorElement.style.userSelect = "auto";

  if (hasArea()) {
    normalizeArea();

    if (area.x < 0) {
      area.width += area.x;
      area.x = 0;
    }
    else if (area.x + area.width > canvas.width) {
      area.width = canvas.width - area.x;
    }

    if (area.y < 0) {
      area.height += area.y;
      area.y = 0;
    }
    else if (area.y + area.height > canvas.height) {
      area.height = canvas.height - area.y;
    }

    if (currentTool === "select" || currentTool === "cut") {
      allowCropAreaModification();
    }

    if (eventToEnable) {
      requestAnimationFrame(drawCanvas);
    }
  }
  else {
    resetCanvas();
  }
  eventToEnable = "";
  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", handlePointerUp);
}

function handleDoubleClick() {
  const area = getArea();
  const areaDrawn = hasArea();

  if (!areaDrawn) {
    return;
  }
  const { a: scale, e: translateX, f: translateY } = getTransform();
  const direction = getDirection().split("");

  if (direction.includes("w")) {
    const width = area.width + area.x;

    if (translateX < 0) {
      area.x = 0;
      area.width = width;
    }
    else {
      area.x = translateX;
      area.width = width - translateX;
    }
  }
  else if (direction.includes("e")) {
    const imageRight = translateX + canvasImage.width * scale;

    if (imageRight > canvas.width) {
      area.width = canvas.width - area.x;
    }
    else {
      area.width = imageRight - area.x;
    }
  }

  if (direction.includes("n")) {
    const height = area.height + area.y;

    if (translateY < 0) {
      area.y = 0;
      area.height = height;
    }
    else {
      area.y = translateY;
      area.height = height - translateY;
    }
  }
  else if (direction.includes("s")) {
    const imageBottom = translateY + canvasImage.height * scale;

    if (imageBottom > canvas.height) {
      area.height = canvas.height - area.y;
    }
    else {
      area.height = imageBottom - area.y;
    }
  }
  area.width = Math.floor(area.width);
  area.height = Math.floor(area.height);

  requestAnimationFrame(drawCanvas);
}

function resetCanvas() {
  keepMask = false;
  areaWithGrid = false;
  drawImage(canvas.getContext("2d"));
  setCanvasCursor();
  resetCropPanelInputs();
  cropBtnElement.classList.remove("visible");
  window.removeEventListener("pointermove", changeCursor);
}

function allowCropAreaModification() {
  cropBtnElement.classList.add("visible");
  window.addEventListener("pointermove", changeCursor);
}

function changeCursor(event) {
  const { clientX: x, clientY: y } = event;

  if (event.ctrlKey) {
    setCanvasCursor(isInsideArea(x, y) ? "move" : "default");
  }
  else {
    const direction = setDirection(x, y);

    setCanvasCursor(direction ? `${direction}-resize` : "default");
  }
}

function selectArea(x, y) {
  const area = getArea();

  area.width = x - pointerPosition.x;
  area.height = y - pointerPosition.y;

  if (area.width < 0) {
    area.width *= -1;
    area.x = x;
  }

  if (area.height < 0) {
    area.height *= -1;
    area.y = y;
  }

  if (snapArea) {
    snapDynamicArea(x, y, area);
  }
}

function resizeArea(x, y) {
  const area = getArea();
  const direction = getDirection();

  if (direction[0] === "n") {
    area.height = area.y - y + area.height;
    area.y = y;

    if (area.height < 0) {
      const dir = setDirectionString("s");
      setCanvasCursor(`${dir}-resize`);

      area.height *= -1;
      area.y -= area.height;
    }
  }
  else if (direction[0] === "s") {
    area.height = y - area.y;

    if (area.height < 0) {
      const dir = setDirectionString("n");
      setCanvasCursor(`${dir}-resize`);

      area.height *= -1;
      area.y -= area.height;
    }
  }

  if (direction.includes("w")) {
    area.width = area.x - x + area.width;
    area.x = x;

    if (area.width < 0) {
      const dir = setDirectionString("e");
      setCanvasCursor(`${dir}-resize`);

      area.width *= -1;
      area.x -= area.width;
    }
  }
  else if (direction.includes("e")) {
    area.width = x - area.x;

    if (area.width < 0) {
      const dir = setDirectionString("w");
      setCanvasCursor(`${dir}-resize`);

      area.width *= -1;
      area.x -= area.width;
    }
  }

  if (snapArea) {
    snapDynamicArea(x, y, area);
  }
}

function snapDynamicArea(x, y, area) {
  const { a: scale, e: translateX, f: translateY } = getTransform();
  const margin = 8;
  const areaRight = area.x + area.width;
  const areaBottom = area.y + area.height;
  const imageRight = translateX + canvasImage.width * scale;
  const imageBottom = translateY + canvasImage.height * scale;

  if (x + margin > translateX && x - margin < translateX) {
    area.width = area.width + x - translateX;
    area.x = translateX;
  }
  else if (areaRight + margin > imageRight && areaRight - margin < imageRight) {
    area.width = imageRight - area.x;
  }

  if (y + margin > translateY && y - margin < translateY) {
    area.height = area.height + y - translateY;
    area.y = translateY;
  }
  else if (areaBottom + margin > imageBottom && areaBottom - margin < imageBottom) {
    area.height = imageBottom - area.y;
  }
}

function updatePoint(point, pointName, dimensionName, offset, scale) {
  const area = getArea();
  const diff = point - pointerPosition[pointName];
  const scaledDimension = canvasImage[dimensionName] * scale;
  const areaDimension = area[dimensionName];

  if (offset + 8 > diff && offset - 8 < diff) {
    area[pointName] = offset;
  }
  else if (offset + 8 + scaledDimension > diff + areaDimension && offset - 8 + scaledDimension < diff + areaDimension) {
    area[pointName] = offset + scaledDimension - areaDimension;
  }
  else {
    area[pointName] = diff;
  }
}

function moveArea(x, y) {
  if (snapArea) {
    const { a: scale, e, f } = getTransform();

    updatePoint(x, "x", "width", e, scale);
    updatePoint(y, "y", "height", f, scale);
  }
  else {
    const area = getArea();

    area.x = x - pointerPosition.x;
    area.y = y - pointerPosition.y;
  }
}

function dragImage(x, y) {
  if (transformedPointerPosition) {
    const pt = getTransformedPoint(x, y);

    translateContext(pt.x - transformedPointerPosition.x, pt.y - transformedPointerPosition.y);
  }
}

function loadImageFile(blobUrl) {
  keepMask = false;

  resetRotation();
  resetArea();

  canvasImage.onload = function() {
    scaleImageToFitCanvas(canvasImage);
  };
  canvasImage.src = blobUrl;
  // disableCutMode();
}

function getImageData(image, area, ctx) {
  drawImage(ctx, image);
  return ctx.getImageData(area.x, area.y, area.width, area.height);
}

function getCroppedCanvas(image) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const { a: scale, e: x, f: y } = getTransform();
  const translated = {
    x: x / scale,
    y: y / scale
  };
  const area = getArea();
  const transformedArea = {
    x: Math.round(area.x / scale),
    y: Math.round(area.y / scale),
    width: Math.round(area.width / scale),
    height: Math.round(area.height / scale)
  };
  canvas.width = Math.round(canvasWidth / scale);
  canvas.height = Math.round(canvasHeight / scale);
  ctx.translate(translated.x, translated.y);

  if (transformedArea.x < translated.x) {
    transformedArea.width = transformedArea.width - (translated.x - transformedArea.x);
    transformedArea.x = translated.x;
  }
  const tAreaRight = transformedArea.x + transformedArea.width;
  const imageRight = translated.x + image.width;

  if (tAreaRight > imageRight) {
    transformedArea.width = transformedArea.width - (tAreaRight - imageRight);
  }

  if (transformedArea.y < translated.y) {
    transformedArea.height = transformedArea.height - (translated.y - transformedArea.y);
    transformedArea.y = translated.y;
  }
  const tAreaBottom = transformedArea.y + transformedArea.height;
  const imageBottom = translated.y + image.height;

  if (tAreaBottom > imageBottom) {
    transformedArea.height = transformedArea.height - (tAreaBottom - imageBottom);
  }

  const imageData = getImageData(image, transformedArea, ctx);
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function getCanvasSlice(image, type) {
  return new Promise(resolve => {
    const croppedCanvas = getCroppedCanvas(image);

    croppedCanvas.toBlob(blob => {
      resolve({
        file: blob,
        width: croppedCanvas.width,
        height: croppedCanvas.height
      });
    }, type, 1);
  });
}

function enableViewportResizeHandler() {
  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      resetCanvasProperties();
      drawCanvas();
    });
  });
}

function resetCurrentTool() {
  if (currentTool) {
    const currentToolElement = document.querySelector(`[data-tool=${currentTool}]`);

    if (currentToolElement) {
      currentToolElement.classList.remove("selected");
    }
    currentTool = "";
  }
}

function handleCutToolSelection(prevTool) {
  if (prevTool === "cut") {
    resetArea();
    resetCanvas();
  }
  else if (areaWithGrid) {
    allowCropAreaModification();
  }
  else {
    const halfWidth = canvasWidth / 2;
    const halfHeight = canvasHeight / 2;
    const areaHalfWidth = Math.min(halfWidth, 150);
    const areaHalfHeight = Math.min(halfHeight, 150);
    const startPos = { x: halfWidth - areaHalfWidth, y: halfHeight - areaHalfHeight };
    pointerPosition = startPos;

    resetArea(startPos);
    selectArea(halfWidth + areaHalfWidth, halfHeight + areaHalfHeight);
    allowCropAreaModification();
    drawCanvas();
  }
}

cropBtnElement.addEventListener("click", () => {
  const { file, blobUrl } = getActiveImage();
  const image = new Image();

  image.onload = async function() {
    if (currentTool === "cut") {
      const canvasSlice = await getCanvasSlice(image, file.type);
      const newFile = new File([canvasSlice.file], getUniqueImageName(file.name), { type: file.type });

      await readImages([newFile]);

      const images = getImages();
      const index = images.length - 1;
      const { blobUrl } = images[index];

      resetFlip();
      loadImageFile(blobUrl);
      setActiveImage(index);
    }
    else {
      renderAddedFolderImage({
        name: getUniqueImageName(file.name),
        type: file.type,
        ...await getCanvasSlice(image, file.type)
      });
    }
  };
  image.src = blobUrl;
});

document.getElementById("js-left-bar").addEventListener("click", event => {
  const toolElement = event.target.closest("[data-tool]");

  if (!toolElement) {
    return;
  }
  const tool = toolElement.getAttribute("data-tool");
  const prevTool = currentTool;

  resetCurrentTool();

  if (prevTool !== tool && tool !== "reset") {
    toolElement.classList.add("selected");
    currentTool = tool;
  }

  if (tool === "pan") {
    window.removeEventListener("pointermove", changeCursor);
  }
  else if (tool === "select") {
    if (prevTool !== "pan" || areaWithGrid) {
      resetArea();
      resetCanvas();
    }
  }
  else if (tool === "cut") {
    handleCutToolSelection(prevTool);
  }
  else if (tool === "reset") {
    resetArea();
    resetCanvas();
  }
});

document.getElementById("js-snap-checkbox").addEventListener("change", event => {
  snapArea = event.target.checked;
});

window.addEventListener("keydown", (event) => {
  if (event.key === "a" && event.ctrlKey) {
    const area = getArea();
    const { a: scale, e: x, f: y } = getTransform();
    const { width, height } = canvasImage;

    area.x = x;
    area.y = y;
    area.width = width * scale;
    area.height = height * scale;

    requestAnimationFrame(drawCanvas);
    allowCropAreaModification();
    event.preventDefault();
  }
  else if (event.key === "Escape") {
    resetArea();
    resetCanvas();
  }
});

export {
  initCanvas,
  getCanvasElement,
  getCanvasDimensions,
  resetCanvasDimensions,
  drawCanvas,
  allowCropAreaModification,
  loadImageFile
};
