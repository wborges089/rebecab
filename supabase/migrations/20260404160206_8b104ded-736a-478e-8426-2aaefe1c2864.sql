-- Fix 1: Deny INSERT/UPDATE/DELETE on user_roles for non-service-role users
-- By creating restrictive policies that only allow admins (but in practice, role management should be service_role only)

-- Deny all INSERT on user_roles (only service_role can insert)
CREATE POLICY "Only service role can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Deny all UPDATE on user_roles
CREATE POLICY "Only service role can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false);

-- Deny all DELETE on user_roles
CREATE POLICY "Only service role can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- Fix 2: Replace the open leads INSERT policy with service_role only
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

CREATE POLICY "Only service role can insert leads"
ON public.leads
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow anon to call edge function (anon can invoke but not insert directly)
