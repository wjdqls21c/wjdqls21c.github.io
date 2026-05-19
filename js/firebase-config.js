// Firebase 설정 — https://console.firebase.google.com
export const firebaseConfig = {
  apiKey: "AIzaSyAP1G_RFH6DNwhQTOpfG16haAVwvIe1JDk",
  authDomain: "bbakbinking.firebaseapp.com",
  projectId: "bbakbinking",
  storageBucket: "bbakbinking.firebasestorage.app",
  messagingSenderId: "58315329987",
  appId: "1:58315329987:web:7683897f3df9831ae52d76",
};

// 관리자 Gmail (Google 로그인 이메일과 동일해야 함)
export const adminEmail = "";

export function isFirebaseConfigured() {
  const c = firebaseConfig;
  return Boolean(c.apiKey && c.projectId && c.appId);
}

export function isAdminEmail(email) {
  if (!adminEmail || !email) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}
