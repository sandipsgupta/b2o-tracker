/**
 * Service Worker for Push Notifications
 * Handles incoming push events and displays notifications
 */

self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received:", event);

  if (!event.data) {
    console.log("[SW] Push event has no data");
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "You have a new notification",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag || "notification",
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "B2O Tracker", options)
    );
  } catch (error) {
    console.error("[SW] Error parsing push data:", error);
    event.waitUntil(
      self.registration.showNotification("B2O Tracker", {
        body: event.data.text(),
        icon: "/favicon.ico",
      })
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification);

  event.notification.close();

  const urlToOpen = event.notification.data.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification);
});
