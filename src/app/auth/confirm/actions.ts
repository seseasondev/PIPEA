"use server";

import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TIPOS: EmailOtpType[] = ["recovery", "invite", "email", "signup", "magiclink", "email_change"];

function destinoSeguro(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

// Se verifica al pulsar el botón (POST), no al abrir el enlace: así los
// antivirus de correo que "visitan" los enlaces no gastan el token de un solo uso.
export async function confirmarEnlace(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const tipo = String(formData.get("type") ?? "") as EmailOtpType;
  const code = String(formData.get("code") ?? "");
  const destino = destinoSeguro(String(formData.get("next") ?? "") || (tipo === "recovery" ? "/cambiar-contrasena" : null));

  const supabase = await createClient();
  let ok = false;
  if (tokenHash && TIPOS.includes(tipo)) {
    ok = !(await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }
  redirect(ok ? destino : "/login?error=enlace");
}
