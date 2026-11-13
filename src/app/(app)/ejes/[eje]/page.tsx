import { notFound } from "next/navigation";
import { Antetitulo, Etiqueta, Migas, Tarjeta, TarjetaEnlace, colorEje } from "@/components/ui";
import { obtenerPerfil } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { PLAZO } from "@/lib/semaforo";

type Prioridad = {
  id: string;
  numero: number;
  nombre: string;
  plazo: string;
  actividades: { id: string; organizacion: { id: string; clave: string } }[];
};

export default async function PaginaEje({ params }: { params: Promise<{ eje: string }> }) {
  const { eje: ejeParam } = await params;
  const numero = Number(ejeParam);
  if (!Number.isInteger(numero)) notFound();

  const perfil = await obtenerPerfil();
  const esOrg = perfil.rol === "organizacion";
  const supabase = await createClient();
  const { data: eje } = await supabase
    .from("ejes")
    .select("id, numero, nombre, prioridades(id, numero, nombre, plazo, actividades(id, organizacion:organizaciones(id, clave)))")
    .eq("numero", numero)
    .order("numero", { referencedTable: "prioridades" })
    .maybeSingle();
  if (!eje) notFound();

  const prioridades = eje.prioridades as unknown as Prioridad[];

  return (
    <div>
      <Migas items={[{ href: "/", texto: "Panel" }, { texto: `Eje ${eje.numero}` }]} />
      <Antetitulo color={colorEje(eje.numero).texto}>Eje {eje.numero}</Antetitulo>
      <h1 className="text-[28px] font-extrabold tracking-tight mb-6">{eje.nombre}</h1>

      {prioridades.length === 0 ? (
        <Tarjeta><p className="text-texto-suave">Este eje todavía no tiene prioridades cargadas.</p></Tarjeta>
      ) : (
        <ol className="space-y-3">
          {prioridades.map((p) => {
            const propias = p.actividades.filter((a) => a.organizacion.id === perfil.organizacion_id).length;
            const claves = [...new Set(p.actividades.map((a) => a.organizacion.clave))];
            return (
              <li key={p.id}>
                <TarjetaEnlace
                  href={`/ejes/${eje.numero}/prioridades/${p.numero}`}
                  className={esOrg && !propias ? "opacity-70" : ""}
                >
                    <p className="text-xs text-texto-suave">Prioridad {p.numero} · {PLAZO[p.plazo]}</p>
                    <p className="font-semibold mt-1">{p.nombre}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {esOrg ? (
                        <Etiqueta color={propias ? colorEje(eje.numero) : undefined}>{propias ? `${propias} actividades tuyas` : "Sin actividades tuyas"}</Etiqueta>
                      ) : (
                        <Etiqueta>{p.actividades.length} actividades</Etiqueta>
                      )}
                      {claves.map((c) => <Etiqueta key={c}>{c}</Etiqueta>)}
                    </div>
                </TarjetaEnlace>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
