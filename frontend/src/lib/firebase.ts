import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Firebase web configuration. These are publishable client values (they identify
// the project for client-side SDK init) — real protection comes from Firebase
// Security Rules and backend Admin SDK token verification, never from these.
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ??
    "AIzaSyAeSE2WlUqOgTgY3-GfdtYxSiRoAnLk8WM",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "gridmitra.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "gridmitra",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "gridmitra.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "153324649869",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ??
    "1:153324649869:web:632a586df008535af791c4",
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);