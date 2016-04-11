let theta = 0;

function convertDegreesToRadians(degrees) {
    if (degrees > 180) {
        degrees -= 360;
    }
    return degrees * Math.PI / 180;
}

function convertRadiansToDegrees(radians) {
    let degrees = Math.round(radians * 180 / Math.PI);

    if (degrees < 0) {
        degrees += 360;
    }
    return degrees;
}

function setAngle(angle, convertTo) {
    if (convertTo === "rad") {
        theta = convertDegreesToRadians(angle);
        return theta;
    }
    if (convertTo === "deg") {
        const degrees = convertRadiansToDegrees(angle);

        if (degrees === 0 || degrees === 360) {
            theta = 0;
        }
        else {
            theta = angle;
        }
        return degrees;

    }
}

function getAngle() {
    return theta;
}

function resetAngle() {
    theta = 0;
}

export {
    setAngle as set,
    getAngle as get,
    resetAngle as reset,
    convertRadiansToDegrees
};
