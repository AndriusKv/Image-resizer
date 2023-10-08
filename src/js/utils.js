function imageToBlob(image, type, { width, height }) {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);
    canvas.toBlob(resolve, type);
  });
}

function getElementByAttr(attr, element, endElement = null) {
  while (element && element !== endElement) {
    if (element.hasAttribute(attr)) {
      return {
        elementRef: element,
        attrValue: element.getAttribute(attr)
      };
    }
    element = element.parentElement;
  }
}

function getFileSizeString(bytes) {
  const suffixes = ["B", "kB", "MB", "GB"];
  let size = bytes;
  let l = 0;

  while (l < suffixes.length) {
    if (size < 1000) {
      break;
    }
    else {
      size /= 1000;
    }
    l += 1;
  }
  size = l > 0 ? size.toFixed(1) : Math.round(size);
  return `${size} ${suffixes[l]}`;
}

export {
  imageToBlob,
  getElementByAttr,
  getFileSizeString
};
