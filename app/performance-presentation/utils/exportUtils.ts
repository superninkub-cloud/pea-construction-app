import { TeamMemberPerformance } from "../types";

export function exportMemberToCSV(member: TeamMemberPerformance) {
  const headers = [
    "ลำดับ",
    "รายการแผนงาน",
    "สะสม (ร้อยละ)",
    "เป้าหมาย/ตัวชี้วัด (ร้อยละ)",
    "ความก้าวหน้าเทียบเป้า (%)",
    "หมวดหมู่งาน",
    "หมายเหตุ"
  ];

  const rows = member.planItems.map((item, idx) => {
    const acc = item.accumulatedPercent ?? 0;
    const tgt = item.targetPercent ?? 100;
    const ratio = tgt > 0 ? Math.round((acc / tgt) * 100) : 0;
    
    let catName = "งานทั่วไป";
    if (item.category === "115kv") catName = "งานสายส่ง 115 kV";
    else if (item.category === "22kv") catName = "งานระบบจำหน่าย 22 kV";
    else if (item.category === "close_job") catName = "งานปิดงานก่อสร้าง";
    else if (item.category === "office") catName = "งานบริหาร/งบลงทุน";

    return [
      idx + 1,
      `"${(item.taskName || "").replace(/"/g, '""')}"`,
      item.accumulatedPercent !== null ? item.accumulatedPercent : "-",
      item.targetPercent !== null ? item.targetPercent : "-",
      `${ratio}%`,
      `"${catName}"`,
      `"${(item.remarks || "").replace(/"/g, '""')}"`
    ].join(",");
  });

  // UTF-8 BOM so Microsoft Excel opens Thai fonts correctly
  const csvContent =
    "\uFEFF" +
    [
      `"รายงานผลการปฏิบัติงาน ผกร. (ไตรมาส 3 ปี 2569) - ${member.fullName}"`,
      `"ตำแหน่ง: ${member.title} | สังกัด: ${member.teamName}"`,
      `"วันที่ส่งออกข้อมูล: ${new Date().toLocaleDateString("th-TH")} ${new Date().toLocaleTimeString("th-TH")}"`,
      "",
      headers.join(","),
      ...rows
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `ผลการปฏิบัติงาน_${member.shortName}_2569.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyMemberSummaryToClipboard(
  member: TeamMemberPerformance,
  avgAchievement: number,
  totalProjects: number,
  totalBudget: number
): boolean {
  try {
    const text = [
      `📌 สรุปผลการปฏิบัติงาน ผกร. (ไตรมาส 3/2569)`,
      `👤 ผู้รับผิดชอบ: ${member.fullName}`,
      `🏢 ทีม/บทบาท: ${member.teamName}`,
      `🎯 ความสำเร็จตามแผนงาน: ${avgAchievement}% (${member.planItems.length} แผนงาน)`,
      ``,
      `📋 รายการแผนงานสำคัญ:`,
      ...member.planItems.map(
        (it, i) =>
          `  ${i + 1}. ${it.taskName} [ผลงาน: ${it.accumulatedPercent ?? 0}% / เป้าหมาย: ${it.targetPercent ?? 100}%]${it.remarks ? ` (${it.remarks})` : ""}`
      ),
      ``,
      `รายงานจาก: ระบบติดตาม ผกร.(ก3) ปี 2569`
    ].join("\n");

    navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Copy failed", err);
    return false;
  }
}

export async function downloadMemberPDF(elementId: string, filename: string): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element #${elementId} not found`);
      window.print();
      return false;
    }

    // Dynamic import to avoid SSR errors
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const opt: any = {
      margin: 0,
      filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      pagebreak: { mode: ["avoid-all"] }
    };

    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (err) {
    console.warn("Direct PDF download fallback to window.print()", err);
    window.print();
    return false;
  }
}

