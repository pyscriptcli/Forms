"use client";

import React, { useRef } from "react";
import { Paperclip, UploadCloud, Trash2, FileText, Image as ImageIcon, Eye } from "lucide-react";
import { SupportingFile } from "@/types/rfp";

interface SupportingDocumentsProps {
  files: SupportingFile[];
  onFilesChange: (files: SupportingFile[]) => void;
  rawFiles: File[];
  onRawFilesChange: (rawFiles: File[]) => void;
}

export function SupportingDocuments({
  files,
  onFilesChange,
  rawFiles,
  onRawFilesChange,
}: SupportingDocumentsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFilesList = Array.from(selectedFiles);
    const updatedRaw = [...rawFiles, ...newFilesList];
    onRawFilesChange(updatedRaw);

    // Convert to previewable SupportingFile list
    const filePromises = newFilesList.map((file) => {
      return new Promise<SupportingFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target?.result as string,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((newItems) => {
      onFilesChange([...files, ...newItems]);
    });
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedRaw = rawFiles.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
    onRawFilesChange(updatedRaw);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Paperclip className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Supporting Documents
            </h3>
            <p className="text-xs text-slate-500">
              Attach receipts, vendor quotations, invoices, or statements of account
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
          {files.length} {files.length === 1 ? "file" : "files"} attached
        </span>
      </div>

      {/* Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFileSelection(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl p-6 text-center cursor-pointer transition-all"
      >
        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">
          Click to upload or drag & drop files here
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supports PDF, PNG, JPG, and DOCX (up to 25MB each)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFileSelection(e.target.files)}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {files.map((file, idx) => (
            <div
              key={file.id || idx}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-white rounded-md shadow-xs text-blue-600 shrink-0">
                  {file.type.includes("image") ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-slate-800 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                {file.dataUrl && (
                  <a
                    href={file.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-colors"
                    title="Preview file"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
