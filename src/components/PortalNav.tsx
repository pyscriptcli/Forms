"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileEdit, PackageSearch, ShieldCheck, Workflow, ExternalLink, Sparkles } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

export function PortalNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      label: "New Form",
      href: "/",
      icon: FileEdit,
      isActive: pathname === "/" || pathname === "/form",
    },
    {
      label: "Track Status",
      href: "/track",
      icon: PackageSearch,
      isActive: pathname.startsWith("/track"),
    },
    {
      label: "Approvals",
      href: "/approvals",
      icon: ShieldCheck,
      isActive: pathname.startsWith("/approvals"),
    },
    {
      label: "Workflow",
      href: "/workflow",
      icon: Workflow,
      isActive: pathname.startsWith("/workflow"),
    },
  ];

  return (
    <header className="w-full bg-[#181A1D] text-white border-b border-[#0F1012] shadow-md sticky top-0 z-50">
      {/* Top Gold Accent Bar */}
      <div className="h-[3px] w-full bg-[#C9AB4C]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#C9AB4C] flex items-center justify-center font-serif font-black text-[#181A1D] text-base shadow-xs shrink-0">
            P
          </div>
          <span
            className="font-serif italic font-bold text-xl sm:text-2xl tracking-tight text-white group-hover:text-[#C9AB4C] transition-colors leading-none"
            style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif" }}
          >
            Forms Portal
          </span>
        </Link>

        {/* Center / Right: Navigation Tabs */}
        <div id="portal-nav-track-links" className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-8 px-3 text-xs font-semibold flex items-center gap-1.5 transition-all rounded-none ${
                  item.isActive
                    ? "bg-white text-[#181A1D] font-bold shadow-sm border-b-2 border-[#C9AB4C]"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Prototype Tour Button */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-prototype-drawer"));
              }
            }}
            className="h-8 px-2.5 text-xs font-bold text-[#C9AB4C] bg-[#C9AB4C]/15 hover:bg-[#C9AB4C]/25 border border-[#C9AB4C]/40 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Walkthrough & Guide"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9AB4C]" />
            <span>Tour</span>
          </button>

          <div className="h-4 w-[1px] bg-white/20 mx-1 hidden sm:block" />

          {/* User Auth */}
          <div className="flex items-center">
            {session && (
              <div className="flex items-center gap-2 h-8 px-2.5 text-xs text-white">
                {session.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-5 h-5 rounded-full border border-slate-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#003366] border border-blue-400 flex items-center justify-center font-bold text-[10px]">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="hidden sm:inline-block font-medium truncate max-w-[100px]">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="ml-1 text-[10px] uppercase font-bold text-slate-400 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
