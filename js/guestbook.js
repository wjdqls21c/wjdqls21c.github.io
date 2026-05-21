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

const modalEl = document.getElementById("postit-modal");
const modalCard = document.getElementById("postit-modal-card");
const modalName = document.getElementById("postit-modal-title");
const modalMessage = document.getElementById("postit-modal-message");
const modalTime = document.getElementById("postit-modal-time");
const modalBackdrop = modalEl?.querySelector(".postit-modal-backdrop");
const modalClose = modalEl?.querySelector(".postit-modal-close");

const POSTIT_COLORS = ["yellow", "pink", "mint", "sky", "lavender"];
const DENSITY_CLASSES = ["postit-list--medium", "postit-list--dense", "postit-list--packed"];
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

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

function applyListDensity(count) {
  if (!listEl) return;
  listEl.classList.remove(...DENSITY_CLASSES);
  listEl.dataset.count = String(count);

  if (count > 30) listEl.classList.add("postit-list--packed");
  else if (count > 15) listEl.classList.add("postit-list--dense");
  else if (count > 6) listEl.classList.add("postit-list--medium");
}

function bindWind(noteBtn) {
  if (prefersReducedMotion) return;

  const onMove = (event) => {
    const rect = noteBtn.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    noteBtn.style.setProperty("--wind-x", dx.toFixed(2));
    noteBtn.style.setProperty("--wind-y", dy.toFixed(2));
  };

  noteBtn.addEventListener("mouseenter", () => {
    noteBtn.classList.add("is-windy");
  });
  noteBtn.addEventListener("mousemove", onMove);
  noteBtn.addEventListener("mouseleave", () => {
    noteBtn.classList.remove("is-windy");
    noteBtn.style.removeProperty("--wind-x");
    noteBtn.style.removeProperty("--wind-y");
  });
}

function openModal({ name, message, timeText, timeIso, color }) {
  if (!modalEl || !modalCard) return;

  modalName.textContent = name;
  modalMessage.textContent = message;
  modalTime.textContent = timeText;
  modalTime.dateTime = timeIso || "";

  modalCard.className = `postit-modal-card postit-modal-card--${color}`;
  modalEl.classList.remove("hidden");
  modalEl.hidden = false;
  document.body.classList.add("postit-modal-open");
  modalClose?.focus();
}

function closeModal() {
  if (!modalEl) return;
  modalEl.classList.add("hidden");
  modalEl.hidden = true;
  document.body.classList.remove("postit-modal-open");
}

function initModal() {
  modalBackdrop?.addEventListener("click", closeModal);
  modalClose?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalEl?.hidden) closeModal();
  });
}

function renderMessages(snapshot) {
  if (!listEl) return;

  if (snapshot.empty) {
    listEl.classList.remove(...DENSITY_CLASSES);
    listEl.innerHTML =
      '<li class="postit-empty">아직 붙은 포스트잇이 없어요.<br />첫 번째로 하나 붙여 주세요!</li>';
    return;
  }

  const count = snapshot.size;
  applyListDensity(count);
  listEl.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const { color, tilt } = postitStyle(docSnap.id);
    const created = data.createdAt?.toDate?.();
    const timeText = formatDate(created);
    const timeIso = created ? created.toISOString() : "";
    const name = data.name || "익명";
    const message = data.message || "";

    const li = document.createElement("li");
    li.className = "postit-item";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `postit-note postit-note--${color}`;
    btn.style.setProperty("--tilt", `${tilt}deg`);
    btn.setAttribute("aria-label", `${name}님의 응원 포스트잇, 눌러서 크게 보기`);

    const tape = document.createElement("span");
    tape.className = "postit-tape";
    tape.setAttribute("aria-hidden", "true");

    const nameEl = document.createElement("p");
    nameEl.className = "postit-name";
    nameEl.textContent = name;

    const body = document.createElement("p");
    body.className = "postit-message";
    body.textContent = message;

    const time = document.createElement("time");
    time.className = "postit-time";
    time.dateTime = timeIso;
    time.textContent = timeText;

    btn.append(tape, nameEl, body, time);
    bindWind(btn);
    btn.addEventListener("click", () => {
      openModal({ name, message, timeText, timeIso, color });
    });

    li.append(btn);
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
  initModal();

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
