const CACHE_NAME = "smart-irrigation-v1";

const urlsToCache = [
    "./",
    "./index.html",
    "./analytics.html",
    "./settings.html",
    "./style.css",
    "./script.js",
    "./weather.js",
    "./analytics.js",
    "./settings.js"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => {

            return cache.addAll(
                urlsToCache
            );

        })

    );

});

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(
            event.request
        )

        .then(response => {

            return response ||
                   fetch(event.request);

        })

    );

});