import React, { useState } from 'react';
import { inr, fmtDate, REFUND_STATUSES, downloadCSV } from '../adminData';
import { Stat, Pill, sum } from './ui';

export default function Refunds({ store, update }) {
  const [filter, setFilter] = useState('');
  const withRefund = store.orders.filter((o) => o.refund);
  const rows = withRefund.filter((o) => !filter || o.refund.status === filter);

  const setRefund = (id, s) => update((st) => ({
    ...st,
    orders: st.orders.map((o) => {
      if (o.id !== id) return o;
      const n = { ...o, refund: { ...o.refund, status: s, updatedAt: new Date().toISOString() } };
      if (s === 'Processed') n.payment = { ...o.payment, status: 'Refunded' };
      return n;
    }),
  }));

  const total = (s) => sum(withRefund.filter((o) => o.refund.status === s), (o) => o.refund.amount);

  return (
    <div>
      <h1>Refunds</h1>
      <p className="muted">Marking a refund “Processed” here only records it. Send the real money back from your Razorpay dashboard (or server-side via the Razorpay API) first.</p>
      <div className="cards">
        {REFUND_STATUSES.map((s) => (
          <Stat key={s} label={s} value={withRefund.filter((o) => o.refund.status === s).length} sub={inr(total(s))} />
        ))}
      </div>
      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All</option>{REFUND_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <button className="btn ghost" onClick={() => downloadCSV('refunds.csv', rows.map((o) => ({ Order: o.id, Customer: o.customer.name, Amount: o.refund.amount, Reason: o.refund.reason, Status: o.refund.status, Requested: fmtDate(o.refund.requestedAt) })))}>Export CSV</button>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Reason</th><th>Requested</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td><td>{o.customer.name}</td><td>{inr(o.refund.amount)}</td><td>{o.refund.reason}</td>
                <td>{fmtDate(o.refund.requestedAt)}</td><td><Pill>{o.refund.status}</Pill></td>
                <td className="row">
                  {o.refund.status === 'Requested' && <>
                    <button className="btn sm green" onClick={() => setRefund(o.id, 'Approved')}>Approve</button>
                    <button className="btn sm red" onClick={() => setRefund(o.id, 'Rejected')}>Reject</button></>}
                  {o.refund.status === 'Approved' && <button className="btn sm" onClick={() => setRefund(o.id, 'Processed')}>Mark processed</button>}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="7" className="muted">No refunds</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
