importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAP5QK1TWxCLt3Nh4ck_KsS8wIjWv-80tU",
  authDomain: "water-remainder-967ec.firebaseapp.com",
  projectId: "water-remainder-967ec",
  messagingSenderId: "1092309949188",
  appId: "1:1092309949188:web:b2585c5b44ffa5415ace51"
});


const messaging = firebase.messaging();

// Helpful log to debug what arrives (open SW console in Chrome)
self.addEventListener('push', event => {
  console.log('[SW] push event:', event);
});

self.addEventListener('push', (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const data = payload.data || payload.notification || payload;
  const title = data.title || 'Reminder 🥤';

  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

/*
// Handle Firebase compat background messages (payload from SDK)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] onBackgroundMessage payload:', payload);

  // payload may contain .data or .notification or both
  const data = payload.data || payload.notification || {};
  const title = data.title || 'Reminder';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data // attach full data for click handling
  };

  return self.registration.showNotification(title, options);
});

// Generic push handler that covers data-only / legacy sends
self.addEventListener('push', (event) => {
  console.log('[SW] push received, event.data:', event.data);

  let payloadData = {};
  if (event.data) {
    try {
      payloadData = event.data.json();
    } catch (err) {
      // Not JSON — fallback to text
      payloadData = { body: event.data.text() };
    }
  }

  // Some senders wrap notification inside `notification` object
  const notif = payloadData.notification || payloadData || {};
  const title = notif.title || 'Reminder';
  const options = {
    body: notif.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payloadData
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Optional: handle clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
*/

