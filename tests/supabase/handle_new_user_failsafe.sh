#!/usr/bin/env bash
set -euo pipefail

: "${API_URL:?API_URL must be set by the workflow}"
: "${ANON_KEY:?ANON_KEY must be set by the workflow}"
: "${SERVICE_ROLE_KEY:?SERVICE_ROLE_KEY must be set by the workflow}"
: "${POSTGRES_URL:?POSTGRES_URL must be set by the workflow}"

PSQL="psql $POSTGRES_URL -v ON_ERROR_STOP=1 -X"
EMAIL_BASE="handle-new-user-ci-$(date +%s)"
PASSWORD='CI-test-password-123!'

cleanup_user() {
  local uid="${1:-}"
  if [[ -n "$uid" ]]; then
    curl --fail --silent --show-error -X DELETE \
      "$API_URL/auth/v1/admin/users/$uid" \
      -H "apikey: $SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" >/dev/null
  fi
}

signup() {
  local email="$1"
  curl --fail --silent --show-error -X POST "$API_URL/auth/v1/signup" \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$PASSWORD\",\"data\":{\"full_name\":\"CI Trigger Test\"}}"
}

extract_user_id() {
  python -c 'import json,sys; d=json.load(sys.stdin); print(d.get("id") or d.get("user",{}).get("id") or "")'
}

assert_count() {
  local sql="$1" expected="$2" actual
  actual="$($PSQL -Atc "$sql")"
  [[ "$actual" == "$expected" ]] || { echo "Expected $expected, got $actual for: $sql"; exit 1; }
}

echo '== Apply hotfix function locally =='
$PSQL -f supabase/hotfix/handle_new_user_failsafe.sql >/dev/null

echo '== 1. Normal Auth API signup creates profile + student role =='
R="$(signup "$EMAIL_BASE-normal@example.test")"
UID="$(printf '%s' "$R" | extract_user_id)"
[[ -n "$UID" ]] || { echo "Signup response did not contain a user id: $R"; exit 1; }
assert_count "select count(*) from public.profiles where id='$UID'" 1
assert_count "select count(*) from public.user_roles where user_id='$UID' and role='student'" 1
cleanup_user "$UID"

echo '== 2. Forced role insert failure does not abort signup =='
$PSQL -c "alter table public.user_roles add constraint ci_force_role_failure check (false) not valid;" >/dev/null
set +e
R="$(signup "$EMAIL_BASE-role-fail@example.test")"
RC=$?
set -e
$PSQL -c "alter table public.user_roles drop constraint ci_force_role_failure;" >/dev/null
[[ "$RC" -eq 0 ]] || { echo "Signup failed while role insert was forced to fail: $R"; exit 1; }
UID="$(printf '%s' "$R" | extract_user_id)"
[[ -n "$UID" ]] || { echo "No user id after forced role failure: $R"; exit 1; }
assert_count "select count(*) from public.profiles where id='$UID'" 1
assert_count "select count(*) from public.user_roles where user_id='$UID' and role='student'" 0
cleanup_user "$UID"

echo '== 3. Forced profile insert failure does not abort signup =='
$PSQL -c "alter table public.profiles add constraint ci_force_profile_failure check (false) not valid;" >/dev/null
set +e
R="$(signup "$EMAIL_BASE-profile-fail@example.test")"
RC=$?
set -e
$PSQL -c "alter table public.profiles drop constraint ci_force_profile_failure;" >/dev/null
[[ "$RC" -eq 0 ]] || { echo "Signup failed while profile insert was forced to fail: $R"; exit 1; }
UID="$(printf '%s' "$R" | extract_user_id)"
[[ -n "$UID" ]] || { echo "No user id after forced profile failure: $R"; exit 1; }
assert_count "select count(*) from public.profiles where id='$UID'" 0
assert_count "select count(*) from public.user_roles where user_id='$UID' and role='student'" 1
cleanup_user "$UID"

echo '== 4. Backfill is idempotent for pre-existing user with no profile =='
R="$(curl --fail --silent --show-error -X POST "$API_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_BASE-backfill@example.test\",\"password\":\"$PASSWORD\",\"email_confirm\":true,\"user_metadata\":{\"full_name\":\"Backfill CI\"}}")"
UID="$(printf '%s' "$R" | extract_user_id)"
[[ -n "$UID" ]] || { echo "Admin user creation returned no id: $R"; exit 1; }
$PSQL -c "delete from public.profiles where id='$UID';" >/dev/null
$PSQL -c "insert into public.profiles(id,full_name) select u.id, coalesce(nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'name',''),split_part(coalesce(u.email,'CUSAT Student'),'@',1),'CUSAT Student') from auth.users u where u.id='$UID' on conflict(id) do nothing;" >/dev/null
$PSQL -c "insert into public.profiles(id,full_name) select u.id, coalesce(nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'name',''),split_part(coalesce(u.email,'CUSAT Student'),'@',1),'CUSAT Student') from auth.users u where u.id='$UID' on conflict(id) do nothing;" >/dev/null
assert_count "select count(*) from public.profiles where id='$UID'" 1
cleanup_user "$UID"

echo 'ALL HANDLE_NEW_USER FAILSAFE TESTS PASSED'
