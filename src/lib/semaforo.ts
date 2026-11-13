// Semáforo: verde 70–100 %, amarillo 40–70 %, rojo 0–40 %.
// Supuesto: 70 exacto es verde y 40 exacto es amarillo.
export type ColorSemaforo = "verde" | "amarillo" | "rojo";

export function semaforo(porcentaje: number): ColorSemaforo {
  if (porcentaje >= 70) return "verde";
  if (porcentaje >= 40) return "amarillo";
  return "rojo";
}

// Cada trimestre vale 25 puntos; la suma de los 4 da el 100 %.
export function porcentajeAnual(notas: number[]): number {
  return Math.min(100, notas.reduce((a, b) => a + b, 0));
}

export const PLAZO: Record<string, string> = {
  corto: "Corto plazo (1–3 años)",
  mediano: "Mediano plazo (3–6 años)",
  largo: "Largo plazo (6+ años)",
};

export function porcentajeTrimestre(nota: number): number {
  return (nota / 25) * 100;
}
