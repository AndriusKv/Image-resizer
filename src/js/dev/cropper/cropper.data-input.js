function getDataElement(name) {
    return document.getElementById(`js-crop-${name}`);
}

function getElementValue(name) {
    const element = getDataElement(name);

    return element.value;
}

function setElementValue(name, value) {
    const element = getDataElement(name);

    if (typeof element.value === "string") {
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

function updatePointDisplay(area) {
    const x = getCoordToUpdate(area.x, area.width);
    const y = getCoordToUpdate(area.y, area.height);

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
    updateDataDisplay as update
};
