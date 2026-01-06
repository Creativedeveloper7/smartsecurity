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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Google Play services errors from browser extensions
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('play.google.com') || 
                      message.includes('log?format=json') ||
                      message.includes('401 (Unauthorized)') ||
                      message.includes('rs=AA2YrTuH1gsWpNYrZNoVfHgbKLfZrAwkHA')) {
                    return; // Suppress these errors
                  }
                  originalError.apply(console, args);
                };
                
                // Suppress unhandled promise rejections from external services
                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event.reason?.toString() || '';
                  if (reason.includes('play.google.com') || reason.includes('log?format=json')) {
                    event.preventDefault();
                  }
                });
              })();
            `,
          }}
        />
      </head>
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
