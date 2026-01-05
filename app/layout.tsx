import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { NextAuthSessionProvider } from "@/components/providers/session-provider";
import { FontAwesomeLoader } from "@/components/font-awesome-loader";

export const metadata: Metadata = {
  title: "SmartSecurity Consult | Expert Security Services in Kenya",
  description: "Professional security consultation services by a senior government security expert with extensive experience in high-level policing, security detail, intelligence, and criminal handling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased">
        <FontAwesomeLoader />
        <NextAuthSessionProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
