begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(18);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'customers', 'customers table exists');
select has_table('public', 'interactions', 'interactions table exists');

select col_is_pk('public', 'profiles', 'id', 'profiles.id is the primary key');
select col_is_pk('public', 'customers', 'id', 'customers.id is the primary key');
select col_is_pk('public', 'interactions', 'id', 'interactions.id is the primary key');

select has_column('public', 'customers', 'phone_normalized', 'customer phone search value exists');
select col_type_is('public', 'customers', 'status', 'customer_status', 'customer status uses its enum');
select col_type_is('public', 'interactions', 'type', 'interaction_type', 'interaction type uses its enum');

select policies_are(
  'public',
  'profiles',
  array['profiles_select_authenticated'],
  'profiles expose only the intended select policy'
);
select policies_are(
  'public',
  'customers',
  array[
    'customers_delete_admin',
    'customers_insert_authenticated',
    'customers_select_authenticated',
    'customers_update_authenticated'
  ],
  'customers have explicit role-aware CRUD policies'
);
select policies_are(
  'public',
  'interactions',
  array['interactions_insert_authenticated', 'interactions_select_authenticated'],
  'interactions are append-only for authenticated users'
);

select has_function(
  'public',
  'list_customers',
  array['text', 'customer_status', 'integer', 'integer'],
  'paginated customer search function exists'
);
select function_lang_is('public', 'list_customers', array['text', 'customer_status', 'integer', 'integer'], 'sql');

select has_index('public', 'customers', 'customers_name_trgm_idx', 'name search index exists');
select has_index('public', 'customers', 'customers_phone_normalized_idx', 'phone search index exists');
select has_index('public', 'customers', 'customers_updated_at_idx', 'ledger ordering index exists');
select has_index('public', 'interactions', 'interactions_customer_created_idx', 'timeline index exists');

select * from finish();
rollback;
