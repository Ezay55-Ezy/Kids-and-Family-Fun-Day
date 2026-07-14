self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    var data = event.data.json();
    var title = data.title || 'Kids & Family Fun Day';
    var body = data.body || '';
    var url = data.url || '/dashboard/notifications';

    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: '/icons/favicon-192.png',
        badge: '/icons/favicon-192.png',
        data: { url: url },
      }),
    );
  } catch (e) {
    console.error('SW push handler error:', e);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  var url = event.notification.data?.url || '/dashboard/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
          return client.focus().then(function (focusedClient) {
            focusedClient.navigate(url);
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + url);
      }
    }),
  );
});
