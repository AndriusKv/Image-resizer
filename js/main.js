!function e(t,r,n){function o(a,s){if(!r[a]){if(!t[a]){var c="function"==typeof require&&require;if(!s&&c)return c(a,!0);if(i)return i(a,!0);var u=new Error("Cannot find module '"+a+"'");throw u.code="MODULE_NOT_FOUND",u}var d=r[a]={exports:{}};t[a][0].call(d.exports,function(e){var r=t[a][1][e];return o(r?r:e)},d,d.exports,e,t,r,n)}return r[a].exports}for(var i="function"==typeof require&&require,a=0;a<n.length;a++)o(n[a]);return o}({1:[function(e,t,r){"use strict";function n(e){return e>180&&(e-=360),e*Math.PI/180}function o(e){var t=Math.round(180*e/Math.PI);return t<0&&(t+=360),t}function i(e){return u=n(e)}function a(e){var t=o(e);return u=0===t||360===t?0:e,t}function s(){return u}function c(){u=0}Object.defineProperty(r,"__esModule",{value:!0});var u=0;r.setInDegrees=i,r.setInRadians=a,r.get=s,r.reset=c},{}],2:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(){f.init()}function i(e){document.getElementById("js-crop-mouse-pos").textContent=e}function a(){i("")}function s(e){for(var t=arguments.length,r=Array(t>1?t-1:0),n=1;n<t;n++)r[n-1]=arguments[n];r.forEach(function(t){document.getElementById("js-cropper-"+t).disabled=e})}function c(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];s.apply(void 0,[!0].concat(t))}function u(e){return new Promise(function(t){var r=new Image;r.onload=function(){var n=P.getTransformed(),o=v.getCroppedCanvas(r,n);f.post({action:"add",image:{name:e.name.setByUser,type:e.type.slice(6),uri:o.toDataURL(e.type,_.get())}}),t()},r.src=e.uri})}function d(){var e=document.getElementById("js-crop-message");e.classList.add("visible"),u(E.getActive()).then(function(){setTimeout(function(){e.classList.remove("visible")},200)})}function l(){var e=P.getTransformed(),t=m.image.get(_.useImageWithQuality()),r=v.getCroppedCanvas(t,e),n=r.toDataURL("image/jpeg");w.show(n)}Object.defineProperty(r,"__esModule",{value:!0}),r.disableButton=r.toggleButton=r.hideMousePosition=r.setMousePosition=r.init=void 0;var p=e("./../editor.worker.js"),f=n(p),g=e("./cropper.js"),v=n(g),h=e("./cropper.canvas.js"),m=n(h),j=e("./cropper.right-bar.js"),b=n(j),y=e("./cropper.preview.js"),w=n(y),x=e("./cropper.images.js"),E=n(x),I=e("./cropper.selected-area.js"),P=n(I),L=e("./cropper.quality.js"),_=n(L);document.getElementById("js-crop-bottom-btns").addEventListener("click",function(e){var t=e.target,r=t.getAttribute("data-btn");switch(r){case"crop":d();break;case"preview":l();break;case"toggle":b.toggle(t)}}),r.init=o,r.setMousePosition=i,r.hideMousePosition=a,r.toggleButton=s,r.disableButton=c},{"./../editor.worker.js":26,"./cropper.canvas.js":6,"./cropper.images.js":9,"./cropper.js":10,"./cropper.preview.js":12,"./cropper.quality.js":13,"./cropper.right-bar.js":15,"./cropper.selected-area.js":17}],3:[function(e,t,r){"use strict";function n(){return p.getContext("2d")}function o(){return{width:p.width,height:p.height}}function i(){p.width=window.innerWidth,p.height=window.innerHeight-56}function a(e,t){p.addEventListener(e,t)}function s(e,t){p.removeEventListener(e,t)}function c(){p.classList.add("visible")}function u(){p.classList.remove("visible")}function d(){var e=arguments.length<=0||void 0===arguments[0]?"default":arguments[0];p.style.cursor=e}function l(e){var t=e.clientX,r=e.clientY,n=p.getBoundingClientRect(),o=n.left,i=n.top;return{x:t-o,y:r-i}}Object.defineProperty(r,"__esModule",{value:!0});var p=document.getElementById("js-canvas");r.getDimensions=o,r.resetDimensions=i,r.show=c,r.hide=u,r.getContext=n,r.addEventListener=a,r.removeEventListener=s,r.setCursor=d,r.getMousePosition=l},{}],4:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(e){e?(E.addEventListener("mousemove",m),window.addEventListener("keydown",v)):(E.removeEventListener("mousemove",m),window.removeEventListener("keydown",v))}function i(){var e=arguments.length<=0||void 0===arguments[0]?N:arguments[0],t=document.getElementById("js-crop"),r=e===N;r?(N="",t.removeEventListener("mousemove",a),t.removeEventListener("mouseup",s)):(N=e,t.addEventListener("mousemove",a),t.addEventListener("mouseup",s)),o(r)}function a(e){e.target!==document.getElementById("js-canvas")&&e.preventDefault();var t=E.getMousePosition(e),r=t.x,n=t.y,o=A.get();switch(N){case"select":c(o,r,n);break;case"resize":u(o,r,n);break;case"rotate":l(o,r,n);break;case"move":if(!e.ctrlKey)return;p(r,n);break;case"drag":if(!e.shiftKey)return;f(r,n)}o.width&&o.height&&"rotate"!==N&&b.updateTransformedArea(o),requestAnimationFrame(b.draw)}function s(){var e=A.get(),t=e.width&&e.height;if(i(),!t){var r=A.reset(),n=P.image.get(q.useImageWithQuality()),o=E.getContext();P.drawImage(o,n),E.setCursor(),O.update(r)}A.containsArea(t),_.toggleButton(!t,"crop","preview")}function c(e,t,r){A.setProp("width",t-e.x),A.setProp("height",r-e.y),A.containsArea(!0)}function u(e,t,r){var n=T.get();if(n.indexOf("n")!==-1?(A.setProp("height",e.y-r+e.height),A.setProp("y",r)):n.indexOf("s")!==-1&&A.setProp("height",r-e.y),n.indexOf("w")!==-1?(A.setProp("width",e.x-t+e.width),A.setProp("x",t)):n.indexOf("e")!==-1&&A.setProp("width",t-e.x),n.length>1){var o=T.reverse(n,e);E.setCursor(o+"-resize")}}function d(e,t,r){var n=e.x+e.width/2,o=e.y+e.height/2;return Math.atan2(o-r,n-t)}function l(e,t,r){var n=d(e,t,r),o=k.setInRadians(n);O.setValue("angle",o)}function p(e,t){var r=b.mousePosition.get();A.setProp("x",e-r.x),A.setProp("y",t-r.y)}function f(e,t){var r=b.mousePosition.get();if(r){var n=E.getContext(),o=w.getTransformedPoint(e,t);w.translate(n,o.x-r.x,o.y-r.y)}}function g(){E.setCursor(),window.removeEventListener("keyup",g)}function v(e){var t=k.get(),r=A.get(),n=b.mousePosition.get(),o=n.x,i=n.y;e.ctrlKey&&A.isInside(r,o,i,t)&&E.setCursor("move"),window.addEventListener("keyup",g)}function h(e,t,r){var n=T.getReal(t,r,e),o=n?n+"-resize":"default";E.setCursor(o)}function m(e){var t=E.getMousePosition(e),r=t.x,n=t.y,o=A.get();if(b.mousePosition.set({x:r,y:n}),o.width&&o.height){var i=k.get();if(e.ctrlKey){var a="default";return A.isInside(o,r,n,i)&&(a="move"),void E.setCursor(a)}i||h(o,r,n)}}Object.defineProperty(r,"__esModule",{value:!0}),r.toggleCursorEvents=r.toggleEvent=void 0;var j=e("./cropper.js"),b=n(j),y=e("./cropper.canvas-transform.js"),w=n(y),x=e("./cropper.canvas-element.js"),E=n(x),I=e("./cropper.canvas.js"),P=n(I),L=e("./cropper.bottom-bar.js"),_=n(L),M=e("./cropper.data-input.js"),O=n(M),C=e("./cropper.selected-area.js"),A=n(C),B=e("./cropper.direction.js"),T=n(B),D=e("./cropper.angle.js"),k=n(D),V=e("./cropper.quality.js"),q=n(V),N="";r.toggleEvent=i,r.toggleCursorEvents=o},{"./cropper.angle.js":1,"./cropper.bottom-bar.js":2,"./cropper.canvas-element.js":3,"./cropper.canvas-transform.js":5,"./cropper.canvas.js":6,"./cropper.data-input.js":7,"./cropper.direction.js":8,"./cropper.js":10,"./cropper.quality.js":13,"./cropper.selected-area.js":17}],5:[function(e,t,r){"use strict";function n(){return g}function o(e,t){g.a=1,g.d=1,g=g.scale(t,t),e.setTransform(g.a,0,0,g.a,g.e,g.f)}function i(e,t,r){g=g.translate(t,r),e.translate(t,r)}function a(e){i(e,f.x,f.y)}function s(e,t){var r=p.createSVGPoint();return r.x=e,r.y=t,r.matrixTransform(g.inverse())}function c(e,t,r,n,o,i,a){g.a=t,g.b=r,g.c=n,g.d=o,g.e=i,g.f=a,e.setTransform(t,r,n,o,i,a)}function u(e){c(e,1,0,0,1,0,0),a(e)}function d(e,t){return f.x=e,f.y=t,f}function l(){return f}Object.defineProperty(r,"__esModule",{value:!0});var p=document.createElementNS("http://www.w3.org/2000/svg","svg"),f={},g=p.createSVGMatrix();r.get=n,r.set=c,r.reset=u,r.setDefaultTranslation=d,r.getTranslated=l,r.scale=o,r.translate=i,r.getTransformedPoint=s},{}],6:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(e,t,r){e.fillStyle="rgba(0, 0, 0, .4)",e.fillRect(0,0,t,r)}function i(e,t){v(e),e.drawImage(t,0,0,t.width,t.height)}function a(e,t){e.strokeRect(t.x+.5,t.y+.5,t.width,t.height)}function s(e,t,r,n){var i=r.width,s=r.height,c=t.width,u=t.height,d=c&&u,l=t.x,p=t.y,f=void 0;d&&(f=e.getImageData(l,p,c,u),c<0&&(l+=c),u<0&&(p+=u)),(d||n)&&o(e,i,s),f&&e.putImageData(f,l,p),a(e,t)}function c(e,t,r,n){var o=r.width,i=r.height,a=t.width>0?t.width:-t.width,s=t.height>0?t.height:-t.height;e.save(),e.translate(t.x+.5+t.width/2,t.y+.5+t.height/2),e.rotate(n),e.strokeRect(-t.width/2,-t.height/2,t.width,t.height),e.beginPath(),e.rect(-a/2,-s/2,a,s),e.restore(),e.rect(o,0,-o,i),e.fillStyle="rgba(0, 0, 0, .4)",e.fill()}function u(e,t,r,n){var o=p.getContext(),a=p.getDimensions();i(o,e),o.save(),o.lineWidth=1,o.strokeStyle="#006494",o.setTransform(1,0,0,1,0,0),r?c(o,t,a,r):s(o,t,a,n),o.restore()}function d(e,t){var r=f.get();return g.draw(e),new Promise(function(n){r.onload=function(){t(r),p.show(),n()},r.src=e})}Object.defineProperty(r,"__esModule",{value:!0}),r.spareCanvas=r.removeEventListener=r.addEventListener=r.drawCanvas=r.drawImage=r.drawInitialImage=r.image=void 0;var l=e("./cropper.canvas-element.js"),p=n(l),f=function(){function e(e){return e?r:t}var t=new Image,r=new Image;return{get:e}}(),g=function(e){function t(e){var t=new Image;t.onload=function(){n.width=t.width,n.height=t.height,o.drawImage(t,0,0,t.width,t.height)},t.src=e}function r(t,r){if(!i){var o=e.get(!0);i=!0,o.onload=function(){requestAnimationFrame(function(){r(),i=!1})},o.src=n.toDataURL("image/jpeg",t)}}var n=document.createElement("canvas"),o=n.getContext("2d"),i=!1;return{draw:t,adjustQuality:r}}(f),v=function(e){var t=new Image,r=void 0;return t.onload=function(){r=e.createPattern(t,"repeat")},t.src="assets/images/pattern.png",function(e){var t=p.getDimensions(),n=t.width,o=t.height;e.fillStyle=r,e.save(),e.setTransform(1,0,0,1,0,0),e.fillRect(0,0,n,o),e.restore()}}(p.getContext());r.image=f,r.drawInitialImage=d,r.drawImage=i,r.drawCanvas=u,r.addEventListener=addEventListener,r.removeEventListener=removeEventListener,r.spareCanvas=g},{"./cropper.canvas-element.js":3}],7:[function(e,t,r){"use strict";function n(e){return document.getElementById("js-crop-"+e)}function o(e){var t=n(e);return t.value}function i(e,t){var r=n(e);"string"==typeof r.value?r.value=t:r.textContent=t}function a(e,t){return e?t>0?e:t+e:0}function s(e){var t=a(e.x,e.width),r=a(e.y,e.height);i("x",Math.floor(t)),i("y",Math.floor(r))}function c(e,t){e=Math.floor(e),t=Math.floor(t),i("width",e<0?-e:e),i("height",t<0?-t:t)}function u(e){s(e),c(e.width,e.height)}Object.defineProperty(r,"__esModule",{value:!0}),r.getValue=o,r.setValue=i,r.update=u},{}],8:[function(e,t,r){"use strict";function n(){return c}function o(e,t,r){return t?e+="w":r&&(e+="e"),e}function i(e,t){var r=t.x,n=t.y,o=r+t.width,i=n+t.height;return o>r&&i<n||o<r&&i>n?"w"===e[1]?e[0]+"e":e[0]+"w":e}function a(e,t,r){var n=s(e,t,r);return n.length<2?n:i(n,r)}function s(e,t,r){var n=4,i=r.x,a=r.y,s=i+r.width,u=a+r.height,d=e>=i-n&&e<=s+n||e<=i+n&&e>=s-n,l=t>=a-n&&t<=u+n||t<=a+n&&t>=u-n;if(c="",d&&l){var p=t>=a-n&&t<=a+n,f=e>=s-n&&e<=s+n,g=t>=u-n&&t<=u+n,v=e>=i-n&&e<=i+n;p?c=o("n",v,f):g?c=o("s",v,f):f?c="e":v&&(c="w")}return c}Object.defineProperty(r,"__esModule",{value:!0});var c="";r.get=n,r.getReal=a,r.set=s,r.reverse=i},{}],9:[function(e,t,r){"use strict";function n(){return c}function o(e){c=e.map(function(e,t){return e.index=t,e})}function i(e){u=e}function a(){return u}function s(e){return c[e]}Object.defineProperty(r,"__esModule",{value:!0});var c=[],u=null;r.getAll=n,r.set=o,r.setActive=i,r.getActive=a,r.getByIndex=s},{}],10:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(e,t,r,n,o){if(r.save(),n){var i=t.x+t.width/2,a=t.y+t.height/2;r.translate(i,a),r.rotate(-n),r.translate(-i,-a)}return r.drawImage(e,0,0,e.width,e.height),r.restore(),r.getImageData(t.x+o.x,t.y+o.y,t.width,t.height)}function i(e,t){var r=document.createElement("canvas"),n=r.getContext("2d"),i=j.getTranslated();r.width=e.width+2*i.x,r.height=e.height+2*i.y,n.translate(i.x,i.y);var a=o(e,t,n,U.get(),i);return r.width=a.width,r.height=a.height,n.putImageData(a,0,0),r}function a(e,t){var r=j.getTransformedPoint(e.x,e.y),n=r.x,o=r.y,i=j.getTransformedPoint(e.x+e.width,e.y+e.height),a=i.x-n,s=i.y-o,c=z.setTransformed({x:n,y:o,width:a,height:s});t&&(c.x=0,c.y=0),V.update(c)}function s(e){y[e+"EventListener"]("wheel",g,{passive:!0}),y[e+"EventListener"]("mousedown",l),y[e+"EventListener"]("mousemove",v),y[e+"EventListener"]("mouseleave",M.hideMousePosition)}function c(e){D.set(e),y.resetDimensions(),d(e[0]),L.init(e),M.init(),B.enable(),s("add"),G.show()}function u(){var e=x.image.get(K.useImageWithQuality()),t=U.get(),r=z.get(),n=z.isDrawn();x.drawCanvas(e,r,t,n),C.isVisible()&&r.width&&r.height&&C.preview.draw(e,r,t)}function d(e){I.displayImageName(e.name.original),M.disableButton("crop","preview"),x.drawInitialImage(e.uri,Z.scaleImageToFitCanvas).then(function(){var e=j.getTranslated();z.setDefaultPos(e.x,e.y)})}function l(e){if(1===e.which){var t=y.getMousePosition(e),r=t.x,n=t.y,o=z.get(),i=o.width&&o.height,a=U.get(),s=R.set(r,n,o),c="select";if(e.shiftKey)H.set(j.getTransformedPoint(r,n)),c="drag";else if(e.ctrlKey&&i)z.isInside(o,r,n,a)?(H.set({x:r-o.x,y:n-o.y}),c="move"):c="rotate";else if(s&&i&&!a)c="resize";else{p(),z.setProp("x",r),z.setProp("y",n);var d=j.getTransformedPoint(r,n);V.update({x:d.x,y:d.y,width:0,height:0})}N.toggleEvent(c),requestAnimationFrame(u)}}function p(){z.reset(),U.reset(),V.setValue("angle",0),C.preview.clean()}function f(){K.reset(),V.setValue("scale",100),V.setValue("quality",.92),V.setValue("quality-display",.92),p(),a(z.get(),!0)}function g(e){var t=y.getMousePosition(e),r=t.x,n=t.y,o=j.getTransformedPoint(r,n),i=Number.parseInt(V.getValue("scale"),10)||100,a=e.deltaY>0?.8:1.25,s=Z.adjustScale(Math.floor(i*a));Z.scaleImage(o.x,o.y,s)}function v(e){var t=y.getMousePosition(e),r=t.x,n=t.y,o=j.getTransformedPoint(r,n),i=Math.floor(o.x),a=Math.floor(o.y);M.setMousePosition(i+", "+a)}function h(e){f(),z.containsArea(!1),y.hide(),setTimeout(function(){d(e)},240)}Object.defineProperty(r,"__esModule",{value:!0}),r.toggleCanvasElementEventListeners=r.loadNextImage=r.resetData=r.getCroppedCanvas=r.updateTransformedArea=r.mousePosition=r.cropperElement=r.draw=r.init=void 0;var m=e("./cropper.canvas-transform.js"),j=n(m),b=e("./cropper.canvas-element.js"),y=n(b),w=e("./cropper.canvas.js"),x=n(w),E=e("./cropper.top-bar.js"),I=n(E),P=e("./cropper.left-bar.js"),L=n(P),_=e("./cropper.bottom-bar.js"),M=n(_),O=e("./cropper.right-bar.js"),C=n(O),A=e("./cropper.resize.js"),B=n(A),T=e("./cropper.images.js"),D=n(T),k=e("./cropper.data-input.js"),V=n(k),q=e("./cropper.canvas-events.js"),N=n(q),S=e("./cropper.selected-area.js"),z=n(S),F=e("./cropper.direction.js"),R=n(F),W=e("./cropper.angle.js"),U=n(W),Q=e("./cropper.quality.js"),K=n(Q),$=e("./cropper.scale.js"),Z=n($),G=function(){function e(){r.classList.add("visible")}function t(){r.classList.remove("visible")}var r=document.getElementById("js-crop");return{show:e,hide:t}}(),H=function(){function e(e){r=e}function t(){return r}var r=null;return{set:e,get:t}}();r.init=c,r.draw=u,r.cropperElement=G,r.mousePosition=H,r.updateTransformedArea=a,r.getCroppedCanvas=i,r.resetData=f,r.loadNextImage=h,r.toggleCanvasElementEventListeners=s},{"./cropper.angle.js":1,"./cropper.bottom-bar.js":2,"./cropper.canvas-element.js":3,"./cropper.canvas-events.js":4,"./cropper.canvas-transform.js":5,"./cropper.canvas.js":6,"./cropper.data-input.js":7,"./cropper.direction.js":8,"./cropper.images.js":9,"./cropper.left-bar.js":11,"./cropper.quality.js":13,"./cropper.resize.js":14,"./cropper.right-bar.js":15,"./cropper.scale.js":16,"./cropper.selected-area.js":17,"./cropper.top-bar.js":18}],11:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(e){g.innerHTML=e.map(function(e){return'\n            <li class="left-bar-thumbnail" data-index="'+e.index+'">\n                <img src="'+e.uri+'" class="left-bar-thumbnail-image">\n            </li>\n        '}).join("\n"),c(0,g.children)}function i(){var e=document.getElementById("js-crop-left-bar");e.classList.toggle("hidden"),v=!e.classList.contains("hidden")}function a(){return v}function s(e){var t=!0,r=!1,n=void 0;try{for(var o,i=e[Symbol.iterator]();!(t=(o=i.next()).done);t=!0){var a=o.value;if(a.classList.contains("active"))return void a.classList.remove("active")}}catch(s){r=!0,n=s}finally{try{!t&&i["return"]&&i["return"]()}finally{if(r)throw n}}}function c(e,t){var r=l.getByIndex(e);f.loadNextImage(r),l.setActive(r),t[e].classList.add("active")}function u(e,t,r){for(;e!==r;){var n=e.getAttribute(t);if(n)return{element:e,attrValue:n};e=e.parentElement}}Object.defineProperty(r,"__esModule",{value:!0}),r.isVisible=r.toggle=r.init=void 0;var d=e("./cropper.images.js"),l=n(d),p=e("./cropper.js"),f=n(p),g=document.getElementById("js-left-bar-thumbnails"),v=!0;g.addEventListener("click",function(e){var t=e.target,r=u(t,"data-index",g);r&&!r.element.classList.contains("active")&&(s(g.children),c(r.attrValue,g.children))}),r.init=o,r.toggle=i,r.isVisible=a},{"./cropper.images.js":9,"./cropper.js":10}],12:[function(e,t,r){"use strict";function n(e){var t=new Image;t.onload=function(){var e=t.width,r=t.height,n=window.innerWidth-8,o=window.innerHeight-8,i=e/r;e>n&&(e=n,r=Math.floor(e/i)),r>o&&(r=o,e=Math.floor(r*i)),t.style.width=e+"px",t.style.height=r+"px"},t.src=e,a.appendChild(t),i.classList.add("visible")}function o(){i.classList.remove("visible"),setTimeout(function(){a.removeChild(a.lastElementChild)},600)}Object.defineProperty(r,"__esModule",{value:!0});var i=document.getElementById("js-crop-preview"),a=i.firstElementChild;document.getElementById("js-crop-preview-close").addEventListener("click",o),r.show=n},{}],13:[function(e,t,r){"use strict";function n(e){c=e<s,u=e}function o(){c=!1}function i(){return c?u:s}function a(){return c}Object.defineProperty(r,"__esModule",{value:!0});var s=.92,c=!1,u=s;r.get=i,r.set=n,r.reset=o,r.useImageWithQuality=a},{}],14:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(){var e=l.getContext(),t=f.get();l.resetDimensions(),f.set(e,t.a,t.b,t.c,t.d,t.e,t.f)}function i(){g||(g=!0,requestAnimationFrame(function(){o(),u.draw(),g=!1}))}function a(){window.addEventListener("resize",i)}function s(){window.removeEventListener("resize",i)}Object.defineProperty(r,"__esModule",{value:!0}),r.disable=r.enable=void 0;var c=e("./cropper.js"),u=n(c),d=e("./cropper.canvas-element.js"),l=n(d),p=e("./cropper.canvas-transform.js"),f=n(p),g=!1;r.enable=a,r.disable=s},{"./cropper.canvas-element.js":3,"./cropper.canvas-transform.js":5,"./cropper.js":10}],15:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(){return A}function i(e,t){if("scale"===e){var r=m.getDimensions(),n=r.width,o=r.height;return t=t?O.adjustScale(t):100,void O.scaleImage(n/2,o/2,t)}"angle"===e?P.setInDegrees(t):E.update(e,t,v.get());var i=E.get(),a=i.width&&i.height;f.toggleButton(!a,"crop","preview"),a&&requestAnimationFrame(l.draw)}function a(e){if(e.key)return e.key;var t=e.keyCode||e.which;return t?8===t||13===t?t:String.fromCharCode(t):void 0}function s(e){var t=e.target,r=a(e),n=t.getAttribute("data-input"),o="Backspace"===r||8===r,s="Enter"===r||13===r;if(n&&/\d|-/.test(r)){var c="-"===r||45===r;if(c&&"x"!==n&&"y"!==n)return void e.preventDefault()}else if(s)i(n,Number.parseInt(t.value,10));else if(!o)return void e.preventDefault()}function c(e){var t=Number.parseFloat(e.target.value);b.spareCanvas.adjustQuality(t,l.draw),w.setValue("quality-display",t),_.set(t)}function u(e){var t=document.getElementById("js-crop-right-bar"),r=t.classList;A=!A,e.classList.toggle("icon-angle-double-left"),e.classList.toggle("icon-angle-double-right"),r.toggle("hide")}Object.defineProperty(r,"__esModule",{value:!0}),r.preview=r.isVisible=r.toggle=void 0;var d=e("./cropper.js"),l=n(d),p=e("./cropper.bottom-bar.js"),f=n(p),g=e("./cropper.canvas-transform.js"),v=n(g),h=e("./cropper.canvas-element.js"),m=n(h),j=e("./cropper.canvas.js"),b=n(j),y=e("./cropper.data-input.js"),w=n(y),x=e("./cropper.selected-area.js"),E=n(x),I=e("./cropper.angle.js"),P=n(I),L=e("./cropper.quality.js"),_=n(L),M=e("./cropper.scale.js"),O=n(M),C=document.getElementById("js-crop-data"),A=!0,B=function(e){function t(e,t,r,n){var o=e/t;return e>=t&&(e=r,t=e/o),(e<t||t>n)&&(t=n,e=t*o),{width:e,height:t}}function r(){c.clearRect(0,0,u,d)}function n(t){var r=document.createElement("canvas"),n=e.getTranslated(),o=n.x,i=n.y;return r.width=t.width+2*o,r.height=t.height+2*i,r.getContext("2d")}function o(t,r,o){var i=e.get(),a=n(t);if(a.save(),o){var s=r.x+r.width/2,c=r.y+r.height/2;a.translate(s,c),a.rotate(-o),a.translate(-s,-c)}return a.translate(i.e,i.f),a.scale(i.a,i.a),a.drawImage(t,0,0,t.width,t.height),a.restore(),a.getImageData(r.x,r.y,r.width,r.height)}function i(e){var r=document.createElement("canvas"),n=r.getContext("2d"),o=t(e.width,e.height,u,d),i=o.width,a=o.height,s=(u-i)/2,l=(d-a)/2;r.width=e.width,r.height=e.height,n.putImageData(e,0,0),c.drawImage(r,s,l,i,a)}function a(e,t,n){var a=o(e,t,n);r(),i(a)}var s=document.getElementById("js-right-bar-preview"),c=s.getContext("2d"),u=192,d=150;return s.width=u,s.height=d,{clean:r,draw:a}}(v);C.addEventListener("keypress",s),document.getElementById("js-crop-quality").addEventListener("input",c),r.toggle=u,r.isVisible=o,r.preview=B},{"./cropper.angle.js":1,"./cropper.bottom-bar.js":2,"./cropper.canvas-element.js":3,"./cropper.canvas-transform.js":5,"./cropper.canvas.js":6,"./cropper.data-input.js":7,"./cropper.js":10,"./cropper.quality.js":13,"./cropper.scale.js":16,"./cropper.selected-area.js":17}],16:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(e,t,r){var n=w.getContext();b.translate(n,e,t),b.scale(n,r/100),b.translate(n,-e,-t)}function i(e,t,r){var n=P.get();if(o(e,t,r),n.width&&n.height)f.updateTransformedArea(n);else{var i=b.get(),a=i.e,s=i.f;P.setProp("x",a),P.setProp("y",s)}E.setValue("scale",r),requestAnimationFrame(f.draw)}function a(e){return e<10?e=10:e>4e3&&(e=4e3),e}function s(e,t,r){var n=t-r;return e-100/(t/n)}function c(e,t,r,n){var o=100;return e>r&&(o=s(o,e,r),t*o/100>n&&(o=s(100,t,n))),o}function u(e,t){m.isVisible()&&(e-=200),v.isVisible()&&(e+=100),b.setDefaultTranslation(e/2,t/2)}function d(e){return m.isVisible()&&(e-=200),v.isVisible()&&(e-=100),e}function l(e){var t=w.getDimensions(),r=t.width,n=t.height,o=e.width,a=e.height,s=d(r),l=100;l=o>a?c(o,a,s,n):c(a,o,n,s);var p=r-o*l/100,f=n-a*l/100,g=w.getContext();u(p,f),b.reset(g),i(0,0,l)}Object.defineProperty(r,"__esModule",{value:!0}),r.scaleImageToFitCanvas=r.adjustScale=r.scaleImage=void 0;var p=e("./cropper.js"),f=n(p),g=e("./cropper.left-bar.js"),v=n(g),h=e("./cropper.right-bar.js"),m=n(h),j=e("./cropper.canvas-transform.js"),b=n(j),y=e("./cropper.canvas-element.js"),w=n(y),x=e("./cropper.data-input.js"),E=n(x),I=e("./cropper.selected-area.js"),P=n(I);r.scaleImage=i,r.adjustScale=a,r.scaleImageToFitCanvas=l},{"./cropper.canvas-element.js":3,"./cropper.canvas-transform.js":5,"./cropper.data-input.js":7,"./cropper.js":10,"./cropper.left-bar.js":11,"./cropper.right-bar.js":15,"./cropper.selected-area.js":17}],17:[function(e,t,r){"use strict";function n(){return h}function o(){return m}function i(e){return h[e]}function a(e){return Object.assign(m,e),m}function s(e,t){return h[e]=t,t}function c(e,t){s("x",e),s("y",t)}function u(){return h.x=0,h.y=0,h.width=0,h.height=0,Object.assign(m,h),h}function d(e,t,r){var n=e.x,o=e.y,i=n+e.width,a=o+e.height,s=t>=n&&t<=i||t<=n&&t>=i,c=r>=o&&r<=a||r<=o&&r>=a;return s&&c}function l(e,t,r,n){var o=t-(e.x+e.width/2),i=r-(e.y+e.height/2),a=Math.sin(-n),s=Math.cos(-n),c=o*s-i*a,u=o*a+i*s,l={x:-e.width/2,y:-e.height/2,width:e.width,height:e.height};return d(l,c,u)}function p(e,t,r,n){return n?l(e,t,r,n):d(e,t,r)}function f(e,t,r){var n=r.a,o=0;m[e]=t||0,"x"===e?(o=r.e,h.width<0&&(h.width=-h.width)):"y"===e?(o=r.f,h.height<0&&(h.height=-h.height)):"width"===e?h[e]<0&&(h.x=h.x+h[e]):"height"===e&&h[e]<0&&(h.y=h.y+h[e]),h[e]=o+m[e]*n}function g(e){return j=e,e}function v(){return j}Object.defineProperty(r,"__esModule",{value:!0});var h={x:0,y:0,width:0,height:0},m=Object.assign({},h),j=!1;r.get=n,r.getTransformed=o,r.setTransformed=a,r.getProp=i,r.setProp=s,r.reset=u,r.isInside=p,r.update=f,r.setDefaultPos=c,r.containsArea=g,r.isDrawn=v},{}],18:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(e){document.getElementById("js-crop-image-name").textContent=e}function i(){var e=h.getTranslated();d.resetData(),y.setDefaultPos(e.x,e.y),y.containsArea(!1),L.scaleImageToFitCanvas(j.image.get()),g.disableButton("crop","preview")}function a(){d.cropperElement.hide(),d.resetData(),y.containsArea(!1),x.toggleCursorEvents(),d.toggleCanvasElementEventListeners("remove"),I.disable(),c.generateZip()}Object.defineProperty(r,"__esModule",{value:!0}),r.displayImageName=void 0;var s=e("./../dropbox/dropbox.js"),c=n(s),u=e("./cropper.js"),d=n(u),l=e("./cropper.left-bar.js"),p=n(l),f=e("./cropper.bottom-bar.js"),g=n(f),v=e("./cropper.canvas-transform.js"),h=n(v),m=e("./cropper.canvas.js"),j=n(m),b=e("./cropper.selected-area.js"),y=n(b),w=e("./cropper.canvas-events.js"),x=n(w),E=e("./cropper.resize.js"),I=n(E),P=e("./cropper.scale.js"),L=n(P);document.getElementById("js-crop-top-bar").addEventListener("click",function(e){var t=e.target,r=t.getAttribute("data-btn");switch(r){case"images":p.toggle();break;case"reset":i();break;case"close":a()}}),r.displayImageName=o},{"./../dropbox/dropbox.js":22,"./cropper.bottom-bar.js":2,"./cropper.canvas-events.js":4,"./cropper.canvas-transform.js":5,"./cropper.canvas.js":6,"./cropper.js":10,"./cropper.left-bar.js":11,"./cropper.resize.js":14,"./cropper.scale.js":16,"./cropper.selected-area.js":17}],19:[function(e,t,r){"use strict";function n(e,t){document.getElementById("js-"+t).classList[e]("visible")}function o(e){n("add",e)}function i(e){n("remove",e)}Object.defineProperty(r,"__esModule",{value:!0}),r.show=o,r.hide=i},{}],20:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(e){e.stopPropagation(),e.preventDefault()}function i(e){e.preventDefault(),1!==d.get()&&(g+=1,f.classList.add("over"))}function a(){1!==d.get()&&(g-=1,g||f.classList.remove("over"))}function s(e){return g=0,f.classList.remove("over"),e.stopPropagation(),e.preventDefault(),1===d.get()?void(e.dataTransfer.dropEffect="none"):(e.dataTransfer.dropEffect="copy",void p.onFiles(e.dataTransfer.files))}function c(e){1===d.get()&&e.preventDefault()}var u=e("./../editor.state.js"),d=n(u),l=e("./dropbox.js"),p=n(l),f=document.getElementById("js-dropbox"),g=0;f.addEventListener("dragover",o,!1),f.addEventListener("dragenter",i,!1),f.addEventListener("dragleave",a,!1),f.addEventListener("drop",s,!1),f.addEventListener("click",c,!1)},{"./../editor.state.js":25,"./dropbox.js":22}],21:[function(e,t,r){"use strict";function n(){return a}function o(e){a.push(e)}function i(){a.length=0}Object.defineProperty(r,"__esModule",{value:!0});var a=[];r.add=o,r.reset=i,r.getAll=n},{}],22:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}function i(e){document.getElementById("js-dropbox-label").classList[e]("mask"),document.getElementById("js-mask").classList[e]("visible")}function a(){M.setLabel(""),i("remove")}function s(){i("add"),x.set(1),M.show(),B.hide("process"),B.show("cancel")}function c(){var e=arguments.length<=0||void 0===arguments[0]?-1:arguments[0];x.set(e),B.hide("cancel"),M.reset(),a()}function u(){"cropper"===(0,k.getCurrentTool)()?(c(),q.init(L.getAll())):(M.reset(),D.processImages())}function d(e){return e.slice(0,e.lastIndexOf("."))}function l(e){var t=document.getElementById("js-image-name").value||d(e),r=document.getElementById("js-image-name-seperator").value||"-";return t+r}function p(){I.post({action:"generate"})}function f(e){return new Promise(function(t){var r=new FileReader;r.readAsDataURL(e),r.onloadend=function(r){L.add({name:{original:e.name,setByUser:l(e.name)},type:e.type,size:e.size/1e6,uri:r.target.result}),t()}})}function g(e,t){var r=e.splice(0,1)[0];M.setLabel("Reading: "+r.name),M.update(t),f(r).then(function(){if(0!==x.get()){if(!e.length)return void setTimeout(u,1e3);g(e,t)}})}function v(){L.reset(),c(0),C.show("Work canceled")}function h(e){return e.filter(function(e){return e.type.includes("image")})}function m(e){var t=h(e);if(t.length){var r=100/t.length;return void g(t,r)}C.show("No images to process"),c()}function j(e){I.isInited()&&I.post({action:"remove"}),L.reset(),x.set(-1),B.hide("download"),s(),m([].concat(o(e)))}function b(e){var t=e.target.getAttribute("data-btn");"process"===t?D.processImages():"download"===t?I.post({action:"download"}):"cancel"===t&&v()}function y(e){var t=e.target.files;e.preventDefault(),t.length&&j(t)}Object.defineProperty(r,"__esModule",{value:!0}),r.removeMasksAndLabel=r.resetDropbox=r.generateZip=r.beforeWork=r.onFiles=void 0;var w=e("./../editor.state.js"),x=n(w),E=e("./../editor.worker.js"),I=n(E),P=e("./dropbox.images.js"),L=n(P),_=e("./dropbox.progress.js"),M=n(_),O=e("./dropbox.message.js"),C=n(O),A=e("./dropbox.buttons.js"),B=n(A),T=e("./../resizer.js"),D=n(T),k=e("./../tools.js"),V=e("./../cropper/cropper.js"),q=n(V);document.getElementById("js-dropbox-btns").addEventListener("click",b,!1),document.getElementById("js-image-select").addEventListener("change",y,!1),r.onFiles=j,r.beforeWork=s,r.generateZip=p,r.resetDropbox=c,r.removeMasksAndLabel=a},{"./../cropper/cropper.js":10,"./../editor.state.js":25,"./../editor.worker.js":26,"./../resizer.js":29,"./../tools.js":30,"./dropbox.buttons.js":19,"./dropbox.images.js":21,"./dropbox.message.js":23,"./dropbox.progress.js":24}],23:[function(e,t,r){"use strict";function n(e){a&&clearTimeout(a),a=setTimeout(o,e)}function o(){var e=arguments.length<=0||void 0===arguments[0]?"":arguments[0];i.textContent=e,e&&n(2e3)}Object.defineProperty(r,"__esModule",{value:!0});var i=document.getElementById("js-msg"),a=0;r.show=o},{}],24:[function(e,t,r){"use strict";function n(){c.classList.add("visible")}function o(){c.classList.remove("visible")}function i(e){u.textContent=e}function a(e){c.value+=e}function s(){c.classList.remove("visible"),c.value=0}Object.defineProperty(r,"__esModule",{value:!0});var c=document.getElementById("js-progress"),u=document.getElementById("js-progress-label");r.show=n,r.hide=o,r.setLabel=i,r.update=a,r.reset=s},{}],25:[function(e,t,r){"use strict";function n(){return i}function o(e){i=e}Object.defineProperty(r,"__esModule",{value:!0});var i=-1;r.get=n,r.set=o},{}],26:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);
return t["default"]=e,t}function o(e){try{saveAs(e,"images.zip")}catch(t){var r=document.createElement("script");r.setAttribute("src","js/libs/FileSaver.min.js"),document.getElementsByTagName("body")[0].appendChild(r),r.onload=function(){saveAs(e,"images.zip")}}}function i(){m||(m=new Worker("js/workers/worker1.js"),m.onmessage=function(e){var t=e.data;"download"===t.action?o(t.content):"generating"===t.action?p.setLabel("Generating archive"):"done"===t.action&&(u.set(-1),(0,d.removeMasksAndLabel)(),g.show("Images are ready for downloading"),h.show("download"))},m.onerror=function(e){console.log(e)})}function a(e){m.postMessage(e)}function s(){return!!m}Object.defineProperty(r,"__esModule",{value:!0}),r.isInited=r.post=r.init=void 0;var c=e("./editor.state.js"),u=n(c),d=e("./dropbox/dropbox.js"),l=e("./dropbox/dropbox.progress.js"),p=n(l),f=e("./dropbox/dropbox.message.js"),g=n(f),v=e("./dropbox/dropbox.buttons.js"),h=n(v),m=void 0;r.init=i,r.post=a,r.isInited=s},{"./dropbox/dropbox.buttons.js":19,"./dropbox/dropbox.js":22,"./dropbox/dropbox.message.js":23,"./dropbox/dropbox.progress.js":24,"./editor.state.js":25}],27:[function(e,t,r){"use strict";function n(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}function o(){var e=[].concat(n(document.querySelectorAll(".preload")));e.forEach(function(e){e.classList.remove("preload")}),window.removeEventListener("load",o,!1)}e("./dropbox/dropbox.js"),e("./dropbox/dropbox.drag.js"),e("./tools.js"),window.addEventListener("load",o,!1),window.addEventListener("drop",function(e){e.preventDefault()},!1),window.addEventListener("dragover",function(e){e.preventDefault()},!1)},{"./dropbox/dropbox.drag.js":20,"./dropbox/dropbox.js":22,"./tools.js":30}],28:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}function i(e){var t={dimensionInputValues:e,imageName:w.value||"",imageNameSeperator:x.value||"",imageQuality:E.value};localStorage.setItem("selections",JSON.stringify(t))}function a(e){return e.reduce(function(e,t){return e.push(t.width,t.height),e},[])}function s(){for(var e=y.children,t=[],r=0,n=e.length;r<n;r+=2){var o=e[r].value,i=e[r+1].value;(o||i)&&t.push({width:o,height:i})}return c(t)}function c(e){return e.length?(e=e.filter(function(e){return u(e.width,e.height)}),e.length||(m.show("No valid values"),b.show("process"))):(m.show("No dimensions specified"),b.show("process")),e}function u(e,t){var r=/^\d+(px|%)?$|^same$|^original$|^width$|^height$/,n=r.test(e)&&!("same"===e&&(!t||"same"===t)),o=r.test(t)&&!("same"===t&&(!e||"same"===e));return n||o}function d(e,t){Array.prototype.forEach.call(e,function(e,r){e.value=t[r]})}function l(){var e=document.createElement("input");return e.setAttribute("type","text"),e.classList.add("input","image-input"),e}function p(e){for(var t=document.createDocumentFragment(),r=0;r<e;r++)t.appendChild(l());return t}function f(e,t){var r=e.children.length;if(r<t){var n=t-r;e.appendChild(p(n))}}function g(e){m.show("Image quality set to: "+e.target.value+"%")}function v(e){var t=[].concat(o(y.children)),r=t.indexOf(e.target),n=r%2===0&&!t[r+2],i=r%2!==0&&!t[r+1];(n||i)&&y.appendChild(p(2))}Object.defineProperty(r,"__esModule",{value:!0}),r.getInputValues=r.saveToLocalStorage=void 0;var h=e("./dropbox/dropbox.message.js"),m=n(h),j=e("./dropbox/dropbox.buttons.js"),b=n(j),y=document.getElementById("js-dimension-inputs"),w=document.getElementById("js-image-name"),x=document.getElementById("js-image-name-seperator"),E=document.getElementById("js-image-quality");!function(){var e=localStorage.getItem("selections");if(e){e=JSON.parse(e);var t=a(e.dimensionInputValues);f(y,t.length),d(y.children,t),w.value=e.imageName,x.value=e.imageNameSeperator,E.value=e.imageQuality}}(),E.addEventListener("input",g,!1),y.addEventListener("focus",v,!0),r.saveToLocalStorage=i,r.getInputValues=s},{"./dropbox/dropbox.buttons.js":19,"./dropbox/dropbox.message.js":23}],29:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(e){return"width"===e?"height":"width"}function i(e,t,r){var n=o(e),i="same"===t[e]?t[n]:t[e],a=r[e];return i.includes("%")?a*(Number.parseInt(i,10)/100):"original"===i||i===e?Number.parseInt(a,10):i===n?Number.parseInt(r[n],10):Number.parseInt(i,10)}function a(e,t){var r=t.width/t.height,n=0,o=0;return e.width&&(n=i("width",e,t),e.height?"same"===e.width&&(o=n):o=n/r),!o&&e.height&&(o=i("height",e,t),e.width?n||"same"!==e.height||(n=o):n=o*r),{width:n,height:o}}function s(e,t){return e.map(function(e){return a(e,t)})}function c(e,t,r){var n=r.width,o=r.height,i=document.createElement("canvas"),a=document.getElementById("js-image-quality").value/100;return i.width=n,i.height=o,i.getContext("2d").drawImage(e,0,0,n,o),i.toDataURL(t,a)}function u(){P.hide("cancel"),E.reset(),E.setLabel(""),b.generateZip()}function d(e,t,r){return new Promise(function(n){m.post({action:"add",image:{name:t.name.setByUser,uri:c(e,t.type,r),type:t.type.slice(6)}}),n()})}function l(e,t,r,n){var o=r.splice(0,1)[0];return d(e,t,o).then(function(){E.update(n),0!==v.get()&&r.length&&l(e,t,r,n)})}function p(e,t,r){var n=new Image,o=e.splice(0,1)[0];n.onload=function(){if(0!==v.get()){var i={width:n.width,height:n.height},a=s(t,i);E.setLabel("Processing: "+o.name.original),l(n,o,a,r).then(function(){if(0!==v.get()){if(!e.length)return void setTimeout(u,1e3);p(e,t,r)}})}},n.src=o.uri}function f(){var e=_.getInputValues();if(!e.length)return void b.resetDropbox();var t=w.getAll(),r=t.length*e.length,n=100/r;m.init(),b.beforeWork(),p(t,e,n),_.saveToLocalStorage(e)}Object.defineProperty(r,"__esModule",{value:!0}),r.processImages=void 0;var g=e("./editor.state.js"),v=n(g),h=e("./editor.worker.js"),m=n(h),j=e("./dropbox/dropbox.js"),b=n(j),y=e("./dropbox/dropbox.images.js"),w=n(y),x=e("./dropbox/dropbox.progress.js"),E=n(x),I=e("./dropbox/dropbox.buttons.js"),P=n(I),L=e("./resizer.dashboard.js"),_=n(L);r.processImages=f},{"./dropbox/dropbox.buttons.js":19,"./dropbox/dropbox.images.js":21,"./dropbox/dropbox.js":22,"./dropbox/dropbox.progress.js":24,"./editor.state.js":25,"./editor.worker.js":26,"./resizer.dashboard.js":28}],30:[function(e,t,r){"use strict";function n(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t}function o(){return u}function i(e){var t=document.getElementById("js-"+e+"-settings");t&&t.classList.toggle("active")}function a(e){var t=e.target,r=t.getAttribute("data-tool");r&&r!==u&&(document.querySelector("[data-tool="+u+"]").classList.remove("active"),t.classList.add("active"),i(u),i(r),c.show(r+" enabled"),u=r)}Object.defineProperty(r,"__esModule",{value:!0}),r.getCurrentTool=void 0;var s=e("./dropbox/dropbox.message.js"),c=n(s),u="resizer";document.getElementById("js-tool-selection").addEventListener("click",a),r.getCurrentTool=o},{"./dropbox/dropbox.message.js":23}]},{},[27]);