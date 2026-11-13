import { Migas, Tarjeta } from "@/components/ui";
import { exigirRol } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { formatoFecha } from "@/lib/periodos";
import { FilaPeriodo, FormReapertura } from "./forms";

export default async function PaginaPeriodos() {
  await exigirRol("admin");
  const supabase = await createClient();
  const [{ data: periodos }, { data: orgs }, { data: reaperturas }] = await Promise.all([
    supabase.from("periodos").select("id, anio, trimestre, abierto, fecha_limite").order("anio").order("trimestre"),
    supabase.from("organizaciones").select("id, clave, nombre").order("clave"),
    supabase
      .from("reaperturas")
      .select("id, justificacion, autorizado_por, nueva_fecha_limite, creado_en, periodo:periodos(anio, trimestre), organizacion:organizaciones(clave)")
      .order("creado_en", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <Migas items={[{ href: "/", texto: "Panel" }, { texto: "Trimestres" }]} />
      <h1 className="text-2xl font-extrabold tracking-tight">Trimestres y fechas límite</h1>

      <Tarjeta>
        <h2 className="font-semibold">Carga por trimestre</h2>
        <p className="text-sm text-texto-suave">
          Con la carga abierta, las organizaciones pueden subir evidencias hasta la fecha límite. Después se cierra sola.
        </p>
        <div className="divide-y divide-divisor">
          {(periodos ?? []).map((p) => <FilaPeriodo key={p.id} periodo={p} />)}
        </div>
      </Tarjeta>

      <Tarjeta className="space-y-4">
        <div>
          <h2 className="font-semibold">Reabrir carga a una organización</h2>
          <p className="text-sm text-texto-suave">
            Después de la fecha límite, la reapertura la autorizan los evaluadores. Aquí se registra quién autorizó y por qué.
          </p>
        </div>
        <FormReapertura periodos={periodos ?? []} organizaciones={orgs ?? []} />
      </Tarjeta>

      {reaperturas && reaperturas.length > 0 && (
        <Tarjeta className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-borde">
                <th className="p-3">Trimestre</th>
                <th className="p-3">Organización</th>
                <th className="p-3">Hasta</th>
                <th className="p-3">Autorizó</th>
                <th className="p-3">Justificación</th>
              </tr>
            </thead>
            <tbody>
              {reaperturas.map((r) => {
                const per = r.periodo as unknown as { anio: number; trimestre: number };
                const org = r.organizacion as unknown as { clave: string };
                return (
                  <tr key={r.id} className="border-b border-borde last:border-0 align-top">
                    <td className="p-3">T{per.trimestre} · {per.anio}</td>
                    <td className="p-3">{org.clave}</td>
                    <td className="p-3">{formatoFecha(r.nueva_fecha_limite)}</td>
                    <td className="p-3">{r.autorizado_por}</td>
                    <td className="p-3">{r.justificacion}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Tarjeta>
      )}
    </div>
  );
}
