import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        {error && <div className="error-banner">{error}</div>}
        <label>Email</label>
        <input type="email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Password</label>
        <input type="password" required value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn-primary" type="submit">Log in</button>
        <p className="auth-switch">No account? <Link to="/register">Sign up</Link></p>
        <p className="auth-hint">Demo: admin@ecell.com / admin123</p>
      </form>
    </div>
  );
}
