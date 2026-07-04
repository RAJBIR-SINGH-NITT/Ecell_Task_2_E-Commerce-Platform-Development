/**
 * AuthContext.jsx
 * ---------------
 * Holds "who is logged in" state in one place, so any component can do
 * `const { user, login, logout } = useAuth()` instead of prop-drilling
 * the user object down through 6 layers of components.
 *
 * On page refresh, we re-check localStorage for a token and re-fetch
 * the user's profile -- this is what keeps you logged in across reloads.
 */

import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.me()
      .then(setUser)
      .catch(() => localStorage.removeItem("token")) // stale/expired token
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api.login({ email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }

  async function register(name, email, password) {
    const data = await api.register({ name, email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
