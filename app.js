import { db, auth } from './firebase.js';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithRedirect, 
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const calendar = document.getElementById("calendar");

const DAILY_GOAL = 3;

// ---------- AUTH ----------

loginBtn.onclick = async () => {
  try {
    await signInWithRedirect(auth, provider);
  } catch (err) {
    alert(err.message);
  }
};

logoutBtn.onclick = async () => {
  await signOut(auth);
};

getRedirectResult(auth).catch(err => {
  console.error("Redirect error:", err);
});

onAuthStateChanged(auth, user => {
  const userInfo = document.getElementById("user-info");

  if (user) {
    document.getElementById("name").textContent = user.displayName || "User";

    loginBtn.style.display = "none";
    userInfo.style.display = "inline-flex";
  } else {
    loginBtn.style.display = "inline-flex";
    userInfo.style.display = "none";
  }
});

// ---------- DATE UTILS ----------
function formatDate(d) {
  return d.toISOString().split("T")[0];
}

// ---------- LOAD CALENDAR ----------
async function loadCalendar(user) {
  calendar.innerHTML = ""; // clear on re-login

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayId = formatDate(date);

    const ref = doc(db, "users", user.uid, "dailyLogs", dayId);
    const snap = await getDoc(ref);

    const litres = snap.exists() ? snap.data().litres : 0;
    const completed = litres >= DAILY_GOAL;

    const div = document.createElement("div");
    div.className = `day ${completed ? "success" : "fail"} ${i === 0 ? "today" : ""}`;

    div.innerHTML = `
      <b>${dayId}</b><br>
      ${litres} / ${DAILY_GOAL} L
    `;

    if (i === 0) {
      const controls = document.createElement("div");
      controls.className = "controls";

      controls.innerHTML = `
        <button id="plus">+</button>
        <button id="minus">−</button>
      `;

      controls.querySelector("#plus").onclick = () =>
        updateLitres(user, litres + 1);

      controls.querySelector("#minus").onclick = () =>
        updateLitres(user, litres - 1);

      div.appendChild(controls);
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
