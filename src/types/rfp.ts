export interface RfpLineItem {
  id: string;
  description: string;
  qty: number | "";
  unit: string;
  unitPrice: number | "";
  amount: number;
}

export type PaymentMethod = "cash" | "check" | "online" | "";
export type UrgencyLevel = "urgent" | "not_urgent" | "";

export interface SupportingFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64 for preview / client upload
}

export interface RfpFormData {
  // Document Reference / Revision
  taskId?: string; // If editing an existing ClickUp task
  
  // Header
  date: string;
  payee: string;
  department: string;
  
  // Items Table
  items: RfpLineItem[];
  totalAmount: number;
  
  // Purpose
  purpose: string;
  
  // Payment Details
  paymentMethod: PaymentMethod;
  bank: string;
  accountName: string;
  accountNumber: string;
  
  // Urgency & Timeline
  urgency: UrgencyLevel;
  dateNeeded: string;
  
  // Requested By (Sign-off)
  requestedByName: string;
  requestedByEmail: string;
  signatureType: "draw" | "upload" | "none";
  signatureDataUrl?: string;
  requestedByRemarks: string;
  
  // Approver / Finance Placeholders
  approvedByName?: string;
  approvedBySignature?: string;
  receivedByName?: string;
  receivedBySignature?: string;

  // Supporting files
  supportingFiles?: SupportingFile[];
}

export interface ClickUpTaskResponse {
  id: string;
  name: string;
  url: string;
  custom_id?: string;
  status?: { status: string; color: string };
  isMock?: boolean;
}

export interface SubmissionResponse {
  success: boolean;
  taskId: string;
  taskUrl: string;
  message: string;
  isMock: boolean;
  taskData?: any;
}
