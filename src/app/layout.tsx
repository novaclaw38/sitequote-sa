import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteQuote SA — Voice & video quotes for builders",
  description:
    "South African construction quoting from site voice notes and walkthrough videos with live supplier pricing.",
  applicationName: "SiteQuote SA",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SiteQuote",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-zinc-100 bg-black selection:bg-amber-500/30 selection:text-amber-200">
        <div className="mesh-bg" />
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
