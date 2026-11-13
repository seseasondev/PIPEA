"use server";

import { revalidatePath } from "next/cache";
import { exigirRol, type Rol } from "@/lib/sesion";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EstadoForm } from "@/app/login/actions";

const ROLES: Rol[] = ["admin", "evaluador", "organizacion"];

export async function crearUsuario(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  await exigirRol("admin");

  const correo = String(formData.get("correo") ?? "").trim().toLowerCase();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const rol = String(formData.get("rol") ?? "") as Rol;
  const organizacionId = String(formData.get("organizacion_id") ?? "") || null;
  const contrasena = String(formData.get("contrasena") ?? "");

  if (!correo || !nombre) return { error: "Escribe el nombre y el correo." };
  if (!ROLES.includes(rol)) return { error: "Elige un rol." };
  if (rol === "organizacion" && !organizacionId) return { error: "Elige la organización." };
  if (contrasena.length < 10) return { error: "La contraseña temporal debe tener al menos 10 caracteres." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: correo,
    password: contrasena,
    email_confirm: true,
    user_metadata: { nombre },
    // app_metadata solo lo puede escribir el servidor; el trigger crea el perfil con esto.
    app_metadata: { rol, organizacion_id: rol === "organizacion" ? organizacionId : null },
  });
  if (error) {
    return {
      error: /already|registered|exists/i.test(error.message)
        ? "Ya existe una cuenta con ese correo."
        : `No se pudo crear la cuenta: ${error.message}`,
    };
  }

  revalidatePath("/admin/usuarios");
  return { ok: `Cuenta creada para ${correo}. Comparte la contraseña temporal por un canal seguro.` };
}

export async function cambiarActivo(formData: FormData) {
  await exigirRol("admin");
  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "true";
  const admin = createAdminClient();
  await admin.from("perfiles").update({ activo }).eq("id", id);
  // Desactivar también bloquea el inicio de sesión.
  await admin.auth.admin.updateUserById(id, { ban_duration: activo ? "none" : "876000h" });
  revalidatePath("/admin/usuarios");
}
