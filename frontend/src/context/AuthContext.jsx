/**
 * AuthContext — global authentication state.
 * Wraps the entire app. Any component can call useAuth().
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  registerUser, loginUser, logoutUser, getMe,
  storeToken, clearStoredToken, isTokenStored, getApiErrorMessage,
} from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { id, email, name, created_at }
  const [loading, setLoading] = useState(true);   // true while restoring session
  const [error, setError]     = useState("");

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!isTokenStored()) {
      setLoading(false);
      return;
    }
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => clearStoredToken())   // token expired / invalid → clear it
      .finally(() => setLoading(false));
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password, confirmPassword }) => {
    setError("");
    const res = await registerUser({
      name,
      email,
      password,
      confirm_password: confirmPassword,
    });
    storeToken(res.data.access_token, false);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password, rememberMe }) => {
    setError("");
    const res = await loginUser({ email, password, remember_me: rememberMe });
    storeToken(res.data.access_token, rememberMe);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await logoutUser(); } catch (_) { /* ignore if token already expired */ }
    clearStoredToken();
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, isAuthenticated, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
