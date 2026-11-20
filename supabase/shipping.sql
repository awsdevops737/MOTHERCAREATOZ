-- Run once in Supabase > SQL Editor
alter table orders
  add column if not exists shiprocket_order_id text,
  add column if not exists shiprocket_shipment_id text,
  add column if not exists awb_code text,
  add column if not exists courier_name text;
