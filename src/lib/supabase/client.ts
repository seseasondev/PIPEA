"use client";

import { createBrowserClient } from "@supabase/ssr";

// Cliente del navegador (sesión por cookies). Se usa para subir archivos
// directo a Supabase Storage, sin pasar por el servidor de la app.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
