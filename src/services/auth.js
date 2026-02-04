import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

// SIGNUP
export const signupUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// LOGIN
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// LOGOUT
export const logoutUser = () => {
  return signOut(auth);
};
