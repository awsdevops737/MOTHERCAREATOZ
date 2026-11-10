import { formatPrice } from "../data";

export default function Account({ user, orders }) {
  return (
    <section>
      <h1>My account</h1>
      <div className="panel">
        <p><strong>{user.name}</strong></p>
        <p className="muted">{user.email} · {user.role === "admin" ? "Admin account" : "Customer account"}</p>
      </div>
      <h2>Order history</h2>
      {orders.length === 0 ? (
        <p className="notice">No orders yet. Your orders will appear here after checkout.</p>
      ) : (
        orders.map((o) => (
          <div className="panel" key={o.id}>
            <p><strong>{o.id}</strong> · {o.date}</p>
            <p className="muted small">{o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</p>
            <p>{formatPrice(o.totals.total)} · {o.status} · Payment: {o.paymentStatus}</p>
          </div>
        ))
      )}
    </section>
  );
}
