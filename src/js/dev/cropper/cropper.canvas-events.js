import * as cropper from "./cropper.js";
import * as canvas from "./cropper.canvas.js";
import * as sidebar from "./cropper.sidebar.js";
import * as selectedArea from "./cropper.selected-area.js";
import * as direction from "./cropper.direction.js";
import * as angle from "./cropper.angle.js";
import * as quality from "./cropper.quality.js";

let currentEvent = "";

function toggleCursorEvents(addEvents) {
    const canvas = document.getElementById("js-canvas");

    if (addEvents) {
        canvas.addEventListener("mousemove", changeCursor);
        window.addEventListener("keydown", changeCursorToMove);
    }
    else {
        canvas.removeEventListener("mousemove", changeCursor);
        window.removeEventListener("keydown", changeCursorToMove);
    }
}

function toggleEventListeners(event, cb) {
    const cropping = document.getElementById("js-crop");
    const removeEvents = event === currentEvent;

    if (removeEvents) {
        currentEvent = "";
        cropping.removeEventListener("mousemove", cb);
        cropping.removeEventListener("mouseup", onMouseup);
    }
    else {
        currentEvent = event;
        cropping.addEventListener("mousemove", cb);
        cropping.addEventListener("mouseup", onMouseup);
    }
    toggleCursorEvents(removeEvents);
}

function toggleEvent(event = currentEvent) {
    let cb = null;

    switch (event) {
        case "select":
            cb = selectArea;
            break;
        case "resize":
            cb = resizeArea;
            break;
        case "rotate":
            cb = rotateArea;
            break;
        case "move":
            cb = moveArea;
            break;
        case "drag":
            cb = dragImage;
            break;
    }
    toggleEventListeners(event, cb);
}

function onMouseup() {
    const area = selectedArea.get();
    const hasArea = area.width && area.height;

    toggleEvent();
    if (!hasArea) {
        const transform = canvas.transform.getTransform();
        const area = selectedArea.reset();
        const image = canvas.getImage(quality.useImageWithQuality());

        sidebar.updateDataDisplay(area);
        selectedArea.setProp("x", transform.e);
        selectedArea.setProp("y", transform.f);
        canvas.drawImage(image);
        canvas.setCursor();
    }
    selectedArea.setHasArea(hasArea);
    sidebar.toggleButtons(!hasArea);
}

function selectArea(event) {
    const { x, y } = canvas.getMousePosition(event);
    const area = selectedArea.get();

    selectedArea.setProp("width", x - area.x);
    selectedArea.setProp("height", y - area.y);
    selectedArea.setHasArea(true);
    cropper.updateTransformedArea(area);
    requestAnimationFrame(cropper.draw);
}

function resizeArea(event) {
    const { x, y } = canvas.getMousePosition(event);
    const newDirection = direction.get();
    const area = selectedArea.get();
    let oppositeDirection = "";

    if (newDirection.indexOf("n") !== -1) {
        selectedArea.setProp("height", area.y - y + area.height);
        selectedArea.setProp("y", y);
        oppositeDirection = "n";
    }
    else if (newDirection.indexOf("s") !== -1) {
        selectedArea.setProp("height", y - area.y);
        oppositeDirection = "s";
    }

    if (newDirection.indexOf("w") !== -1) {
        selectedArea.setProp("width", area.x - x + area.width);
        selectedArea.setProp("x", x);
        oppositeDirection += "e";
    }
    else if (newDirection.indexOf("e") !== -1) {
        selectedArea.setProp("width", x - area.x);
        oppositeDirection += "w";
    }

    if (oppositeDirection.length > 1) {
        const selectedDirection = direction.reverse(newDirection, oppositeDirection, area);

        canvas.setCursor(selectedDirection + "-resize");
    }
    cropper.updateTransformedArea(area);
    requestAnimationFrame(cropper.draw);
}

function getAngleInRadians(event) {
    const { x, y } = canvas.getMousePosition(event);
    const area = selectedArea.get();
    const x2 = area.x + area.width / 2;
    const y2 = area.y + area.height / 2;

    return Math.atan2(y2 - y, x2 - x);
}

function rotateArea(event) {
    const radians = getAngleInRadians(event);
    const degrees = angle.set(radians, "deg");

    sidebar.cropDataInputs.setValue("angle", degrees);
    requestAnimationFrame(cropper.draw);
}

function moveArea(event) {
    if (!event.ctrlKey) {
        return;
    }

    const mousePos = cropper.mousePosition.get();
    const { x, y } = canvas.getMousePosition(event);
    const newX = selectedArea.setProp("x", x - mousePos.x);
    const newY = selectedArea.setProp("y", y - mousePos.y);
    const pt = canvas.transform.getTransformedPoint(newX, newY);

    sidebar.updatePointDisplay(pt.x, pt.y);
    requestAnimationFrame(cropper.draw);
}

function dragImage(event) {
    const mousePos = cropper.mousePosition.get();

    if (!mousePos) {
        return;
    }
    const transform = canvas.transform;
    const { x, y } = canvas.getMousePosition(event);
    const pt = transform.getTransformedPoint(x, y);
    const area = selectedArea.get();

    transform.translate(pt.x - mousePos.x, pt.y - mousePos.y);
    if (area.width && area.height) {
        const pt = transform.getTransformedPoint(area.x, area.y);

        sidebar.updatePointDisplay(pt.x, pt.y);
    }
    requestAnimationFrame(cropper.draw);
}

function removeMoveCursor() {
    canvas.setCursor();
    window.removeEventListener("keyup", removeMoveCursor);
}

function changeCursorToMove(event) {
    const currentAngle = angle.get();
    const area = selectedArea.get();
    const { x, y } = cropper.mousePosition.get();

    if (event.ctrlKey && selectedArea.isInside(area, x, y, currentAngle)) {
        canvas.setCursor("move");
    }
    window.addEventListener("keyup", removeMoveCursor);
}

function changeResizeCursor(area, x, y) {
    const newDirection = direction.getOpposite(x, y, area);
    let cursor = "default";

    if (newDirection) {
        cursor = `${newDirection}-resize`;
    }
    canvas.setCursor(cursor);
}

function changeCursor(event) {
    const { x, y } = canvas.getMousePosition(event);
    const area = selectedArea.get();
    const currentAngle = angle.get();

    cropper.mousePosition.set({ x, y });

    if (event.ctrlKey) {
        let cursor = "default";

        if (selectedArea.isInside(area, x, y, currentAngle)) {
            cursor = "move";
        }
        canvas.setCursor(cursor);
        return;
    }
    if (!currentAngle) {
        changeResizeCursor(area, x, y);
    }
}

export { toggleEvent, toggleCursorEvents };
