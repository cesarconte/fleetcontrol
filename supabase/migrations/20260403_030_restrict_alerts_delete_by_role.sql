-- Restrict alerts DELETE to admin and traffic_manager roles only
-- Drivers (read_only, maintenance_tech) can read, mark read, and dismiss
-- but NOT permanently delete alerts (audit trail preservation)

DROP POLICY IF EXISTS alerts_delete ON public.alerts;

CREATE POLICY alerts_delete ON public.alerts
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'traffic_manager')
    )
  );
