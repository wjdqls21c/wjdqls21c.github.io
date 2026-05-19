// Firebase 설정 — https://console.firebase.google.com 에서 복사
// 모두 채우면 방명록이 동작합니다.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

export function isFirebaseConfigured() {
  const c = firebaseConfig;
  return Boolean(c.apiKey && c.projectId && c.appId);
}
