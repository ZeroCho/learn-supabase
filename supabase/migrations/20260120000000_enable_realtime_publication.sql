-- Enable Realtime (postgres_changes) for required tables.
-- Without adding tables to the `supabase_realtime` publication, clients will not receive
-- realtime change events even if they successfully subscribe to a channel.

DO $$
BEGIN
  -- Add tables idempotently (ignore duplicate_object errors).
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END $$;


