const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Not signed in' });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (expected !== razorpay_signature) return res.status(400).json({ error: 'Payment verification failed' });

  const { data: order } = await sb.from('orders').update({
    payment_status: 'Paid', status: 'Confirmed', razorpay_payment_id,
  }).eq('razorpay_order_id', razorpay_order_id).eq('user_id', user.id).eq('payment_status', 'Pending').select().single();

  if (order) {
    for (const it of order.items) {
      const { data: p } = await sb.from('products').select('stock').eq('id', it.id).single();
      if (p) await sb.from('products').update({ stock: Math.max(0, p.stock - it.qty) }).eq('id', it.id);
    }
  }
  res.json({ ok: true, orderId: order?.id });
};

// Always answer with JSON, even when something is misconfigured or crashes.
const NEED = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'RAZORPAY_KEY_SECRET'];
module.exports = async (req, res) => {
  const missing = NEED.filter((k) => !process.env[k]);
  if (missing.length) return res.status(500).json({ error: 'Server setup incomplete: add ' + missing.join(', ') + ' in Vercel Environment Variables, then redeploy.' });
  try { await handler(req, res); }
  catch (e) { console.error(e); if (!res.headersSent) res.status(500).json({ error: 'Payment server error. Please try again.' }); }
};
