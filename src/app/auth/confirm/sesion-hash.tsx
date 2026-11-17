"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Respaldo para enlaces que traen la sesión en el fragmento (#access_token=…),
// como hace la plantilla de correo por defecto en algunos casos.
export function SesionDesdeHash({ destino }: { destino: string }) {
  const [error, setError] = useState(false);
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (!access_token || !refresh_token) return;
    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) setError(true);
        else window.location.replace(destino);
      });
  }, [destino]);
  return error ? <p className="text-sm text-peligro">El enlace expiró. Pide uno nuevo.</p> : null;
}
