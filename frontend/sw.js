const CACHE_NAME = 'lumalab-pwa-v8';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/cms.js',
  '/forms.js',
  '/analytics.js',
  '/manifest.webmanifest',
  '/offline.html',
  '/thank-you.html',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/image.jpg',
  '/assets/lumalab-logo.png',
  '/assets/lumalab-mark.png',
  '/assets/cases-proof.svg',
  '/assets/icons/home.png',
  '/assets/icons/case.png',
  '/assets/icons/cv.png',
  '/assets/hero-growth.svg',
  '/assets/model-partnership.svg',
  '/assets/services-ai.svg',
  '/assets/research-trends.svg',
  '/assets/process-roadmap.svg',
  '/assets/team-network.svg',
  '/assets/jobs-talent.svg',
  '/assets/form-product.svg',
  '/assets/secure-nda.svg',
  '/assets/products-rd.svg',
  '/assets/bg-hero.webp',
  '/assets/bg-model.webp',
  '/assets/bg-expertise.webp',
  '/assets/bg-research.webp',
  '/assets/bg-process.webp',
  '/assets/bg-team.webp',
  '/assets/bg-vacancies.webp',
  '/assets/bg-application.webp',
  '/assets/icons/system.png',
  '/assets/icons/statistics.png',
  '/assets/icons/protect.png',
  '/assets/icons/product.png',
  '/assets/icons/phone.png',
  '/assets/icons/person.png',
  '/assets/icons/partnership.png',
  '/assets/icons/icons8-secured-cloud-storage-96.png',
  '/assets/icons/icons8-pie-chart-96.png',
  '/assets/icons/icons8-code-96.png',
  '/assets/icons/icons8-automatic-96.png',
  '/assets/icons/icons8-ai-96.png',
  '/assets/icons/growth.png',
  '/assets/icons/globe.png',
  '/assets/icons/glass.png',
  '/assets/icons/funnel.png',
  '/assets/icons/company.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => Promise.all(
      ASSETS.map(url => cache.add(url).catch(() => null))
    ))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  if(event.request.mode === 'navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if(response && response.ok){
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match('/offline.html')))
  );
});
