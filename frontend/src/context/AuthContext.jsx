import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, setAuthToken } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "voice_token";
const EMAIL_KEY = "voice_email";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(localStorage.getItem(EMAIL_KEY) || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  async function login(email, password) {
    setLoading(true);
    setError("");
    try {
      const data = await loginApi(email, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(EMAIL_KEY, data.email);
      setToken(data.token);
      setUser(data.email);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken("");
    setUser("");
    setError("");
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      login,
      logout
    }),
    [token, user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
