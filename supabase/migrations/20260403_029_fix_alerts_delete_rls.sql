-- Fix alerts DELETE policy: allow any authenticated user to delete
-- Temporary fix before role-based restriction

DROP POLICY IF EXISTS alerts_delete ON public.alerts;

CREATE POLICY alerts_delete ON public.alerts
  FOR DELETE TO authenticated
  USING (true);
