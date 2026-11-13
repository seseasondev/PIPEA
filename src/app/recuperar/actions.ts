"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { EstadoForm } from "@/app/login/actions";

async function urlSitio() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function solicitarRecuperacion(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const correo = String(formData.get("correo") ?? "").trim().toLowerCase();
  if (!correo) return { error: "Escribe tu correo." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(correo, {
    redirectTo: `${await urlSitio()}/auth/confirm?next=/cambiar-contrasena`,
  });
  // Mismo mensaje exista o no la cuenta, para no revelar qué correos están registrados.
  return { ok: "Si el correo tiene cuenta, te llegará un enlace para crear una contraseña nueva." };
}
