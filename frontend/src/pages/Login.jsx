import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { token, login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      await login(email.trim(), password);
    } catch {
      // Error state handled inside context for display.
    }
  }

  if (token) {
    return <Navigate to="/call" replace />;
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Voice Calling Test</h1>
        <p>Login with one of the 2 configured test users.</p>
        <form onSubmit={submit} className="stack">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error ? <div className="error">{error}</div> : null}
        </form>
      </div>
    </div>
  );
}
