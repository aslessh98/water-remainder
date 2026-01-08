import { db, auth } from './firebase.js';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

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
  } else {
    loginBtn.style.display = "inline-flex";
    userInfo.style.display = "none";
  }
});

import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const calendar = document.getElementById('calendar');
const goal = 3;

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

async function loadDays() {
  const uid = auth.currentUser.uid;

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const id = formatDate(date);

    const ref = doc(db, 'users', uid, 'dailyLogs', id);
    const snap = await getDoc(ref);

    let litres = snap.exists() ? snap.data().litres : 0;
    const completed = litres >= goal;

    const div = document.createElement('div');
    div.className = `day ${completed ? 'success' : 'fail'} ${i === 0 ? 'today' : ''}`;
    div.innerHTML = `<b>${id}</b><br>${litres} / 3 L`;

    if (i === 0) {
      const controls = document.createElement('div');
      controls.className = 'controls';
      controls.innerHTML = `
        <button onclick="update(${litres + 1})">+</button>
        <button onclick="update(${litres - 1})">-</button>
      `;
      div.appendChild(controls);
    }

    calendar.appendChild(div);
  }
}

window.update = async function (litres) {
  litres = Math.max(0, litres);
  const uid = auth.currentUser.uid;
  const today = formatDate(new Date());

  await setDoc(doc(db, 'users', uid, 'dailyLogs', today), {
    litres,
    goal,
    completed: litres >= goal
  });

  location.reload();
};

loadDays();
