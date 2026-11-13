-- Al cambiar una entrega, la actividad debe seguir siendo de la misma organización.
alter policy "entregas cambio" on public.entregas
  using (organizacion_id = (select privado.mi_organizacion())
         and privado.puede_cargar(organizacion_id, periodo_id))
  with check (
    organizacion_id = (select privado.mi_organizacion())
    and exists (select 1 from public.actividades a
                where a.id = actividad_id and a.organizacion_id = entregas.organizacion_id)
    and privado.puede_cargar(organizacion_id, periodo_id)
  );
