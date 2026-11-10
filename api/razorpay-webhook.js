// Safety net: marks an order Paid even if the customer closes the tab right after paying.
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const raw = (req) => new Promise((ok) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => ok(d)); });

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = await raw(req);
  const sig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '').update(body).digest('hex');
  if (sig !== req.headers['x-razorpay-signature']) return res.status(400).end();
  const ev = JSON.parse(body);
  if (ev.event === 'payment.captured') {
    const pay = ev.payload.payment.entity;
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data: order } = await sb.from('orders').update({ payment_status: 'Paid', status: 'Confirmed', razorpay_payment_id: pay.id })
      .eq('razorpay_order_id', pay.order_id).eq('payment_status', 'Pending').select().single();
    if (order) for (const it of order.items) {
      const { data: p } = await sb.from('products').select('stock').eq('id', it.id).single();
      if (p) await sb.from('products').update({ stock: Math.max(0, p.stock - it.qty) }).eq('id', it.id);
    }
  }
  res.json({ ok: true });
}
module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
