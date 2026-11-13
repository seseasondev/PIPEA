import { Antetitulo, Etiqueta, Tarjeta, TarjetaEnlace, colorEje } from "@/components/ui";
import { Semaforo } from "@/components/semaforo";
import { obtenerPerfil } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { formatoFecha, nombrePeriodo, trimestreDeFecha, type Periodo } from "@/lib/periodos";
import { porcentajeTrimestre } from "@/lib/semaforo";

type EjeConConteo = {
  id: string;
  numero: number;
  nombre: string;
  prioridades: { id: string; actividades: { id: string; organizacion_id: string }[] }[];
};

export default async function Panel() {
  const perfil = await obtenerPerfil();
  const supabase = await createClient();
  const esOrg = perfil.rol === "organizacion";
  const hoy = trimestreDeFecha();

  const [{ data: ejes }, { data: periodos }, { data: califs }, { data: orgs }] = await Promise.all([
    supabase
      .from("ejes")
      .select("id, numero, nombre, prioridades(id, actividades(id, organizacion_id))")
      .order("numero"),
    supabase.from("periodos").select("id, anio, trimestre, fecha_limite, abierto").eq("anio", hoy.anio).order("trimestre"),
    supabase.from("calificaciones").select("organizacion_id, periodo_id, nota"),
    supabase.from("organizaciones").select("id, clave, nombre").order("clave"),
  ]);

  const actual = (periodos as Periodo[] | null)?.find((p) => p.trimestre === hoy.trimestre);
  const contar = (e: EjeConConteo, orgId?: string) =>
    e.prioridades.flatMap((p) => p.actividades).filter((a) => !orgId || a.organizacion_id === orgId).length;
  const notaDe = (orgId: string, periodoId: string) =>
    califs?.find((c) => c.organizacion_id === orgId && c.periodo_id === periodoId)?.nota as number | undefined;

  return (
    <div className="space-y-6">
      <div>
        <Antetitulo>{esOrg ? "Mi organización" : "Comité Coordinador"}</Antetitulo>
        <h1 className="text-[28px] font-extrabold tracking-tight">
          {esOrg ? perfil.organizacion?.nombre : "Panel general"}
        </h1>
        <p className="text-texto-suave text-sm">
          {actual ? nombrePeriodo(actual) : `Trimestre ${hoy.trimestre} · ${hoy.anio}`}
          {actual?.abierto
            ? actual.fecha_limite
              ? ` · Carga abierta hasta el ${formatoFecha(actual.fecha_limite)}`
              : " · Carga abierta"
            : " · Carga cerrada"}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Calificaciones {hoy.anio}</h2>
        <Tarjeta className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-borde">
                <th className="p-3">Organización</th>
                {(periodos as Periodo[] | null)?.map((p) => (
                  <th key={p.id} className="p-3">T{p.trimestre}</th>
                ))}
                <th className="p-3">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {(orgs ?? [])
                .filter((o) => !esOrg || o.id === perfil.organizacion_id)
                .map((o) => {
                  const notas = (periodos as Periodo[] | null)?.map((p) => notaDe(o.id, p.id)) ?? [];
                  const total = notas.reduce<number>((a, n) => a + (n ?? 0), 0);
                  const calificados = notas.filter((n) => n !== undefined).length;
                  return (
                    <tr key={o.id} className="border-b border-borde last:border-0">
                      <td className="p-3" title={o.nombre}>{esOrg ? o.nombre : o.clave}</td>
                      {notas.map((n, i) => (
                        <td key={i} className="p-3">
                          {n === undefined ? <span className="text-texto-suave">—</span> : (
                            <span className="space-x-2">
                              <span>{n} / 25</span>
                              <Semaforo porcentaje={porcentajeTrimestre(n)} />
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="p-3">
                        {calificados ? <span>{total} / 100</span> : <span className="text-texto-suave">—</span>}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Tarjeta>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Ejes</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(ejes as EjeConConteo[] | null)?.map((e) => {
            const n = contar(e, esOrg ? perfil.organizacion_id! : undefined);
            return (
              <TarjetaEnlace key={e.id} href={`/ejes/${e.numero}`} className="h-full border-l-4" estilo={{ borderLeftColor: colorEje(e.numero).texto }}>
                <Antetitulo color={colorEje(e.numero).texto}>Eje {e.numero}</Antetitulo>
                <p className="font-semibold mt-1">{e.nombre}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Etiqueta color={colorEje(e.numero)}>{e.prioridades.length} prioridades</Etiqueta>
                  <Etiqueta>{n} {esOrg ? "actividades tuyas" : "actividades"}</Etiqueta>
                </div>
              </TarjetaEnlace>
            );
          })}
        </div>
      </section>
    </div>
  );
}
