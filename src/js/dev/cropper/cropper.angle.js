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

function setAngleInDegrees(degrees) {
    theta = convertDegreesToRadians(degrees);
    return theta;
}

function setAngleInRadians(radians) {
    const degrees = convertRadiansToDegrees(radians);

    theta = degrees === 0 || degrees === 360 ? 0: radians;
    return degrees;
}

function getAngle() {
    return theta;
}

function resetAngle() {
    theta = 0;
}

export {
    setAngleInDegrees as setInDegrees,
    setAngleInRadians as setInRadians,
    getAngle as get,
    resetAngle as reset
};
