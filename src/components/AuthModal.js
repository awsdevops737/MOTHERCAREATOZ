import { useState } from "react";

export default function AuthModal({ message, onSubmit, onClose }) {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (mode === "signup" && !form.name.trim()) return setError("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    const err = onSubmit(mode, form);
    if (err) setError(err);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Account" onClick={(e) => e.stopPropagation()}>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
        <h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
        {message && <p className="muted">{message}</p>}
        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>Full name<input value={form.name} onChange={set("name")} autoComplete="name" /></label>
          )}
          <label>Email<input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></label>
          <label>Password<input type="password" value={form.password} onChange={set("password")} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
          {mode === "signup" && (
            <label>I want to
              <select value={form.role} onChange={set("role")}>
                <option value="customer">Shop for my baby</option>
                <option value="seller">Sell products on this store</option>
              </select>
            </label>
          )}
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn primary block" type="submit">{mode === "signup" ? "Create account" : "Sign in"}</button>
        </form>
        <p className="center small">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button className="link" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }}>
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>
        <button className="link center block" onClick={onClose}>Continue as guest</button>
      </div>
    </div>
  );
}
