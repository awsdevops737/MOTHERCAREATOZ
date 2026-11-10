import { useState } from "react";
import { formatPrice, FREE_DELIVERY_ABOVE } from "../data";

export function Summary({ totals, coupon }) {
  return (
    <div className="summary">
      <h3>Order summary</h3>
      <p><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></p>
      {totals.discount > 0 && <p className="green"><span>Discount {coupon ? `(${coupon.code})` : ""}</span><span>-{formatPrice(totals.discount)}</span></p>}
      <p><span>Delivery</span><span>{totals.delivery === 0 ? "Free" : formatPrice(totals.delivery)}</span></p>
      <p className="total"><span>Total</span><span>{formatPrice(totals.total)}</span></p>
      {totals.delivery > 0 && <p className="muted small">Free delivery above {formatPrice(FREE_DELIVERY_ABOVE)}</p>}
    </div>
  );
}

export default function CartPage({ items, totals, coupon, onQty, onApply, onCheckout, go }) {
  const [code, setCode] = useState("");

  if (items.length === 0) {
    return (
      <section>
        <h1>Your cart</h1>
        <p className="notice">Your cart is empty. Add something from the catalog to get started.</p>
        <button className="btn primary" onClick={() => go("catalog")}>Browse catalog</button>
      </section>
    );
  }

  return (
    <section>
      <h1>Your cart</h1>
      <div className="two-col">
        <div>
          {items.map(({ product: p, qty }) => (
            <div className="cart-row" key={p.id}>
              <div className="cart-thumb" aria-hidden="true">{p.emoji || "🧸"}</div>
              <div className="grow">
                <strong>{p.name}</strong>
                <p className="muted small">{formatPrice(p.price)} each</p>
              </div>
              <div className="qty">
                <button aria-label="Decrease quantity" onClick={() => onQty(p.id, -1)}>−</button>
                <span>{qty}</span>
                <button aria-label="Increase quantity" onClick={() => onQty(p.id, 1)}>+</button>
              </div>
              <strong className="line-total">{formatPrice(p.price * qty)}</strong>
              <button className="link" onClick={() => onQty(p.id, -qty)}>Remove</button>
            </div>
          ))}
        </div>
        <aside>
          <div className="coupon">
            <input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn ghost" onClick={() => onApply(code)}>Apply</button>
          </div>
          <Summary totals={totals} coupon={coupon} />
          <button className="btn primary block" onClick={onCheckout}>Proceed to checkout</button>
        </aside>
      </div>
    </section>
  );
}
