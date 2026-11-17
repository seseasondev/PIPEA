"use client";

import { useState } from "react";
import { asignarRol } from "./actions";

export function FormRol({
  id,
  rol,
  organizacionId,
  organizaciones,
}: {
  id: string;
  rol: string | null;
  organizacionId: string | null;
  organizaciones: { id: string; clave: string }[];
}) {
  const [nuevoRol, setNuevoRol] = useState(rol ?? "");
  return (
    <form action={asignarRol} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="rol"
        value={nuevoRol}
        onChange={(e) => setNuevoRol(e.target.value)}
        className="h-9 border border-borde-input rounded-sm px-2 bg-superficie"
        aria-label="Rol"
      >
        <option value="" disabled>Sin rol</option>
        <option value="organizacion">Organización</option>
        <option value="evaluador">Evaluación</option>
        <option value="admin">Administración</option>
      </select>
      {nuevoRol === "organizacion" && (
        <select
          name="organizacion_id"
          defaultValue={organizacionId ?? ""}
          className="h-9 border border-borde-input rounded-sm px-2 bg-superficie"
          aria-label="Organización"
          required
        >
          <option value="" disabled>Organización…</option>
          {organizaciones.map((o) => <option key={o.id} value={o.id}>{o.clave}</option>)}
        </select>
      )}
      <button type="submit" className="font-semibold text-primario hover:text-primario-hover">Guardar</button>
    </form>
  );
}
