!function(e){function t(t){for(var i,a,s=t[0],c=t[1],l=t[2],u=0,m=[];u<s.length;u++)a=s[u],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&m.push(o[a][0]),o[a]=0;for(i in c)Object.prototype.hasOwnProperty.call(c,i)&&(e[i]=c[i]);for(d&&d(t);m.length;)m.shift()();return r.push.apply(r,l||[]),n()}function n(){for(var e,t=0;t<r.length;t++){for(var n=r[t],i=!0,s=1;s<n.length;s++){var c=n[s];0!==o[c]&&(i=!1)}i&&(r.splice(t--,1),e=a(a.s=n[0]))}return e}var i={},o={0:0},r=[];function a(t){if(i[t])return i[t].exports;var n=i[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.e=function(e){var t=[],n=o[e];if(0!==n)if(n)t.push(n[2]);else{var i=new Promise((function(t,i){n=o[e]=[t,i]}));t.push(n[2]=i);var r,s=document.createElement("script");s.charset="utf-8",s.timeout=120,a.nc&&s.setAttribute("nonce",a.nc),s.src=function(e){return a.p+""+({}[e]||e)+".js"}(e);var c=new Error;r=function(t){s.onerror=s.onload=null,clearTimeout(l);var n=o[e];if(0!==n){if(n){var i=t&&("load"===t.type?"missing":t.type),r=t&&t.target&&t.target.src;c.message="Loading chunk "+e+" failed.\n("+i+": "+r+")",c.name="ChunkLoadError",c.type=i,c.request=r,n[1](c)}o[e]=void 0}};var l=setTimeout((function(){r({type:"timeout",target:s})}),12e4);s.onerror=s.onload=r,document.head.appendChild(s)}return Promise.all(t)},a.m=e,a.c=i,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)a.d(n,i,function(t){return e[t]}.bind(null,i));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a.oe=function(e){throw console.error(e),e};var s=window.webpackJsonp=window.webpackJsonp||[],c=s.push.bind(s);s.push=t,s=s.slice();for(var l=0;l<s.length;l++)t(s[l]);var d=c;r.push([87,1]),n()}({58:function(e,t,n){},59:function(e,t,n){},87:function(e,t,n){"use strict";n.r(t);n(57),n(58),n(59);function i(e,t,{width:n,height:i}){return new Promise(o=>{const r=document.createElement("canvas");r.width=n,r.height=i,r.getContext("2d").drawImage(e,0,0,n,i),r.toBlob(o,t)})}function o(e,t,n=null){for(;t&&t!==n;){if(t.hasAttribute(e))return{elementRef:t,attrValue:t.getAttribute(e)};t=t.parentElement}}const r=document.getElementById("js-bottom-bar-rotation");let a=0;function s(e){return e>180&&(e-=360),e*Math.PI/180}function c(e){let t=Math.round(180*function(e){const t=2*Math.PI,n=-t;return e>t?e-=t:e<n&&(e-=n),e}(e)/Math.PI);return t<0&&(t+=360),360===t?0:t}function l(){return a}function d(e){const t=document.getElementById("js-rotation-input");t.value=e,t.previousElementSibling.textContent=e+"°"}function u({currentTarget:e}){e.classList.remove("visible"),e.previousElementSibling.classList.add("visible"),(e.value<0||e.value>359)&&(e.value=c(a))}document.getElementById("js-rotation-input").addEventListener("input",({target:e})=>{let t=parseInt(event.target.value,10)||0;t<0?t=0:t>360&&(t%=360);const n=c(function(e){return a=s(e),a}(t));requestAnimationFrame(xe),e.previousElementSibling.textContent=n+"°"}),r.addEventListener("click",e=>{const t=o("data-type",e.target,e.currentTarget);if(!t)return;const n=s(15);"left"===t.attrValue?a-=n:"right"===t.attrValue&&(a+=n);const i=c(a);requestAnimationFrame(xe),d(i)}),r.addEventListener("focus",({target:e})=>{if("SPAN"===e.nodeName){const t=e.nextElementSibling;e.classList.remove("visible"),t.classList.add("visible"),t.focus(),t.addEventListener("blur",u,{once:!0})}},!0);n(13),n(28);const m=new Worker("./ww.js");m.onmessage=async function(e){const{saveAs:t}=await n.e(2).then(n.t.bind(null,88,7));t(e.data,"images.zip")},m.onerror=function(e){console.log(e)};const g=document.getElementById("js-image-folder-list"),f=[],v={};let h=0;function p(e){const t=e.split("."),n=v[t[0]]||0;return v[t[0]]=n+1,t[0]+="-"+n,t.join(".")}function w(e){const t=document.getElementById("js-image-folder-item-count"),n=f.push(e);t.classList.remove("hidden"),t.innerText=n,function(){const e=document.createElement("div");e.classList.add("ping"),document.querySelector(".top-bar-image-folder-toggle-btn").appendChild(e),setTimeout(()=>{e.remove()},4e3)}(),g.insertAdjacentHTML("beforeend",`\n    <li class="image-folder-list-item" data-index="${n-1}">\n      <button class="image-folder-enlarge-btn" data-type="enlarge" title="Enlarge">\n        <image src=${URL.createObjectURL(e.file)} class="image-folder-list-item-image" alt="">\n      </button>\n      <button class="image-folder-remove-btn" data-type="remove" title="Remove">\n        <svg viewBox="0 0 24 24">\n          <use href="#remove"></use>\n        </svg>\n      </button>\n    </li>\n  `),document.getElementById("js-image-folder-message").classList.add("hidden"),g.classList.add("visible")}function y(e,t){return`${e.name} | ${t+1} / ${f.length} | ${e.width}x${e.height}`}function b({key:e}){"ArrowRight"===e?E(1):"ArrowLeft"===e?E(-1):"Delete"===e&&x()}function E(e){1===e?h=(h+1)%f.length:-1===e&&(h=0===h?f.length-1:h-1),L(h)}function L(e){const t=f[e],n=URL.createObjectURL(t.file),i=document.getElementById("js-image-folder-viewer-image");URL.revokeObjectURL(i.src),i.src=n,document.getElementById("js-image-folder-viewer-image-link").href=n,document.getElementById("js-image-folder-viewer-header").textContent=y(t,e)}function j(e){if(e.target===e.currentTarget)return void I();const t=o("data-type",e.target,e.currentTarget);if(!t)return;const{attrValue:n}=t;"close"===n?I():"next"===n?E(1):"previous"===n?E(-1):"remove"===n&&x()}function x(){document.querySelectorAll(".image-folder-list-item")[h].remove(),f.splice(h,1),B(),f.length?(h=h>=f.length-1?f.length-1:h,L(h)):I()}function I(){const e=document.getElementById("js-image-folder-viewer");e.removeEventListener("click",j),e.remove(),window.removeEventListener("keydown",b)}function B(){const e=document.getElementById("js-image-folder-item-count");if(0===f.length)document.getElementById("js-image-folder-message").classList.remove("hidden"),g.classList.remove("visible"),e.classList.add("hidden");else{const t=[...g.children];e.innerText=f.length,t.forEach((e,t)=>{e.setAttribute("data-index",t)})}}g.addEventListener("click",({target:e,currentTarget:t})=>{const n=o("data-type",e,t);if(!n)return;const i=o("data-index",e,t),{attrValue:r,elementRef:a}=i,{attrValue:s}=n;"enlarge"===s?(h=parseInt(r,10),function(e){const t=f[e],n=URL.createObjectURL(t.file);document.getElementById("js-editor").insertAdjacentHTML("beforeend",`\n    <div id="js-image-folder-viewer" class="js-top-bar-item image-folder-viewer">\n      <div id="js-image-folder-viewer-header" class="image-folder-viewer-header">${y(t,e)}</div>\n      <img src="${n}" id="js-image-folder-viewer-image" class="image-folder-viewer-image" alt="">\n      <div class="image-folder-viewer-footer">\n        <a href="${n}" id="js-image-folder-viewer-image-link" class="icon-btn-round" target="_blank" title="Open image in a new tab">\n          <svg viewBox="0 0 24 24">\n            <use href="#open-in-new"></use>\n          </svg>\n        </a>\n        <button class="icon-btn-round" data-type="previous" title="Previous image">\n          <svg viewBox="0 0 24 24">\n            <use href="#arrow-left"></use>\n          </svg>\n        </button>\n        <button class="icon-btn-round" data-type="next" title="Next image">\n          <svg viewBox="0 0 24 24">\n            <use href="#arrow-right"></use>\n          </svg>\n        </button>\n        <button class="icon-btn-round" data-type="remove" title="Remove image">\n          <svg viewBox="0 0 24 24">\n            <use href="#remove"></use>\n          </svg>\n        </button>\n      </div>\n      <button class="icon-btn-round image-folder-viewer-close-btn" data-type="close" title="Close">\n        <svg viewBox="0 0 24 24">\n          <use href="#close"></use>\n        </svg>\n      </button>\n    </div>\n  `),document.getElementById("js-image-folder-viewer").addEventListener("click",j),window.addEventListener("keydown",b)}(h)):"remove"===s&&(a.remove(),f.splice(r,1),B())}),document.getElementById("js-image-folder-download-btn").addEventListener("click",()=>{var e;e=f,m.postMessage(e)});let k={x:0,y:0,width:0,height:0},M="";function T(){return k}function S(e,t,n){return t?e+="w":n&&(e+="e"),e}function A(e,t){const n=k.x,i=k.y,o=n+k.width,r=i+k.height;if(M="",(e>=n-4&&e<=o+4||e<=n+4&&e>=o-4)&&(t>=i-4&&t<=r+4||t<=i+4&&t>=r-4)){const a=e>=o-4&&e<=o+4,s=t>=r-4&&t<=r+4,c=e>=n-4&&e<=n+4;t>=i-4&&t<=i+4?M=S("n",c,a):s?M=S("s",c,a):a?M="e":c&&(M="w")}return M}function R(e={}){k={x:0,y:0,width:0,height:0,...e}}function P(e,t){const n=k.x,i=k.y,o=n+k.width,r=i+k.height;return(e>=n&&e<=o||e<=n&&e>=o)&&(t>=i&&t<=r||t<=i&&t>=r)}let U=document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGMatrix(),z=null;function O(){return U}function $(){return U.a}function C(e,t){U=U.translate(e,t),z.translate(e,t)}function q(e,t,n,i,o,r){U.a=e,U.b=t,U.c=n,U.d=i,U.e=o,U.f=r,z.setTransform(e,t,n,i,o,r)}function H(e,t){return{x:(e-U.e)/U.a,y:(t-U.f)/U.a}}const V=document.getElementById("js-top-bar-crop-panel");function W(){return V.querySelectorAll("[data-value]")}function D(){const e=W();for(let t=0;t<e.length;t+=1)e[t].value=""}function F(){const e=W(),t=[];for(const n of e){if(!n.validity.valid)return;t.push(parseInt(n.value,10)||0)}if(4===t.length){const{a:e,e:n,f:i}=O(),o=T();o.x=t[0]*e+n,o.y=t[1]*e+i,o.width=t[2]*e,o.height=t[3]*e,requestAnimationFrame(xe),Se()}}V.addEventListener("change",F),document.getElementById("js-crop-panel-btn").addEventListener("click",F);const _=document.getElementById("js-top-bar-upload-panel"),N=document.getElementById("js-uploaded-images-file-input");let Y=[],X=0,K=null;function J(){return Y[X]}function G(){const[e]=Y;var t;Q(e),ne(document.querySelector(".uploaded-images-list-item")),te(e.name),t=e.blobUrl,le.insertAdjacentHTML("beforeend",'<canvas id="js-canvas"></canvas>'),le.classList.remove("hidden"),document.getElementById("js-intro").remove(),function(e){var t;ge=document.getElementById("js-canvas"),t=ge.getContext("2d"),z=t,Ee(),Re(e),ge.addEventListener("wheel",Be,{passive:!0}),ge.addEventListener("pointerdown",ke)}(t),window.addEventListener("resize",()=>{requestAnimationFrame(()=>{!function(){const e=O();Ee(),q(e.a,e.b,e.c,e.d,e.e,e.f)}(),xe()})}),ue.classList.toggle("visible",me)}function Q(e){document.getElementById("js-uploaded-images-preview").innerHTML=`\n    <div class="uploaded-images-preview-info">${e.name}</div>\n    <div class="uploaded-images-preview-info">${e.width}x${e.height}</div>\n    <img src="${e.blobUrl}" class="uploaded-images-preview-image" alt="">\n  `}async function Z(e){const[t]=e.splice(0,1),n=await(i=t,new Promise(e=>{const t=new Image,n=URL.createObjectURL(i);t.onload=function(){e({file:i,blobUrl:n,name:i.name,type:i.type,width:t.width,height:t.height,aspectRatio:t.width/t.height})},t.src=n}));var i;Y.push(n),function(e){const t=document.getElementById("js-uploaded-images-list"),n=Y.length-1;t.insertAdjacentHTML("beforeend",`\n    <li class="uploaded-images-list-item" data-index="${n}" data-type="image">\n        <button class="uploaded-images-list-btn">\n          <img src="${e.blobUrl}" class="uploaded-images-list-image">\n        </button>\n    </li>\n  `)}(n),function(){const e=document.createElement("div");e.classList.add("ping"),e.style.setProperty("--delay",2*Math.random()+"s"),document.getElementById("js-top-bar-upload-btn-container").appendChild(e),setTimeout(()=>{e.remove()},4e3)}(),e.length?Z(e):K||G()}function ee(e){const t=function(e){return e.filter(e=>e.type.includes("image"))}([...e]);t.length&&Z(t)}function te(e){document.title=e+" | Imagis"}function ne(e){K&&K.classList.remove("active"),K=e,K.classList.add("active")}function ie({target:e}){ee(e.files),e.value=""}N.addEventListener("change",ie),document.getElementById("js-intro-file-input").addEventListener("change",ie),_.addEventListener("click",e=>{const t=o("data-type",e.target,e.currentTarget);if(t&&"image"===t.attrValue){const e=parseInt(t.elementRef.getAttribute("data-index"),10),{file:n,blobUrl:i}=Y[e];e!==X&&(X=e,Q(Y[e]),ne(t.elementRef),te(n.name),D()),Re(i)}}),document.getElementById("js-intro-file-select-btn").addEventListener("click",()=>{document.getElementById("js-intro-file-input").click()}),document.getElementById("js-uploaded-images-upload-btn").addEventListener("click",()=>{N.click()}),window.addEventListener("drop",e=>{e.preventDefault(),e.dataTransfer.dropEffect="copy",ee(e.dataTransfer.files)}),window.addEventListener("dragover",e=>{e.preventDefault()});let oe="",re=!1;function ae(e){return document.getElementById(`js-top-bar-${e}-panel`)}function se(e){e.target.closest(".js-top-bar-item")||function(){const e=ae(oe);re=!1,oe="",e.classList.remove("visible"),window.removeEventListener("mousedown",se)}()}document.getElementById("js-top-bar-header").addEventListener("click",e=>{const t=o("data-panel-name",e.target,e.currentTarget);if(!t)return;const{attrValue:n}=t;if(oe){ae(oe).classList.remove("visible")}if(n===oe)re=!1,oe="",window.removeEventListener("mousedown",se);else{const e=ae(n);re=!0,oe=n,e.classList.add("visible"),window.addEventListener("mousedown",se),"crop"===n&&function(){const e=T();if(!e.width||!e.height)return;const{a:t,e:n,f:i}=O(),o=n/t,r=i/t;let a=e.x,s=e.width,c=e.y,l=e.height;s<0&&(a+=s,s*=-1),l<0&&(c+=l,l*=-1);const d=[Math.round(a/t-o),Math.round(c/t-r),Math.round(s/t),Math.round(l/t)],u=W();for(let e=0;e<u.length;e+=1)u[e].value=d[e]}()}});const ce=new Image,le=document.getElementById("js-editor"),de=document.getElementById("js-crop-btn"),ue=document.getElementById("js-selection-toggle-btn"),me=void 0!==window.orientation;let ge=null,fe=0,ve=0,he=null,pe="",we=!1,ye=!1;function be(){return{canvasWidth:fe,canvasHeight:ve}}function Ee(){const e=window.innerWidth,t=window.innerHeight;ge.width=e,ge.height=t,fe=e,ve=t}function Le(e){const t=l(),n=ce.width/2,i=ce.height/2;!function(e){e.save(),e.setTransform(1,0,0,1,0,0),e.clearRect(0,0,fe,ve),e.restore()}(e),e.save(),e.translate(n,i),e.rotate(t),e.translate(-n,-i),e.drawImage(ce,0,0,ce.width,ce.height),e.restore()}function je(e){const t=T(),n=Math.round(t.width),i=Math.round(t.height);let o,r=Math.round(t.x),a=Math.round(t.y);e.save(),e.lineWidth=1,e.strokeStyle="#006494",e.setTransform(1,0,0,1,0,0),n&&i&&(o=e.getImageData(r,a,n,i),n<0&&(r+=n),i<0&&(a+=i)),(n||i||we)&&function(e){e.fillStyle="rgba(0, 0, 0, .4)",e.fillRect(0,0,fe,ve)}(e),o&&e.putImageData(o,r,a),e.strokeRect(t.x+.5,t.y+.5,n,i),e.restore()}function xe(){const e=ge.getContext("2d");Le(e),je(e)}function Ie(e="default"){ge.style.cursor=e}function Be(e){Ve(e.deltaY>0?.8:1.25,e.clientX,e.clientY)}function ke(e){if(1!==e.which||re)return;const{clientX:t,clientY:n}=e,i=T(),o=i.width&&i.height,r=A(t,n);pe="select",we=o,e.shiftKey||ye?(he=H(t,n),pe="drag"):(e.ctrlKey||me)&&o&&P(t,n)?(he={x:t-i.x,y:n-i.y},pe="move"):r&&o?pe="resize":R({x:t,y:n}),requestAnimationFrame(xe),de.classList.remove("visible"),le.style.userSelect="none",window.addEventListener("pointermove",Me),window.addEventListener("pointerup",Te),window.removeEventListener("pointermove",Ae)}function Me(e){const{clientX:t,clientY:n}=e;switch(pe){case"select":!function(e,t){const n=T();n.width=e-n.x,n.height=t-n.y}(t,n);break;case"resize":!function(e,t){const n=T(),i=M;"n"===i[0]?(n.height=n.y-t+n.height,n.y=t):"s"===i[0]&&(n.height=t-n.y);i.includes("w")?(n.width=n.x-e+n.width,n.x=e):i.includes("e")&&(n.width=e-n.x)}(t,n);break;case"move":!function(e,t){const n=T();n.x=e-he.x,n.y=t-he.y}(t,n);break;case"drag":!function(e,t){if(he){const n=H(e,t);C(n.x-he.x,n.y-he.y)}}(t,n)}requestAnimationFrame(xe)}function Te(){const e=T();pe="",le.style.userSelect="auto",e.width&&e.height?Se():(we=!1,Le(ge.getContext("2d")),Ie(),D()),window.removeEventListener("pointermove",Me),window.removeEventListener("pointerup",Te)}function Se(){de.classList.add("visible"),window.addEventListener("pointermove",Ae)}function Ae(e){const{clientX:t,clientY:n}=e;if(e.ctrlKey)Ie(P(t,n)?"move":"default");else{const e=A(t,n);Ie(e?e+"-resize":"default")}}function Re(e){we=!1,de.classList.remove("visible"),a=0,d(0),R(),ce.onload=function(){!function(e){const{canvasWidth:t,canvasHeight:n}=be(),{width:i,height:o}=e;let r=$();r=i>o?qe(i,o,t,n):qe(o,i,n,t);(function(e,t){q(1,0,0,1,e,t)})((t-i*r)/2,(n-o*r)/2),Oe(0,0,r),He(r)}(ce)},ce.src=e}function Pe(e){const t=document.createElement("canvas"),n=t.getContext("2d"),{a:i,e:o,f:r}=O(),a={x:o/i,y:r/i},s=T(),c={x:Math.round(s.x/i),y:Math.round(s.y/i),width:Math.round(s.width/i),height:Math.round(s.height/i)};t.width=Math.round(fe/i),t.height=Math.round(ve/i),n.translate(a.x,a.y);const d=function(e,t,n){const i=l();if(n.save(),i){const t=e.width/2,o=e.height/2;n.translate(t,o),n.rotate(i),n.translate(-t,-o)}return n.drawImage(e,0,0,e.width,e.height),n.restore(),n.getImageData(t.x,t.y,t.width,t.height)}(e,c,n);return t.width=d.width,t.height=d.height,n.putImageData(d,0,0),t}function Ue(e,t){return new Promise(n=>{const i=Pe(e);i.toBlob(e=>{n({file:e,width:i.width,height:i.height})},t)})}de.addEventListener("click",()=>{const{file:e,blobUrl:t}=J(),n=new Image;n.onload=async function(){w({name:p(e.name),type:e.type,...await Ue(n,e.type)})},n.src=t}),ue.addEventListener("click",({currentTarget:e})=>{ye=!ye,e.textContent=ye?"Enable Selection":"Disabled Selection"});const ze=document.getElementById("js-bottom-bar-zoom");function Oe(e,t,n){C(e,t),function(e){U.a=1,U.d=1,U=U.scale(e,e),z.setTransform(U.a,0,0,U.a,U.e,U.f)}(n),C(-e,-t),requestAnimationFrame(xe)}function $e(e){return e<.08?e=.08:e>80&&(e=80),e}function Ce(e,t){return 1-1/(e/(e-t))}function qe(e,t,n,i){let o=1;return e>n&&(o=Ce(e,n),t*o>i&&(o=Ce(t,i))),$e(o)}function He(e){const t=document.getElementById("js-zoom-input");e=Math.round(100*e),t.value=e,t.previousElementSibling.textContent=e+"%"}function Ve(e,t,n){const i=$(),{x:o,y:r}=H(t,n),a=$e(i*e);Oe(o,r,a),He(a)}function We({currentTarget:e}){e.classList.remove("visible"),e.previousElementSibling.classList.add("visible"),e.value<8&&(e.value=8)}document.getElementById("js-zoom-input").addEventListener("input",({target:e})=>{const{canvasWidth:t,canvasHeight:n}=be(),{x:i,y:o}=H(t/2,n/2),r=parseInt(e.value,10)||0,a=$e(r/100),s=Math.round(100*a);Oe(i,o,a),r>s&&(e.value=s),e.previousElementSibling.textContent=s+"%"}),ze.addEventListener("click",e=>{const t=o("data-type",e.target,e.currentTarget);if(!t)return;const{canvasWidth:n,canvasHeight:i}=be();Ve("out"===t.attrValue?.8:1.25,n/2,i/2)}),ze.addEventListener("focus",({target:e})=>{if("SPAN"===e.nodeName){const t=e.nextElementSibling;e.classList.remove("visible"),t.classList.add("visible"),t.focus(),t.addEventListener("blur",We,{once:!0})}},!0);const De=document.getElementById("js-resizer-list");function Fe(e,t,n){return new Promise(o=>{const r=new Image;r.onload=async function(){w({name:p(e.name),type:e.type,width:t,height:n,file:await i(r,e.type,{width:t,height:n})}),URL.revokeObjectURL(r.src),o()},r.src=URL.createObjectURL(e)})}document.getElementById("js-resizer-option-btn").addEventListener("click",()=>{De.insertAdjacentHTML("beforeend",'\n    <li class="resizer-list-item">\n      <label class="resizer-list-option">\n        <div class="resizer-list-option-label">Width</div>\n        <input type="number" class="input resizer-list-option-input" min="1" data-type="width">\n      </label>\n      <label class="resizer-list-option">\n        <div class="resizer-list-option-label">Height</div>\n        <input type="number" class="input resizer-list-option-input" min="1" data-type="height">\n      </label>\n    </li>\n  ')}),De.addEventListener("input",({target:e})=>{const{checked:t}=document.getElementById("js-resizer-aspect-ratio"),n=parseInt(e.value||0,10);if(t){const t=e.getAttribute("data-type"),{aspectRatio:i}=J(),o="width"===t?"height":"width",r=e.parentElement.parentElement.querySelector(`[data-type=${o}]`);r.value="width"===t?Math.round(n/i):Math.round(n*i)}}),document.getElementById("js-resize-btn").addEventListener("click",async()=>{const{children:e}=De,{file:t}=J();for(const n of e){const[{value:e},{value:i}]=n.querySelectorAll("input");e&&i&&await Fe(t,e,i)}}),"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").catch(console.log)}});