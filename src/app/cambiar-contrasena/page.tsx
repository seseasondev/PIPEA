"use client";

import { useActionState } from "react";
import { Aviso, Boton, Campo, Tarjeta } from "@/components/ui";
import { cambiarContrasena } from "./actions";

export default function PaginaCambiarContrasena() {
  const [estado, accion, pendiente] = useActionState(cambiarContrasena, undefined);
  return (
    <main className="min-h-screen grid place-items-center p-4">
      <Tarjeta className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Nueva contraseña</h1>
        <form action={accion} className="space-y-4">
          <Campo etiqueta="Contraseña nueva" name="nueva" type="password" autoComplete="new-password" minLength={10} required />
          <Campo etiqueta="Confirma la contraseña" name="confirmar" type="password" autoComplete="new-password" minLength={10} required />
          {estado?.error && <Aviso tipo="error">{estado.error}</Aviso>}
          <Boton type="submit" disabled={pendiente} className="w-full">Guardar</Boton>
        </form>
      </Tarjeta>
    </main>
  );
}
