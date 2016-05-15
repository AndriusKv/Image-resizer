import * as ratio from "./cropper.ratio.js";

function getDataElement(name) {
    return document.getElementById(`js-crop-${name}`);
}

function getElementValue(name) {
    const element = getDataElement(name);

    return element.value;
}

function setElementValue(name, value) {
    const element = getDataElement(name);

    if (element.value) {
        element.value = value;
    }
    else {
        element.textContent = value;
    }
}

function getCoordToUpdate(coordValue, dimensionValue) {
    if (coordValue) {
        if (dimensionValue > 0) {
            return coordValue;
        }
        return dimensionValue + coordValue;
    }
    return 0;
}

function updatePointDisplay(area, x = area.x, y = area.y) {
    const { width: widthRatio, height: heightRatio } = ratio.get();

    if (area.width && area.height) {
        x = getCoordToUpdate(x, area.width);
        y = getCoordToUpdate(y, area.height);
    }
    setElementValue("x", Math.floor(x * widthRatio));
    setElementValue("y", Math.floor(y * heightRatio));
}

function updateDimensionDisplay(width, height) {
    const { width: widthRatio, height: heightRatio } = ratio.get();

    width = Math.floor(width * widthRatio);
    height = Math.floor(height * heightRatio);

    setElementValue("width", width < 0 ? -width : width);
    setElementValue("height", height < 0 ? -height : height);
}

function updateDataDisplay(area) {
    updatePointDisplay(area);
    updateDimensionDisplay(area.width, area.height);
}

export {
    getElementValue as getValue,
    setElementValue as setValue,
    updatePointDisplay as updatePoint,
    updateDataDisplay as update
};
