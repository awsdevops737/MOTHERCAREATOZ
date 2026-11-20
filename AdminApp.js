import React, { useState, useCallback } from 'react';
import './admin.css';
import { loadStore, persist, resetDemo } from './adminData';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Refunds from './pages/Refunds';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Coupons from './pages/Coupons';

const TABS = [
  ['Dashboard', '📊', Dashboard],
  ['Orders', '📦', Orders],
  ['Payments', '💳', Payments],
  ['Refunds', '↩️', Refunds],
  ['Products', '🧸', Products],
  ['Customers', '👥', Customers],
  ['Reports', '📈', Reports],
  ['Coupons', '🏷️', Coupons],
];

// Demo-only gate. Real security must be enforced by your backend.
const isAdmin = (u) => !!u && (u.role === 'admin' || u.isAdmin === true);

export default function AdminApp({ user, onExit }) {
  const [tab, setTab] = useState('Dashboard');
  const [store, setStore] = useState(() => loadStore());

  // update(fn): fn receives the current store and returns the new one; it is saved automatically.
  const update = useCallback((fn) => {
    setStore((prev) => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  }, []);

  if (!isAdmin(user)) {
    return (
      <div className="adm-denied">
        <h2>Access denied</h2>
        <p>You need an admin account to view this page.</p>
        {onExit && <button className="btn" onClick={onExit}>Back to store</button>}
      </div>
    );
  }

  const Page = TABS.find((t) => t[0] === tab)[2];
  const pendingRefunds = store.orders.filter((o) => o.refund && ['Requested', 'Approved'].includes(o.refund.status)).length;

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">MotherCare <small>Admin</small></div>
        {TABS.map(([name, icon]) => (
          <button key={name} className={'adm-nav' + (tab === name ? ' on' : '')} onClick={() => setTab(name)}>
            <span>{icon}</span> {name}
            {name === 'Refunds' && pendingRefunds > 0 && <b className="badge">{pendingRefunds}</b>}
          </button>
        ))}
        <div className="adm-spacer" />
        {onExit && <button className="adm-nav" onClick={onExit}>⬅ Back to store</button>}
      </aside>
      <main className="adm-main">
        {store.demo && (
          <div className="adm-banner">
            Showing <b>demo data</b> (no orders found in your store yet). Real orders appear here automatically once customers check out.
            <button className="btn sm" onClick={() => { resetDemo(); setStore(loadStore()); }}>Reset demo</button>
          </div>
        )}
        <Page store={store} update={update} />
      </main>
    </div>
  );
}
