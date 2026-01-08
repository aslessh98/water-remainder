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

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon-192.png"
  });
});
