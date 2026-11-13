"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { error?: string; ok?: string } | undefined;

export async function iniciarSesion(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const correo = String(formData.get("correo") ?? "").trim().toLowerCase();
  const contrasena = String(formData.get("contrasena") ?? "");
  if (!correo || !contrasena) return { error: "Escribe tu correo y tu contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) return { error: "Correo o contraseña incorrectos." };
  redirect("/");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
