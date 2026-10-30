import { createClient, type Client } from "@libsql/client";

// Cliente singleton para reutilizar la conexión entre invocaciones.
let client: Client | null = null;

declare global {
  var __tursoClient: Client | undefined;
}

function createTursoClient(): Client {
  const url =
    process.env.TURSO_DATABASE_URL ||
    process.env.TURSO_URL ||
    "";
  const authToken =
    process.env.TURSO_AUTH_TOKEN ||
    process.env.TURSO_TOKEN ||
    undefined;

  if (url && (url.startsWith("libsql:") || url.startsWith("http:") || url.startsWith("https:"))) {
    return createClient({ url, authToken });
  }
  // Fallback local para desarrollo
  return createClient({ url: "file:./prisma/dev.db" });
}

export function getTurso(): Client {
  if (client) return client;
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__tursoClient) {
      globalThis.__tursoClient = createTursoClient();
    }
    client = globalThis.__tursoClient;
  } else {
    client = createTursoClient();
  }
  return client;
}

export interface DownloadRecord {
  id: number;
  created_at: string;
  ip: string | null;
  user_agent: string | null;
  country: string | null;
  version: string | null;
}

export interface Release {
  version: string;
  released_at: string;
  download_url: string;
  size_bytes: number | null;
  sha256: string | null;
  changelog: string | null;
  is_latest: number;
}

const SCHEMA_SQL = `
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
`;

export async function initDb(): Promise<void> {
  const c = getTurso();
  for (const stmt of SCHEMA_SQL.trim().split(";").map((s) => s.trim()).filter(Boolean)) {
    await c.execute(stmt);
  }
}

export async function getDownloadCount(): Promise<number> {
  const c = getTurso();
  const res = await c.execute("SELECT COUNT(*) as n FROM downloads");
  const row = res.rows[0];
  const n = row?.n;
  if (typeof n === "bigint") return Number(n);
  if (typeof n === "number") return n;
  return 0;
}

export interface RecordDownloadMeta {
  ip?: string | null;
  userAgent?: string | null;
  country?: string | null;
  version?: string | null;
}

export async function recordDownload(meta: RecordDownloadMeta): Promise<void> {
  const c = getTurso();
  await c.execute({
    sql: "INSERT INTO downloads (ip, user_agent, country, version) VALUES (?, ?, ?, ?)",
    args: [
      meta.ip ?? null,
      meta.userAgent ?? null,
      meta.country ?? null,
      meta.version ?? null,
    ],
  });
}

export async function getLatestRelease(): Promise<Release | null> {
  const c = getTurso();
  const res = await c.execute("SELECT * FROM releases WHERE is_latest = 1 LIMIT 1");
  if (res.rows.length === 0) {
    // Fallback: la más reciente por released_at
    const res2 = await c.execute(
      "SELECT * FROM releases ORDER BY released_at DESC LIMIT 1"
    );
    if (res2.rows.length === 0) return null;
    return res2.rows[0] as unknown as Release;
  }
  return res.rows[0] as unknown as Release;
}

export interface DownloadStatRow {
  day: string;
  count: number;
}

export async function getDownloadStats(days = 30): Promise<DownloadStatRow[]> {
  const c = getTurso();
  const res = await c.execute({
    sql: `SELECT DATE(created_at) as day, COUNT(*) as count
          FROM downloads
          WHERE created_at >= datetime('now', ?)
          GROUP BY day
          ORDER BY day ASC`,
    args: [`-${days} days`],
  });
  return res.rows.map((r) => ({
    day: String(r.day ?? ""),
    count:
      typeof r.count === "bigint"
        ? Number(r.count)
        : typeof r.count === "number"
        ? r.count
        : 0,
  }));
}

export async function setLatestRelease(version: string): Promise<void> {
  const c = getTurso();
  await c.execute("UPDATE releases SET is_latest = 0");
  await c.execute({
    sql: "UPDATE releases SET is_latest = 1 WHERE version = ?",
    args: [version],
  });
}
