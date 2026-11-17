import { Boton, Tarjeta } from "@/components/ui";
import { confirmarEnlace } from "./actions";
import { SesionDesdeHash } from "./sesion-hash";

// Destino de los enlaces de correo (recuperación de contraseña, invitación).
export default async function ConfirmarEnlace({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; code?: string; next?: string }>;
}) {
  const { token_hash = "", type = "", code = "", next = "" } = await searchParams;
  const valido = Boolean((token_hash && type) || code);
  const esRecuperacion = type === "recovery" || next === "/cambiar-contrasena";

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <Tarjeta className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">{esRecuperacion ? "Restablecer contraseña" : "Confirmar acceso"}</h1>
        {valido ? (
          <form action={confirmarEnlace} className="space-y-4">
            <input type="hidden" name="token_hash" value={token_hash} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="next" value={next} />
            <p className="text-sm text-texto-suave">
              {esRecuperacion
                ? "Pulsa continuar para crear una contraseña nueva."
                : "Pulsa continuar para entrar a PIPEA."}
            </p>
            <Boton type="submit" className="w-full">Continuar</Boton>
          </form>
        ) : (
          <>
            <SesionDesdeHash destino={next && next.startsWith("/") && !next.startsWith("//") ? next : "/cambiar-contrasena"} />
            <p className="text-sm text-texto-suave">
              Si esta página no avanza sola, el enlace está incompleto o ya se usó. Pide uno nuevo en
              «¿Olvidaste tu contraseña?».
            </p>
          </>
        )}
      </Tarjeta>
    </main>
  );
}
