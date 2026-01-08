importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAJ5asDzJczWNgtwK75hvEIeVDL0RC-HM8",
  authDomain: "gym-tracker-3584f.firebaseapp.com",
  projectId: "gym-tracker-3584f",
  messagingSenderId: "1028526681982",
  appId: "1:1028526681982:web:fa82ebc92005591b060d2f"
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon-192.png"
  });
});
