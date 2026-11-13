"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EstadoForm } from "@/app/login/actions";

export async function cambiarContrasena(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const nueva = String(formData.get("nueva") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");
  if (nueva.length < 10) return { error: "La contraseña debe tener al menos 10 caracteres." };
  if (nueva !== confirmar) return { error: "Las contraseñas no coinciden." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) return { error: "No se pudo cambiar la contraseña. Pide un enlace nuevo e inténtalo otra vez." };
  redirect("/");
}
