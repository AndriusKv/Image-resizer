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
    if (area.width && area.height) {
        x = getCoordToUpdate(x, area.width);
        y = getCoordToUpdate(y, area.height);
    }
    setElementValue("x", Math.floor(x));
    setElementValue("y", Math.floor(y));
}

function updateDimensionDisplay(width, height) {
    width = Math.floor(width);
    height = Math.floor(height);

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
