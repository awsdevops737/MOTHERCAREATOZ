# MotherCare store: setup guide

## 0. What you have
Customers: sign up / sign in (password, **show password**, **Forgot password**, **email OTP code**), browse, cart, coupons, pay with Razorpay (UPI, cards, net banking), order history.
Admin: Dashboard, Orders (update status), Payments, Refunds (real Razorpay refunds), Products, Customers, Reports (CSV), Coupons.

## 1. Install and run
1. Copy `.env.example` to `.env` and fill it in (steps 2 and 5 below give the values).
2. In this folder: `npm install`
3. `npm run build` should say "Compiled successfully".
4. To test with the payment API locally: `npx vercel dev`. (`npm start` shows the shop but not /api.)

## 2. Supabase (database + login)
1. supabase.com > New project. Save the database password.
2. **SQL Editor** > New query > paste all of `supabase/setup.sql` > Run.
3. **Project Settings > API**: copy Project URL and the `anon` key into `.env` as REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY, and the URL and `service_role` key as SUPABASE_URL / SUPABASE_SERVICE_KEY. The service_role key is a secret: never put it in React code or share it.

## 3. Login settings (OTP and forgot password)
In Supabase > **Authentication**:
1. **URL Configuration**: set Site URL to your live address (e.g. https://yaba1-wv4a.vercel.app) and add it, plus http://localhost:3000, under Redirect URLs. Forgot-password links need this.
2. **Email Templates** > *Magic Link*: change the body so it shows the code, e.g. `Your MotherCare login code is {{ .Token }}`. Without `{{ .Token }}` customers get a link, not a 6-digit code.
3. **SMTP Settings**: Supabase's built-in email sends only a few emails per hour. For a real shop, add a custom SMTP provider (Resend, Brevo, Gmail SMTP etc.) before launch.
4. Optional: Providers > Email > turn off "Confirm email" while testing.
Phone-number SMS OTP needs a paid SMS provider (Twilio, MessageBird...) and extra code; email OTP works now.

## 4. Become admin
1. Open your site, click Sign in > Create an account with your own email.
2. Supabase > SQL Editor > run (put your email):
   `update profiles set role='admin' where id = (select id from auth.users where email='YOU@EXAMPLE.COM');`
3. Refresh the site (or sign out and in). An **Admin** link appears in the footer. Click it.
Only accounts with role `admin` can see orders and customers; this is enforced by the database, not just the screen. Give admin to others the same way.

## 5. Attach your Razorpay account
1. Log in at dashboard.razorpay.com and switch to **Test Mode** (toggle at the top).
2. Account & Settings > **API Keys** > Generate Test Key. Copy the Key Id (rzp_test_...) and Key Secret (shown once; save it).
3. Put them in `.env` and in **Vercel > your project > Settings > Environment Variables**: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET. Add the Supabase variables from step 2 there too, tick Production/Preview/Development, then **Redeploy**.
4. Test: add a product, check out, and pay with test card 4111 1111 1111 1111 (any future expiry, any CVV) or test UPI ID success@razorpay. The order should appear in Admin > Orders as Paid.
5. **Webhook** (recommended): Razorpay > Settings > Webhooks > Add. URL `https://YOUR-SITE/api/razorpay-webhook`, choose a secret (any long random text), tick event `payment.captured`. Put the same secret in Vercel as RAZORPAY_WEBHOOK_SECRET and redeploy. This marks orders paid even if a customer closes the tab right after paying.
6. **Go live**: finish Razorpay activation/KYC, switch to Live Mode, generate Live keys, replace the two key variables in Vercel, redeploy. Refunds: Admin > Orders, set a paid order to Cancelled or Returned, then Admin > Refunds > Refund via Razorpay.
(Razorpay menu names can differ slightly; use their search if you can't find an item.)

## 6. Deploy
Push this folder to GitHub (`.env` is git-ignored, so keys stay private) and import the repo in Vercel. Set the environment variables above, then redeploy.

## Not built yet
Cash on delivery, product images upload and multi-image galleries, reviews and ratings, wishlist, search suggestions, saved addresses, order emails/SMS, invoices, shipping-carrier tracking, Google login, phone OTP.
