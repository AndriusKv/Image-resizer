import { getElementByAttr, getFileSizeString } from "./utils.js";
import { postMessageToWorker } from "./web-worker.js";

const listElement = document.getElementById("js-image-folder-list");
const bottomElement = document.getElementById("js-image-folder-bottom");
const images = [];
const imageNames = {};
let activeIndex = 0;

function indicateFolderUpdate() {
  const element = document.createElement("div");

  element.classList.add("ping");
  document.querySelector(".top-bar-image-folder-toggle-btn").appendChild(element);
  setTimeout(() => {
    element.remove();
  }, 4000);
}

function getUniqueImageName(fullName) {
  const arr = fullName.split(".");
  const count = imageNames[arr[0]] || 0;
  imageNames[arr[0]] = count + 1;
  arr[0] += `-${count}`;
  return arr.join(".");
}

function renderAddedFolderImage(image) {
  const countElement = document.getElementById("js-image-folder-item-count");
  const length = images.push(image);

  countElement.classList.remove("hidden");
  countElement.innerText = length;
  indicateFolderUpdate();

  listElement.insertAdjacentHTML("beforeend", `
    <li class="image-folder-list-item" data-index="${length - 1}">
      <button class="image-folder-enlarge-btn" data-type="enlarge" title="Enlarge">
        <image src=${URL.createObjectURL(image.file)} class="image-folder-list-item-image" alt="">
      </button>
      <input type="checkbox" class="image-folder-checkbox">
      <button class="image-folder-remove-btn" data-type="remove" title="Remove">
        <svg viewBox="0 0 24 24">
          <use href="#remove"></use>
        </svg>
      </button>
    </li>
  `);
  document.getElementById("js-image-folder-message").classList.add("hidden");
  listElement.classList.add("visible");
}

function showFolderImageViewer(index) {
  const image = images[index];
  const url = URL.createObjectURL(image.file);

  document.getElementById("js-editor").insertAdjacentHTML("beforeend", `
    <div id="js-image-folder-viewer" class="js-top-bar-item image-folder-viewer">
      <div id="js-image-folder-viewer-header" class="image-folder-viewer-header">${getImageViewerHeader(image, index)}</div>
      <img src="${url}" id="js-image-folder-viewer-image" class="image-folder-viewer-image" alt="">
      <div class="image-folder-viewer-footer">
        <a href="${url}" id="js-image-folder-viewer-image-link" class="icon-btn-round" target="_blank" title="Open image in a new tab">
          <svg viewBox="0 0 24 24">
            <use href="#open-in-new"></use>
          </svg>
        </a>
        <button class="icon-btn-round" data-type="previous" title="Previous image">
          <svg viewBox="0 0 24 24">
            <use href="#arrow-left"></use>
          </svg>
        </button>
        <button class="icon-btn-round" data-type="next" title="Next image">
          <svg viewBox="0 0 24 24">
            <use href="#arrow-right"></use>
          </svg>
        </button>
        <button class="icon-btn-round" data-type="remove" title="Remove image">
          <svg viewBox="0 0 24 24">
            <use href="#remove"></use>
          </svg>
        </button>
      </div>
      <button class="icon-btn-round image-folder-viewer-close-btn" data-type="close" title="Close">
        <svg viewBox="0 0 24 24">
          <use href="#close"></use>
        </svg>
      </button>
    </div>
  `);
  document.getElementById("js-image-folder-viewer").addEventListener("click", handleContainerClick);
  window.addEventListener("keydown", handleKeydown);
}

function getImageViewerHeader(image, index) {
  const size = getFileSizeString(image.file.size);
  return `${image.name} | ${index + 1} / ${images.length} | ${image.width}x${image.height} | ${size}`;
}

function handleKeydown({ key }) {
  if (key === "ArrowRight") {
    changeImage(1);
  }
  else if (key === "ArrowLeft") {
    changeImage(-1);
  }
  else if (key === "Delete") {
    removeImageViewerItem();
  }
}

function changeImage(direction) {
  if (direction === 1) {
    activeIndex = (activeIndex + 1) % images.length;
  }
  else if (direction === -1) {
    activeIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
  }
  loadImage(activeIndex);
}

function loadImage(index) {
  const image = images[index];
  const url = URL.createObjectURL(image.file);
  const imageElement = document.getElementById("js-image-folder-viewer-image");

  URL.revokeObjectURL(imageElement.src);
  imageElement.src = url;
  document.getElementById("js-image-folder-viewer-image-link").href = url;
  document.getElementById("js-image-folder-viewer-header").textContent = getImageViewerHeader(image, index);
}

function handleContainerClick(event) {
  if (event.target === event.currentTarget) {
    removeImageViewer();
    return;
  }
  const element = getElementByAttr("data-type", event.target, event.currentTarget);

  if (!element) {
    return;
  }
  const { attrValue } = element;

  if (attrValue === "close") {
    removeImageViewer();
  }
  else if (attrValue === "next") {
    changeImage(1);
  }
  else if (attrValue === "previous") {
    changeImage(-1);
  }
  else if (attrValue === "remove") {
    removeImageViewerItem();
  }
}

function removeImageViewerItem() {
  const elements = document.querySelectorAll(".image-folder-list-item");

  elements[activeIndex].remove();
  images.splice(activeIndex, 1);
  updateFolderImageList();

  if (images.length) {
    activeIndex = activeIndex >= images.length - 1 ? images.length - 1 : activeIndex;
    loadImage(activeIndex);
  }
  else {
    removeImageViewer();
  }
}

function removeImageViewer() {
  const element = document.getElementById("js-image-folder-viewer");

  element.removeEventListener("click", handleContainerClick);
  element.remove();
  window.removeEventListener("keydown", handleKeydown);
}

function updateFolderImageList() {
  const countElement = document.getElementById("js-image-folder-item-count");

  if (images.length === 0) {
    document.getElementById("js-image-folder-message").classList.remove("hidden");
    listElement.classList.remove("visible");
    countElement.classList.add("hidden");
  }
  else {
    const listItems = [...listElement.children];
    countElement.innerText = images.length;

    listItems.forEach((item, index) => {
      item.setAttribute("data-index", index);
    });
  }
}

listElement.addEventListener("click", ({ target, currentTarget }) => {
  const listItemElement = getElementByAttr("data-index", target, currentTarget);

  if (!listItemElement) {
    return;
  }
  const buttonElement = getElementByAttr("data-type", target, currentTarget);
  const { attrValue: index, elementRef } = listItemElement;

  if (buttonElement) {
    const { attrValue: type } = buttonElement;

    if (type === "enlarge") {
      activeIndex = parseInt(index, 10);
      showFolderImageViewer(activeIndex);
    }
    else if (type === "remove") {
      elementRef.remove();
      images.splice(index, 1);
      updateFolderImageList();
    }
  }
  else if (target.nodeName === "INPUT") {
    const element = bottomElement.querySelector("[data-type=selected]");

    images[index].selected = target.checked;
    element.disabled = !images.some(image => image.selected);
  }
});

bottomElement.addEventListener("click", ({ target, currentTarget }) => {
  const element = getElementByAttr("data-type", target, currentTarget);

  if (!element) {
    return;
  }

  if (element.attrValue === "all") {
    postMessageToWorker(images);
  }
  else if (element.attrValue === "selected") {
    postMessageToWorker(images.filter(image => image.selected));
  }
});

export {
  getUniqueImageName,
  renderAddedFolderImage
};
