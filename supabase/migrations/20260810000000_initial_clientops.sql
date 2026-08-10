create extension if not exists pg_trgm with schema extensions;

create type public.user_role as enum ('ADMIN', 'STAFF');
create type public.customer_status as enum (
  'NEW',
  'CONTACTED',
  'BOOKED',
  'COMPLETED',
  'CANCELLED'
);
create type public.interaction_type as enum ('PHONE', 'SMS', 'EMAIL', 'VISIT');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role public.user_role not null default 'STAFF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  phone varchar(30),
  phone_normalized varchar(30) generated always as (
    regexp_replace(coalesce(phone, ''), '[^0-9+]', '', 'g')
  ) stored,
  email varchar(254),
  address varchar(300),
  status public.customer_status not null default 'NEW',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_name_length check (char_length(btrim(name)) between 1 and 100),
  constraint customers_phone_length check (phone is null or char_length(phone) between 1 and 30),
  constraint customers_email_format check (
    email is null or email ~* '^[A-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$'
  ),
  constraint customers_address_length check (address is null or char_length(address) between 1 and 300)
);

create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  type public.interaction_type not null,
  memo text not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete restrict,
  constraint interactions_memo_length check (char_length(btrim(memo)) between 1 and 2000)
);

create index customers_name_trgm_idx on public.customers using gin (name extensions.gin_trgm_ops);
create index customers_phone_normalized_idx on public.customers (phone_normalized);
create index customers_status_idx on public.customers (status);
create index customers_updated_at_idx on public.customers (updated_at desc, id desc);
create index interactions_customer_created_idx on public.interactions (customer_id, created_at desc, id desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'STAFF')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger auth_user_profile_created
after insert or update of email on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.list_customers(
  p_search text default null,
  p_status public.customer_status default null,
  p_page integer default 1,
  p_page_size integer default 20
)
returns table (
  id uuid,
  name varchar(100),
  phone varchar(30),
  email varchar(254),
  address varchar(300),
  status public.customer_status,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with filtered as (
    select c.*
    from public.customers c
    where (
      nullif(btrim(p_search), '') is null
      or c.name ilike '%' || replace(replace(replace(btrim(p_search), '\', '\\'), '%', '\%'), '_', '\_') || '%' escape '\'
      or (
        regexp_replace(coalesce(p_search, ''), '[^0-9+]', '', 'g') <> ''
        and c.phone_normalized like '%' || regexp_replace(p_search, '[^0-9+]', '', 'g') || '%'
      )
    )
    and (p_status is null or c.status = p_status)
  )
  select
    f.id,
    f.name,
    f.phone,
    f.email,
    f.address,
    f.status,
    f.created_at,
    f.updated_at,
    count(*) over() as total_count
  from filtered f
  order by f.updated_at desc, f.id desc
  limit least(greatest(p_page_size, 1), 100)
  offset ((greatest(p_page, 1) - 1) * least(greatest(p_page_size, 1), 100));
$$;

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.interactions enable row level security;

create policy profiles_select_authenticated
on public.profiles for select
to authenticated
using (true);

create policy customers_select_authenticated
on public.customers for select
to authenticated
using (true);

create policy customers_insert_authenticated
on public.customers for insert
to authenticated
with check (public.current_user_role() in ('ADMIN', 'STAFF'));

create policy customers_update_authenticated
on public.customers for update
to authenticated
using (public.current_user_role() in ('ADMIN', 'STAFF'))
with check (public.current_user_role() in ('ADMIN', 'STAFF'));

create policy customers_delete_admin
on public.customers for delete
to authenticated
using (public.current_user_role() = 'ADMIN');

create policy interactions_select_authenticated
on public.interactions for select
to authenticated
using (true);

create policy interactions_insert_authenticated
on public.interactions for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.current_user_role() in ('ADMIN', 'STAFF')
);

revoke all on table public.profiles, public.customers, public.interactions from anon;
grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.customers to authenticated;
grant select, insert on table public.interactions to authenticated;
grant select, insert, update, delete on table public.profiles, public.customers, public.interactions to service_role;

grant usage on type public.user_role, public.customer_status, public.interaction_type to authenticated;
grant usage on type public.user_role, public.customer_status, public.interaction_type to service_role;

revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_auth_user() from public;
revoke all on function public.current_user_role() from public;
revoke all on function public.list_customers(text, public.customer_status, integer, integer) from public;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.list_customers(text, public.customer_status, integer, integer) to authenticated;

comment on function public.list_customers is
  'RLS-preserving paginated customer search used by the ClientOps customer ledger and CSV exporter.';
