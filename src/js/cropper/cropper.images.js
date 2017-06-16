let images = [];
let active = null;

function getAll() {
    return images;
}

function set(loadedImages) {
    images = loadedImages.map((image, index) => {
        image.index = index;
        return image;
    });
}

function setActive(image) {
    active = image;
}

function getActive() {
    return active;
}

function getByIndex(index) {
    return images[index];
}

export {
    getAll,
    set,
    setActive,
    getActive,
    getByIndex
};
