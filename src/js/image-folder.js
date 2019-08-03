import { getElementByAttr } from "./utils.js";
import { postMessageToWorker } from "./web-worker.js";

const listElement = document.getElementById("js-image-folder-list");
const images = [];

function renderAddedFolderImage(image) {
  const length = images.push(image);

  listElement.insertAdjacentHTML("beforeend", `
    <li class="image-folder-list-item" data-index="${length - 1}">
      <button class="image-folder-enlarge-btn" data-type="enlarge" title="Enlarge">
        <image src=${URL.createObjectURL(image.file)} class="image-folder-list-item-image" alt="">
      </button>
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
  const { file } = images[index];

  document.getElementById("js-editor").insertAdjacentHTML("beforeend", `
    <div id="js-image-folder-viewer" class="js-right-bar-item image-folder-viewer">
      <img src="${URL.createObjectURL(file)}" class="image-folder-viewer-image" alt="">
      <button id="js-image-folder-viewer-close-btn" class="icon-btn-round image-folder-viewer-close-btn" title="Close">
        <svg viewBox="0 0 24 24">
          <use href="#close"></use>
        </svg>
      </button>
    </div>
  `);

  document.getElementById("js-image-folder-viewer-close-btn").addEventListener("click", removeFolderImageViewer, { once: true });
  document.getElementById("js-image-folder-viewer").addEventListener("click", handleContainerClick);
}

function handleContainerClick(event) {
  if (event.target === event.currentTarget) {
    removeFolderImageViewer();
  }
}

function removeFolderImageViewer() {
  const element = document.getElementById("js-image-folder-viewer");

  element.removeEventListener("click", handleContainerClick);
  element.remove();
}

function updateFolderImageList() {
  if (images.length === 0) {
    document.getElementById("js-image-folder-message").classList.remove("hidden");
    listElement.classList.remove("visible");
  }
  else {
    const listItems = [...listElement.children];

    listItems.forEach((item, index) => {
      item.setAttribute("data-index", index);
    });
  }
}

listElement.addEventListener("click", ({ target, currentTarget }) => {
  const buttonElement = getElementByAttr("data-type", target, currentTarget);

  if (!buttonElement) {
    return;
  }
  const listItemElement = getElementByAttr("data-index", target, currentTarget);
  const { attrValue: index } = listItemElement;
  const { attrValue: type } = buttonElement;

  if (type === "enlarge") {
    showFolderImageViewer(index);
  }
  else if (type === "remove") {
    listItemElement.elementRef.remove();
    images.splice(index, 1);
    updateFolderImageList();
  }
});

document.getElementById("js-image-folder-download-btn").addEventListener("click", () => {
  postMessageToWorker(images);
});

export {
  renderAddedFolderImage
};
