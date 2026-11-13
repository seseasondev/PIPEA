import { semaforo, type ColorSemaforo } from "@/lib/semaforo";

const CLASE: Record<ColorSemaforo, string> = {
  verde: "bg-verde",
  amarillo: "bg-amarillo",
  rojo: "bg-rojo",
};
const TEXTO: Record<ColorSemaforo, string> = {
  verde: "Avance conforme a lo programado",
  amarillo: "Con desviaciones, requiere seguimiento",
  rojo: "Rezago o riesgo de incumplimiento",
};

export function Semaforo({ porcentaje }: { porcentaje: number }) {
  const color = semaforo(porcentaje);
  return (
    <span className="inline-flex items-center gap-2 text-sm" title={TEXTO[color]}>
      <span className={`inline-block size-3 rounded-full ${CLASE[color]}`} aria-hidden />
      <span>{Math.round(porcentaje)} %</span>
      <span className="sr-only">{TEXTO[color]}</span>
    </span>
  );
}
