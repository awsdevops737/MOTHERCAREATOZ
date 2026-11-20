import React, { useMemo, useState } from 'react';
import { LineChart, HBars } from '../charts';
import { inr, dayKey, isSale, inRange, ORDER_STATUSES } from '../adminData';
import { Stat, sum } from './ui';

export default function Dashboard({ store }) {
  const [days, setDays] = useState(30);
  const d = useMemo(() => {
    const orders = inRange(store.orders, days);
    const sales = orders.filter(isSale);
    const revenue = sum(sales, (o) => o.total);
    const prev = store.orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t < Date.now() - days * 86400000 && t >= Date.now() - 2 * days * 86400000 && isSale(o);
    });
    const prevRev = sum(prev, (o) => o.total);
    const growth = prevRev ? Math.round(((revenue - prevRev) / prevRev) * 100) : null;
    const byDay = {};
    for (let i = days - 1; i >= 0; i--) byDay[dayKey(Date.now() - i * 86400000)] = 0;
    sales.forEach((o) => { const k = dayKey(o.createdAt); if (k in byDay) byDay[k] += o.total; });
    const prod = {};
    sales.forEach((o) => o.items.forEach((it) => { prod[it.name] = (prod[it.name] || 0) + it.qty * it.price; }));
    const topProducts = Object.entries(prod).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
    const statusCount = ORDER_STATUSES.map((s) => ({ label: s, value: orders.filter((o) => o.status === s).length })).filter((x) => x.value);
    return {
      orders, revenue, growth,
      aov: sales.length ? Math.round(revenue / sales.length) : 0,
      refunded: sum(orders.filter((o) => o.refund && o.refund.status === 'Processed'), (o) => o.refund.amount),
      pendingShip: store.orders.filter((o) => ['Placed', 'Confirmed', 'Packed'].includes(o.status)).length,
      codPending: sum(store.orders.filter((o) => o.payment.status === 'COD-Pending' && o.status !== 'Cancelled'), (o) => o.total),
      line: Object.entries(byDay).map(([label, value]) => ({ label, value })),
      topProducts, statusCount,
      lowStock: store.products.filter((p) => p.stock <= 10 && p.active),
    };
  }, [store, days]);

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Dashboard</h1>
        <select value={days} onChange={(e) => setDays(+e.target.value)} className="btn ghost">
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </select>
      </div>
      <div className="cards">
        <Stat label="Revenue" value={inr(d.revenue)} sub={d.growth === null ? '' : `${d.growth >= 0 ? '▲' : '▼'} ${Math.abs(d.growth)}% vs previous period`} />
        <Stat label="Orders" value={d.orders.length} sub={`Avg order ${inr(d.aov)}`} />
        <Stat label="To ship" value={d.pendingShip} sub="Placed / confirmed / packed" />
        <Stat label="Refunded" value={inr(d.refunded)} />
        <Stat label="COD to collect" value={inr(d.codPending)} />
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Sales per day</h3>
        <LineChart data={d.line} format={inr} />
      </div>
      <div className="grid2">
        <div className="card"><h3>Top products</h3><HBars data={d.topProducts} format={inr} /></div>
        <div className="card"><h3>Orders by status</h3><HBars data={d.statusCount} color="#16a34a" /></div>
        <div className="card">
          <h3>Low stock (≤ 10)</h3>
          {d.lowStock.length ? d.lowStock.map((p) => (
            <div key={p.id} className="row" style={{ justifyContent: 'space-between' }}><span>{p.name}</span><b>{p.stock}</b></div>
          )) : <div className="muted">All good</div>}
        </div>
      </div>
    </div>
  );
}
