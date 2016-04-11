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

function reverseDirection(direction, oppositeDirection, area) {
    const x = area.x;
    const y = area.y;
    const x2 = x + area.width;
    const y2 = y + area.height;

    if (x2 > x) {
        if (y2 < y) {
            return oppositeDirection;
        }
    }
    else if (y2 > y) {
        return oppositeDirection;
    }
    return direction;
}

function getOppositeDirection(x, y, area) {
    const newDirection = setDirection(x, y, area);

    switch (newDirection) {
        case "nw":
            return reverseDirection(newDirection, "ne", area);
        case "ne":
            return reverseDirection(newDirection, "nw", area);
        case "sw":
            return reverseDirection(newDirection, "se", area);
        case "se":
            return reverseDirection(newDirection, "sw", area);
        default:
            return newDirection;
    }
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
    getOppositeDirection as getOpposite,
    setDirection as set,
    reverseDirection as reverse
};
