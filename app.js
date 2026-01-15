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

let swRegistration = null;

function pushStatus(msg) {
  //console.log("Push status: " + msg);
  document.getElementById("pushStatus").textContent =
    "Push status: " + msg;
}

// ---------- NOTIFICATION LOGIC ----------
// 1. Function: Silently check if we should show the button
async function checkSubscriptionStatus(user) {
  try {
    // A. Check Browser Permission
    if (Notification.permission !== "granted") {
      pushStatus("Permission not granted yet.");
      return false; // Show button
    }

    // B. Check if Service Worker is ready
    // We need the registration to get the token
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      pushStatus("No SW registration found.");
      return false; // Show button
    }

    // C. Get the current Token
    const token = await getToken(messaging, {
      vapidKey: "BCW7rT82NeEEpbKYcCfB5ZM94sUxorwMqyzaIiCzx9taA9L8mGucHOGW41O2qMPzO37Hw__2x_DHWuk4CMX_2Yk", // ⚠️ Replace with your actual VAPID Key
      serviceWorkerRegistration: registration
    });

    if (!token) {
      pushStatus("No token retrieved.");
      return false; // Show button
    }

    // D. Check Firestore if this token is already saved
    const tokenRef = doc(db, "users", user.uid, "fcmTokens", token);
    const tokenSnap = await getDoc(tokenRef);

    if (tokenSnap.exists()) {
      pushStatus("Token exists in DB. Hiding button.");
      return true; // HIDE button (Already subscribed)
    } else {
      pushStatus("Token missing from DB.");
      return false; // Show button (Need to save token)
    }

  } catch (err) {
    console.error("Error checking subscription:", err);
    pushStatus("Error checking subscription:", err);
    return false; // Show button if unsure
  }
}

async function requestNotificationPermission() {
  try {
    //pushStatus("Waiting for service worker...");

    pushStatus("Requesting permission... Checking if Service worker in navigator");
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

    /*if (!swRegistration) {
      pushStatus("ERROR: Service worker not ready");
      return;
    }*/

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

    pushStatus("Token saved to Firestore");

    document.getElementById("enablePushBtn").style.display = "none";

  } catch (err) {
    pushStatus("ERROR: " + err.message);
  }
}

const provider = new GoogleAuthProvider();
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const calendar = document.getElementById("calendar");
const enablePushBtn = document.getElementById("enablePushBtn");
const DAILY_GOAL = 3;

// ---------- AUTH ----------
enablePushBtn.onclick = async () => {
  await requestNotificationPermission();
  //enablePushBtn.style.display = "none";
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
    //enablePushBtn.style.display = "inline-flex";

    // --- LOGIC CHANGE HERE ---
    // Instead of showing button immediately, we check status first
    const isSubscribed = await checkSubscriptionStatus(user);
    
    if (isSubscribed) {
      enablePushBtn.style.display = "none";
    } else {
      // Only show if NOT subscribed or Token missing
      enablePushBtn.style.display = "flex"; 
    }
    // -------------------------

    initDailyLog(user);
    loadCalendar(user);
    
  } else {
    loginBtn.style.display = "inline-flex";
    userInfo.style.display = "none";
    enablePushBtn.style.display = "none"; // Hide on logout
    calendar.innerHTML = "";
  }
});

async function initDailyLog(user) {
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

    await setDoc(
      doc(db, "users", user.uid),
      {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        //lastReminderDate: null
      },
      { merge: true }
    );

    //loadCalendar(user);
    
} /*else {
    loginBtn.style.display = "inline-flex";
    userInfo.style.display = "none";
  }*/
//});

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
