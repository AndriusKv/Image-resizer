import { getElementByAttr } from "./utils.js";
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
  const [image] = images;

  updateImagePreview(image);
  highlightImage(document.querySelector(".uploaded-images-list-item"));
  setDocumentTitle(image.name);
  initCanvas(image.blobUrl);
}

function updateImagePreview(image) {
  const element = document.getElementById("js-uploaded-images-preview");

  element.innerHTML = `
    <div class="uploaded-images-preview-info">${image.name}</div>
    <div class="uploaded-images-preview-info">${image.width}x${image.height}</div>
    <img src="${image.blobUrl}" class="uploaded-images-preview-image" alt="">
  `;
}

function readImage(file) {
  return new Promise(resolve => {
    const image = new Image();
    const blobUrl = URL.createObjectURL(file);

    image.onload = function() {
      resolve({
        file,
        blobUrl,
        name: file.name,
        type: file.type,
        width: image.width,
        height: image.height,
        aspectRatio: image.width / image.height
      });
    };
    image.src = blobUrl;
  });
}

async function readImages(imagesToRead) {
  const [imageToRead] = imagesToRead.splice(0, 1);
  const image = await readImage(imageToRead);

  images.push(image);
  renderUploadedImage(image);
  indicateImageUpload();

  if (imagesToRead.length) {
    readImages(imagesToRead);
  }
  else if (!activeListItem) {
    doneReadingImages();
  }
}

function indicateImageUpload() {
  const element = document.createElement("div");

  element.classList.add("ping");
  element.style.setProperty("--delay", `${Math.random() * 2}s`);
  document.getElementById("js-top-bar-upload-btn-container").appendChild(element);
  setTimeout(() => {
    element.remove();
  }, 4000);
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
          <img src="${image.blobUrl}" class="uploaded-images-list-image">
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
    const { file, blobUrl } = images[index];

    if (index !== activeImageIndex) {
      activeImageIndex = index;
      updateImagePreview(images[index]);
      highlightImage(element.elementRef);
      setDocumentTitle(file.name);
    }
    loadImageFile(blobUrl);
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
