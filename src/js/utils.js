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

export {
  imageToBlob,
  getElementByAttr
};
