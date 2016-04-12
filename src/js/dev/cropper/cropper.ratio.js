const ratio = {};

function getRatio(name) {
    if (!name) {
        return ratio;
    }
    if (name === "x") {
        name = "width";
    }
    else if (name === "y") {
        name = "height";
    }
    return ratio[name];
}

function setRatio(widthRatio, heightRatio) {
    ratio.width = widthRatio;
    ratio.height = heightRatio;
}

export {
    getRatio as get,
    setRatio as set
};
