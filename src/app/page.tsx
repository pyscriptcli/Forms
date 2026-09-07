"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { RfpFormData, RfpLineItem, SubmissionResponse, SupportingFile } from "@/types/rfp";
import { RfpSheet } from "@/components/RfpSheet";
import { Toolbar } from "@/components/Toolbar";
import { SupportingDocuments } from "@/components/SupportingDocuments";
import { SubmissionModal } from "@/components/SubmissionModal";
import { generateRfpPdf, downloadPdfBlob } from "@/lib/pdfGenerator";
import { AlertCircle, CheckCircle2, Info, Building2, HelpCircle } from "lucide-react";

const getInitialFormData = (): RfpFormData => {
  const today = new Date().toISOString().split("T")[0];
  const initialItems: RfpLineItem[] = [
    { id: "row-1", description: "", qty: "", unit: "pcs", unitPrice: "", amount: 0 },
    { id: "row-2", description: "", qty: "", unit: "lot", unitPrice: "", amount: 0 },
    { id: "row-3", description: "", qty: "", unit: "", unitPrice: "", amount: 0 },
    { id: "row-4", description: "", qty: "", unit: "", unitPrice: "", amount: 0 },
    { id: "row-5", description: "", qty: "", unit: "", unitPrice: "", amount: 0 },
  ];

  return {
    date: today,
    payee: "",
    department: "",
    items: initialItems,
    totalAmount: 0,
    purpose: "",
    paymentMethod: "online",
    bank: "",
    accountName: "",
    accountNumber: "",
    urgency: "not_urgent",
    dateNeeded: "",
    requestedByName: "",
    requestedByEmail: "",
    signatureType: "none",
    signatureDataUrl: "",
    requestedByRemarks: "",
  };
};

function RfpAppContent() {
  const searchParams = useSearchParams();
  const taskIdParam = searchParams.get("taskId");

  const [formData, setFormData] = useState<RfpFormData>(getInitialFormData);
  const [rawSupportingFiles, setRawSupportingFiles] = useState<File[]>([]);
  const [supportingFilesList, setSupportingFilesList] = useState<SupportingFile[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success dialog state
  const [submissionResponse, setSubmissionResponse] = useState<SubmissionResponse | null>(null);
  const [lastGeneratedPdf, setLastGeneratedPdf] = useState<Blob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load existing task if in revision mode
  useEffect(() => {
    if (taskIdParam) {
      setFormData((prev) => ({ ...prev, taskId: taskIdParam }));
      fetchTaskData(taskIdParam);
    } else {
      // Try restoring local draft if present
      const saved = localStorage.getItem("prime_rfp_draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && !parsed.taskId) {
            setFormData(parsed);
          }
        } catch (e) {
          console.error("Failed to parse saved draft:", e);
        }
      }
    }
  }, [taskIdParam]);

  // Auto-save draft changes
  useEffect(() => {
    if (!formData.taskId && formData.payee) {
      localStorage.setItem("prime_rfp_draft", JSON.stringify(formData));
    }
  }, [formData]);

  const fetchTaskData = async (id: string) => {
    try {
      const res = await fetch(`/api/rfp/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.task) {
          // If custom fields are returned, can prefill further
          console.log("Loaded existing ClickUp task for revision:", json.task);
        }
      }
    } catch (e) {
      console.warn("Could not load task details for revision:", e);
    }
  };

  const handleAddItem = () => {
    const newItem: RfpLineItem = {
      id: Math.random().toString(36).substring(2, 9),
      description: "",
      qty: "",
      unit: "",
      unitPrice: "",
      amount: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset this form? All unsaved inputs will be cleared.")) {
      localStorage.removeItem("prime_rfp_draft");
      setFormData(getInitialFormData());
      setRawSupportingFiles([]);
      setSupportingFilesList([]);
      setErrorMessage(null);
    }
  };

  const handlePreviewPdf = async () => {
    setIsGeneratingPdf(true);
    setErrorMessage(null);
    try {
      const { blob } = await generateRfpPdf("rfp-printable-sheet");
      const sanitizedPayee = (formData.payee || "Payee").replace(/[^a-zA-Z0-9_-]/g, "_");
      downloadPdfBlob(blob, `RFP_${sanitizedPayee}_${formData.date || "document"}.pdf`);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setErrorMessage("Failed to generate PDF. Please ensure all fields are properly formatted.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    // Validation
    if (!formData.payee.trim()) {
      setErrorMessage("Please specify the PAYEE name.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.requestedByName.trim()) {
      setErrorMessage("Please enter your printed name under 'Requested By'.");
      return;
    }

    if (!formData.totalAmount || formData.totalAmount <= 0) {
      setErrorMessage("Please add at least one line item with valid Quantity and Unit Price.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate official high-resolution PDF Blob
      const { blob: pdfBlob } = await generateRfpPdf("rfp-printable-sheet");
      setLastGeneratedPdf(pdfBlob);

      // 2. Prepare multipart FormData payload
      const submissionData = new FormData();
      submissionData.append("data", JSON.stringify(formData));

      // Append generated PDF
      const sanitizedPayee = (formData.payee || "RFP").replace(/[^a-zA-Z0-9_-]/g, "_");
      submissionData.append("pdf", pdfBlob, `RFP_${sanitizedPayee}_${formData.date}.pdf`);

      // Append all raw supporting files
      rawSupportingFiles.forEach((file) => {
        submissionData.append("supportingFiles", file);
      });

      // 3. Post to backend
      const res = await fetch("/api/rfp/submit", {
        method: "POST",
        body: submissionData,
      });

      const json: SubmissionResponse = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to submit RFP to ClickUp");
      }

      // Success
      setSubmissionResponse(json);
      setIsModalOpen(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Clear draft
      localStorage.removeItem("prime_rfp_draft");
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage(err.message || "Failed to complete submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 text-slate-900 py-6 px-3 sm:px-6 flex flex-col items-center">
      {/* Container */}
      <div className="w-full max-w-5xl">
        {/* Top App Header */}
        <header className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-700 text-white rounded-xl shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Prime Philippines RFP Portal
              </h1>
              <p className="text-xs text-slate-500">
                Official Request for Payment generator & ClickUp automation workflow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold">ClickUp REST v2 Connected</span>
          </div>
        </header>

        {/* Error banner */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Floating Action Toolbar */}
        <Toolbar
          onAddItem={handleAddItem}
          onPreviewPdf={handlePreviewPdf}
          onReset={handleReset}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isGeneratingPdf={isGeneratingPdf}
          isRevision={Boolean(formData.taskId)}
          taskId={formData.taskId}
          totalAmount={formData.totalAmount}
        />

        {/* Document First Paper Sheet */}
        <main className="mb-8">
          <RfpSheet data={formData} onChange={setFormData} />
        </main>

        {/* Supporting Documents Section */}
        <section className="mb-12 max-w-[850px] mx-auto">
          <SupportingDocuments
            files={supportingFilesList}
            onFilesChange={setSupportingFilesList}
            rawFiles={rawSupportingFiles}
            onRawFilesChange={setRawSupportingFiles}
          />
        </section>

        {/* Bottom footer */}
        <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200">
          <p>© {new Date().getFullYear()} Property Interactive Marketing Enterprise Realty Corp. (PRIME Philippines)</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Form Frontend Wrapper for ClickUp • Next.js & Vercel Ready
          </p>
        </footer>
      </div>

      {/* Submission Success / Confirmation Modal */}
      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        response={submissionResponse}
        pdfBlob={lastGeneratedPdf}
        payeeName={formData.payee}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
          Loading RFP Portal...
        </div>
      }
    >
      <RfpAppContent />
    </Suspense>
  );
}
