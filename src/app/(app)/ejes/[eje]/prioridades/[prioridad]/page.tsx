import { notFound } from "next/navigation";
import { Antetitulo, Etiqueta, Migas, Tarjeta, colorEje } from "@/components/ui";
import { obtenerPerfil } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { PLAZO } from "@/lib/semaforo";

type Actividad = {
  id: string;
  orden: number;
  descripcion: string;
  lideres: string | null;
  responsables: string | null;
  organizacion: { id: string; clave: string; nombre: string };
};

export default async function PaginaPrioridad({
  params,
}: {
  params: Promise<{ eje: string; prioridad: string }>;
}) {
  const { eje: e, prioridad: p } = await params;
  const numEje = Number(e);
  const numPrioridad = Number(p);
  if (!Number.isInteger(numEje) || !Number.isInteger(numPrioridad)) notFound();

  const perfil = await obtenerPerfil();
  const esOrg = perfil.rol === "organizacion";
  const supabase = await createClient();

  const { data: prioridad } = await supabase
    .from("prioridades")
    .select(
      "id, numero, nombre, plazo, eje:ejes!inner(numero, nombre), " +
        "fuentes(id, orden, nombre), " +
        "actividades(id, orden, descripcion, lideres, responsables, organizacion:organizaciones(id, clave, nombre))",
    )
    .eq("eje.numero", numEje)
    .eq("numero", numPrioridad)
    .order("orden", { referencedTable: "fuentes" })
    .order("orden", { referencedTable: "actividades" })
    .maybeSingle();
  if (!prioridad) notFound();

  const datos = prioridad as unknown as {
    numero: number;
    nombre: string;
    plazo: string;
    eje: { numero: number; nombre: string };
    fuentes: { id: string; orden: number; nombre: string }[];
    actividades: Actividad[];
  };

  // La organización ve primero sus actividades.
  const actividades = [...datos.actividades].sort((a, b) => {
    const pa = a.organizacion.id === perfil.organizacion_id ? 0 : 1;
    const pb = b.organizacion.id === perfil.organizacion_id ? 0 : 1;
    return pa - pb || a.orden - b.orden;
  });

  return (
    <div className="space-y-6">
      <div>
        <Migas
          items={[
            { href: "/", texto: "Panel" },
            { href: `/ejes/${datos.eje.numero}`, texto: `Eje ${datos.eje.numero}` },
            { texto: `Prioridad ${datos.numero}` },
          ]}
        />
        <Antetitulo color={colorEje(datos.eje.numero).texto}>
          Eje {datos.eje.numero} · Prioridad {datos.numero}
        </Antetitulo>
        <h1 className="text-2xl font-extrabold tracking-tight mt-1">{datos.nombre}</h1>
        <div className="mt-3"><Etiqueta>{PLAZO[datos.plazo]}</Etiqueta></div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Actividades y líneas de acción</h2>
        {actividades.map((a) => {
          const propia = a.organizacion.id === perfil.organizacion_id;
          return (
            <Tarjeta key={a.id} className={propia ? "border-primario/40 ring-1 ring-primario-suave" : ""}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Etiqueta>{a.organizacion.clave}</Etiqueta>
                {propia && <Etiqueta color={{ texto: "var(--primario)", fondo: "var(--primario-suave)" }}>Tu actividad</Etiqueta>}
              </div>
              <p>{a.descripcion}</p>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-texto-suave">Responsable</dt>
                  <dd>{a.organizacion.nombre}</dd>
                </div>
                <div>
                  <dt className="text-texto-suave">Líderes</dt>
                  <dd>{a.lideres ?? "Por definir"}</dd>
                </div>
                {a.responsables && (
                  <div className="sm:col-span-2">
                    <dt className="text-texto-suave">Personas responsables</dt>
                    <dd>{a.responsables}</dd>
                  </div>
                )}
              </dl>
              {esOrg && propia && (
                <p className="mt-4 text-sm text-texto-suave">
                  La carga de evidencias de esta actividad estará disponible en el siguiente módulo.
                </p>
              )}
            </Tarjeta>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Fuentes de información aceptadas</h2>
        <p className="text-sm text-texto-suave">
          Cada entrega necesita evidencias de al menos 3 fuentes distintas de esta lista. Se recomienda PDF.
        </p>
        <Tarjeta>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {datos.fuentes.map((f) => <li key={f.id}>{f.nombre}</li>)}
          </ul>
        </Tarjeta>
      </section>
    </div>
  );
}
