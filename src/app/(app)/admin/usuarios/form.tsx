"use client";

import { useActionState, useState } from "react";
import { Aviso, Boton, Campo, Selector } from "@/components/ui";
import { crearUsuario } from "./actions";

export function FormNuevoUsuario({ organizaciones }: { organizaciones: { id: string; clave: string; nombre: string }[] }) {
  const [estado, accion, pendiente] = useActionState(crearUsuario, undefined);
  const [rol, setRol] = useState("organizacion");
  return (
    <form action={accion} className="grid gap-4 sm:grid-cols-2">
      <Campo etiqueta="Nombre" name="nombre" required />
      <Campo etiqueta="Correo institucional" name="correo" type="email" required />
      <Selector etiqueta="Rol" name="rol" value={rol} onChange={(e) => setRol(e.target.value)}>
        <option value="organizacion">Organización</option>
        <option value="evaluador">Evaluador</option>
        <option value="admin">Administración</option>
      </Selector>
      {rol === "organizacion" ? (
        <Selector etiqueta="Organización" name="organizacion_id" required defaultValue="">
          <option value="" disabled>Elige…</option>
          {organizaciones.map((o) => <option key={o.id} value={o.id}>{o.clave} · {o.nombre}</option>)}
        </Selector>
      ) : <div />}
      <Campo etiqueta="Contraseña temporal" name="contrasena" type="text" minLength={10} required autoComplete="off" />
      <div className="sm:col-span-2 space-y-2">
        {estado?.error && <Aviso tipo="error">{estado.error}</Aviso>}
        {estado?.ok && <Aviso tipo="ok">{estado.ok}</Aviso>}
        <Boton type="submit" disabled={pendiente}>{pendiente ? "Creando…" : "Crear cuenta"}</Boton>
      </div>
    </form>
  );
}
