export function checkServiceWorkerConflicts() {
  if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      const activeServiceWorkerUrls = new Set<string>();

      for (const registration of registrations) {
        const serviceWorkerUrl = registration.active?.scriptURL;
        if (serviceWorkerUrl) {
          if (activeServiceWorkerUrls.has(serviceWorkerUrl)) {
            console.log(
              `Conflit détecté avec le service worker : ${serviceWorkerUrl}`
            );
          } else {
            activeServiceWorkerUrls.add(serviceWorkerUrl);
          }
        }
      }
    });
  }
}
