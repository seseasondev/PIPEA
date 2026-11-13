import { Aviso } from "@/components/ui";
import { FormLogin } from "./form";

export default async function PaginaLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between bg-berenjena text-white p-12">
        <p className="font-titulo font-extrabold text-xl">PIPEA</p>
        <div className="space-y-4 max-w-md">
          <p className="text-xs font-extrabold uppercase tracking-[1.6px] text-[#f2b98d]">Comité Coordinador</p>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Seguimiento y evaluación del Programa de Implementación
          </h1>
          <p className="text-white/75 text-lg">
            Consulta tus ejes, prioridades y actividades, carga tus evidencias trimestrales y revisa tu calificación.
          </p>
        </div>
        <p className="text-white/50 text-sm">Sistema Estatal Anticorrupción de Sonora</p>
      </section>

      <section className="grid place-items-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <p className="lg:hidden font-titulo font-extrabold text-xl text-berenjena mb-6">PIPEA</p>
            <h2 className="text-3xl font-extrabold tracking-tight">Iniciar sesión</h2>
            <p className="text-texto-suave">Entra con tu correo institucional.</p>
          </div>
          {error === "enlace" && (
            <Aviso tipo="error">El enlace ya no es válido o expiró. Pide uno nuevo.</Aviso>
          )}
          <FormLogin />
          <p className="text-xs text-texto-tenue">
            Las cuentas las crea la administración. Si no tienes acceso, solicítalo a la persona administradora.
          </p>
        </div>
      </section>
    </main>
  );
}
