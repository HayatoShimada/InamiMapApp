import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  // 本番環境では環境変数から取得、開発環境はデモ設定
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-project",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-inami-map-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-inami-map-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-inami-map-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Firebase サービス初期化
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google認証プロバイダー
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// 開発環境でエミュレータ接続（一度だけ実行）
if (import.meta.env.DEV || window.location.hostname === 'localhost') {
  // 認証エミュレータ
  if (!(auth as any)._delegate?.emulatorConfig) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  }
  
  // Firestoreエミュレータ
  if (!(db as any)._delegate?.settings?.host?.includes('localhost:8080')) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  
  // Storageエミュレータ
  if (!(storage as any)._delegate?.host?.includes('localhost:9199')) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }
}

export default app;