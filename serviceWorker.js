const PREF = "P_Gv1.1";
const BASE_URL = location.protocol + "//" + location.host;
const CACHE_FILES = [
    "assets/css/style.css", "/assets/js/script.js",
    BASE_URL + '/assets/images/icons/512.png'
];

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

self.addEventListener("fetch", (e) => {
    // console.log("This is first");
    console.log("Fetching: " + e.request.url + " Mode " + e.request.mode);
    if (e.request.mode == "navigate") {
        e.respondWith(
            (async () => {
                try {
                    const preloadRespond = await e.preloadResponse;
                    if (preloadRespond) {
                        return preloadRespond;
                    }
                    return await fetch(e.request);
                } catch (error) {
                    const cache = await caches.open(PREF);
                    return await cache.match("/offline.html");
                }
            })()
        );
    } else if (CACHE_FILES.includes(e.request.url)) {
        // console.log('ueh');
        e.respondWith(caches.match(e.request));
    }
});