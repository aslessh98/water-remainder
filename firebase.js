import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAP5QK1TWxCLt3Nh4ck_KsS8wIjWv-80tU",
  authDomain: "water-remainder-967ec.firebaseapp.com",
  projectId: "water-remainder-967ec",
  storageBucket: "water-remainder-967ec.firebasestorage.app",
  messagingSenderId: "1092309949188",
  appId: "1:1092309949188:web:b2585c5b44ffa5415ace51"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let messaging = null;

if ("serviceWorker" in navigator) {
  messaging = getMessaging(app);
}

//const messaging = getMessaging(app);

// Expose globally so app.js can use them 
window.firebaseApp = app; 
window.db = db; 
window.auth = auth; 
window.messaging = messaging; 

console.log("Firebase initialized — window.db and window.auth ready"); 

// Notify app.js that Firebase is ready 
window.dispatchEvent(new Event("firebase-ready"));
