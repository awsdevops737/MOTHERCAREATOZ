# Setup (about 20 minutes)

1. **Supabase**: create a free project at supabase.com. SQL Editor > paste `supabase/schema.sql` > Run.
2. **Install**: `npm install @supabase/supabase-js`  (keep `razorpay`; the api/ functions use it).
3. **Copy** `api/`, `src/lib/`, `src/admin/AdminOrders.js` into your project (api/ goes at project root, next to package.json).
4. **Env vars** (Vercel > Project > Settings > Environment Variables, and a local `.env` for `npm start`):
   - `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` (public, from Supabase > API)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (service_role key: SECRET, server only)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (use Razorpay *test* keys first)
5. **Make yourself admin**: sign up on the site, then run the commented `update profiles ...` line at the bottom of schema.sql.
6. **vercel.json**: change the rewrite so /api is not swallowed:
   `{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }`
7. Test locally with `npx vercel dev` (plain `npm start` does not run api/).

## Wiring into App.js
- Replace `handleAuth` with `signUp` / `signIn` from `src/lib/supabase.js`; on load call `getProfile()` and `supabase.auth.onAuthStateChange` to set `user`. Delete mc_users and mc_user localStorage (it stores plain passwords).
- In Checkout, replace the payment placeholder with:
  `await payNow({ cart, coupon: coupon?.code, address, user })` then clear the cart and show success.
- Add `page === "admin" && <AdminOrders user={user} onExit={() => go("home")} />` and a header link shown only when `user.role === 'admin'`.
- Load products from the Supabase `products` table so prices/stock match what the server charges.

## Admin panel update (all tabs on the database)
1. Run `supabase/schema2.sql` in the SQL Editor (after schema.sql). It adds customer emails, refund columns and the coupons table.
2. Copy `api/refund.js`, the updated `api/create-order.js` (coupons now come from the database) and `src/admin/AdminPanel.js`.
3. Also keep your existing `src/admin/admin.css` and `src/admin/charts.js`; delete the old `AdminApp.js`, `adminData.js` and the old `pages/` folder.
4. In App.js render `<AdminPanel user={user} onExit={() => go("home")} />` instead of AdminOrders for the admin page.
5. Refund flow: set a paid order to Cancelled or Returned in Orders, then Refunds > "Refund via Razorpay" sends the money back through Razorpay.
Note: the offers on the customer pages (data.js OFFERS) are still hardcoded; keep them matching the coupons table or load them from it.
