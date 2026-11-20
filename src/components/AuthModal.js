import { useState } from "react";
import { sendOtp, verifyOtp, resetPassword, updatePassword } from "../lib/supabase";

const TITLES = { signin: "Welcome back", signup: "Create your account", otp: "Sign in with a code", forgot: "Reset your password", recovery: "Choose a new password" };

export default function AuthModal({ message, recovery, onSubmit, onDone, onClose }) {
  const [mode, setMode] = useState(recovery ? "recovery" : "signin");
  const [form, setForm] = useState({ name: "", email: "", password: "", code: "" });
  const [show, setShow] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const email = form.email.trim().toLowerCase();
  const switchTo = (m) => { setMode(m); setError(""); setInfo(""); setSent(false); };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    if (mode !== "recovery" && !/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if ((mode === "signin" || mode === "signup" || mode === "recovery") && form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (mode === "signup" && !form.name.trim()) return setError("Enter your name.");
    setBusy(true);
    let err = null;
    try {
      if (mode === "signin" || mode === "signup") err = await onSubmit(mode, { ...form, email });
      else if (mode === "otp" && !sent) {
        const r = await sendOtp(email);
        if (r.error) err = r.error.message; else { setSent(true); setInfo("We emailed you a 6-digit code. Enter it below."); }
      } else if (mode === "otp") {
        const r = await verifyOtp(email, form.code.trim());
        if (r.error) err = "That code is wrong or has expired."; else return onDone();
      } else if (mode === "forgot") {
        const r = await resetPassword(email);
        if (r.error) err = r.error.message; else setInfo("If an account exists for this email, a reset link is on its way. Open it on this device.");
      } else if (mode === "recovery") {
        const r = await updatePassword(form.password);
        if (r.error) err = r.error.message; else return onDone();
      }
    } catch (x) { err = x.message; }
    setBusy(false);
    if (err) setError(err);
  };

  const password = (label, auto) => (
    <label>{label}
      <span className="pw">
        <input type={show ? "text" : "password"} value={form.password} onChange={set("password")} autoComplete={auto} />
        <button type="button" className="link" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
      </span>
    </label>
  );
  const cta = { signin: "Sign in", signup: "Create account", otp: sent ? "Verify code" : "Email me a code", forgot: "Send reset link", recovery: "Save new password" }[mode];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Account" onClick={(e) => e.stopPropagation()}>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
        <h2>{TITLES[mode]}</h2>
        {message && mode !== "recovery" && <p className="muted">{message}</p>}
        <form onSubmit={submit}>
          {mode === "signup" && <label>Full name<input value={form.name} onChange={set("name")} autoComplete="name" /></label>}
          {mode !== "recovery" && <label>Email<input type="email" value={form.email} onChange={set("email")} autoComplete="email" disabled={sent} /></label>}
          {(mode === "signin" || mode === "signup") && password("Password", mode === "signup" ? "new-password" : "current-password")}
          {mode === "recovery" && password("New password", "new-password")}
          {mode === "otp" && sent && <label>6-digit code<input inputMode="numeric" maxLength={6} value={form.code} onChange={set("code")} autoComplete="one-time-code" autoFocus /></label>}
          {info && <p className="green" role="status">{info}</p>}
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn primary block" type="submit" disabled={busy}>{busy ? "Please wait…" : cta}</button>
        </form>
        {mode === "signin" && (
          <p className="center small">
            <button className="link" onClick={() => switchTo("forgot")}>Forgot password?</button>{" · "}
            <button className="link" onClick={() => switchTo("otp")}>Sign in with email code</button>
          </p>
        )}
        {(mode === "signin" || mode === "signup") ? (
          <p className="center small">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button className="link" onClick={() => switchTo(mode === "signup" ? "signin" : "signup")}>{mode === "signup" ? "Sign in" : "Create an account"}</button>
          </p>
        ) : mode !== "recovery" && (
          <p className="center small"><button className="link" onClick={() => switchTo("signin")}>Back to sign in</button></p>
        )}
        {mode !== "recovery" && <button className="link center block" onClick={onClose}>Continue as guest</button>}
      </div>
    </div>
  );
}
