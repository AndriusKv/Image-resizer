import * as cropper from "./cropper.js";
import * as canvasElement from "./cropper.canvas-element.js";
import * as transform from "./cropper.canvas-transform.js";

let running = false;

function resetCanvasProperties() {
    const ctx = canvasElement.getContext();
    const xform = transform.get();

    canvasElement.resetDimensions();
    transform.set(ctx, xform.a, xform.b, xform.c, xform.d, xform.e, xform.f);
}

function onResize() {
    if (running) {
        return;
    }
    running = true;
    requestAnimationFrame(() => {
        resetCanvasProperties();
        cropper.draw();
        running = false;
    });
}

function enable() {
    window.addEventListener("resize", onResize);
}

function disable() {
    window.removeEventListener("resize", onResize);
}

export {
    enable,
    disable
};
