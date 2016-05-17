import * as transform from "./cropper.canvas-transform.js";
import * as canvasElement from "./cropper.canvas-element.js";

const canvasImage = (function() {
    const original = new Image();
    const withQuality = new Image();

    function getImage(quality) {
        return quality ? withQuality : original;
    }

    return {
        get: getImage
    };
})();

const spareCanvas = (function(canvasImage) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let loading = false;

    function drawCanvas(uri) {
        const image = new Image();

        image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0, image.width, image.height);
        };
        image.src = uri;
    }

    function adjustQuality(quality, cb) {
        if (loading) {
            return;
        }

        const imageWithQuality = canvasImage.get(true);

        loading = true;
        imageWithQuality.onload = function() {
            requestAnimationFrame(() => {
                cb();
                loading = false;
            });
        };
        imageWithQuality.src = canvas.toDataURL("image/jpeg", quality);
    }

    return {
        draw: drawCanvas,
        adjustQuality
    };
})(canvasImage);

const addBackground = (function getPattern(ctx) {
    const image = new Image();
    let pattern;

    image.onload = function() {
        pattern = ctx.createPattern(image, "repeat");
    };
    image.src = "images/pattern.png";

    return function(ctx) {
        const { width, height } = canvasElement.getDimensions();

        ctx.fillStyle = pattern;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillRect(0, 0, width, height);
        addMask(ctx);
        ctx.restore();
    };
})(canvasElement.getContext());

function addMask(ctx) {
    const { width, height } = canvasElement.getDimensions();

    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fillRect(0, 0, width, height);
}

function drawImage(image) {
    const ctx = canvasElement.getContext();

    addBackground(ctx);
    ctx.drawImage(image, 0, 0, image.width, image.height);
}

function strokeRect(ctx, area) {

    // +0.5 to get line width of 1px
    ctx.strokeRect(area.x + 0.5, area.y + 0.5, area.width, area.height);
}

function drawArea(ctx, area, areaWasDrawn) {
    const width = area.width;
    const height = area.height;
    const hasArea = width && height;
    let x = area.x;
    let y = area.y;
    let imageData;

    if (hasArea) {
        imageData = ctx.getImageData(x, y, width, height);
        if (width < 0) {
            x = x + width;
        }
        if (height < 0) {
            y = y + height;
        }
    }
    if (hasArea || areaWasDrawn) {
        addMask(ctx);
    }
    if (imageData) {
        ctx.putImageData(imageData, x, y);
    }
    strokeRect(ctx, area);
}

function drawRotatedArea(ctx, area, radians) {
    const width = area.width > 0 ? area.width : -area.width;
    const height = area.height > 0 ? area.height : -area.height;
    const { width: canvasWidth, height: canvasHeight } = canvasElement.getDimensions();

    ctx.save();
    ctx.translate(area.x + 0.5 + area.width / 2, area.y + 0.5 + area.height / 2);
    ctx.rotate(radians);
    ctx.strokeRect(-area.width / 2, -area.height / 2, area.width, area.height);
    ctx.beginPath();
    ctx.rect(-width / 2, -height / 2, width, height);
    ctx.restore();
    ctx.rect(canvasWidth, 0, -canvasWidth, canvasHeight);
    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fill();
}

function drawCanvas(image, area, angle, areaDrawn) {
    const ctx = canvasElement.getContext();

    drawImage(image);

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#006494";
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (angle) {
        drawRotatedArea(ctx, area, angle);
    }
    else {
        drawArea(ctx, area, areaDrawn);
    }
    ctx.restore();
}

function drawInitialImage(uri, cb) {
    const image = canvasImage.get();

    spareCanvas.draw(uri);

    return new Promise(resolve => {
        image.onload = function() {
            cb(image);
            canvasElement.show();
            resolve();
        };
        image.src = uri;
    });
}

function setDefaultImagePosition(imageWidth, imageHeight, canvasWidth, canvasHeight) {
    const x = (canvasWidth - imageWidth) / 2;
    const y = (canvasHeight - imageHeight) / 2;

    return transform.setDefaultTranslation(x, y);
}

export {
    canvasImage as image,
    drawInitialImage,
    drawImage,
    drawCanvas,
    addEventListener,
    removeEventListener,
    setDefaultImagePosition,
    spareCanvas
};
