const FILES = [
    '/icon/favicon.ico',
    '/favicon.ico',
    '/icon/favicon-16x16.png',
    '/icon/favicon-32x32.png',
    '/icon/android-chrome-192x192.png',
    '/icon/android-chrome-512x512.png',
    '/icon/apple-touch-icon.png',
    '/icon/safari-pinned-tab.svg',
    '/icon/site.json',

    '/img/bg.jpg',

    'css/style.css',
    'js/script.js'
]

const CACHE = 'APP_' + VERSION
//const OFFLINE = 'OFFLINE_' + VERSION
//const DATAFILE = 'https://billrocha.netlify.com/config'

// INSTALL  -------------------------------------------------------------------------
self.addEventListener('install', e => {
    e.waitUntil(
        caches
            .open(CACHE)
            .then(cache => {
                //console.log('[SWORKER caching "' + CACHE + '"]')
                cache.addAll(FILES)
            })
            .then(() => self.skipWaiting())
    )
})

// ACTIVATE -------------------------------------------------------------------------
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(async ks => {
            for (const k of ks) {
                if (k !== CACHE) {
                    //console.log('[SWORKER removing "' + k + '" cache]')
                    await caches.delete(k)
                }
            }
            self.clients.claim()
        })
    )
})

// FETCH   --------------------------------------------------------------------------
self.addEventListener('fetch', event => {
    const {
        request,
        request: { url, method }
    } = event

    // Saves || loads json data to Cache Storage (fake file)
    // if (url.match(DATAFILE)) {
    //     if (method === 'POST') {
    //         request
    //             .json()
    //             .then(body => caches.open(CACHE).then(cache => {
    //                 cache.delete(DATAFILE).then(function (response) {
    //                     //console.log("DELETED: " + DATAFILE)
    //                     cache.put(DATAFILE, new Response(JSON.stringify(body)))
    //                 })
    //             }))
    //         return event.respondWith(new Response('{}'))
    //     } else {
    //         return event.respondWith(caches.match(DATAFILE).then(response => response || new Response('{}')))
    //     }
    // } else {
    // Get & save request in Cache Storage
    if (method !== 'POST') {
        event.respondWith(
            caches.open(CACHE).then(cache =>
                cache.match(event.request).then(response => response ||
                    fetch(event.request).then(response => {
                        // Saves the requested file to CACHE (uncomment next line)
                        // cache.put(event.request, response.clone())
                        return response
                    }
                    )
                )
            )
        )
    } else return
    // }
})


// TESTAR essa opção de CACHE first e network second (com atualização do cache) para elementos críticos

// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.open(cacheName)
//             .then(function(cache) {
//                 cache.match(event.request)
//                     .then( function(cacheResponse) {
//                         fetch(event.request)
//                             .then(function(networkResponse) {
//                                 cache.put(event.request, networkResponse)
//                             })
//                         return cacheResponse || networkResponse
//                     })
//             })
//     )
// });

// PUSH   ---------------------------------------------------------------------------
self.addEventListener('push', event => {
    event.waitUntil(
        self.clients.matchAll().then(function (clientList) {
            //console.log(`[Service Worker] Push had this data: "${event.data.text()}"`)

            var focused = clientList.some(function (client) {
                console.log('[CLIENT]', client)
                client.postMessage({ msg: event.data.json(), type: 'push' })
                return client.focused
            })

            var msg = {
                title: 'error',
                body: 'Ocorreu um erro no envio de notificação!'
            }
            try {
                msg = event.data.json()
            } catch (e) { }

            // Para mudar o comportamento caso o FOCO do app esteja diferente: aberto (focado), fora de foco (mas, aberto) e fechado
            /*
            if (focused) {
                msg.body += 'You\'re still here, thanks!';
            } else if (clientList.length > 0) {
                msg.body += 'You haven\'t closed the page, click here to focus it!';
            } else {
                msg.body += 'You have closed the page, click here to re-open it!';
            } */

            const title = msg.title
            const options = {
                body: msg.body || 'Você tem uma nova mensagem do SALVA!',
                icon: msg.icon || '/favicon/android-chrome-192x192.png',
                badge: msg.badge || '/favicon/favicon-32x32.png',
                image: msg.image || '/img/push.jpg',
                vibrate: msg.vibrate || [],
                data: JSON.parse('undefined' == typeof msg['data'] ? false : msg['data'])
            }

            return self.registration.showNotification(title, options)
        })
    )
})

// --------------------------- clicar em uma mensagem e abrir o aplicativo

self.addEventListener('notificationclick', function (event) {
    event.waitUntil(
        self.clients.matchAll().then(function (clientList) {
            console.log('[Service Worker] Notification click Received.', clientList, event.notification.data)

            var data = 'undefined' !== typeof event.notification['data'] ? event.notification.data : {}

            event.notification.close()

            if (clientList.length > 0) {
                clientList[0].focus()
                return clientList[0].postMessage({ msg: data, type: 'clientList[0]' })
            } else {
                self.clients
                    .openWindow('/profile')
                    .then(function (c) {
                        console.log('CLIENT OpenWindow: ', c)
                        return c
                    })
                    .then(function (a) {
                        return a.postMessage({ msg: data, type: 'clientList - clients - c' })
                        // })
                        // //if (c.length > 0) {
                        //     //console.log('Dentro de if: ', c[0])
                        //     c.focus()

                        // return c.postMessage({msg: data, type: 'clients'})
                    })
            }
        })
    )
})
