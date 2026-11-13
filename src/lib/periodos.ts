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
