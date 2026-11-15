# Backend master design

Request path:
Browser -> HTTPS -> API routes -> authentication/RBAC -> domain service -> PostgreSQL/repository -> response.

Identity:
One account serves every module. users handles authentication; profiles and student_profiles hold application identity. user_roles can be scoped to a department/module.

Authorization:
Authentication = who. Permission = what. Scope = where. Ownership = whose record. Never authorize from client state.

CBT:
draft -> review -> scheduled -> registration_open -> live -> closed -> evaluation -> results_ready -> archived.

Coordinator flow:
Create exam -> create/import questions -> review -> create answer-key version -> lock key -> publish -> schedule -> monitor -> release results -> export.

Student flow:
Register -> start attempt -> server sets started_at and expires_at -> autosave answers -> submit -> server evaluates against locked key -> result.

The server, not the React timer, decides whether an attempt is active.

Core tables:
users, profiles, student_profiles, roles, permissions, user_roles, departments, department_coordinators, notifications, audit_logs.

Academic/CBT:
resources, exams, question_banks, questions, question_options, exam_questions, answer_key_versions, answer_key_entries, exam_registrations, exam_attempts, attempt_answers, exam_results.

Aashraya:
blood_donors, blood_requests, donor_responses, blood_matches.

Sahayi:
scribe_requests, scribe_volunteers, scribe_assignments.

Samskara:
events, event_registrations, competitions, competition_entries, samskara_volunteers.

SCHOLARX:
opportunities.

Helpdesk:
helpdesk_tickets, ticket_messages.

Portability:
The domain contract does not depend on Supabase. PostgreSQL may run locally, in Docker, on a VPS, bare metal, AWS RDS, Cloud SQL, Azure PostgreSQL, Neon, Railway or another compatible host. Infrastructure adapters can be replaced independently.

Implementation phases:
1. Foundation: auth, RBAC, departments, audit, files, notifications.
2. Academic + CBT.
3. Aashraya + Sahayi + Helpdesk.
4. Samskara + SCHOLARX + resources.
5. Search, moderation, analytics and observability.
