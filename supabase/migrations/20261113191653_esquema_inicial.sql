-- PIPEA: esquema inicial
-- Catálogo (ejes, prioridades, fuentes, actividades), usuarios y roles,
-- periodos trimestrales, entregas con evidencias y calificaciones.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.rol_usuario as enum ('admin', 'evaluador', 'organizacion');
create type public.plazo_prioridad as enum ('corto', 'mediano', 'largo');
create type public.estado_entrega as enum ('borrador', 'en_revision');

-- ---------------------------------------------------------------------------
-- Organizaciones y perfiles
-- ---------------------------------------------------------------------------
create table public.organizaciones (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique,
  nombre text not null,
  creado_en timestamptz not null default now()
);

-- Un perfil por cuenta de Supabase Auth. El rol solo lo asigna el admin.
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  correo text not null,
  nombre text,
  rol public.rol_usuario,
  organizacion_id uuid references public.organizaciones (id) on delete restrict,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  constraint perfil_org_coherente check (
    (rol = 'organizacion' and organizacion_id is not null)
    or (rol is distinct from 'organizacion' and organizacion_id is null)
  )
);
create index perfiles_organizacion_idx on public.perfiles (organizacion_id);

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
create table public.ejes (
  id uuid primary key default gen_random_uuid(),
  numero smallint not null unique,
  nombre text not null
);

create table public.prioridades (
  id uuid primary key default gen_random_uuid(),
  eje_id uuid not null references public.ejes (id) on delete cascade,
  numero smallint not null,
  nombre text not null,
  plazo public.plazo_prioridad not null,
  unique (eje_id, numero)
);

-- Cada prioridad tiene su propia lista de fuentes de información (tipos de evidencia).
create table public.fuentes (
  id uuid primary key default gen_random_uuid(),
  prioridad_id uuid not null references public.prioridades (id) on delete cascade,
  orden smallint not null,
  nombre text not null,
  unique (prioridad_id, orden)
);

create table public.actividades (
  id uuid primary key default gen_random_uuid(),
  prioridad_id uuid not null references public.prioridades (id) on delete cascade,
  organizacion_id uuid not null references public.organizaciones (id) on delete restrict,
  orden smallint not null,
  descripcion text not null,
  lideres text,
  responsables text
);
create index actividades_prioridad_idx on public.actividades (prioridad_id);
create index actividades_organizacion_idx on public.actividades (organizacion_id);

-- ---------------------------------------------------------------------------
-- Periodos (trimestres) y reaperturas
-- ---------------------------------------------------------------------------
create table public.periodos (
  id uuid primary key default gen_random_uuid(),
  anio smallint not null,
  trimestre smallint not null check (trimestre between 1 and 4),
  fecha_limite timestamptz,
  abierto boolean not null default false,
  unique (anio, trimestre)
);

-- Reapertura autorizada fuera de la plataforma; el admin la registra con justificación.
create table public.reaperturas (
  id uuid primary key default gen_random_uuid(),
  periodo_id uuid not null references public.periodos (id) on delete cascade,
  organizacion_id uuid not null references public.organizaciones (id) on delete cascade,
  justificacion text not null,
  autorizado_por text not null,
  nueva_fecha_limite timestamptz not null,
  registrado_por uuid references auth.users (id) on delete set null default auth.uid(),
  creado_en timestamptz not null default now()
);
create index reaperturas_periodo_org_idx on public.reaperturas (periodo_id, organizacion_id);
create index reaperturas_registrado_por_idx on public.reaperturas (registrado_por);
create index reaperturas_organizacion_idx on public.reaperturas (organizacion_id);

-- ---------------------------------------------------------------------------
-- Entregas y evidencias
-- ---------------------------------------------------------------------------
create table public.entregas (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid not null references public.actividades (id) on delete cascade,
  periodo_id uuid not null references public.periodos (id) on delete cascade,
  organizacion_id uuid not null references public.organizaciones (id) on delete cascade,
  narrativa text,
  estado public.estado_entrega not null default 'borrador',
  enviado_en timestamptz,
  actualizado_en timestamptz not null default now(),
  unique (actividad_id, periodo_id)
);
create index entregas_periodo_idx on public.entregas (periodo_id);
create index entregas_organizacion_idx on public.entregas (organizacion_id);

create table public.evidencias (
  id uuid primary key default gen_random_uuid(),
  entrega_id uuid not null references public.entregas (id) on delete cascade,
  fuente_id uuid not null references public.fuentes (id) on delete restrict,
  ruta_archivo text not null unique,
  nombre_archivo text not null,
  tamano_bytes bigint,
  subido_por uuid references auth.users (id) on delete set null default auth.uid(),
  creado_en timestamptz not null default now()
);
create index evidencias_entrega_idx on public.evidencias (entrega_id);
create index evidencias_fuente_idx on public.evidencias (fuente_id);
create index evidencias_subido_por_idx on public.evidencias (subido_por);

-- ---------------------------------------------------------------------------
-- Calificaciones: UNA nota 0–25 por organización y trimestre, más comentarios.
-- ---------------------------------------------------------------------------
create table public.calificaciones (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references public.organizaciones (id) on delete cascade,
  periodo_id uuid not null references public.periodos (id) on delete cascade,
  nota numeric(4, 2) not null check (nota between 0 and 25),
  comentarios text,
  evaluador_id uuid references auth.users (id) on delete set null default auth.uid(),
  actualizado_en timestamptz not null default now(),
  unique (organizacion_id, periodo_id)
);
create index calificaciones_periodo_idx on public.calificaciones (periodo_id);
create index calificaciones_evaluador_idx on public.calificaciones (evaluador_id);

-- Comentarios de mejora por prioridad dentro de una calificación.
create table public.comentarios_prioridad (
  id uuid primary key default gen_random_uuid(),
  calificacion_id uuid not null references public.calificaciones (id) on delete cascade,
  prioridad_id uuid not null references public.prioridades (id) on delete cascade,
  comentario text not null,
  unique (calificacion_id, prioridad_id)
);
create index comentarios_prioridad_prioridad_idx on public.comentarios_prioridad (prioridad_id);

-- ---------------------------------------------------------------------------
-- Funciones auxiliares (security definer para evitar recursión en RLS)
-- ---------------------------------------------------------------------------
create or replace function public.mi_rol()
returns public.rol_usuario
language sql stable security definer set search_path = ''
as $$
  select rol from public.perfiles where id = auth.uid() and activo
$$;

create or replace function public.mi_organizacion()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select organizacion_id from public.perfiles where id = auth.uid() and activo
$$;

create or replace function public.es_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(public.mi_rol() in ('admin', 'evaluador'), false)
$$;

create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(public.mi_rol() = 'admin', false)
$$;

-- ¿La organización puede cargar en este periodo? Abierto y antes de la fecha límite,
-- o con una reapertura vigente.
create or replace function public.puede_cargar(p_organizacion uuid, p_periodo uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.periodos p
    where p.id = p_periodo and p.abierto
      and (p.fecha_limite is null or now() <= p.fecha_limite)
  ) or exists (
    select 1 from public.reaperturas r
    where r.periodo_id = p_periodo and r.organizacion_id = p_organizacion
      and now() <= r.nueva_fecha_limite
  )
$$;

revoke execute on function public.mi_rol(), public.mi_organizacion(), public.es_staff(),
  public.es_admin(), public.puede_cargar(uuid, uuid) from public, anon;
grant execute on function public.mi_rol(), public.mi_organizacion(), public.es_staff(),
  public.es_admin(), public.puede_cargar(uuid, uuid) to authenticated;

-- Crear perfil automáticamente al crear la cuenta. El rol y la organización
-- vienen de app_metadata, que solo puede escribir el servidor (llave secreta).
create or replace function public.crear_perfil()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfiles (id, correo, nombre, rol, organizacion_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'nombre',
    (new.raw_app_meta_data ->> 'rol')::public.rol_usuario,
    nullif(new.raw_app_meta_data ->> 'organizacion_id', '')::uuid
  );
  return new;
end;
$$;
revoke execute on function public.crear_perfil() from public, anon, authenticated;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- Mantener actualizado_en
create or replace function public.tocar_actualizado()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger entregas_actualizado before update on public.entregas
  for each row execute function public.tocar_actualizado();
create trigger calificaciones_actualizado before update on public.calificaciones
  for each row execute function public.tocar_actualizado();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.organizaciones enable row level security;
alter table public.perfiles enable row level security;
alter table public.ejes enable row level security;
alter table public.prioridades enable row level security;
alter table public.fuentes enable row level security;
alter table public.actividades enable row level security;
alter table public.periodos enable row level security;
alter table public.reaperturas enable row level security;
alter table public.entregas enable row level security;
alter table public.evidencias enable row level security;
alter table public.calificaciones enable row level security;
alter table public.comentarios_prioridad enable row level security;

-- Catálogo: lectura para cualquier usuario autenticado; escritura solo admin.
create policy "catalogo lectura" on public.organizaciones for select to authenticated using (true);
create policy "catalogo lectura" on public.ejes for select to authenticated using (true);
create policy "catalogo lectura" on public.prioridades for select to authenticated using (true);
create policy "catalogo lectura" on public.fuentes for select to authenticated using (true);
create policy "catalogo lectura" on public.periodos for select to authenticated using (true);

create policy "admin escribe" on public.organizaciones for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin escribe" on public.ejes for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin escribe" on public.prioridades for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin escribe" on public.fuentes for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin escribe" on public.periodos for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Actividades: staff ve todas; cada organización ve todas las del catálogo
-- (para ver con quién comparte prioridad) pero solo carga las suyas.
create policy "actividades lectura" on public.actividades for select to authenticated using (true);
create policy "admin escribe" on public.actividades for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Perfiles: cada quien ve el suyo; staff ve todos. Altas y cambios: solo admin
-- (en la práctica, desde el servidor con la llave secreta).
create policy "perfil propio o staff" on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (select public.es_staff()));
create policy "admin escribe" on public.perfiles for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Reaperturas: staff y la organización afectada leen; admin registra.
create policy "reaperturas lectura" on public.reaperturas for select to authenticated
  using ((select public.es_staff()) or organizacion_id = (select public.mi_organizacion()));
create policy "admin escribe" on public.reaperturas for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Entregas: la organización gestiona las suyas mientras pueda cargar; staff lee todas.
create policy "entregas lectura" on public.entregas for select to authenticated
  using ((select public.es_staff()) or organizacion_id = (select public.mi_organizacion()));
create policy "entregas alta" on public.entregas for insert to authenticated
  with check (
    organizacion_id = (select public.mi_organizacion())
    and exists (select 1 from public.actividades a
                where a.id = actividad_id and a.organizacion_id = entregas.organizacion_id)
    and public.puede_cargar(organizacion_id, periodo_id)
  );
create policy "entregas cambio" on public.entregas for update to authenticated
  using (organizacion_id = (select public.mi_organizacion())
         and public.puede_cargar(organizacion_id, periodo_id))
  with check (organizacion_id = (select public.mi_organizacion())
              and public.puede_cargar(organizacion_id, periodo_id));

-- Evidencias: mismas reglas que su entrega.
create policy "evidencias lectura" on public.evidencias for select to authenticated
  using (exists (select 1 from public.entregas e where e.id = entrega_id
                 and ((select public.es_staff()) or e.organizacion_id = (select public.mi_organizacion()))));
create policy "evidencias alta" on public.evidencias for insert to authenticated
  with check (exists (select 1 from public.entregas e
                      join public.actividades a on a.id = e.actividad_id
                      join public.fuentes f on f.id = fuente_id and f.prioridad_id = a.prioridad_id
                      where e.id = entrega_id
                        and e.organizacion_id = (select public.mi_organizacion())
                        and public.puede_cargar(e.organizacion_id, e.periodo_id)));
create policy "evidencias baja" on public.evidencias for delete to authenticated
  using (exists (select 1 from public.entregas e where e.id = entrega_id
                 and e.organizacion_id = (select public.mi_organizacion())
                 and public.puede_cargar(e.organizacion_id, e.periodo_id)));

-- Calificaciones: staff lee todas; la organización lee las suyas; evaluadores y admin escriben.
create policy "calificaciones lectura" on public.calificaciones for select to authenticated
  using ((select public.es_staff()) or organizacion_id = (select public.mi_organizacion()));
create policy "staff escribe" on public.calificaciones for all to authenticated
  using ((select public.es_staff())) with check ((select public.es_staff()));

create policy "comentarios lectura" on public.comentarios_prioridad for select to authenticated
  using (exists (select 1 from public.calificaciones c where c.id = calificacion_id
                 and ((select public.es_staff()) or c.organizacion_id = (select public.mi_organizacion()))));
create policy "staff escribe" on public.comentarios_prioridad for all to authenticated
  using ((select public.es_staff())) with check ((select public.es_staff()));

-- ---------------------------------------------------------------------------
-- Almacenamiento de evidencias (bucket privado, solo PDF, 20 MB)
-- Ruta: {organizacion_id}/{periodo_id}/{actividad_id}/{archivo}.pdf
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidencias', 'evidencias', false, 20971520, array['application/pdf']);

create policy "evidencias leer" on storage.objects for select to authenticated
  using (bucket_id = 'evidencias' and (
    (select public.es_staff())
    or (storage.foldername(name))[1] = (select public.mi_organizacion())::text));

create policy "evidencias subir" on storage.objects for insert to authenticated
  with check (bucket_id = 'evidencias'
    and (storage.foldername(name))[1] = (select public.mi_organizacion())::text
    and public.puede_cargar((select public.mi_organizacion()), ((storage.foldername(name))[2])::uuid));

create policy "evidencias borrar" on storage.objects for delete to authenticated
  using (bucket_id = 'evidencias'
    and (storage.foldername(name))[1] = (select public.mi_organizacion())::text
    and public.puede_cargar((select public.mi_organizacion()), ((storage.foldername(name))[2])::uuid));
