!function e(t,n,i){function r(a,s){if(!n[a]){if(!t[a]){var u="function"==typeof require&&require;if(!s&&u)return u(a,!0);if(o)return o(a,!0);var c=new Error("Cannot find module '"+a+"'");throw c.code="MODULE_NOT_FOUND",c}var d=n[a]={exports:{}};t[a][0].call(d.exports,function(e){var n=t[a][1][e];return r(n?n:e)},d,d.exports,e,t,n,i)}return n[a].exports}for(var o="function"==typeof require&&require,a=0;a<i.length;a++)r(i[a]);return r}({1:[function(e,t,n){"use strict";function i(e){document.getElementById("js-quality-value").textContent=e}function r(e){l=e!==g,h=e,i(e)}function o(){l=!1,d.value=.92,i(g)}function a(){return l?h:g}function s(){return l}function u(e){var t=Number.parseFloat(e.target.value);r(t),(0,c.changeCanvasQuality)(t)}Object.defineProperty(n,"__esModule",{value:!0}),n.get=n.reset=n.useImageWithQuality=void 0;var c=e("./crop.js"),d=document.getElementById("js-crop-quality"),g=.92,l=!1,h=g;d.addEventListener("input",u,!1),n.useImageWithQuality=s,n.reset=o,n.get=a},{"./crop.js":2}],2:[function(e,t,n){"use strict";function i(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t["default"]=e,t}function r(e,t){e.disabled=t}function o(e){var t=document.getElementById("js-crop-ok"),n=document.getElementById("js-crop-preview-btn");r(t,e),r(n,e)}function a(e){var t=document.getElementById("js-crop-skip"),n=e>1;r(t,!n)}function s(e){var t=document.getElementById("js-crop-remaining");return"remove"===e?void(t.textContent=""):void(t.textContent=ae.images.length-1+" images remaining")}function u(e){document.getElementById("js-crop-image-name").textContent=e}function c(e,t,n){return e?je[n]>0?je[t]:je[t]+je[n]:0}function d(e,t){var n=xe.getRatio("width"),i=xe.getRatio("height");e=c(e,"x","width"),t=c(t,"y","height"),me.value=Math.round(e*n),ve.value=Math.round(t*i)}function g(e,t){e=Math.round(e*xe.getRatio("width")),t=Math.round(t*xe.getRatio("height")),fe.value=0>e?-e:e,pe.value=0>t?-t:t}function l(){return ue.useImageWithQuality()?void ge.drawImage(Ee.withQuality,0,0,de.width,de.height):void ge.drawImage(Ee.original,0,0,de.width,de.height)}function h(){ge.fillStyle="rgba(0, 0, 0, .4)",ge.fillRect(0,0,de.width,de.height)}function m(){var e=je,t=e.width&&e.height,n=e.x,i=e.y,r=void 0;t&&(r=ge.getImageData(n,i,e.width,e.height),e.width<0&&(n+=e.width),e.height<0&&(i+=e.height)),(n||i||t)&&h(),r&&ge.putImageData(r,n,i),ge.strokeStyle="#006494",ge.strokeRect(e.x+.5,e.y+.5,e.width,e.height)}function v(){l(),m()}function f(e){Ee.original.addEventListener("load",function(){var e=Ee.original.width,t=Ee.original.height,n=e/t,i=window.innerWidth-212,r=window.innerHeight-40,o=e,a=t;(0,re.toggleElement)("add",ce),o>i&&(o=i,a=o/n),a>r&&(a=r,o=a*n),de.width=o,de.height=a,ge.drawImage(Ee.original,0,0,de.width,de.height),xe.setRatio("width",e/de.width),xe.setRatio("height",t/de.height),de.classList.add("show")}),Ee.original.src=e}function p(){return{x:me.value,y:ve.value,width:fe.value,height:pe.value}}function w(e){var t=arguments.length<=1||void 0===arguments[1]?"image/jpeg":arguments[1],n=document.createElement("canvas"),i=n.getContext("2d"),r=p();n.width=e.width,n.height=e.height,i.drawImage(e,0,0,n.width,n.height);var o=i.getImageData(r.x,r.y,r.width,r.height);return n.width=o.width,n.height=o.height,i.putImageData(o,0,0),{uri:n.toDataURL(t,ue.get()),width:n.width,height:n.height}}function y(e){var t=new Image;t.addEventListener("load",function(){var n=w(t,e.type);ae.worker.postMessage({action:"add",image:{name:e.name.setByUser,type:e.type.slice(6),uri:n.uri}}),ae.images.length?ue.reset():(F(),ae.generateZip(),de.removeEventListener("mousedown",C,!1))}),t.src=e.uri}function E(e){var t=de.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}function j(e,t){var n=4,i=je.x,r=je.y,o=i+je.width,a=r+je.height,s=e>=i-n&&o+n>=e||i+n>=e&&e>=o-n,u=t>=r-n&&a+n>=t||r+n>=t&&t>=a-n,c=t>=r-n&&r+n>=t,d=e>=o-n&&o+n>=e,g=t>=a-n&&a+n>=t,l=e>=i-n&&i+n>=e;if(c){if(l)return"nw";if(d)return"ne";if(s)return"n"}if(g){if(d)return"se";if(l)return"sw";if(s)return"s"}if(u){if(d)return"e";if(l)return"w"}return""}function I(e,t){var n=je.x,i=je.y,r=n+je.width,o=i+je.height,a=e>=n&&r>=e||n>=e&&e>=r,s=t>=i&&o>=t||i>=t&&t>=o;return a&&s}function k(e){return 0>e?0:e>de.width?de.width:e}function b(e){return 0>e?0:e>de.height?de.height:e}function x(e){var t=je,n={},i=E(e),r=i.x,o=i.y,a="";switch(r=k(r),o=b(o),Ie){case"nw":n.x=r,n.y=o,n.width=t.x-r+t.width,n.height=t.y-o+t.height,a=A("nw","ne");break;case"ne":n.y=o,n.height=t.y-o+t.height,n.width=r-t.x,a=A("ne","nw");break;case"se":n.width=r-t.x,n.height=o-t.y,a=A("se","sw");break;case"sw":n.x=r,n.width=t.x-r+t.width,n.height=o-t.y,a=A("sw","se");break;case"n":n.y=o,n.height=t.y-o+t.height;break;case"e":n.width=r-t.x;break;case"s":n.height=o-t.y;break;case"w":n.x=r,n.width=t.x-r+t.width}a&&(de.style.cursor=a+"-resize"),Object.assign(je,n),requestAnimationFrame(v),d(je.x,je.y),g(je.width,je.height)}function B(e,t){var n=je[e],i=je[t],r=de[t];0>n&&(je[e]=0),n+i>r?je[e]=r-i:0>n+i?je[e]=-i:n>r&&(je[e]=r),d(je.x,je.y)}function L(e,t){var n=e-je.x,i=t-je.y;return function(e){if(e.ctrlKey){var t=E(e),r=t.x,o=t.y;je.x=r-n,je.y=o-i,B("x","width"),B("y","height"),requestAnimationFrame(v)}}}function C(e){if(1===e.which){var t=E(e),n=t.x,i=t.y,r=je.width&&je.height;Ie=j(n,i),l(),de.removeEventListener("mousemove",R,!1),document.removeEventListener("keydown",P,!1),Ie&&r?(m(),ce.addEventListener("mousemove",x,!1),ce.addEventListener("mouseup",T,!1)):e.ctrlKey&&I(n,i)?(ke=L(n,i),m(),ce.addEventListener("mousemove",ke,!1),ce.addEventListener("mouseup",_,!1)):(r&&h(),je.x=n,je.y=i,je.width=0,je.height=0,ce.addEventListener("mousemove",M,!1),ce.addEventListener("mouseup",N,!1))}}function M(e){var t=E(e),n=t.x,i=t.y;n=k(n),i=b(i),je.width=n-je.x,je.height=i-je.y,requestAnimationFrame(v),d(n,i),g(je.width,je.height)}function D(){de.style.cursor="default",document.removeEventListener("keyup",D,!1)}function P(e){e.ctrlKey&&I(ye.x,ye.y)&&(de.style.cursor="move",document.addEventListener("keyup",D,!1))}function O(){var e=xe.getRatio("width"),t=xe.getRatio("height");je.x=me.value/e,je.y=ve.value/t,je.width=fe.value/e,je.height=pe.value/t}function W(e,t){var n=je.width&&je.height;ce.removeEventListener("mousemove",e,!1),ce.removeEventListener("mouseup",t,!1),n?(de.addEventListener("mousemove",R,!1),document.addEventListener("keydown",P,!1)):(z(),l(),de.style.cursor="default"),o(!n)}function A(e,t){var n=je.x,i=je.y,r=n+je.width,o=i+je.height;if(r>n){if(i>o)return t}else if(o>i)return t;return e}function R(e){var t=E(e),n=t.x,i=t.y;if(ye.x=n,ye.y=i,e.ctrlKey&&I(n,i))return void(de.style.cursor="move");var r=j(n,i);switch(r){case"nw":r=A("nw","ne");break;case"ne":r=A("ne","nw");break;case"sw":r=A("sw","se");break;case"se":r=A("se","sw")}de.style.cursor=r?r+"-resize":"default"}function T(){W(x,T)}function _(){W(ke,_)}function N(){W(M,N)}function q(){var e=ae.images[0];ae.initWorker(),u(e.name.original),f(e.uri),o(!0),a(ae.images.length),de.addEventListener("mousedown",C,!1),ae.images.length>1&&s()}function S(e){de.classList.remove("show"),a(ae.images.length),o(!0),ae.images.length&&(z(),s(),u(e.name.original),setTimeout(function(){f(e.uri)},200))}function z(){je={},d(0,0),g(0,0)}function F(){ue.reset(),z(),s("remove"),(0,re.toggleElement)("remove",ce)}function Q(){var e=ae.images.splice(0,1)[0];y(e),S(ae.images[0])}function U(){ae.images.splice(0,1),ue.reset(),S(ae.images[0])}function V(){return be?(be=!1,(0,re.toggleElement)("remove",he),void setTimeout(function(){he.removeChild(he.children[0])},600)):(F(),void ae.worker.postMessage({action:"generate"}))}function H(){var e=w(Ee.original),t=new Image;be=!0,t.classList.add("crop-preview-image"),t.addEventListener("load",function(){var n=window.innerWidth-8,i=window.innerHeight-40,r=e.width,o=e.height,a=r/o;r>n&&(r=n,o=r/a),o>i&&(o=i,r=o*a),t.style.width=Math.floor(r)+"px",t.style.height=Math.floor(o)+"px",he.appendChild(t),(0,re.toggleElement)("add",he)}),t.src=e.uri}function $(){ce.classList.remove("preload"),window.removeEventListener("load",$,!1)}function K(e){var t=document.createElement("canvas"),n=t.getContext("2d");Ee.withQuality.addEventListener("load",function(){requestAnimationFrame(v)}),t.width=Ee.original.width,t.height=Ee.original.height,n.drawImage(Ee.original,0,0,t.width,t.height),Ee.withQuality.src=t.toDataURL("image/jpeg",e)}function Z(e,t){var n=e.selectionStart,i=e.selectionEnd,r=e.value;return r=n===i?r.slice(0,n)+t+r.slice(n,r.length):r.slice(0,n)+t+r.slice(i,r.length),Number.parseInt(r,10)}function J(){var e=je.width&&je.height;e&&requestAnimationFrame(v),o(!e)}function G(e,t,n){var i=xe.getRatio(n);e.value=Math.round(t*i)}function X(e,t,n){return je[n]<0?t-je[n]>de[n]?(t=de[n],e.preventDefault(),G(e.target,de[n]+je[n],n)):t-=je[n]:t+je[n]>de[n]&&(t=de[n]-je[n],e.preventDefault(),G(e.target,t,n)),t}function Y(e,t,n,i){return je[n]<0&&(je[i]=je[n]+je[i]),je[i]+t>de[n]&&(t=de[n]-je[i],e.preventDefault(),G(e.target,t,n)),t}function ee(e){if(e.key)return e.key;var t=e.keyCode||e.which;return t?8===t||13===t?t:String.fromCharCode(t):void 0}function te(e){var t=e.target,n=ee(e),i=t.getAttribute("data-input"),r="Backspace"===n||8===n,o="Enter"===n||13===n;if(i&&/\d/.test(n)){var a=xe.getRatio(i),s=Z(t,n);switch(s/=a,i){case"x":je[i]=X(e,s,"width");break;case"y":je[i]=X(e,s,"height");break;case"width":je[i]=Y(e,s,i,"x");break;case"height":je[i]=Y(e,s,i,"y")}return void J()}r||o||e.preventDefault()}function ne(e){var t=ee(e),n="Backspace"===t||8===t,i="Enter"===t||13===t;(n||i)&&(O(),J())}function ie(e){var t=e.target.getAttribute("data-btn");switch(t){case"crop":Q();break;case"preview":H();break;case"skip":U()}}Object.defineProperty(n,"__esModule",{value:!0}),n.changeCanvasQuality=n.init=void 0;var re=e("./main.js"),oe=e("./process.js"),ae=i(oe),se=e("./crop-quality.js"),ue=i(se),ce=document.getElementById("js-crop"),de=document.getElementById("js-canvas"),ge=de.getContext("2d"),le=document.getElementById("js-crop-close"),he=document.getElementById("js-crop-preview"),me=document.getElementById("js-crop-x"),ve=document.getElementById("js-crop-y"),fe=document.getElementById("js-crop-width"),pe=document.getElementById("js-crop-height"),we=document.getElementById("js-crop-data"),ye={},Ee={original:new Image,withQuality:new Image},je={},Ie="",ke="",be=!1,xe=function(){function e(e){return"x"===e?e="width":"y"===e&&(e="height"),n[e]}function t(e,t){n[e]=t}var n={};return{getRatio:e,setRatio:t}}();le.addEventListener("click",V,!1),we.addEventListener("keypress",te,!1),we.addEventListener("keyup",ne,!1),document.getElementById("js-crop-data-btns").addEventListener("click",ie,!1),window.addEventListener("load",$,!1),n.init=q,n.changeCanvasQuality=K},{"./crop-quality.js":1,"./main.js":4,"./process.js":5}],3:[function(e,t,n){"use strict";function i(e){y&&clearTimeout(y),y=setTimeout(function(){r()},e)}function r(){var e=arguments.length<=0||void 0===arguments[0]?"":arguments[0];requestAnimationFrame(function(){document.getElementById("js-msg").innerHTML=e}),e&&i(2e3)}function o(e){requestAnimationFrame(function(){document.getElementById("js-progress-label").textContent=e})}function a(e){h.value+=e}function s(){h.value=0}function u(){return 100===Math.round(h.value)}function c(){o(""),(0,l.toggleMasks)("remove")}function d(){(0,l.toggleMasks)("add"),n.isWorking=w=!0,(0,l.toggleElement)("add",h),(0,l.toggleElement)("remove",m),(0,l.toggleElement)("add",f)}function g(){n.isWorking=w=!1,(0,l.toggleElement)("remove",h),(0,l.toggleElement)("remove",f),s(),c()}Object.defineProperty(n,"__esModule",{value:!0}),n.removeMasksAndLabel=n.setProgressLabel=n.updateProgress=n.resetProgress=n.resetDropbox=n.showMessage=n.downloadBtn=n.progressBar=n.processBtn=n.isCanceled=n.beforeWork=n.isWorking=n.cancelBtn=n.isDone=void 0;var l=e("./main.js"),h=document.getElementById("js-progress"),m=document.getElementById("js-process"),v=document.getElementById("js-download"),f=document.getElementById("js-cancel"),p=!1,w=!1,y=void 0;n.isDone=u,n.cancelBtn=f,n.isWorking=w,n.beforeWork=d,n.isCanceled=p,n.processBtn=m,n.progressBar=h,n.downloadBtn=v,n.showMessage=r,n.resetDropbox=g,n.resetProgress=s,n.updateProgress=a,n.setProgressLabel=o,n.removeMasksAndLabel=c},{"./main.js":4}],4:[function(e,t,n){"use strict";function i(e,t,n){t.classList[e](n)}function r(e,t){i(e,t,"show")}function o(e){i(e,document.getElementById("js-dropbox-label"),"mask"),i(e,document.getElementById("js-selections-mask"),"mask")}Object.defineProperty(n,"__esModule",{value:!0}),n.toggleElement=n.changeClass=n.toggleMasks=void 0,e("./dropbox.js"),e("./selections.js"),e("./read.js"),e("./process.js"),n.toggleMasks=o,n.changeClass=i,n.toggleElement=r},{"./dropbox.js":3,"./process.js":5,"./read.js":6,"./selections.js":7}],5:[function(e,t,n){"use strict";function i(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t["default"]=e,t}function r(e,t){j.showMessage(e),(0,b.toggleElement)("add",t)}function o(){B||(n.worker=B=new Worker("js/workers/worker1.js"),B.onmessage=function(e){n.zip=L=e.data,j.isWorking=!1,j.removeMasksAndLabel(),r("Images are ready for downloading.",j.downloadBtn),B.postMessage({action:"remove"})},B.onerror=function(e){console.log(e)})}function a(e){try{saveAs(e,"images.zip")}catch(t){var n=document.createElement("script");n.setAttribute("src","js/libs/FileSaver.min.js"),document.getElementsByTagName("body")[0].appendChild(n),n.onload=function(){saveAs(e,"images.zip")}}}function s(e){return"width"===e?"height":"width"}function u(e,t,n){var i=s(e),r="same"===t[e]?t[i]:t[e],o=n[e];return r.includes("%")?o*(Number.parseInt(r,10)/100):"original"===r||r===e?Number.parseInt(o,10):r===i?Number.parseInt(n[i],10):Number.parseInt(r,10)}function c(e,t){var n=t.width/t.height,i=0,r=0;return e.width&&(i=u("width",e,t),e.height?"same"===e.width&&(r=i):r=i/n),!r&&e.height&&(r=u("height",e,t),e.width?i||"same"!==e.height||(i=r):i=r*n),{width:i,height:r}}function d(e,t,n){var i=n.width,r=n.height,o=document.createElement("canvas"),a=document.getElementById("js-image-quality").value/100;return o.width=i,o.height=r,o.getContext("2d").drawImage(e,0,0,i,r),o.toDataURL(t,a)}function g(){j.setProgressLabel("Generating Archive"),B.postMessage({action:"generate"})}function l(){setTimeout(function(){j.isCanceled||((0,b.toggleElement)("remove",j.progressBar),(0,b.toggleElement)("remove",j.cancelBtn),j.resetProgress(),g())},1e3)}function h(e,t){return function n(i,r){var o=i.splice(0,1)[0];if(j.updateProgress(r),B.postMessage({action:"add",image:{name:t.name.setByUser,uri:d(e,t.type,o),type:t.type.slice(6)}}),j.isDone()&&l(),i.length){var a=t.size*o.width*o.height/2e3+100;setTimeout(function(){j.isCanceled||n(i,r)},a)}}}function m(e,t){var n=100/(e.length*t.length);return function i(){var r=new Image,o=e.splice(0,1)[0];if(r.onload=function(){if(!j.isCanceled){var e=h(r,o),i={width:r.width,height:r.height},a=t.map(function(e){return c(e,i)});j.setProgressLabel("Processing: "+o.name.original),e(a,n)}},r.src=o.uri,e.length){var a=400*o.size+100;setTimeout(function(){j.isCanceled||i()},a)}}}function v(e){return e.length?(e=e.filter(function(e){return k.verifyValue(e.width,e.height)||k.verifyValue(e.height,e.width)}),e.length||r("No valid values",j.processBtn)):r("No dimensions specified",j.processBtn),e}function f(){for(var e=k.widthInputCointaner.children,t=k.heightInputContainer.children,n=[],i=0,r=e.length;r>i;i++){var o=e[i].value,a=t[i].value;(o||a)&&n.push({width:o,height:a})}return v(n)}function p(){var e=f();if(!e.length)return void j.resetDropbox();o(),j.beforeWork();var t=m(x,e);t(),k.saveToLocalStorage()}function w(){a(L)}function y(){j.isCanceled=!0,n.zip=L=null,x.length=0,j.resetDropbox(),j.showMessage("Work canceled")}Object.defineProperty(n,"__esModule",{value:!0}),n.generateZip=n.initWorker=n.processImages=n.worker=n.images=n.zip=void 0;var E=e("./dropbox.js"),j=i(E),I=e("./selections.js"),k=i(I),b=e("./main.js"),x=[],B=void 0,L=void 0;j.processBtn.addEventListener("click",p,!1),j.downloadBtn.addEventListener("click",w,!1),j.cancelBtn.addEventListener("click",y,!1),n.zip=L,n.images=x,n.worker=B,n.processImages=p,n.initWorker=o,n.generateZip=g},{"./dropbox.js":3,"./main.js":4,"./selections.js":7}],6:[function(e,t,n){"use strict";function i(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t["default"]=e,t}function r(){setTimeout(function(){return w.isCanceled?void 0:E.images.length?void(document.getElementById("js-crop-checkbox").checked?(w.resetDropbox(),I.init()):(w.resetProgress(),E.processImages())):(w.resetDropbox(),void w.showMessage("No images to process."))},1200)}function o(e){return e.includes("image")}function a(e){return e.slice(0,e.lastIndexOf("."))}function s(e){var t=document.getElementById("js-image-name").value||a(e),n=document.getElementById("js-image-name-seperator").value||"-";return t+n}function u(e){var t=new FileReader;t.readAsDataURL(e),t.onloadend=function(t){E.images.push({name:{original:e.name,setByUser:s(e.name)},type:e.type,size:e.size/1e6,uri:t.target.result})}}function c(e,t){var n=e[0];if(w.setProgressLabel("Reading: "+n.name),e=Array.prototype.slice.call(e,1),o(n.type)&&u(n),w.updateProgress(t),e.length||r(),e.length){var i=n.size/1e6*100+100;setTimeout(function(){w.isCanceled||c(e,t)},i)}}function d(e){var t=100/e.length;E.worker&&E.worker.postMessage({action:"remove"}),E.images.length&&(E.images.length=0),E.zip=null,w.isCanceled=!1,(0,f.toggleElement)("remove",w.downloadBtn),w.beforeWork(),c(e,t)}function g(e){var t=e.target.files;e.preventDefault(),t.length&&d(t)}function l(e){return b=0,(0,f.changeClass)("remove",e.target,"over"),e.stopPropagation(),e.preventDefault(),w.isWorking?void(e.dataTransfer.dropEffect="none"):(e.dataTransfer.dropEffect="copy",void d(e.dataTransfer.files))}function h(e){e.stopPropagation(),e.preventDefault()}function m(e){e.preventDefault(),w.isWorking||(b+=1,(0,f.changeClass)("add",e.target,"over"))}function v(e){w.isWorking||(b-=1,b||(0,f.changeClass)("remove",e.target,"over"))}var f=e("./main.js"),p=e("./dropbox.js"),w=i(p),y=e("./process.js"),E=i(y),j=e("./crop.js"),I=i(j),k=document.getElementById("js-dropbox"),b=0;document.getElementById("js-image-select").addEventListener("change",g,!1),k.addEventListener("dragover",h,!1),k.addEventListener("dragenter",m,!1),k.addEventListener("dragleave",v,!1),k.addEventListener("drop",l,!1),k.addEventListener("click",function(e){w.isWorking&&e.preventDefault()})},{"./crop.js":2,"./dropbox.js":3,"./main.js":4,"./process.js":5}],7:[function(e,t,n){"use strict";function i(){var e={numberOfInputs:w.value,widthInputValues:a(f.children),heightInputValues:a(p.children),imageName:y.value||"",imageNameSeperator:E.value||"",imageQuality:j.value};localStorage.setItem("selections",JSON.stringify(e))}function r(e,t){var n=/^\d+(px|%)?$|^same$|^original$|^width$|^height$/;return n.test(e)&&!("same"===e&&(!t||"same"===t))}function o(e,t){Array.prototype.forEach.call(e,function(e,n){e.value=t[n]})}function a(e){return Array.prototype.map.call(e,function(e){return e.value})}function s(){var e=document.createElement("input");return e.setAttribute("type","text"),e.classList.add("image-input"),e}function u(e){for(var t=document.createDocumentFragment(),n=0;e>n;n++)t.appendChild(s());return t}function c(e,t){var n=e.children.length;if(t>n){var i=t-n;e.appendChild(u(i))}else for(var r=n-t;r--;)n=e.children.length,e.removeChild(e.children[n-1])}function d(e){var t=Number.parseInt(e.target.value,10);c(f,t),c(p,t)}function g(e){var t=e.target;t.innerHTML="Settings"===t.innerHTML?"Selections":"Settings",(0,m.toggleElement)("toggle",document.getElementById("js-selections")),(0,m.toggleElement)("toggle",document.getElementById("js-settings"))}function l(e){e.target.classList.contains("image-input")&&document.getElementById("js-crop-checkbox").checked&&((0,v.showMessage)("Disable image cropping to change input values"),e.preventDefault())}function h(e){(0,v.showMessage)("Image quality set to: "+e.target.value+"%")}Object.defineProperty(n,"__esModule",{value:!0}),n.verifyValue=n.saveToLocalStorage=n.heightInputContainer=n.widthInputCointaner=void 0;var m=e("./main.js"),v=e("./dropbox.js"),f=document.getElementById("js-width-input-container"),p=document.getElementById("js-height-input-container"),w=document.getElementById("js-select"),y=document.getElementById("js-image-name"),E=document.getElementById("js-image-name-seperator"),j=document.getElementById("js-image-quality");!function(){var e=localStorage.getItem("selections");e&&(e=JSON.parse(e),w.value=e.numberOfInputs,c(f,e.numberOfInputs),c(p,e.numberOfInputs),o(f.children,e.widthInputValues),o(p.children,e.heightInputValues),y.value=e.imageName,E.value=e.imageNameSeperator,j.value=e.imageQuality)}(),w.addEventListener("click",d,!1),document.getElementById("js-input-container").addEventListener("keydown",l,!1),document.getElementById("js-settings-toggle").addEventListener("click",g,!1),j.addEventListener("input",h,!1),n.widthInputCointaner=f,n.heightInputContainer=p,n.saveToLocalStorage=i,n.verifyValue=r},{"./dropbox.js":3,"./main.js":4}]},{},[4]);