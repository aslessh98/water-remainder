self.addEventListener('push', e => {
const data = e.data.json();
self.registration.showNotification(data.title, {
body: data.body,
icon: '/icons/icon-192.png'
});
});
