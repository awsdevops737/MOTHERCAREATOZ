import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { SAMPLE_PRODUCTS, CATEGORY_EMOJI, OFFERS, FREE_DELIVERY_ABOVE, DELIVERY_FEE } from "./data";
import Header from "./components/Header";
import Home from "./components/Home";
import Catalog from "./components/Catalog";
import Best from "./components/Best";
import CartPage from "./components/CartPage";
import Checkout from "./components/Checkout";
import AuthModal from "./components/AuthModal";
import Offers from "./components/Offers";
import Contact from "./components/Contact";
import Account from "./components/Account";
import AdminPanel from "./admin/AdminPanel";
import { supabase, signUp, signIn, signOut, getProfile } from "./lib/supabase";
import { payNow } from "./lib/pay";

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// Database rows only hold id, name, category, price, mrp and stock.
// Fill in the display fields your components expect (emoji, rating, brand, age, sold).
const withDefaults = (row) => {
  const sample = SAMPLE_PRODUCTS.find((p) => p.id === row.id) || {};
  return {
    emoji: CATEGORY_EMOJI[row.category] || "🧸",
    brand: "",
    age: "",
    rating: 4.5,
    sold: 0,
    ...sample,
    ...row,
    mrp: row.mrp || row.price,
    image: row.image_url || sample.image,
  };
};

export default function App() {
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [cart, setCart] = useState(() => load("mc_cart", {}));
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [auth, setAuth] = useState({ open: false, message: "", next: null });
  const [promptShown, setPromptShown] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => save("mc_cart", cart), [cart]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const go = (p) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  const openCategory = (cat) => {
    setCategory(cat);
    go("catalog");
  };

  /* ---------- products and orders from the database ---------- */
  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase.from("products").select("*").eq("active", true);
    if (!error && data && data.length) {
      setProducts(data.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })).map(withDefaults));
    }
  }, []);
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const loadOrders = useCallback(async () => {
    if (!user) return setOrders([]);
    // row-level security returns only this customer's orders
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(
      (data || []).map((o) => ({
        id: o.id.slice(0, 8).toUpperCase(),
        date: new Date(o.created_at).toLocaleString("en-IN"),
        email: user.email,
        items: o.items,
        totals: { subtotal: o.subtotal, discount: o.discount, delivery: o.delivery, total: o.total },
        coupon: o.coupon,
        status: o.status,
        paymentStatus: o.payment_status,
      }))
    );
  }, [user]);
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  /* ---------- login state ---------- */
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setAuth({ open: true, message: "", next: null, recovery: true });
      // setTimeout avoids a known supabase-js deadlock when calling it inside this callback
      setTimeout(() => getProfile().then(setUser), 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  /* ---------- cart ---------- */
  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
        .filter((i) => i.product),
    [cart, products]
  );
  const cartCount = cartItems.reduce((n, i) => n + i.qty, 0);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
    let discount = 0;
    if (coupon && subtotal >= coupon.min) {
      discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    }
    const after = subtotal - discount;
    const delivery = subtotal === 0 || after >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    return { subtotal, discount, delivery, total: after + delivery };
  }, [cartItems, coupon]);

  const addToCart = (p) => {
    if (p.stock <= 0) return showToast("This item is out of stock");
    const current = cart[p.id] || 0;
    if (current >= p.stock) return showToast(`Only ${p.stock} in stock`);
    setCart({ ...cart, [p.id]: current + 1 });
    showToast("Added to cart");
    if (!user && !promptShown) {
      setPromptShown(true);
      setAuth({
        open: true,
        message: "Create an account to save your cart, track orders and get member-only offers.",
        next: null,
      });
    }
  };

  const changeQty = (id, delta) => {
    const p = products.find((x) => x.id === id);
    const next = (cart[id] || 0) + delta;
    const copy = { ...cart };
    if (next <= 0) delete copy[id];
    else if (p && next > p.stock) return showToast(`Only ${p.stock} in stock`);
    else copy[id] = next;
    setCart(copy);
  };

  const applyCoupon = (code) => {
    const found = OFFERS.find((o) => o.code === code.trim().toUpperCase());
    if (!found) return showToast("Coupon code not found");
    if (totals.subtotal < found.min) return showToast(`Add items worth ₹${found.min} to use ${found.code}`);
    setCoupon(found);
    showToast(`${found.code} applied`);
  };

  /* ---------- auth (Supabase) ---------- */
  const finishAuth = async () => {
    setUser(await getProfile());
    const next = auth.next;
    setAuth({ open: false, message: "", next: null });
    if (next) go(next);
  };

  const handleAuth = async (mode, form) => {
    const email = form.email.trim().toLowerCase();
    const res =
      mode === "signup"
        ? await signUp(form.name.trim(), email, form.password)
        : await signIn(email, form.password);
    if (res.error) return res.error.message;
    if (mode === "signup" && !res.data.session) return "Check your email to confirm your account, then sign in.";
    await finishAuth();
    return null;
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    go("home");
  };

  const openAuth = (message = "", next = null) => setAuth({ open: true, message, next });

  const goCheckout = () => {
    if (cartItems.length === 0) return showToast("Your cart is empty");
    if (!user) return openAuth("Sign in to continue to checkout.", "checkout");
    go("checkout");
  };

  /* ---------- payment ---------- */
  // address = { name, phone, line, city, pincode }. Checkout.js should call this and show any error it throws.
  const pay = async (address) => {
    const res = await payNow({ cart, coupon: coupon?.code, address, user });
    setCart({});
    setCoupon(null);
    loadProducts();
    loadOrders();
    return res;
  };

  /* ---------- admin screen (replaces the whole store layout) ---------- */
  if (page === "admin" && user?.role === "admin") {
    return <AdminPanel user={user} onExit={() => go("home")} />;
  }

  return (
    <div className="app">
      <Header page={page} go={go} cartCount={cartCount} user={user} onSignIn={() => openAuth()} onLogout={logout} />

      <main className="main">
        {page === "home" && <Home products={products} go={go} onCategory={openCategory} onAdd={addToCart} />}
        {page === "catalog" && <Catalog products={products} category={category} setCategory={setCategory} onAdd={addToCart} />}
        {page === "best" && <Best products={products} onAdd={addToCart} />}
        {page === "offers" && <Offers onApply={(c) => { applyCoupon(c); go("cart"); }} showToast={showToast} />}
        {page === "contact" && <Contact />}
        {page === "cart" && (
          <CartPage items={cartItems} totals={totals} coupon={coupon} onQty={changeQty} onApply={applyCoupon} onCheckout={goCheckout} go={go} />
        )}
        {page === "checkout" && <Checkout user={user} totals={totals} items={cartItems} onPay={pay} go={go} />}
        {page === "account" && user && <Account user={user} orders={orders} />}
        {page === "admin" && user?.role !== "admin" && <p className="notice">Admin access only.</p>}
      </main>

      <footer className="footer">
        <div>
          <strong>MotherCare</strong>
          <p>Baby products and daily essentials, delivered with care.</p>
        </div>
        <div className="footer-links">
          <button onClick={() => go("offers")}>Offers</button>
          <button onClick={() => go("contact")}>Contact us</button>
          {user?.role === "admin" && <button onClick={() => go("admin")}>Admin</button>}
        </div>
      </footer>

      {auth.open && (
        <AuthModal key={auth.recovery ? "r" : "a"} message={auth.message} recovery={auth.recovery} onSubmit={handleAuth} onDone={finishAuth} onClose={() => setAuth({ open: false, message: "", next: null })} />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}


