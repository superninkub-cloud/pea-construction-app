import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { execSync } from 'child_process';

const mdPath = path.resolve('./PEA_CONSTRUCTION_APP_USER_MANUAL.md');
const htmlPath = path.resolve('./manual_print.html');
const pdfPath = path.resolve('./PEA_CONSTRUCTION_APP_USER_MANUAL.pdf');

console.log("Reading Markdown manual...");
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

const bodyHtml = marked.parse(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>คู่มือการใช้งานระบบบริหารและติดตามงานก่อสร้างระบบไฟฟ้า (PEA Construction App)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700;800&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @bottom-center {
        content: counter(page);
        font-family: 'Sarabun', sans-serif;
        font-size: 9pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
      font-size: 11pt;
      line-height: 1.65;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100vh;
      min-height: 250mm;
      padding: 30mm 10mm 20mm 10mm;
      text-align: center;
      background: linear-gradient(145deg, #2e0854 0%, #4c1d95 40%, #1e1b4b 100%);
      color: #ffffff;
      border-radius: 12px;
      margin-bottom: 20mm;
    }

    .cover-logo-box {
      margin-top: 10mm;
      margin-bottom: 15mm;
    }

    .cover-logo {
      width: 110px;
      height: auto;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
    }

    .cover-badge {
      display: inline-block;
      padding: 6px 18px;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.5);
      border-radius: 30px;
      color: #fbbf24;
      font-family: 'Prompt', sans-serif;
      font-weight: 600;
      font-size: 11pt;
      letter-spacing: 0.5px;
      margin-bottom: 15mm;
    }

    .cover-title {
      font-family: 'Prompt', sans-serif;
      font-size: 26pt;
      font-weight: 800;
      line-height: 1.3;
      margin: 0 0 10mm 0;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }

    .cover-subtitle {
      font-family: 'Prompt', sans-serif;
      font-size: 14pt;
      font-weight: 500;
      color: #cbd5e1;
      margin: 0 0 15mm 0;
      line-height: 1.5;
    }

    .cover-divider {
      width: 80px;
      height: 4px;
      background: #f59e0b;
      margin: 0 auto 15mm auto;
      border-radius: 2px;
    }

    .cover-meta {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 12mm 15mm;
      margin: 0 auto;
      max-width: 500px;
      text-align: left;
      font-size: 10.5pt;
    }

    .cover-meta table {
      width: 100%;
      border-collapse: collapse;
      border: none !important;
    }

    .cover-meta td {
      padding: 6px 8px;
      color: #f1f5f9;
      border: none !important;
    }

    .cover-meta td.label {
      font-weight: 600;
      color: #fbbf24;
      width: 38%;
    }

    .cover-footer {
      font-size: 9.5pt;
      color: #94a3b8;
      margin-top: 10mm;
    }

    /* Content Typography */
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Prompt', sans-serif;
      color: #0f172a;
      page-break-after: avoid;
    }

    h1 {
      font-size: 18pt;
      font-weight: 700;
      color: #581c87;
      border-bottom: 2.5px solid #7e22ce;
      padding-bottom: 6px;
      margin-top: 25mm;
      margin-bottom: 6mm;
      page-break-before: always;
    }

    .content > h1:first-of-type {
      page-break-before: avoid;
      margin-top: 0;
    }

    h2 {
      font-size: 14pt;
      font-weight: 600;
      color: #4338ca;
      border-left: 4px solid #f59e0b;
      padding-left: 10px;
      margin-top: 10mm;
      margin-bottom: 4mm;
    }

    h3 {
      font-size: 12pt;
      font-weight: 600;
      color: #1e293b;
      margin-top: 7mm;
      margin-bottom: 3mm;
    }

    h4 {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-top: 5mm;
      margin-bottom: 2mm;
    }

    p {
      margin-top: 0;
      margin-bottom: 4mm;
      text-align: justify;
    }

    ul {
      margin-top: 0;
      margin-bottom: 4mm;
      padding-left: 20px;
    }

    li {
      margin-bottom: 2mm;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 5mm 0 8mm 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    table th {
      background-color: #6b21a8 !important;
      color: #ffffff !important;
      font-family: 'Prompt', sans-serif;
      font-weight: 600;
      text-align: left;
      padding: 8px 12px;
      border: 1px solid #581c87;
    }

    table td {
      padding: 7px 12px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }

    table tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    blockquote {
      margin: 4mm 0 6mm 0;
      padding: 10px 16px;
      background-color: #f3e8ff;
      border-left: 4px solid #9333ea;
      border-radius: 0 8px 8px 0;
      font-size: 10pt;
      color: #4a044e;
      page-break-inside: avoid;
    }

    blockquote p {
      margin: 0;
    }

    pre {
      background-color: #0f172a;
      color: #f8fafc;
      font-family: 'Fira Code', Consolas, monospace;
      font-size: 8.5pt;
      line-height: 1.45;
      padding: 12px 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 4mm 0 6mm 0;
      page-break-inside: avoid;
      border: 1px solid #334155;
    }

    code {
      font-family: 'Fira Code', Consolas, monospace;
      font-size: 9pt;
      background-color: #f1f5f9;
      color: #b91c1c;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      border: none;
      font-size: 8.5pt;
    }

    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 8mm 0;
    }

    strong {
      color: #0f172a;
      font-weight: 600;
    }

    a {
      color: #7e22ce;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-logo-box">
      <img src="https://lh3.googleusercontent.com/d/1pQWRFXNG6IL3cQUTWmuQVE7wMHVFrsjD" alt="PEA Logo" class="cover-logo">
    </div>

    <div>
      <div class="cover-badge">คู่มือการใช้งานระบบอย่างเป็นทางการ | USER MANUAL</div>
      <h1 class="cover-title" style="border:none; margin:0 0 10mm 0; color:#fff;">ระบบบริหารและติดตามงานก่อสร้างระบบไฟฟ้า</h1>
      <div class="cover-subtitle">PEA Construction Management & Tracking Web Application</div>
      <div class="cover-divider"></div>
    </div>

    <div class="cover-meta">
      <table>
        <tr>
          <td class="label">หน่วยงาน:</td>
          <td>แผนกก่อสร้างและบูรณะระบบจำหน่าย (ผกร.(ก3))</td>
        </tr>
        <tr>
          <td class="label">กองต้นสังกัด:</td>
          <td>กองก่อสร้างระบบไฟฟ้า (กรย.กร.)</td>
        </tr>
        <tr>
          <td class="label">เขตพื้นที่:</td>
          <td>การไฟฟ้าส่วนภูมิภาค เขต 3 (ภาคกลาง) จังหวัดนครปฐม (กฟก.3)</td>
        </tr>
        <tr>
          <td class="label">ที่อยู่ระบบ (URL):</td>
          <td>https://pea-construction-app.vercel.app/</td>
        </tr>
        <tr>
          <td class="label">เวอร์ชันเอกสาร:</td>
          <td>Version 2026.1 Enterprise Release</td>
        </tr>
        <tr>
          <td class="label">วันที่ปรับปรุงล่าสุด:</td>
          <td>20 ตุลาคม 2569</td>
        </tr>
      </table>
    </div>

    <div class="cover-footer">
      เอกสารสงวนลิขสิทธิ์สำหรับใช้งานภายในองค์กร การไฟฟ้าส่วนภูมิภาค (PEA) เท่านั้น
    </div>
  </div>

  <!-- Body Content -->
  <div class="content">
    ${bodyHtml}
  </div>

</body>
</html>
`;

console.log("Writing temporary HTML file:", htmlPath);
fs.writeFileSync(htmlPath, fullHtml, 'utf-8');

console.log("Locating browser executable for PDF printing...");
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let browserExe = null;
if (fs.existsSync(chromePath)) {
  browserExe = chromePath;
} else if (fs.existsSync(edgePath)) {
  browserExe = edgePath;
}

if (!browserExe) {
  console.error("Neither Google Chrome nor Microsoft Edge was found.");
  process.exit(1);
}

console.log("Using browser:", browserExe);
console.log("Printing to PDF:", pdfPath);

const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
const cmdArgs = [
  `"${browserExe}"`,
  '--headless',
  '--disable-gpu',
  '--run-all-compositor-stages-before-draw',
  '--no-pdf-header-footer',
  `--print-to-pdf="${pdfPath}"`,
  `"${fileUrl}"`
];

const command = cmdArgs.join(' ');
console.log("Running command:", command);

try {
  execSync(command, { stdio: 'inherit' });
  console.log("PDF generated successfully!");
  const stats = fs.statSync(pdfPath);
  console.log(`File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);
} catch (err) {
  console.error("Failed to generate PDF:", err);
  process.exit(1);
}
