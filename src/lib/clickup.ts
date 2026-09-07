import { RfpFormData, ClickUpTaskResponse } from "@/types/rfp";

const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

export function getClickUpConfig() {
  const token = process.env.CLICKUP_API_TOKEN || "";
  const listId = process.env.CLICKUP_LIST_ID || "";
  const isConfigured = Boolean(token && listId && token !== "mock" && !token.startsWith("pk_your"));
  return { token, listId, isConfigured };
}

/**
 * Builds a clear, structured Markdown summary of the RFP for the ClickUp task description.
 */
export function buildTaskDescription(data: RfpFormData, appUrl: string, taskId?: string): string {
  const formattedTotal = Number(data.totalAmount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const lines = [
    `# 📋 Request for Payment (RFP)`,
    `**Payee:** ${data.payee || "N/A"}`,
    `**Department:** ${data.department || "N/A"}`,
    `**Date Requested:** ${data.date || "N/A"}`,
    `**Date Needed:** ${data.dateNeeded || "N/A"}`,
    `**Priority / Urgency:** ${data.urgency === "urgent" ? "🚨 URGENT" : "Normal"}`,
    "",
    `---`,
    `### 💰 Payment Details`,
    `- **Payment Method:** ${data.paymentMethod ? data.paymentMethod.toUpperCase() : "N/A"}`,
    `- **Bank:** ${data.bank || "N/A"}`,
    `- **Account Name:** ${data.accountName || "N/A"}`,
    `- **Account Number:** ${data.accountNumber || "N/A"}`,
    "",
    `---`,
    `### 🎯 Purpose`,
    data.purpose || "_No purpose stated._",
    "",
    `---`,
    `### 📦 Line Items`,
    `| Description | Qty | Unit | Unit Price | Amount |`,
    `| :--- | :---: | :---: | :---: | :---: |`,
  ];

  if (data.items && data.items.length > 0) {
    data.items.forEach((item) => {
      const unitPrice = item.unitPrice !== "" ? Number(item.unitPrice).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00";
      const amount = Number(item.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 });
      lines.push(`| ${item.description || "—"} | ${item.qty || 0} | ${item.unit || "—"} | ₱${unitPrice} | ₱${amount} |`);
    });
  } else {
    lines.push(`| _No line items specified_ | - | - | - | - |`);
  }

  lines.push(`| **TOTAL AMOUNT** | | | | **₱${formattedTotal}** |`);
  lines.push("");
  lines.push(`---`);
  lines.push(`### ✍️ Requestor Sign-Off`);
  lines.push(`- **Requested By:** ${data.requestedByName || "N/A"}`);
  lines.push(`- **Email:** ${data.requestedByEmail || "N/A"}`);
  lines.push(`- **Requestor Remarks:** ${data.requestedByRemarks || "None"}`);
  lines.push(`- **Signature:** ${data.signatureDataUrl ? "Attached to official generated PDF" : "Typed Name"}`);
  lines.push("");

  if (taskId) {
    lines.push(`---`);
    lines.push(`### 🔄 Revision & Workflow`);
    lines.push(`Need the requestor to edit or adjust line items? Share this direct edit link:`);
    lines.push(`👉 **[Open Form for Revision / Editing](${appUrl}?taskId=${taskId})**`);
  }

  return lines.join("\n");
}

/**
 * Matches custom fields in the ClickUp list and formats the payload.
 */
async function getMatchingCustomFields(listId: string, token: string, data: RfpFormData, editUrl: string) {
  try {
    const res = await fetch(`${CLICKUP_API_BASE}/list/${listId}/field`, {
      headers: { Authorization: token },
    });
    if (!res.ok) return [];

    const json = await res.json();
    const availableFields: Array<{ id: string; name: string; type: string }> = json.fields || [];

    const customFieldsPayload: Array<{ id: string; value: any }> = [];

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

    availableFields.forEach((field) => {
      const name = normalize(field.name);

      if (name.includes("payee") && data.payee) {
        customFieldsPayload.push({ id: field.id, value: data.payee });
      } else if (name.includes("dept") || name.includes("department")) {
        customFieldsPayload.push({ id: field.id, value: data.department });
      } else if ((name.includes("amount") || name.includes("total")) && data.totalAmount) {
        customFieldsPayload.push({ id: field.id, value: Number(data.totalAmount) });
      } else if (name.includes("purpose") && data.purpose) {
        customFieldsPayload.push({ id: field.id, value: data.purpose });
      } else if (name.includes("urgent") || name.includes("urgency")) {
        customFieldsPayload.push({ id: field.id, value: data.urgency === "urgent" });
      } else if (name.includes("bank") && data.bank) {
        customFieldsPayload.push({ id: field.id, value: data.bank });
      } else if (name.includes("accountname") && data.accountName) {
        customFieldsPayload.push({ id: field.id, value: data.accountName });
      } else if (name.includes("accountnum") && data.accountNumber) {
        customFieldsPayload.push({ id: field.id, value: data.accountNumber });
      } else if (name.includes("requestor") || name.includes("requestedby")) {
        customFieldsPayload.push({ id: field.id, value: data.requestedByName });
      } else if (name.includes("edit") || name.includes("revision") || name.includes("formurl")) {
        customFieldsPayload.push({ id: field.id, value: editUrl });
      }
    });

    return customFieldsPayload;
  } catch (err) {
    console.error("Error fetching ClickUp custom fields:", err);
    return [];
  }
}

/**
 * Creates a new ClickUp Task for the RFP.
 */
export async function createClickUpTask(
  data: RfpFormData,
  appUrl: string
): Promise<ClickUpTaskResponse> {
  const { token, listId, isConfigured } = getClickUpConfig();

  if (!isConfigured) {
    // Return mock task response for zero-friction prototyping
    const mockId = "MOCK-" + Math.floor(100000 + Math.random() * 900000);
    return {
      id: mockId,
      name: `RFP: ${data.payee || "Payee"} - ₱${Number(data.totalAmount || 0).toLocaleString()} (${data.department || "Dept"})`,
      url: `https://app.clickup.com/t/${mockId}`,
      isMock: true,
      status: { status: "pending review", color: "#f59e0b" },
    };
  }

  const taskName = `RFP: ${data.payee || "Untitled"} - ₱${Number(data.totalAmount || 0).toLocaleString()} (${data.department || "General"})`;
  // Urgency: 1 = Urgent, 2 = High, 3 = Normal, 4 = Low
  const priority = data.urgency === "urgent" ? 1 : 3;

  // Placeholder edit url before task ID is generated, will update task description after creation
  const tempDesc = buildTaskDescription(data, appUrl);

  const body: any = {
    name: taskName,
    description: tempDesc,
    priority,
    notify_all: true,
  };

  // 1. Create task
  const createRes = await fetch(`${CLICKUP_API_BASE}/list/${listId}/task`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`ClickUp task creation failed (${createRes.status}): ${errText}`);
  }

  const createdTask = await createRes.json();
  const taskId = createdTask.id;
  const taskUrl = createdTask.url || `https://app.clickup.com/t/${taskId}`;

  // 2. Update description with the exact revision edit link
  const finalDesc = buildTaskDescription(data, appUrl, taskId);
  const customFields = await getMatchingCustomFields(listId, token, data, `${appUrl}?taskId=${taskId}`);

  await fetch(`${CLICKUP_API_BASE}/task/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: finalDesc,
      custom_fields: customFields,
    }),
  });

  return {
    id: taskId,
    name: taskName,
    url: taskUrl,
    isMock: false,
    status: createdTask.status,
  };
}

/**
 * Updates an existing ClickUp Task for a revision.
 */
export async function updateClickUpTask(
  taskId: string,
  data: RfpFormData,
  appUrl: string
): Promise<ClickUpTaskResponse> {
  const { token, listId, isConfigured } = getClickUpConfig();

  if (!isConfigured || taskId.startsWith("MOCK-")) {
    return {
      id: taskId,
      name: `RFP (Revised): ${data.payee || "Payee"} - ₱${Number(data.totalAmount || 0).toLocaleString()}`,
      url: `https://app.clickup.com/t/${taskId}`,
      isMock: true,
      status: { status: "revised", color: "#3b82f6" },
    };
  }

  const taskName = `RFP (Revised): ${data.payee || "Untitled"} - ₱${Number(data.totalAmount || 0).toLocaleString()} (${data.department || "General"})`;
  const priority = data.urgency === "urgent" ? 1 : 3;
  const description = buildTaskDescription(data, appUrl, taskId);
  const customFields = await getMatchingCustomFields(listId, token, data, `${appUrl}?taskId=${taskId}`);

  const updateRes = await fetch(`${CLICKUP_API_BASE}/task/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: taskName,
      description,
      priority,
      custom_fields: customFields,
    }),
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`ClickUp task update failed (${updateRes.status}): ${errText}`);
  }

  const updated = await updateRes.json();
  return {
    id: taskId,
    name: taskName,
    url: updated.url || `https://app.clickup.com/t/${taskId}`,
    isMock: false,
    status: updated.status,
  };
}

/**
 * Uploads a file attachment to a ClickUp task.
 */
export async function uploadAttachmentToTask(
  taskId: string,
  fileBlob: Blob,
  filename: string
): Promise<boolean> {
  const { token, isConfigured } = getClickUpConfig();

  if (!isConfigured || taskId.startsWith("MOCK-")) {
    console.log(`[Mock Mode] Attachment simulated for task ${taskId}: ${filename}`);
    return true;
  }

  try {
    const formData = new FormData();
    formData.append("attachment", fileBlob, filename);

    const res = await fetch(`${CLICKUP_API_BASE}/task/${taskId}/attachment`, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Failed to upload attachment ${filename}:`, err);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error uploading attachment to task ${taskId}:`, err);
    return false;
  }
}

/**
 * Retrieves a ClickUp task for revision pre-population.
 */
export async function getClickUpTask(taskId: string): Promise<any> {
  const { token, isConfigured } = getClickUpConfig();

  if (!isConfigured || taskId.startsWith("MOCK-")) {
    return null;
  }

  const res = await fetch(`${CLICKUP_API_BASE}/task/${taskId}`, {
    headers: { Authorization: token },
  });

  if (!res.ok) {
    return null;
  }

  return await res.json();
}
