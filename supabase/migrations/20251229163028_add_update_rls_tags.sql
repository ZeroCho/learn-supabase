create policy "only admin can update tags"
  on "public"."tags"
  as permissive
  for update
  to supabase_admin
using (true);