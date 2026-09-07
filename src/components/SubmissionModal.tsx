"use client";

import React, { useState } from "react";
import { CheckCircle2, ExternalLink, Download, Copy, Check, FileText, ArrowRight } from "lucide-react";
import { SubmissionResponse } from "@/types/rfp";
import { downloadPdfBlob } from "@/lib/pdfGenerator";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: SubmissionResponse | null;
  pdfBlob: Blob | null;
  payeeName: string;
}

export function SubmissionModal({
  isOpen,
  onClose,
  response,
  pdfBlob,
  payeeName,
}: SubmissionModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !response) return null;

  const editUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?taskId=${response.taskId}`
    : "";

  const handleCopyLink = () => {
    if (editUrl) {
      navigator.clipboard.writeText(editUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const sanitized = (payeeName || "Request").replace(/[^a-zA-Z0-9_-]/g, "_");
      downloadPdfBlob(pdfBlob, `RFP_${sanitized}_${new Date().toISOString().split("T")[0]}.pdf`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-700 to-[#1e3a8a] px-8 pt-8 pb-6 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-xs ring-8 ring-white/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {response.message || "RFP Successfully Processed!"}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Official Request for Payment document generated & synchronized
          </p>

          {response.isMock && (
            <div className="inline-block mt-3 px-3 py-1 bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-semibold rounded-full">
              ⚡ Simulation Mode: Real ClickUp token not set yet
            </div>
          )}
        </div>

        {/* Details Content */}
        <div className="p-8 space-y-6">
          {/* Task Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                ClickUp Task ID
              </p>
              <p className="text-lg font-mono font-bold text-slate-800">
                #{response.taskId}
              </p>
            </div>

            {response.taskUrl && !response.isMock ? (
              <a
                href={response.taskUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
              >
                <span>View Task in ClickUp</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="text-xs text-slate-500 italic bg-white px-3 py-1.5 rounded-md border border-slate-200">
                Mock Task #{response.taskId}
              </div>
            )}
          </div>

          {/* Workflow Next Steps */}
          <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Automated Next Step in Workflow
            </h4>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Your Team Leader has been notified in ClickUp for review. Once approved, the request will be automatically routed to the Finance Officer for payment disbursement.
            </p>
          </div>

          {/* Actions grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pdfBlob && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow transition-all"
              >
                <Download className="w-4 h-4 text-slate-300" />
                Download RFP PDF
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Revision Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Revision Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
