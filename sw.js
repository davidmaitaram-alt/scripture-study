/* Offline layer for the hosted copy. The whole app is one HTML file, so the
   cache holds exactly that plus the start URL. Cache-first, with a background
   refresh so a re-upload is picked up on the next open rather than never. */
const CACHE="scripture-study-v1";
const ASSETS=["./","./index.html"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(
    caches.match(e.request).then(hit=>{
      const net=fetch(e.request).then(res=>{
        if(res&&res.status===200)caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
        return res;
      }).catch(()=>hit);
      return hit||net;
    })
  );
});
