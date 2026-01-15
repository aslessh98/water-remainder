self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/') // Opens your app when they click the notification
    );
});

/*self.addEventListener('push', e => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'icon-192.png'
  });
});*/
