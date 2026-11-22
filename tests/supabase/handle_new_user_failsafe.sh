#!/usr/bin/env bash
set -euo pipefail

PSQL="psql -v ON_ERROR_STOP=1 -X"
uid() { echo "$1"; }

echo '== Apply fail-safe function =='
$PSQL -f supabase/hotfix/handle_new_user_failsafe.sql >/dev/null

echo '== 1. Real-column-shaped auth.users insert creates profile + student role =='
ID="$(uid '20000000-0000-0000-0000-000000000001')"
$PSQL -c "insert into auth.users(id,aud,role,email,raw_user_meta_data,created_at,updated_at,email_confirmed_at) values ('$ID','authenticated','authenticated','normal@example.test','{"full_name":"Normal CI"}',now(),now(),now());"
test "$($PSQL -Atc "select count(*) from public.profiles where id='$ID'")" = "1"
test "$($PSQL -Atc "select count(*) from public.user_roles where user_id='$ID' and role='student'")" = "1"

echo '== 2. Forced role failure does not abort auth.users insert =='
ID="$(uid '20000000-0000-0000-0000-000000000002')"
$PSQL -c "alter table public.user_roles add constraint ci_force_role_failure check (false) not valid;"
set +e
$PSQL -c "insert into auth.users(id,email,raw_user_meta_data,created_at,updated_at) values ('$ID','role-fail@example.test','{"full_name":"Role Failure"}',now(),now());" >/tmp/role-fail.out 2>&1
RC=$?
set -e
$PSQL -c "alter table public.user_roles drop constraint ci_force_role_failure;"
test "$RC" = "0"
test "$($PSQL -Atc "select count(*) from auth.users where id='$ID'")" = "1"
test "$($PSQL -Atc "select count(*) from public.profiles where id='$ID'")" = "1"
test "$($PSQL -Atc "select count(*) from public.user_roles where user_id='$ID' and role='student'")" = "0"

echo '== 3. Forced profile failure does not abort auth.users insert =='
ID="$(uid '20000000-0000-0000-0000-000000000003')"
$PSQL -c "alter table public.profiles add constraint ci_force_profile_failure check (false) not valid;"
set +e
$PSQL -c "insert into auth.users(id,email,raw_user_meta_data,created_at,updated_at) values ('$ID','profile-fail@example.test','{"full_name":"Profile Failure"}',now(),now());" >/tmp/profile-fail.out 2>&1
RC=$?
set -e
$PSQL -c "alter table public.profiles drop constraint ci_force_profile_failure;"
test "$RC" = "0"
test "$($PSQL -Atc "select count(*) from auth.users where id='$ID'")" = "1"
test "$($PSQL -Atc "select count(*) from public.profiles where id='$ID'")" = "0"
test "$($PSQL -Atc "select count(*) from public.user_roles where user_id='$ID' and role='student'")" = "1"

echo '== 4. Backfill is idempotent =='
ID="$(uid '20000000-0000-0000-0000-000000000004')"
$PSQL -c "insert into auth.users(id,email,raw_user_meta_data,created_at,updated_at) values ('$ID','backfill@example.test','{"full_name":"Backfill CI"}',now(),now());"
$PSQL -c "delete from public.profiles where id='$ID';"
$PSQL -c "insert into public.profiles(id,full_name) select u.id,coalesce(nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'name',''),split_part(coalesce(u.email,'CUSAT Student'),'@',1),'CUSAT Student') from auth.users u where u.id='$ID' on conflict(id) do nothing;"
$PSQL -c "insert into public.profiles(id,full_name) select u.id,coalesce(nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'name',''),split_part(coalesce(u.email,'CUSAT Student'),'@',1),'CUSAT Student') from auth.users u where u.id='$ID' on conflict(id) do nothing;"
test "$($PSQL -Atc "select count(*) from public.profiles where id='$ID'")" = "1"

echo 'ALL HANDLE_NEW_USER FAILSAFE TESTS PASSED'
