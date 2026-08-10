begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(11);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'admin@test.local', crypt('local-test-only', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'staff@test.local', crypt('local-test-only', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

update public.profiles set role = 'ADMIN' where id = '10000000-0000-4000-8000-000000000001';

select is(
  (select role::text from public.profiles where id = '10000000-0000-4000-8000-000000000001'),
  'ADMIN',
  'provisioning can assign ADMIN'
);
select is(
  (select role::text from public.profiles where id = '10000000-0000-4000-8000-000000000002'),
  'STAFF',
  'new users default to STAFF'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}';

select lives_ok(
  $$insert into public.customers (id, name, phone, status)
    values ('90000000-0000-4000-8000-000000000001', '스태프 등록 고객', '010-1234-5678', 'NEW')$$,
  'STAFF can create a customer'
);
select is(public.current_user_role()::text, 'STAFF', 'DAL role function resolves STAFF');
select is(
  (select phone_normalized from public.customers where id = '90000000-0000-4000-8000-000000000001'),
  '01012345678',
  'phone is normalized for search'
);

select lives_ok(
  $$insert into public.interactions (id, customer_id, type, memo, created_by)
    values (
      '90000000-0000-4000-8000-000000000002',
      '90000000-0000-4000-8000-000000000001',
      'PHONE', '정상 상담 기록',
      '10000000-0000-4000-8000-000000000002'
    )$$,
  'STAFF can append an interaction under their own identity'
);
select throws_ok(
  $$insert into public.interactions (customer_id, type, memo, created_by)
    values (
      '90000000-0000-4000-8000-000000000001',
      'PHONE', '작성자 위조',
      '10000000-0000-4000-8000-000000000001'
    )$$,
  '42501',
  null,
  'STAFF cannot spoof an interaction creator'
);

delete from public.customers where id = '90000000-0000-4000-8000-000000000001';
reset role;

select is(
  (select count(*) from public.customers where id = '90000000-0000-4000-8000-000000000001'),
  1::bigint,
  'STAFF delete is denied by RLS'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}';

select is(public.current_user_role()::text, 'ADMIN', 'DAL role function resolves ADMIN');
delete from public.customers where id = '90000000-0000-4000-8000-000000000001';
reset role;

select is(
  (select count(*) from public.customers where id = '90000000-0000-4000-8000-000000000001'),
  0::bigint,
  'ADMIN can permanently delete a customer'
);
select is(
  (select count(*) from public.interactions where customer_id = '90000000-0000-4000-8000-000000000001'),
  0::bigint,
  'customer deletion cascades to interactions'
);

select * from finish();
rollback;
