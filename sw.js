if(!self.define){let e,i={};const c=(c,r)=>(c=new URL(c+".js",r).href,i[c]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=c,e.onload=i,document.head.appendChild(e)}else e=c,importScripts(c),i()})).then((()=>{let e=i[c];if(!e)throw new Error(`Module ${c} didn’t register its module`);return e})));self.define=(r,n)=>{const s=e||("document"in self?document.currentScript.src:"")||location.href;if(i[s])return;let o={};const f=e=>c(e,s),a={module:{uri:s},exports:o,require:f};i[s]=Promise.all(r.map((e=>a[e]||f(e)))).then((e=>(n(...e),o)))}}define(["./workbox-1c3383c2"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"213.js",revision:"943585fcdfe5ad3e0b73d86566b905d2"},{url:"569.js",revision:"f683cfb7fc4a1ed3e6acb08e066f3058"},{url:"710.js",revision:"ec73fef9472118013a4a03b349ecfec4"},{url:"710.js.LICENSE.txt",revision:"f1b5cada84288d935a25a83bb5b12d62"},{url:"android-chrome-192x192.png",revision:"06e288101cadbc3c795f1acc929c0c55"},{url:"android-chrome-512x512.png",revision:"b2527a0d46b2a08af352b3f92e2a67a3"},{url:"apple-touch-icon.png",revision:"e3ff22abda2aafb4889a8321e825bb47"},{url:"assets/images/logo.png",revision:"b45c2be3d5201f7083be070124ae3436"},{url:"assets/images/pattern.png",revision:"5eb948023100bf6eb33094b3d68099eb"},{url:"favicon-16x16.png",revision:"31aaf6d4b6a55800092bace6e8f333ee"},{url:"favicon-32x32.png",revision:"66ee68f14bdc11359dec7280cc64cf12"},{url:"favicon.ico",revision:"b6ba326cd1a65d02fc6f0887fb0961c1"},{url:"index.html",revision:"e0fcbdf0e4054b25a492ade436daf2c9"},{url:"main.css",revision:"8851b91db3c917ccc4b2bad6598f744c"},{url:"main.js",revision:"fd213cccee26f50579daa11bcb782dd7"},{url:"manifest.json",revision:"494a90e8d937ef93f9f327819172fcec"}],{}),self.__WB_DISABLE_DEV_LOGS=!0}));
