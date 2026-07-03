import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Safe loading of config fields
const firebaseConfig = {
  apiKey: "AIzaSyCXP7Pfp3tVOAc7Ch_Q5uruiT_REP5lMCE",
  authDomain: "intricate-equinox-f07pf.firebaseapp.com",
  projectId: "intricate-equinox-f07pf",
  storageBucket: "intricate-equinox-f07pf.firebasestorage.app",
  messagingSenderId: "413885897452",
  appId: "1:413885897452:web:c4cf4b6a693e18e51aa3c9"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
// Prompt user to select an account when signing in with Google
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export {
  app,
  auth,
  db,
  GoogleAuthProvider,
  googleProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously
};
