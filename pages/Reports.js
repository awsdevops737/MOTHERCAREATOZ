import React, { useMemo, useState } from 'react';
import { inr, dayKey, isSale, inRange, downloadCSV } from '../adminData';
import { HBars } from '../charts';
import { Stat, sum } from './ui';

export default function Reports({ store }) {
  const [days, setDays] = useState(30);
  const r = useMemo(() => {
    const orders = inRange(store.orders, days);
    const sales = orders.filter(isSale);
    const cat = {}, prod = {}, daily = {};
    sales.forEach((o) => {
      const k = dayKey(o.createdAt);
      const dd = (daily[k] ||= { Date: k, Orders: 0, Revenue: 0, Discounts: 0, Shipping: 0 });
      dd.Orders += 1; dd.Revenue += o.total; dd.Discounts += o.discount; dd.Shipping += o.shipping;
      o.items.forEach((it) => {
        cat[it.category] = (cat[it.category] || 0) + it.qty * it.price;
        const p = (prod[it.name] ||= { Product: it.name, Units: 0, Revenue: 0 });
        p.Units += it.qty; p.Revenue += it.qty * it.price;
      });
    });
    return {
      sales, orders,
      revenue: sum(sales, (o) => o.total),
      discounts: sum(sales, (o) => o.discount),
      cancelled: orders.filter((o) => o.status === 'Cancelled').length,
      returned: orders.filter((o) => o.status === 'Returned').length,
      cats: Object.entries(cat).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })),
      products: Object.values(prod).sort((a, b) => b.Revenue - a.Revenue),
      daily: Object.values(daily).sort((a, b) => a.Date.localeCompare(b.Date)),
    };
  }, [store.orders, days]);

  const rate = (n) => (r.orders.length ? ((n / r.orders.length) * 100).toFixed(1) + '%' : '0%');

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Reports</h1>
        <select value={days} onChange={(e) => setDays(+e.target.value)} className="btn ghost">
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </select>
      </div>
      <div className="cards">
        <Stat label="Net revenue" value={inr(r.revenue)} />
        <Stat label="Discounts given" value={inr(r.discounts)} />
        <Stat label="Cancellation rate" value={rate(r.cancelled)} sub={`${r.cancelled} orders`} />
        <Stat label="Return rate" value={rate(r.returned)} sub={`${r.returned} orders`} />
      </div>
      <div className="grid2">
        <div className="card"><h3>Sales by category</h3><HBars data={r.cats} format={inr} color="#db2777" /></div>
        <div className="card">
          <h3>Download reports</h3>
          <div className="row">
            <button className="btn ghost" onClick={() => downloadCSV(`daily-sales-${days}d.csv`, r.daily)}>Daily sales CSV</button>
            <button className="btn ghost" onClick={() => downloadCSV(`product-sales-${days}d.csv`, r.products)}>Product sales CSV</button>
          </div>
        </div>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Product</th><th>Units sold</th><th>Revenue</th></tr></thead>
          <tbody>{r.products.map((p) => <tr key={p.Product}><td>{p.Product}</td><td>{p.Units}</td><td>{inr(p.Revenue)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
