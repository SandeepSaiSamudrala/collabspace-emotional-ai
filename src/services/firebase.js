// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf0K7PErIityvod2VAY5iclmKds0etSMg",
  authDomain: "collabspace-emotional-ai.firebaseapp.com",
  projectId: "collabspace-emotional-ai",
  storageBucket: "collabspace-emotional-ai.firebasestorage.app",
  messagingSenderId: "519692808842",
  appId: "1:519692808842:web:36c79a2194bdc2334af373"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);