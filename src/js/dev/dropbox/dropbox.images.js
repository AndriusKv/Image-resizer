const images = [];

function getAll() {
    return images;
}

function getImageCount() {
    return images.length;
}

function addImage(image) {
    images.push(image);
}

function resetImages() {
    images.length = 0;
}

export {
    addImage as add,
    getImageCount as getCount,
    resetImages as reset,
    getAll
};
