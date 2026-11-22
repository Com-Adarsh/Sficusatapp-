-- Add the confidential grievance officer role in its own migration.
-- Keeping ALTER TYPE separate ensures the new enum value is committed before
-- later migrations use 'grievance_officer' in policy expressions.
alter type public.user_role add value if not exists 'grievance_officer';
