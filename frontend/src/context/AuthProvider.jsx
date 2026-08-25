import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  fbUpdateProfile,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "../services/firebase.js";

const defaultProfile = {
  age: 30,
  gender: "Female",
  state: "Andhra Pradesh",
  occupation: "Student",
  annualIncome: 180000,
  category: "OBC",
  disability: false,
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.profile) {
              setProfile(data.profile);
            }
          } else {
            // Create user document in Firestore if not existing
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Citizen",
              profile: defaultProfile,
              createdAt: new Date().toISOString(),
            });
            setProfile(defaultProfile);
          }
        } catch (err) {
          console.warn("Firestore profile sync notice:", err);
          // Keep default profile if firestore read rule is restrictive
          setProfile(defaultProfile);
        }
      } else {
        setUser(null);
        setProfile(defaultProfile);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async ({ name, email, password, profile: customProfile }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      try {
        await fbUpdateProfile(cred.user, { displayName: name });
      } catch (e) {
        console.warn("Failed to set display name:", e);
      }
    }
    const initialProfile = { ...defaultProfile, ...(customProfile || {}) };
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: name || email.split("@")[0],
        email,
        profile: initialProfile,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Firestore write error during signup:", e);
    }
    setProfile(initialProfile);
    return cred.user;
  };

  const login = async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  };

  const logout = async () => {
    await fbSignOut(auth);
  };

  const updateProfile = async (newProfile) => {
    setProfile(newProfile);
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          profile: newProfile,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Firestore update notice:", err);
      }
    }
  };

  const session = useMemo(() => {
    if (!user) return null;
    return {
      name: user.displayName || user.email?.split("@")[0] || "Citizen",
      email: user.email,
      uid: user.uid,
      token: user.accessToken || user.uid,
      profile,
    };
  }, [user, profile]);

  const value = useMemo(
    () => ({
      user,
      session,
      isAuthenticated: Boolean(user),
      profile,
      signup,
      login,
      loginWithGoogle,
      logout,
      updateProfile,
      loading,
    }),
    [user, session, profile, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
