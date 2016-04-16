const canvas = document.getElementById("js-canvas");
const canvasImage = {
    original: new Image(),
    withQuality: new Image()
};
let changeCanvasQuality = null;

const transform = (function trackTransforms(ctx) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const translated = {};
    let xform = svg.createSVGMatrix();

    function getTransform() {
        return xform;
    }

    function scale(scale) {
        xform.a = 1;
        xform.d = 1;
        xform = xform.scale(scale, scale);
        ctx.setTransform(xform.a, 0, 0, xform.a, xform.e, xform.f);
    }

    function translate(dx, dy) {
        xform = xform.translate(dx, dy);
        ctx.translate(dx, dy);
    }

    function translateDefault() {
        translate(translated.x, translated.y);
    }

    function getTransformedPoint(x, y) {
        const pt = svg.createSVGPoint();

        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }

    function setTransform(a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        ctx.setTransform(a, b, c, d, e, f);
    }

    function resetTransform() {
        setTransform(1, 0, 0, 1, 0, 0);
        translateDefault();
    }

    function setDefaultTranslation(x, y) {
        translated.x = x;
        translated.y = y;
        return translated;
    }

    function getTranslated() {
        return translated;
    }

    return {
        setDefaultTranslation,
        getTranslated,
        getTransform,
        scale,
        translate,
        getTransformedPoint,
        setTransform,
        resetTransform
    };
})(getContext());

const addBackground = (function getPattern(ctx) {
    const image = new Image();
    let pattern;

    image.onload = function() {
        pattern = ctx.createPattern(image, "repeat");
    };
    image.src = "images/pattern.png";

    return function(ctx) {
        const { width, height } = getCanvasDimensions();

        ctx.fillStyle = pattern;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillRect(0, 0, width, height);
        addMask(ctx);
        ctx.restore();
    };
})(getContext());

function getContext() {
    return canvas.getContext("2d");
}

function getCanvasDimensions() {
    return {
        width: canvas.width,
        height: canvas.height
    };
}

function setCanvasDimensions(width, height) {
    canvas.width = width;
    if (height) {
        canvas.height = height;
    }
}

function addEventListener(event, cb) {
    canvas.addEventListener(event, cb);
}

function removeEventListener(event, cb) {
    canvas.removeEventListener(event, cb);
}

function showCanvas() {
    canvas.classList.add("show");
}

function hideCanvas() {
    canvas.classList.remove("show");
}

function setCursor(name = "default") {
    canvas.style.cursor = name;
}

function getMousePosition({ clientX: x, clientY: y }) {
    const { left, top } = canvas.getBoundingClientRect();

    return {
        x: x - left,
        y: y - top
    };
}

function getModifyQualityCb() {
    return changeCanvasQuality;
}

function getImage(quality) {
    return {
        width: canvasImage.width,
        height: canvasImage.height,
        src: quality ? canvasImage.withQuality : canvasImage.original
    };
}

function addMask(ctx) {
    const { width, height } = getCanvasDimensions();

    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fillRect(0, 0, width, height);
}

function loadCanvasWithQuality(uri) {
    const image = new Image();
    const originalCanvas = document.createElement("canvas");
    const ctx = originalCanvas.getContext("2d");
    let loading = false;

    image.onload = function() {
        originalCanvas.width = image.width;
        originalCanvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
    };
    image.src = uri;

    return function(quality, cb) {
        if (loading) {
            return;
        }
        const { src: imageWithQuality } = getImage(true);

        loading = true;
        imageWithQuality.onload = function() {
            requestAnimationFrame(() => {
                cb();
                loading = false;
            });
        };
        imageWithQuality.src = originalCanvas.toDataURL("image/jpeg", quality);
    };
}

function drawImage(image) {
    const ctx = getContext();

    addBackground(ctx);
    ctx.drawImage(image.src, 0, 0, image.width, image.height);
}

function strokeRect(ctx, area) {

    // +0.5 to get line width of 1px
    ctx.strokeRect(area.x + 0.5, area.y + 0.5, area.width, area.height);
}

function drawArea(ctx, area, areaDrawn) {
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
    if (hasArea || areaDrawn) {
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
    const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();
    ctx.save();

    // +0.5 to get line width of 1px
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
    const ctx = getContext();

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
    const ctx = getContext();
    const { src: image } = getImage();

    // -200 to account for sidebar
    const maxWidth = window.innerWidth - 200;

    // -56 to account for top bar and bottom bar
    const maxHeight = window.innerHeight - 56;

    changeCanvasQuality = loadCanvasWithQuality(uri);
    setCanvasDimensions(maxWidth, maxHeight);
    addBackground(ctx);
    return new Promise(resolve => {
        image.onload = function() {
            const { width, height } = cb(image, maxWidth, maxHeight);
            const x = (maxWidth - width) / 2;
            const y = (maxHeight - height) / 2;
            const translated = transform.setDefaultTranslation(x, y);

            canvasImage.width = width;
            canvasImage.height = height;

            transform.resetTransform();
            ctx.drawImage(image, 0, 0, width, height);
            showCanvas();
            resolve({
                translated,
                widthRatio: image.width / width,
                heightRatio: image.height / height
            });
        };
        image.src = uri;
    });
}

export {
    hideCanvas,
    transform,
    getCanvasDimensions,
    setCanvasDimensions,
    getImage,
    getMousePosition,
    drawInitialImage,
    drawImage,
    drawCanvas,
    setCursor,
    addEventListener,
    removeEventListener,
    getModifyQualityCb
};
