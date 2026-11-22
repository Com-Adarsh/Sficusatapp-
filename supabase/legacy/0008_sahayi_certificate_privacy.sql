-- Phase 4 security hardening: certificate verification must not expose recipient IDs.
drop policy if exists "Public certificate verification" on public.scribe_certificates;

drop view if exists public.scribe_certificate_verification;
create view public.scribe_certificate_verification
with (security_invoker = true)
as
select certificate_code, role_label, issued_at
from public.scribe_certificates;

grant select on public.scribe_certificate_verification to anon, authenticated;
