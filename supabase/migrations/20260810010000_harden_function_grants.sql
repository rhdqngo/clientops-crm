create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security invoker
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

revoke execute on function public.current_user_role() from public, anon;
grant execute on function public.current_user_role() to authenticated;

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
grant execute on function public.handle_new_auth_user() to supabase_auth_admin;

drop policy interactions_insert_authenticated on public.interactions;
create policy interactions_insert_authenticated
on public.interactions for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.current_user_role() in ('ADMIN', 'STAFF')
);
