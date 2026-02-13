import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthChange } from "@/lib/firebase";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  uid: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: false,
  loading: true,
  uid: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest: user?.isAnonymous ?? false,
        loading,
        uid: user?.uid ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
