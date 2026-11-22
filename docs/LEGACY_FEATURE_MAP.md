# Legacy feature map

Status: roadmap only. No legacy object is being revived by this document. Legacy schema files remain under `supabase/legacy/` for audit/reference.

Privacy classes:
- **public** — safe for anonymous/public display after normal content moderation.
- **personal** — tied to a student/account or participation record.
- **sensitive** — health, accessibility/disability, grievance/support, or similarly high-impact personal data.

## Phase roadmap

| Phase | Scope |
| --- | --- |
| 3a Aashraya | Blood-request responses; accessibility profiles only if a clearly scoped support use case is approved and explicit consent is designed. |
| 3b Sahayi | Scribe certificates and public verification; privacy review is mandatory before any public certificate lookup. |
| 3c resources/opportunities | Courses, opportunity bookmarks, FAQs, issue votes; preserve moderation and owner RLS. |
| 3d Samskara/FAQ | Competitions, registrations, gallery, magazine, volunteer signups, plus FAQ/help content not already covered in 3c. |

## Object-by-object map

| Legacy object | Feature | Current live page / likely consumer | Privacy | Proposed phase |
| --- | --- | --- | --- | --- |
| `roles` | Old authorization catalogue | Auth/admin flows; current app uses `user_roles` instead | personal | Do not port; keep current role model |
| `courses` | Course catalogue | `/resources`, `/resources/browse`, opportunity filters | public | 3c |
| `blood_request_responses` | Response/fulfilment to Aashraya requests | `/aashraya/request`, `/aashraya/coordinator` | sensitive | 3a |
| `accessibility_profiles` | Accessibility/support profile | Support flows; no current production table | sensitive | 3a + explicit consent/privacy review |
| `magazine_issues` | Samskara digital magazine issues | `/samskara/magazine` | public | 3d |
| `opportunity_bookmarks` | Saved opportunities | `/opportunities`, `/opportunities/browse` | personal | 3c |
| `competitions` | Samskara competitions | `/samskara/competitions` | public | 3d |
| `competition_registrations` | Competition entries | `/samskara/competitions` | personal | 3d |
| `gallery_albums` | Samskara gallery albums | `/samskara/gallery` | public | 3d |
| `gallery_items` | Gallery media | `/samskara/gallery` | public | 3d |
| `volunteer_signups` | Volunteer registration | `/samskara/volunteers`, `/sahayi/volunteer` | personal | 3d |
| `faqs` | Public FAQs/help content | `/support`, `/support/helpdesk` | public | 3c |
| `issue_votes` | Student voting on issues | `/support/issues` | personal | 3c |
| `helpdesk_tickets` | Legacy support ticket model | `/support/helpdesk` | personal | 3c |
| `scribe_certificates` | Sahayi certificate issuance | `/sahayi/certificates`, coordinator workflows | personal | 3b |
| `scribe_certificate_public` | Public certificate representation | `/sahayi/certificates` public/verification surface | public* | 3b + privacy review |
| `scribe_certificate_verification` (view) | Public certificate verification | Sahayi certificate verification route | public* | 3b + privacy review |
| `private.handle_new_user()` (function) | Legacy auth trigger implementation | Superseded by `public.handle_new_user()` | personal/auth | Do not port |

\* Public only after a privacy review confirms the minimum fields exposed do not reveal unnecessary names, identifiers, or other personal data.

## Hardcoded/demo-data follow-up

The current route structure shows the intended consumers, but legacy objects must not be recreated merely to replace hardcoded/demo content. Before each phase:
1. identify every demo/static record used by the page;
2. define the new production table and owner/moderator model;
3. define RLS and consent requirements;
4. migrate only the minimum fields required by the live UI;
5. remove demo data only after the database-backed path is verified.

### Mandatory privacy flags

- `accessibility_profiles`: **explicit consent and privacy review required** before schema or UI reuse.
- `scribe_certificate_public`: **privacy review required** before any anonymous/public query.
- `scribe_certificate_verification`: **privacy review required** before any public route or indexable endpoint.
