import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  firebaseConfig,
  isFirebaseConfigured,
  adminEmail,
  isAdminEmail,
} from "./firebase-config.js";

const loginSection = document.getElementById("admin-login");
const setupSection = document.getElementById("admin-setup");
const deniedSection = document.getElementById("admin-denied");
const dashboardSection = document.getElementById("admin-dashboard");
const listEl = document.getElementById("admin-list");
const statusEl = document.getElementById("admin-status");
const deniedEmailEl = document.getElementById("denied-email");
const userEmailEl = document.getElementById("admin-user-email");

let messagesUnsubscribe = null;

function setStatus(text, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle("is-error", isError);
}

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function showOnly(section) {
  [loginSection, setupSection, deniedSection, dashboardSection].forEach((el) => {
    el?.classList.add("hidden");
  });
  section?.classList.remove("hidden");
}

function renderAdminList(snapshot, db) {
  if (!listEl) return;

  if (snapshot.empty) {
    listEl.innerHTML = '<li class="guestbook-empty">방명이 없습니다.</li>';
    return;
  }

  listEl.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.className = "guestbook-item admin-item";

    const head = document.createElement("div");
    head.className = "admin-item-head";

    const meta = document.createElement("div");
    const name = document.createElement("p");
    name.className = "guestbook-name";
    name.textContent = data.name || "익명";

    const time = document.createElement("time");
    time.className = "guestbook-time";
    const created = data.createdAt?.toDate?.();
    time.dateTime = created ? created.toISOString() : "";
    time.textContent = formatDate(created);

    meta.append(name, time);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-danger btn-sm";
    delBtn.textContent = "삭제";
    delBtn.addEventListener("click", async () => {
      const ok = window.confirm(
        `「${data.name}」님 방명을 삭제할까요?\n\n${(data.message || "").slice(0, 80)}`
      );
      if (!ok) return;

      delBtn.disabled = true;
      setStatus("삭제 중…");

      try {
        await deleteDoc(doc(db, "guestbook", docSnap.id));
        setStatus("삭제했습니다.");
      } catch {
        setStatus("삭제 실패. Firebase 규칙에 관리자 삭제 권한이 있는지 확인하세요.", true);
        delBtn.disabled = false;
      }
    });

    head.append(meta, delBtn);

    const body = document.createElement("p");
    body.className = "guestbook-message";
    body.textContent = data.message || "";

    li.append(head, body);
    listEl.appendChild(li);
  });
}

function startGuestbookListener(db) {
  if (messagesUnsubscribe) messagesUnsubscribe();

  const messagesRef = collection(db, "guestbook");
  const q = query(messagesRef, orderBy("createdAt", "desc"), limit(100));

  messagesUnsubscribe = onSnapshot(
    q,
    (snapshot) => renderAdminList(snapshot, db),
    () => setStatus("목록을 불러오지 못했어요.", true)
  );
}

function stopGuestbookListener() {
  if (messagesUnsubscribe) {
    messagesUnsubscribe();
    messagesUnsubscribe = null;
  }
}

async function init() {
  if (!isFirebaseConfigured()) {
    showOnly(setupSection);
    setupSection.querySelector("p").textContent =
      "Firebase 설정이 없습니다. firebase-config.js를 확인하세요.";
    return;
  }

  if (!adminEmail || !adminEmail.includes("@")) {
    showOnly(setupSection);
    return;
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();

  document.getElementById("btn-google-login")?.addEventListener("click", async () => {
    setStatus("");
    try {
      await signInWithPopup(auth, provider);
    } catch {
      setStatus("로그인에 실패했어요. 팝업 차단을 해제해 보세요.", true);
    }
  });

  const logout = async () => {
    stopGuestbookListener();
    await signOut(auth);
    setStatus("");
  };

  document.getElementById("btn-logout")?.addEventListener("click", logout);
  document.getElementById("btn-logout-denied")?.addEventListener("click", logout);

  onAuthStateChanged(auth, (user) => {
    stopGuestbookListener();

    if (!user) {
      showOnly(loginSection);
      if (listEl) listEl.innerHTML = "";
      return;
    }

    if (!isAdminEmail(user.email)) {
      if (deniedEmailEl) {
        deniedEmailEl.textContent = `${user.email} 계정은 관리자가 아닙니다.`;
      }
      showOnly(deniedSection);
      return;
    }

    if (userEmailEl) userEmailEl.textContent = user.email;
    showOnly(dashboardSection);
    startGuestbookListener(db);
  });
}

init();
