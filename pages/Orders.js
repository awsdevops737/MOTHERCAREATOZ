import React, { useMemo, useState } from 'react';
import { inr, fmtDate, ORDER_STATUSES, downloadCSV } from '../adminData';
import { Pill, Modal } from './ui';

export default function Orders({ store, update }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sel, setSel] = useState(null);

  const rows = useMemo(() => store.orders.filter((o) =>
    (!status || o.status === status) &&
    (!q || (o.id + o.customer.name + o.customer.email + o.customer.phone).toLowerCase().includes(q.toLowerCase()))
  ), [store.orders, q, status]);

  const setOrderStatus = (id, s) => update((st) => ({
    ...st,
    orders: st.orders.map((o) => {
      if (o.id !== id) return o;
      const n = { ...o, status: s };
      if (s === 'Delivered' && o.payment.method === 'COD') n.payment = { ...o.payment, status: 'Paid' };
      if ((s === 'Cancelled' || s === 'Returned') && o.payment.status === 'Paid' && !o.refund) {
        n.refund = { status: 'Requested', amount: o.total, reason: s === 'Returned' ? 'Product returned' : 'Order cancelled', requestedAt: new Date().toISOString() };
      }
      return n;
    }),
  }));

  const current = sel && store.orders.find((o) => o.id === sel);

  return (
    <div>
      <h1>Orders</h1>
      <div className="toolbar">
        <input placeholder="Search order, name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn ghost" onClick={() => downloadCSV('orders.csv', rows.map((o) => ({
          Order: o.id, Date: fmtDate(o.createdAt), Customer: o.customer.name, Email: o.customer.email,
          Total: o.total, Payment: o.payment.method, PaymentStatus: o.payment.status, Status: o.status,
        })))}>Export CSV</button>
        <span className="muted">{rows.length} orders</span>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="click" onClick={() => setSel(o.id)}>
                <td>{o.id}</td><td>{fmtDate(o.createdAt)}</td><td>{o.customer.name}</td>
                <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td><td>{inr(o.total)}</td>
                <td>{o.payment.method} <Pill>{o.payment.status}</Pill></td><td><Pill>{o.status}</Pill></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="7" className="muted">No orders found</td></tr>}
          </tbody>
        </table>
      </div>

      {current && (
        <Modal title={`Order ${current.id}`} onClose={() => setSel(null)}>
          <p className="muted">{fmtDate(current.createdAt)}</p>
          <p><b>{current.customer.name}</b><br />{current.customer.email} {current.customer.phone}<br />{String(current.address)}</p>
          <table className="tbl">
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>{current.items.map((i, k) => <tr key={k}><td>{i.name}</td><td>{i.qty}</td><td>{inr(i.price * i.qty)}</td></tr>)}</tbody>
          </table>
          <p>Subtotal {inr(current.subtotal)} · Discount −{inr(current.discount)}{current.coupon ? ` (${current.coupon})` : ''} · Shipping {inr(current.shipping)}<br /><b>Total {inr(current.total)}</b></p>
          <p>Payment: {current.payment.method} <Pill>{current.payment.status}</Pill> {current.payment.txnId && <span className="muted">{current.payment.txnId}</span>}</p>
          {current.refund && <p>Refund: <Pill>{current.refund.status}</Pill> {inr(current.refund.amount)} – {current.refund.reason}</p>}
          <label className="form">Update status
            <select value={current.status} onChange={(e) => setOrderStatus(current.id, e.target.value)}>
              {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div className="row" style={{ marginTop: 10 }}><button className="btn ghost" onClick={() => window.print()}>Print invoice</button></div>
        </Modal>
      )}
    </div>
  );
}
