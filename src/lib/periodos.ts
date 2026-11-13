export type Periodo = {
  id: string;
  anio: number;
  trimestre: number;
  fecha_limite: string | null;
  abierto: boolean;
};

export function trimestreDeFecha(fecha = new Date()) {
  return { anio: fecha.getFullYear(), trimestre: Math.floor(fecha.getMonth() / 3) + 1 };
}

export function nombrePeriodo(p: Pick<Periodo, "anio" | "trimestre">) {
  return `Trimestre ${p.trimestre} · ${p.anio}`;
}

export function formatoFecha(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Hermosillo",
  }).format(new Date(iso));
}

export type Reapertura = {
  periodo_id: string;
  organizacion_id: string;
  nueva_fecha_limite: string;
  justificacion: string;
};

// Misma regla que privado.puede_cargar en la BD (la BD es la que decide;
// esto solo sirve para mostrar el estado en pantalla).
export function cargaAbierta(p: Periodo, reaperturas: Reapertura[], organizacionId: string | null, ahora = new Date()) {
  const enPlazo = p.abierto && (!p.fecha_limite || new Date(p.fecha_limite) >= ahora);
  const reapertura = reaperturas.find(
    (r) => r.periodo_id === p.id && r.organizacion_id === organizacionId && new Date(r.nueva_fecha_limite) >= ahora,
  );
  return { abierta: enPlazo || Boolean(reapertura), limite: reapertura?.nueva_fecha_limite ?? p.fecha_limite, reapertura };
}
