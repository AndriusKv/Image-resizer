import { getElementByAttr } from "./utils.js";
import { hideModal } from "./top-bar.js";
import { initCanvas, loadImageFile } from "./canvas.js";

const modalElement = document.getElementById("js-top-bar-upload-tab");
const fileInputElement = document.getElementById("js-uploaded-images-file-input");
let images = [];
let activeImageIndex = 0;
let activeListItem = null;

function addImages(loadedImages) {
  images = images.concat(loadedImages);
}

function getActiveImage() {
  return images[activeImageIndex];
}

function doneReadingImages() {
  initCanvas(images[0].file);
  setDocumentTitle(images[0].name);
  highlightImage(document.querySelector(".uploaded-images-list-item"));
}

function readImage(file) {
  return new Promise(resolve => {
    const image = new Image();

    image.onload = function() {
      URL.revokeObjectURL(image.src);
      resolve({
        file,
        name: file.name,
        type: file.type,
        width: image.width,
        height: image.height,
        aspectRatio: image.width / image.height
      });
    };
    image.src = URL.createObjectURL(file);
  });
}

async function readImages(imagesToRead) {
  const [imageToRead] = imagesToRead.splice(0, 1);
  const image = await readImage(imageToRead);

  images.push(image);
  renderUploadedImage(image);

  if (imagesToRead.length) {
    readImages(imagesToRead);
  }
  else {
    doneReadingImages();
  }
}

function filterOutNonImages(files) {
  return files.filter(file => file.type.includes("image"));
}

function readFiles(files) {
  const images = filterOutNonImages([...files]);

  if (images.length) {
    readImages(images);
    return;
  }
}

function setDocumentTitle(title) {
  document.title = `${title} | Imagis`;
}

function renderUploadedImage(image) {
  const element = document.getElementById("js-uploaded-images-list");
  const index = images.length - 1;

  element.insertAdjacentHTML("beforeend", `
    <li class="uploaded-images-list-item" data-index="${index}" data-type="image">
        <button class="uploaded-images-list-btn">
          <img src="${URL.createObjectURL(image.file)}" class="uploaded-images-list-image">
        </button>
    </li>
  `);
}

function highlightImage(element) {
  if (activeListItem) {
    activeListItem.classList.remove("active");
  }
  activeListItem = element;
  activeListItem.classList.add("active");
}

function handleFileUpload({ target }) {
  readFiles(target.files);
  target.value = "";
}

fileInputElement.addEventListener("change", handleFileUpload);
document.getElementById("js-intro-file-input").addEventListener("change", handleFileUpload);

modalElement.addEventListener("click", event => {
  const element = getElementByAttr("data-type", event.target, event.currentTarget);

  if (!element) {
    return;
  }

  if (element.attrValue === "image") {
    const index = parseInt(element.elementRef.getAttribute("data-index"), 10);
    const { file } = images[index];
    activeImageIndex = index;

    highlightImage(element.elementRef);
    setDocumentTitle(file.name);
    loadImageFile(file);
    hideModal();
  }
});

document.getElementById("js-intro-file-select-btn").addEventListener("click", () => {
  document.getElementById("js-intro-file-input").click();
});

document.getElementById("js-uploaded-images-upload-btn").addEventListener("click", () => {
  fileInputElement.click();
});

window.addEventListener("drop", event => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
  readFiles(event.dataTransfer.files);
});

window.addEventListener("dragover", event => {
  event.preventDefault();
});

export {
  addImages,
  getActiveImage
};
