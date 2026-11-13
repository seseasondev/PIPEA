# PIPEA

Plataforma de seguimiento y evaluación del Programa de Implementación (PIPEA) del
Comité Coordinador. Las organizaciones consultan sus ejes, prioridades y actividades,
cargan evidencias por trimestre y los evaluadores ponen una calificación de 0 a 25
por organización y trimestre (4 × 25 = 100 %), mostrada con semáforo.

**Stack:** Next.js 16 (App Router) + Supabase (Postgres, Auth, Storage).
Todo dato y archivo vive en Supabase; la app no usa servicios exclusivos de Vercel,
así que corre igual en Vercel, en Docker o en el servidor institucional.

## Correr en local

```bash
cp .env.example .env.local   # llena las variables
npm install
npm run dev                  # http://localhost:3000
```

| Variable | Dónde se obtiene | ¿Pública? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API Keys | Sí |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys | Sí (protegida por RLS) |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret keys | **No.** Solo servidor |
| `NEXT_PUBLIC_SITE_URL` | URL donde se publica la app | Sí |

## Base de datos

Las migraciones están en `supabase/migrations/` y ya están aplicadas en el proyecto
Supabase **PIPEA** (`kbgzpwvsswozdnhfaoul`). Incluyen:

- Catálogo: `organizaciones`, `ejes`, `prioridades` (con plazo), `fuentes` (lista propia por prioridad), `actividades`.
- Operación: `periodos` (trimestres con fecha límite), `reaperturas`, `entregas` (narrativa + estado), `evidencias`, `calificaciones` (una por organización y trimestre), `comentarios_prioridad`.
- Usuarios: `perfiles` (rol `admin` / `evaluador` / `organizacion`), creado por trigger al dar de alta la cuenta.
- RLS en todas las tablas. Las funciones auxiliares viven en el esquema `privado`, fuera de la API.
- Bucket privado `evidencias` (solo PDF, 20 MB) con ruta `{organizacion}/{periodo}/{actividad}/archivo.pdf`.
- Datos iniciales: 5 organizaciones, 5 ejes, Eje 1 completo (11 prioridades, 25 actividades) y periodos 2026–2027.

## Carga de evidencias

- La administración abre cada trimestre y fija la fecha límite en `/admin/periodos`; ahí también registra reaperturas (quién autorizó y por qué).
- Cada organización entra a su actividad y sube PDF por fuente de información. Los archivos van directo del navegador a Supabase Storage.
- Para enviar a revisión se necesitan archivos de al menos 3 fuentes distintas (regla aplicada en la base de datos). Si después quitan archivos y quedan menos de 3, la entrega vuelve a borrador.
- Evaluadores y administración ven las entregas y abren los PDF con enlaces temporales.

## Acceso

Correo institucional + contraseña, **sin registro público**. La administración crea
las cuentas en `/admin/usuarios`; cada persona puede recuperar su contraseña por correo.

Primera cuenta de administración (una sola vez):
1. Supabase → Authentication → Users → *Add user* (marca *Auto Confirm User*).
2. En el SQL Editor: `update perfiles set rol = 'admin' where correo = 'tu@correo.gob.mx';`

En Supabase → Authentication → Sign In / Providers desactiva **Allow new users to sign up**,
y en URL Configuration agrega la URL del sitio y `<sitio>/auth/confirm` a las Redirect URLs.

## Despliegue

**Vercel (pruebas):** importa el repo y define las 4 variables de entorno.

**Servidor institucional (Docker):**

```bash
docker build -t pipea \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://kbgzpwvsswozdnhfaoul.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_... \
  --build-arg NEXT_PUBLIC_SITE_URL=https://pipea.ejemplo.gob.mx .
docker run -d -p 3000:3000 -e SUPABASE_SECRET_KEY=... --name pipea pipea
```

Sin Docker: `npm ci && npm run build`, copia `.next/standalone`, `.next/static` (a
`.next/static`) y `public`, y corre `node server.js` detrás del proxy inverso.
