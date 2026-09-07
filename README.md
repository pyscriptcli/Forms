# 🏢 PRIME Philippines - Request for Payment (RFP) Web Wrapper for ClickUp

A high-fidelity **Document-First Form Wrapper** for ClickUp built with **Next.js (App Router)** and **Tailwind CSS**. 

Designed to completely replace the cumbersome manual workflow (**Download Excel -> Fill Form -> Convert to PDF -> Upload to ClickUp -> Upload Receipts**) with a streamlined, interactive digital form that mirrors the official hard copy pixel-for-pixel, automatically generates the official PDF, and syncs directly with ClickUp.

---

## ✨ Features

- 📄 **1:1 Pixel-Perfect Hard Copy Document UI**: Visually identical to the official PRIME Philippines RFP paper template (corporate branding, bordered cells, navy banner, headers).
- ⚡ **Real-Time Dynamic Calculations**: Auto-calculates row amounts (`Qty * Unit Price`) and `TOTAL AMOUNT` as you type.
- ✍️ **Dual E-Signature Capture**:
  - Draw signature directly on canvas using mouse or touch/stylus.
  - Or upload a digital signature image (transparent PNG or JPG).
- 📎 **Multi-File Supporting Documents Uploader**: Drag & drop multiple receipts, vendor quotations, invoices, or billing statements directly into the form.
- 🖨️ **Client-Side High-Res PDF Generator**: Captures the exact completed form with signatures into an official A4 PDF blob with zero serverless bundle bloat on Vercel.
- 🔗 **ClickUp REST API v2 Synchronization**:
  - Automatically creates tasks in your target ClickUp List.
  - Attaches the generated official PDF + all uploaded receipts directly to the task.
  - Hybrid custom fields mapping (Payee, Amount, Department, Bank Info, Urgency, Date Needed) + rich formatted Markdown task description.
- 🔄 **Revision Workflow Support**: If a request is returned for revision by the Team Leader, opening `?taskId=[CLICKUP_TASK_ID]` enables the requestor to modify fields and re-submit updates directly to the existing ClickUp task.
- 🧪 **Built-in Mock / Simulation Mode**: Test all form features, calculations, and PDF generation immediately without needing ClickUp API keys upfront.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure ClickUp (Optional for Prototype)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your ClickUp credentials:
- `CLICKUP_API_TOKEN`: Obtain from ClickUp **Settings -> Apps -> Generate API Token**.
- `CLICKUP_LIST_ID`: Numeric List ID from your ClickUp URL (e.g. `https://app.clickup.com/12345/v/li/987654321` -> `987654321`).
- `NEXT_PUBLIC_APP_URL`: Your Vercel domain (e.g. `https://prime-rfp.vercel.app`).

> **Note**: If `CLICKUP_API_TOKEN` is left empty or not provided, the application runs in **Mock / Simulation Mode**, allowing you to test form filling, PDF downloads, and payload verification with zero setup!

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub / GitLab / Bitbucket.
2. Import the project into [Vercel](https://vercel.com).
3. In the Vercel project settings, add the environment variables:
   - `CLICKUP_API_TOKEN`
   - `CLICKUP_LIST_ID`
   - `NEXT_PUBLIC_APP_URL`
4. Click **Deploy**!

---

## 🔄 Business Workflow Mapping

```
[Employee / Requestor]
       │
       ▼
Fills Next.js Document Form (Auto-computes total, signs e-signature, attaches receipts)
       │
       ▼
Clicks "Submit to ClickUp" ──▶ Auto-generates Official PDF & uploads to ClickUp Task
       │
       ▼
[Team Leader (Approver)]
       │
       ├─▶ Approved  ──▶ Routed to Finance for Disbursement
       │
       └─▶ Rejected  ──▶ Requestor reloads with ?taskId=... for instant revision
```
