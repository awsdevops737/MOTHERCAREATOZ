import { useState } from "react";
import { BIZ } from "./Policies";

const FAQ = [
  ["How long does delivery take?", "Orders are delivered in 5 to 7 working days after payment is confirmed."],
  ["Can I return a product?", "Yes, within 10 days of delivery if it is unused and unopened. Diapers cannot be returned, except if they arrive damaged or wrong."],
  ["Which payments do you accept?", "UPI, cards and net banking, paid securely through Razorpay."],
];

export default function Contact({ go }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [opened, setOpened] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    // Opens the customer's email app with the message filled in.
    const body = `${form.message}\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}`;
    window.location.href = `mailto:${BIZ.email}?subject=${encodeURIComponent("Enquiry from " + form.name)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <section>
      <h1>Contact us</h1>
      <div className="two-col">
        <form className="panel" onSubmit={submit}>
          <label>Name<input required value={form.name} onChange={set("name")} /></label>
          <label>Email<input required type="email" value={form.email} onChange={set("email")} /></label>
          <label>Phone (optional)<input value={form.phone} onChange={set("phone")} /></label>
          <label>How can we help?<textarea required rows={4} value={form.message} onChange={set("message")} /></label>
          <button className="btn primary">Email us</button>
          {opened && <p className="muted small">Your email app should have opened. If not, write to {BIZ.email} or call {BIZ.phone}.</p>}
        </form>
        <aside>
          <div className="panel">
            <h3>Reach us</h3>
            <p><strong>{BIZ.name}</strong></p>
            <p>Phone: <a href="tel:+917207560510">{BIZ.phone}</a></p>
            <p>Email: <a href={`mailto:${BIZ.email}`}>{BIZ.email}</a></p>
            <p>Address: {BIZ.address}</p>
          </div>
          <div className="panel">
            <h3>Common questions</h3>
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
            <p className="small">
              <button className="link" onClick={() => go("refunds")}>Refund policy</button>{" · "}
              <button className="link" onClick={() => go("shipping")}>Shipping policy</button>
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

