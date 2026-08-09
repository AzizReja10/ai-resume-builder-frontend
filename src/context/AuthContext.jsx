import { createContext, useContext, useState, useEffect } from "react";
import client, { setAuthToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      setAuthToken(stored);
    }
    setInitializing(false);
  }, []);

  async function login(email, password) {
    const res = await client.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.access_token);
    setToken(res.data.access_token);
    setAuthToken(res.data.access_token);
  }

  async function signup(email, password, fullName) {
    await client.post("/auth/signup", {
      email,
      password,
      full_name: fullName,
    });
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}