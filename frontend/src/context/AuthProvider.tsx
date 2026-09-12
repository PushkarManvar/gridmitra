import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import type { User } from "firebase/auth";

import { setAuthToken } from "../lib/api";
import { auth } from "../lib/firebase";
import { AuthContext } from "./AuthContext";

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (current) => {
      setUser(current);
      if (current) {
        current
          .getIdToken()
          .then((token) => setAuthToken(token))
          .catch(() => setAuthToken(null));
      } else {
        setAuthToken(null);
      }
      setReady(true);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setAuthToken(null);
  };

  const getIdToken = async () => {
    const current = auth.currentUser;
    return current ? current.getIdToken() : null;
  };

  const value = useMemo(
    () => ({ user, ready, signInWithGoogle, signInWithEmail, signOut, getIdToken }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}