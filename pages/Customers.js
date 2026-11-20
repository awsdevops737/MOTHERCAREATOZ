import React, { useMemo, useState } from 'react';
import { inr, fmtDate, isSale, downloadCSV } from '../adminData';

export default function Customers({ store }) {
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    const m = {};
    store.orders.forEach((o) => {
      const key = o.customer.email || o.customer.name;
      const c = (m[key] ||= { name: o.customer.name, email: o.customer.email, phone: o.customer.phone, orders: 0, spent: 0, last: o.createdAt });
      c.orders += 1;
      if (isSale(o)) c.spent += o.total;
      if (new Date(o.createdAt) > new Date(c.last)) c.last = o.createdAt;
    });
    return Object.values(m).sort((a, b) => b.spent - a.spent).filter((c) => !q || (c.name + c.email).toLowerCase().includes(q.toLowerCase()));
  }, [store.orders, q]);

  return (
    <div>
      <h1>Customers</h1>
      <div className="toolbar">
        <input placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn ghost" onClick={() => downloadCSV('customers.csv', rows.map((c) => ({ Name: c.name, Email: c.email, Phone: c.phone, Orders: c.orders, Spent: c.spent })))}>Export CSV</button>
        <span className="muted">{rows.length} customers</span>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total spent</th><th>Last order</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.email || c.name}><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.orders}</td><td>{inr(c.spent)}</td><td>{fmtDate(c.last)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
