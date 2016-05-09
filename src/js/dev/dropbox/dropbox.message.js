const msgElem = document.getElementById("js-msg");
let timeout = 0;

function hideMessage(delay) {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(showMessage, delay);
}

function showMessage(message = "") {
    msgElem.textContent = message;
    if (!message) {
        return;
    }
    hideMessage(2000);
}

export {
    showMessage as show
};
