let direction = "";

function getDirection() {
    return direction;
}

function getVerticalDirection(direction, inWestBound, inEastBound) {
    if (inWestBound) {
        direction += "w";
    }
    else if (inEastBound) {
        direction += "e";
    }
    return direction;
}

function reverseIntercardinalDirection(direction, area) {
    const x = area.x;
    const y = area.y;
    const x2 = x + area.width;
    const y2 = y + area.height;

    if (x2 > x && y2 < y || x2 < x && y2 > y) {
        return `${direction[0]}${direction[1] === "w" ? "e" :"w"}`;
    }
    return direction;
}

function getRealDirection(x, y, area) {
    const direction = setDirection(x, y, area);

    if (direction.length < 2) {
        return direction;
    }
    return reverseIntercardinalDirection(direction, area);
}

function setDirection(x, y, area) {
    const margin = 4;
    const x2 = area.x;
    const y2 = area.y;
    const x3 = x2 + area.width;
    const y3 = y2 + area.height;
    const inXBound = x >= x2 - margin && x <= x3 + margin || x <= x2 + margin && x >= x3 - margin;
    const inYBound = y >= y2 - margin && y <= y3 + margin || y <= y2 + margin && y >= y3 - margin;

    direction = "";
    if (inXBound && inYBound) {
        const inNorthBound = y >= y2 - margin && y <= y2 + margin;
        const inEastBound = x >= x3 - margin && x <= x3 + margin;
        const inSouthBound = y >= y3 - margin && y <= y3 + margin;
        const inWestBound = x >= x2 - margin && x <= x2 + margin;

        if (inNorthBound) {
            direction = getVerticalDirection("n", inWestBound, inEastBound);
        }
        else if (inSouthBound) {
            direction = getVerticalDirection("s", inWestBound, inEastBound);
        }
        else if (inEastBound) {
            direction = "e";
        }
        else if (inWestBound) {
            direction = "w";
        }
    }
    return direction;
}

export {
    getDirection as get,
    getRealDirection as getReal,
    setDirection as set,
    reverseIntercardinalDirection as reverse
};
