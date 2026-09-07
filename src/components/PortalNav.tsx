"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileEdit, PackageSearch, ShieldCheck, Workflow, ExternalLink } from "lucide-react";

export function PortalNav() {
  const pathname = usePathname();

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
        <div className="flex items-center gap-1 sm:gap-2">
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

          <div className="h-4 w-[1px] bg-white/20 mx-1 hidden sm:block" />

          {/* Finance ClickUp Direct Link */}
          <a
            href="https://app.clickup.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-2.5 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 hover:bg-white/10 transition-colors hidden md:flex"
            title="Open ClickUp Workspace (Finance view)"
          >
            <span>ClickUp (Finance)</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </header>
  );
}
