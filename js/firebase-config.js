// Firebase 설정 — https://console.firebase.google.com
export const firebaseConfig = {
  apiKey: "AIzaSyAP1G_RFH6DNwhQTOpfG16haAVwvIe1JDk",
  authDomain: "bbakbinking.firebaseapp.com",
  projectId: "bbakbinking",
  storageBucket: "bbakbinking.firebasestorage.app",
  messagingSenderId: "58315329987",
  appId: "1:58315329987:web:7683897f3df9831ae52d76",
};

export function isFirebaseConfigured() {
  const c = firebaseConfig;
  return Boolean(c.apiKey && c.projectId && c.appId);
}
