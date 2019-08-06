import { getRotation, resetRotation } from "./rotation.js";
import { applyScaleMultiplier, scaleImageToFitCanvas } from "./zoom.js";
import { getUniqueImageName, renderAddedFolderImage } from "./image-folder.js";
import { getActiveImage } from "./uploaded-images.js";
import { getArea, resetArea, isMouseInsideArea, setDirection, getDirection } from "./area.js";
import { setTransformContext, getTransform, setTransform, translateContext, getTransformedPoint } from "./transform.js";

const canvasImage = new Image();
const editorElement = document.getElementById("js-editor");
const cropBtnElement = document.getElementById("js-crop-btn");
let initialized = false;
let canvas = null;
let canvasWidth = 0;
let canvasHeight = 0;
let eventToEnable = "";
let keepMask = false;

const mousePosition = (function() {
  let mousePosition = null;

  function setPosition(position) {
    mousePosition = position;
  }

  function getPosition() {
    return mousePosition;
  }

  return {
    set: setPosition,
    get: getPosition
  };
})();

function initCanvasElement(blobUrl) {
  canvas = document.getElementById("js-canvas");
  setTransformContext(canvas.getContext("2d"));
  resetCanvasDimensions();
  loadImageFile(blobUrl);
  canvas.addEventListener("wheel", handleScroll, { passive: true });
  canvas.addEventListener("mousedown", handleMousedown);
}

function initCanvas(blobUrl) {
  if (initialized) {
    return;
  }
  initialized = true;
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

function drawImage(ctx) {
  const radians = getRotation();
  const w = canvasImage.width / 2;
  const h = canvasImage.height / 2;

  clearCanvas(ctx);
  ctx.save();
  ctx.translate(w, h);
  ctx.rotate(radians);
  ctx.translate(-w, -h);
  ctx.drawImage(canvasImage, 0, 0, canvasImage.width, canvasImage.height);
  ctx.restore();
}

function drawArea(ctx) {
  const area = getArea();
  const areaWidth = area.width;
  const areaHeight = area.height;
  let x = area.x;
  let y = area.y;
  let imageData;

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#006494";
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (areaWidth && areaHeight) {
    imageData = ctx.getImageData(x, y, areaWidth, areaHeight);

    if (areaWidth < 0) {
      x += areaWidth;
    }

    if (areaHeight < 0) {
      y += areaHeight;
    }
  }

  if (areaWidth || areaHeight || keepMask) {
    addMask(ctx);
  }

  if (imageData) {
    ctx.putImageData(imageData, x, y);
  }
  ctx.strokeRect(area.x + 0.5, area.y + 0.5, areaWidth, areaHeight);
  ctx.restore();
}

function drawCanvas() {
  const ctx = canvas.getContext("2d");

  drawImage(ctx);
  drawArea(ctx);
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

function handleMousedown(event) {
  if (event.which !== 1) {
    return;
  }
  const { clientX: x, clientY: y } = event;
  const area = getArea();
  const areaDrawn = area.width && area.height;
  const direction = setDirection(x, y);
  eventToEnable = "select";
  keepMask = areaDrawn;

  if (event.shiftKey) {
    mousePosition.set(getTransformedPoint(x, y));
    eventToEnable = "drag";
  }
  else if (event.ctrlKey && areaDrawn && isMouseInsideArea(x, y)) {
    mousePosition.set({
      x: x - area.x,
      y: y - area.y
    });
    eventToEnable = "move";
  }
  else if (direction && areaDrawn) {
    eventToEnable = "resize";
  }
  else {
    resetArea({ x, y });
  }
  requestAnimationFrame(drawCanvas);
  cropBtnElement.classList.remove("visible");
  editorElement.style.userSelect = "none";
  window.addEventListener("mousemove", handleMousemove);
  window.addEventListener("mouseup", handleMouseup);
  window.removeEventListener("mousemove", changeCursor);
  window.removeEventListener("keydown", changeCursorToMove);
}

function handleMousemove(event) {
  const { clientX: x, clientY: y } = event;

  switch (eventToEnable) {
    case "select":
      selectArea(x, y);
      break;
    case "resize":
      resizeArea(x, y);
      break;
    case "move":
      if (!event.ctrlKey) {
        return;
      }
      moveArea(x, y);
      break;
    case "drag":
      if (!event.shiftKey) {
        return;
      }
      dragImage(x, y);
      break;
  }
  requestAnimationFrame(drawCanvas);
}

function handleMouseup() {
  const area = getArea();
  eventToEnable = "";
  editorElement.style.userSelect = "auto";

  if (area.width && area.height) {
    cropBtnElement.classList.add("visible");
    window.addEventListener("mousemove", changeCursor);
    window.addEventListener("keydown", changeCursorToMove);
  }
  else {
    keepMask = false;
    drawImage(canvas.getContext("2d"));
    resetCanvasCursor();
  }
  window.removeEventListener("mousemove", handleMousemove);
  window.removeEventListener("mouseup", handleMouseup);
}

function resetCanvasCursor() {
  setCanvasCursor();
}

function changeCursorToMove(event) {
  const mousePos = mousePosition.get();

  if (mousePos && event.ctrlKey && isMouseInsideArea(mousePos.x, mousePos.y)) {
    setCanvasCursor("move");
    window.addEventListener("keyup", resetCanvasCursor, { once: true });
  }
}

function changeCursor(event) {
  const { clientX: x, clientY: y } = event;

  if (event.ctrlKey) {
    setCanvasCursor(isMouseInsideArea(x, y) ? "move" : "default");
  }
  else {
    const direction = setDirection(x, y);

    setCanvasCursor(direction ? `${direction}-resize` : "default");
  }
}

function selectArea(x, y) {
  const area = getArea();
  area.width = x - area.x;
  area.height = y - area.y;
}

function resizeArea(x, y) {
  const area = getArea();
  const direction = getDirection();

  if (direction[0] === "n") {
    area.height = area.y - y + area.height;
    area.y = y;
  }
  else if (direction[0] === "s") {
    area.height = y - area.y;
  }

  if (direction.includes("w")) {
    area.width = area.x - x + area.width;
    area.x = x;
  }
  else if (direction.includes("e")) {
    area.width = x - area.x;
  }
}

function moveArea(x, y) {
  const area = getArea();
  const mousePos = mousePosition.get();
  area.x = x - mousePos.x;
  area.y = y - mousePos.y;
}

function dragImage(x, y) {
  const mousePos = mousePosition.get();

  if (mousePos) {
    const pt = getTransformedPoint(x, y);

    translateContext(pt.x - mousePos.x, pt.y - mousePos.y);
  }
}

function loadImageFile(blobUrl) {
  keepMask = false;
  cropBtnElement.classList.remove("visible");

  resetRotation();
  resetArea();
  canvasImage.onload = function() {
    scaleImageToFitCanvas(canvasImage);
  };
  canvasImage.src = blobUrl;
}

function getImageData(image, area, ctx) {
  const radians = getRotation();

  ctx.save();

  if (radians) {
    const centerX = image.width / 2;
    const centerY = image.height / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate(radians);
    ctx.translate(-centerX, -centerY);
  }
  ctx.drawImage(image, 0, 0, image.width, image.height);
  ctx.restore();
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
    }, type);
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

cropBtnElement.addEventListener("click", () => {
  const { file, blobUrl } = getActiveImage();
  const image = new Image();

  image.onload = async function() {
    renderAddedFolderImage({
      name: getUniqueImageName(file.name),
      type: file.type,
      ...await getCanvasSlice(image, file.type)
    });
  };
  image.src = blobUrl;
});


export {
  initCanvas,
  getCanvasElement,
  getCanvasDimensions,
  resetCanvasDimensions,
  drawCanvas,
  loadImageFile
};
