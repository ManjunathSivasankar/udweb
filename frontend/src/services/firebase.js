import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// These should be in .env file for security
const firebaseConfig = {
  apiKey: "AIzaSyDSaoVbrrK1oe_ZzxgFQaQ4_jwrisYqkrE",
  authDomain: "project-1-551d7.firebaseapp.com",
  projectId: "project-1-551d7",
  storageBucket: "project-1-551d7.firebasestorage.app",
  messagingSenderId: "1033742427716",
  appId: "1:1033742427716:web:d32a8d204ddd06f9fe3e11",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
