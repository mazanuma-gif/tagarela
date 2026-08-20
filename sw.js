const CACHE = 'tagarela-v2';
const ASSETS = ['/index.html','/rooms.html','/pagamento.html','/admin.html','/manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(a => c.add(a).catch(()=>{})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e => {
  if(e.request.url.includes('api.ably.io')||e.request.url.includes('turso.io')) return;
  if(e.request.destination==='document'){
    e.respondWith(fetch(e.request).then(r=>{caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r;}).catch(()=>caches.match(e.request)||caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(r2=>{if(r2.ok){caches.open(CACHE).then(c=>c.put(e.request,r2.clone()));}return r2;})));
});
