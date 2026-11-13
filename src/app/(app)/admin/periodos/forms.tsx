"use client";

import { useActionState } from "react";
import { Aviso, Boton, Campo, Selector } from "@/components/ui";
import { guardarPeriodo, registrarReapertura } from "./actions";

// ISO → valor de <input type="datetime-local"> en hora de Sonora (UTC-7).
function aLocal(iso: string | null) {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() - 7 * 3600 * 1000).toISOString().slice(0, 16);
}

export function FilaPeriodo({ periodo }: { periodo: { id: string; anio: number; trimestre: number; abierto: boolean; fecha_limite: string | null } }) {
  const [estado, accion, pendiente] = useActionState(guardarPeriodo, undefined);
  return (
    <form action={accion} className="grid gap-3 sm:grid-cols-[8rem_auto_1fr_auto] items-end py-3">
      <input type="hidden" name="id" value={periodo.id} />
      <p className="font-semibold">T{periodo.trimestre} · {periodo.anio}</p>
      <label className="flex items-center gap-2 h-12 text-sm">
        <input type="checkbox" name="abierto" defaultChecked={periodo.abierto} className="size-4 accent-[var(--primario)]" />
        Carga abierta
      </label>
      <Campo etiqueta="Fecha límite (hora de Sonora)" name="fecha_limite" type="datetime-local" defaultValue={aLocal(periodo.fecha_limite)} />
      <Boton type="submit" disabled={pendiente}>Guardar</Boton>
      {(estado?.error || estado?.ok) && (
        <div className="sm:col-span-4">
          <Aviso tipo={estado.error ? "error" : "ok"}>{estado.error ?? estado.ok}</Aviso>
        </div>
      )}
    </form>
  );
}

export function FormReapertura({
  periodos,
  organizaciones,
}: {
  periodos: { id: string; anio: number; trimestre: number }[];
  organizaciones: { id: string; clave: string; nombre: string }[];
}) {
  const [estado, accion, pendiente] = useActionState(registrarReapertura, undefined);
  return (
    <form action={accion} className="grid gap-4 sm:grid-cols-2">
      <Selector etiqueta="Trimestre" name="periodo_id" defaultValue="" required>
        <option value="" disabled>Elige…</option>
        {periodos.map((p) => <option key={p.id} value={p.id}>T{p.trimestre} · {p.anio}</option>)}
      </Selector>
      <Selector etiqueta="Organización" name="organizacion_id" defaultValue="" required>
        <option value="" disabled>Elige…</option>
        {organizaciones.map((o) => <option key={o.id} value={o.id}>{o.clave} · {o.nombre}</option>)}
      </Selector>
      <Campo etiqueta="Autorizado por" name="autorizado_por" placeholder="Nombre de quien autorizó" required />
      <Campo etiqueta="Nueva fecha límite (hora de Sonora)" name="nueva_fecha_limite" type="datetime-local" required />
      <label className="block space-y-1.5 sm:col-span-2">
        <span className="text-[13px] font-semibold text-texto-fuerte">Justificación</span>
        <textarea name="justificacion" required rows={3} className="w-full border border-borde-input rounded-boton p-3 bg-superficie focus:border-primario" />
      </label>
      <div className="sm:col-span-2 space-y-2">
        {estado?.error && <Aviso tipo="error">{estado.error}</Aviso>}
        {estado?.ok && <Aviso tipo="ok">{estado.ok}</Aviso>}
        <Boton type="submit" disabled={pendiente}>Registrar reapertura</Boton>
      </div>
    </form>
  );
}
