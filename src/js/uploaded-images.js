import { getElementByAttr, getFileSizeString } from "./utils.js";
import { initCanvas, loadImageFile } from "./canvas";
import { resetCropPanelInputs } from "./crop-panel";
import { resetFlip } from "./flip";

const modalElement = document.getElementById("js-top-bar-upload-panel");
const fileInputElement = document.getElementById("js-uploaded-images-file-input");
const images = [];
let activeImageIndex = 0;
let activeListItem = null;

function getActiveImage() {
  return images[activeImageIndex];
}

function getImages() {
  return images;
}

function setActiveImage(index) {
  const element = document.getElementById("js-uploaded-images-list").children[index];
  const image = images[index];

  activeImageIndex = index;

  updateImagePreview(image);
  highlightImage(element);
  setDocumentTitle(image.name);
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
    <div class="uploaded-images-preview-info">${image.width}x${image.height} | ${image.sizeString}</div>
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
        sizeString: getFileSizeString(file.size),
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
      resetCropPanelInputs();
    }
    resetFlip();
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

document.addEventListener("paste", async event => {
  const clipboardItems = typeof navigator?.clipboard?.read === "function" ? await navigator.clipboard.read() : event.clipboardData.files;
  const blobs = [];

  event.preventDefault();

  for (const clipboardItem of clipboardItems) {
    // For files from `e.clipboardData.files`.
    if (clipboardItem.type?.startsWith("image/")) {
      blobs.push(clipboardItem);
    } else {
      // For files from `navigator.clipboard.read()`.
      const imageTypes = clipboardItem.types?.filter(type => type.startsWith("image/"));

      for (const imageType of imageTypes) {
        const blob = await clipboardItem.getType(imageType);

        blobs.push(blob);
      }
    }
  }

  if (blobs.length) {
    readImages(blobs);
  }
});

if ("launchQueue" in window && "files" in window.LaunchParams.prototype) {
  window.launchQueue.setConsumer(async launchParams => {
    if (!launchParams.files.length) {
      return;
    }
    const blobs = [];

    for (const fileHandle of launchParams.files) {
      const blob = await fileHandle.getFile();

      blobs.push(blob);
    }

    if (blobs.length) {
      readImages(blobs);
    }
  });
}

export {
  getImages,
  readImage,
  readImages,
  getActiveImage,
  setActiveImage
};
