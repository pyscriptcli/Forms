"use client";

import React from "react";
import {
  Plus,
  FileDown,
  RotateCcw,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface ToolbarProps {
  onAddItem: () => void;
  onPreviewPdf: () => void;
  onReset: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isGeneratingPdf: boolean;
  isRevision: boolean;
  taskId?: string;
  totalAmount: number;
}

export function Toolbar({
  onAddItem,
  onPreviewPdf,
  onReset,
  onSubmit,
  isSubmitting,
  isGeneratingPdf,
  isRevision,
  taskId,
  totalAmount,
}: ToolbarProps) {
  const formattedTotal = Number(totalAmount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="sticky top-4 z-40 mb-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Left side: Status badge & Total Amount */}
      <div className="flex items-center gap-4">
        {isRevision ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Revision Mode: Task #{taskId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>New RFP Request</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-4">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Total
          </span>
          <span className="text-lg font-black text-slate-800 font-mono">
            ₱{formattedTotal}
          </span>
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-slate-600" />
          <span>Add Row</span>
        </button>

        <button
          type="button"
          onClick={onPreviewPdf}
          disabled={isGeneratingPdf}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-xs disabled:opacity-50"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
          ) : (
            <FileDown className="w-3.5 h-3.5 text-slate-600" />
          )}
          <span>Download PDF</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || isGeneratingPdf}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Submitting to ClickUp...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-white" />
              <span>{isRevision ? "Update in ClickUp" : "Submit to ClickUp"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
