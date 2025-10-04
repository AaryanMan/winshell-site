"use client";

import dynamic from "next/dynamic";
import { DownloadCard } from "@/components/download-card";
import { ShaderAnimation } from "@/components/shader-animation";

const PdfScrollViewer = dynamic(
  () => import("@/components/pdf-scroll-viewer").then((mod) => mod.PdfScrollViewer),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto flex h-[50vh] w-full max-w-5xl items-center justify-center rounded-3xl border border-white/10 bg-slate-950/60 text-sm uppercase tracking-[0.3em] text-slate-300">
        Preparing report…
      </div>
    ),
  }
);

const infoBlocks: string[][] = [
  ["Winshell - People"],
  [
    "Submitted by:",
    "AASHITA BHANDARI (23UCSE4055)",
    "HARSH RAJANI (23UCSE4013)",
    "AARYAN CHOUDHARY (23UCSE4002)",
  ],
  ["OCTOBER 2025"],
];

const downloadCards = [
  {
    platform: "Windows" as const,
    fileName: "WinShell-Windows-Installer.exe",
    href: "/downloads/WinShell-Windows-Installer.exe",
    description: "Native installer with polished desktop shell, CLI integration, and Windows service hooks for seamless deployment.",
    accent: "cyan" as const,
  },
  {
    platform: "Linux" as const,
    fileName: "WinShell-Linux-Installer.deb",
    href: "/downloads/WinShell-Linux-Installer.deb",
    description: "Debian package featuring the cross-platform shell, bundled CLI tools, and systemd units for rapid rollout.",
    accent: "violet" as const,
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <ShaderAnimation />
      <div className="relative z-10 flex min-h-screen flex-col">
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-32 sm:px-10">
          <div className="pointer-events-none absolute inset-0 bg-slate-950/30" />
          <div className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-48 max-w-3xl rounded-full bg-gradient-to-r from-cyan-500/8 via-sky-500/5 to-purple-500/8 blur-3xl" />

          <header className="relative z-10 flex flex-col items-center gap-6 text-center">
            <span className="text-xs uppercase tracking-[0.5em] text-slate-200/80">Project Prototype • MBM University 7th Semester</span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">WinShell — Unified Shell Experience</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-200/80 sm:text-base">
              C# , .NET 8.0
            </p>
          </header>

          <div className="relative z-10 mt-16 w-full max-w-6xl">
            <div className="grid gap-8 md:grid-cols-2">
              {downloadCards.map((card) => (
                <DownloadCard key={card.platform} {...card} />
              ))}
            </div>

            <div className="mt-16 flex flex-col items-center gap-6 text-center">
              {infoBlocks.map((lines, index) => (
                <div key={index} className="space-y-1 text-xs uppercase tracking-[0.4em] text-slate-200/80 sm:text-sm">
                  {lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ))}
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                This project-prototype is made by Harsh Rajani and team (MBM University, CSE, Jodhpur).
              </p>
            </div>

            <div className="mt-20 flex flex-col items-center gap-4 text-sm uppercase tracking-[0.4em] text-slate-300/70">
              <span className="animate-bounce text-xs">Scroll to dive into the report</span>
              <span className="h-10 w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent" />
            </div>
          </div>
        </section>

        <section className="relative pb-32">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950" />
          <div className="relative z-10 px-4 sm:px-6 lg:px-10">
            <PdfScrollViewer />
          </div>
        </section>
      </div>
    </main>
  );
}
