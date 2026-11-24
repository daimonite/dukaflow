-- Run after confirming your Supabase project and current backups.
-- This secures existing legacy tables without deleting their rows.
-- Business records are stored as one JSONB snapshot per authenticated owner.
-- `updated_at` doubles as the optimistic-concurrency token: the app only writes
-- when the row still carries the value this device last read, so a stale phone
-- cannot replace another phone's newer records.

create table if not exists public.business_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.business_state enable row level security;
revoke all on table public.business_state from public, anon, authenticated;
grant select, insert, update, delete on table public.business_state to authenticated;

drop policy if exists "Users can read their own business state" on public.business_state;
drop policy if exists "Users can insert their own business state" on public.business_state;
drop policy if exists "Users can update their own business state" on public.business_state;
drop policy if exists "Users can delete their own business state" on public.business_state;
create policy "Users can read their own business state" on public.business_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert their own business state" on public.business_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own business state" on public.business_state
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete their own business state" on public.business_state
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Disable access to the former unauthenticated per-table sync targets.
-- Rows are preserved, but new clients cannot read or write them.
do $$
declare
  table_name text;
  policy_row record;
begin
  foreach table_name in array array[
    'sales', 'expenses', 'purchases', 'inventory_movements', 'owner_drawings',
    'power_members', 'power_periods', 'meter_readings', 'power_payments',
    'customers', 'suppliers', 'ledger_entries', 'audit_log', 'products', 'cash_register'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      for policy_row in
        select policyname from pg_policies
        where schemaname = 'public' and tablename = table_name
      loop
        execute format('drop policy if exists %I on public.%I', policy_row.policyname, table_name);
      end loop;
      execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
    end if;
  end loop;
end $$;
