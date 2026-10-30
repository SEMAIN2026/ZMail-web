import { NextResponse } from "next/server";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export const dynamic = "force-dynamic";

const PUBLIC_EXE = path.join(process.cwd(), "public", "ZMail.exe");
const REPO_EXE = path.join(process.cwd(), "releases", "ZMail.exe");
const PARENT_EXE = path.join(process.cwd(), "..", "releases", "ZMail.exe");

async function readFirstAvailable(): Promise<Buffer | null> {
  for (const p of [PUBLIC_EXE, REPO_EXE, PARENT_EXE]) {
    try {
      const data = await fs.readFile(p);
      return Buffer.from(data);
    } catch {
      // try next
    }
  }
  return null;
}

export async function GET() {
  const buf = await readFirstAvailable();
  if (!buf) {
    return new NextResponse(
      "ZMail.exe no encontrado. Coloca el .exe en /public/ZMail.exe o /releases/ZMail.exe. " +
        "Para generarlo, ejecuta build.bat en Windows.",
      {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="ZMail.exe"',
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store",
    },
  });
}
