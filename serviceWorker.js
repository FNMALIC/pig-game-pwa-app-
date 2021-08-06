const PREF = "P_Gv1.4.1";
const BASE_URL = location.protocol + "//" + location.host;
const CACHE_FILES = [
    BASE_URL + "/assets/css/style.css",
    BASE_URL + "/assets/js/script.js",
    BASE_URL + "/assets/images/icons/512.png",
    "https://fonts.googleapis.com/css2?family=Nunito&display=swap"
];

console.log(BASE_URL + "/assets/css/style.css");
console.log(BASE_URL + "/assets/js/script.js");
console.log(BASE_URL + "/assets/images/icons/512.png");
self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntill((async () => {
        const cache = await caches.open(PREF);
        cache.add(new Request('/offline.html'));
        cache.addAll([...CACHE_FILES, '/offline.html']);
    })());
    console.log(PREF + '  install');
});

self.addEventListener("activate", (e) => {
    clients.claim();
    e.waitUntill((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys.map((key) => {
                if (!key.includes(PREF)) {
                    caches.delete(key);
                }
            })
        );
    })());
    console.log(PREF + ' activate');
});

self.addEventListener("fetch", (event) => {
    console.log(PREF + ' Fetching :' + event.request.url + ' , Mode : ' + event.request.mode);
    if (event.request.mode == "navigate") {
        event.respondWith(
            (async () => {
                try {
                    const preloadRespond = await event.preloadResponse;
                    if (preloadRespond) {
                        return preloadRespond;
                    }
                    return await fetch(event.request);
                } catch (error) {
                    const cache = await caches.open(PREF);
                    return await cache.match('/offline.html');
                }

            })()
        );
    } else if (CACHE_FILES.includes(event.request.url)) {
        event.respondWith(caches.match(event.request));
    }
});