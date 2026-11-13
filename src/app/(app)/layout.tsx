import Link from "next/link";
import { cerrarSesion } from "@/app/login/actions";
import { NOMBRE_ROL, exigirRol } from "@/lib/sesion";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const perfil = await exigirRol("admin", "evaluador", "organizacion");
  return (
    <div className="min-h-screen">
      <header className="bg-superficie border-b border-borde">
        <div className="max-w-[1180px] mx-auto px-4 py-3 flex flex-wrap items-center gap-4 justify-between">
          <nav className="flex items-center gap-4">
            <Link href="/" className="font-titulo font-extrabold text-lg text-berenjena">PIPEA</Link>
            <Link href="/" className="text-sm font-medium hover:text-primario">Panel</Link>
            {perfil.rol === "admin" && <Link href="/admin/usuarios" className="text-sm font-medium hover:text-primario">Usuarios</Link>}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-texto-suave">
              {perfil.nombre ?? perfil.correo} · {perfil.organizacion?.clave ?? NOMBRE_ROL[perfil.rol!]}
            </span>
            <form action={cerrarSesion}>
              <button type="submit" className="font-semibold text-primario hover:text-primario-hover">Salir</button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-[1180px] mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
