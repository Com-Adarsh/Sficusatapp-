# Phase 4 — Sahayi (SFI CUSAT Scribe Cell)

Phase 4 turns Sahayi into a native module of the SFI CUSAT Digital Student Platform.

## Student workflows

- Request a Scribe
- View request status
- View assignment confirmation state
- Become a Scribe
- View volunteer assignments
- Accept/decline proposed assignments

## Coordinator workflows

- Review active requests
- Review pending volunteer applications
- Approve volunteers
- View approved volunteers
- Generate suggested matches using subject/language/availability signals
- Propose assignments
- Manage assignment completion
- Issue volunteer certificates

## Confirmation model

Assignments use dual confirmation:

1. Coordinator proposes
2. Volunteer confirms or declines
3. Requester confirms
4. Assignment becomes confirmed only after both parties confirm
5. Coordinator marks the completed support session
6. Sahayi volunteer certificate is issued

## Privacy

Accessibility and exam-support information is treated as sensitive.

- Requester data is visible to the requester and authorised Sahayi coordinators.
- Volunteer profiles are visible to the volunteer and authorised Sahayi coordinators.
- Public pages never expose accessibility profile details.
- Certificate verification uses a separate non-sensitive public projection and does not expose recipient IDs.
- UI restrictions are not the security boundary; Supabase RLS is.

## Database migrations

- 0007_sahayi_module.sql
- 0008_sahayi_certificate_privacy.sql
- 0009_sahayi_assignment_confirmation.sql
- 0010_sahayi_public_certificates.sql

## Routes

- /sahayi
- /sahayi/request
- /sahayi/request/[id]
- /sahayi/volunteer
- /sahayi/assignments
- /sahayi/coordinator
- /sahayi/coordinator/assignments
- /sahayi/certificates/verify/[code]

## Naming

The module's canonical name in this repository is **Sahayi — SFI CUSAT Scribe Cell**.

This module is intended to serve all CUSAT students regardless of organisational affiliation.