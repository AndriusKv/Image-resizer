(()=>{var e,t,n,i,o={359:()=>{let e=!1;function t({target:n}){let i=!0;n.closest(".panel-container")&&(i=!!n.closest(".bottom-bar-panel-btn")),i&&(e=!1,document.getElementById("js-bottom-bar-panel").classList.remove("visible"),window.removeEventListener("click",t))}document.getElementById("js-bottom-bar-panel-toggle-btn").addEventListener("click",(({currentTarget:n})=>{const i=n.nextElementSibling;e=!e,i.classList.toggle("visible",e),e?window.addEventListener("click",t):window.removeEventListener("click",t)}))}},r={};function a(e){var t=r[e];if(void 0!==t)return t.exports;var n=r[e]={exports:{}};return o[e].call(n.exports,n,n.exports,a),n.exports}a.m=o,t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,a.t=function(n,i){if(1&i&&(n=this(n)),8&i)return n;if("object"==typeof n&&n){if(4&i&&n.__esModule)return n;if(16&i&&"function"==typeof n.then)return n}var o=Object.create(null);a.r(o);var r={};e=e||[null,t({}),t([]),t(t)];for(var s=2&i&&n;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>r[e]=()=>n[e]));return r.default=()=>n,a.d(o,r),o},a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.f={},a.e=e=>Promise.all(Object.keys(a.f).reduce(((t,n)=>(a.f[n](e,t),t)),[])),a.u=e=>e+".js",a.miniCssF=e=>{},a.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n={},i="imagis:",a.l=(e,t,o,r)=>{if(n[e])n[e].push(t);else{var s,c;if(void 0!==o)for(var l=document.getElementsByTagName("script"),d=0;d<l.length;d++){var u=l[d];if(u.getAttribute("src")==e||u.getAttribute("data-webpack")==i+o){s=u;break}}s||(c=!0,(s=document.createElement("script")).charset="utf-8",s.timeout=120,a.nc&&s.setAttribute("nonce",a.nc),s.setAttribute("data-webpack",i+o),s.src=e),n[e]=[t];var h=(t,i)=>{s.onerror=s.onload=null,clearTimeout(g);var o=n[e];if(delete n[e],s.parentNode&&s.parentNode.removeChild(s),o&&o.forEach((e=>e(i))),t)return t(i)},g=setTimeout(h.bind(null,void 0,{type:"timeout",target:s}),12e4);s.onerror=h.bind(null,s.onerror),s.onload=h.bind(null,s.onload),c&&document.head.appendChild(s)}},a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;a.g.importScripts&&(e=a.g.location+"");var t=a.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var n=t.getElementsByTagName("script");if(n.length)for(var i=n.length-1;i>-1&&(!e||!/^http(s?):/.test(e));)e=n[i--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),a.p=e})(),(()=>{a.b=document.baseURI||self.location.href;var e={792:0};a.f.j=(t,n)=>{var i=a.o(e,t)?e[t]:void 0;if(0!==i)if(i)n.push(i[2]);else{var o=new Promise(((n,o)=>i=e[t]=[n,o]));n.push(i[2]=o);var r=a.p+a.u(t),s=new Error;a.l(r,(n=>{if(a.o(e,t)&&(0!==(i=e[t])&&(e[t]=void 0),i)){var o=n&&("load"===n.type?"missing":n.type),r=n&&n.target&&n.target.src;s.message="Loading chunk "+t+" failed.\n("+o+": "+r+")",s.name="ChunkLoadError",s.type=o,s.request=r,i[1](s)}}),"chunk-"+t,t)}};var t=(t,n)=>{var i,o,[r,s,c]=n,l=0;if(r.some((t=>0!==e[t]))){for(i in s)a.o(s,i)&&(a.m[i]=s[i]);if(c)c(a)}for(t&&t(n);l<r.length;l++)o=r[l],a.o(e,o)&&e[o]&&e[o][0](),e[o]=0},n=globalThis.webpackChunkimagis=globalThis.webpackChunkimagis||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})(),(()=>{"use strict";function e(e,t,{width:n,height:i}){return new Promise((o=>{const r=document.createElement("canvas");r.width=n,r.height=i,r.getContext("2d").drawImage(e,0,0,n,i),r.toBlob(o,t,1)}))}function t(e,t,n=null){for(;t&&t!==n;){if(t.hasAttribute(e))return{elementRef:t,attrValue:t.getAttribute(e)};t=t.parentElement}}function n(e){const t=["B","kB","MB","GB"];let n=e,i=0;for(;i<t.length&&!(n<1e3);)n/=1e3,i+=1;return n=i>0?n.toFixed(1):Math.round(n),`${n} ${t[i]}`}const i=document.getElementById("js-bottom-bar-rotation");let o=0;function r(e){return e>180&&(e-=360),e*Math.PI/180}function s(e){let t=Math.round(180*function(e){const t=2*Math.PI,n=-t;return e>t?e-=t:e<n&&(e-=n),e}(e)/Math.PI);return t<0&&(t+=360),360===t?0:t}function c(e){const t=document.getElementById("js-rotation-input");t.value=e,t.previousElementSibling.textContent=`${e}°`}function l({currentTarget:e}){e.classList.remove("visible"),e.previousElementSibling.classList.add("visible"),(e.value<0||e.value>359)&&(e.value=s(o))}document.getElementById("js-rotation-input").addEventListener("input",(({target:e})=>{let t=parseInt(event.target.value,10)||0;t<0?t=0:t>360&&(t%=360);const n=function(e){return o=r(e),o}(t),i=s(n);requestAnimationFrame($e),e.previousElementSibling.textContent=`${i}°`})),i.addEventListener("click",(e=>{const n=t("data-type",e.target,e.currentTarget);if(!n)return;const i=r(15);"left"===n.attrValue?o-=i:"right"===n.attrValue&&(o+=i);const a=s(o);requestAnimationFrame($e),c(a)})),i.addEventListener("focus",(({target:e})=>{if("SPAN"===e.nodeName){const t=e.nextElementSibling;e.classList.remove("visible"),t.classList.add("visible"),t.focus(),t.addEventListener("blur",l,{once:!0})}}),!0);const d={flipH:1,flipV:1};function u(){d.flipH=1,d.flipV=1}document.getElementById("js-bottom-bar-flip-toggle-items").addEventListener("click",(({target:e,currentTarget:n})=>{const i=t("data-item",e,n);i&&(d[i.attrValue]*=-1,requestAnimationFrame($e))}));const h=new Worker(new URL(a.p+a.u(569),a.b),{type:void 0});function g(e){h.postMessage(e)}h.onmessage=async function({data:{type:e,data:t}}){if("zip"===e){const{default:e}=await a.e(213).then(a.t.bind(a,213,23));e(t,"images.zip")}},h.onerror=function(e){console.log(e)};const m=document.getElementById("js-image-folder-list"),f=document.getElementById("js-image-folder-bottom"),v=[],p={};let y=0;function w(e){const t=e.split("."),n=p[t[0]]||0;return p[t[0]]=n+1,t[0]+=`-${n}`,t.join(".")}function b(e){const t=document.getElementById("js-image-folder-item-count"),n=v.push(e);t.classList.remove("hidden"),t.innerText=n,function(){const e=document.createElement("div");e.classList.add("ping"),document.querySelector(".top-bar-image-folder-toggle-btn").appendChild(e),setTimeout((()=>{e.remove()}),4e3)}(),m.insertAdjacentHTML("beforeend",`\n    <li class="image-folder-list-item" data-index="${n-1}">\n      <button class="image-folder-enlarge-btn" data-type="enlarge" title="Enlarge">\n        <image src=${URL.createObjectURL(e.file)} class="image-folder-list-item-image" alt="">\n      </button>\n      <input type="checkbox" class="image-folder-checkbox">\n      <button class="image-folder-remove-btn" data-type="remove" title="Remove">\n        <svg viewBox="0 0 24 24">\n          <use href="#remove"></use>\n        </svg>\n      </button>\n    </li>\n  `),document.getElementById("js-image-folder-message").classList.add("hidden"),m.classList.add("visible")}function E(e,t){const i=n(e.file.size);return`${e.name} | ${t+1} / ${v.length} | ${e.width}x${e.height} | ${i}`}function x({key:e}){"ArrowRight"===e?L(1):"ArrowLeft"===e?L(-1):"Delete"===e&&k()}function L(e){1===e?y=(y+1)%v.length:-1===e&&(y=0===y?v.length-1:y-1),j(y)}function j(e){const t=v[e],n=URL.createObjectURL(t.file),i=document.getElementById("js-image-folder-viewer-image");URL.revokeObjectURL(i.src),i.src=n,document.getElementById("js-image-folder-viewer-image-link").href=n,document.getElementById("js-image-folder-viewer-header").textContent=E(t,e)}function I(e){if(e.target===e.currentTarget)return void B();const n=t("data-type",e.target,e.currentTarget);if(!n)return;const{attrValue:i}=n;"close"===i?B():"next"===i?L(1):"previous"===i?L(-1):"remove"===i&&k()}function k(){document.querySelectorAll(".image-folder-list-item")[y].remove(),v.splice(y,1),M(),v.length?(y=y>=v.length-1?v.length-1:y,j(y)):B()}function B(){const e=document.getElementById("js-image-folder-viewer");e.removeEventListener("click",I),e.remove(),window.removeEventListener("keydown",x)}function M(){const e=document.getElementById("js-image-folder-item-count");if(0===v.length)document.getElementById("js-image-folder-message").classList.remove("hidden"),m.classList.remove("visible"),e.classList.add("hidden");else{const t=[...m.children];e.innerText=v.length,t.forEach(((e,t)=>{e.setAttribute("data-index",t)}))}}m.addEventListener("click",(({target:e,currentTarget:n})=>{const i=t("data-index",e,n);if(!i)return;const o=t("data-type",e,n),{attrValue:r,elementRef:a}=i;if(o){const{attrValue:e}=o;"enlarge"===e?(y=parseInt(r,10),function(e){const t=v[e],n=URL.createObjectURL(t.file);document.getElementById("js-editor").insertAdjacentHTML("beforeend",`\n    <div id="js-image-folder-viewer" class="js-top-bar-item image-folder-viewer">\n      <div id="js-image-folder-viewer-header" class="image-folder-viewer-header">${E(t,e)}</div>\n      <img src="${n}" id="js-image-folder-viewer-image" class="image-folder-viewer-image" alt="">\n      <div class="image-folder-viewer-footer">\n        <a href="${n}" id="js-image-folder-viewer-image-link" class="icon-btn-round" target="_blank" title="Open image in a new tab">\n          <svg viewBox="0 0 24 24">\n            <use href="#open-in-new"></use>\n          </svg>\n        </a>\n        <button class="icon-btn-round" data-type="previous" title="Previous image">\n          <svg viewBox="0 0 24 24">\n            <use href="#arrow-left"></use>\n          </svg>\n        </button>\n        <button class="icon-btn-round" data-type="next" title="Next image">\n          <svg viewBox="0 0 24 24">\n            <use href="#arrow-right"></use>\n          </svg>\n        </button>\n        <button class="icon-btn-round" data-type="remove" title="Remove image">\n          <svg viewBox="0 0 24 24">\n            <use href="#remove"></use>\n          </svg>\n        </button>\n      </div>\n      <button class="icon-btn-round image-folder-viewer-close-btn" data-type="close" title="Close">\n        <svg viewBox="0 0 24 24">\n          <use href="#close"></use>\n        </svg>\n      </button>\n    </div>\n  `),document.getElementById("js-image-folder-viewer").addEventListener("click",I),window.addEventListener("keydown",x)}(y)):"remove"===e&&(a.remove(),v.splice(r,1),M())}else if("INPUT"===e.nodeName){const t=f.querySelector("[data-type=selected]");v[r].selected=e.checked,t.disabled=!v.some((e=>e.selected))}})),f.addEventListener("click",(({target:e,currentTarget:n})=>{const i=t("data-type",e,n);i&&("all"===i.attrValue?g({type:"zip",data:v}):"selected"===i.attrValue&&g({type:"zip",data:v.filter((e=>e.selected))}))}));let T={x:0,y:0,width:0,height:0},A=[],S="";function $(){return T}function R(){return T.width>0&&T.height>0}function z(e){const t=e?24:16,n=Math.round(T.width/3-2),i=Math.round(T.height/3-2),o=n<t?n:t,r=i<t?i:t,a=["nw","w","sw","n","s","ne","e","se"];let s=0;A=[];for(let e=0;e<3;e+=1)for(let t=0;t<3;t+=1){if(1===e&&1===t)continue;const n=T.x+T.width/2*e-o/2*e,i=T.y+T.height/2*t-r/2*t;A.push({x:n,y:i,width:o,height:r,direction:a[s]}),s+=1}return A}function q(){return S}function U(e,t){S="";for(const n of A){const i=n.x,o=n.y,r=i+n.width,a=o+n.height;if(e>=i&&e<=r&&t>=o&&t<=a)return S=n.direction,S}}function P(e){return S=1===S.length?e:"n"===e||"s"===e?e+S[1]:S[0]+e,S}function O(e={}){T={x:0,y:0,width:0,height:0,...e}}function C(e,t){const n=T.x,i=T.y,o=n+T.width,r=i+T.height;return(e>=n&&e<=o||e<=n&&e>=o)&&(t>=i&&t<=r||t<=i&&t>=r)}const F=new DOMMatrix;let H=null;function V(){return F}function N(){return F.a}function D(e,t){F.translateSelf(e,t),H.translate(e,t)}function W(e,t,n,i,o,r){F.a=e,F.b=t,F.c=n,F.d=i,F.e=o,F.f=r,H.setTransform(e,t,n,i,o,r)}function _(e,t){return{x:(e-F.e)/F.a,y:(t-F.f)/F.a}}const K=document.getElementById("js-top-bar-crop-panel");function Y(){for(const e of K.querySelectorAll("[data-value]"))e.value=""}function X(){const e={};for(const t of K.querySelectorAll("[data-value]")){if(!t.validity.valid)return;e[t.getAttribute("data-value")]=Number.parseInt(t.value,10)||0}if(4===Object.keys(e).length){const{a:t,e:n,f:i}=V(),o=$();o.x=e.x*t+n,o.y=e.y*t+i,o.width=e.width*t,o.height=e.height*t,requestAnimationFrame($e),Fe()}}K.addEventListener("change",X),document.getElementById("js-crop-panel-btn").addEventListener("click",X);const Q=document.getElementById("js-top-bar-upload-panel"),G=document.getElementById("js-uploaded-images-file-input"),J=[];let Z=0,ee=null;function te(){return J[Z]}function ne(){const e=J.at(-1);var t;ee?(Z=J.length-1,Y(),u(),We(e.blobUrl)):(t=e.blobUrl,me.insertAdjacentHTML("beforeend",'<canvas id="js-canvas"></canvas>'),me.classList.remove("hidden"),document.getElementById("js-intro").remove(),function(e){var t;pe=document.getElementById("js-canvas"),t=pe.getContext("2d",{willReadFrequently:!0}),H=t,Te(),We(e),pe.addEventListener("wheel",ze,{passive:!0}),pe.addEventListener("pointerdown",qe),pe.addEventListener("dblclick",Oe)}(t),window.addEventListener("resize",(()=>{requestAnimationFrame((()=>{!function(){const e=V();Te(),W(e.a,e.b,e.c,e.d,e.e,e.f)}(),$e()}))}))),requestAnimationFrame((()=>{const t=[...document.querySelectorAll(".uploaded-images-list-item")].at(-1);ie(e),se(t),ae(e.name)}))}function ie(e){document.getElementById("js-uploaded-images-preview").innerHTML=`\n    <div class="uploaded-images-preview-info">${e.name}</div>\n    <div class="uploaded-images-preview-info">${e.width}x${e.height} | ${e.sizeString}</div>\n    <img src="${e.blobUrl}" class="uploaded-images-preview-image" alt="" draggable="false">\n  `}async function oe(e){const[t]=e.splice(0,1),i=await(o=t,new Promise((e=>{const t=new Image,i=URL.createObjectURL(o);t.onload=function(){o.name??=`${crypto.randomUUID()}.${function(e){if(!e)return"png";const t=e.split("/")[1];return"jpeg"===t?"jpg":t}(o.type)}`,e({file:o,blobUrl:i,name:o.name,sizeString:n(o.size),type:o.type,width:t.width,height:t.height,aspectRatio:t.width/t.height})},t.onerror=function(t){console.log(t),e()},t.src=i})));var o;i&&(J.push(i),function(e){const t=document.getElementById("js-uploaded-images-list"),n=J.length-1;t.insertAdjacentHTML("beforeend",`\n    <li class="uploaded-images-list-item" data-index="${n}" data-type="image">\n        <button class="uploaded-images-list-btn">\n          <img src="${e.blobUrl}" class="uploaded-images-list-image" draggable="false">\n        </button>\n    </li>\n  `)}(i),function(){const e=document.createElement("div");e.classList.add("ping"),e.style.setProperty("--delay",2*Math.random()+"s"),document.getElementById("js-top-bar-upload-btn-container").appendChild(e),setTimeout((()=>{e.remove()}),4e3)}()),e.length?oe(e):ne()}function re(e){const t=function(e){return e.filter((e=>!e.type||e.type.includes("image")))}([...e]);t.length&&oe(t)}function ae(e){document.title=`${e} | Imagis`}function se(e){ee&&ee.classList.remove("active"),ee=e,ee.classList.add("active")}function ce({target:e}){re(e.files),e.value=""}G.addEventListener("change",ce),document.getElementById("js-intro-file-input").addEventListener("change",ce),Q.addEventListener("click",(e=>{const n=t("data-type",e.target,e.currentTarget);if(n&&"image"===n.attrValue){const e=parseInt(n.elementRef.getAttribute("data-index"),10),{file:t,blobUrl:i}=J[e];e!==Z&&(Z=e,ie(J[e]),se(n.elementRef),ae(t.name),Y()),u(),We(i)}})),document.getElementById("js-intro-file-select-btn").addEventListener("click",(()=>{document.getElementById("js-intro-file-input").click()})),document.getElementById("js-uploaded-images-upload-btn").addEventListener("click",(()=>{G.click()})),window.addEventListener("drop",(e=>{e.preventDefault(),e.dataTransfer.dropEffect="copy",re(e.dataTransfer.files)})),window.addEventListener("dragover",(e=>{e.preventDefault()})),document.addEventListener("paste",(async e=>{const t="function"==typeof navigator?.clipboard?.read?await navigator.clipboard.read():e.clipboardData.files,n=[];e.preventDefault();for(const e of t)if(e.type?.startsWith("image/"))n.push(e);else{const t=e.types?.filter((e=>e.startsWith("image/")));for(const i of t){const t=await e.getType(i);n.push(t)}}n.length&&oe(n)})),"launchQueue"in window&&"files"in window.LaunchParams.prototype&&window.launchQueue.setConsumer((async e=>{if(!e.files.length)return;const t=[];for(const n of e.files){const e=await n.getFile();t.push(e)}t.length&&oe(t)}));let le="",de=!1;function ue(e){return document.getElementById(`js-top-bar-${e}-panel`)}function he(e){e.target.closest(".js-top-bar-item")||function(){const e=ue(le);de=!1,le="",e.classList.remove("visible"),window.removeEventListener("mousedown",he)}()}document.getElementById("js-top-bar-header").addEventListener("click",(e=>{const n=t("data-panel-name",e.target,e.currentTarget);if(!n)return;const{attrValue:i}=n;if(le){ue(le).classList.remove("visible")}if(i===le)de=!1,le="",window.removeEventListener("mousedown",he);else{const e=ue(i);de=!0,le=i,e.classList.add("visible"),window.addEventListener("mousedown",he),"crop"===i&&function(){const e=$();if(!e.width||!e.height)return;const{a:t,e:n,f:i}=V(),o=n/t,r=i/t,a={x:Math.round(e.x/t-o),y:Math.round(e.y/t-r),width:Math.round(e.width/t),height:Math.round(e.height/t)};for(const e of K.querySelectorAll("[data-value]")){const t=e.getAttribute("data-value");e.value=a[t]}}()}}));const ge=new Image,me=document.getElementById("js-editor"),fe=document.getElementById("js-action-btns"),ve=void 0!==window.orientation;let pe=null,ye=0,we=0,be=null,Ee=null,xe="",Le=!1,je=!1,Ie=!1,ke="pan",Be=!1;function Me(){return{canvasWidth:ye,canvasHeight:we}}function Te(){const e=window.innerWidth,t=window.innerHeight;pe.width=e,pe.height=t,ye=e,we=t}function Ae(e,t=ge){const n=o,{flipH:i,flipV:r}=d;if(function(e){e.save(),e.setTransform(1,0,0,1,0,0),e.clearRect(0,0,ye,we),e.restore()}(e),e.save(),n){const i=t.width/2,o=t.height/2;e.translate(i,o),e.rotate(n),e.translate(-i,-o)}e.scale(i,r),e.translate(-1===i?-t.width:0,-1===r?-t.height:0),e.drawImage(t,0,0,t.width,t.height),e.restore()}function Se(e){const t=$(),n=Math.round(t.width),i=Math.round(t.height),o=Math.round(t.x),r=Math.round(t.y);let a;e.save(),e.lineWidth=1,e.strokeStyle="#006494",e.setTransform(1,0,0,1,0,0),n&&i&&(a=e.getImageData(o,r,n,i)),(n||i||Le)&&function(e){e.fillStyle="rgba(0, 0, 0, .4)",e.fillRect(0,0,ye,we)}(e),a&&e.putImageData(a,o,r),n&&i&&(("cut"===ke||"pan"===ke&&Be)&&(Be=!0,function(e,t){const n=3,i=Math.round(t.width/n),o=Math.round(t.height/n);for(let r=1;r<n;r+=1)e.beginPath(),e.moveTo(t.x+i*r,t.y),e.lineTo(t.x+i*r,t.y+t.height),e.stroke(),e.beginPath(),e.moveTo(t.x,t.y+o*r),e.lineTo(t.x+t.width,t.y+o*r),e.stroke()}(e,t)),function(e){const t=z(ve);for(const n of t)e.strokeRect(n.x+.5,n.y+.5,n.width,n.height)}(e)),e.strokeRect(t.x+.5,t.y+.5,n,i),e.restore()}function $e(){const e=pe.getContext("2d",{willReadFrequently:!0});Ae(e),Se(e)}function Re(e="default"){pe.style.cursor=e}function ze(e){nt(e.deltaY>0?.8:1.25,e.clientX,e.clientY)}function qe(e){if(1!==e.which||de)return;const{clientX:t,clientY:n}=e,i=$(),o=R(),r=U(t,n);Le=o,"select"===ke||"cut"===ke?r&&o?(xe="resize",be={x:t-i.x,y:n-i.y}):(e.ctrlKey||ve)&&o&&C(t,n)?(xe="move",be={x:t-i.x,y:n-i.y}):(xe="select",be={x:t,y:n},O({x:t,y:n})):"pan"===ke&&(xe="drag",Ee=_(t,n)),me.style.userSelect="none",window.addEventListener("pointermove",Ue),window.addEventListener("pointerup",Pe),window.removeEventListener("pointermove",He)}function Ue({clientX:e,clientY:t}){if(Ie||!xe)return;Ie=!0;const n=e>0?e:0,i=t>0?t:0;switch(xe){case"select":Ve(n,i);break;case"resize":!function(e,t){const n=$(),i=q();if("n"===i[0]){if(n.height=n.y-t+n.height,n.y=t,n.height<0){Re(`${P("s")}-resize`),n.height*=-1,n.y-=n.height}}else if("s"===i[0]&&(n.height=t-n.y,n.height<0)){Re(`${P("n")}-resize`),n.height*=-1,n.y-=n.height}if(i.includes("w")){if(n.width=n.x-e+n.width,n.x=e,n.width<0){Re(`${P("e")}-resize`),n.width*=-1,n.x-=n.width}}else if(i.includes("e")&&(n.width=e-n.x,n.width<0)){Re(`${P("w")}-resize`),n.width*=-1,n.x-=n.width}je&&Ne(e,t,n)}(n,i);break;case"move":!function(e,t){if(je){const{a:n,e:i,f:o}=V();De(e,"x","width",i,n),De(t,"y","height",o,n)}else{const n=$();n.x=e-be.x,n.y=t-be.y}}(n,i);break;case"drag":!function(e,t){if(Ee){const n=_(e,t);D(n.x-Ee.x,n.y-Ee.y)}}(n,i)}requestAnimationFrame((()=>{$e(),Ie=!1}))}function Pe(){const e=$();be=null,Ee=null,me.style.userSelect="auto",R()?(T.width<0&&(T.width*=-1,T.x-=T.width),T.height<0&&(T.height*=-1,T.y-=T.height),e.x<0?(e.width+=e.x,e.x=0):e.x+e.width>pe.width&&(e.width=pe.width-e.x),e.y<0?(e.height+=e.y,e.y=0):e.y+e.height>pe.height&&(e.height=pe.height-e.y),"select"!==ke&&"cut"!==ke||Fe(),xe&&requestAnimationFrame($e)):Ce(),xe="",window.removeEventListener("pointermove",Ue),window.removeEventListener("pointerup",Pe)}function Oe(){const e=$();if(!R())return;const{a:t,e:n,f:i}=V(),o=q().split("");if(o.includes("w")){const t=e.width+e.x;n<0?(e.x=0,e.width=t):(e.x=n,e.width=t-n)}else if(o.includes("e")){const i=n+ge.width*t;i>pe.width?e.width=pe.width-e.x:e.width=i-e.x}if(o.includes("n")){const t=e.height+e.y;i<0?(e.y=0,e.height=t):(e.y=i,e.height=t-i)}else if(o.includes("s")){const n=i+ge.height*t;n>pe.height?e.height=pe.height-e.y:e.height=n-e.y}e.width=Math.floor(e.width),e.height=Math.floor(e.height),requestAnimationFrame($e)}function Ce(){Le=!1,Be=!1,Ae(pe.getContext("2d")),Re(),Y(),cropBtnElement.classList.remove("visible"),window.removeEventListener("pointermove",He)}function Fe(){cropBtnElement.classList.add("visible"),window.addEventListener("pointermove",He)}function He(e){const{clientX:t,clientY:n}=e;if(e.ctrlKey)Re(C(t,n)?"move":"default");else{const e=U(t,n);Re(e?`${e}-resize`:"default")}}function Ve(e,t){const n=$();n.width=e-be.x,n.height=t-be.y,n.width<0&&(n.width*=-1,n.x=e),n.height<0&&(n.height*=-1,n.y=t),je&&Ne(e,t,n)}function Ne(e,t,n){const{a:i,e:o,f:r}=V(),a=n.x+n.width,s=n.y+n.height,c=o+ge.width*i,l=r+ge.height*i;e+8>o&&e-8<o?(n.width=n.width+e-o,n.x=o):a+8>c&&a-8<c&&(n.width=c-n.x),t+8>r&&t-8<r?(n.height=n.height+t-r,n.y=r):s+8>l&&s-8<l&&(n.height=l-n.y)}function De(e,t,n,i,o){const r=$(),a=e-be[t],s=ge[n]*o,c=r[n];r[t]=i+8>a&&i-8<a?i:i+8+s>a+c&&i-8+s<a+c?i+s-c:a}function We(e){Le=!1,o=0,c(0),O(),ge.onload=function(){!function(e){const{canvasWidth:t,canvasHeight:n}=Me(),{width:i,height:o}=e;let r=N();r=i>o?et(i,o,t,n):et(o,i,n,t);const a=t-i*r,s=n-o*r;(function(e,t){W(1,0,0,1,e,t)})(a/2,s/2),Ge(0,0,r),tt(r)}(ge)},ge.src=e}function _e(e){const t=document.createElement("canvas"),n=t.getContext("2d"),{a:i,e:o,f:r}=V(),a={x:o/i,y:r/i},s=$(),c={x:Math.round(s.x/i),y:Math.round(s.y/i),width:Math.round(s.width/i),height:Math.round(s.height/i)};t.width=Math.round(ye/i),t.height=Math.round(we/i),n.translate(a.x,a.y),c.x<a.x&&(c.width=c.width-(a.x-c.x),c.x=a.x);const l=c.x+c.width,d=a.x+e.width;l>d&&(c.width=c.width-(l-d)),c.y<a.y&&(c.height=c.height-(a.y-c.y),c.y=a.y);const u=c.y+c.height,h=a.y+e.height;u>h&&(c.height=c.height-(u-h));const g=function(e,t,n){return Ae(n,e),n.getImageData(t.x,t.y,t.width,t.height)}(e,c,n);return t.width=g.width,t.height=g.height,n.putImageData(g,0,0),t}function Ke(e,t){return new Promise((n=>{const i=_e(e);i.toBlob((e=>{n({file:e,width:i.width,height:i.height})}),t,1)}))}function Ye(){document.querySelector("[data-tool=reset]").classList.remove("visible")}function Xe(e,t=null){if(e===ke)return;const n=ke;if("pan"===n&&"reset"===e)return O(),Ce(),void Ye();t||(t=document.querySelector(`[data-tool=${e}]`)),function(){if(ke){const e=document.querySelector(`[data-tool=${ke}]`);e&&e.classList.remove("selected"),Ye(),ke=""}}(),n!==e&&(t.classList.add("selected"),ke=e),"pan"===e?(window.removeEventListener("pointermove",He),R()&&document.querySelector("[data-tool=reset]").classList.add("visible")):"select"===e?("pan"!==n||Be)&&(O(),Ce()):"cut"===e?function(e){if("cut"===e)O(),Ce();else if(Be)Fe();else{const e=ye/2,t=we/2,n=Math.min(e,150),i=Math.min(t,150),o={x:e-n,y:t-i};be=o,O(o),Ve(e+n,t+i),Fe(),$e()}}(n):"reset"===e&&(O(),Ce())}fe.addEventListener("click",(()=>{const e=event.target.closest("[data-action]");if(!e)return;if("cancel"===e.getAttribute("data-action"))return O(),Ce(),void Ye();const{file:t,blobUrl:n}=te(),i=new Image;i.onload=async function(){if("cut"===ke){const e=await Ke(i,t.type),n=new File([e.file],w(t.name),{type:t.type});await oe([n]);const o=J,r=o.length-1,{blobUrl:a}=o[r];u(),We(a),function(e){const t=document.getElementById("js-uploaded-images-list").children[e],n=J[e];Z=e,ie(n),se(t),ae(n.name)}(r)}else b({name:w(t.name),type:t.type,...await Ke(i,t.type)})},i.src=n})),document.getElementById("js-left-bar").addEventListener("click",(e=>{const t=e.target.closest("[data-tool]");if(!t)return;Xe(t.getAttribute("data-tool"),t)})),document.getElementById("js-snap-checkbox").addEventListener("change",(e=>{je=e.target.checked})),window.addEventListener("keydown",(e=>{if(e.metaKey||e.ctrlKey||e.shiftKey){if("a"===e.key&&e.ctrlKey){const t=$(),{a:n,e:i,f:o}=V(),{width:r,height:a}=ge;t.x=i,t.y=o,t.width=r*n,t.height=a*n,requestAnimationFrame($e),Fe(),e.preventDefault()}}else"h"===e.key?Xe("pan"):"s"===e.key?Xe("select"):"c"===e.key?Xe("cut"):"Escape"===e.key&&(O(),Ce(),Ye())}));const Qe=document.getElementById("js-bottom-bar-zoom");function Ge(e,t,n){D(e,t),function(e){F.a=1,F.d=1,F.scaleSelf(e,e),H.setTransform(e,0,0,e,F.e,F.f)}(n),D(-e,-t),requestAnimationFrame($e)}function Je(e){return e<.08?e=.08:e>80&&(e=80),e}function Ze(e,t){return 1-1/(e/(e-t))}function et(e,t,n,i){let o=1;return e>n&&(o=Ze(e,n),t*o>i&&(o=Ze(t,i))),Je(o)}function tt(e){const t=document.getElementById("js-zoom-input");e=Math.round(100*e),t.value=e,t.previousElementSibling.textContent=`${e}%`}function nt(e,t,n){const i=N(),{x:o,y:r}=_(t,n),a=Je(i*e);Ge(o,r,a),tt(a)}function it({currentTarget:e}){e.classList.remove("visible"),e.previousElementSibling.classList.add("visible"),e.value<8&&(e.value=8)}document.getElementById("js-zoom-input").addEventListener("input",(({target:e})=>{const{canvasWidth:t,canvasHeight:n}=Me(),{x:i,y:o}=_(t/2,n/2),r=parseInt(e.value,10)||0,a=Je(r/100),s=Math.round(100*a);Ge(i,o,a),r>s&&(e.value=s),e.previousElementSibling.textContent=`${s}%`})),Qe.addEventListener("click",(e=>{const n=t("data-type",e.target,e.currentTarget);if(!n)return;const{canvasWidth:i,canvasHeight:o}=Me();nt("out"===n.attrValue?.8:1.25,i/2,o/2)})),Qe.addEventListener("focus",(({target:e})=>{if("SPAN"===e.nodeName){const t=e.nextElementSibling;e.classList.remove("visible"),t.classList.add("visible"),t.focus(),t.addEventListener("blur",it,{once:!0})}}),!0);const ot=document.getElementById("js-resizer-list");function rt(t,n,i){return new Promise((o=>{const r=new Image;r.onload=async function(){b({name:w(t.name),type:t.type,width:n,height:i,file:await e(r,t.type,{width:n,height:i})}),URL.revokeObjectURL(r.src),o()},r.src=URL.createObjectURL(t)}))}document.getElementById("js-resizer-option-btn").addEventListener("click",(()=>{ot.insertAdjacentHTML("beforeend",'\n    <li class="resizer-list-item">\n      <label class="resizer-list-option">\n        <div class="resizer-list-option-label">Width</div>\n        <input type="number" class="input resizer-list-option-input" min="1" data-type="width">\n      </label>\n      <label class="resizer-list-option">\n        <div class="resizer-list-option-label">Height</div>\n        <input type="number" class="input resizer-list-option-input" min="1" data-type="height">\n      </label>\n    </li>\n  ')})),ot.addEventListener("input",(({target:e})=>{const{checked:t}=document.getElementById("js-resizer-aspect-ratio"),n=parseInt(e.value||0,10);if(t){const t=e.getAttribute("data-type"),{aspectRatio:i}=te(),o="width"===t?"height":"width",r=e.parentElement.parentElement.querySelector(`[data-type=${o}]`);r.value="width"===t?Math.round(n/i):Math.round(n*i)}})),document.getElementById("js-resize-btn").addEventListener("click",(async()=>{const{children:e}=ot,{file:t}=te();for(const n of e){const[{value:e},{value:i}]=n.querySelectorAll("input");e&&i&&await rt(t,e,i)}}));a(359);"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").catch(console.log)})()})();