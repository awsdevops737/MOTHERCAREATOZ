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
