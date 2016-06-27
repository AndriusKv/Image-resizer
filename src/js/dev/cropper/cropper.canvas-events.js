import * as cropper from "./cropper.js";
import * as transform from "./cropper.canvas-transform.js";
import * as canvasElement from "./cropper.canvas-element.js";
import * as canvas from "./cropper.canvas.js";
import * as rightBar from "./cropper.right-bar.js";
import * as dataInput from "./cropper.data-input.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as direction from "./cropper.direction.js";
import * as angle from "./cropper.angle.js";
import * as quality from "./cropper.quality.js";

let currentEvent = "";

function toggleCursorEvents(addEvents) {
    if (addEvents) {
        canvasElement.addEventListener("mousemove", changeCursor);
        window.addEventListener("keydown", changeCursorToMove);
    }
    else {
        canvasElement.removeEventListener("mousemove", changeCursor);
        window.removeEventListener("keydown", changeCursorToMove);
    }
}

function toggleEvent(event = currentEvent) {
    const cropping = document.getElementById("js-crop");
    const removeEvents = event === currentEvent;

    if (removeEvents) {
        currentEvent = "";
        cropping.removeEventListener("mousemove", onMousemove);
        cropping.removeEventListener("mouseup", onMouseup);
    }
    else {
        currentEvent = event;
        cropping.addEventListener("mousemove", onMousemove);
        cropping.addEventListener("mouseup", onMouseup);
    }
    toggleCursorEvents(removeEvents);
}

function onMousemove(event) {
    if (event.target !== document.getElementById("js-canvas")) {
        event.preventDefault();
    }

    const { x, y } = canvasElement.getMousePosition(event);
    const area = selectedArea.get();

    switch (currentEvent) {
        case "select":
            selectArea(area, x, y);
            break;
        case "resize":
            resizeArea(area, x, y);
            break;
        case "rotate":
            rotateArea(area, x, y);
            break;
        case "move":
            if (!event.ctrlKey) {
                return;
            }
            moveArea(x, y);
            break;
        case "drag":
            if (!event.shiftKey) {
                return;
            }
            dragImage(x, y);
            break;
    }
    if (area.width && area.height && currentEvent !== "rotate") {
        cropper.updateTransformedArea(area);
    }
    requestAnimationFrame(cropper.draw);
}

function onMouseup() {
    const area = selectedArea.get();
    const containsArea = area.width && area.height;

    toggleEvent();
    if (!containsArea) {
        const area = selectedArea.reset();
        const image = canvas.image.get(quality.useImageWithQuality());

        canvas.drawImage(image);
        canvasElement.setCursor();
        dataInput.update(area);
    }
    selectedArea.containsArea(containsArea);
    rightBar.toggleButton(!containsArea, "crop", "preview");
}

function selectArea(area, x, y) {
    selectedArea.setProp("width", x - area.x);
    selectedArea.setProp("height", y - area.y);
    selectedArea.containsArea(true);
}

function resizeArea(area, x, y) {
    const newDirection = direction.get();

    if (newDirection.indexOf("n") !== -1) {
        selectedArea.setProp("height", area.y - y + area.height);
        selectedArea.setProp("y", y);
    }
    else if (newDirection.indexOf("s") !== -1) {
        selectedArea.setProp("height", y - area.y);
    }

    if (newDirection.indexOf("w") !== -1) {
        selectedArea.setProp("width", area.x - x + area.width);
        selectedArea.setProp("x", x);
    }
    else if (newDirection.indexOf("e") !== -1) {
        selectedArea.setProp("width", x - area.x);
    }

    if (newDirection.length > 1) {
        const selectedDirection = direction.reverse(newDirection, area);

        canvasElement.setCursor(selectedDirection + "-resize");
    }
}

function getAngleInRadians(area, x, y) {
    const x2 = area.x + area.width / 2;
    const y2 = area.y + area.height / 2;

    return Math.atan2(y2 - y, x2 - x);
}

function rotateArea(area, x, y) {
    const radians = getAngleInRadians(area, x, y);
    const degrees = angle.set(radians, "deg");

    dataInput.setValue("angle", degrees);
}

function moveArea(x, y) {
    const mousePos = cropper.mousePosition.get();

    selectedArea.setProp("x", x - mousePos.x);
    selectedArea.setProp("y", y - mousePos.y);
}

function dragImage(x, y) {
    const mousePos = cropper.mousePosition.get();

    if (!mousePos) {
        return;
    }

    const ctx = canvasElement.getContext();
    const pt = transform.getTransformedPoint(x, y);

    transform.translate(ctx, pt.x - mousePos.x, pt.y - mousePos.y);
}

function removeMoveCursor() {
    canvasElement.setCursor();
    window.removeEventListener("keyup", removeMoveCursor);
}

function changeCursorToMove(event) {
    const currentAngle = angle.get();
    const area = selectedArea.get();
    const { x, y } = cropper.mousePosition.get();

    if (event.ctrlKey && selectedArea.isInside(area, x, y, currentAngle)) {
        canvasElement.setCursor("move");
    }
    window.addEventListener("keyup", removeMoveCursor);
}

function changeResizeCursor(area, x, y) {
    const newDirection = direction.getReal(x, y, area);
    const cursor = newDirection ? `${newDirection}-resize` : "default";

    canvasElement.setCursor(cursor);
}

function changeCursor(event) {
    const { x, y } = canvasElement.getMousePosition(event);
    const area = selectedArea.get();
    const currentAngle = angle.get();

    cropper.mousePosition.set({ x, y });

    if (!area.width || !area.height) {
        return;
    }

    if (event.ctrlKey) {
        let cursor = "default";

        if (selectedArea.isInside(area, x, y, currentAngle)) {
            cursor = "move";
        }
        canvasElement.setCursor(cursor);
        return;
    }
    if (!currentAngle) {
        changeResizeCursor(area, x, y);
    }
}

export { toggleEvent, toggleCursorEvents };
