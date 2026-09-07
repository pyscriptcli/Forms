import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface GeneratedPdfResult {
  blob: Blob;
  dataUrl: string;
}

/**
 * Generates an official high-resolution A4 PDF from the printable RFP DOM element.
 */
export async function generateRfpPdf(elementId: string = "rfp-printable-sheet"): Promise<GeneratedPdfResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PDF generation.`);
  }

  // Clone or temporarily ensure styling for clean print capture
  const canvas = await html2canvas(element, {
    scale: 2.5, // Crisp 2.5x resolution for print quality
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.98);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Scale image to fill page width
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  // If height fits within standard A4 or slightly exceeds, align cleanly
  pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));

  const blob = pdf.output("blob");
  const dataUrl = pdf.output("dataurlstring");

  return { blob, dataUrl };
}

/**
 * Triggers a browser download of the generated PDF.
 */
export function downloadPdfBlob(blob: Blob, filename: string = "Request_For_Payment.pdf") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
