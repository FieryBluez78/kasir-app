import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { SessionProvider } from "@/lib/session-provider";
import { getSession } from "@/lib/auth/session";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "Toko Kasir — Sistem Kasir & Administrasi Toko",
  description: "Modern POS, inventory, and store administration dashboard.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolved once here (Server Component) so SessionProvider can start with
  // the real session immediately instead of showing a Cashier-restricted
  // placeholder for a moment while the client fetches /api/auth/me.
  const session = await getSession();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} font-sans`}>
        <ThemeProvider>
          <LanguageProvider>
            <SessionProvider initialSession={session}>
              {children}
              <Toaster richColors position="top-center" />
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
