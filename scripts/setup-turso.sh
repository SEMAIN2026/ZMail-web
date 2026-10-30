#!/usr/bin/env bash
# ============================================================
#  ZMail - Setup de base de datos en Turso
#  Crea la BD, las tablas e inserta una release inicial.
#  Salida: las 2 variables que debes configurar en Vercel.
# ============================================================
set -euo pipefail

DB_NAME="zmail-descargas"
GITHUB_USER="TU_USUARIO"
RELEASE_VERSION="1.0.0"
RELEASE_URL="https://github.com/${GITHUB_USER}/ZMail/releases/download/v${RELEASE_VERSION}/ZMail.zip"

echo "[1/6] Verificando turso CLI..."
if ! command -v turso >/dev/null 2>&1; then
  echo "  Instalando turso CLI..."
  curl -sSfL https://get.tur.so/install.sh | bash
  export PATH="$HOME/.turso/bin:$PATH"
fi

echo "[2/6] Autenticando (abre el navegador si es necesario)..."
turso auth login || true

echo "[3/6] Creando base de datos '$DB_NAME'..."
if turso db show "$DB_NAME" >/dev/null 2>&1; then
  echo "  La BD ya existe. Continuando..."
else
  turso db create "$DB_NAME" --group default
  echo "  Esperando a que la BD esté lista..."
  sleep 5
fi

DB_URL="$(turso db show "$DB_NAME" --url)"
echo "  URL: $DB_URL"

echo "[4/6] Creando token de acceso..."
AUTH_TOKEN="$(turso db tokens create "$DB_NAME")"

echo "[5/6] Creando tablas..."
turso db shell "$DB_NAME" <<'SQL'
CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  ip TEXT,
  user_agent TEXT,
  country TEXT,
  version TEXT
);
CREATE TABLE IF NOT EXISTS releases (
  version TEXT PRIMARY KEY,
  released_at TEXT DEFAULT (datetime('now')),
  download_url TEXT NOT NULL,
  size_bytes INTEGER,
  sha256 TEXT,
  changelog TEXT,
  is_latest INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at);
CREATE INDEX IF NOT EXISTS idx_downloads_country ON downloads(country);
SQL

echo "[6/6] Insertando release inicial v${RELEASE_VERSION}..."
turso db shell "$DB_NAME" <<SQL
INSERT OR IGNORE INTO releases (version, download_url, size_bytes, sha256, changelog, is_latest)
VALUES ('${RELEASE_VERSION}', '${RELEASE_URL}', NULL, NULL, 'Versión inicial 1.0.0', 1);
UPDATE releases SET is_latest = 0 WHERE version != '${RELEASE_VERSION}';
UPDATE releases SET is_latest = 1 WHERE version = '${RELEASE_VERSION}';
SQL

echo ""
echo "============================================================"
echo "  CONFIGURACIÓN COMPLETA"
echo "============================================================"
echo ""
echo "Copia estas dos variables y pégalas en Vercel:"
echo "  Settings → Environment Variables"
echo ""
echo "  TURSO_DATABASE_URL = ${DB_URL}"
echo "  TURSO_AUTH_TOKEN   = ${AUTH_TOKEN}"
echo ""
echo "Recuerda:"
echo "  - Sustituye TU_USUARIO por tu usuario real de GitHub arriba"
echo "    en este mismo script (variable GITHUB_USER) y vuelve a ejecutarlo."
echo "  - Actualiza RELEASE_URL con el enlace real del .zip de tu release."
echo "============================================================"
