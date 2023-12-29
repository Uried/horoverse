importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCcI8hZH1HuIk7KCgq1_wrcZSQs63Yg0dY",
  authDomain: "horoverse-15fe0.firebaseapp.com",
  projectId: "horoverse-15fe0",
  storageBucket: "horoverse-15fe0.appspot.com",
  messagingSenderId: "388347383481",
  appId: "1:388347383481:web:1a7566fd701861ff49d568",
  measurementId: "G-RG504RKNKP",
});

var messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
  console.log("Reçu une notification push en arrière-plan", payload);

  // Personnalisez ici votre gestion des notifications push
  var notificationTitle = "Titre de la notification";
  var notificationOptions = {
    body: payload.data.message,
    // Vous pouvez ajouter d'autres options de notification ici
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérez les événements de cycle de vie du service worker

self.addEventListener("install", function (event) {
  console.log("Le service worker est installé");

  event.waitUntil(
    caches.open("my-cache").then(function (cache) {
      return cache.addAll([
        "/path/to/resource1",
        "/path/to/resource2",
        // Ajoutez ici d'autres ressources à mettre en cache
      ]);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("Le service worker est activé");

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            // Filtrez les anciens caches à supprimer
            // par exemple, en utilisant un nom de cache différent pour chaque version du service worker
            return (
              cacheName.startsWith("my-cache-") && cacheName !== "my-cache"
            );
          })
          .map(function (cacheName) {
            return caches.delete(cacheName); // Supprimez les anciens caches
          })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  console.log("La requête est effectuée", event.request.url);

  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Renvoie la réponse mise en cache si elle existe
      if (response) {
        return response;
      }

      // Sinon, effectue la requête réseau normalement
      return fetch(event.request).then(function (response) {
        // Met à jour le cache avec la nouvelle réponse
        return caches.open("my-cache").then(function (cache) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
