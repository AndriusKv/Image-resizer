let area = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};
let direction = "";

function getArea() {
  return area;
}

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

function setDirection(x, y) {
  const margin = 8;
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

function normalizeArea() {
  if (area.width < 0) {
    area.width *= -1;
    area.x -= area.width;
  }

  if (area.height < 0) {
    area.height *= -1;
    area.y -= area.height;
  }
}

function resetArea(defaults = {}) {
  area = { x: 0, y: 0, width: 0, height: 0, ...defaults };
}

function isInsideArea(x, y) {
  const x2 = area.x;
  const y2 = area.y;
  const x3 = x2 + area.width;
  const y3 = y2 + area.height;
  const inXBound = x >= x2 && x <= x3 || x <= x2 && x >= x3;
  const inYBound = y >= y2 && y <= y3 || y <= y2 && y >= y3;

  return inXBound && inYBound;
}

export {
  getArea,
  normalizeArea,
  resetArea,
  getDirection,
  setDirection,
  isInsideArea
};
