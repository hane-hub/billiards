import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXoPwSY6HvUOAwnGdq5p1swcGsWoqLmaU",
  authDomain: "poker-billiards.firebaseapp.com",
  projectId: "poker-billiards",
  storageBucket: "poker-billiards.firebasestorage.app",
  messagingSenderId: "353423862340",
  appId: "1:353423862340:web:d01c80fc171db34e262a11",
  measurementId: "G-XRK7XQP146"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, provider);

// Firestore
export const db = getFirestore(app);
