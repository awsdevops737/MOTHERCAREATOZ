import React, { useState } from 'react';

const blank = { code: '', type: 'percent', value: 10, minOrder: 0, active: true };

export default function Coupons({ store, update }) {
  const [f, setF] = useState(blank);
  const used = (code) => store.orders.filter((o) => o.coupon === code).length;

  const add = () => {
    const code = f.code.trim().toUpperCase();
    if (!code || store.coupons.some((c) => c.code === code)) return;
    update((st) => ({ ...st, coupons: [...st.coupons, { ...f, code, value: Number(f.value), minOrder: Number(f.minOrder) }] }));
    setF(blank);
  };
  const toggle = (code) => update((st) => ({ ...st, coupons: st.coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c)) }));
  const remove = (code) => update((st) => ({ ...st, coupons: st.coupons.filter((c) => c.code !== code) }));

  return (
    <div>
      <h1>Coupons</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row">
          <input placeholder="CODE" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="percent">% off</option><option value="flat">₹ off</option></select>
          <input type="number" style={{ width: 80 }} value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
          <input type="number" style={{ width: 110 }} placeholder="Min order" value={f.minOrder} onChange={(e) => setF({ ...f, minOrder: e.target.value })} />
          <button className="btn" onClick={add}>Add coupon</button>
        </div>
        <p className="muted">Note: your checkout must read the same coupon list for changes here to take effect in the store.</p>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Times used</th><th>Status</th><th /></tr></thead>
          <tbody>
            {store.coupons.map((c) => (
              <tr key={c.code}>
                <td><b>{c.code}</b></td><td>{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</td><td>₹{c.minOrder}</td><td>{used(c.code)}</td>
                <td>{c.active ? 'Active' : 'Paused'}</td>
                <td className="row"><button className="btn ghost sm" onClick={() => toggle(c.code)}>{c.active ? 'Pause' : 'Activate'}</button><button className="btn red sm" onClick={() => remove(c.code)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
