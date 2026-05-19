import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const form = document.getElementById("guestbook-form");
const listEl = document.getElementById("guestbook-list");
const statusEl = document.getElementById("guestbook-status");
const setupEl = document.getElementById("guestbook-setup");
const formWrap = document.getElementById("guestbook-form-wrap");

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

function renderMessages(snapshot) {
  if (!listEl) return;

  if (snapshot.empty) {
    listEl.innerHTML =
      '<li class="guestbook-empty">아직 글이 없어요. 첫 방명을 남겨 보세요!</li>';
    return;
  }

  listEl.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.className = "guestbook-item";

    const name = document.createElement("p");
    name.className = "guestbook-name";
    name.textContent = data.name || "익명";

    const time = document.createElement("time");
    time.className = "guestbook-time";
    const created = data.createdAt?.toDate?.();
    time.dateTime = created ? created.toISOString() : "";
    time.textContent = formatDate(created);

    const body = document.createElement("p");
    body.className = "guestbook-message";
    body.textContent = data.message || "";

    li.append(name, time, body);
    listEl.appendChild(li);
  });
}

function showSetupMode() {
  setupEl?.classList.remove("hidden");
  formWrap?.classList.add("hidden");
  setStatus("");
}

function showLiveMode() {
  setupEl?.classList.add("hidden");
  formWrap?.classList.remove("hidden");
}

async function initGuestbook() {
  if (!isFirebaseConfigured()) {
    showSetupMode();
    if (listEl) {
      listEl.innerHTML =
        '<li class="guestbook-empty">Firebase 설정 후 방명록이 열립니다. (<code>방명록-설정.md</code> 참고)</li>';
    }
    return;
  }

  showLiveMode();

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const messagesRef = collection(db, "guestbook");
    const q = query(messagesRef, orderBy("createdAt", "desc"), limit(50));

    onSnapshot(
      q,
      (snapshot) => renderMessages(snapshot),
      () => {
        setStatus("방명록을 불러오지 못했어요. Firebase 규칙을 확인해 주세요.", true);
      }
    );

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const message = String(fd.get("message") || "").trim();

      if (!name || !message) {
        setStatus("닉네임과 메시지를 모두 입력해 주세요.", true);
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      setStatus("올리는 중…");

      try {
        await addDoc(messagesRef, {
          name: name.slice(0, 20),
          message: message.slice(0, 300),
          createdAt: serverTimestamp(),
        });
        form.reset();
        setStatus("방명이 등록됐어요! 감사합니다 ✦");
      } catch {
        setStatus("등록에 실패했어요. 잠시 후 다시 시도해 주세요.", true);
      } finally {
        submitBtn.disabled = false;
      }
    });
  } catch {
    showSetupMode();
    setStatus("Firebase 연결에 실패했어요. 설정 값을 다시 확인해 주세요.", true);
  }
}

initGuestbook();
