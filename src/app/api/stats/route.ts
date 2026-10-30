import { NextResponse } from "next/server";
import {
  getDownloadCount,
  getLatestRelease,
  initDb,
} from "@/lib/turso";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await initDb();
    const [downloads, latest] = await Promise.all([
      getDownloadCount(),
      getLatestRelease(),
    ]);

    const defaultDownloadUrl =
      latest?.download_url ||
      process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_URL ||
      "https://github.com/TU_USUARIO/ZMail/releases/latest";

    return NextResponse.json({
      downloads,
      latest: latest
        ? {
            version: latest.version,
            downloadUrl: latest.download_url,
            sizeBytes: latest.size_bytes,
            sha256: latest.sha256,
            changelog: latest.changelog,
            releasedAt: latest.released_at,
          }
        : null,
      defaultDownloadUrl,
    });
  } catch (err) {
    console.error("[/api/stats] error:", err);
    return NextResponse.json(
      {
        downloads: 0,
        latest: null,
        defaultDownloadUrl:
          process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_URL ||
          "https://github.com/TU_USUARIO/ZMail/releases/latest",
        error: "db_unavailable",
      },
      { status: 200 }
    );
  }
}
