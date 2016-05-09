const images = [];
let storedImageCount = 0;

function getAll() {
    return images;
}

function getFirst() {
    return images[0];
}

function getImageCount() {
    return images.length;
}

function removeImage(index) {
    return images.splice(index, 1)[0];
}

function addImage(image) {
    images.push(image);
}

function resetImages() {
    images.length = 0;
}

function incStoredImageCount() {
    storedImageCount += 1;
}

function getStoredImageCount() {
    return storedImageCount;
}

function resetStoredImageCount() {
    storedImageCount = 0;
}

export {
    addImage as add,
    removeImage as remove,
    getImageCount as getCount,
    resetImages as reset,
    getAll,
    getFirst,
    incStoredImageCount,
    getStoredImageCount,
    resetStoredImageCount
};
