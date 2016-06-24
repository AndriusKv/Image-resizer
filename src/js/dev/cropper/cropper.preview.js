const cropPreview = document.getElementById("js-crop-preview");
const imageContainer = cropPreview.firstElementChild;

function showPreview(uri) {
    const image = new Image();

    image.onload = function() {
        let width = image.width;
        let height = image.height;
        const maxWidth = window.innerWidth - 8;
        const maxHeight = window.innerHeight - 8;
        const ratio = width / height;

        if (width > maxWidth) {
            width = maxWidth;
            height = Math.floor(width / ratio);
        }

        if (height > maxHeight) {
            height = maxHeight;
            width = Math.floor(height * ratio);
        }

        image.style.width = `${width}px`;
        image.style.height = `${height}px`;
    };
    image.src = uri;
    imageContainer.appendChild(image);
    cropPreview.classList.add("show");
}

function hidePreview() {
    cropPreview.classList.remove("show");

    // remove preview image after animation finished running.
    setTimeout(() => {
        imageContainer.removeChild(imageContainer.lastElementChild);
    }, 600);
}

document.getElementById("js-crop-preview-close").addEventListener("click", hidePreview);

export {
    showPreview as show
};
