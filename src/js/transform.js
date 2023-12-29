const transform = new DOMMatrix();
let ctx = null;

function setTransformContext(transformContext) {
  ctx = transformContext;
}

function getTransform() {
  return transform;
}

function getScale() {
  return transform.a;
}

function scaleContext(scale) {
  transform.a = 1;
  transform.d = 1;
  transform.scaleSelf(scale, scale);
  ctx.setTransform(scale, 0, 0, scale, transform.e, transform.f);
}

function translateContext(dx, dy) {
  transform.translateSelf(dx, dy);
  ctx.translate(dx, dy);
}

function setTransform(a, b, c, d, e, f) {
  transform.a = a;
  transform.b = b;
  transform.c = c;
  transform.d = d;
  transform.e = e;
  transform.f = f;
  ctx.setTransform(a, b, c, d, e, f);
}

function resetTransform(x, y) {
  setTransform(1, 0, 0, 1, x, y);
}

function getTransformedPoint(x, y) {
  return {
    x: (x - transform.e) / transform.a,
    y: (y - transform.f) / transform.a
  };
}

export {
  setTransformContext,
  getTransform,
  setTransform,
  resetTransform,
  getScale,
  scaleContext,
  translateContext,
  getTransformedPoint
};
