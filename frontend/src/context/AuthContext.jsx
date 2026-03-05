import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // In a MERN stack with Firebase Auth, the frontend's job is just
      // to keep track of the authenticated Firebase user.
      // The backend (Node/Express) will handle creating the MongoDB user record
      // by verifying the Firebase ID token we send it.

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Utility to get the current user's token to send to the backend
  const getToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(true);
    }
    return null;
  };

  const signup = async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    return res;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const value = {
    user,
    signup,
    login,
    logout,
    loginWithGoogle,
    getToken,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
