const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  const { data: me } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const { data: o } = await sb.from('orders').select('*').eq('id', (req.body || {}).orderId).single();
  if (!o || o.payment_status !== 'Paid' || !o.razorpay_payment_id) return res.status(400).json({ error: 'Order is not a paid online order' });
  try {
    const rz = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const r = await rz.payments.refund(o.razorpay_payment_id, { amount: o.total * 100 });
    await sb.from('orders').update({ payment_status: 'Refunded', refund_status: 'Processed', refund_amount: o.total, refund_id: r.id, refunded_at: new Date().toISOString() }).eq('id', o.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e?.error?.description || 'Refund failed' });
  }
};
