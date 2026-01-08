function pushStatus(msg) {
  document.getElementById("pushStatus").textContent =
    "Push status: " + msg;
}

let swRegistration = null;

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getToken
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
/*
if ("serviceWorker" in navigator) {
  swRegistration = await navigator.serviceWorker.register(
    "/water-reminder/firebase-messaging-sw.js"
  );
  pushStatus("Service worker registered");
  
  //navigator.serviceWorker.register("firebase-messaging-sw.js");
}

*/
/*
window.addEventListener("firebase-ready", async () => {
  pushStatus("Checking if Service worker in navigator");
  if ("serviceWorker" in navigator) {
    try {
      pushStatus("Service worker registeration started");
      
      swRegistration = await navigator.serviceWorker.register(
        "./firebase-messaging-sw.js",
        {
          scope: "./"
        }

      );
      pushStatus("Service worker registered");
      
    } catch (err) {
      pushStatus("SW registration failed");
      console.error(err);
    }
  }
});
*/
/*
window.addEventListener("firebase-ready", async () => {
  pushStatus("Checking service worker support");

  if (!("serviceWorker" in navigator)) {
    pushStatus("Service worker NOT supported");
    return;
  }

  try {
    pushStatus("Service worker registration started");

    swRegistration = await navigator.serviceWorker.register(
      "/water-remainder/firebase-messaging-sw.js",
      {
        scope: "/water-remainder/"
      }
    );

    pushStatus("Service worker registered");

  } catch (err) {
    pushStatus("SW registration failed");
    console.error(err);
  }
});
*/

async function requestNotificationPermission() {
  try {
    pushStatus("Waiting for service worker...");

    pushStatus("Checking if Service worker in navigator");
    if ("serviceWorker" in navigator) {
      
      pushStatus("serviceWorker in navigator");
      
      try {
        
        pushStatus("Service worker registeration started");
        
        swRegistration = await navigator.serviceWorker.register(
          "./firebase-messaging-sw.js",
          {
            scope: "./"
          }
  
        );
        
        pushStatus("Service worker registered");
        
      } catch (err) {
        
        pushStatus("SW registration failed");
        
        console.error(err);
      }
    }

    //const readyRegistration = await navigator.serviceWorker.ready;
    //swRegistration = readyRegistration;
    
    pushStatus("Service worker active");
    
    pushStatus("Requesting permission...");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      pushStatus("Permission denied");
      return;
    }

    pushStatus("Permission granted");

    if (!swRegistration) {
      pushStatus("ERROR: Service worker not ready");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: "BCW7rT82NeEEpbKYcCfB5ZM94sUxorwMqyzaIiCzx9taA9L8mGucHOGW41O2qMPzO37Hw__2x_DHWuk4CMX_2Yk",
      serviceWorkerRegistration: swRegistration
    });

    if (!token) {
      pushStatus("Token NOT generated");
      return;
    }

    pushStatus("Token generated");
    const tokenRef = doc(db, "users", auth.currentUser.uid, "fcmTokens", token);
    await setDoc(tokenRef, {
      token,
      createdAt: new Date(),
      userAgent: navigator.userAgent
    });
    
    /*
    const user = auth.currentUser;
    if (!user) {
      pushStatus("User not logged in");
      return;
    }

    await setDoc(
      doc(db, "users", user.uid, "fcmTokens", token),
      {
        createdAt: new Date(),
        platform: "web"
      }
    );*/

    pushStatus("Token saved to Firestore");

    document.getElementById("enablePushBtn").style.display = "none";

  } catch (err) {
    pushStatus("ERROR: " + err.message);
  }
}
/*
async function requestNotificationPermission() {
  try {
    pushStatus("Waiting for service worker...");

    if (!navigator.serviceWorker.controller) {
      pushStatus("Reloading to activate service worker...");
      location.reload();
      return;
    }
    
    pushStatus("Service worker active");
    
    pushStatus("Requesting permission...");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      pushStatus("Permission denied");
      return;
    }

    pushStatus("Permission granted");

    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: "BCW7rT82NeEEpbKYcCfB5ZM94sUxorwMqyzaIiCzx9taA9L8mGucHOGW41O2qMPzO37Hw__2x_DHWuk4CMX_2Yk",
      serviceWorkerRegistration: registration
    });

    if (!token) {
      pushStatus("Token NOT generated");
      return;
    }

    pushStatus("Token generated");
    const tokenRef = doc(db, "users", auth.currentUser.uid, "fcmTokens", token);
    await setDoc(tokenRef, {
      token,
      createdAt: new Date(),
      userAgent: navigator.userAgent
    });
    
    pushStatus("Token saved to Firestore");

    document.getElementById("enablePushBtn").style.display = "none";

  } catch (err) {
    pushStatus("ERROR: " + err.message);
    
  }
}
*/
/*
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: "BCW7rT82NeEEpbKYcCfB5ZM94sUxorwMqyzaIiCzx9taA9L8mGucHOGW41O2qMPzO37Hw__2x_DHWuk4CMX_2Yk"
  });

  const user = auth.currentUser;
  if (!user || !token) return;

  await setDoc(
    doc(db, "users", user.uid, "fcmTokens", token),
    {
      createdAt: new Date(),
      platform: "web"
    }
  );
}
*/
/*async function requestNotificationPermission() {
  if (!("Notification" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  try {
    const token = await getToken(messaging, {
      vapidKey: "BCW7rT82NeEEpbKYcCfB5ZM94sUxorwMqyzaIiCzx9taA9L8mGucHOGW41O2qMPzO37Hw__2x_DHWuk4CMX_2Yk"
    });

    console.log("FCM Token:", token);
  } catch (err) {
    console.error("FCM token error", err);
  }
}*/

const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const calendar = document.getElementById("calendar");

const DAILY_GOAL = 3;

const enablePushBtn = document.getElementById("enablePushBtn");

// ---------- AUTH ----------
enablePushBtn.onclick = async () => {
  await requestNotificationPermission();
  enablePushBtn.style.display = "none";
};

loginBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert(err.message);
  }
};

logoutBtn.onclick = async () => {
  await signOut(auth);
};



onAuthStateChanged(auth, async (user) => {
  const userInfo = document.getElementById("user-info");

  if (user) {
    document.getElementById("name").textContent = user.displayName || "User";

    loginBtn.style.display = "none";
    userInfo.style.display = "inline-flex";
    enablePushBtn.style.display = "inline-flex";

    const todayId = formatDate(new Date());
    const todayRef = doc(db, "users", user.uid, "dailyLogs", todayId);
    
    const todaySnap = await getDoc(todayRef);
    if (!todaySnap.exists()) {
      await setDoc(todayRef, {
        litres: 0,
        goal: DAILY_GOAL,
        completed: false,
        createdAt: new Date()
      });
    }

    loadCalendar(user);
    
  } else {
    loginBtn.style.display = "inline-flex";
    userInfo.style.display = "none";
  }
});

//import { db, auth } from './firebase.js';

// ---------- DATE UTILS ----------
function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

// ---------- LOAD CALENDAR ----------
async function loadCalendar(user) {
  calendar.innerHTML = "";

  const logsRef = collection(db, "users", user.uid, "dailyLogs");
  const snapshot = await getDocs(logsRef);

  if (snapshot.empty) {
    calendar.innerHTML = `<p style="opacity:0.7">No data yet. Start drinking 💧</p>`;
    return;
  }

  // Collect & sort by date DESC (latest first)
  const days = snapshot.docs
    .map(docSnap => ({
      id: docSnap.id,            // YYYY-MM-DD
      ...docSnap.data()
    }))
    .sort((a, b) => b.id.localeCompare(a.id));

  const todayId = formatDate(new Date());

  for (const day of days) {
    const dateObj = new Date(day.id);
    const displayDate = formatDisplayDate(dateObj);

    const div = document.createElement("div");
    div.className = `day ${day.completed ? "success" : "fail"} ${
      day.id === todayId ? "today" : ""
    }`;

    div.innerHTML = `
      <div class="day-left">
        <div class="day-date">${displayDate}</div>
        <div class="day-value">${day.litres} / ${day.goal} L</div>
      </div>
      <div class="day-right"></div>
    `;

    // Only TODAY gets controls
    if (day.id === todayId) {
      const right = div.querySelector(".day-right");

      const plusBtn = document.createElement("button");
      plusBtn.className = "circle-btn";
      plusBtn.textContent = "+";
      plusBtn.onclick = () => updateLitres(user, day.litres + 1);

      const minusBtn = document.createElement("button");
      minusBtn.className = "circle-btn";
      minusBtn.textContent = "−";
      minusBtn.onclick = () => updateLitres(user, day.litres - 1);

      right.appendChild(plusBtn);
      right.appendChild(minusBtn);
    }

    calendar.appendChild(div);
  }
}
/*async function loadCalendar(user) {
  calendar.innerHTML = "";

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const firestoreId = formatDate(date); // YYYY-MM-DD
    const displayDate = formatDisplayDate(date); // DD-MMM-YYYY

    const ref = doc(db, "users", user.uid, "dailyLogs", firestoreId);
    const snap = await getDoc(ref);

    const litres = snap.exists() ? snap.data().litres : 0;
    const completed = litres >= DAILY_GOAL;

    const div = document.createElement("div");
    div.className = `day ${completed ? "success" : "fail"} ${i === 0 ? "today" : ""}`;

    div.innerHTML = `
      <div class="day-left">
        <div class="day-date">${displayDate}</div>
        <div class="day-value">${litres} / ${DAILY_GOAL} L</div>
      </div>
    
      <div class="day-right"></div>
    `;

    if (i === 0) {
      const right = div.querySelector(".day-right");
    
      const plusBtn = document.createElement("button");
      plusBtn.className = "circle-btn";
      plusBtn.textContent = "+";
      plusBtn.onclick = () => updateLitres(user, litres + 1);
    
      const minusBtn = document.createElement("button");
      minusBtn.className = "circle-btn";
      minusBtn.textContent = "−";
      minusBtn.onclick = () => updateLitres(user, litres - 1);
    
      right.appendChild(plusBtn);
      right.appendChild(minusBtn);
      /*
      const controls = document.createElement("div");
      controls.className = "controls";

      const plusBtn = document.createElement("button");
      plusBtn.textContent = "+";
      plusBtn.onclick = () => updateLitres(user, litres + 1);

      const minusBtn = document.createElement("button");
      minusBtn.textContent = "−";
      minusBtn.onclick = () => updateLitres(user, litres - 1);

      controls.appendChild(plusBtn);
      controls.appendChild(minusBtn);
      div.appendChild(controls);*
    }

    // THIS keeps today on TOP
    calendar.appendChild(div);
  }
}*/

// ---------- UPDATE TODAY ----------
async function updateLitres(user, litres) {
  litres = Math.max(0, litres);

  const today = formatDate(new Date());

  await setDoc(
    doc(db, "users", user.uid, "dailyLogs", today),
    {
      litres,
      goal: DAILY_GOAL,
      completed: litres >= DAILY_GOAL,
      email: user.email
    },
    { merge: true }
  );

  loadCalendar(user);
}
