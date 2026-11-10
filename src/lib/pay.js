import { supabase } from './supabase';

const loadScript = () => new Promise((ok, fail) => {
  if (window.Razorpay) return ok();
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = ok; s.onerror = () => fail(new Error('Could not load Razorpay'));
  document.body.appendChild(s);
});

async function call(path, body, token) {
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Something went wrong');
  return j;
}

// cart = { productId: qty }, address = { name, phone, line, city, pincode }
export async function payNow({ cart, coupon, address, user }) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session.access_token;
  await loadScript();
  const o = await call('/api/create-order', { cart, coupon, address }, token);
  return new Promise((resolve, reject) => {
    new window.Razorpay({
      key: o.keyId, amount: o.amount, currency: 'INR', order_id: o.razorpayOrderId, name: 'MotherCare',
      prefill: { name: user.name, email: user.email, contact: address.phone },
      handler: async (resp) => {
        try { resolve(await call('/api/verify-payment', resp, token)); } catch (e) { reject(e); }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    }).open();
  });
}
