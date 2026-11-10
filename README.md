# MotherCare React App

Baby products and daily essentials store (Create React App).

## Run
```
npm install
npm start
```
Open http://localhost:3000

## Try it
- Sign up as "Sell products on this store" to unlock the Seller dashboard (single add + CSV bulk upload).
- Sign up as a customer to shop, apply coupons (WELCOME10, SAVE100, DIAPER15) and check out.
- Data is stored in the browser (localStorage) for demo purposes only.

## Before going live
- Replace the payment placeholder in src/components/Checkout.js with a real gateway (Razorpay, Cashfree, Stripe).
- Replace localStorage auth/products/orders with a backend and database. Never store plain passwords.
