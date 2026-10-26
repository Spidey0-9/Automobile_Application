-- Automobile Management App: initial PostgreSQL schema
-- Run this in Supabase SQL Editor after creating a project.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'manager', 'staff', 'mechanic')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table if not exists public.bike_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.bike_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.bike_brands(id) on delete restrict,
  name text not null,
  engine_cc integer not null check (engine_cc > 0),
  variant text,
  created_at timestamptz not null default now(),
  unique (brand_id, name, engine_cc, variant)
);

-- One row per physical bike, especially important for second-hand inventory.
create table if not exists public.inventory_bikes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  model_id uuid not null references public.bike_models(id) on delete restrict,
  display_name text,
  registration_number text,
  manufacture_year integer check (manufacture_year between 1950 and 2100),
  odometer_km integer check (odometer_km is null or odometer_km >= 0),
  condition text not null check (condition in ('excellent', 'good', 'fair', 'needs_repair')),
  condition_notes text,
  purchase_price numeric(12,2) check (purchase_price is null or purchase_price >= 0),
  selling_price numeric(12,2) not null check (selling_price >= 0),
  status text not null default 'available' check (status in ('available', 'reserved', 'sold', 'under_repair', 'inactive')),
  photo_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists inventory_registration_per_business
  on public.inventory_bikes (business_id, upper(registration_number))
  where registration_number is not null and length(trim(registration_number)) > 0;

create index if not exists inventory_bikes_business_status_idx
  on public.inventory_bikes (business_id, status);
create index if not exists inventory_bikes_model_idx on public.inventory_bikes (model_id);

-- Quantity is derived from physical bikes, so sold/repair units cannot inflate stock.
create or replace view public.model_inventory_summary as
select
  ib.business_id,
  bm.id as model_id,
  bb.name as brand_name,
  bm.name as model_name,
  bm.engine_cc,
  count(*) filter (where ib.status = 'available')::integer as available_quantity,
  min(ib.selling_price) filter (where ib.status = 'available') as min_selling_price,
  max(ib.selling_price) filter (where ib.status = 'available') as max_selling_price
from public.inventory_bikes ib
join public.bike_models bm on bm.id = ib.model_id
join public.bike_brands bb on bb.id = bm.brand_id
group by ib.business_id, bm.id, bb.name, bm.name, bm.engine_cc;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  inventory_bike_id uuid not null unique references public.inventory_bikes(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete set null,
  selling_price numeric(12,2) not null check (selling_price >= 0),
  sale_date timestamptz not null default now(),
  ownership_transfer_status text not null default 'pending' check (ownership_transfer_status in ('pending', 'in_progress', 'completed')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.service_records (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  inventory_bike_id uuid references public.inventory_bikes(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  service_date timestamptz not null default now(),
  description text not null,
  parts_cost numeric(12,2) not null default 0 check (parts_cost >= 0),
  labor_cost numeric(12,2) not null default 0 check (labor_cost >= 0),
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- RLS: members can only access rows belonging to businesses they are members of.
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.bike_brands enable row level security;
alter table public.bike_models enable row level security;
alter table public.inventory_bikes enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.service_records enable row level security;

create policy "members can view their businesses" on public.businesses
for select to authenticated using (
  exists (select 1 from public.business_members m where m.business_id = id and m.user_id = auth.uid())
);
create policy "members can view business membership" on public.business_members
for select to authenticated using (user_id = auth.uid() or exists (
  select 1 from public.business_members m where m.business_id = business_members.business_id and m.user_id = auth.uid()
));

-- Catalogue is shared reference data. Writes should be restricted to trusted admins in production.
create policy "authenticated users can view bike brands" on public.bike_brands
for select to authenticated using (true);
create policy "authenticated users can view bike models" on public.bike_models
for select to authenticated using (true);

create policy "business members manage inventory" on public.inventory_bikes
for all to authenticated using (exists (
  select 1 from public.business_members m where m.business_id = inventory_bikes.business_id and m.user_id = auth.uid()
)) with check (exists (
  select 1 from public.business_members m where m.business_id = inventory_bikes.business_id and m.user_id = auth.uid()
));
create policy "business members manage customers" on public.customers
for all to authenticated using (exists (
  select 1 from public.business_members m where m.business_id = customers.business_id and m.user_id = auth.uid()
)) with check (exists (
  select 1 from public.business_members m where m.business_id = customers.business_id and m.user_id = auth.uid()
));
create policy "business members manage sales" on public.sales
for all to authenticated using (exists (
  select 1 from public.business_members m where m.business_id = sales.business_id and m.user_id = auth.uid()
)) with check (exists (
  select 1 from public.business_members m where m.business_id = sales.business_id and m.user_id = auth.uid()
));
create policy "business members manage service records" on public.service_records
for all to authenticated using (exists (
  select 1 from public.business_members m where m.business_id = service_records.business_id and m.user_id = auth.uid()
)) with check (exists (
  select 1 from public.business_members m where m.business_id = service_records.business_id and m.user_id = auth.uid()
));

-- NOTE: This is an initial schema. Before production, review RLS, add safe onboarding
-- functions/policies, storage policies, audit logging, and transactional sale/status logic.
