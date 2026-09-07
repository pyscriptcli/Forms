import { NextRequest, NextResponse } from "next/server";
import { RfpFormData } from "@/types/rfp";
import {
  createClickUpTask,
  updateClickUpTask,
  uploadAttachmentToTask,
} from "@/lib/clickup";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const dataStr = formData.get("data") as string;

    if (!dataStr) {
      return NextResponse.json(
        { success: false, message: "Missing form data payload" },
        { status: 400 }
      );
    }

    const data: RfpFormData = JSON.parse(dataStr);

    // Determine application base URL
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    let taskResult;
    const isRevision = Boolean(data.taskId);

    if (isRevision && data.taskId) {
      taskResult = await updateClickUpTask(data.taskId, data, appUrl);
    } else {
      taskResult = await createClickUpTask(data, appUrl);
    }

    const taskId = taskResult.id;

    // 1. Upload generated official PDF if provided
    const pdfBlob = formData.get("pdf") as File | null;
    if (pdfBlob && taskId) {
      const sanitizedPayee = (data.payee || "Request").replace(/[^a-zA-Z0-9_-]/g, "_");
      const pdfFilename = `RFP_${sanitizedPayee}_${data.date || "document"}.pdf`;
      await uploadAttachmentToTask(taskId, pdfBlob, pdfFilename);
    }

    // 2. Upload any supporting documents
    const supportingFiles = formData.getAll("supportingFiles") as File[];
    if (supportingFiles && supportingFiles.length > 0 && taskId) {
      for (const file of supportingFiles) {
        if (file && file.size > 0) {
          await uploadAttachmentToTask(taskId, file, file.name);
        }
      }
    }

    return NextResponse.json({
      success: true,
      taskId: taskResult.id,
      taskUrl: taskResult.url,
      isMock: taskResult.isMock || false,
      message: isRevision
        ? "RFP revised and updated in ClickUp successfully!"
        : "RFP submitted and created in ClickUp successfully!",
      taskData: taskResult,
    });
  } catch (error: any) {
    console.error("Error in /api/rfp/submit:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error submitting RFP to ClickUp",
      },
      { status: 500 }
    );
  }
}
