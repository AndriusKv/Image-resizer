import "focus-visible";

import "../scss/normalize.css";
import "../scss/index.scss";

import "./utils.js";
import "./zoom.js";
import "./rotation.js";
import "./uploaded-images.js";
import "./top-bar.js";
import "./image-resizer.js";
import "./image-folder.js";
import "./canvas.js";
import "./transform.js";
import "./area.js";
import "./web-worker.js";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(console.log);
}
