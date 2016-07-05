import * as cropper from "./cropper.js";
import * as leftBar from "./cropper.left-bar.js";
import * as rightBar from "./cropper.right-bar.js";
import * as transform from "./cropper.canvas-transform.js";
import * as canvasElement from "./cropper.canvas-element.js";
import * as dataInput from "./cropper.data-input.js";
import * as selectedArea from "./cropper.selected-area.js";

function scaleToPoint(x, y, scale) {
    const ctx = canvasElement.getContext();

    transform.translate(ctx, x, y);
    transform.scale(ctx, scale / 100);
    transform.translate(ctx, -x, -y);
}

function scaleImage(x, y, scale) {
    const area = selectedArea.get();

    scaleToPoint(x, y, scale);

    if (area.width && area.height) {
        cropper.updateTransformedArea(area);
    }
    else {
        const { e: translatedX, f: translatedY } = transform.get();

        selectedArea.setProp("x", translatedX);
        selectedArea.setProp("y", translatedY);
    }
    dataInput.setValue("scale", scale);
    requestAnimationFrame(cropper.draw);
}

function adjustScale(scale) {
    if (scale < 10) {
        scale = 10;
    }
    else if (scale > 4000) {
        scale = 4000;
    }
    return scale;
}

function getDimensionScale(scale, imageDimension, canvasDimension) {
    const excess = imageDimension - canvasDimension;

    return scale - 100 / (imageDimension / excess);
}

function getScale(imageDimension1, imageDimension2, canvasDimension1, canvasDimension2) {
    let scale = 100;

    if (imageDimension1 > canvasDimension1) {
        scale = getDimensionScale(scale, imageDimension1, canvasDimension1);

        if (imageDimension2 * scale / 100 > canvasDimension2) {
            scale = getDimensionScale(100, imageDimension2, canvasDimension2);
        }
    }
    return scale;
}

function setDefaultImagePosition(x, y) {
    if (rightBar.isVisible()) {
        x -= 200;
    }
    if (leftBar.isVisible()) {
        x += 100;
    }
    transform.setDefaultTranslation(x / 2, y / 2);
}

function getRealCanvasWidth(width) {
    if (rightBar.isVisible()) {
        width -= 200;
    }
    if (leftBar.isVisible()) {
        width -= 100;
    }
    return width;
}

function scaleImageToFitCanvas(image) {
    const { width: canvasWidth, height: canvasHeight } = canvasElement.getDimensions();
    const { width: imageWidth, height: imageHeight } = image;
    const realWidth = getRealCanvasWidth(canvasWidth);
    let imageScale = 100;

    if (imageWidth > imageHeight) {
        imageScale = getScale(imageWidth, imageHeight, realWidth, canvasHeight);
    }
    else {
        imageScale = getScale(imageHeight, imageWidth, canvasHeight, realWidth);
    }

    const x = canvasWidth - imageWidth * imageScale / 100;
    const y = canvasHeight - imageHeight * imageScale / 100;
    const ctx = canvasElement.getContext();

    setDefaultImagePosition(x, y);
    transform.reset(ctx);
    scaleImage(0, 0, imageScale);
}

export {
    scaleImage,
    adjustScale,
    scaleImageToFitCanvas
};
