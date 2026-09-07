"use client";

import React, { useState } from "react";
import { RfpFormData, RfpLineItem, PaymentMethod, UrgencyLevel } from "@/types/rfp";
import { PrimeLogo } from "./PrimeLogo";
import { Trash2, Plus, PenTool, CheckCircle, HelpCircle } from "lucide-react";
import { SignatureModal } from "./SignatureModal";

interface RfpSheetProps {
  data: RfpFormData;
  onChange: (data: RfpFormData) => void;
}

export function RfpSheet({ data, onChange }: RfpSheetProps) {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Field updater
  const updateField = <K extends keyof RfpFormData>(field: K, value: RfpFormData[K]) => {
    onChange({ ...data, [field]: value });
  };

  // Line item handlers
  const handleItemChange = (index: number, key: keyof RfpLineItem, val: any) => {
    const updatedItems = [...data.items];
    const current = { ...updatedItems[index], [key]: val };

    // Auto-calculate amount
    const qtyNum = typeof current.qty === "number" ? current.qty : parseFloat(String(current.qty)) || 0;
    const priceNum = typeof current.unitPrice === "number" ? current.unitPrice : parseFloat(String(current.unitPrice)) || 0;
    current.amount = qtyNum * priceNum;

    updatedItems[index] = current;

    // Recalculate total
    const newTotal = updatedItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    onChange({
      ...data,
      items: updatedItems,
      totalAmount: newTotal,
    });
  };

  const addItemRow = () => {
    const newItem: RfpLineItem = {
      id: Math.random().toString(36).substring(2, 9),
      description: "",
      qty: "",
      unit: "",
      unitPrice: "",
      amount: 0,
    };
    onChange({
      ...data,
      items: [...data.items, newItem],
    });
  };

  const removeItemRow = (index: number) => {
    if (data.items.length <= 1) return;
    const updated = data.items.filter((_, i) => i !== index);
    const newTotal = updated.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    onChange({
      ...data,
      items: updated,
      totalAmount: newTotal,
    });
  };

  const handleSignatureSave = (signatureDataUrl: string, type: "draw" | "upload") => {
    onChange({
      ...data,
      signatureDataUrl,
      signatureType: type,
    });
  };

  return (
    <div className="w-full flex justify-center py-2">
      {/* Printable Sheet Wrapper */}
      <div
        id="rfp-printable-sheet"
        className="w-full max-w-[850px] bg-white text-black p-8 md:p-10 border-2 border-black shadow-2xl relative font-sans leading-tight text-xs"
        style={{ minHeight: "1100px" }}
      >
        {/* Top Header Grid */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 pb-4">
          {/* Company Name */}
          <div className="text-center md:text-left pt-1">
            <h1 className="text-base md:text-[17px] font-bold tracking-tight text-slate-900 uppercase">
              Property Interactive Marketing Enterprise
            </h1>
            <h2 className="text-sm md:text-[15px] font-bold tracking-tight text-slate-900 uppercase mt-0.5">
              Realty Corp
            </h2>
          </div>

          {/* Logo & Title Banner */}
          <div className="flex flex-col items-end w-full md:w-auto">
            <PrimeLogo className="h-10 mb-2 mr-2" />
            <div className="w-full md:w-64 bg-[#0f2a59] text-white py-1.5 px-4 text-center">
              <span className="text-xs md:text-sm font-black tracking-wider uppercase">
                Request for Payment
              </span>
            </div>
          </div>
        </div>

        {/* Header Fields (Date, Payee, Department) */}
        <div className="grid grid-cols-12 gap-3 my-3">
          {/* Date */}
          <div className="col-span-12 sm:col-span-4 border-2 border-black rounded-lg p-2 flex items-center gap-2">
            <label className="font-bold text-xs uppercase tracking-wider shrink-0">
              DATE:
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="w-full bg-transparent font-medium text-xs focus:outline-none focus:bg-blue-50/50 rounded px-1"
            />
          </div>

          {/* Payee */}
          <div className="col-span-12 sm:col-span-8 md:col-span-5 border-2 border-black rounded-lg p-2 flex items-center gap-2">
            <label className="font-bold text-xs uppercase tracking-wider shrink-0">
              PAYEE:
            </label>
            <input
              type="text"
              placeholder="Name of recipient / vendor"
              value={data.payee}
              onChange={(e) => updateField("payee", e.target.value)}
              className="w-full bg-transparent font-medium text-xs focus:outline-none focus:bg-blue-50/50 rounded px-1"
            />
          </div>

          {/* Department */}
          <div className="col-span-12 sm:col-span-12 md:col-span-3 border-2 border-black rounded-lg p-2 flex items-center gap-2">
            <label className="font-bold text-xs uppercase tracking-wider shrink-0">
              DEPARTMENT:
            </label>
            <input
              type="text"
              placeholder="e.g. Sales, Marketing, IT"
              value={data.department}
              onChange={(e) => updateField("department", e.target.value)}
              className="w-full bg-transparent font-medium text-xs focus:outline-none focus:bg-blue-50/50 rounded px-1"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-4 border-2 border-black overflow-hidden">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-slate-50">
                <th className="border-r border-black p-2 text-center font-bold uppercase tracking-wider">
                  ITEMS/DESCRIPTION
                </th>
                <th className="border-r border-black p-2 text-center font-bold uppercase tracking-wider w-16">
                  QTY
                </th>
                <th className="border-r border-black p-2 text-center font-bold uppercase tracking-wider w-20">
                  UNIT
                </th>
                <th className="border-r border-black p-2 text-center font-bold uppercase tracking-wider w-28">
                  UNIT PRICE
                </th>
                <th className="p-2 text-center font-bold uppercase tracking-wider w-28">
                  AMOUNT
                </th>
                <th
                  data-html2canvas-ignore="true"
                  className="w-8 border-l border-black p-1 text-center font-normal no-print"
                ></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="border-b border-black group hover:bg-blue-50/30 transition-colors"
                >
                  {/* Description */}
                  <td className="border-r border-black p-1">
                    <input
                      type="text"
                      placeholder={`Line item #${idx + 1}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      className="w-full bg-transparent px-2 py-1 text-xs focus:outline-none focus:bg-white"
                    />
                  </td>

                  {/* Qty */}
                  <td className="border-r border-black p-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "qty",
                          e.target.value === "" ? "" : parseFloat(e.target.value)
                        )
                      }
                      className="w-full text-center bg-transparent px-1 py-1 text-xs focus:outline-none focus:bg-white font-mono"
                    />
                  </td>

                  {/* Unit */}
                  <td className="border-r border-black p-1">
                    <input
                      type="text"
                      placeholder="pcs/lot"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                      className="w-full text-center bg-transparent px-1 py-1 text-xs focus:outline-none focus:bg-white"
                    />
                  </td>

                  {/* Unit Price */}
                  <td className="border-r border-black p-1">
                    <div className="flex items-center px-1">
                      <span className="text-slate-400 mr-1 text-[11px]">₱</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "unitPrice",
                            e.target.value === "" ? "" : parseFloat(e.target.value)
                          )
                        }
                        className="w-full text-right bg-transparent py-1 text-xs focus:outline-none focus:bg-white font-mono"
                      />
                    </div>
                  </td>

                  {/* Amount (Calculated) */}
                  <td className="p-1 text-right font-mono pr-3">
                    {item.amount > 0 ? (
                      <span>
                        ₱{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Delete row action */}
                  <td
                    data-html2canvas-ignore="true"
                    className="border-l border-black p-1 text-center no-print"
                  >
                    {data.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {/* Total Amount Row */}
              <tr className="border-t-2 border-black bg-slate-50 font-bold">
                <td colSpan={4} className="border-r border-black p-2 text-right uppercase tracking-wider">
                  TOTAL AMOUNT
                </td>
                <td className="p-2 text-right font-mono font-black text-sm pr-3">
                  ₱{data.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td data-html2canvas-ignore="true" className="border-l border-black no-print"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Add Row helper in DOM */}
        <div data-html2canvas-ignore="true" className="flex justify-end mt-1.5 no-print">
          <button
            type="button"
            onClick={addItemRow}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Row
          </button>
        </div>

        {/* Purpose Box */}
        <div className="mt-3 border-2 border-black rounded-lg p-3">
          <label className="font-bold text-xs uppercase tracking-wider block mb-1">
            Purpose:
          </label>
          <textarea
            rows={3}
            placeholder="State the detailed reason or business purpose for this payment request..."
            value={data.purpose}
            onChange={(e) => updateField("purpose", e.target.value)}
            className="w-full bg-transparent text-xs focus:outline-none focus:bg-blue-50/30 rounded p-1 resize-none leading-relaxed"
          />
        </div>

        {/* Payment Details & Urgency Section */}
        <div className="mt-4 grid grid-cols-12 gap-4">
          {/* Payment Details (Left Side) */}
          <div className="col-span-12 md:col-span-7">
            <span className="font-bold text-xs uppercase tracking-wider block mb-2">
              Payment Details:
            </span>

            {/* Checkboxes for Payment Method */}
            <div className="flex flex-wrap items-center gap-5 mb-3">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={data.paymentMethod === "cash"}
                  onChange={() => updateField("paymentMethod", "cash")}
                  className="w-4 h-4 border-2 border-black text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-semibold">Cash</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={data.paymentMethod === "check"}
                  onChange={() => updateField("paymentMethod", "check")}
                  className="w-4 h-4 border-2 border-black text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-semibold">Check</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={data.paymentMethod === "online"}
                  onChange={() => updateField("paymentMethod", "online")}
                  className="w-4 h-4 border-2 border-black text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-semibold">Online Payment/Bank Transfer</span>
              </label>
            </div>

            <p className="text-[10px] text-red-600 italic font-semibold mb-2">
              *If not applicable kindly put N/A
            </p>

            {/* Bank details lines */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-black pb-0.5">
                <span className="font-semibold text-xs min-w-[100px]">Bank:</span>
                <input
                  type="text"
                  placeholder="e.g. BDO, BPI, Metrobank"
                  value={data.bank}
                  onChange={(e) => updateField("bank", e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none focus:bg-blue-50/50 px-1"
                />
              </div>

              <div className="flex items-center gap-2 border-b border-black pb-0.5">
                <span className="font-semibold text-xs min-w-[100px]">Account Name:</span>
                <input
                  type="text"
                  placeholder="Account holder name"
                  value={data.accountName}
                  onChange={(e) => updateField("accountName", e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none focus:bg-blue-50/50 px-1"
                />
              </div>

              <div className="flex items-center gap-2 border-b border-black pb-0.5">
                <span className="font-semibold text-xs min-w-[100px]">Account Number:</span>
                <input
                  type="text"
                  placeholder="Account number"
                  value={data.accountNumber}
                  onChange={(e) => updateField("accountNumber", e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none focus:bg-blue-50/50 px-1 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Urgency & Date Needed (Right Side) */}
          <div className="col-span-12 md:col-span-5 flex flex-col justify-between pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0">
            <div>
              <span className="font-bold text-xs uppercase tracking-wider block mb-2">
                Remarks:
              </span>
              <div className="flex items-center gap-6 mb-4">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="urgency"
                    checked={data.urgency === "urgent"}
                    onChange={() => updateField("urgency", "urgent")}
                    className="w-4 h-4 border-2 border-black text-rose-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-rose-700">Urgent</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="urgency"
                    checked={data.urgency === "not_urgent"}
                    onChange={() => updateField("urgency", "not_urgent")}
                    className="w-4 h-4 border-2 border-black text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold">Not urgent</span>
                </label>
              </div>
            </div>

            <div className="border border-black rounded-lg p-2.5 bg-slate-50">
              <label className="font-bold text-[11px] uppercase tracking-wider block mb-1">
                Date Needed (M-D-Y):
              </label>
              <input
                type="date"
                value={data.dateNeeded}
                onChange={(e) => updateField("dateNeeded", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-1 text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Signatures & Workflow Section */}
        <div className="mt-8 pt-4 border-t-2 border-black">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Requested By */}
            <div className="flex flex-col justify-between">
              <span className="font-bold text-xs uppercase tracking-wider mb-2">
                Requested By:
              </span>

              {/* Signature display / interactive button */}
              <div
                onClick={() => setIsSignatureModalOpen(true)}
                className="h-20 border-b-2 border-black flex flex-col items-center justify-end pb-1 cursor-pointer hover:bg-blue-50/30 transition-colors group relative"
                title="Click to sign or update signature"
              >
                {data.signatureDataUrl ? (
                  <img
                    src={data.signatureDataUrl}
                    alt="Requestor signature"
                    className="max-h-16 max-w-full object-contain mb-1"
                  />
                ) : (
                  <div
                    data-html2canvas-ignore="true"
                    className="text-[11px] text-blue-600 flex items-center gap-1 mb-2 font-medium"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Click to Add Signature</span>
                  </div>
                )}
                <span
                  data-html2canvas-ignore="true"
                  className="text-[9px] text-slate-400 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Edit
                </span>
              </div>

              <div className="text-center mt-1">
                <span className="text-[10px] text-slate-600 block">
                  Signature Over Printed Name
                </span>
                <input
                  type="text"
                  placeholder="Requestor Full Name"
                  value={data.requestedByName}
                  onChange={(e) => updateField("requestedByName", e.target.value)}
                  className="w-full text-center font-bold text-xs uppercase mt-1 bg-transparent focus:outline-none border-b border-dashed border-slate-300 pb-0.5"
                />
                <input
                  type="email"
                  placeholder="company.email@primephilippines.com"
                  value={data.requestedByEmail}
                  onChange={(e) => updateField("requestedByEmail", e.target.value)}
                  className="w-full text-center text-[11px] text-slate-500 mt-1 bg-transparent focus:outline-none"
                />
              </div>

              <div className="mt-3 flex items-center gap-1 border-b border-black pb-0.5">
                <span className="font-bold text-[11px]">Remarks:</span>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={data.requestedByRemarks}
                  onChange={(e) => updateField("requestedByRemarks", e.target.value)}
                  className="w-full bg-transparent text-[11px] focus:outline-none px-1"
                />
              </div>
            </div>

            {/* Column 2: Approved By (Team Leader/ Co-TL) */}
            <div className="flex flex-col justify-between">
              <span className="font-bold text-xs uppercase tracking-wider mb-2">
                Approved By:
              </span>

              <div className="h-20 border-b-2 border-black flex items-center justify-center text-slate-300 text-[10px] italic">
                (Approval in ClickUp)
              </div>

              <div className="text-center mt-1">
                <span className="text-[10px] text-slate-600 block">
                  Signature Over Printed Name
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-1 uppercase">
                  Team Leader/ Co-TL
                </span>
              </div>
            </div>

            {/* Column 3: Received By (Finance Officer) */}
            <div className="flex flex-col justify-between">
              <span className="font-bold text-xs uppercase tracking-wider mb-2">
                Received By:
              </span>

              <div className="h-20 border-b-2 border-black flex items-center justify-center text-slate-300 text-[10px] italic">
                (Disbursement in Finance)
              </div>

              <div className="text-center mt-1">
                <span className="text-[10px] text-slate-600 block">
                  Signature Over Printed Name
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-1 uppercase">
                  Finance Officer
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSignatureSave}
        currentSignature={data.signatureDataUrl}
      />
    </div>
  );
}
