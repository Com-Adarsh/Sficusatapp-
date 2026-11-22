# Roles runbook

Roles are stored only in `public.user_roles`. Never use `user_metadata` for authorization.

## Grant the first admin

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::public.user_role
from auth.users
where lower(email) = lower('ADMIN_EMAIL_HERE')
on conflict (user_id, role) do nothing;
```

## Grant a coordinator

```sql
insert into public.user_roles (user_id, role)
select id, 'aashraya_coordinator'::public.user_role
from auth.users
where lower(email) = lower('COORDINATOR_EMAIL_HERE')
on conflict (user_id, role) do nothing;
```

For Sahayi use `sahayi_coordinator`.

Do not add a public role-management UI.
