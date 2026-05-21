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

const POSTIT_COLORS = ["yellow", "pink", "mint", "sky", "lavender"];

function setStatus(text, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle("is-error", isError);
}

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function postitStyle(docId) {
  const h = hashString(docId);
  const color = POSTIT_COLORS[h % POSTIT_COLORS.length];
  const tilt = -8 + (h % 17);
  return { color, tilt };
}

function renderMessages(snapshot) {
  if (!listEl) return;

  if (snapshot.empty) {
    listEl.innerHTML =
      '<li class="postit-empty">아직 붙은 포스트잇이 없어요.<br />첫 번째로 하나 붙여 주세요!</li>';
    return;
  }

  listEl.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const { color, tilt } = postitStyle(docSnap.id);

    const li = document.createElement("li");
    li.className = `postit-note postit-note--${color}`;
    li.style.setProperty("--tilt", `${tilt}deg`);

    const tape = document.createElement("span");
    tape.className = "postit-tape";
    tape.setAttribute("aria-hidden", "true");

    const name = document.createElement("p");
    name.className = "postit-name";
    name.textContent = data.name || "익명";

    const body = document.createElement("p");
    body.className = "postit-message";
    body.textContent = data.message || "";

    const time = document.createElement("time");
    time.className = "postit-time";
    const created = data.createdAt?.toDate?.();
    time.dateTime = created ? created.toISOString() : "";
    time.textContent = formatDate(created);

    li.append(tape, name, body, time);
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
        '<li class="postit-empty">Firebase 설정 후 응원벽이 열립니다. (<code>방명록-설정.md</code> 참고)</li>';
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
        setStatus("응원벽을 불러오지 못했어요. Firebase 규칙을 확인해 주세요.", true);
      }
    );

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const message = String(fd.get("message") || "").trim();

      if (!name || !message) {
        setStatus("이름과 응원 한 줄을 모두 입력해 주세요.", true);
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      setStatus("벽에 붙이는 중…");

      try {
        await addDoc(messagesRef, {
          name: name.slice(0, 20),
          message: message.slice(0, 300),
          createdAt: serverTimestamp(),
        });
        form.reset();
        setStatus("포스트잇을 붙였어요! 감사합니다 ✦");
      } catch {
        setStatus("붙이기에 실패했어요. 잠시 후 다시 시도해 주세요.", true);
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
