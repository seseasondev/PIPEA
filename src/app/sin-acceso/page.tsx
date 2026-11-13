import { Boton, Tarjeta } from "@/components/ui";
import { cerrarSesion } from "@/app/login/actions";

export default function SinAcceso() {
  return (
    <main className="min-h-screen grid place-items-center p-4">
      <Tarjeta className="w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Tu cuenta no tiene acceso</h1>
        <p className="text-sm text-texto-suave">
          Tu cuenta existe pero no tiene un rol asignado o está desactivada. Pide a la administración que la revise.
        </p>
        <form action={cerrarSesion}><Boton type="submit">Cerrar sesión</Boton></form>
      </Tarjeta>
    </main>
  );
}
