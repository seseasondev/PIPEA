// Componentes base con los tokens del diseño (ver globals.css).
// Las vistas solo usan estos componentes, así un ajuste de estilo se hace en un lugar.
import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

export function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-superficie border border-borde rounded-tarjeta shadow-tarjeta p-5 ${className}`}>
      {children}
    </div>
  );
}

export function TarjetaEnlace({
  href,
  children,
  className = "",
  estilo,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  estilo?: CSSProperties;
}) {
  return (
    <Link
      href={href}
      style={estilo}
      className={`block bg-superficie border border-borde rounded-tarjeta shadow-tarjeta p-5 transition hover:shadow-tarjeta-hover hover:border-primario-suave ${className}`}
    >
      {children}
    </Link>
  );
}

export function Boton({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      className={`bg-primario hover:bg-primario-hover text-primario-texto rounded-boton px-5 h-11 font-semibold transition disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}

export function Campo({ etiqueta, ...props }: { etiqueta: string } & ComponentProps<"input">) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-semibold text-texto-fuerte">{etiqueta}</span>
      <input
        className="w-full h-12 border border-borde-input rounded-boton px-4 bg-superficie placeholder:text-texto-tenue focus:border-primario"
        {...props}
      />
    </label>
  );
}

export function Selector({ etiqueta, children, ...props }: { etiqueta: string } & ComponentProps<"select">) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-semibold text-texto-fuerte">{etiqueta}</span>
      <select className="w-full h-12 border border-borde-input rounded-boton px-4 bg-superficie focus:border-primario" {...props}>
        {children}
      </select>
    </label>
  );
}

export function Aviso({ tipo = "info", children }: { tipo?: "info" | "error" | "ok"; children: ReactNode }) {
  const color = tipo === "error" ? "text-peligro" : tipo === "ok" ? "text-verde" : "text-texto-suave";
  return <p className={`text-sm ${color}`} role={tipo === "error" ? "alert" : "status"}>{children}</p>;
}

export function Antetitulo({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <p className="text-xs font-extrabold uppercase tracking-[1.6px] text-primario" style={color ? { color } : undefined}>
      {children}
    </p>
  );
}

export function Migas({ items }: { items: { href?: string; texto: string }[] }) {
  return (
    <nav aria-label="Ruta" className="text-sm text-texto-suave mb-4">
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1.5 text-texto-tenue">/</span>}
          {it.href ? <Link href={it.href} className="hover:text-primario">{it.texto}</Link> : <span className="text-texto">{it.texto}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Etiqueta({ children, color }: { children: ReactNode; color?: { texto: string; fondo: string } }) {
  return (
    <span
      className="inline-block text-xs font-semibold rounded-pastilla px-2.5 py-1 bg-pastilla text-texto-fuerte"
      style={color ? { color: color.texto, background: color.fondo } : undefined}
    >
      {children}
    </span>
  );
}

// Color de cada eje según el diseño (1–5); los ejes nuevos reciclan la paleta.
export function colorEje(numero: number) {
  const n = ((numero - 1) % 5) + 1;
  return { texto: `var(--eje-${n})`, fondo: `var(--eje-${n}-suave)` };
}
