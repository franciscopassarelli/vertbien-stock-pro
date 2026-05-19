import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthState {
  user: string | null;
  login: (u: string) => void;
  logout: () => void;
}
const Ctx = createContext<AuthState | null>(null);
const KEY = "vertbien-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(KEY);
  });
  useEffect(() => {
    if (user) localStorage.setItem(KEY, user);
    else localStorage.removeItem(KEY);
  }, [user]);
  return (
    <Ctx.Provider value={{ user, login: setUser, logout: () => setUser(null) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
