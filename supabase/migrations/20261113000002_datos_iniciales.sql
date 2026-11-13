-- PIPEA: datos iniciales (organizaciones, 5 ejes, Eje 1 completo, periodos)

insert into public.organizaciones (clave, nombre) values
  ('SABG', 'Secretaría Anticorrupción y Buen Gobierno'),
  ('ISAF', 'Instituto Superior de Auditoría y Fiscalización'),
  ('PJ', 'Tribunal de Disciplina Judicial del Poder Judicial del Estado'),
  ('TJA', 'Tribunal de Justicia Administrativa'),
  ('FEMA', 'Fiscalía Especializada en Materia Anticorrupción');

insert into public.ejes (numero, nombre) values
  (1, 'Fortalecer la confianza ciudadana desde la prevención y la integridad pública'),
  (2, 'Combatir la corrupción y la impunidad'),
  (3, 'Combatir la arbitrariedad y el abuso del poder'),
  (4, 'Promover la mejora de la gestión pública y de los puntos de contacto entre gobierno y sociedad'),
  (5, 'Gobernanza abierta con el sector privado');

-- Prioridad 1
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 1, 'Dignificar la carrera del servicio público a través de la formación en integridad y capacitación para el cumplimiento de sus metas.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Listas de asistencia'),
          (2, 'Evidencia fotográfica'),
          (3, 'Materiales de capacitación'),
          (4, 'Convocatorias y programas de capacitación'),
          (5, 'Capturas o registros de difusión interna'),
          (6, 'Tablas de seguimiento institucional'),
          (7, 'Informes trimestrales de avance'),
          (8, 'Minutas o reportes internos'),
          (9, 'Evidencia documental generada por los entes implementadores')) as v(orden, nombre)
where e.numero = 1 and p.numero = 1;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Implementación del Diplomado de Alta Especialidad en Auditoría Gubernamental dirigido a personas servidoras públicas del Estado de Sonora.'),
          (2, 'FEMA', 'Implementación de micro capacitaciones de integridad mediante la difusión de "Dilemas Éticos de la Semana" a través de canales internos institucionales.'),
          (3, 'FEMA', 'Implementación de mecanismos internos de seguimiento institucional mediante tablas de avances para la visualización de metas colectivas.'),
          (4, 'PJ', 'Fortalecer las capacidades del personal del Poder Judicial del Estado de Sonora mediante acciones de capacitación')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 1;

-- Prioridad 2
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 2, 'Institucionalizar la formación obligatoria en integridad y ética pública, incorporándola como requisito en la capacitación inicial y continua de las personas servidoras públicas de los tres órdenes de gobierno, con la creación y fortalecimiento de comités de ética en cada dependencia.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Plataforma del Curso de Inducción de la Secretaría Anticorrupción y Buen Gobierno'),
          (2, 'Reportes de participación'),
          (3, 'Constancias de aprobación'),
          (4, 'Registros de personas servidoras públicas de nuevo ingreso'),
          (5, 'Informes institucionales'),
          (6, 'Evidencia documental del curso')) as v(orden, nombre)
where e.numero = 1 and p.numero = 2;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Integrar en el Curso de Inducción de la Secretaría Anticorrupción y Buen Gobierno contenidos en materia de integridad y ética pública, dirigidos al personal de nuevo ingreso.'),
          (2, 'PJ', 'Implementar acciones de capacitación inicial en materia de ética e integridad dirigidas a las personas servidoras publicas de nuevo ingreso al Poder Judicial del Estado de Sonora'),
          (3, 'PJ', 'Fortalecer de manera continua las capacidades del personal del Poder Judicial del Estado de Sonora mediante acciones anuales de capacitación en materia de ética e integridad en el servicio público.')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 2;

-- Prioridad 3
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 3, 'Impulsar campañas de sensibilización social en materia de integridad y cultura cívica, dirigidas tanto a servidores públicos como a la ciudadanía en general, para reforzar valores de honestidad, responsabilidad y legalidad como ejes de la vida pública.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Material gráfico'),
          (2, 'Publicaciones digitales'),
          (3, 'Reportes de alcance'),
          (4, 'Memoria fotográfica'),
          (5, 'Informes institucionales'),
          (6, 'Evidencia de talleres y jornadas informativas'),
          (7, 'Capturas de difusión en medios digitales y redes institucionales')) as v(orden, nombre)
where e.numero = 1 and p.numero = 3;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Diseño e implementación de campañas permanentes de sensibilización sobre integridad, cultura de legalidad y valores cívicos, dirigidas a personas servidoras públicas y ciudadanía, mediante medios digitales, talleres y jornadas informativas.')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 3;

-- Prioridad 4
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 4, 'Promover investigaciones integrales en sectores de alto riesgo de corrupción, priorizando áreas estratégicas como obra pública, adquisiciones, salud y educación, con apoyo técnico de los órganos integrantes del CCSEA.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Programa Anual de Investigaciones Estratégicas'),
          (2, 'Diagnóstico anual de riesgos de corrupción'),
          (3, 'Informes de seguimiento'),
          (4, 'Expedientes de investigación'),
          (5, 'Reportes institucionales'),
          (6, 'Evidencia documental derivada de las investigaciones')) as v(orden, nombre)
where e.numero = 1 and p.numero = 4;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Implementar un Programa Anual de Investigaciones Estratégicas basado en riesgos de corrupción en áreas prioritarias (obra pública, adquisiciones, salud y educación),')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 4;

-- Prioridad 5
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 5, 'Redefinir el enfoque de los Órganos Internos de Control (OIC) hacia tareas de prevención y fiscalización en áreas críticas para prevenir problemas y mejorar resultados.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Programa Anual de Auditorías (PAA)'),
          (2, 'Informes de Auditoría'),
          (3, 'Oficios de solicitud de inicio de investigación'),
          (4, 'Informes de seguimiento'),
          (5, 'Reportes institucionales'),
          (6, 'Expedientes de auditoría')) as v(orden, nombre)
where e.numero = 1 and p.numero = 5;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Ejecutar el Programa Anual de Auditorías de los Órganos Internos de Control mediante revisiones preventivas orientadas a identificar riesgos, prevenir irregularidades y fortalecer el control interno en las entidades de la Administración Pública Estatal.')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 5;

-- Prioridad 6
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 6, 'Fortalecer la cultura de la denuncia, generando lineamientos estatales para mecanismos seguros, confidenciales y accesibles, garantizando la protección integral de alertadores y denunciantes.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Protocolo Interno para la protección de alertadores y denunciantes'),
          (2, 'Guía de Bolsillo para denunciantes'),
          (3, 'Bitácoras de entrega'),
          (4, 'Evidencia fotográfica'),
          (5, 'Informes institucionales'),
          (6, 'Reportes de seguimiento'),
          (7, 'Evidencia documental de difusión')) as v(orden, nombre)
where e.numero = 1 and p.numero = 6;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Fortalecer los mecanismos de protección para alertadores y denunciantes en la fase de investigación mediante la elaboración de un Protocolo Interno que establezca criterios de reserva de identidad, medidas de confidencialidad y procedimientos para la solicitud de medidas cautelares o de protección.'),
          (2, 'FEMA', 'Elaborar y distribuir una guía informativa sobre los derechos de las personas denunciantes y las sanciones aplicables en caso de represalias, como mecanismo de fortalecimiento de la cultura de la denuncia.'),
          (3, 'PJ', 'Implementar una plataforma institucional para la presentación segura de denuncias en contra de personas servidoras públicas del Poder Judicial del Estado de Sonora, que garantice la protección de los datos de las personas denunciantes y la confidencialidad de la información.')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 6;

-- Prioridad 7
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 7, 'Coordinar programas de capacitación, sensibilización y promoción en conjunto con el Comité Coordinador en temas de interés, orientados a personas servidoras públicas de todo el estado, asegurando un estándar mínimo de ética, legalidad y responsabilidad.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Convocatorias'),
          (2, 'Programas de capacitación'),
          (3, 'Listas de asistencia'),
          (4, 'Constancias de participación'),
          (5, 'Informes de resultados'),
          (6, 'Evidencia fotográfica'),
          (7, 'Minutas de trabajo'),
          (8, 'Reportes institucionales')) as v(orden, nombre)
where e.numero = 1 and p.numero = 7;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Coordinar acciones interinstitucionales de formación y sensibilización en materia de integridad, ética pública y responsabilidad administrativa con integrantes del Comité Coordinador y dependencias participantes.'),
          (2, 'PJ', 'Proponer, en coordinación con la SESEA y los demás integrantes del Sistema Estatal Anticorrupción, temas prioritarios de capacitación que contribuyan al fortalecimiento de la ética, la legalidad, la integridad y la responsabilidad en el servicio público.')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 7;

-- Prioridad 8
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 8, 'Consolidar mecanismos de coordinación interinstitucional preventiva, estableciendo canales ágiles de colaboración entre dependencias estatales, municipales y órganos autónomos, con el fin de identificar riesgos de corrupción de manera oportuna y fortalecer la capacidad de respuesta del sistema anticorrupción.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Reportes de actualización del sistema'),
          (2, 'Evidencia de socialización institucional'),
          (3, 'Minutas de trabajo'),
          (4, 'Registros de capacitación o acompañamiento técnico'),
          (5, 'Reportes de interoperabilidad'),
          (6, 'Evidencia documental de actualización de formatos'),
          (7, 'Informes trimestrales institucionales'),
          (8, 'Capturas o registros del sistema'),
          (9, 'Directorio institucional actualizado'),
          (10, 'Documento PDF del directorio'),
          (11, 'Reportes de actualización'),
          (12, 'Evidencia documental de difusión')) as v(orden, nombre)
where e.numero = 1 and p.numero = 8;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Complementar, fortalecer y socializar el uso del formato de registro de servidores públicos sancionados, para la consolidación del sistema tanto en la Plataforma Estatal como Nacional.'),
          (2, 'FEMA', 'Implementar y mantener actualizado un directorio dinámico de los enlaces o puntos de contacto operativos responsables de las diversas áreas institucionales para fortalecer la coordinación interinstitucional.')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 8;

-- Prioridad 9
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 9, 'Consolidar compras públicas transparentes a precios justos que deban de realizarse de manera clara y abierta sin favoritismos ni irregularidades. Evitar el desperdicio de recursos públicos y fomentar que proveedores locales y estatales puedan participar, para fortalecer la economía de la región.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Emisión de certificados'),
          (2, 'Fotografías de eventos'),
          (3, 'Convocatorias'),
          (4, 'Padrones o listados de empresas participantes'),
          (5, 'Constancias de participación'),
          (6, 'Reportes de avance'),
          (7, 'Evidencia documental del proceso de certificación'),
          (8, 'Registros de cámaras empresariales participantes')) as v(orden, nombre)
where e.numero = 1 and p.numero = 9;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Promover el certificado "Proveedor Sí Cumple" con empresas y cámaras empresariales para impulsar códigos de ética, programas de cumplimiento y buenas prácticas anticorrupción.')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 9;

-- Prioridad 10
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 10, 'Implementar un sistema de identificación y análisis de riesgos a los procesos vulnerables a la corrupción para reducir irregularidades.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Actas de sesiones COCODI'),
          (2, 'Reportes trimestrales de seguimiento de riesgos'),
          (3, 'Programa Anual de Capacitación'),
          (4, 'Agendas de riesgos'),
          (5, 'Oficios de invitación'),
          (6, 'Listas de asistencia'),
          (7, 'Reportes de capacitación')) as v(orden, nombre)
where e.numero = 1 and p.numero = 10;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Dar seguimiento trimestral a las actividades de control de los riesgos institucionales mediante las sesiones de los Comités de Control y Desempeño Institucional (COCODI), así como fortalecer las capacidades institucionales mediante capacitación y asesoría en administración de riesgos.'),
          (2, 'FEMA', 'Implementar acciones para la identificación y evaluación de riesgos de corrupción mediante sesiones de trabajo con responsables de área.'),
          (3, 'FEMA', 'Elaborar y mantener actualizada una matriz institucional de riesgos que clasifique los principales riesgos de corrupción conforme a su probabilidad de ocurrencia e impacto institucional.')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 10;

-- Prioridad 11
insert into public.prioridades (eje_id, numero, nombre, plazo)
select id, 11, 'Desarrollar acciones específicas para prevenir atender y sancionar la violencia de género dentro del servicio público, mediante lineamientos, protocolos, mecanismos de denuncia y proceso de sensibilización y capacitación continua, a efectos de garantizar ambientes laborales seguros, equitativos y libres de violencia, fortaleciendo la integridad pública y el respeto a los derechos de las personas servidoras públicas.', 'corto' from public.ejes where numero = 1;
insert into public.fuentes (prioridad_id, orden, nombre)
select p.id, v.orden, v.nombre from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'Programas de capacitación'),
          (2, 'Listas de asistencia'),
          (3, 'Materiales de difusión'),
          (4, 'Evidencia de socialización de protocolos'),
          (5, 'Reportes institucionales'),
          (6, 'Evidencia fotográfica'),
          (7, 'Minutas o reportes de Comités de Ética'),
          (8, 'Registros de participación'),
          (9, 'Informes de auditoría'),
          (10, 'Reportes de fiscalización'),
          (11, 'Evaluaciones institucionales'),
          (12, 'Protocolos aprobados'),
          (13, 'Programas de capacitación'),
          (14, 'Constancias'),
          (15, 'Material de difusión')) as v(orden, nombre)
where e.numero = 1 and p.numero = 11;
insert into public.actividades (prioridad_id, organizacion_id, orden, descripcion)
select p.id, o.id, v.orden, v.descripcion from public.prioridades p join public.ejes e on e.id = p.eje_id,
  (values (1, 'SABG', 'Implementar procesos de sensibilización y socialización de protocolos sobre violencia de género, hostigamiento y acoso laboral o sexual, promoviendo ambientes laborales seguros y libres de violencia desde los Comités de Ética.'),
          (2, 'ISAF', 'Incorporar en los procesos de fiscalización enfoques con perspectiva de género.'),
          (3, 'TJA', 'Elaborar o actualizar protocolos internos para la prevención y atención de la violencia de género, así como implementar acciones de sensibilización y capacitación dirigidas al personal jurisdiccional y administrativo.'),
          (4, 'PJ', 'Elaborar e implementar un protocolo institucional para la prevención, atención y sanción de la violencia de género en el Poder Judicial del Estado de Sonora.')) as v(orden, clave, descripcion)
  join public.organizaciones o on o.clave = v.clave
where e.numero = 1 and p.numero = 11;

-- Periodos: cerrados y sin fecha límite; el admin los abre y fija la fecha.
insert into public.periodos (anio, trimestre)
select a, t from generate_series(2026, 2027) a, generate_series(1, 4) t;
