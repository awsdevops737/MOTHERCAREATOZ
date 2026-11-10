-- Run once in Supabase > SQL Editor
create table profiles (id uuid primary key references auth.users on delete cascade, name text, role text not null default 'customer');
create table products (id text primary key, name text, category text, price int not null, mrp int, stock int not null default 0, active boolean default true);
create table orders (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users, created_at timestamptz default now(),
  items jsonb, subtotal int, discount int, delivery int, total int, coupon text, address jsonb,
  status text default 'Placed', payment_status text default 'Pending',
  razorpay_order_id text unique, razorpay_payment_id text);

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into profiles(id, name) values (new.id, new.raw_user_meta_data->>'name'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function is_admin() returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin') $$;

alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());
create policy "read products" on products for select using (true);
create policy "admin products" on products for all using (is_admin()) with check (is_admin());
create policy "own or admin orders" on orders for select using (user_id = auth.uid() or is_admin());
create policy "admin updates orders" on orders for update using (is_admin());
-- no insert policy on orders: only the server (service key) creates orders after validating prices.

insert into products (id,name,category,price,mrp,stock) values
('p1','Soft Dry Diapers (Medium, 62 pcs)','Diapers',699,899,40),('p2','Newborn Diapers (Small, 42 pcs)','Diapers',549,649,35),
('p3','Anti-Colic Feeding Bottle 250ml','Feeding',349,449,60),('p4','Silicone Weaning Spoon Set','Feeding',249,299,50),
('p5','Gentle Baby Shampoo 200ml','Bath & Care',199,249,80),('p6','Moisturising Baby Lotion 400ml','Bath & Care',299,359,70),
('p7','Cotton Bodysuit Pack of 3','Clothing',499,799,45),('p8','Winter Baby Cap and Socks Set','Clothing',329,429,30),
('p9','Soft Plush Teddy','Toys',399,549,25),('p10','Stacking Rings Toy','Toys',279,349,3),
('p11','Baby Wipes (3 x 72 pcs)','Daily Essentials',399,499,90),('p12','Baby Laundry Liquid 1L','Daily Essentials',289,349,55);
-- After you sign up on your site, make yourself admin:
-- update profiles set role='admin' where id = (select id from auth.users where email='YOUR_EMAIL');
-- Run AFTER schema.sql (Supabase > SQL Editor)
alter table profiles add column email text;
update profiles p set email = u.email from auth.users u where u.id = p.id;
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into profiles(id, name, email) values (new.id, new.raw_user_meta_data->>'name', new.email); return new; end $$;
create policy "admin reads profiles" on profiles for select using (is_admin());

alter table orders add column refund_status text, add column refund_amount int, add column refund_id text, add column refunded_at timestamptz;

create table coupons (code text primary key, type text not null check (type in ('percent','flat')), value int not null, min_order int not null default 0, active boolean not null default true);
alter table coupons enable row level security;
create policy "admin coupons" on coupons for all using (is_admin()) with check (is_admin());
insert into coupons values ('WELCOME10','percent',10,0,true),('SAVE100','flat',100,999,true),('DIAPER15','percent',15,1499,true);
