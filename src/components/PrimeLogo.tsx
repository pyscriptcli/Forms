"use client";

import React from "react";

export function PrimeLogo({ className = "h-12" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="font-extrabold text-2xl tracking-tighter text-[#1e3a8a] font-sans">
            PRIME
          </span>
          {/* Double Chevron graphic */}
          <div className="flex items-center ml-1.5 space-x-[-5px]">
            <svg
              className="w-6 h-6 text-[#0284c7]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="4,2 14,12 4,22 8,22 18,12 8,2" />
            </svg>
            <svg
              className="w-6 h-6 text-[#1e3a8a]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="4,2 14,12 4,22 8,22 18,12 8,2" />
            </svg>
          </div>
        </div>
        <span className="text-[9px] tracking-[0.25em] text-[#dc2626] font-bold uppercase mt-[-4px]">
          Philippines
        </span>
      </div>
    </div>
  );
}
