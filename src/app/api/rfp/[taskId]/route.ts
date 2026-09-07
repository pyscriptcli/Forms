import { NextRequest, NextResponse } from "next/server";
import { getClickUpTask } from "@/lib/clickup";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json({ success: false, message: "Task ID is required" }, { status: 400 });
    }

    if (taskId.startsWith("MOCK-")) {
      return NextResponse.json({
        success: true,
        taskId,
        isMock: true,
        task: {
          id: taskId,
          name: "Sample RFP Revision",
          description: "Mock task revision data",
        },
      });
    }

    const task = await getClickUpTask(taskId);

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      taskId,
      isMock: false,
      task,
    });
  } catch (error: any) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch task from ClickUp" },
      { status: 500 }
    );
  }
}
