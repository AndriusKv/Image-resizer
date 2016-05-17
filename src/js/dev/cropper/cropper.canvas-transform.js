const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const translated = {};
let transform = svg.createSVGMatrix();

function getTransform() {
    return transform;
}

function scale(ctx, scale) {
    transform.a = 1;
    transform.d = 1;
    transform = transform.scale(scale, scale);
    ctx.setTransform(transform.a, 0, 0, transform.a, transform.e, transform.f);
}

function translate(ctx, dx, dy) {
    transform = transform.translate(dx, dy);
    ctx.translate(dx, dy);
}

function translateDefault(ctx) {
    translate(ctx, translated.x, translated.y);
}

function getTransformedPoint(x, y) {
    const pt = svg.createSVGPoint();

    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(transform.inverse());
}

function setTransform(ctx, a, b, c, d, e, f) {
    transform.a = a;
    transform.b = b;
    transform.c = c;
    transform.d = d;
    transform.e = e;
    transform.f = f;
    ctx.setTransform(a, b, c, d, e, f);
}

function resetTransform(ctx) {
    setTransform(ctx, 1, 0, 0, 1, 0, 0);
    translateDefault(ctx);
}

function setDefaultTranslation(x, y) {
    translated.x = x;
    translated.y = y;
    return translated;
}

function getTranslated() {
    return translated;
}

export {
    getTransform as get,
    setTransform as set,
    resetTransform as reset,
    setDefaultTranslation,
    getTranslated,
    scale,
    translate,
    getTransformedPoint
};
