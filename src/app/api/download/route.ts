import { NextRequest, NextResponse } from "next/server";
import {
  getLatestRelease,
  initDb,
  recordDownload,
} from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    let body: { version?: string } = {};
    try {
      body = await req.json();
    } catch {
      // cuerpo vacío: usamos la release más reciente
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;
    const country = req.headers.get("x-vercel-ip-country") || null;
    const version = body.version || null;

    await recordDownload({ ip, userAgent, country, version });

    const latest = await getLatestRelease();
    const downloadUrl =
      (latest?.download_url) ||
      process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_URL ||
      "https://github.com/TU_USUARIO/ZMail/releases/latest";

    return NextResponse.json({
      ok: true,
      downloadUrl,
      version: latest?.version ?? version ?? "1.0.0",
    });
  } catch (err) {
    console.error("[/api/download] error:", err);
    return NextResponse.json(
      {
        ok: false,
        downloadUrl:
          process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_URL ||
          "https://github.com/TU_USUARIO/ZMail/releases/latest",
        version: "1.0.0",
        error: "db_unavailable",
      },
      { status: 200 }
    );
  }
}
