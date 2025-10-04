import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteTitle = "WinShell | Hybrid Shell Experience";
const siteDescription =
  "WinShell blends a custom CLI and immersive GUI built with .NET C# for MBM University, Jodhpur.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "WinShell",
    "MBM University",
    "Jodhpur",
    "Custom Shell",
    ".NET",
    "CLI",
    "GUI",
    "Harsh Rajani",
  ],
  authors: [{ name: "Harsh Rajani" }, { name: "Aashita Bhandari" }, { name: "Aaryan Choudhary" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://winshell.local/",
    title: siteTitle,
    description: siteDescription,
    siteName: "WinShell",
    images: [
      {
        url: "/og/winshell-preview.png",
        width: 1200,
        height: 630,
        alt: "WinShell landing page preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: "@harshrajani",
    images: ["/og/winshell-preview.png"],
  },
  metadataBase: new URL("https://winshell.local"),
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "application-name": "WinShell",
    "theme-color": "#0f172a",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${mono.variable} min-h-screen overflow-x-hidden bg-[#020617] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
