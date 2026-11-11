import { useCallback, useEffect, useState } from 'react';
import './admin.css';
import { supabase } from '../lib/supabase';
import { LineChart, HBars } from './charts';
import AdminOrders from './AdminOrders';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const day = (d) => new Date(d).toLocaleDateString('en-CA');
const isSale = (o) => o.payment_status === 'Paid' && !['Cancelled', 'Returned'].includes(o.status);
const TABS = ['Dashboard', 'Orders', 'Payments', 'Refunds', 'Products', 'Customers', 'Reports', 'Coupons'];

function csv(name, rows) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]), esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const text = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  a.download = name; a.click();
}

async function uploadImage(file, id) {
  if (!file.type.startsWith('image/')) { alert('Please choose an image file (JPG, PNG or WebP).'); return null; }
  if (file.size > 2 * 1024 * 1024) { alert('Image must be smaller than 2 MB.'); return null; }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${id}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '31536000' });
  if (error) { alert(error.message); return null; }
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}

export default function AdminPanel({ user, onExit }) {
  const [tab, setTab] = useState('Dashboard');
  const [d, setD] = useState({ orders: [], products: [], coupons: [], profiles: [] });
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    const q = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('id'),
      supabase.from('coupons').select('*'),
      supabase.from('profiles').select('*'),
    ]);
    const bad = q.find((r) => r.error);
    setErr(bad ? bad.error.message : '');
    setD({ orders: q[0].data || [], products: q[1].data || [], coupons: q[2].data || [], profiles: q[3].data || [] });
  }, []);
  useEffect(() => { if (user?.role === 'admin') load(); }, [user, load]);

  if (user?.role !== 'admin') return <div className="adm-denied"><h2>Access denied</h2><p>Admin account required.</p>{onExit && <button className="btn" onClick={onExit}>Back to store</button>}</div>;

  const run = async (p) => { const { error } = await p; if (error) alert(error.message); await load(); };
  const props = { ...d, run, load };
  const pending = d.orders.filter((o) => ['Placed', 'Confirmed'].includes(o.status) && o.payment_status === 'Paid').length;

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">MotherCare <small>Admin</small></div>
        {TABS.map((t) => <button key={t} className={'adm-nav' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t}{t === 'Orders' && pending > 0 && <b className="badge">{pending}</b>}</button>)}
        <div className="adm-spacer" />
        <button className="adm-nav" onClick={load}>⟳ Refresh</button>
        {onExit && <button className="adm-nav" onClick={onExit}>⬅ Back to store</button>}
      </aside>
      <main className="adm-main">
        {err && <div className="adm-banner">{err}</div>}
        <h1>{tab}</h1>
        {tab === 'Dashboard' && <Dashboard {...props} />}
        {tab === 'Orders' && <AdminOrders user={user} embedded />}
        {tab === 'Payments' && <Payments {...props} />}
        {tab === 'Refunds' && <Refunds {...props} />}
        {tab === 'Products' && <Products {...props} />}
        {tab === 'Customers' && <Customers {...props} />}
        {tab === 'Reports' && <Reports {...props} />}
        {tab === 'Coupons' && <Coupons {...props} />}
      </main>
    </div>
  );
}

const Stat = ({ l, v }) => <div className="card stat"><div className="lbl">{l}</div><div className="val">{v}</div></div>;
const Table = ({ head, children }) => <div className="tbl-wrap"><table className="tbl"><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;

function Dashboard({ orders, products }) {
  const sales = orders.filter(isSale);
  const days = Array.from({ length: 14 }, (_, i) => day(Date.now() - (13 - i) * 86400000));
  const series = days.map((k) => ({ label: k, value: sales.filter((o) => day(o.created_at) === k).reduce((s, o) => s + o.total, 0) }));
  const qty = {};
  sales.forEach((o) => o.items.forEach((i) => { qty[i.name] = (qty[i.name] || 0) + i.qty; }));
  const top = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
  const low = products.filter((p) => p.stock <= 5);
  return <>
    <div className="cards">
      <Stat l="Revenue" v={inr(sales.reduce((s, o) => s + o.total, 0))} />
      <Stat l="Orders" v={orders.length} />
      <Stat l="To ship" v={orders.filter((o) => ['Placed', 'Confirmed', 'Packed'].includes(o.status) && o.payment_status === 'Paid').length} />
      <Stat l="Low stock items" v={low.length} />
    </div>
    <div className="grid2">
      <div className="card"><h3>Revenue, last 14 days</h3><LineChart data={series} format={inr} /></div>
      <div className="card"><h3>Top products (units)</h3><HBars data={top} /></div>
    </div>
    {low.length > 0 && <div className="card"><h3>Low stock</h3>{low.map((p) => <div key={p.id}>{p.name}: <b>{p.stock}</b> left</div>)}</div>}
  </>;
}

function Payments({ orders }) {
  const [f, setF] = useState('');
  const rows = orders.filter((o) => !f || o.payment_status === f);
  return <>
    <div className="toolbar"><select value={f} onChange={(e) => setF(e.target.value)}><option value="">All payments</option>{['Paid', 'Pending', 'Refunded'].map((s) => <option key={s}>{s}</option>)}</select></div>
    <Table head={['Date', 'Order', 'Amount', 'Status', 'Razorpay payment id']}>{rows.map((o) => (
      <tr key={o.id}><td>{new Date(o.created_at).toLocaleString('en-IN')}</td><td>{o.id.slice(0, 8)}</td><td>{inr(o.total)}</td>
        <td><span className={'pill ' + ({ Paid: 'green', Pending: 'amber', Refunded: 'blue' }[o.payment_status] || '')}>{o.payment_status}</span></td><td>{o.razorpay_payment_id || '-'}</td></tr>))}</Table>
  </>;
}

function Refunds({ orders, load }) {
  const rows = orders.filter((o) => o.refund_status || (o.payment_status === 'Paid' && ['Cancelled', 'Returned'].includes(o.status)));
  const refund = async (o) => {
    if (!window.confirm(`Refund ${inr(o.total)} to the customer via Razorpay?`)) return;
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch('/api/refund', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ orderId: o.id }) });
    const j = await r.json();
    if (!r.ok) alert(j.error);
    load();
  };
  return <>
    <p className="muted">Paid orders marked Cancelled or Returned appear here. To refund an order, first set its status to Cancelled or Returned in Orders.</p>
    <Table head={['Order', 'Customer', 'Order status', 'Amount', 'Refund', '']}>{rows.map((o) => (
      <tr key={o.id}><td>{o.id.slice(0, 8)}</td><td>{o.address?.name}</td><td>{o.status}</td><td>{inr(o.total)}</td>
        <td>{o.refund_status ? <span className="pill green">{o.refund_status}</span> : <span className="pill amber">Due</span>}</td>
        <td>{!o.refund_status && <button className="btn sm red" onClick={() => refund(o)}>Refund via Razorpay</button>}</td></tr>))}</Table>
    {!rows.length && <p className="muted">No refunds due.</p>}
  </>;
}

function Products({ products, run }) {
  const empty = { id: '', name: '', category: '', price: '', mrp: '', stock: '' };
  const [n, setN] = useState(empty);
  const [file, setFile] = useState(null);
  const [fk, setFk] = useState(0);
  const [busy, setBusy] = useState('');
  const upd = (id, patch) => run(supabase.from('products').update(patch).eq('id', id));
  const add = async () => {
    if (!n.id || !n.name || !n.price) return alert('ID, name and price are required');
    setBusy('new');
    const image_url = file ? await uploadImage(file, n.id) : null;
    if (file && !image_url) return setBusy('');
    await run(supabase.from('products').insert({ ...n, price: +n.price, mrp: +n.mrp || +n.price, stock: +n.stock || 0, image_url }));
    setN(empty); setFile(null); setFk(fk + 1); setBusy('');
  };
  const replace = async (p, f) => {
    setBusy(p.id);
    const url = await uploadImage(f, p.id);
    if (url) await upd(p.id, { image_url: url });
    setBusy('');
  };
  return <>
    <div className="card form" style={{ marginBottom: 12 }}><h3>Add product</h3><div className="row">
      {Object.keys(n).map((k) => <input key={k} placeholder={k} value={n[k]} onChange={(e) => setN({ ...n, [k]: e.target.value })} />)}
      <input key={fk} type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
      <button className="btn" disabled={busy === 'new'} onClick={add}>{busy === 'new' ? 'Saving…' : 'Add'}</button></div>
      <p className="muted">Photo is optional: JPG, PNG or WebP, under 2 MB. Square photos look best.</p></div>
    <Table head={['Image', 'ID', 'Name', 'Price', 'Stock', 'Active', '']}>{products.map((p) => (
      <tr key={p.id}>
        <td>
          {p.image_url ? <img src={p.image_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, display: 'block', marginBottom: 4 }} /> : <span className="muted">No photo</span>}
          <input type="file" accept="image/*" style={{ width: 170 }} disabled={busy === p.id} onChange={(e) => e.target.files[0] && replace(p, e.target.files[0])} />
          {p.image_url && <button className="btn sm ghost" onClick={() => upd(p.id, { image_url: null })}>Remove photo</button>}
        </td>
        <td>{p.id}</td><td>{p.name}</td>
        <td><input style={{ width: 80 }} defaultValue={p.price} onBlur={(e) => +e.target.value !== p.price && upd(p.id, { price: +e.target.value })} /></td>
        <td><input style={{ width: 70 }} defaultValue={p.stock} onBlur={(e) => +e.target.value !== p.stock && upd(p.id, { stock: +e.target.value })} /></td>
        <td><input type="checkbox" checked={p.active} onChange={(e) => upd(p.id, { active: e.target.checked })} /></td>
        <td><button className="btn sm ghost" onClick={() => window.confirm('Delete product?') && run(supabase.from('products').delete().eq('id', p.id))}>Delete</button></td></tr>))}</Table>
  </>;
}

const customers = (orders, profiles) => profiles.filter((p) => p.role === 'customer').map((p) => {
  const mine = orders.filter((o) => o.user_id === p.id), paid = mine.filter(isSale);
  return { name: p.name, email: p.email, orders: mine.length, spent: paid.reduce((s, o) => s + o.total, 0), last: mine[0]?.created_at || '' };
});

function Customers({ orders, profiles }) {
  const rows = customers(orders, profiles).sort((a, b) => b.spent - a.spent);
  return <Table head={['Name', 'Email', 'Orders', 'Spent', 'Last order']}>{rows.map((c) => (
    <tr key={c.email}><td>{c.name}</td><td>{c.email}</td><td>{c.orders}</td><td>{inr(c.spent)}</td><td>{c.last ? new Date(c.last).toLocaleDateString('en-IN') : '-'}</td></tr>))}</Table>;
}

function Reports({ orders, products, profiles }) {
  const items = orders.flatMap((o) => o.items.map((i) => ({ order: o.id, date: o.created_at, product: i.name, qty: i.qty, price: i.price, payment: o.payment_status, status: o.status })));
  return <div className="cards">
    {[['Orders', () => csv('orders.csv', orders.map((o) => ({ id: o.id, date: o.created_at, customer: o.address?.name, phone: o.address?.phone, total: o.total, coupon: o.coupon, payment: o.payment_status, status: o.status, razorpay_payment_id: o.razorpay_payment_id })))],
      ['Items sold', () => csv('items.csv', items)], ['Products & stock', () => csv('products.csv', products)], ['Customers', () => csv('customers.csv', customers(orders, profiles))]]
      .map(([l, fn]) => <div className="card" key={l}><h3>{l}</h3><button className="btn sm" onClick={fn}>Download CSV</button></div>)}
  </div>;
}

function Coupons({ coupons, run }) {
  const [n, setN] = useState({ code: '', type: 'percent', value: '', min_order: '0' });
  const add = async () => {
    if (!n.code || !n.value) return alert('Code and value required');
    await run(supabase.from('coupons').insert({ ...n, code: n.code.toUpperCase(), value: +n.value, min_order: +n.min_order || 0 }));
    setN({ code: '', type: 'percent', value: '', min_order: '0' });
  };
  return <>
    <div className="card form" style={{ marginBottom: 12 }}><div className="row">
      <input placeholder="CODE" value={n.code} onChange={(e) => setN({ ...n, code: e.target.value })} />
      <select value={n.type} onChange={(e) => setN({ ...n, type: e.target.value })}><option value="percent">% off</option><option value="flat">₹ off</option></select>
      <input placeholder="value" value={n.value} onChange={(e) => setN({ ...n, value: e.target.value })} />
      <input placeholder="min order ₹" value={n.min_order} onChange={(e) => setN({ ...n, min_order: e.target.value })} />
      <button className="btn" onClick={add}>Add coupon</button></div></div>
    <Table head={['Code', 'Discount', 'Min order', 'Active', '']}>{coupons.map((c) => (
      <tr key={c.code}><td><b>{c.code}</b></td><td>{c.type === 'percent' ? c.value + '%' : inr(c.value)}</td><td>{inr(c.min_order)}</td>
        <td><input type="checkbox" checked={c.active} onChange={(e) => run(supabase.from('coupons').update({ active: e.target.checked }).eq('code', c.code))} /></td>
        <td><button className="btn sm ghost" onClick={() => run(supabase.from('coupons').delete().eq('code', c.code))}>Delete</button></td></tr>))}</Table>
  </>;
}

