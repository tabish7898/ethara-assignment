import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import { handleFirestoreError, OperationType } from "@/src/lib/error-handler";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: "ADMIN" | "MEMBER";
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          // Fetch or create profile
          const userDocRef = doc(db, "users", user.uid);
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
            return;
          }
          
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || "Unknown User",
              photoURL: user.photoURL || "",
              role: "MEMBER",
            };
            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
            });
            setProfile(newProfile);
          } else {
            setProfile(userDoc.data() as UserProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("AuthContext - Profile Error:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("AuthContext - Login Error:", error);
      // We throw the error so the UI can catch it if needed, 
      // but we log specifically for debugging.
      if (error.code === 'auth/unauthorized-domain') {
        console.error("DOMAIN ERROR: The current domain is not authorized in your Firebase Project.");
        console.error("Action Required: Add your domain to the Authorized Domains list in the Firebase Console (Authentication > Settings > Authorized domains).");
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
