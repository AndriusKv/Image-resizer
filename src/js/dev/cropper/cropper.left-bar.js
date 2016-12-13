import * as images from "./cropper.images.js";
import * as cropper from "./cropper.js";

const thumbnails = document.getElementById("js-left-bar-thumbnails");
let visible = true;

function init(loadedImages) {
    thumbnails.innerHTML = loadedImages.map(image =>
        `<li class="left-bar-thumbnail" data-index="${image.index}">
            <img src="${image.uri}" class="left-bar-thumbnail-image">
        </li>`
    ).join("\n");
    setActiveThumbnail(0, thumbnails.children);
}

function toggle() {
    const leftBar = document.getElementById("js-crop-left-bar");

    leftBar.classList.toggle("hidden");
    visible = !leftBar.classList.contains("hidden");
}

function isVisible() {
    return visible;
}

function removeActiveThumbnail(thumbnails) {
    Array.from(thumbnails).forEach(thumbnail => {
        thumbnail.classList.remove("active");
    });
}

function setActiveThumbnail(index, thumbnails) {
    const image = images.getByIndex(index);

    cropper.loadNextImage(image);
    images.setActive(image);
    thumbnails[index].classList.add("active");
}

function getElementByAttr(element, attr, parentElement) {
    while (element !== parentElement) {
        const attrValue = element.getAttribute(attr);

        if (attrValue) {
            return { element, attrValue };
        }
        element = element.parentElement;
    }
}

thumbnails.addEventListener("click", ({ target }) => {
    const thumbnail = getElementByAttr(target, "data-index", thumbnails);

    if (thumbnail && !thumbnail.element.classList.contains("active")) {
        removeActiveThumbnail(thumbnails.children);
        setActiveThumbnail(thumbnail.attrValue, thumbnails.children);
    }
});

export {
    init,
    toggle,
    isVisible
};
