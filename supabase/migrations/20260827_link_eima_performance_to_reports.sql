ALTER TABLE public.fund_performance_history
  ADD CONSTRAINT fund_performance_history_eima_report_date_fkey
  FOREIGN KEY (report_date)
  REFERENCES public.eima_reports(report_date);
