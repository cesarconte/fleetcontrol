-- Fix alerts RLS policies: alerts belong to company, not individual users
-- Users should be able to read, update (mark read, dismiss) any alert
-- Only the creator can delete (for audit trail)

DROP POLICY IF EXISTS alerts_update ON public.alerts;
DROP POLICY IF EXISTS alerts_delete ON public.alerts;

-- UPDATE: any authenticated user can update (mark as read, dismiss)
CREATE POLICY alerts_update ON public.alerts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: only creator can delete (preserves audit trail)
CREATE POLICY alerts_delete ON public.alerts
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = created_by);
