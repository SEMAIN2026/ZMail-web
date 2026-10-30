/**
 * Inicializa una release local en la BD apuntando a /api/download/exe
 * para que el flujo de descarga funcione end-to-end sin Turso configurado.
 *
 * Uso: bun run scripts/seed-local.ts
 */
import { initDb, getTurso } from "../src/lib/turso";

async function main() {
  await initDb();
  const c = getTurso();

  // Insertar o actualizar release 1.0.0 apuntando al endpoint local
  await c.execute({
    sql: `INSERT OR REPLACE INTO releases
      (version, download_url, size_bytes, sha256, changelog, is_latest)
      VALUES (?, ?, ?, ?, ?, 1)`,
    args: [
      "1.0.0",
      "/api/download/exe",
      776,
      "8ae2eb37d6a375faefd721f34f10dc6a90c0ad90fc473cd9bb9483642ca74458",
      "Versión inicial 1.0.0 (placeholder para pruebas del flujo de descarga).",
    ],
  });

  // Resetear is_latest en las demás
  await c.execute("UPDATE releases SET is_latest = 0 WHERE version != '1.0.0'");
  await c.execute("UPDATE releases SET is_latest = 1 WHERE version = '1.0.0'");

  // Verificar
  const res = await c.execute("SELECT * FROM releases");
  console.log("Releases en BD:");
  for (const r of res.rows) {
    console.log(JSON.stringify(r, null, 2));
  }
  console.log("\nSeed OK. Ahora GET /api/stats devolverá la release 1.0.0.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
