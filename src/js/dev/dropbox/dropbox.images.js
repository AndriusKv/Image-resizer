const images = [];

function getAll() {
    return images;
}

function addImage(image) {
    images.push(image);
}

function resetImages() {
    images.length = 0;
}

export {
    addImage as add,
    resetImages as reset,
    getAll
};
