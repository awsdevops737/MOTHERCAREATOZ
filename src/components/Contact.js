import { useState } from "react";
<<<<<<< HEAD

const FAQ = [
  ["How long does delivery take?", "Most orders arrive in 2 to 5 working days."],
  ["Can I return a product?", "Unopened items can be returned within 7 days of delivery."],
  ["Which payments do you accept?", "UPI, cards, net banking and cash on delivery."],
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
=======
import { BIZ } from "./Policies";

const FAQ = [
  ["How long does delivery take?", "Orders are delivered in 5 to 7 working days after payment is confirmed."],
  ["Can I return a product?", "Yes, within 10 days of delivery if it is unused and unopened. Diapers cannot be returned, except if they arrive damaged or wrong."],
  ["Which payments do you accept?", "UPI, cards and net banking, paid securely through Razorpay."],
];

export default function Contact({ go }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [opened, setOpened] = useState(false);
>>>>>>> origin/main
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
<<<<<<< HEAD
    // TODO: send `form` to your backend or an email service.
    setSent(true);
=======
    // Opens the customer's email app with the message filled in.
    const body = `${form.message}\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}`;
    window.location.href = `mailto:${BIZ.email}?subject=${encodeURIComponent("Enquiry from " + form.name)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
>>>>>>> origin/main
  };

  return (
    <section>
      <h1>Contact us</h1>
      <div className="two-col">
<<<<<<< HEAD
        {sent ? (
          <div className="panel">
            <h3>Message sent</h3>
            <p>Thanks, {form.name || "there"}. We will reply within one working day.</p>
          </div>
        ) : (
          <form className="panel" onSubmit={submit}>
            <label>Name<input required value={form.name} onChange={set("name")} /></label>
            <label>Email<input required type="email" value={form.email} onChange={set("email")} /></label>
            <label>Phone (optional)<input value={form.phone} onChange={set("phone")} /></label>
            <label>How can we help?<textarea required rows={4} value={form.message} onChange={set("message")} /></label>
            <button className="btn primary">Send message</button>
          </form>
        )}
        <aside>
          <div className="panel">
            <h3>Reach us</h3>
            <p>Phone: +91 00000 00000</p>
            <p>Email: support@mothercare.example</p>
            <p>Hours: Mon to Sat, 9 am to 7 pm</p>
            <p>Address: Your store address, City, State</p>
=======
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
>>>>>>> origin/main
          </div>
          <div className="panel">
            <h3>Common questions</h3>
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
<<<<<<< HEAD
=======
            <p className="small">
              <button className="link" onClick={() => go("refunds")}>Refund policy</button>{" · "}
              <button className="link" onClick={() => go("shipping")}>Shipping policy</button>
            </p>
>>>>>>> origin/main
          </div>
        </aside>
      </div>
    </section>
  );
}
<<<<<<< HEAD
=======

>>>>>>> origin/main
