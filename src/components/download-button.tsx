"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Stats {
  downloads: number;
  latest: {
    version: string;
    downloadUrl: string;
    sizeBytes: number | null;
    sha256: string | null;
    changelog: string | null;
    releasedAt: string;
  } | null;
  defaultDownloadUrl: string;
}

interface DownloadButtonProps extends ButtonProps {
  version?: string;
  label?: string;
  withIcon?: boolean;
  onStats?: (s: Stats) => void;
}

export function DownloadButton({
  version,
  label = "Descargar ahora",
  withIcon = true,
  onStats,
  className,
  ...props
}: DownloadButtonProps) {
  const [loading, setLoading] = React.useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version }),
      });
      const data = await res.json();
      if (data?.ok) {
        const url: string = data.downloadUrl;
        const isRelative = url.startsWith("/") && !url.startsWith("//");
        toast.success("¡Descarga lista!", {
          description: isRelative
            ? "Iniciando descarga…"
            : "Abriendo la página de descarga en una pestaña nueva…",
        });
        if (isRelative) {
          // Descarga directa en la misma pestaña usando un <a download>
          const a = document.createElement("a");
          a.href = url;
          a.download = "ZMail.exe";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
        // refrescar stats
        const s = await fetch("/api/stats").then((r) => r.json());
        onStats?.(s as Stats);
      } else {
        toast.error("No se pudo registrar la descarga", {
          description: "Redirigiendo igualmente…",
        });
        window.open(
          data?.downloadUrl ||
            "https://github.com/TU_USUARIO/ZMail/releases/latest",
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de red", {
        description: "Revisa tu conexión e inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={cn(className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : withIcon ? (
        <Download className="h-5 w-5" aria-hidden />
      ) : null}
      {loading ? "Procesando…" : label}
    </Button>
  );
}
