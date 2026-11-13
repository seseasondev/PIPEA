-- Reglas de negocio de entregas y evidencias que no dependen de la interfaz.

-- 1) Una entrega solo pasa a "en revisión" con evidencias de al menos 3 fuentes distintas.
--    Al enviarse se registra la fecha de envío.
create or replace function privado.validar_envio()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  fuentes_distintas int;
begin
  if new.estado = 'en_revision' and (tg_op = 'INSERT' or old.estado is distinct from 'en_revision') then
    select count(distinct ev.fuente_id) into fuentes_distintas
    from public.evidencias ev where ev.entrega_id = new.id;
    if fuentes_distintas < 3 then
      raise exception 'Se necesitan evidencias de al menos 3 fuentes distintas para enviar (hay %).', fuentes_distintas
        using errcode = 'check_violation';
    end if;
    new.enviado_en := now();
  end if;
  return new;
end;
$$;

create trigger entregas_validar_envio before insert or update on public.entregas
  for each row execute function privado.validar_envio();

-- 2) El archivo de una evidencia debe estar en la carpeta de su entrega:
--    {organizacion_id}/{periodo_id}/{actividad_id}/...
create or replace function privado.validar_ruta_evidencia()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  e record;
begin
  select organizacion_id, periodo_id, actividad_id into e
  from public.entregas where id = new.entrega_id;
  if new.ruta_archivo not like (e.organizacion_id || '/' || e.periodo_id || '/' || e.actividad_id || '/%') then
    raise exception 'La ruta del archivo no corresponde a la entrega.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger evidencias_validar_ruta before insert on public.evidencias
  for each row execute function privado.validar_ruta_evidencia();

-- 3) Si una entrega enviada se queda con menos de 3 fuentes (porque borraron
--    evidencias), vuelve a borrador.
create or replace function privado.revisar_estado_tras_baja()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.entregas en
  set estado = 'borrador', enviado_en = null
  where en.id = old.entrega_id and en.estado = 'en_revision'
    and (select count(distinct ev.fuente_id) from public.evidencias ev where ev.entrega_id = old.entrega_id) < 3;
  return old;
end;
$$;

create trigger evidencias_revisar_estado after delete on public.evidencias
  for each row execute function privado.revisar_estado_tras_baja();

revoke execute on function privado.validar_envio(), privado.validar_ruta_evidencia(),
  privado.revisar_estado_tras_baja() from public, anon, authenticated;
