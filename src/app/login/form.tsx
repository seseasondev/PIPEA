"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Aviso, Boton, Campo } from "@/components/ui";
import { iniciarSesion } from "./actions";

export function FormLogin() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, undefined);
  return (
    <form action={accion} className="space-y-4">
      <Campo etiqueta="Correo institucional" name="correo" type="email" autoComplete="email" required />
      <Campo etiqueta="Contraseña" name="contrasena" type="password" autoComplete="current-password" required />
      {estado?.error && <Aviso tipo="error">{estado.error}</Aviso>}
      <Boton type="submit" disabled={pendiente} className="w-full">
        {pendiente ? "Entrando…" : "Entrar"}
      </Boton>
      <p className="text-sm text-center">
        <Link href="/recuperar" className="font-semibold text-primario hover:text-primario-hover">¿Olvidaste tu contraseña?</Link>
      </p>
    </form>
  );
}
