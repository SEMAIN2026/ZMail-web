import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "ZMail · Tu correo, tu privacidad.",
  description:
    "Cliente de correo para Windows estilo eM Client, con tema oscuro moderno. Multi-cuenta, contactos, calendario, tareas, reglas automáticas y cifrado PGP.",
  keywords: [
    "cliente de correo",
    "windows",
    "imap",
    "smtp",
    "gmail",
    "outlook",
    "pgp",
    "open source",
    "eM Client",
  ],
  authors: [{ name: "ZMail Project" }],
  openGraph: {
    title: "ZMail · Tu correo, tu privacidad.",
    description:
      "Cliente de correo para Windows estilo eM Client, con tema oscuro moderno. Multi-cuenta, PGP y sin telemetría.",
    type: "website",
    locale: "es_ES",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0f1419] text-[#e6edf3] antialiased">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#161b22",
              border: "1px solid #2a313c",
              color: "#e6edf3",
            },
          }}
        />
      </body>
    </html>
  );
}
