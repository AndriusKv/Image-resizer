// -1 - default
// 0 - canceled
// 1 - working
let state = -1;

function getCurrentState() {
    return state;
}

function setState(newState) {
    state = newState;
}

export {
    getCurrentState as get,
    setState as set
};
