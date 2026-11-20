import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const STATUSES = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled', 'Returned'];

export default function AdminOrders({ user, onExit, embedded }) {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState('');
  const load = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) setMsg(error.message); else setOrders(data);
  };
  useEffect(() => { if (user?.role === 'admin') load(); }, [user]);

  if (user?.role !== 'admin') return <p className="notice">Admin access only.</p>;

  const setStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) setMsg(error.message); else load();
  };
  const paid = orders.filter((o) => o.payment_status === 'Paid');
  return (
    <section>
      {!embedded && <div className="row"><h1 className="grow">Admin: Orders</h1><button className="btn ghost" onClick={load}>Refresh</button>{onExit && <button className="btn ghost" onClick={onExit}>Back to store</button>}</div>}
      <div className="stats">
        <div className="stat"><span>Orders</span><strong>{orders.length}</strong></div>
        <div className="stat"><span>Paid orders</span><strong>{paid.length}</strong></div>
        <div className="stat"><span>Revenue</span><strong>₹{paid.reduce((s, o) => s + o.total, 0).toLocaleString('en-IN')}</strong></div>
      </div>
      {msg && <p className="error">{msg}</p>}
      <div className="table-wrap"><table>
        <thead><tr><th>Date</th><th>Customer / address</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
        <tbody>{orders.map((o) => (
          <tr key={o.id}>
            <td>{new Date(o.created_at).toLocaleString('en-IN')}</td>
            <td>{o.address?.name}<br />{o.address?.phone}<br /><span className="muted small">{o.address?.line}, {o.address?.city} {o.address?.pincode}</span></td>
            <td>{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</td>
            <td>₹{o.total}</td>
            <td>{o.payment_status}<br /><span className="muted small">{o.razorpay_payment_id}</span></td>
            <td><select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
          </tr>))}
        </tbody></table></div>
    </section>
  );
}
