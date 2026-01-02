
  create policy "only admin can delete tags"
  on "public"."tags"
  as permissive
  for delete
  to supabase_admin
using (true);



