-- TaskGlass DB schema (v1)
-- Stack: Supabase Postgres (DB) + NestJS (API) + React/Vite (Web)
-- MVP: 2 workspaces + kanban + tags + daily templates + daily generator function

begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tg_task_status') then
    create type tg_task_status as enum ('todo','in_progress','blocked','done');
  end if;
end $$;

create table if not exists tg_workspace (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tg_column (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references tg_workspace(id) on delete cascade,
  key tg_task_status not null,
  title text not null,
  sort_order int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, key)
);

create table if not exists tg_tag (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references tg_workspace(id) on delete cascade,
  group_key text not null,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, group_key, name)
);

create table if not exists tg_recurrence_template (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references tg_workspace(id) on delete cascade,
  title text not null,
  description text,
  status_default tg_task_status not null default 'todo',
  priority smallint not null default 3,
  cadence text not null default 'daily',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tg_recurrence_template_tag (
  template_id uuid not null references tg_recurrence_template(id) on delete cascade,
  tag_id uuid not null references tg_tag(id) on delete cascade,
  primary key (template_id, tag_id)
);

create table if not exists tg_task (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references tg_workspace(id) on delete cascade,
  title text not null,
  description text,
  status tg_task_status not null default 'todo',
  priority smallint not null default 3,
  due_date date,
  sort_order int not null default 0,
  template_id uuid null references tg_recurrence_template(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tg_task_workspace_status_idx on tg_task(workspace_id, status);
create index if not exists tg_task_workspace_due_idx on tg_task(workspace_id, due_date);

create table if not exists tg_task_tag (
  task_id uuid not null references tg_task(id) on delete cascade,
  tag_id uuid not null references tg_tag(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, tag_id)
);

create table if not exists tg_daily_run (
  workspace_id uuid not null references tg_workspace(id) on delete cascade,
  run_date date not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, run_date)
);

create table if not exists tg_saved_view (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references tg_workspace(id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  sort jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create or replace function tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['tg_workspace','tg_column','tg_tag','tg_recurrence_template','tg_task','tg_saved_view']
  loop
    execute format('drop trigger if exists set_updated_at on %I', t);
    execute format('create trigger set_updated_at before update on %I for each row execute function tg_set_updated_at()', t);
  end loop;
end;
$$;

create or replace function tg_run_daily(p_workspace_code text, p_run_date date default null)
returns void
language plpgsql
as $$
declare
  v_workspace_id uuid;
  v_date date := coalesce(p_run_date, (timezone('America/Mexico_City', now()))::date);
begin
  select id into v_workspace_id from tg_workspace where code = p_workspace_code;
  if v_workspace_id is null then
    raise exception 'workspace code % not found', p_workspace_code;
  end if;

  insert into tg_daily_run(workspace_id, run_date)
  values (v_workspace_id, v_date)
  on conflict do nothing;

  if not found then
    return;
  end if;

  with ins as (
    insert into tg_task(workspace_id, title, description, status, priority, due_date, template_id)
    select
      t.workspace_id,
      t.title,
      t.description,
      t.status_default,
      t.priority,
      v_date,
      t.id
    from tg_recurrence_template t
    where t.workspace_id = v_workspace_id
      and t.is_active = true
      and t.cadence = 'daily'
    returning id as task_id, template_id
  )
  insert into tg_task_tag(task_id, tag_id)
  select ins.task_id, rtt.tag_id
  from ins
  join tg_recurrence_template_tag rtt on rtt.template_id = ins.template_id;
end;
$$;

commit;
