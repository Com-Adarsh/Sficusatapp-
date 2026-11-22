with
tables as (
  select coalesce(jsonb_agg(to_jsonb(x) order by schema_name,table_name),'[]'::jsonb) data
  from (
    select table_schema schema_name, table_name, table_type
    from information_schema.tables
    where table_schema in ('public','private')
       or (table_schema='auth' and table_name='users')
  ) x
),
columns as (
  select coalesce(jsonb_agg(to_jsonb(x) order by schema_name,table_name,ordinal_position),'[]'::jsonb) data
  from (
    select table_schema schema_name,table_name,column_name,ordinal_position,data_type,udt_schema,udt_name,
           column_default,is_nullable,character_maximum_length,numeric_precision,numeric_scale
    from information_schema.columns
    where table_schema in ('public','private')
       or (table_schema='auth' and table_name='users')
  ) x
),
constraints as (
  select coalesce(jsonb_agg(to_jsonb(x) order by schema_name,table_name,constraint_name),'[]'::jsonb) data
  from (
    select n.nspname schema_name,c.relname table_name,con.conname constraint_name,con.contype constraint_type,
           pg_get_constraintdef(con.oid,true) definition
    from pg_constraint con
    join pg_class c on c.oid=con.conrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname in ('public','private') or (n.nspname='auth' and c.relname='users')
  ) x
),
indexes as (
  select coalesce(jsonb_agg(to_jsonb(x) order by schema_name,table_name,index_name),'[]'::jsonb) data
  from (
    select schemaname schema_name,tablename table_name,indexname index_name,indexdef
    from pg_indexes
    where schemaname in ('public','private') or (schemaname='auth' and tablename='users')
  ) x
),
policies as (
  select coalesce(jsonb_agg(to_jsonb(x) order by schemaname,tablename,policyname),'[]'::jsonb) data
  from (
    select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
    from pg_policies
    where schemaname in ('public','private')
  ) x
),
functions as (
  select coalesce(jsonb_agg(to_jsonb(x) order by schema_name,function_name,identity_arguments),'[]'::jsonb) data
  from (
    select n.nspname schema_name,p.proname function_name,pg_get_function_identity_arguments(p.oid) identity_arguments,
           pg_get_function_result(p.oid) result_type,l.lanname language,p.prosecdef security_definer,p.proleakproof leakproof,
           pg_get_functiondef(p.oid) definition
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_language l on l.oid=p.prolang
    where n.nspname in ('public','private')
  ) x
),
triggers as (
  select coalesce(jsonb_agg(to_jsonb(x) order by schema_name,table_name,trigger_name),'[]'::jsonb) data
  from (
    select n.nspname schema_name,c.relname table_name,t.tgname trigger_name,pg_get_triggerdef(t.oid,true) definition,t.tgenabled enabled
    from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
    where not t.tgisinternal
      and (n.nspname in ('public','private') or (n.nspname='auth' and c.relname='users'))
  ) x
),
views as (
  select coalesce(jsonb_agg(to_jsonb(x) order by schema_name,view_name),'[]'::jsonb) data
  from (
    select schemaname schema_name,viewname view_name,definition
    from pg_views where schemaname in ('public','private')
  ) x
),
enums as (
  select coalesce(jsonb_agg(to_jsonb(x) order by schema_name,type_name),'[]'::jsonb) data
  from (
    select n.nspname schema_name,t.typname type_name,jsonb_agg(e.enumlabel order by e.enumsortorder) values
    from pg_type t join pg_namespace n on n.oid=t.typnamespace join pg_enum e on e.enumtypid=t.oid
    where n.nspname in ('public','private') group by n.nspname,t.typname
  ) x
)
select jsonb_build_object(
 'scope','application-schema-plus-auth-users',
 'tables',(select data from tables),
 'columns',(select data from columns),
 'constraints',(select data from constraints),
 'indexes',(select data from indexes),
 'policies',(select data from policies),
 'functions',(select data from functions),
 'triggers',(select data from triggers),
 'views',(select data from views),
 'enums',(select data from enums)
);