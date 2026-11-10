import { useState } from "react";

const FAQ = [
  ["How long does delivery take?", "Most orders arrive in 2 to 5 working days."],
  ["Can I return a product?", "Unopened items can be returned within 7 days of delivery."],
  ["Which payments do you accept?", "UPI, cards, net banking and cash on delivery."],
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    // TODO: send `form` to your backend or an email service.
    setSent(true);
  };

  return (
    <section>
      <h1>Contact us</h1>
      <div className="two-col">
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
          </div>
          <div className="panel">
            <h3>Common questions</h3>
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
