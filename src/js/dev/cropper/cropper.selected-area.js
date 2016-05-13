const area = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
};
const transformedArea = Object.assign({}, area);
let isAreaDrawn = false;

function getArea(transformed) {
    return transformed ? transformedArea : area;
}

function getScaledTransformedArea({ width: widthRatio, height: heightRatio }) {
    return {
        x: Math.floor(transformedArea.x * widthRatio),
        y: Math.floor(transformedArea.y * heightRatio),
        width: Math.floor(transformedArea.width * widthRatio),
        height: Math.floor(transformedArea.height * heightRatio)
    };
}

function getAreaProp(key) {
    return area[key];
}

function setArea(newArea, transformed) {
    if (transformed) {
        Object.assign(transformedArea, newArea);
        return transformedArea;
    }
    Object.assign(area, newArea);
    return area;
}

function setAreaProp(key, value) {
    area[key] = value;
    return value;
}

function setDefaultPos(x, y) {
    setAreaProp("x", x);
    setAreaProp("y", y);
}

function resetArea() {
    area.x = 0;
    area.y = 0;
    area.width = 0;
    area.height = 0;
    Object.assign(transformedArea, area);
    return area;
}

function isMouseInsideArea(area, x, y) {
    const x2 = area.x;
    const y2 = area.y;
    const x3 = x2 + area.width;
    const y3 = y2 + area.height;
    const inXBound = x >= x2 && x <= x3 || x <= x2 && x >= x3;
    const inYBound = y >= y2 && y <= y3 || y <= y2 && y >= y3;

    return inXBound && inYBound;
}

function isMouseInsideRotatedArea(area, x, y, angle) {
    const transaltedX = x - (area.x + area.width / 2);
    const transaltedY = y - (area.y + area.height / 2);
    const sin = Math.sin(-angle);
    const cos = Math.cos(-angle);
    const newX = transaltedX * cos - transaltedY * sin;
    const newY = transaltedX * sin + transaltedY * cos;
    const translatedArea = {
        x: -area.width / 2,
        y: -area.height / 2,
        width: area.width,
        height: area.height
    };

    return isMouseInsideArea(translatedArea, newX, newY);
}

function isInsideArea(area, x, y, angle) {
    if (!angle) {
        return isMouseInsideArea(area, x, y);
    }
    return isMouseInsideRotatedArea(area, x, y, angle);
}

function updateAreaFromInput(input, inputValue, ratio, transform) {
    const scale = transform.a;
    let areaValue = 0;

    transformedArea[input] = inputValue || 0;
    if (input === "x") {
        areaValue = transform.e;
        if (area.width < 0) {
            area.width = -area.width;
        }
    }
    else if (input === "y") {
        areaValue = transform.f;
        if (area.height < 0) {
            area.height = -area.height;
        }
    }
    else if (input === "width") {
        if (area[input] < 0) {
            area.x = area.x + area[input];
        }
    }
    else if (input === "height") {
        if (area[input] < 0) {
            area.y = area.y + area[input];
        }
    }
    area[input] = areaValue + transformedArea[input] / ratio * scale;
}

function containsArea(areaDrawn) {
    isAreaDrawn = areaDrawn;
    return areaDrawn;
}

function isDrawn() {
    return isAreaDrawn;
}

export {
    getArea as get,
    getScaledTransformedArea as getScaled,
    setArea as set,
    getAreaProp as getProp,
    setAreaProp as setProp,
    resetArea as reset,
    isInsideArea as isInside,
    updateAreaFromInput as update,
    setDefaultPos,
    containsArea,
    isDrawn
};
