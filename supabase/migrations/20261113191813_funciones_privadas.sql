-- Mover las funciones auxiliares de RLS a un esquema que no expone la API REST,
-- para que no se puedan invocar como /rest/v1/rpc/*. Las políticas siguen
-- funcionando porque apuntan a la función, no a su nombre.
create schema if not exists privado;
revoke all on schema privado from public, anon;
grant usage on schema privado to authenticated;

alter function public.mi_rol() set schema privado;
alter function public.mi_organizacion() set schema privado;
alter function public.es_staff() set schema privado;
alter function public.es_admin() set schema privado;
alter function public.puede_cargar(uuid, uuid) set schema privado;

-- Las funciones internas se llaman entre sí con nombre calificado.
create or replace function privado.es_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(privado.mi_rol() in ('admin', 'evaluador'), false)
$$;

create or replace function privado.es_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(privado.mi_rol() = 'admin', false)
$$;
