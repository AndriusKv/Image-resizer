let area = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};
let areas = [];
let direction = "";

function getArea() {
  return area;
}

function hasArea() {
  return area.width > 0 && area.height > 0;
}

function getResizeSquares(isMobile) {
  const count = 3;
  const minGap = 2;
  const wantedSize = isMobile ? 24 : 16;
  const currentWidth = Math.round(area.width / count - minGap);
  const currentHeight = Math.round(area.height / count - minGap);
  const width = currentWidth < wantedSize ? currentWidth : wantedSize;
  const height = currentHeight < wantedSize ? currentHeight : wantedSize;
  const directions = ["nw", "w", "sw", "n", "s", "ne", "e", "se"];
  let dirIndex = 0;
  areas = [];

  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      // Skip middle square
      if (i === 1 && j === 1) {
        continue;
      }
      const x = area.x + area.width / 2 * i - (width / 2 * i);
      const y = area.y + area.height / 2 * j - (height / 2 * j);

      areas.push({ x, y, width, height, direction: directions[dirIndex] });
      dirIndex += 1;
    }
  }

  return areas;
}

function getDirection() {
  return direction;
}

function setDirection(x, y) {
  direction = "";

  for (const area of areas) {
    const x2 = area.x;
    const y2 = area.y;
    const x3 = x2 + area.width;
    const y3 = y2 + area.height;

    if (x >= x2 && x <= x3 && y >= y2 && y <= y3) {
      direction = area.direction;
      return direction;
    }
  }
}

function setDirectionString(dir) {
  if (direction.length === 1) {
    direction = dir;
  }
  else if (dir === "n" || dir === "s") {
    direction = dir + direction[1];
  }
  else {
    direction = direction[0] + dir;
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
  hasArea,
  normalizeArea,
  resetArea,
  getResizeSquares,
  getDirection,
  setDirection,
  setDirectionString,
  isInsideArea
};
