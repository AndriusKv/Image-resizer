if(!self.define){let e,i={};const n=(n,r)=>(n=new URL(n+".js",r).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(r,s)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(i[a])return;let o={};const c=e=>n(e,a),f={module:{uri:a},exports:o,require:c};i[a]=Promise.all(r.map((e=>f[e]||c(e)))).then((e=>(s(...e),o)))}}define(["./workbox-460519b3"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"162.js",revision:"35855d2cbc3685f30be86a81c4c5e17f"},{url:"android-chrome-192x192.png",revision:"06e288101cadbc3c795f1acc929c0c55"},{url:"android-chrome-512x512.png",revision:"b2527a0d46b2a08af352b3f92e2a67a3"},{url:"apple-touch-icon.png",revision:"e3ff22abda2aafb4889a8321e825bb47"},{url:"assets/images/logo.png",revision:"b45c2be3d5201f7083be070124ae3436"},{url:"assets/images/pattern.png",revision:"5eb948023100bf6eb33094b3d68099eb"},{url:"favicon-16x16.png",revision:"31aaf6d4b6a55800092bace6e8f333ee"},{url:"favicon-32x32.png",revision:"66ee68f14bdc11359dec7280cc64cf12"},{url:"favicon.ico",revision:"b6ba326cd1a65d02fc6f0887fb0961c1"},{url:"index.html",revision:"56fe36a3d2e3f4ee0fb26fa9aa683e8a"},{url:"libs/jszip.min.js",revision:"0b5abaa839171af22f7a83011c122f6b"},{url:"libs/jszip.min.js.LICENSE.txt",revision:"f1b5cada84288d935a25a83bb5b12d62"},{url:"main.css",revision:"0d21fad36de0038a08082abd72051b24"},{url:"main.js",revision:"641c839b47ce63a118d485f8c9595ef7"},{url:"manifest.json",revision:"e3205ad2854d100157e9de066a5bd892"},{url:"ww.js",revision:"2ee7900b807f778bea82c0c104607d25"}],{}),self.__WB_DISABLE_DEV_LOGS=!0}));
