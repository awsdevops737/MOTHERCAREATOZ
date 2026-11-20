// Admin-only: sends a paid order to Shiprocket, assigns a courier (AWB) and schedules pickup.
const { createClient } = require('@supabase/supabase-js');

const BASE = 'https://apiv2.shiprocket.in/v1/external';
let cache = { token: null, at: 0 };

async function login(force) {
  if (!force && cache.token && Date.now() - cache.at < 6 * 3600 * 1000) return cache.token;
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.token) throw new Error('Shiprocket login failed: ' + (j.message || r.status));
  cache = { token: j.token, at: Date.now() };
  return j.token;
}

async function sr(path, body) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await login(attempt === 1);
    const r = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (r.status === 401 && attempt === 0) continue;
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || (j.errors ? JSON.stringify(j.errors) : `Shiprocket error ${r.status}`));
    return j;
  }
}

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  const { data: me } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const { data: o } = await sb.from('orders').select('*').eq('id', (req.body || {}).orderId).single();
  if (!o) return res.status(404).json({ error: 'Order not found' });
  if (o.payment_status !== 'Paid') return res.status(400).json({ error: 'Only paid orders can be shipped' });
  if (['Cancelled', 'Returned'].includes(o.status)) return res.status(400).json({ error: 'This order is cancelled or returned' });
  const a = o.address || {};
  if (!a.state) return res.status(400).json({ error: 'This order has no state in its address (it was placed before the state field was added). Edit the address in Shiprocket manually.' });

  const { data: prof } = await sb.from('profiles').select('email').eq('id', o.user_id).single();
  const warnings = [];
  let shipmentId = o.shiprocket_shipment_id;

  if (!shipmentId) {
    const [first, ...rest] = String(a.name || 'Customer').trim().split(' ');
    const created = await sr('/orders/create/adhoc', {
      order_id: 'MC-' + o.id.slice(0, 8).toUpperCase(),
      order_date: new Date(o.created_at).toISOString().slice(0, 16).replace('T', ' '),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      billing_customer_name: first, billing_last_name: rest.join(' '),
      billing_address: a.line, billing_city: a.city, billing_pincode: a.pincode, billing_state: a.state, billing_country: 'India',
      billing_email: prof?.email || '', billing_phone: a.phone,
      shipping_is_billing: true,
      order_items: o.items.map((i) => ({ name: i.name, sku: i.id, units: i.qty, selling_price: i.price })),
      payment_method: 'Prepaid', sub_total: o.total,
      length: +process.env.SHIPROCKET_LENGTH || 10, breadth: +process.env.SHIPROCKET_BREADTH || 10,
      height: +process.env.SHIPROCKET_HEIGHT || 10, weight: +process.env.SHIPROCKET_WEIGHT || 0.5,
    });
    shipmentId = created.shipment_id;
    if (!shipmentId) throw new Error('Shiprocket did not return a shipment id');
    await sb.from('orders').update({ shiprocket_order_id: String(created.order_id), shiprocket_shipment_id: String(shipmentId) }).eq('id', o.id);
  }

  let awb = o.awb_code, courier = o.courier_name;
  if (!awb) {
    try {
      const d = await sr('/courier/assign/awb', { shipment_id: shipmentId });
      const x = (d.response && d.response.data) || d;
      awb = x.awb_code; courier = x.courier_name;
      if (!awb) warnings.push('Courier not assigned yet. Check your Shiprocket wallet balance and pickup address, then press the button again.');
    } catch (e) { warnings.push('Courier not assigned: ' + e.message); }
    if (awb) {
      try { await sr('/courier/generate/pickup', { shipment_id: [shipmentId] }); }
      catch (e) { warnings.push('Pickup not scheduled: ' + e.message); }
    }
  }
  if (awb) {
    const patch = { awb_code: awb, courier_name: courier };
    if (['Placed', 'Confirmed'].includes(o.status)) patch.status = 'Packed';
    await sb.from('orders').update(patch).eq('id', o.id);
  }
  res.json({ ok: true, awb, courier, warnings });
};

const NEED = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SHIPROCKET_EMAIL', 'SHIPROCKET_PASSWORD'];
module.exports = async (req, res) => {
  const missing = NEED.filter((k) => !process.env[k]);
  if (missing.length) return res.status(500).json({ error: 'Server setup incomplete: add ' + missing.join(', ') + ' in Vercel Environment Variables, then redeploy.' });
  try { await handler(req, res); }
  catch (e) { console.error(e); if (!res.headersSent) res.status(500).json({ error: e.message || 'Shipping error' }); }
};
