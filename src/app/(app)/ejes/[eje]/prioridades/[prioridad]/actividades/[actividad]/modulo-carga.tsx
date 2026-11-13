"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Aviso, Boton, Tarjeta } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export type EvidenciaVista = {
  id: string;
  fuente_id: string;
  ruta_archivo: string;
  nombre_archivo: string;
  tamano_bytes: number | null;
  url: string | null;
};

type Props = {
  editable: boolean;
  actividadId: string;
  organizacionId: string;
  periodoId: string;
  entrega: { id: string; narrativa: string | null; estado: "borrador" | "en_revision" } | null;
  evidencias: EvidenciaVista[];
  fuentes: { id: string; nombre: string }[];
};

const MINIMO_FUENTES = 3;
const MAX_BYTES = 20 * 1024 * 1024;

function tamano(bytes: number | null) {
  if (!bytes) return "";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

export function ModuloCarga({ editable, actividadId, organizacionId, periodoId, entrega, evidencias, fuentes }: Props) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [narrativa, setNarrativa] = useState(entrega?.narrativa ?? "");
  const entregaId = useRef(entrega?.id ?? null);

  const fuentesConEvidencia = new Set(evidencias.map((x) => x.fuente_id));
  const listoParaEnviar = fuentesConEvidencia.size >= MINIMO_FUENTES;

  const refrescar = () => startTransition(() => router.refresh());

  async function asegurarEntrega(): Promise<string> {
    if (entregaId.current) return entregaId.current;
    const { data, error } = await supabase
      .from("entregas")
      .insert({ actividad_id: actividadId, periodo_id: periodoId, organizacion_id: organizacionId })
      .select("id")
      .single();
    if (error) throw new Error("No se pudo crear la entrega. Revisa que la carga siga abierta.");
    entregaId.current = data.id;
    return data.id;
  }

  async function subir(fuenteId: string, archivos: FileList | null) {
    if (!archivos?.length) return;
    setError(null);
    setMensaje(null);
    setOcupado(fuenteId);
    try {
      const id = await asegurarEntrega();
      for (const archivo of Array.from(archivos)) {
        if (archivo.type !== "application/pdf") throw new Error(`«${archivo.name}» no es PDF.`);
        if (archivo.size > MAX_BYTES) throw new Error(`«${archivo.name}» pesa más de 20 MB.`);
        const ruta = `${organizacionId}/${periodoId}/${actividadId}/${crypto.randomUUID()}.pdf`;
        const subida = await supabase.storage
          .from("evidencias")
          .upload(ruta, archivo, { contentType: "application/pdf", upsert: false });
        if (subida.error) throw new Error(`No se pudo subir «${archivo.name}».`);
        const { error } = await supabase.from("evidencias").insert({
          entrega_id: id,
          fuente_id: fuenteId,
          ruta_archivo: ruta,
          nombre_archivo: archivo.name,
          tamano_bytes: archivo.size,
        });
        if (error) {
          await supabase.storage.from("evidencias").remove([ruta]);
          throw new Error(`No se pudo registrar «${archivo.name}».`);
        }
      }
      setMensaje("Archivo cargado.");
      refrescar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(null);
    }
  }

  async function quitar(ev: EvidenciaVista) {
    if (!confirm(`¿Quitar «${ev.nombre_archivo}»?`)) return;
    setError(null);
    setOcupado(ev.id);
    const { error } = await supabase.from("evidencias").delete().eq("id", ev.id);
    if (error) setError("No se pudo quitar el archivo.");
    else await supabase.storage.from("evidencias").remove([ev.ruta_archivo]);
    setOcupado(null);
    refrescar();
  }

  async function guardarNarrativa() {
    setError(null);
    setMensaje(null);
    setOcupado("narrativa");
    try {
      const id = await asegurarEntrega();
      const { error } = await supabase.from("entregas").update({ narrativa: narrativa.trim() || null }).eq("id", id);
      if (error) throw new Error("No se pudo guardar la narrativa.");
      setMensaje("Narrativa guardada.");
      refrescar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(null);
    }
  }

  async function enviar() {
    if (!entregaId.current) return;
    setError(null);
    setMensaje(null);
    setOcupado("enviar");
    const { error } = await supabase
      .from("entregas")
      .update({ estado: "en_revision", narrativa: narrativa.trim() || null })
      .eq("id", entregaId.current);
    setOcupado(null);
    if (error) setError(error.message.includes("3 fuentes") ? error.message : "No se pudo enviar la entrega.");
    else {
      setMensaje("Entrega enviada a revisión. Puedes seguir agregando archivos hasta la fecha límite.");
      refrescar();
    }
  }

  return (
    <div className="space-y-4">
      <Tarjeta className="space-y-2">
        <h2 className="text-lg font-semibold">Evidencias por fuente de información</h2>
        <p className="text-sm text-texto-suave">
          Se necesitan archivos de al menos {MINIMO_FUENTES} fuentes distintas. Solo PDF, hasta 20 MB cada uno.{" "}
          <strong className="text-texto">
            {fuentesConEvidencia.size} de {MINIMO_FUENTES} fuentes
          </strong>
        </p>
        <ul className="divide-y divide-divisor">
          {fuentes.map((f) => {
            const archivos = evidencias.filter((x) => x.fuente_id === f.id);
            return (
              <li key={f.id} className="py-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">
                    {archivos.length > 0 && <span className="text-verde mr-1" aria-label="con evidencia">✓</span>}
                    {f.nombre}
                  </span>
                  {editable && (
                    <label className="text-sm font-semibold text-primario hover:text-primario-hover cursor-pointer">
                      {ocupado === f.id ? "Subiendo…" : "Agregar PDF"}
                      <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        className="sr-only"
                        disabled={ocupado !== null}
                        onChange={(e) => {
                          subir(f.id, e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
                {archivos.length > 0 && (
                  <ul className="space-y-1">
                    {archivos.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center gap-3 text-sm bg-fondo rounded-sm px-3 py-2">
                        {a.url ? (
                          <a href={a.url} target="_blank" rel="noreferrer" className="text-primario hover:underline break-all">
                            {a.nombre_archivo}
                          </a>
                        ) : (
                          <span className="break-all">{a.nombre_archivo}</span>
                        )}
                        <span className="text-texto-tenue">{tamano(a.tamano_bytes)}</span>
                        {editable && (
                          <button
                            type="button"
                            onClick={() => quitar(a)}
                            disabled={ocupado !== null}
                            className="ml-auto text-peligro hover:underline"
                          >
                            Quitar
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <h2 className="text-lg font-semibold">Narrativa del avance</h2>
        {editable ? (
          <>
            <p className="text-sm text-texto-suave">
              Describe lo que se hizo en el trimestre. Si no hubo avance, explícalo aquí.
            </p>
            <textarea
              value={narrativa}
              onChange={(e) => setNarrativa(e.target.value)}
              rows={6}
              maxLength={10000}
              className="w-full border border-borde-input rounded-boton p-3 bg-superficie focus:border-primario"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={guardarNarrativa}
                disabled={ocupado !== null}
                className="h-11 px-5 rounded-boton border border-borde-input font-semibold hover:border-primario disabled:opacity-60"
              >
                {ocupado === "narrativa" ? "Guardando…" : "Guardar narrativa"}
              </button>
              {entrega?.estado !== "en_revision" && (
                <Boton type="button" onClick={enviar} disabled={!listoParaEnviar || ocupado !== null}>
                  {ocupado === "enviar" ? "Enviando…" : "Enviar a revisión"}
                </Boton>
              )}
            </div>
            {!listoParaEnviar && entrega?.estado !== "en_revision" && (
              <Aviso>Para enviar faltan evidencias de {MINIMO_FUENTES - fuentesConEvidencia.size} fuente(s) más.</Aviso>
            )}
          </>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{entrega?.narrativa || <span className="text-texto-suave">Sin narrativa.</span>}</p>
        )}
        {error && <Aviso tipo="error">{error}</Aviso>}
        {mensaje && <Aviso tipo="ok">{mensaje}</Aviso>}
      </Tarjeta>
    </div>
  );
}
