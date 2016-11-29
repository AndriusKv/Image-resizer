const canvas = document.getElementById("js-canvas");

function getContext() {
    return canvas.getContext("2d");
}

function getCanvasDimensions() {
    return {
        width: canvas.width,
        height: canvas.height
    };
}

function resetCanvasDimensions() {
    canvas.width = window.innerWidth;

    // -58 to account for top bar and bottom bar
    canvas.height = window.innerHeight - 58;
}

function addEventListener(event, cb) {
    canvas.addEventListener(event, cb);
}

function removeEventListener(event, cb) {
    canvas.removeEventListener(event, cb);
}

function showCanvas() {
    canvas.classList.add("visible");
}

function hideCanvas() {
    canvas.classList.remove("visible");
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

export {
    getCanvasDimensions as getDimensions,
    resetCanvasDimensions as resetDimensions,
    showCanvas as show,
    hideCanvas as hide,
    getContext,
    addEventListener,
    removeEventListener,
    setCursor,
    getMousePosition
};
