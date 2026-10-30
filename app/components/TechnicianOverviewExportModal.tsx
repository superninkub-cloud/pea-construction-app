"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Project } from "../../lib/types";
import { 
  Download, Printer, Copy, Check, Sparkles, RefreshCw, Edit3, 
  Eye, FileSpreadsheet, Image as ImageIcon, X, ChevronDown, 
  CheckCircle2, Clock, AlertTriangle, User, Filter, ZoomIn, 
  ZoomOut, RotateCcw, FileText, CheckCheck, Share2
} from "lucide-react";
import { toPng, toBlob } from "html-to-image";
import html2canvas from "html2canvas";

export interface TechnicianOverviewExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  initialSupervisor?: string;
  supervisors: string[];
  onSelectSupervisor?: (sup: string) => void;
}

// Known sample date mappings for SPINA projects for authentic initial view
const KNOWN_SPINA_DEFAULTS: Record<string, { openDate?: string; progressNote?: string; targetPlan?: string }> = {
  "P-TDD02.3-I-SPINA.0001": { openDate: "19 ม.ค.2565", progressNote: "คงเหลือพาดสายเพิ่มเติม", targetPlan: "ไตรมาส1/69" },
  "P-TDD02.3-I-SPINA.0002": { openDate: "19 ม.ค.2565", progressNote: "คงเหลือพาดสายอีก 1 วงจร", targetPlan: "ไตรมาส1/69" },
  "P-TDD02.3-I-SPINA.0003": { openDate: "29 ก.ค.2564", progressNote: "แล้วเสร็จ ธ.ค.68", targetPlan: "" },
  "P-TDD02.3-I-SPINA.0004": { openDate: "5 พ.ค.2564", progressNote: "แล้วเสร็จ พ.ย.68", targetPlan: "" },
  "P-TDD02.3-I-SPIIA.0005": { openDate: "1 ก.พ.2564", progressNote: "100%", targetPlan: "" },
  "P-TDD02.3-I-SPINA.0006": { openDate: "19 ก.พ.2565", progressNote: "100%", targetPlan: "" },
  "P-TDD02.3-I-SPINA.0007": { openDate: "19 ม.ค.2565", progressNote: "คงเหลือพาดสายอีก 1 วงจร", targetPlan: "ไตรมาส1/69" },
  "P-TDD02.3-I-SPINA.0008": { openDate: "21 ก.พ.2565", progressNote: "100%", targetPlan: "" },
  "P-TDD02.3-I-SPINA.0009": { openDate: "21 ก.พ.2565", progressNote: "", targetPlan: "" },
  "P-TDD02.3-I-SPINA.0010": { openDate: "21 ก.พ.2565", progressNote: "", targetPlan: "" },
  "P-TDD02.3-I-SPINA.0011": { openDate: "28 เม.ย.2565", progressNote: "100%", targetPlan: "" },
  "P-TDD02.3-I-SPINA.0012": { openDate: "12 ก.ค.2565", progressNote: "คงเหลือพาดสาย/ติดอุปกรณ์", targetPlan: "ไตรมาส1/69" },
  "P-TDD02.3-I-SPINA.0013": { openDate: "12 ก.ค.2565", progressNote: "คงเหลือพาดสาย/ติดอุปกรณ์", targetPlan: "ไตรมาส1/69" },
};

// Supervisor title and position mapping for executive presentation
const SUPERVISOR_METADATA: Record<string, { fullName: string; position: string; team: string }> = {
  "ศราวุฒิ": { fullName: "นายศราวุฒิ เกิดสีเล็ก", position: "พชง.6 ผู้ควบคุมงาน", team: "ชุดงานก่อสร้างที่ 4" },
  "อุดมศักดิ์": { fullName: "นายอุดมศักดิ์ จันทร์กลิ่น", position: "พชง.7 ผู้ควบคุมงาน", team: "ชุดงานก่อสร้างที่ 1" },
  "วีรพัฒน์": { fullName: "นายวีรพัฒน์ นาคลมัย", position: "พชง.6 ผู้ควบคุมงาน", team: "ชุดงานก่อสร้างที่ 3" },
  "ศุภวิชญ์": { fullName: "นายศุภวิชญ์ เกาะลอย", position: "พชง.6 ผู้ควบคุมงาน", team: "ชุดงานก่อสร้างที่ 2" },
  "ขวัญนคร": { fullName: "นายขวัญนคร ศรีจันทร์อินทร์", position: "พชง.5 ผู้ควบคุมงาน", team: "ชุดงานก่อสร้างที่ 5" },
  "ชานินทร์": { fullName: "นายชานินทร์ ศรีสวัสดิ์", position: "ชผ.กร.", team: "กำกับดูแลงานก่อสร้าง" },
  "กิตติพิชญ์": { fullName: "นายกิตติพิชญ์ ประกอบทรัพย์", position: "พชง.5", team: "ทีมงานก่อสร้างระบบไฟฟ้า" },
  "นฤเบศ": { fullName: "นายนฤเบศ ยันตรีสิงห์", position: "พชง.5", team: "ทีมงานก่อสร้างระบบไฟฟ้า" },
  "พิสันติ์": { fullName: "นายพิสันติ์ จิตต์ปลื้ม", position: "ผกร.", team: "หัวหน้าแผนกก่อสร้างระบบไฟฟ้า" },
  "เกียรติศักดิ์": { fullName: "นายเกียรติศักดิ์", position: "พชง.", team: "แนวถนนพระราม 2" },
};

export const getLatestRemarkDetail = (remarks?: string): string | null => {
  if (!remarks) return null;
  const lines = remarks.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.includes(' | ')) {
      return trimmed.split(' | ').slice(1).join(' | ').trim();
    }
    if (!trimmed.includes('📍')) {
      return trimmed;
    }
  }
  return null;
};

export const computePhysicalProgress = (p: Project): number => {
  const type = p.construction_type || "1";
  if (type === "5") return p.manual_progress || 0;
  const w =
    type === "2"
      ? [20, 30, 25, 25, 0, 0]
      : type === "3"
        ? [20, 25, 25, 20, 0, 10]
        : type === "4"
          ? [0, 0, 50, 50, 0, 0]
          : [15, 25, 20, 20, 10, 10];
  const targets = [
    p.step1_target,
    p.step2_target,
    p.step3_target,
    p.step4_target,
    p.step5_target,
    p.step6_target,
  ].map((val) => Number(val) || 0);
  const dones = [
    p.step1_done,
    p.step2_done,
    p.step3_done,
    p.step4_done,
    p.step5_done,
    p.step6_done,
  ].map((val) => Number(val) || 0);

  return dones.reduce((sum, doneVal, idx) => {
    const targetVal = targets[idx];
    if (targetVal === 0 || w[idx] === 0) return sum;
    const percent = doneVal / targetVal;
    const cappedPercent = Math.min(1, percent);
    return sum + cappedPercent * w[idx];
  }, 0);
};

export interface TableRowData {
  id: string;
  wbs: string;
  name: string;
  status: string;
  openDate: string;
  progressNote: string;
  targetPlan: string;
}

export default function TechnicianOverviewExportModal({
  isOpen,
  onClose,
  projects,
  initialSupervisor = "ALL",
  supervisors,
  onSelectSupervisor,
}: TechnicianOverviewExportModalProps) {
  const [selectedSup, setSelectedSup] = useState(initialSupervisor);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isEditMode, setIsEditMode] = useState(false);
  const [customEdits, setCustomEdits] = useState<Record<string, Partial<TableRowData>>>({});
  const [exportTheme, setExportTheme] = useState<"pea_purple" | "pea_gradient" | "clean_white">("pea_purple");
  const [includeSlideHeader, setIncludeSlideHeader] = useState<boolean>(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<"none" | "table" | "image">("none");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Sync initial supervisor
  useEffect(() => {
    if (initialSupervisor) {
      setSelectedSup(initialSupervisor);
    }
  }, [initialSupervisor]);

  // Load saved local edits if any
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`pea_task_overview_edits_${selectedSup}`);
      if (saved) {
        setCustomEdits(JSON.parse(saved));
      } else {
        setCustomEdits({});
      }
    } catch {
      // ignore
    }
  }, [selectedSup]);

  // Filter projects for the selected supervisor
  const supervisorProjects = useMemo(() => {
    let list = projects.filter((p) => {
      if (
        (p.wbs && (p.wbs.includes("IMPORTANT_TASKS") || p.wbs.includes("SAFETY_PLAN"))) ||
        (p.name && (p.name.includes("Important Tasks") || p.name.includes("Safety Training")))
      ) {
        return false;
      }
      return true;
    });

    if (selectedSup !== "ALL") {
      list = list.filter((p) => {
        const s = (p.supervisor || "ไม่มีข้อมูล").trim();
        return s === selectedSup || s.includes(selectedSup) || selectedSup.includes(s);
      });
    }

    if (statusFilter !== "ALL") {
      list = list.filter((p) => (p.status || "ไม่มีสถานะ") === statusFilter);
    }

    return list;
  }, [projects, selectedSup, statusFilter]);

  // Transform projects into table rows with intelligent defaults + custom edits
  const tableRows: TableRowData[] = useMemo(() => {
    return supervisorProjects.map((p) => {
      const id = p.id || p.wbs;
      const known = KNOWN_SPINA_DEFAULTS[p.wbs] || {};
      const custom = customEdits[p.wbs] || {};

      // Open Date Resolution
      let defaultOpenDate = known.openDate || "";
      if (!defaultOpenDate) {
        if (p.open_year) {
          defaultOpenDate = p.open_year.startsWith("ปี") ? p.open_year : `ปี ${p.open_year}`;
        } else if (p.created_at) {
          try {
            const d = new Date(p.created_at);
            if (!isNaN(d.getTime())) {
              const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
              defaultOpenDate = `${d.getDate()} ${months[d.getMonth()]}${d.getFullYear() + 543}`;
            }
          } catch {
            defaultOpenDate = "-";
          }
        } else {
          defaultOpenDate = "-";
        }
      }

      // Progress Note Resolution
      let defaultProgressNote = known.progressNote !== undefined ? known.progressNote : "";
      if (defaultProgressNote === "") {
        const physical = computePhysicalProgress(p);
        const remarkNote = getLatestRemarkDetail(p.remarks);

        if (p.status === "F4" || physical === 100 || p.manual_progress === 100) {
          defaultProgressNote = "100%";
        } else if (remarkNote) {
          defaultProgressNote = remarkNote;
        } else if (physical > 0) {
          defaultProgressNote = `${Math.round(physical)}%`;
        } else {
          defaultProgressNote = "อยู่ระหว่างดำเนินการ";
        }
      }

      // Target Plan Resolution
      let defaultTargetPlan = known.targetPlan !== undefined ? known.targetPlan : "";
      if (defaultTargetPlan === "") {
        if (p.status === "F4") {
          defaultTargetPlan = "";
        } else if (p.closing_plan && p.closing_plan.trim()) {
          defaultTargetPlan = p.closing_plan.trim();
        } else if (p.action_plan && p.action_plan.trim()) {
          defaultTargetPlan = p.action_plan.trim();
        } else {
          defaultTargetPlan = "";
        }
      }

      return {
        id,
        wbs: custom.wbs ?? p.wbs,
        name: custom.name ?? p.name,
        status: custom.status ?? (p.status || "-"),
        openDate: custom.openDate ?? defaultOpenDate,
        progressNote: custom.progressNote ?? defaultProgressNote,
        targetPlan: custom.targetPlan ?? defaultTargetPlan,
      };
    });
  }, [supervisorProjects, customEdits]);

  // Statistics
  const stats = useMemo(() => {
    const total = tableRows.length;
    const f4Count = tableRows.filter((r) => r.status === "F4" || r.progressNote === "100%").length;
    const c1Count = tableRows.filter((r) => r.status === "C1").length;
    const d1Count = tableRows.filter((r) => r.status === "D1" || r.status === "D2").length;
    const percent = total > 0 ? (f4Count / total) * 100 : 0;
    return { total, f4Count, c1Count, d1Count, percent };
  }, [tableRows]);

  // Save edit to cell
  const handleCellEdit = (wbs: string, field: keyof TableRowData, value: string) => {
    setCustomEdits((prev) => {
      const updated = {
        ...prev,
        [wbs]: {
          ...prev[wbs],
          [field]: value,
        },
      };
      try {
        localStorage.setItem(`pea_task_overview_edits_${selectedSup}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Reset custom edits
  const handleResetEdits = () => {
    if (confirm("คุณต้องการคืนค่าเริ่มต้นทั้งหมดจากฐานข้อมูลใช่หรือไม่?")) {
      setCustomEdits({});
      try {
        localStorage.removeItem(`pea_task_overview_edits_${selectedSup}`);
      } catch {
        // ignore
      }
    }
  };

  // Helper to determine if text should be red highlighted (matching sample image!)
  const isRedHighlight = (text: string, type: "progress" | "plan"): boolean => {
    if (!text || text === "-" || text.trim() === "") return false;
    const trimmed = text.trim();
    if (trimmed === "100%" || trimmed === "100") return false;

    if (type === "progress") {
      // Pending, remaining, or active work notes are bright red in the sample
      return (
        trimmed.includes("คงเหลือ") ||
        trimmed.includes("อีก") ||
        trimmed.includes("แล้วเสร็จ") ||
        trimmed.includes("รอ") ||
        trimmed.includes("ติด") ||
        trimmed.includes("อุปกรณ์") ||
        trimmed.includes("วงจร") ||
        trimmed.includes("สาย") ||
        trimmed.includes("ปรับปรุง") ||
        trimmed !== "100%"
      );
    }

    if (type === "plan") {
      // Remaining quarters/months are bright red in the sample
      return (
        trimmed.includes("ไตรมาส") ||
        trimmed.includes("68") ||
        trimmed.includes("69") ||
        trimmed.includes("256") ||
        trimmed.includes("ม.ค.") ||
        trimmed.includes("ก.พ.") ||
        trimmed.includes("มี.ค.") ||
        trimmed.includes("เม.ย.") ||
        trimmed.includes("พ.ค.") ||
        trimmed.includes("มิ.ย.") ||
        trimmed.includes("ก.ค.") ||
        trimmed.includes("ส.ค.") ||
        trimmed.includes("ก.ย.") ||
        trimmed.includes("ต.ค.") ||
        trimmed.includes("พ.ย.") ||
        trimmed.includes("ธ.ค.")
      );
    }

    return false;
  };

  // Supervisor info display
  const supervisorInfo = useMemo(() => {
    if (selectedSup === "ALL") {
      return {
        fullName: "ภาพรวมงานช่างทุกคน แผนก ผกร.กรย.(ก3)",
        position: "สรุปภาพรวมโครงการก่อสร้างทั้งหมด",
        team: "กองก่อสร้างระบบไฟฟ้า เขต 3 (ภาคกลาง)",
      };
    }
    const supKey = Object.keys(SUPERVISOR_METADATA).find((k) => selectedSup.includes(k));
    if (supKey) {
      return SUPERVISOR_METADATA[supKey];
    }
    return {
      fullName: selectedSup,
      position: "ผู้ควบคุมงานก่อสร้าง",
      team: "แผนกก่อสร้างระบบไฟฟ้า ผกร.กรย.(ก3)",
    };
  }, [selectedSup]);

  // Export to PNG Image (Strictly captures document without edit outlines or system UI)
  const handleExportPNG = async () => {
    if (!printAreaRef.current) return;
    setIsExportingImage(true);

    const wasEditing = isEditMode;
    if (wasEditing) setIsEditMode(false);
    await new Promise((r) => setTimeout(r, 60));

    try {
      // Apply clean styles for capturing
      const element = printAreaRef.current;
      
      let dataUrl = "";
      try {
        dataUrl = await toPng(element, {
          quality: 0.98,
          pixelRatio: 2.5,
          backgroundColor: "#ffffff",
          filter: (node) => {
            if (node instanceof HTMLElement && (node.classList.contains("no-export") || node.classList.contains("no-print") || node.classList.contains("technician-overview-no-print"))) {
              return false;
            }
            return true;
          },
        });
      } catch (err) {
        console.warn("toPng failed, falling back to html2canvas", err);
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        dataUrl = canvas.toDataURL("image/png");
      }

      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      const supClean = selectedSup.replace(/[^a-zA-Z0-9ก-๙]/g, "_");
      link.download = `ภาพรวมงานช่าง_${supClean}_${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export PNG error:", error);
      alert("เกิดข้อผิดพลาดในการส่งออกรูปภาพ กรุณาลองใหม่อีกครั้ง");
    } finally {
      if (wasEditing) setIsEditMode(true);
      setIsExportingImage(false);
    }
  };

  // Export to CSV / Excel
  const handleExportExcel = () => {
    const headers = [
      "ลำดับที่",
      "WBS",
      "ชื่องาน",
      "สถานะงาน (ในระบบ)",
      "วันที่เปิดงาน",
      "ความก้าวหน้างาน",
      "แผนแล้วเสร็จ",
    ];

    const rows = tableRows.map((r, idx) => [
      idx + 1,
      `"${r.wbs}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.openDate}"`,
      `"${r.progressNote.replace(/"/g, '""')}"`,
      `"${r.targetPlan.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [
        `"ตารางสรุปภาพรวมและสถานะงานก่อสร้าง - ${supervisorInfo.fullName}"`,
        `"ตำแหน่ง: ${supervisorInfo.position} | สังกัด: ${supervisorInfo.team}"`,
        `"วันที่ส่งออกข้อมูล: ${new Date().toLocaleDateString("th-TH")} เวลา ${new Date().toLocaleTimeString("th-TH")} น."`,
        `"จำนวนงานทั้งหมด: ${stats.total} โครงการ | ปิดงานแล้ว (F4): ${stats.f4Count} โครงการ (${stats.percent.toFixed(1)}%)"`,
        "",
        headers.join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    const supClean = selectedSup.replace(/[^a-zA-Z0-9ก-๙]/g, "_");
    link.download = `ตารางภาพรวมงานช่าง_${supClean}_${dateStr}.csv`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy HTML Table to Clipboard
  const handleCopyTable = async () => {
    try {
      const headers = ["ลำดับที่", "WBS", "ชื่องาน", "สถานะงาน (ในระบบ)", "วันที่เปิดงาน", "ความก้าวหน้างาน", "แผนแล้วเสร็จ"];
      const headerHtml = headers.map(h => `<th style="background-color: #6A1B9A; color: #ffffff; padding: 10px; border: 1px solid #ffffff; text-align: center;">${h}</th>`).join("");
      
      const rowsHtml = tableRows.map((r, idx) => {
        const isProgRed = isRedHighlight(r.progressNote, "progress");
        const isPlanRed = isRedHighlight(r.targetPlan, "plan");
        return `
          <tr style="background-color: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold;">${idx + 1}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: 600;">${r.wbs}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${r.name}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: 600;">${r.status}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${r.openDate}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; ${isProgRed ? 'color: #dc2626; font-weight: bold;' : ''}">${r.progressNote}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; ${isPlanRed ? 'color: #dc2626; font-weight: bold;' : ''}">${r.targetPlan}</td>
          </tr>
        `;
      }).join("");

      const tableHtml = `
        <div style="font-family: 'Sarabun', 'Inter', sans-serif;">
          <h3 style="color: #6A1B9A; margin-bottom: 4px;">ตารางสรุปภาพรวมงานก่อสร้าง - ${supervisorInfo.fullName}</h3>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 12px;">ตำแหน่ง: ${supervisorInfo.position} | ข้อมูล ณ วันที่: ${new Date().toLocaleDateString("th-TH")}</p>
          <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
            <thead><tr>${headerHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      `;

      const plainText = [
        `ตารางสรุปภาพรวมงานก่อสร้าง - ${supervisorInfo.fullName}`,
        `ตำแหน่ง: ${supervisorInfo.position} | วันที่: ${new Date().toLocaleDateString("th-TH")}`,
        headers.join("\t"),
        ...tableRows.map((r, i) => [i + 1, r.wbs, r.name, r.status, r.openDate, r.progressNote, r.targetPlan].join("\t")),
      ].join("\n");

      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([tableHtml], { type: "text/html" });
        const textBlob = new Blob([plainText], { type: "text/plain" });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": htmlBlob,
            "text/plain": textBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }

      setCopiedStatus("table");
      setTimeout(() => setCopiedStatus("none"), 3000);
    } catch (err) {
      console.error("Copy error:", err);
      alert("ไม่สามารถคัดลอกตารางได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!printAreaRef.current) return;
    const wasEditing = isEditMode;
    if (wasEditing) setIsEditMode(false);
    await new Promise((r) => setTimeout(r, 60));

    try {
      const blob = await toBlob(printAreaRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node) => {
          if (node instanceof HTMLElement && (node.classList.contains("no-export") || node.classList.contains("no-print") || node.classList.contains("technician-overview-no-print"))) {
            return false;
          }
          return true;
        },
      });
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedStatus("image");
        setTimeout(() => setCopiedStatus("none"), 3000);
      } else {
        alert("เบราว์เซอร์ไม่รองรับการคัดลอกรูปภาพลงคลิปบอร์ดโดยตรง กรุณาใช้ปุ่ม 'ดาวน์โหลดรูปภาพ'");
      }
    } catch (err) {
      console.error("Copy image error:", err);
      alert("ไม่สามารถคัดลอกรูปภาพได้ กรุณาใช้ปุ่มดาวน์โหลดแทน");
    } finally {
      if (wasEditing) setIsEditMode(true);
    }
  };

  // Print PDF (Landscape A4 - Excludes system controls and modal header via print CSS)
  const handlePrint = async () => {
    const wasEditing = isEditMode;
    if (wasEditing) setIsEditMode(false);
    await new Promise((r) => setTimeout(r, 60));
    window.print();
    if (wasEditing) {
      setTimeout(() => setIsEditMode(true), 200);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="technician-overview-modal-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          overflowY: "auto",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Modal Dialog Card */}
        <div
          className="technician-overview-modal-dialog"
          style={{
            width: "98%",
            maxWidth: "1440px",
            maxHeight: "96vh",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #cbd5e1",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sleek Single Action Toolbar (Replaces old top header & old toolbar) */}
          <div
            className="technician-overview-modal-toolbar technician-overview-no-print no-print"
            style={{
              padding: "10px 18px",
              backgroundColor: "#581c87",
              backgroundImage: "linear-gradient(135deg, #581c87 0%, #6b21a8 100%)",
              color: "#ffffff",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            {/* Left: Supervisor selector, Filter, Edit */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={16} className="text-purple-200" />
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#f3e8ff" }}>ช่าง:</span>
                <select
                  value={selectedSup}
                  onChange={(e) => {
                    setSelectedSup(e.target.value);
                    if (onSelectSupervisor) onSelectSupervisor(e.target.value);
                  }}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.35)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="ALL" style={{ color: "#1e293b", background: "#fff" }}>
                    -- ทุกช่าง (ภาพรวมทั้งหมด) --
                  </option>
                  {supervisors.map((s) => (
                    <option key={s} value={s} style={{ color: "#1e293b", background: "#fff" }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Filter size={15} className="text-purple-200" />
                <span style={{ fontSize: "0.85rem", fontWeight: "500", color: "#f3e8ff" }}>สถานะ:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.35)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "0.85rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="ALL" style={{ color: "#1e293b", background: "#fff" }}>ทั้งหมด ({tableRows.length})</option>
                  <option value="C1" style={{ color: "#1e293b", background: "#fff" }}>C1 อยู่ระหว่างดำเนินการ</option>
                  <option value="D1" style={{ color: "#1e293b", background: "#fff" }}>D1 ดำเนินการแล้วเสร็จ</option>
                  <option value="D2" style={{ color: "#1e293b", background: "#fff" }}>D2 รอเอกสารปิดงาน</option>
                  <option value="F4" style={{ color: "#1e293b", background: "#fff" }}>F4 ปิดงานแล้ว</option>
                </select>
              </div>

              {/* Toggle Inline Edit */}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: isEditMode ? "1px solid #facc15" : "1px solid rgba(255, 255, 255, 0.3)",
                  backgroundColor: isEditMode ? "#fef08a" : "rgba(255, 255, 255, 0.15)",
                  color: isEditMode ? "#854d0e" : "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                title="คลิกเพื่อเปิดโหมดพิมพ์แก้ไขข้อความในตารางได้โดยตรง"
              >
                <Edit3 size={14} />
                {isEditMode ? "กำลังแก้ไข (คลิกช่องเพื่อแก้)" : "✏️ แก้ไขข้อความ"}
              </button>

              {/* Reset Edits button if any */}
              {Object.keys(customEdits).length > 0 && (
                <button
                  onClick={handleResetEdits}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "5px 8px",
                    borderRadius: "6px",
                    border: "1px solid #fca5a5",
                    backgroundColor: "#fee2e2",
                    color: "#b91c1c",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  title="ล้างค่าที่พิมพ์แก้ไขทั้งหมดและดึงข้อมูลเดิมจากระบบ"
                >
                  <RotateCcw size={12} />
                  คืนค่าเดิม ({Object.keys(customEdits).length})
                </button>
              )}

              {/* Slide Header Toggle (Default OFF so it matches sample directly) */}
              <button
                onClick={() => setIncludeSlideHeader(!includeSlideHeader)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  backgroundColor: includeSlideHeader ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
                title="คลิกเพื่อสลับ: แสดงหรือซ่อนหัวสไลด์ กฟภ."
              >
                <FileText size={13} />
                {includeSlideHeader ? "หัวสไลด์: แสดง" : "หัวสไลด์: ซ่อน"}
              </button>
            </div>

            {/* Right: Export Buttons + Close [X] */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={handleCopyTable}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  backgroundColor: copiedStatus === "table" ? "#22c55e" : "rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                title="คัดลอกตารางไปวางใน Word, PowerPoint หรือ Excel"
              >
                {copiedStatus === "table" ? <Check size={14} /> : <Copy size={14} />}
                {copiedStatus === "table" ? "คัดลอกแล้ว!" : "คัดลอกตาราง"}
              </button>

              <button
                onClick={handleCopyImage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  backgroundColor: copiedStatus === "image" ? "#22c55e" : "rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                title="คัดลอกรูปภาพตารางไปวางใน LINE หรือแชท"
              >
                {copiedStatus === "image" ? <Check size={14} /> : <ImageIcon size={14} />}
                {copiedStatus === "image" ? "คัดลอกภาพแล้ว!" : "คัดลอกรูปภาพ"}
              </button>

              <button
                onClick={handleExportExcel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #86efac",
                  backgroundColor: "#22c55e",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}
                title="ดาวน์โหลดไฟล์ CSV / Excel"
              >
                <FileSpreadsheet size={14} />
                Excel / CSV
              </button>

              <button
                onClick={handlePrint}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #fdba74",
                  backgroundColor: "#ea580c",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}
                title="พิมพ์ตารางหรือบันทึกเป็น PDF ขนาด A4 แนวนอน"
              >
                <Printer size={14} />
                พิมพ์ / PDF
              </button>

              <button
                onClick={handleExportPNG}
                disabled={isExportingImage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: "800",
                  cursor: isExportingImage ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 6px rgba(168, 85, 247, 0.4)",
                }}
                title="ดาวน์โหลดตารางเป็นรูปภาพ PNG คมชัดสูง"
              >
                {isExportingImage ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                {isExportingImage ? "กำลังเรนเดอร์..." : "🖼️ บันทึกรูปภาพ (PNG)"}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginLeft: "4px",
                }}
                title="ปิดหน้าต่าง"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div
            className="technician-overview-modal-body"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              backgroundColor: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* THE EXPORT TARGET CONTAINER (The Presentation Slide Table) */}
            <div
              ref={printAreaRef}
              id="technician-overview-print-area"
              style={{
                width: "100%",
                maxWidth: "1380px",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                border: "1px solid #cbd5e1",
                overflow: "visible",
                position: "relative",
                fontFamily: "'Sarabun', 'Inter', -apple-system, sans-serif",
              }}
            >
              {/* Slide / Report Top Header Banner (Toggleable) */}
              {includeSlideHeader && (
              <div
                style={{
                  padding: "20px 24px",
                  background:
                    exportTheme === "pea_purple"
                      ? "linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7e22ce 100%)"
                      : exportTheme === "pea_gradient"
                      ? "linear-gradient(135deg, #3b0764 0%, #6b21a8 60%, #b45309 100%)"
                      : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  borderBottom: "3px solid #fbbf24",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <img
                  src="https://lh3.googleusercontent.com/d/1pQWRFXNG6IL3cQUTWmuQVE7wMHVFrsjD"
                  alt="PEA Logo"
                  style={{ height: "46px", width: "auto", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#fde68a",
                      fontWeight: "700",
                    }}
                  >
                    การไฟฟ้าส่วนภูมิภาค • PROVINCIAL ELECTRICITY AUTHORITY
                  </div>
                  <h2
                    style={{
                      fontSize: "1.45rem",
                      fontWeight: "800",
                      margin: "2px 0",
                      color: "#ffffff",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    ตารางสรุปภาพรวมและสถานะงานก่อสร้างในความรับผิดชอบ
                  </h2>
                  <div style={{ fontSize: "0.9rem", color: "#e9d5ff", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span>
                      👤 <strong>{supervisorInfo.fullName}</strong> ({supervisorInfo.position})
                    </span>
                    <span>•</span>
                    <span>🏢 {supervisorInfo.team}</span>
                    <span>•</span>
                    <span>แผนกก่อสร้างระบบไฟฟ้า ผกร.กรย.(ก3)</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                  backgroundColor: "rgba(0, 0, 0, 0.25)",
                  backdropFilter: "blur(4px)",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#fef08a", fontWeight: "600" }}>ข้อมูลอัปเดตสถานะงาน</div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff" }}>
                  {new Date().toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#e9d5ff" }}>
                  จำนวน {stats.total} โครงการ • ปิดงาน {stats.percent.toFixed(0)}%
                </div>
              </div>
            </div>
          )}

            {/* The Main Table - Exactly matching and improving the sample image */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                  fontSize: "0.92rem",
                  backgroundColor: exportTheme === "pea_purple" ? "#cfd8dc" : "#ffffff",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor:
                        exportTheme === "pea_purple"
                          ? "#6A1B9A"
                          : exportTheme === "pea_gradient"
                          ? "#581c87"
                          : "#334155",
                      color: "#ffffff",
                      borderBottom: "2px solid #581c87",
                    }}
                  >
                    {/* 1. ลำดับที่ */}
                    <th
                      style={{
                        width: "50px",
                        padding: "7px 4px",
                        textAlign: "center",
                        fontWeight: "700",
                        borderRight: "1px solid rgba(255, 255, 255, 0.35)",
                        fontSize: "0.85rem",
                      }}
                    >
                      ลำดับ<br />ที่
                    </th>

                    {/* 2. WBS */}
                    <th
                      style={{
                        width: "175px",
                        padding: "7px 6px",
                        textAlign: "center",
                        fontWeight: "700",
                        borderRight: "1px solid rgba(255, 255, 255, 0.35)",
                        fontSize: "0.85rem",
                      }}
                    >
                      WBS
                    </th>

                    {/* 3. ชื่องาน */}
                    <th
                      style={{
                        width: "auto",
                        minWidth: "260px",
                        padding: "7px 10px",
                        textAlign: "center",
                        fontWeight: "700",
                        borderRight: "1px solid rgba(255, 255, 255, 0.35)",
                        fontSize: "0.85rem",
                      }}
                    >
                      ชื่องาน
                    </th>

                    {/* 4. สถานะงาน (ในระบบ) */}
                    <th
                      style={{
                        width: "92px",
                        padding: "7px 4px",
                        textAlign: "center",
                        fontWeight: "700",
                        borderRight: "1px solid rgba(255, 255, 255, 0.35)",
                        fontSize: "0.85rem",
                      }}
                    >
                      สถานะงาน<br />(ในระบบ)
                    </th>

                    {/* 5. วันที่เปิดงาน */}
                    <th
                      style={{
                        width: "105px",
                        padding: "7px 4px",
                        textAlign: "center",
                        fontWeight: "700",
                        borderRight: "1px solid rgba(255, 255, 255, 0.35)",
                        fontSize: "0.85rem",
                      }}
                    >
                      วันที่<br />เปิดงาน
                    </th>

                    {/* 6. ความก้าวหน้างาน */}
                    <th
                      style={{
                        width: "170px",
                        padding: "7px 6px",
                        textAlign: "center",
                        fontWeight: "700",
                        borderRight: "1px solid rgba(255, 255, 255, 0.35)",
                        fontSize: "0.85rem",
                      }}
                    >
                      ความก้าวหน้างาน
                    </th>

                    {/* 7. แผนแล้วเสร็จ */}
                    <th
                      style={{
                        width: "115px",
                        padding: "7px 6px",
                        textAlign: "center",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                      }}
                    >
                      แผนแล้วเสร็จ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: "36px 16px",
                          color: "#64748b",
                          backgroundColor: "#ffffff",
                          fontSize: "0.95rem",
                        }}
                      >
                        ไม่พบข้อมูลโครงการตามตัวกรองที่เลือก
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((row, index) => {
                      const isProgRed = isRedHighlight(row.progressNote, "progress");
                      const isPlanRed = isRedHighlight(row.targetPlan, "plan");
                      const isEven = index % 2 === 0;

                      // Row background tone matching sample image
                      const rowBg =
                        exportTheme === "pea_purple"
                          ? isEven
                            ? "#d6dbdf"
                            : "#e8ecef"
                          : isEven
                          ? "#ffffff"
                          : "#f8fafc";

                      return (
                        <tr
                          key={row.id || index}
                          style={{
                            backgroundColor: rowBg,
                            borderBottom: "1px solid #b0bec5",
                            color: "#1e293b",
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          {/* 1. ลำดับที่ */}
                          <td
                            style={{
                              padding: "5px 4px",
                              textAlign: "center",
                              fontWeight: "600",
                              borderRight: "1px solid #b0bec5",
                              color: "#334155",
                              fontSize: "0.82rem",
                            }}
                          >
                            {index + 1}
                          </td>

                          {/* 2. WBS */}
                          <td
                            style={{
                              padding: "5px 6px",
                              textAlign: "left",
                              fontFamily: "monospace",
                              fontWeight: "700",
                              fontSize: "0.80rem",
                              color: "#1e293b",
                              borderRight: "1px solid #b0bec5",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isEditMode ? (
                              <input
                                type="text"
                                value={row.wbs}
                                onChange={(e) => handleCellEdit(row.wbs, "wbs", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "2px 4px",
                                  border: "1px solid #7c3aed",
                                  borderRadius: "4px",
                                  fontSize: "0.80rem",
                                  fontFamily: "monospace",
                                }}
                              />
                            ) : (
                              row.wbs
                            )}
                          </td>

                          {/* 3. ชื่องาน */}
                          <td
                            style={{
                              padding: "5px 8px",
                              textAlign: "left",
                              borderRight: "1px solid #b0bec5",
                              lineHeight: "1.3",
                              color: "#0f172a",
                              fontSize: "0.82rem",
                            }}
                          >
                            {isEditMode ? (
                              <textarea
                                value={row.name}
                                onChange={(e) => handleCellEdit(row.wbs, "name", e.target.value)}
                                rows={2}
                                style={{
                                  width: "100%",
                                  padding: "2px 4px",
                                  border: "1px solid #7c3aed",
                                  borderRadius: "4px",
                                  fontSize: "0.82rem",
                                  fontFamily: "inherit",
                                }}
                              />
                            ) : (
                              row.name
                            )}
                          </td>

                          {/* 4. สถานะงาน (ในระบบ) */}
                          <td
                            style={{
                              padding: "5px 4px",
                              textAlign: "center",
                              borderRight: "1px solid #b0bec5",
                              fontWeight: "700",
                              fontSize: "0.82rem",
                            }}
                          >
                            {isEditMode ? (
                              <input
                                type="text"
                                value={row.status}
                                onChange={(e) => handleCellEdit(row.wbs, "status", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "2px 4px",
                                  textAlign: "center",
                                  border: "1px solid #7c3aed",
                                  borderRadius: "4px",
                                  fontSize: "0.82rem",
                                  fontWeight: "bold",
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontSize: "0.80rem",
                                  fontWeight: "700",
                                  backgroundColor:
                                    row.status === "F4"
                                      ? "rgba(16, 185, 129, 0.15)"
                                      : row.status === "C1"
                                      ? "rgba(59, 130, 246, 0.15)"
                                      : "rgba(245, 158, 11, 0.15)",
                                  color:
                                    row.status === "F4"
                                      ? "#065f46"
                                      : row.status === "C1"
                                      ? "#1e40af"
                                      : "#92400e",
                                }}
                              >
                                {row.status}
                              </span>
                            )}
                          </td>

                          {/* 5. วันที่เปิดงาน */}
                          <td
                            style={{
                              padding: "5px 4px",
                              textAlign: "center",
                              borderRight: "1px solid #b0bec5",
                              whiteSpace: "nowrap",
                              color: "#334155",
                              fontSize: "0.82rem",
                            }}
                          >
                            {isEditMode ? (
                              <input
                                type="text"
                                value={row.openDate}
                                onChange={(e) => handleCellEdit(row.wbs, "openDate", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "2px 4px",
                                  textAlign: "center",
                                  border: "1px solid #7c3aed",
                                  borderRadius: "4px",
                                  fontSize: "0.82rem",
                                }}
                              />
                            ) : (
                              row.openDate
                            )}
                          </td>

                          {/* 6. ความก้าวหน้างาน (Smart Red Highlight) */}
                          <td
                            style={{
                              padding: "5px 6px",
                              textAlign: "center",
                              borderRight: "1px solid #b0bec5",
                              fontWeight: isProgRed ? "700" : "600",
                              color: isProgRed ? "#dc2626" : "#1e293b",
                              lineHeight: "1.25",
                              fontSize: "0.82rem",
                            }}
                          >
                            {isEditMode ? (
                              <input
                                type="text"
                                value={row.progressNote}
                                onChange={(e) => handleCellEdit(row.wbs, "progressNote", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "2px 4px",
                                  textAlign: "center",
                                  border: "1px solid #7c3aed",
                                  borderRadius: "4px",
                                  fontSize: "0.82rem",
                                  color: isProgRed ? "#dc2626" : "#1e293b",
                                  fontWeight: "bold",
                                }}
                              />
                            ) : (
                              row.progressNote
                            )}
                          </td>

                          {/* 7. แผนแล้วเสร็จ (Smart Red Highlight) */}
                          <td
                            style={{
                              padding: "5px 6px",
                              textAlign: "center",
                              fontWeight: isPlanRed ? "700" : "500",
                              color: isPlanRed ? "#dc2626" : "#475569",
                              whiteSpace: "nowrap",
                              fontSize: "0.82rem",
                            }}
                          >
                            {isEditMode ? (
                              <input
                                type="text"
                                value={row.targetPlan}
                                onChange={(e) => handleCellEdit(row.wbs, "targetPlan", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "2px 4px",
                                  textAlign: "center",
                                  border: "1px solid #7c3aed",
                                  borderRadius: "4px",
                                  fontSize: "0.82rem",
                                  color: isPlanRed ? "#dc2626" : "#1e293b",
                                  fontWeight: "bold",
                                }}
                              />
                            ) : (
                              row.targetPlan || ""
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Slide / Report Bottom Footer Bar */}
            <div
              style={{
                padding: "8px 18px",
                backgroundColor: exportTheme === "pea_purple" ? "#b0bec5" : "#f8fafc",
                borderTop: "1px solid #90a4ae",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.78rem",
                color: "#374151",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span>
                  <strong>สรุปสถานะ:</strong> ทั้งหมด {stats.total} โครงการ | ดำเนินการเสร็จ {stats.f4Count} โครงการ | อยู่ระหว่างทำ {stats.c1Count + stats.d1Count} โครงการ
                </span>
                <span>•</span>
                <span>อัตราความสำเร็จ: <strong>{stats.percent.toFixed(1)}%</strong></span>
              </div>

              {/* Signature PEA Purple Brand Corner with Icon (Matching sample slide corner!) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#6A1B9A",
                  color: "#ffffff",
                  padding: "4px 14px",
                  borderRadius: "20px 4px 4px 20px",
                  fontWeight: "700",
                  fontSize: "0.78rem",
                  boxShadow: "0 2px 6px rgba(106, 27, 154, 0.3)",
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    display: "inline-block",
                  }}
                />
                <span>PEA ผกร.กรย.(ก3)</span>
              </div>
            </div>
          </div>
          {/* ======================================================== */}
        </div>
      </div>
    </div>
  );
}



