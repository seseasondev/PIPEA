import Link from "next/link";
import { notFound } from "next/navigation";
import { Antetitulo, Etiqueta, Migas, Tarjeta, colorEje } from "@/components/ui";
import { obtenerPerfil } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { cargaAbierta, formatoFecha, nombrePeriodo, trimestreDeFecha, type Periodo, type Reapertura } from "@/lib/periodos";
import { ModuloCarga, type EvidenciaVista } from "./modulo-carga";

type Entrega = {
  id: string;
  periodo_id: string;
  narrativa: string | null;
  estado: "borrador" | "en_revision";
  enviado_en: string | null;
  evidencias: { id: string; fuente_id: string; ruta_archivo: string; nombre_archivo: string; tamano_bytes: number | null; creado_en: string }[];
};

export default async function PaginaActividad({
  params,
  searchParams,
}: {
  params: Promise<{ eje: string; prioridad: string; actividad: string }>;
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { eje: e, prioridad: p, actividad: actividadId } = await params;
  const { periodo: periodoParam } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(actividadId)) notFound();

  const perfil = await obtenerPerfil();
  const supabase = await createClient();

  const [{ data: act }, { data: periodosData }, { data: reaperturasData }, { data: entregasData }] = await Promise.all([
    supabase
      .from("actividades")
      .select(
        "id, descripcion, lideres, responsables, organizacion:organizaciones(id, clave, nombre), " +
          "prioridad:prioridades!inner(id, numero, nombre, eje:ejes!inner(numero), fuentes(id, orden, nombre))",
      )
      .eq("id", actividadId)
      .maybeSingle(),
    supabase.from("periodos").select("id, anio, trimestre, fecha_limite, abierto").order("anio").order("trimestre"),
    supabase.from("reaperturas").select("periodo_id, organizacion_id, nueva_fecha_limite, justificacion"),
    supabase
      .from("entregas")
      .select("id, periodo_id, narrativa, estado, enviado_en, evidencias(id, fuente_id, ruta_archivo, nombre_archivo, tamano_bytes, creado_en)")
      .eq("actividad_id", actividadId),
  ]);
  if (!act) notFound();

  const actividad = act as unknown as {
    id: string;
    descripcion: string;
    lideres: string | null;
    responsables: string | null;
    organizacion: { id: string; clave: string; nombre: string };
    prioridad: { id: string; numero: number; nombre: string; eje: { numero: number }; fuentes: { id: string; orden: number; nombre: string }[] };
  };
  if (String(actividad.prioridad.eje.numero) !== e || String(actividad.prioridad.numero) !== p) notFound();

  const periodos = (periodosData ?? []) as Periodo[];
  const reaperturas = (reaperturasData ?? []) as Reapertura[];
  const entregas = (entregasData ?? []) as unknown as Entrega[];
  const fuentes = [...actividad.prioridad.fuentes].sort((a, b) => a.orden - b.orden);
  const esPropia = perfil.rol === "organizacion" && actividad.organizacion.id === perfil.organizacion_id;
  const esStaff = perfil.rol === "admin" || perfil.rol === "evaluador";

  // Periodo a mostrar: el elegido; si no, el último con carga abierta; si no, el trimestre actual.
  const hoy = trimestreDeFecha();
  const abiertos = periodos.filter((x) => cargaAbierta(x, reaperturas, actividad.organizacion.id).abierta);
  const periodo =
    periodos.find((x) => x.id === periodoParam) ??
    abiertos.at(-1) ??
    periodos.find((x) => x.anio === hoy.anio && x.trimestre === hoy.trimestre) ??
    periodos.at(-1);
  if (!periodo) notFound();

  const estadoCarga = cargaAbierta(periodo, reaperturas, actividad.organizacion.id);
  const entrega = entregas.find((x) => x.periodo_id === periodo.id) ?? null;

  // Enlaces firmados (10 min) para ver los PDF; el bucket es privado.
  let evidencias: EvidenciaVista[] = [];
  if (entrega?.evidencias.length) {
    const { data: firmadas } = await supabase.storage
      .from("evidencias")
      .createSignedUrls(entrega.evidencias.map((x) => x.ruta_archivo), 600);
    evidencias = entrega.evidencias.map((x) => ({
      ...x,
      url: firmadas?.find((f) => f.path === x.ruta_archivo)?.signedUrl ?? null,
    }));
  }

  const base = `/ejes/${e}/prioridades/${p}/actividades/${actividad.id}`;
  const color = colorEje(actividad.prioridad.eje.numero);

  return (
    <div className="space-y-6">
      <div>
        <Migas
          items={[
            { href: "/", texto: "Panel" },
            { href: `/ejes/${e}`, texto: `Eje ${e}` },
            { href: `/ejes/${e}/prioridades/${p}`, texto: `Prioridad ${p}` },
            { texto: "Actividad" },
          ]}
        />
        <Antetitulo color={color.texto}>
          Eje {e} · Prioridad {p} · {actividad.organizacion.clave}
        </Antetitulo>
        <h1 className="text-2xl font-extrabold tracking-tight mt-1">{actividad.descripcion}</h1>
        <dl className="mt-3 grid gap-2 sm:grid-cols-3 text-sm">
          <div><dt className="text-texto-suave">Organización</dt><dd>{actividad.organizacion.nombre}</dd></div>
          <div><dt className="text-texto-suave">Líderes</dt><dd>{actividad.lideres ?? "Por definir"}</dd></div>
          <div><dt className="text-texto-suave">Personas responsables</dt><dd>{actividad.responsables ?? "Por definir"}</dd></div>
        </dl>
      </div>

      <nav aria-label="Trimestre" className="flex flex-wrap gap-2">
        {periodos.map((x) => (
          <Link
            key={x.id}
            href={`${base}?periodo=${x.id}`}
            className={`text-sm rounded-pastilla px-3 py-1.5 border ${
              x.id === periodo.id ? "bg-primario text-primario-texto border-primario" : "bg-superficie border-borde hover:border-primario"
            }`}
          >
            T{x.trimestre} {x.anio}
          </Link>
        ))}
      </nav>

      <Tarjeta className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{nombrePeriodo(periodo)}</h2>
          <Etiqueta color={estadoCarga.abierta ? { texto: "var(--verde)", fondo: "#e8f5ee" } : undefined}>
            {estadoCarga.abierta ? "Carga abierta" : "Carga cerrada"}
          </Etiqueta>
          {entrega && (
            <Etiqueta color={entrega.estado === "en_revision" ? { texto: "var(--primario)", fondo: "var(--primario-suave)" } : undefined}>
              {entrega.estado === "en_revision" ? "En revisión" : "Borrador"}
            </Etiqueta>
          )}
        </div>
        {estadoCarga.abierta && estadoCarga.limite && (
          <p className="text-sm text-texto-suave">Fecha límite: {formatoFecha(estadoCarga.limite)}</p>
        )}
        {estadoCarga.reapertura && (
          <p className="text-sm text-texto-suave">Reabierto: {estadoCarga.reapertura.justificacion}</p>
        )}
        {entrega?.enviado_en && (
          <p className="text-sm text-texto-suave">Enviado el {formatoFecha(entrega.enviado_en)}</p>
        )}
      </Tarjeta>

      {esPropia || esStaff ? (
        <ModuloCarga
          editable={esPropia && estadoCarga.abierta}
          actividadId={actividad.id}
          organizacionId={actividad.organizacion.id}
          periodoId={periodo.id}
          entrega={entrega ? { id: entrega.id, narrativa: entrega.narrativa, estado: entrega.estado } : null}
          evidencias={evidencias}
          fuentes={fuentes}
        />
      ) : (
        <Tarjeta>
          <p className="text-sm text-texto-suave">Esta actividad es de otra organización; solo ella puede ver y cargar sus evidencias.</p>
        </Tarjeta>
      )}
    </div>
  );
}
