const images = [];

function getAllCroppedImages() {
    return images;
}

function getCroppedImage(index) {
    return images[index];
}

function addCroppedImage(image) {
    images.unshift(image);
}

function removeCroppedImage(index) {
    images.splice(index, 1);
}

function removeCroppedImages() {
    images.length = 0;
}

export {
    getAllCroppedImages,
    getCroppedImage,
    addCroppedImage,
    removeCroppedImage,
    removeCroppedImages
};
