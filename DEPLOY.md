# Guía de despliegue — ZMail web (Vercel + Turso + GitHub)

Esta guía explica, paso a paso, cómo publicar la página web de descarga de ZMail
desde cero hasta tenerla funcionando en Vercel.

> **Tiempo estimado:** 20 minutos.

---

## 0. Requisitos previos

- Cuenta en [GitHub](https://github.com) (gratis).
- Cuenta en [Vercel](https://vercel.com) (gratis, se puede iniciar sesión con GitHub).
- Cuenta en [Turso](https://turso.tech) (gratis, se puede iniciar sesión con GitHub).
- El binario `ZMail.exe` ya compilado (ver README del proyecto Python).

---

## 1. Configurar la base de datos en Turso

```bash
cd zmail-web
./scripts/setup-turso.sh
```

El script:

1. Instala la CLI de Turso si no la tienes.
2. Te autentica (`turso auth login`).
3. Crea la base de datos `zmail-descargas`.
4. Crea un token de acceso.
5. Crea las tablas `downloads` y `releases`.
6. Inserta una release inicial `1.0.0` apuntando a
   `https://github.com/TU_USUARIO/ZMail/releases/download/v1.0.0/ZMail.zip`.

> **Importante:** edita el script y cambia `GITHUB_USER="TU_USUARIO"` por tu
> usuario real **antes** de ejecutarlo.

Al terminar, verás en pantalla algo así:

```
TURSO_DATABASE_URL = libsql://zmail-descargas-xxxxx.turso.io
TURSO_AUTH_TOKEN   = <el-token-que-te-muestra-el-script>
```

**Copia esos dos valores.** Los necesitarás en el paso 3.

---

## 2. Subir el código a GitHub

**Importante:** NO subas el binario `ZMail.exe` a git. Es grande y va contra
las políticas de GitHub. Lo subiremos como Release (paso 4).

El `.gitignore` del proyecto ya excluye:

- `node_modules/`
- `.next/`
- `.env*` (variables de entorno)
- `prisma/dev.db` (BD local de desarrollo)

```bash
cd zmail-web
git init
git add .
git commit -m "ZMail web: landing + API"
git branch -M main
# En GitHub, crea primero el repositorio vacío TU_USUARIO/ZMail-web
git remote add origin https://github.com/TU_USUARIO/ZMail-web.git
git push -u origin main
```

---

## 3. Conectar GitHub con Vercel

1. Ve a <https://vercel.com/new>.
2. Selecciona el repositorio `TU_USUARIO/ZMail-web`.
3. Framework Preset: **Next.js**.
4. Build Command: `bun run build` (o `npm run build` si no usas bun).
5. Install Command: `bun install` (o `npm install`).
6. **Environment Variables** → añade las dos del paso 1:

   | Name | Value |
   |---|---|
   | `TURSO_DATABASE_URL` | `libsql://zmail-descargas-xxxxx.turso.io` |
   | `TURSO_AUTH_TOKEN` | `<el-token-que-te-muestra-el-script>` |

   Opcionalmente añade también:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_GITHUB_URL` | `https://github.com/TU_USUARIO/ZMail` |
   | `NEXT_PUBLIC_DEFAULT_DOWNLOAD_URL` | `https://github.com/TU_USUARIO/ZMail/releases/latest` |

7. Pulsa **Deploy**.

Vercel compilará y publicará. Tu URL será
`https://zmail-web.vercel.app` (o similar).

---

## 4. Crear la Release en GitHub (con el .exe)

1. En GitHub, ve a tu repositorio del proyecto Python `TU_USUARIO/ZMail`.
2. Pestaña **Releases → Draft a new release**.
3. Choose a tag: `v1.0.0` (crea la etiqueta si no existe).
4. Title: `ZMail v1.0.0`.
5. **Attach binaries**: arrastra `ZMail.exe` (y/o `ZMail.zip`).
6. Publica la release.

> GitHub asignará automáticamente URLs tipo:
> `https://github.com/TU_USUARIO/ZMail/releases/download/v1.0.0/ZMail.exe`

---

## 5. Actualizar la URL de descarga en Turso

Si en el paso 1 pusiste una URL provisional o si el nombre del archivo no
coincide, actualiza la URL en la BD:

```bash
turso db shell zmail-descargas <<'SQL'
UPDATE releases
SET download_url = 'https://github.com/TU_USUARIO/ZMail/releases/download/v1.0.0/ZMail.exe',
    size_bytes = 65000000,
    sha256 = 'COLOCA_AQUI_EL_HASH_SHA256',
    changelog = 'Primera versión pública.',
    is_latest = 1
WHERE version = '1.0.0';
SQL
```

Para calcular el SHA256 del .exe en Windows:

```powershell
Get-FileHash ZMail.exe -Algorithm SHA256 | Format-List
```

o en PowerShell antiguo:

```cmd
certutil -hashfile ZMail.exe SHA256
```

---

## 6. Verificación final

1. Abre tu URL de Vercel (por ejemplo `https://zmail-web.vercel.app`).
2. Verifica que el tema oscuro violeta se aplica (fondo ~ `#0f1419`).
3. Comprueba que las stats (`Descargas`, `Tamaño`, `Versión`) cargan.
4. Pulsa el botón **Descargar ahora**:
   - Se abre una nueva pestaña con la release de GitHub.
   - El contador de descargas aumenta.
5. Desplázate por toda la página: hero, funciones, comparativa, descarga,
   cómo empezar, FAQ y footer.
6. Abre el FAQ y verifica que los accordions abren y cierran.

**Comprobaciones técnicas:**

```bash
curl https://TU_URL.vercel.app/api/stats
# → {"downloads":N,"latest":{"version":"1.0.0","downloadUrl":"...","sizeBytes":...,"sha256":"...","changelog":"...","releasedAt":"..."},"defaultDownloadUrl":"..."}

curl -X POST https://TU_URL.vercel.app/api/download \
  -H "Content-Type: application/json" \
  -d '{"version":"1.0.0"}'
# → {"ok":true,"downloadUrl":"...","version":"1.0.0"}
```

---

## 7. Desarrollo local

```bash
cd zmail-web
bun install
cp .env.example .env.local
# rellena .env.local con tus valores de Turso
bun run dev
```

Abre <http://localhost:3000>.

Sin Turso configurado, la app usa `prisma/dev.db` (SQLite local) automáticamente,
así que puedes desarrollar sin conectarte a Turso.

### Probar el flujo de descarga sin compilar el .exe

Para probar el botón de descarga sin esperar a compilar el .exe real, ejectua:

```bash
bun run scripts/seed-local.ts
```

Esto registra una release `1.0.0` apuntando a `/api/download/exe`, que sirve el
`releases/ZMail.exe` incluido como **placeholder** (un binario de ~700 bytes con
un mensaje explicativo). Al pulsar "Descargar ahora", el navegador descarga
ese archivo y el contador de Turso se incrementa.

Para reemplazarlo por el .exe real:

1. Compila el .exe en Windows con `ZMail/build.bat`.
2. Copia el `ZMail.exe` real a `zmail-web/public/ZMail.exe`.
3. Actualiza la release en Turso con el SHA256 y tamaño correctos:

```bash
turso db shell zmail-descargas <<'SQL'
UPDATE releases
SET download_url = '/api/download/exe',
    size_bytes = TAMANO_REAL,
    sha256 = 'HASH_SHA256_REAL'
WHERE version = '1.0.0';
SQL
```

> También puedes servir el .exe directamente desde GitHub Releases
> (poniendo `download_url` a la URL de GitHub en vez de `/api/download/exe`).
> El frontend detecta si la URL es relativa o absoluta y actúa en consecuencia:
> relativa → descarga directa; absoluta → abre en nueva pestaña.

---

## 8. Estructura del proyecto

```
zmail-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout, lang="es", tema oscuro
│   │   ├── page.tsx            # Landing completa
│   │   ├── globals.css         # Tailwind + tema violeta
│   │   └── api/
│   │       ├── stats/route.ts          # GET: contador + release
│   │       ├── download/route.ts       # POST: registra + devuelve URL
│   │       └── download/exe/route.ts   # GET: sirve ZMail.exe (placeholder o real)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── accordion.tsx
│   │   │   └── sonner.tsx
│   │   ├── download-button.tsx
│   │   └── stats.tsx
│   └── lib/
│       ├── turso.ts            # Cliente Turso + queries
│       └── utils.ts            # cn() helper
├── releases/
│   └── ZMail.exe               # Placeholder (reemplázalo por el real)
├── scripts/
│   ├── setup-turso.sh          # Setup en Turso (producción)
│   └── seed-local.ts           # Setup en SQLite local (dev)
├── .env.example
├── vercel.json
├── DEPLOY.md
└── package.json
```

---

## 9. Solución de problemas

**Stats siempre en 0 / "db_unavailable"**
- Verifica que `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` están configuradas en Vercel.
- En Vercel, espera ~30s tras cambiar variables y redespliega.

**Descarga abre una URL de GitHub incorrecta**
- Actualiza la fila en la tabla `releases` con la URL correcta (paso 5).

**Error de build en Vercel**
- Asegúrate de Node 20+ y de que `next` está en la versión especificada en `package.json`.
- Revisa los logs; suele ser una variable de entorno mal escrita.

**Cookie/CSRF en /api/download**
- No usamos cookies: el endpoint es stateless y compatible con CSP estricta.

---

## 10. Seguridad

- **NO subas nunca** `.env`, `.env.local` ni el token de Turso a git. El `.gitignore`
  ya los excluye.
- Si comprometes un token de Turso, revócalo con `turso db tokens invalidate <id>`.
- Para rotar: crea un token nuevo, actualízalo en Vercel y redespliega.

---

## Recordatorio final

**Recuerda revocar los 3 tokens que te dieron (GitHub PAT, Vercel token, Turso token)
en sus respectivas consolas de administración una vez terminado el despliegue inicial.**
El proyecto seguirá funcionando porque las variables de entorno ya están guardadas en
Vercel y los tokens solo se usan para el setup inicial.
