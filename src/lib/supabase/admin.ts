import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/env";

// Cliente con la llave secreta: salta RLS. Úsalo SOLO en el servidor y SOLO
// después de comprobar que quien llama es admin.
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Falta la variable de entorno SUPABASE_SECRET_KEY");
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
