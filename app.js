import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const calendar = document.getElementById("calendar");

const DAILY_GOAL = 3;

// ---------- AUTH ----------

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

onAuthStateChanged(auth, user => {
  const userInfo = document.getElementById("user-info");

  if (user) {
    document.getElementById("name").textContent = user.displayName || "User";

    loginBtn.style.display = "none";
    userInfo.style.display = "inline-flex";

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
