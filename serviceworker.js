//Crear la varieble de cache
const currentCache = "cacheWiki-v1.9";
//Archivos para almacenar
const files = [
    "/",
    "index.html",
    "offline.html",
    "img/logo.png",
    "css/estilo_01.css",
    "css/estilo_02.css"
];
//Instalar el Service Worker y cachear los recursos
self.addEventListener("install", event => {
    async function preCacheResources() {
        //Abrir el cahe de la app
        const cache = await caches.open(currentCache);
        //Agregar los recursos a cache
        cache.addAll(files);
    }
    event.waitUntil(preCacheResources());
});
//Interceptar solicitudes y responder con caché o red: 
//monitorea cuando el usuario pide un recurso.
self.addEventListener("fetch", event => {
    async function navigateOrDisplayOfflinePage() {
        try {
            //Intentar cargar la pagina desde la web
            const networkResponse = await fetch(event.request);
            return networkResponse;
        } catch (error) {
            //Cuando el internet falle, el disposiivo esta offline
            const cache = await caches.open(currentCache);
            const cachedResponse = await cache.match("offline.html");
            return cachedResponse || new Response("Pagina offline no disponible", { status: 503 });
        }
    }
    //Solo llama a event.respondWith() si se trata de una solicitud de navegación
    //para una página HTML.
    if(event.request.mode === 'navigate') {
        event.respondWith(navigateOrDisplayOfflinePage());
    }
});
//Activar el Service Worker y eliminar cachés viejos
self.addEventListener("activate", event => {
    async function deleteOldCaches() {
        //Enumere todas las cachés por sus nombres.
        const names = await caches.keys();
        await Promise.all(names.map(name => {
            if (name !== currentCache) {
                //Si el nombre de una caché es el nombre actual, elimínela.
                return caches.delete(name);
            }
        }));
    }

    event.waitUntil(deleteOldCaches());
});

