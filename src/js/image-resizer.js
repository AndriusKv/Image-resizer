import { imageToBlob } from "./utils.js";
import { getUniqueImageName, renderAddedFolderImage } from "./image-folder.js";
import { getActiveImage } from "./uploaded-images.js";

const resizerListElement = document.getElementById("js-resizer-list");

function resizeImage(file, width, height) {
  return new Promise(resolve => {
    const image = new Image();

    image.onload = async function() {
      renderAddedFolderImage({
        name: getUniqueImageName(file.name),
        type: file.type,
        width,
        height,
        file: await imageToBlob(image, file.type, { width, height })
      });
      URL.revokeObjectURL(image.src);
      resolve();
    };
    image.src = URL.createObjectURL(file);
  });
}

document.getElementById("js-resizer-option-btn").addEventListener("click", () => {
  resizerListElement.insertAdjacentHTML("beforeend", `
    <li class="resizer-list-item">
      <label class="resizer-list-option">
        <div class="resizer-list-option-label">Width</div>
        <input type="number" class="input resizer-list-option-input" min="1" data-type="width">
      </label>
      <label class="resizer-list-option">
        <div class="resizer-list-option-label">Height</div>
        <input type="number" class="input resizer-list-option-input" min="1" data-type="height">
      </label>
    </li>
  `);
});

resizerListElement.addEventListener("input", ({ target }) => {
  const { checked } = document.getElementById("js-resizer-aspect-ratio");
  const value = parseInt(target.value || 0, 10);

  if (checked) {
    const type = target.getAttribute("data-type");
    const { aspectRatio } = getActiveImage();
    const otherType = type === "width" ? "height" : "width";
    const inputElement = target.parentElement.parentElement.querySelector(`[data-type=${otherType}]`);

    if (type === "width") {
      inputElement.value = Math.round(value / aspectRatio);
    }
    else {
      inputElement.value = Math.round(value * aspectRatio);
    }
  }
});

document.getElementById("js-resize-btn").addEventListener("click", async () => {
  const { children } = resizerListElement;
  const { file } = getActiveImage();

  for (const element of children) {
    const [{ value: width }, { value: height }] = element.querySelectorAll("input");

    if (width && height) {
      await resizeImage(file, width, height);
    }
  }
});
