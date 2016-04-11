const defaultQuality = 0.92;
let customQuality = false;
let quality = defaultQuality;

function setImageQuality(newQuality) {
    customQuality = newQuality !== defaultQuality;
    quality = newQuality;
}

function resetImageQuality() {
    customQuality = false;
}

function getImageQuality() {
    return customQuality ? quality : defaultQuality;
}

function useImageWithQuality() {
    return customQuality;
}

export {
    getImageQuality as get,
    setImageQuality as set,
    resetImageQuality as reset,
    useImageWithQuality
};
