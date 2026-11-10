const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

const FREE_ABOVE = 499, FEE = 49;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Please sign in first' });

  const { cart, coupon, address } = req.body || {};
  const ids = Object.keys(cart || {});
  if (!ids.length || !address) return res.status(400).json({ error: 'Cart or address missing' });

  const { data: prods } = await sb.from('products').select('*').in('id', ids).eq('active', true);
  const items = [];
  for (const id of ids) {
    const p = (prods || []).find((x) => x.id === id);
    const qty = Math.floor(Number(cart[id]));
    if (!p || qty < 1) return res.status(400).json({ error: 'Invalid item in cart' });
    if (qty > p.stock) return res.status(400).json({ error: `Only ${p.stock} left of ${p.name}` });
    items.push({ id, name: p.name, price: p.price, qty });
  }
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const { data: cp } = await sb.from('coupons').select('*').eq('code', String(coupon || '').toUpperCase()).eq('active', true).maybeSingle();
  const o = cp && { type: cp.type, value: cp.value, min: cp.min_order };
  const discount = o && subtotal >= o.min ? (o.type === 'percent' ? Math.round(subtotal * o.value / 100) : o.value) : 0;
  const after = subtotal - discount;
  const delivery = after >= FREE_ABOVE ? 0 : FEE;
  const total = after + delivery;

  const rz = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  try {
    const rzOrder = await rz.orders.create({ amount: total * 100, currency: 'INR', receipt: user.id.slice(0, 8) + Date.now() });
    const { data: order, error } = await sb.from('orders').insert({
      user_id: user.id, items, subtotal, discount, delivery, total, address,
      coupon: discount ? coupon.toUpperCase() : null, razorpay_order_id: rzOrder.id,
    }).select().single();
    if (error) throw error;
    res.json({ razorpayOrderId: rzOrder.id, amount: rzOrder.amount, keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id });
  } catch (e) {
    res.status(500).json({ error: 'Could not start payment' });
  }
};
