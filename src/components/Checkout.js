import { useState } from "react";
import { formatPrice } from "../data";
import { Summary } from "./CartPage";

export default function Checkout({ user, totals, items, onPay, go }) {
  const [form, setForm] = useState({ name: user?.name || "", phone: "", line: "", city: "", pincode: "" });
  const [status, setStatus] = useState("form"); // form | processing | success
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const pay = async (e) => {
    e.preventDefault();
    if (!form.name || !/^\d{10}$/.test(form.phone) || !form.line || !form.city || !/^\d{6}$/.test(form.pincode))
      return setError("Fill in your name, a 10-digit phone number, address, city and a 6-digit pincode.");
    setError("");
    setStatus("processing");
    const amount = totals.total;
    try {
      const r = await onPay(form); // opens Razorpay; resolves after the payment is verified on the server
      setDone({ id: (r?.orderId || "").slice(0, 8).toUpperCase(), amount });
      setStatus("success");
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      setStatus("form");
    }
  };

  if (status === "success" && done) {
    return (
      <section className="center-box">
        <div className="success-mark" aria-hidden="true">✓</div>
        <h1>Order placed</h1>
        <p>Your order <strong>{done.id}</strong> is confirmed. Total {formatPrice(done.amount)}.</p>
        <div className="row center-row">
          <button className="btn primary" onClick={() => go("account")}>View my orders</button>
          <button className="btn ghost" onClick={() => go("catalog")}>Keep shopping</button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h1>Checkout</h1>
      <form className="two-col" onSubmit={pay}>
        <div className="panel">
          <h3>Delivery address</h3>
          <label>Full name<input value={form.name} onChange={set("name")} /></label>
          <label>Phone<input inputMode="numeric" maxLength={10} value={form.phone} onChange={set("phone")} /></label>
          <label>Address<textarea rows={3} value={form.line} onChange={set("line")} /></label>
          <label>City<input value={form.city} onChange={set("city")} /></label>
          <label>Pincode<input inputMode="numeric" maxLength={6} value={form.pincode} onChange={set("pincode")} /></label>
          <p className="muted small">You choose UPI, card or net banking on the secure Razorpay window after clicking Pay.</p>
        </div>
        <aside>
          <Summary totals={totals} coupon={null} />
          <p className="muted small">{items.length} item type(s) in this order</p>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn primary block" disabled={status === "processing"}>
            {status === "processing" ? "Waiting for payment…" : `Pay ${formatPrice(totals.total)}`}
          </button>
        </aside>
      </form>
    </section>
  );
}
