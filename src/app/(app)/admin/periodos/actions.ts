"use server";

import { revalidatePath } from "next/cache";
import { exigirRol } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import type { EstadoForm } from "@/app/login/actions";

// Las fechas se capturan en hora de Sonora (UTC-7, sin horario de verano).
function aISO(local: string) {
  return local ? new Date(`${local}:00-07:00`).toISOString() : null;
}

export async function guardarPeriodo(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  await exigirRol("admin");
  const id = String(formData.get("id") ?? "");
  const abierto = formData.get("abierto") === "on";
  const fechaLimite = aISO(String(formData.get("fecha_limite") ?? ""));
  if (abierto && !fechaLimite) return { error: "Para abrir la carga pon una fecha límite." };

  const supabase = await createClient();
  const { error } = await supabase.from("periodos").update({ abierto, fecha_limite: fechaLimite }).eq("id", id);
  if (error) return { error: "No se pudo guardar el trimestre." };
  revalidatePath("/", "layout");
  return { ok: "Guardado." };
}

export async function registrarReapertura(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  await exigirRol("admin");
  const periodoId = String(formData.get("periodo_id") ?? "");
  const organizacionId = String(formData.get("organizacion_id") ?? "");
  const autorizadoPor = String(formData.get("autorizado_por") ?? "").trim();
  const justificacion = String(formData.get("justificacion") ?? "").trim();
  const nuevaFecha = aISO(String(formData.get("nueva_fecha_limite") ?? ""));

  if (!periodoId || !organizacionId) return { error: "Elige el trimestre y la organización." };
  if (!autorizadoPor || !justificacion) return { error: "Indica quién autorizó y la justificación." };
  if (!nuevaFecha || new Date(nuevaFecha) <= new Date()) return { error: "La nueva fecha límite debe ser futura." };

  const supabase = await createClient();
  const { error } = await supabase.from("reaperturas").insert({
    periodo_id: periodoId,
    organizacion_id: organizacionId,
    autorizado_por: autorizadoPor,
    justificacion,
    nueva_fecha_limite: nuevaFecha,
  });
  if (error) return { error: "No se pudo registrar la reapertura." };
  revalidatePath("/", "layout");
  return { ok: "Reapertura registrada." };
}
