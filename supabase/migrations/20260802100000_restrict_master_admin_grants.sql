-- The "Admins can manage admin roles" policy allowed ANY admin to insert
-- admin_role = 'master_admin' for any user_id, including their own. The UI only
-- hides that option (AVAILABLE_ADMIN_ROLES omits it), so a single PostgREST
-- call from a demoted or rogue admin escalated them to master_admin — past the
-- "master admin cannot be deleted/edited" protections everywhere else.
--
-- Only an existing master_admin may create or modify a master_admin row.
DROP POLICY IF EXISTS "Admins can manage admin roles" ON public.user_admin_roles;

CREATE POLICY "Admins can manage non-master admin roles"
  ON public.user_admin_roles FOR ALL
  USING (
    has_role(auth.uid(), 'master_admin')
    OR (has_role(auth.uid(), 'admin') AND admin_role <> 'master_admin')
  )
  WITH CHECK (
    has_role(auth.uid(), 'master_admin')
    OR (has_role(auth.uid(), 'admin') AND admin_role <> 'master_admin')
  );
