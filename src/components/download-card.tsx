"use client";

import type { CSSProperties, MouseEvent, TouchEvent } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine } from "lucide-react";

import { cn } from "@/lib/utils";

type DownloadCardProps = {
  platform: "Windows" | "Linux";
  fileName: string;
  href: string;
  description: string;
  accent: "cyan" | "violet";
};

type PointerType = MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>;

type ButtonPointerType = MouseEvent<HTMLAnchorElement> | TouchEvent<HTMLAnchorElement>;

const glowVars: Record<DownloadCardProps["accent"], { card: string; button: string }> = {
  cyan: {
    card: "rgba(56, 189, 248, 0.45)",
    button: "rgba(125, 211, 252, 0.65)",
  },
  violet: {
    card: "rgba(196, 181, 253, 0.4)",
    button: "rgba(233, 213, 255, 0.7)",
  },
};

export function DownloadCard(props: DownloadCardProps) {
  const { platform, fileName, href, description, accent } = props;
  const [cardCoords, setCardCoords] = useState({ x: "50%", y: "50%" });
  const [buttonCoords, setButtonCoords] = useState({ x: "50%", y: "50%" });

  const handleCardPointer = (event: PointerType) => {
    const { clientX, clientY, currentTarget } = getPointerContext(event);
    if (!clientX || !clientY) return;
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setCardCoords({ x: `${x}%`, y: `${y}%` });
  };

  const resetCardGlow = () => setCardCoords({ x: "50%", y: "50%" });

  const handleButtonPointer = (event: ButtonPointerType) => {
    const { clientX, clientY, currentTarget } = getPointerContext(event);
    if (!clientX || !clientY) return;
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setButtonCoords({ x: `${x}%`, y: `${y}%` });
  };

  const resetButtonGlow = () => setButtonCoords({ x: "50%", y: "50%" });

  return (
    <motion.div
      onMouseMove={handleCardPointer}
      onTouchMove={handleCardPointer}
      onMouseLeave={resetCardGlow}
      onTouchEnd={resetCardGlow}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-[1px] backdrop-blur-xl transition-colors duration-500 hover:border-white/20"
      style={{
        "--card-x": cardCoords.x,
        "--card-y": cardCoords.y,
        "--card-glow": glowVars[accent].card,
      } as CSSProperties}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 180, damping: 20, mass: 0.8 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="relative h-full w-full rounded-[28px] bg-slate-950/50 p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" style={gradientStyle("card")} />
        <div className="relative z-10 flex h-full flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300/80">{platform}</p>
            <h3 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{`WinShell for ${platform}`}</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-200/80 sm:text-base">{description}</p>
          <div className="mt-auto">
            <a
              href={href}
              download={fileName}
              className={cn(
                "group/button relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-base font-semibold uppercase tracking-[0.25em] text-white shadow-[0_0_20px_rgba(56,189,248,0.2)] transition duration-500 hover:shadow-[0_0_45px_rgba(191,219,254,0.4)] focus-visible:ring-2 focus-visible:ring-white/40",
                accent === "violet" && "shadow-[0_0_20px_rgba(196,181,253,0.25)] hover:shadow-[0_0_45px_rgba(221,214,254,0.5)]"
              )}
              style={{
                "--btn-x": buttonCoords.x,
                "--btn-y": buttonCoords.y,
                "--btn-glow": glowVars[accent].button,
              } as CSSProperties}
              onMouseMove={handleButtonPointer}
              onTouchMove={handleButtonPointer}
              onMouseLeave={resetButtonGlow}
              onTouchEnd={resetButtonGlow}
            >
              <span className="relative z-10">{fileName}</span>
              <ArrowDownToLine className="relative z-10 h-5 w-5" aria-hidden />
              <span className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover/button:opacity-100" style={gradientStyle("button")} />
              <span className="pointer-events-none absolute -inset-y-1 -left-1/2 h-[150%] w-[200%] translate-x-[-100%] rotate-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition duration-700 group-hover/button:translate-x-[50%] group-hover/button:opacity-60" />
            </a>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">Direct installer • 100% offline setup</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getPointerContext(event: PointerType | ButtonPointerType) {
  if ("touches" in event) {
    const touch = event.touches[0];
    return {
      clientX: touch?.clientX,
      clientY: touch?.clientY,
      currentTarget: event.currentTarget,
    };
  }

  return {
    clientX: (event as MouseEvent<HTMLDivElement>).clientX,
    clientY: (event as MouseEvent<HTMLDivElement>).clientY,
    currentTarget: event.currentTarget,
  };
}

function gradientStyle(scope: "card" | "button") {
  const radius = scope === "card" ? 320 : 200;
  const variablePrefix = scope === "card" ? "--card" : "--btn";

  return {
    background: `radial-gradient(${radius}px circle at var(${variablePrefix}-x) var(${variablePrefix}-y), var(${variablePrefix}-glow), transparent 70%)`,
  } satisfies CSSProperties;
}
