# MotherCare Admin Panel – setup

Copy the whole `admin` folder to `src/admin/` in your project. No new npm packages are needed.

## 1. Mount it

I couldn't see your `src/` code, so wire it in where you handle the logged-in user (usually `App.js`):

```jsx
import AdminApp from './admin/AdminApp';

// when the current user is an admin and you want to show the panel:
<AdminApp user={currentUser} onExit={() => setView('store')} />
```

`user` must have `role: 'admin'` (or `isAdmin: true`), otherwise "Access denied" is shown.
Add a button/link (visible only to admins) that switches your app to this view.

To try it quickly, temporarily render: `<AdminApp user={{ role: 'admin' }} />`.

## 2. Data it reads

| Key in localStorage | Used for |
|---|---|
| `orders` | Orders, payments, refunds, customers, reports |
| `products` | Products tab, low-stock alerts |
| `coupons` | Coupons tab |

If `orders` is empty you will see **demo data** (stored separately under `mc_demo_store`, never touching real data) with a yellow banner and a "Reset demo" button.

Field names are tolerated loosely (`id`/`orderId`, `items`/`cart`, `total`/`amount`, `paymentMethod`, etc. – see `normalizeOrder` in `adminData.js`). Adjust it if your Checkout saves different names.

Admin edits (status, refunds, products, coupons) are written back to the same keys.
For orders to carry refund info, Checkout should save `payment: { method, status, txnId }`.

## 3. Tabs

Dashboard · Orders (search, filter, status update, invoice print, CSV) · Payments · Refunds (approve / reject / processed) · Products · Customers · Reports (CSV downloads) · Coupons

## 4. Before going live (important)

- The admin check is **demo-only**: anyone can edit localStorage in their browser. Real admin access needs a backend with proper login and role checks.
- "Refund processed" only records the status. Real refunds must be issued **server-side** with the Razorpay API using your secret key – never put the key in React code.
- Move orders/products/coupons to a database and replace `loadStore` / `persist` in `adminData.js` with API calls.
