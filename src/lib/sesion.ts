import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Rol = "admin" | "evaluador" | "organizacion";

export type Perfil = {
  id: string;
  correo: string;
  nombre: string | null;
  rol: Rol | null;
  organizacion_id: string | null;
  activo: boolean;
  organizacion: { clave: string; nombre: string } | null;
};

// Perfil del usuario actual (una vez por petición). Sin sesión, a /login.
export const obtenerPerfil = cache(async (): Promise<Perfil> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) redirect("/login");

  const { data } = await supabase
    .from("perfiles")
    .select("id, correo, nombre, rol, organizacion_id, activo, organizacion:organizaciones(clave, nombre)")
    .eq("id", uid)
    .maybeSingle();

  if (!data) redirect("/sin-acceso");
  return data as unknown as Perfil;
});

export async function exigirRol(...roles: Rol[]) {
  const perfil = await obtenerPerfil();
  if (!perfil.activo || !perfil.rol || !roles.includes(perfil.rol)) redirect("/sin-acceso");
  return perfil;
}

export const NOMBRE_ROL: Record<Rol, string> = {
  admin: "Administración",
  evaluador: "Evaluación",
  organizacion: "Organización",
};
