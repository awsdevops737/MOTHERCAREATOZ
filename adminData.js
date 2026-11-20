// Data adapter for the admin panel.
// Reads your store's data from localStorage. If no orders exist yet it falls back to demo data
// (saved under separate "mc_demo_*" keys so your real data is never touched).
// When you move to a backend, replace loadStore / persist* with API calls - nothing else needs to change.

export const KEYS = { orders: 'orders', products: 'products', coupons: 'coupons' };
export const DEMO_PREFIX = 'mc_demo_';

export const ORDER_STATUSES = [
  'Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for delivery',
  'Delivered', 'Return requested', 'Returned', 'Cancelled',
];
export const PAYMENT_STATUSES = ['Paid', 'Pending', 'COD-Pending', 'Failed', 'Refunded'];
export const REFUND_STATUSES = ['Requested', 'Approved', 'Processed', 'Rejected'];
export const PAYMENT_METHODS = ['UPI', 'Card', 'NetBanking', 'COD'];

export const inr = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const dayKey = (d) => new Date(d).toLocaleDateString('en-CA'); // YYYY-MM-DD (local)
export const fmtDate = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const isSale = (o) =>
  !['Cancelled', 'Returned'].includes(o.status) && o.payment.status !== 'Failed';

export const inRange = (orders, days) => {
  const from = Date.now() - days * 86400000;
  return orders.filter((o) => new Date(o.createdAt).getTime() >= from);
};

export function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const read = (k) => {
  try { return JSON.parse(localStorage.getItem(k)); } catch { return null; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// ---------- normalisation: tolerate different field names from your existing checkout ----------
export function normalizeOrder(raw, i = 0) {
  const items = (raw.items || raw.cart || raw.products || []).map((it) => ({
    productId: it.productId ?? it.id ?? it.sku ?? it.name,
    name: it.name || it.title || 'Item',
    category: it.category || 'General',
    qty: Number(it.qty ?? it.quantity ?? 1),
    price: Number(it.price ?? 0),
  }));
  const subtotal = Number(raw.subtotal ?? items.reduce((s, it) => s + it.qty * it.price, 0));
  const discount = Number(raw.discount ?? 0);
  const shipping = Number(raw.shipping ?? 0);
  const total = Number(raw.total ?? raw.amount ?? subtotal - discount + shipping);
  const pm = raw.payment?.method || raw.paymentMethod || 'UPI';
  const status = raw.status || 'Placed';
  const rawPay = raw.payment?.status || raw.paymentStatus;
  const payStatus = rawPay || (pm === 'COD' ? 'COD-Pending' : 'Paid');
  return {
    ...raw,
    id: String(raw.id ?? raw.orderId ?? `ORD${1000 + i}`),
    createdAt: raw.createdAt || raw.date || raw.createdOn || new Date().toISOString(),
    customer: {
      name: raw.customer?.name || raw.customerName || raw.userName || raw.name || 'Customer',
      email: raw.customer?.email || raw.email || raw.userEmail || '',
      phone: raw.customer?.phone || raw.phone || '',
    },
    address: raw.address || raw.shippingAddress || '',
    items, subtotal, discount, shipping, total,
    coupon: raw.coupon || raw.couponCode || '',
    status,
    payment: { method: pm, status: payStatus, txnId: raw.payment?.txnId || raw.paymentId || '' },
    refund: raw.refund || null,
  };
}

// ---------- demo data ----------
const PRODUCTS = [
  ['Diapers Medium (72 pcs)', 'Diapers', 899], ['Diapers Large (64 pcs)', 'Diapers', 949],
  ['Baby Wipes (3 packs)', 'Hygiene', 349], ['Baby Lotion 200ml', 'Skin Care', 249],
  ['Baby Shampoo 200ml', 'Skin Care', 199], ['Feeding Bottle 250ml', 'Feeding', 399],
  ['Baby Cereal Wheat 300g', 'Food', 229], ['Soft Toy Bear', 'Toys', 549],
  ['Baby Blanket', 'Clothing', 699], ['Cotton Onesie (3 pack)', 'Clothing', 599],
  ['Baby Oil 200ml', 'Skin Care', 219], ['Rattle Set', 'Toys', 299],
];

function rng(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function seedDemo() {
  const r = rng(42);
  const products = PRODUCTS.map(([name, category, price], i) => ({
    id: `P${i + 1}`, sku: `MC-${1000 + i}`, name, category, price,
    stock: Math.floor(r() * 80), active: true,
  }));
  const names = ['Ananya Rao', 'Rohit Sharma', 'Priya Nair', 'Sneha Reddy', 'Arjun Mehta', 'Kavya Iyer', 'Vikram Singh', 'Meera Das', 'Rahul Verma', 'Divya Gupta'];
  const coupons = [
    { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0, active: true },
    { code: 'SAVE100', type: 'flat', value: 100, minOrder: 999, active: true },
    { code: 'DIAPER15', type: 'percent', value: 15, minOrder: 799, active: true },
  ];
  const orders = [];
  for (let i = 0; i < 70; i++) {
    const age = Math.floor(r() * 90);
    const created = new Date(Date.now() - age * 86400000 - Math.floor(r() * 80000000));
    const items = Array.from({ length: 1 + Math.floor(r() * 3) }, () => {
      const p = products[Math.floor(r() * products.length)];
      return { productId: p.id, name: p.name, category: p.category, price: p.price, qty: 1 + Math.floor(r() * 3) };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const c = r() < 0.35 ? coupons[Math.floor(r() * coupons.length)] : null;
    let discount = 0;
    if (c && subtotal >= c.minOrder) discount = c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value;
    const shipping = subtotal - discount >= 499 ? 0 : 49;
    const total = subtotal - discount + shipping;
    const method = PAYMENT_METHODS[Math.floor(r() * 4)];
    const roll = r();
    let status;
    if (age > 8) status = roll < 0.82 ? 'Delivered' : roll < 0.9 ? 'Cancelled' : 'Returned';
    else status = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'][Math.floor(r() * 6)];
    let payStatus = method === 'COD' ? (status === 'Delivered' ? 'Paid' : 'COD-Pending') : 'Paid';
    if (method !== 'COD' && r() < 0.05) { payStatus = 'Failed'; status = 'Cancelled'; }
    let refund = null;
    if (['Cancelled', 'Returned'].includes(status) && payStatus === 'Paid') {
      const st = age > 20 ? 'Processed' : ['Requested', 'Approved', 'Processed'][Math.floor(r() * 3)];
      refund = { status: st, amount: total, reason: status === 'Returned' ? 'Product returned' : 'Order cancelled', requestedAt: created.toISOString() };
      if (st === 'Processed') payStatus = 'Refunded';
    }
    const nm = names[Math.floor(r() * names.length)];
    orders.push(normalizeOrder({
      id: `MC${100000 + i}`, createdAt: created.toISOString(),
      customer: { name: nm, email: nm.toLowerCase().replace(' ', '.') + '@example.com', phone: '98' + String(10000000 + Math.floor(r() * 89999999)) },
      address: `${12 + i}, MG Road, Hyderabad, Telangana 5000${10 + (i % 80)}`,
      items, subtotal, discount, shipping, total, coupon: discount ? c.code : '',
      status, payment: { method, status: payStatus, txnId: method === 'COD' ? '' : `pay_${Math.floor(r() * 1e12).toString(36)}` },
      refund,
    }, i));
  }
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { orders, products, coupons };
}

// ---------- store ----------
export function loadStore() {
  const liveOrders = read(KEYS.orders);
  if (Array.isArray(liveOrders) && liveOrders.length) {
    const products = read(KEYS.products) || [];
    return {
      demo: false,
      orders: liveOrders.map(normalizeOrder).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      products: products.map((p, i) => ({
        id: p.id ?? `P${i}`, sku: p.sku || p.id || `SKU${i}`, name: p.name || p.title, category: p.category || 'General',
        ...p, price: Number(p.price || 0), stock: Number(p.stock ?? p.quantity ?? 0), active: p.active !== false,
      })),
      coupons: read(KEYS.coupons) || [
        { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0, active: true },
        { code: 'SAVE100', type: 'flat', value: 100, minOrder: 999, active: true },
        { code: 'DIAPER15', type: 'percent', value: 15, minOrder: 799, active: true },
      ],
    };
  }
  let d = read(DEMO_PREFIX + 'store');
  if (!d) { d = seedDemo(); write(DEMO_PREFIX + 'store', d); }
  return { demo: true, ...d };
}

export function persist(store) {
  if (store.demo) {
    write(DEMO_PREFIX + 'store', { orders: store.orders, products: store.products, coupons: store.coupons });
  } else {
    write(KEYS.orders, store.orders);
    write(KEYS.products, store.products);
    write(KEYS.coupons, store.coupons);
  }
}

export function resetDemo() {
  localStorage.removeItem(DEMO_PREFIX + 'store');
}
