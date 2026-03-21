-- Atomic increment for num_scans to prevent race condition quota bypass.
-- Called from the image-processing Edge Function.
CREATE OR REPLACE FUNCTION public.increment_num_scans(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles
  SET num_scans = COALESCE(num_scans, 0) + 1,
      updated_at = now()
  WHERE id = p_user_id;
$$;

-- Revoke direct access; only service_role should call this.
REVOKE ALL ON FUNCTION public.increment_num_scans(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_num_scans(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.increment_num_scans(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_num_scans(uuid) TO service_role;

-- Ensure users cannot update their own is_pro or num_scans fields.
-- This policy allows users to read their own profile but only update safe fields.
-- Adjust the allowed columns as needed for your application.
DO $$
BEGIN
  -- Drop existing permissive update policy if it exists, so we can replace it
  -- with a restrictive one that blocks is_pro / num_scans / subscription_status.
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    DROP POLICY "Users can update own profile" ON profiles;
  END IF;
END $$;

-- Allow users to update only non-sensitive fields on their own profile.
CREATE POLICY "Users can update own profile safe fields"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Block changes to sensitive fields by ensuring they haven't changed.
    -- This requires the old values to match; PostgREST sends all columns.
    AND is_pro IS NOT DISTINCT FROM (SELECT is_pro FROM profiles WHERE id = auth.uid())
    AND num_scans IS NOT DISTINCT FROM (SELECT num_scans FROM profiles WHERE id = auth.uid())
    AND subscription_status IS NOT DISTINCT FROM (SELECT subscription_status FROM profiles WHERE id = auth.uid())
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM profiles WHERE id = auth.uid())
  );
