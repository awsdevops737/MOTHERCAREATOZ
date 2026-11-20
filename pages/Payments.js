import React, { useMemo, useState } from 'react';
import { inr, fmtDate, PAYMENT_METHODS, PAYMENT_STATUSES, downloadCSV } from '../adminData';
import { Stat, Pill, sum } from './ui';
import { HBars } from '../charts';

export default function Payments({ store }) {
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const rows = useMemo(() => store.orders.filter((o) => (!method || o.payment.method === method) && (!status || o.payment.status === status)), [store.orders, method, status]);
  const by = (f) => sum(store.orders.filter(f), (o) => o.total);
  const mix = PAYMENT_METHODS.map((m) => ({ label: m, value: by((o) => o.payment.method === m && o.payment.status === 'Paid') }));

  return (
    <div>
      <h1>Payments</h1>
      <div className="cards">
        <Stat label="Received" value={inr(by((o) => o.payment.status === 'Paid'))} />
        <Stat label="COD pending" value={inr(by((o) => o.payment.status === 'COD-Pending' && o.status !== 'Cancelled'))} />
        <Stat label="Failed" value={inr(by((o) => o.payment.status === 'Failed'))} sub={`${store.orders.filter((o) => o.payment.status === 'Failed').length} attempts`} />
        <Stat label="Refunded" value={inr(by((o) => o.payment.status === 'Refunded'))} />
      </div>
      <div className="card" style={{ marginBottom: 16 }}><h3>Received by method</h3><HBars data={mix} format={inr} /></div>
      <div className="toolbar">
        <select value={method} onChange={(e) => setMethod(e.target.value)}><option value="">All methods</option>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{PAYMENT_STATUSES.map((m) => <option key={m}>{m}</option>)}</select>
        <button className="btn ghost" onClick={() => downloadCSV('payments.csv', rows.map((o) => ({ Order: o.id, Date: fmtDate(o.createdAt), Method: o.payment.method, Status: o.payment.status, Txn: o.payment.txnId, Amount: o.total })))}>Export CSV</button>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Date</th><th>Order</th><th>Customer</th><th>Method</th><th>Txn ID</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}><td>{fmtDate(o.createdAt)}</td><td>{o.id}</td><td>{o.customer.name}</td><td>{o.payment.method}</td>
                <td className="muted">{o.payment.txnId || '—'}</td><td>{inr(o.total)}</td><td><Pill>{o.payment.status}</Pill></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
