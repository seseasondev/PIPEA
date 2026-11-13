"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Aviso, Boton, Campo, Tarjeta } from "@/components/ui";
import { solicitarRecuperacion } from "./actions";

export default function PaginaRecuperar() {
  const [estado, accion, pendiente] = useActionState(solicitarRecuperacion, undefined);
  return (
    <main className="min-h-screen grid place-items-center p-4">
      <Tarjeta className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
        <form action={accion} className="space-y-4">
          <Campo etiqueta="Correo institucional" name="correo" type="email" autoComplete="email" required />
          {estado?.error && <Aviso tipo="error">{estado.error}</Aviso>}
          {estado?.ok && <Aviso tipo="ok">{estado.ok}</Aviso>}
          <Boton type="submit" disabled={pendiente} className="w-full">Enviar enlace</Boton>
        </form>
        <p className="text-sm"><Link href="/login" className="underline">Volver a iniciar sesión</Link></p>
      </Tarjeta>
    </main>
  );
}
