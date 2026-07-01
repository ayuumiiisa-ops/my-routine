// マイルーティン — サービスワーカー
// 方針: ネット優先(network-first)。オンラインなら常に最新を取得し、
// 取れた内容をキャッシュに保存。オフライン時だけキャッシュにフォールバック。
// これにより「更新したのに古い画面が出る」問題を防ぐ。
const CACHE = 'myroutine-v3';
const ASSETS = ['./', 'index.html', 'manifest.json', 'icon.svg', 'kurochan.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(c => c || caches.match('index.html')))
  );
});
