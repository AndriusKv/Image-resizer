if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return i[e]||(r=new Promise(async r=>{if("document"in self){const i=document.createElement("script");i.src=e,document.head.appendChild(i),i.onload=r}else importScripts(e),r()})),r.then(()=>{if(!i[e])throw new Error(`Module ${e} didn’t register its module`);return i[e]})},r=(r,i)=>{Promise.all(r.map(e)).then(e=>i(1===e.length?e[0]:e))},i={require:Promise.resolve(r)};self.define=(r,s,c)=>{i[r]||(i[r]=Promise.resolve().then(()=>{let i={};const n={uri:location.origin+r.slice(1)};return Promise.all(s.map(r=>{switch(r){case"exports":return i;case"module":return n;default:return e(r)}})).then(e=>{const r=c(...e);return i.default||(i.default=r),i})}))}}define("./sw.js",["./workbox-468c4d03"],(function(e){"use strict";e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"2.js",revision:"f5821350c4dce5dee9826f040031166c"},{url:"android-chrome-192x192.png",revision:"06e288101cadbc3c795f1acc929c0c55"},{url:"android-chrome-512x512.png",revision:"b2527a0d46b2a08af352b3f92e2a67a3"},{url:"apple-touch-icon.png",revision:"e3ff22abda2aafb4889a8321e825bb47"},{url:"assets/images/logo.png",revision:"b45c2be3d5201f7083be070124ae3436"},{url:"assets/images/pattern.png",revision:"5eb948023100bf6eb33094b3d68099eb"},{url:"favicon-16x16.png",revision:"31aaf6d4b6a55800092bace6e8f333ee"},{url:"favicon-32x32.png",revision:"66ee68f14bdc11359dec7280cc64cf12"},{url:"favicon.ico",revision:"b6ba326cd1a65d02fc6f0887fb0961c1"},{url:"index.html",revision:"371bc6fc8fd336027b09960864050a30"},{url:"libs/jszip.min.js",revision:"dc5d2aac976b1ad09faa452b4ce37519"},{url:"main.css",revision:"928626c72a2d1e7c6a7140944e9fc8c5"},{url:"main.js",revision:"685b772c08033aeffaca0546e0dfed80"},{url:"manifest.json",revision:"e3205ad2854d100157e9de066a5bd892"},{url:"vendor.js",revision:"2bc3fce3ed063c763fee8e46eb55e952"},{url:"ww.js",revision:"be65f943843266ea7aceddc8c06281ab"}],{}),self.__WB_DISABLE_DEV_LOGS=!0}));