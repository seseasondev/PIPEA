import { Migas, Tarjeta } from "@/components/ui";
import { NOMBRE_ROL, exigirRol, type Rol } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { cambiarActivo } from "./actions";
import { FormNuevoUsuario } from "./form";

export default async function PaginaUsuarios() {
  const yo = await exigirRol("admin");
  const supabase = await createClient();
  const [{ data: perfiles }, { data: orgs }] = await Promise.all([
    supabase
      .from("perfiles")
      .select("id, correo, nombre, rol, activo, organizacion:organizaciones(clave)")
      .order("rol")
      .order("correo"),
    supabase.from("organizaciones").select("id, clave, nombre").order("clave"),
  ]);

  return (
    <div className="space-y-6">
      <Migas items={[{ href: "/", texto: "Panel" }, { texto: "Usuarios" }]} />
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <p className="text-sm text-texto-suave">
        No hay registro público: aquí se crean las cuentas de las 5 organizaciones, los 2 evaluadores y la administración.
        Cada persona puede cambiar su contraseña con «¿Olvidaste tu contraseña?».
      </p>

      <Tarjeta>
        <h2 className="font-semibold mb-4">Nueva cuenta</h2>
        <FormNuevoUsuario organizaciones={orgs ?? []} />
      </Tarjeta>

      <Tarjeta className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-borde">
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(perfiles ?? []).map((p) => {
              const org = p.organizacion as unknown as { clave: string } | null;
              return (
                <tr key={p.id} className="border-b border-borde last:border-0">
                  <td className="p-3">{p.nombre ?? "—"}</td>
                  <td className="p-3">{p.correo}</td>
                  <td className="p-3">{p.rol ? NOMBRE_ROL[p.rol as Rol] : "Sin rol"}{org ? ` · ${org.clave}` : ""}</td>
                  <td className="p-3">{p.activo ? "Activa" : "Desactivada"}</td>
                  <td className="p-3 text-right">
                    {p.id !== yo.id && (
                      <form action={cambiarActivo}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="activo" value={String(!p.activo)} />
                        <button type="submit" className="underline">{p.activo ? "Desactivar" : "Activar"}</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Tarjeta>
    </div>
  );
}
