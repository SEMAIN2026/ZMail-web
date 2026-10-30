"use client";

import * as React from "react";
import {
  Mail,
  Users,
  Calendar,
  CheckSquare,
  Search,
  Filter,
  Lock,
  Moon,
  Menu,
  X,
  Github,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadButton } from "@/components/download-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sha256Box, StatsRow, useStats, type Stats } from "@/components/stats";

const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/TU_USUARIO/ZMail";

const NAV_LINKS = [
  { href: "#funciones", label: "Funciones" },
  { href: "#descargar", label: "Descargar" },
  { href: "#empezar", label: "Cómo empezar" },
  { href: "#faq", label: "FAQ" },
];

const FEATURES = [
  {
    icon: Mail,
    title: "Correo multi-cuenta",
    desc: "Varias cuentas Gmail, Outlook o IMAP genérico simultáneas, con colores diferenciados.",
  },
  {
    icon: Users,
    title: "Contactos",
    desc: "Alta/baja/edición, grupos, categorías, importación CSV y autocompletar al redactar.",
  },
  {
    icon: Calendar,
    title: "Calendario",
    desc: "Vistas Día / Semana / Mes con recurrencias, recordatorios y categorías de color.",
  },
  {
    icon: CheckSquare,
    title: "Tareas",
    desc: "Prioridades, estados, fechas de vencimiento y barra de progreso por tarea.",
  },
  {
    icon: Search,
    title: "Búsqueda avanzada",
    desc: "Filtra por cuenta, carpeta, remitente, destinatario, asunto, cuerpo, fechas y adjuntos.",
  },
  {
    icon: Filter,
    title: "Reglas automáticas",
    desc: "Editor visual con condiciones Y/O y acciones: marcar, mover, eliminar o reenviar.",
  },
  {
    icon: Lock,
    title: "Cifrado PGP",
    desc: "Genera claves RSA 4096, cifra, firma y verifica mensajes con pgpy.",
  },
  {
    icon: Moon,
    title: "Interfaz oscura moderna",
    desc: "Tema oscuro estilo VS Code, atajos de teclado y diseño centrado en productividad.",
  },
];

const COMPARISON: Array<{
  feature: string;
  zmail: string;
  emclient: string;
  note?: string;
}> = [
  { feature: "Correo IMAP/SMTP", zmail: "✓", emclient: "✓" },
  { feature: "Multi-cuenta", zmail: "✓ Sin límite", emclient: "×", note: "Solo 2 (gratis)" },
  { feature: "Contactos", zmail: "✓", emclient: "✓" },
  { feature: "Calendario", zmail: "✓", emclient: "✓" },
  { feature: "Tareas", zmail: "✓", emclient: "✓ Pro" },
  { feature: "Reglas automáticas", zmail: "✓", emclient: "✓ Pro" },
  { feature: "Cifrado PGP", zmail: "✓", emclient: "×" },
  { feature: "Sin telemetría", zmail: "✓", emclient: "×" },
  { feature: "Código abierto", zmail: "✓", emclient: "×" },
  { feature: "Gratis sin límites", zmail: "✓", emclient: "×" },
  { feature: ".exe portable", zmail: "✓", emclient: "×" },
];

const STEPS = [
  {
    title: "Descarga ZMail",
    desc: "Pulsa el botón de descarga y guarda el .exe (≈ 60 MB). No requiere instalación.",
  },
  {
    title: "Ejecútalo",
    desc: "Doble clic en ZMail.exe. La primera vez se crea la base de datos local automáticamente.",
  },
  {
    title: "Configura tu cuenta",
    desc: "Ajustes → Cuentas → Nuevo. Elige Gmail u Outlook y pega tu contraseña de aplicación.",
  },
  {
    title: "Sincroniza y disfruta",
    desc: "Pulsa F9 para sincronizar. Tu correo, contactos y tareas estarán listos en segundos.",
  },
];

const FAQ_ITEMS = [
  {
    q: "¿Es gratis?",
    a: "Sí. ZMail es 100% gratuito y de código abierto (licencia MIT). No hay versión Pro ni pagos ocultos.",
  },
  {
    q: "¿Funciona con Gmail?",
    a: "Sí. Necesitas activar la verificación en 2 pasos y crear una contraseña de aplicación de 16 caracteres en myaccount.google.com/apppasswords. Pega esa contraseña (no tu contraseña normal) en ZMail.",
  },
  {
    q: "¿Funciona con Outlook?",
    a: "Sí. Activa la verificación en 2 pasos en account.microsoft.com/security y crea una contraseña de aplicación. Funciona también con Hotmail y Microsoft 365.",
  },
  {
    q: "¿Mis contraseñas están seguras?",
    a: "Las credenciales se guardan en una base de datos SQLite local en tu equipo (%APPDATA%\\ZMail\\zmail.db). No se envían a ningún servidor. Para mayor protección puedes cifrar tu disco con BitLocker.",
  },
  {
    q: "¿Envía datos a terceros?",
    a: "No. ZMail no incluye telemetría, analíticas ni anuncios. Solo se conecta a los servidores IMAP/SMTP de tu proveedor de correo.",
  },
  {
    q: "¿Puedo usarlo en varios equipos?",
    a: "Sí. Copia el archivo ZMail.exe donde quieras. Los datos son locales en cada equipo; si quieres sincronizar configuración, copia la carpeta %APPDATA%\\ZMail manualmente.",
  },
  {
    q: "¿Qué versión de Windows necesito?",
    a: "Windows 10 o Windows 11 de 64 bits. No funciona en Windows 7/8 ni en versiones de 32 bits.",
  },
  {
    q: "¿Es código abierto?",
    a: "Sí, licencia MIT. El código está en " + GITHUB_URL + ". Aceptamos PRs y reportes de bugs.",
  },
  {
    q: "¿Puedo cifrar los correos?",
    a: "Sí, con PGP (pgpy). Ajustes → Claves PGP → genera un par RSA 4096. Al redactar marca 'Cifrar con PGP' y selecciona la clave del destinatario.",
  },
];

export default function HomePage() {
  const { loading, stats, refresh } = useStats();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <main className="relative overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-[#2a313c] bg-[#0f1419]/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-bold tracking-tight">
              ZMail
            </span>
            <span className="rounded-md bg-[#161b22] px-2 py-0.5 text-xs text-[#8b949e]">
              v{stats?.latest?.version ?? "1.0.0"}
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 text-sm text-[#8b949e] transition-colors hover:bg-[#1c2330] hover:text-[#e6edf3]"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver código en GitHub"
              className="hidden h-10 w-10 items-center justify-center rounded-lg border border-[#2a313c] text-[#8b949e] transition-colors hover:border-[#5e72e4] hover:text-[#e6edf3] sm:flex"
            >
              <Github className="h-5 w-5" aria-hidden />
            </a>
            <a href="#descargar" className="hidden sm:block">
              <Button size="sm">
                <Download className="h-4 w-4" aria-hidden />
                Descargar
              </Button>
            </a>
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a313c] text-[#8b949e] md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-[#2a313c] bg-[#0f1419] px-4 py-3 md:hidden">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-[#8b949e] hover:bg-[#1c2330] hover:text-[#e6edf3]"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <Hero loading={loading} stats={stats} />
      <FeaturesSection />
      <ComparisonSection />
      <DownloadSection loading={loading} stats={stats} onStats={refresh} />
      <GettingStartedSection />
      <FaqSection />
      <FinalCTA loading={loading} onDone={refresh} />
      <Footer />
    </main>
  );
}

function Logo() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#5e72e4] to-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/30">
      <Mail className="h-5 w-5" aria-hidden />
    </div>
  );
}

/* -------------------- HERO -------------------- */
function Hero({ loading, stats }: { loading: boolean; stats: Stats | null }) {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-radial-violet"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2a313c] bg-[#161b22]/70 px-4 py-1.5 text-xs text-[#8b949e] backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2d8659]" aria-hidden />
          100% gratis · sin telemetría · sin límite de cuentas
        </div>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Tu correo,
          <br />
          <span className="text-gradient animate-gradient">tu privacidad.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-[#8b949e] sm:text-lg">
          Cliente de correo para Windows estilo eM Client, con tema oscuro moderno.
          Multi-cuenta, contactos, calendario, tareas, reglas automáticas y cifrado PGP.
          Todo en un solo .exe.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#descargar" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="animate-pulse-glow w-full sm:w-auto"
            >
              <Download className="h-5 w-5" aria-hidden />
              Descargar ZMail para Windows
            </Button>
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Github className="h-5 w-5" aria-hidden />
              Ver código fuente
            </Button>
          </a>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <StatsRow loading={loading} stats={stats} />
        </div>
      </div>
    </section>
  );
}

/* -------------------- FEATURES -------------------- */
function FeaturesSection() {
  return (
    <section id="funciones" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          tag="Funciones"
          title="Todo lo que necesitas, en una sola app"
          subtitle="Las herramientas esenciales para gestionar correo, agenda y tareas, sin saltar entre aplicaciones."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-[#2a313c] bg-[#161b22] p-6 transition-all hover:border-[#5e72e4]/40 hover:bg-[#1c2330]"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-[#5e72e4]/20 to-[#7c3aed]/20 text-[#5e72e4] ring-1 ring-[#5e72e4]/30 transition-transform group-hover:scale-110">
                <f.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#e6edf3]">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#8b949e]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- COMPARISON -------------------- */
function ComparisonSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          tag="Comparativa"
          title="ZMail vs eM Client"
          subtitle="Lo que pagarías en eM Client Pro, aquí es gratis."
        />

        <div className="mt-12 overflow-x-auto rounded-xl border border-[#2a313c]">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#2a313c] bg-[#161b22]">
                <th className="px-4 py-3 font-semibold text-[#e6edf3]">Característica</th>
                <th className="px-4 py-3 text-center font-semibold text-[#5e72e4]">ZMail</th>
                <th className="px-4 py-3 text-center font-semibold text-[#8b949e]">eM Client</th>
                <th className="hidden px-4 py-3 font-semibold text-[#8b949e] sm:table-cell">Nota</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr
                  key={row.feature}
                  className={i % 2 === 0 ? "bg-[#0f1419]" : "bg-[#161b22]/60"}
                >
                  <td className="px-4 py-3 text-[#e6edf3]">{row.feature}</td>
                  <td className="px-4 py-3 text-center font-semibold text-[#2d8659]">{row.zmail}</td>
                  <td className="px-4 py-3 text-center text-[#b91c1c]">{row.emclient}</td>
                  <td className="hidden px-4 py-3 text-xs text-[#8b949e] sm:table-cell">
                    {row.note ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* -------------------- DOWNLOAD -------------------- */
function DownloadSection({
  loading,
  stats,
  onStats,
}: {
  loading: boolean;
  stats: Stats | null;
  onStats: (s: Stats) => void;
}) {
  const version = stats?.latest?.version ?? "1.0.0";
  const releasedAt = stats?.latest?.releasedAt;
  const changelog = stats?.latest?.changelog;

  return (
    <section
      id="descargar"
      className="relative isolate overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-radial-violet opacity-70"
      />
      <div className="mx-auto max-w-3xl text-center">
        <SectionHeading
          tag="Descarga"
          title="Empieza en 60 segundos"
          subtitle="Un solo .exe portable. Sin instalador, sin registros, sin límites."
        />

        <div className="mt-12 rounded-2xl border border-[#2a313c] bg-[#161b22] p-8 sm:p-10">
          <div className="mx-auto mb-6 flex h-20 w-20 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-[#5e72e4] to-[#7c3aed] shadow-2xl shadow-[#7c3aed]/40">
            <Mail className="h-10 w-10 text-white" aria-hidden />
          </div>

          <h3 className="text-2xl font-bold">ZMail v{version}</h3>
          <p className="mt-1 text-sm text-[#8b949e]">
            Windows 10/11 · 64-bit · {releasedAt ? `Publicado ${releasedAt.slice(0, 10)}` : "Portable"}
          </p>

          {changelog && (
            <p className="mx-auto mt-4 max-w-md text-sm text-[#8b949e]">{changelog}</p>
          )}

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DownloadButton
              size="lg"
              version={version}
              onStats={onStats}
              className="animate-pulse-glow w-full sm:w-auto"
            />
            <a
              href={`${GITHUB_URL}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Versiones anteriores
              </Button>
            </a>
          </div>

          <Sha256Box stats={stats} />
        </div>

        {loading && (
          <p className="mt-4 text-xs text-[#8b949e]">Cargando información de versión…</p>
        )}
      </div>
    </section>
  );
}

/* -------------------- GETTING STARTED -------------------- */
function GettingStartedSection() {
  return (
    <section id="empezar" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          tag="Cómo empezar"
          title="De cero a correo en 4 pasos"
          subtitle="El único punto delicado: las contraseñas de aplicación de Gmail y Outlook."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-xl border border-[#2a313c] bg-[#161b22] p-6"
            >
              <div className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#5e72e4] to-[#7c3aed] text-sm font-bold text-white shadow-lg shadow-[#7c3aed]/40">
                {i + 1}
              </div>
              <h3 className="mt-3 text-base font-semibold text-[#e6edf3]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8b949e]">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-[#5e72e4]/30 bg-gradient-to-br from-[#5e72e4]/10 to-[#7c3aed]/10 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-[#e6edf3]">
            Cómo crear tu contraseña de aplicación
          </h3>
          <p className="mt-2 text-sm text-[#8b949e]">
            ZMail usa contraseñas de aplicación (no OAuth2). Es más simple y no requiere
            revisiones de Google/Microsoft. Para cada proveedor:
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[#e6edf3]">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#161b22] text-xs font-bold text-[#5e72e4]">1</span>
              <span>
                <strong className="text-[#e6edf3]">Gmail:</strong> activa la{" "}
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5e72e4] underline-offset-2 hover:underline"
                >
                  verificación en 2 pasos
                </a>
                , luego crea tu contraseña en{" "}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5e72e4] underline-offset-2 hover:underline"
                >
                  myaccount.google.com/apppasswords
                </a>
                .
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#161b22] text-xs font-bold text-[#5e72e4]">2</span>
              <span>
                <strong className="text-[#e6edf3]">Outlook / Hotmail:</strong> activa 2FA en{" "}
                <a
                  href="https://account.microsoft.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5e72e4] underline-offset-2 hover:underline"
                >
                  account.microsoft.com/security
                </a>{" "}
                y crea una contraseña de aplicación.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#161b22] text-xs font-bold text-[#5e72e4]">3</span>
              <span>
                Pega la contraseña de 16 letras en <strong>Ajustes → Cuentas → Contraseña</strong>.
                No uses tu contraseña habitual.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------- FAQ -------------------- */
function FaqSection() {
  return (
    <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          tag="FAQ"
          title="Preguntas frecuentes"
          subtitle="Todo lo que necesitas saber antes de instalar."
        />
        <Accordion type="single" collapsible className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* -------------------- FINAL CTA -------------------- */
function FinalCTA({
  loading,
  onDone,
}: {
  loading: boolean;
  onDone: (s: Stats) => void;
}) {
  return (
    <section className="relative isolate overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-radial-violet"
      />
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          ¿Listo para retomar el <span className="text-gradient">control</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-[#8b949e] sm:text-lg">
          Descarga ZMail ahora. Sin cuenta, sin registro, sin telemetría. Solo tu correo,
          como debe ser.
        </p>
        <div className="mt-8 flex justify-center">
          <DownloadButton
            size="lg"
            onStats={onDone}
            label="Descargar ZMail para Windows"
            className={loading ? "" : "animate-pulse-glow"}
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------- FOOTER -------------------- */
function Footer() {
  return (
    <footer className="border-t border-[#2a313c] bg-[#0f1419] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-lg font-bold">ZMail</span>
            </div>
            <p className="mt-4 max-w-md text-sm text-[#8b949e]">
              Cliente de correo para Windows estilo eM Client. Multi-cuenta, contactos,
              calendario, tareas, reglas automáticas y cifrado PGP. Código abierto, sin
              telemetría.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#e6edf3]">Navegación</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <FooterLink href="#funciones" label="Funciones" />
              <FooterLink href="#descargar" label="Descargar" />
              <FooterLink href="#empezar" label="Cómo empezar" />
              <FooterLink href="#faq" label="FAQ" />
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#e6edf3]">Recursos</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <FooterLink href={GITHUB_URL} external label="GitHub" />
              <FooterLink href={`${GITHUB_URL}/releases`} external label="Versiones" />
              <FooterLink href={`${GITHUB_URL}/issues`} external label="Reportar bug" />
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#2a313c] pt-6 text-center text-xs text-[#8b949e]">
          © {new Date().getFullYear()} ZMail Project · MIT License · Hecho con PySide6 y Next.js
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="text-[#8b949e] transition-colors hover:text-[#5e72e4]"
      >
        {label}
      </a>
    </li>
  );
}

/* -------------------- COMMON -------------------- */
function SectionHeading({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <span className="inline-block rounded-full border border-[#5e72e4]/30 bg-[#5e72e4]/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#5e72e4]">
        {tag}
      </span>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-base text-[#8b949e]">{subtitle}</p>
      )}
    </div>
  );
}
