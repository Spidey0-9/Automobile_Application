-- Migration 0002: Shop Profile, Catalogue Seeds, Atomic Sale Function & Realtime Publications

-- 1. Extend businesses with contact & shop profile details
alter table public.businesses
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists logo_url text,
  add column if not exists currency text default 'INR';

-- 2. Extend inventory_bikes with second-hand flag
alter table public.inventory_bikes
  add column if not exists is_second_hand boolean not null default true;

-- 3. Function to safely register or update a shop profile
create or replace function public.upsert_business_profile(
  p_business_id uuid,
  p_name text,
  p_phone text default null,
  p_address text default null,
  p_logo_url text default null
)
returns public.businesses
language plpgsql
security definer
as $$
declare
  v_biz public.businesses;
begin
  if p_business_id is not null then
    update public.businesses
    set
      name = coalesce(trim(p_name), name),
      phone = coalesce(trim(p_phone), phone),
      address = coalesce(trim(p_address), address),
      logo_url = coalesce(trim(p_logo_url), logo_url)
    where id = p_business_id
    returning * into v_biz;
  else
    insert into public.businesses (name, phone, address, logo_url)
    values (trim(p_name), trim(p_phone), trim(p_address), trim(p_logo_url))
    returning * into v_biz;
  end if;
  return v_biz;
end;
$$;

-- 4. Atomic transaction function to record a vehicle sale and update status safely
create or replace function public.record_vehicle_sale(
  p_business_id uuid,
  p_inventory_bike_id uuid,
  p_customer_id uuid,
  p_selling_price numeric,
  p_notes text default null
)
returns public.sales
language plpgsql
security definer
as $$
declare
  v_current_status text;
  v_sale public.sales;
begin
  -- Check availability and lock row for update to prevent double selling
  select status into v_current_status
  from public.inventory_bikes
  where id = p_inventory_bike_id and business_id = p_business_id
  for update;

  if v_current_status is null then
    raise exception 'Vehicle not found in this business inventory';
  end if;

  if v_current_status != 'available' and v_current_status != 'reserved' then
    raise exception 'Vehicle cannot be sold because its current status is "%"', v_current_status;
  end if;

  -- Insert sale record
  insert into public.sales (
    business_id,
    inventory_bike_id,
    customer_id,
    selling_price,
    sale_date,
    ownership_transfer_status,
    notes
  ) values (
    p_business_id,
    p_inventory_bike_id,
    p_customer_id,
    p_selling_price,
    now(),
    'completed',
    p_notes
  )
  returning * into v_sale;

  -- Update bike status to sold
  update public.inventory_bikes
  set status = 'sold', updated_at = now()
  where id = p_inventory_bike_id;

  return v_sale;
end;
$$;

-- 5. Seed popular Indian bike brands and models into the catalogue
do $$
declare
  hero_id uuid;
  honda_id uuid;
  bajaj_id uuid;
  tvs_id uuid;
  re_id uuid;
  yamaha_id uuid;
  suzuki_id uuid;
  ktm_id uuid;
begin
  -- Brands
  insert into public.bike_brands (name) values ('Hero') on conflict (name) do update set name = excluded.name returning id into hero_id;
  insert into public.bike_brands (name) values ('Honda') on conflict (name) do update set name = excluded.name returning id into honda_id;
  insert into public.bike_brands (name) values ('Bajaj') on conflict (name) do update set name = excluded.name returning id into bajaj_id;
  insert into public.bike_brands (name) values ('TVS') on conflict (name) do update set name = excluded.name returning id into tvs_id;
  insert into public.bike_brands (name) values ('Royal Enfield') on conflict (name) do update set name = excluded.name returning id into re_id;
  insert into public.bike_brands (name) values ('Yamaha') on conflict (name) do update set name = excluded.name returning id into yamaha_id;
  insert into public.bike_brands (name) values ('Suzuki') on conflict (name) do update set name = excluded.name returning id into suzuki_id;
  insert into public.bike_brands (name) values ('KTM') on conflict (name) do update set name = excluded.name returning id into ktm_id;

  -- Hero Models
  insert into public.bike_models (brand_id, name, engine_cc, variant) values
    (hero_id, 'Splendor Plus', 97, 'Drum Self'),
    (hero_id, 'HF Deluxe', 97, 'Kick Start'),
    (hero_id, 'Passion Pro', 113, 'Disc'),
    (hero_id, 'Glamour', 125, 'FI Drum'),
    (hero_id, 'Xpulse 200', 199, '4V')
  on conflict (brand_id, name, engine_cc, variant) do nothing;

  -- Honda Models
  insert into public.bike_models (brand_id, name, engine_cc, variant) values
    (honda_id, 'Activa 6G', 109, 'Standard'),
    (honda_id, 'Shine', 124, 'Disc'),
    (honda_id, 'SP 125', 124, 'Drum'),
    (honda_id, 'Unicorn', 162, 'Standard'),
    (honda_id, 'Hness CB350', 348, 'DLX')
  on conflict (brand_id, name, engine_cc, variant) do nothing;

  -- Bajaj Models
  insert into public.bike_models (brand_id, name, engine_cc, variant) values
    (bajaj_id, 'Platina 100', 102, 'ES Drum'),
    (bajaj_id, 'Pulsar 125', 124, 'Neon'),
    (bajaj_id, 'Pulsar 150', 149, 'Single Disc'),
    (bajaj_id, 'Pulsar NS200', 199, 'ABS Dual Channel'),
    (bajaj_id, 'Dominar 400', 373, 'Touring')
  on conflict (brand_id, name, engine_cc, variant) do nothing;

  -- TVS Models
  insert into public.bike_models (brand_id, name, engine_cc, variant) values
    (tvs_id, 'Jupiter 110', 109, 'ZX Disc'),
    (tvs_id, 'Raider 125', 124, 'Split Seat'),
    (tvs_id, 'Apache RTR 160 4V', 159, 'Special Edition'),
    (tvs_id, 'Ronin', 225, 'Base')
  on conflict (brand_id, name, engine_cc, variant) do nothing;

  -- Royal Enfield Models
  insert into public.bike_models (brand_id, name, engine_cc, variant) values
    (re_id, 'Classic 350', 349, 'Dual Channel'),
    (re_id, 'Bullet 350', 349, 'Standard'),
    (re_id, 'Hunter 350', 349, 'Metro Dapper'),
    (re_id, 'Himalayan 450', 452, 'Base')
  on conflict (brand_id, name, engine_cc, variant) do nothing;

  -- Yamaha Models
  insert into public.bike_models (brand_id, name, engine_cc, variant) values
    (yamaha_id, 'FZ-S FI', 149, 'Version 4.0'),
    (yamaha_id, 'MT-15 V2', 155, 'Deluxe'),
    (yamaha_id, 'YZF R15 V4', 155, 'Racing Blue'),
    (yamaha_id, 'Aerox 155', 155, 'Monster')
  on conflict (brand_id, name, engine_cc, variant) do nothing;

  -- Suzuki Models
  insert into public.bike_models (brand_id, name, engine_cc, variant) values
    (suzuki_id, 'Access 125', 124, 'Ride Connect'),
    (suzuki_id, 'Burgman Street', 124, 'Standard'),
    (suzuki_id, 'Gixxer 150', 155, 'Standard')
  on conflict (brand_id, name, engine_cc, variant) do nothing;

  -- KTM Models
  insert into public.bike_models (brand_id, name, engine_cc, variant) values
    (ktm_id, 'Duke 200', 199, 'Electronic Orange'),
    (ktm_id, 'Duke 250', 248, 'Ebony Black'),
    (ktm_id, 'RC 390', 373, 'GP Edition')
  on conflict (brand_id, name, engine_cc, variant) do nothing;

end $$;

-- 6. Add realtime replication publication for live updates
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  alter publication supabase_realtime add table public.inventory_bikes;
  alter publication supabase_realtime add table public.businesses;
  alter publication supabase_realtime add table public.bike_models;
exception
  when duplicate_object then null;
  when others then null;
end $$;
