"use client";

import * as React from "react";
import { Download, HardDrive, Tag } from "lucide-react";

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

export type { Stats };

interface StatsState {
  loading: boolean;
  stats: Stats | null;
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function useStats(): StatsState & { refresh: () => Promise<void> } {
  const [state, setState] = React.useState<StatsState>({
    loading: true,
    stats: null,
  });

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      const data = (await res.json()) as Stats;
      setState({ loading: false, stats: data });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        const data = (await res.json()) as Stats;
        if (!cancelled) {
          setState({ loading: false, stats: data });
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    };
    doFetch();
    const id = setInterval(doFetch, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { ...state, refresh };
}

export function StatsRow({ stats, loading }: StatsState) {
  const version = stats?.latest?.version ?? "1.0.0";
  const size = stats?.latest?.sizeBytes ?? null;
  const downloads = stats?.downloads ?? 0;

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <StatCard
        icon={<Download className="h-4 w-4" aria-hidden />}
        label="Descargas"
        value={loading ? "…" : formatDownloads(downloads)}
      />
      <StatCard
        icon={<HardDrive className="h-4 w-4" aria-hidden />}
        label="Tamaño"
        value={loading ? "…" : formatBytes(size)}
      />
      <StatCard
        icon={<Tag className="h-4 w-4" aria-hidden />}
        label="Versión"
        value={loading ? "…" : `v${version}`}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#2a313c] bg-[#161b22] p-4 text-center">
      <div className="mb-1 flex items-center justify-center gap-2 text-[#8b949e]">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-xl font-bold text-[#e6edf3] sm:text-2xl">{value}</div>
    </div>
  );
}

export function Sha256Box({ stats }: { stats: Stats | null }) {
  const sha = stats?.latest?.sha256;
  const [copied, setCopied] = React.useState(false);
  if (!sha) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(sha);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* noop */
        }
      }}
      className="group mt-3 flex w-full items-center gap-3 rounded-lg border border-[#2a313c] bg-[#0f1419] px-4 py-3 text-left text-xs text-[#8b949e] hover:border-[#5e72e4]/40"
    >
      <span className="shrink-0 font-mono text-[#5e72e4]">SHA256</span>
      <span className="flex-1 truncate font-mono">{sha}</span>
      <span className="shrink-0 text-[#5e72e4] group-hover:text-[#7c3aed]">
        {copied ? "¡Copiado!" : "Copiar"}
      </span>
    </button>
  );
}
