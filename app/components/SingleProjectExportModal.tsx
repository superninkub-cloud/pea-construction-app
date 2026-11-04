"use client";

import React, { useState, useRef, useMemo } from "react";
import { Project } from "../../lib/types";
import { ProjectImageItem } from "../utils/imageCompressor";
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  Circle,
  RefreshCw,
  Edit3,
  Camera,
  Calendar,
  User,
  Wallet,
  Sparkles,
  Layers,
  Award,
  Clock,
} from "lucide-react";
import { toPng, toBlob } from "html-to-image";
import html2canvas from "html2canvas";

export interface SingleProjectExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  wbs: string;
  name: string;
  status: string;
  projectValue: string;
  supervisor: string;
  openYear: string;
  yearCriteria: string;
  pTracking: string;
  actionPlan: string;
  closingPlan: string;
  constructionType: string;
  progTargets: number[];
  progDone: number[];
  manualProgress: number;
  checks: {
    check1: boolean;
    check2: boolean;
    check3: boolean;
    check4: boolean;
    check5: boolean;
    check6: boolean;
    check7: boolean;
    check8: boolean;
  };
  estSiteExpense: string;
  allocatedSiteBudget: string;
  disbursedSiteExpense: string;
  scrapWireName?: string;
  scrapWireLength?: number | "";
  scrapReturnedWeight?: number | "";
  oldRemarks: string;
  newRemarks: string;
  selectedMonth: string;
  images: ProjectImageItem[];
  onUpdateImageCaption?: (index: number, caption: string) => void;
}

const STEP_DEFINITIONS = [
  { label: "1. ขุดหลุมปักเสา", idx: 0, unit: "ต้น" },
  { label: "2. ปักเสา", idx: 1, unit: "ต้น" },
  { label: "3. ติดตั้งอุปกรณ์ประกอบหัวเสา", idx: 2, unit: "ชุด" },
  { label: "4. พาดสายแรงสูง", idx: 3, unit: "วงจร-กม." },
  { label: "5. พาดสายแรงต่ำ", idx: 4, unit: "วงจร-กม." },
  { label: "6. งานรื้อถอน", idx: 5, unit: "ต้น" },
];

const CHECKLIST_ITEMS = [
  { id: "check1", label: "ก่อสร้างเสร็จ" },
  { id: "check2", label: "ส่งคืนเศษสายแล้ว" },
  { id: "check3", label: "ส่งคืนเศษเหล็กแล้ว" },
  { id: "check4", label: "ทำ PM/ADS แล้ว" },
  { id: "check5", label: "ตรวจมาตรฐานแล้ว" },
  { id: "check6", label: "ใบสำคัญจ่ายครบแล้ว" },
  { id: "check7", label: "ขออนุมัติโอนงบแล้ว" },
  { id: "check8", label: "ปรับแผนผังและประมาณการแล้ว" },
];

export default function SingleProjectExportModal({
  isOpen,
  onClose,
  project,
  wbs,
  name,
  status,
  projectValue,
  supervisor,
  openYear,
  yearCriteria,
  pTracking,
  actionPlan,
  closingPlan,
  constructionType,
  progTargets,
  progDone,
  manualProgress,
  checks,
  estSiteExpense,
  allocatedSiteBudget,
  disbursedSiteExpense,
  scrapWireName,
  scrapWireLength,
  scrapReturnedWeight,
  oldRemarks,
  newRemarks,
  selectedMonth,
  images,
  onUpdateImageCaption,
}: SingleProjectExportModalProps) {
  const [showBudget, setShowBudget] = useState(true);
  const [showChecklist, setShowChecklist] = useState(true);
  const [showPhotos, setShowPhotos] = useState(true);
  const [photoColumns, setPhotoColumns] = useState<2 | 3 | 4>(3);
  const [isEditMode, setIsEditMode] = useState(false);
  const [customTitle, setCustomTitle] = useState("รายงานสรุปความก้าวหน้าและสถานะงานก่อสร้าง (รายโครงการ)");
  const [customNote, setCustomNote] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedType, setCopiedType] = useState<"none" | "image" | "text">("none");

  const slideRef = useRef<HTMLDivElement>(null);

  // Calculate physical progress
  const physicalProgress = useMemo(() => {
    if (status?.trim().toUpperCase() === "F4") return 100;
    if (constructionType === "5") return Number(manualProgress) || 0;
    const weights =
      constructionType === "2"
        ? [20, 30, 25, 25, 0, 0]
        : constructionType === "3"
        ? [20, 25, 25, 20, 0, 10]
        : constructionType === "4"
        ? [0, 0, 50, 50, 0, 0]
        : [15, 25, 20, 20, 10, 10];
    return progDone.reduce((sum, doneVal, idx) => {
      const targetVal = progTargets[idx] || 0;
      if (targetVal === 0 || weights[idx] === 0) return sum;
      const pct = Math.min(1, doneVal / targetVal);
      return sum + pct * weights[idx];
    }, 0);
  }, [constructionType, manualProgress, progDone, progTargets, status]);

  // Active steps for this construction type
  const activeSteps = useMemo(() => {
    const weights =
      constructionType === "2"
        ? [20, 30, 25, 25, 0, 0]
        : constructionType === "3"
        ? [20, 25, 25, 20, 0, 10]
        : constructionType === "4"
        ? [0, 0, 50, 50, 0, 0]
        : [15, 25, 20, 20, 10, 10];
    return STEP_DEFINITIONS.map((step) => ({
      ...step,
      weight: weights[step.idx],
      done: progDone[step.idx] || 0,
      target: progTargets[step.idx] || 0,
    })).filter((s) => s.weight > 0);
  }, [constructionType, progDone, progTargets]);

  // Checklist progress
  const checklistDoneCount = useMemo(() => {
    return Object.values(checks).filter(Boolean).length;
  }, [checks]);

  // Latest remark resolution
  const latestRemarkText = useMemo(() => {
    if (customNote.trim() !== "") return customNote;
    if (newRemarks.trim() !== "") return newRemarks.trim();
    if (oldRemarks && oldRemarks.trim() !== "") {
      const lines = oldRemarks
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length > 0) return lines.slice(0, 3).join("\n");
    }
    return "อยู่ระหว่างดำเนินการตามแผนงาน";
  }, [customNote, newRemarks, oldRemarks]);

  const formatNum = (val: string | number | undefined) => {
    const num = Number(val) || 0;
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Export as High-Res PNG
  const handleDownloadPNG = async () => {
    if (!slideRef.current) return;
    setIsExporting(true);
    const wasEditing = isEditMode;
    if (wasEditing) setIsEditMode(false);
    await new Promise((r) => setTimeout(r, 80));

    try {
      const element = slideRef.current;
      let dataUrl = "";
      try {
        dataUrl = await toPng(element, {
          quality: 0.98,
          pixelRatio: 2.2,
          backgroundColor: "#ffffff",
          cacheBust: true,
          filter: (node) => {
            if (
              node instanceof HTMLElement &&
              (node.classList.contains("no-export") || node.classList.contains("no-print"))
            ) {
              return false;
            }
            return true;
          },
        });
      } catch (err) {
        console.warn("toPng fallback to html2canvas:", err);
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });
        dataUrl = canvas.toDataURL("image/png");
      }

      const link = document.createElement("a");
      const cleanWbs = (wbs || "project").replace(/[^a-zA-Z0-9_-]/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      link.download = `รายงานสถานะงาน_${cleanWbs}_${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export PNG:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกรูปภาพ กรุณาใช้ปุ่ม พิมพ์ / PDF แทนครับ");
    } finally {
      if (wasEditing) setIsEditMode(true);
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!slideRef.current) return;
    setIsExporting(true);
    const wasEditing = isEditMode;
    if (wasEditing) setIsEditMode(false);
    await new Promise((r) => setTimeout(r, 80));

    try {
      const blob = await toBlob(slideRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
        filter: (node) => {
          if (
            node instanceof HTMLElement &&
            (node.classList.contains("no-export") || node.classList.contains("no-print"))
          ) {
            return false;
          }
          return true;
        },
      });
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopiedType("image");
        setTimeout(() => setCopiedType("none"), 3000);
      } else {
        alert("เบราว์เซอร์นี้ไม่รองรับการคัดลอกรูปภาพโดยตรง กรุณากดปุ่ม 'บันทึกรูปภาพ (PNG)' แทนครับ");
      }
    } catch (err) {
      console.error("Copy image error:", err);
      alert("ไม่สามารถคัดลอกรูปภาพลงคลิปบอร์ดได้ กรุณากดปุ่ม 'บันทึกรูปภาพ (PNG)' แทนครับ");
    } finally {
      if (wasEditing) setIsEditMode(true);
      setIsExporting(false);
    }
  };

  // Copy Summary Text for LINE / Chat
  const handleCopySummaryText = async () => {
    try {
      const checkLines = CHECKLIST_ITEMS.map(
        (c) => `${checks[c.id as keyof typeof checks] ? "✅" : "⬜"} ${c.label}`
      ).join("\n");

      const photoCaptionLines = images
        .map((img, i) => `  📸 รูปที่ ${i + 1}: ${img.caption ? img.caption : "(ไม่มีคำบรรยาย)"}`)
        .join("\n");

      const summary = [
        `📊 รายงานความก้าวหน้างานก่อสร้าง ผกร.กรย.(ก3)`,
        `📌 รหัส WBS: ${wbs}`,
        `📑 ชื่องาน: ${name}`,
        `👷 ผู้ควบคุมงาน: ${supervisor || "-"}`,
        `🔄 สถานะในระบบ: ${status || "-"} | ความก้าวหน้าหน้างาน: ${physicalProgress.toFixed(1)}%`,
        `💰 มูลค่างาน: ${formatNum(projectValue)} บาท`,
        closingPlan ? `🎯 แผนปิดงาน: ${closingPlan}` : "",
        `📝 ความคืบหน้าล่าสุด:\n${latestRemarkText}`,
        `\n📋 เช็คลิสท์การดำเนินงาน (${checklistDoneCount}/8):`,
        checkLines,
        images.length > 0 ? `\n🖼️ รูปถ่ายหน้างาน (${images.length} รูป):\n${photoCaptionLines}` : "",
        `\n📅 ข้อมูล ณ วันที่: ${new Date().toLocaleDateString("th-TH")}`,
      ]
        .filter(Boolean)
        .join("\n");

      await navigator.clipboard.writeText(summary);
      setCopiedType("text");
      setTimeout(() => setCopiedType("none"), 3000);
    } catch (e) {
      console.error("Failed to copy text:", e);
    }
  };

  // Print / Save as PDF via dedicated print window or html2pdf
  const handlePrintPDF = async () => {
    if (!slideRef.current) return;
    const wasEditing = isEditMode;
    if (wasEditing) setIsEditMode(false);
    await new Promise((r) => setTimeout(r, 80));

    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const cleanWbs = (wbs || "project").replace(/[^a-zA-Z0-9_-]/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];

      await html2pdf()
        .set({
          margin: [6, 6, 6, 6],
          filename: `รายงานความก้าวหน้า_${cleanWbs}_${dateStr}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(slideRef.current)
        .save();
    } catch (err) {
      console.warn("html2pdf fallback to window.print():", err);
      window.print();
    } finally {
      if (wasEditing) setIsEditMode(true);
    }
  };

  if (!isOpen) return null;

  const allocatedNum = Number(allocatedSiteBudget) || 0;
  const disbursedNum = Number(disbursedSiteExpense) || 0;
  const remainingNum = allocatedNum - disbursedNum;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.78)",
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
      <div
        style={{
          width: "98%",
          maxWidth: "1360px",
          maxHeight: "95vh",
          backgroundColor: "#f1f5f9",
          borderRadius: "18px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Toolbar */}
        <div
          className="no-export no-print"
          style={{
            padding: "12px 20px",
            background: "linear-gradient(135deg, #4a044e 0%, #6b21a8 50%, #7e22ce 100%)",
            color: "#ffffff",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          {/* Left: Toggles & Options */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "6px" }}>
              <Sparkles size={18} color="#fde047" />
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                ส่งออกสไลด์นำเสนอรายโครงการ (Single Job Export)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 10px",
                borderRadius: "6px",
                border: isEditMode ? "1px solid #facc15" : "1px solid rgba(255,255,255,0.3)",
                background: isEditMode ? "#fef08a" : "rgba(255,255,255,0.15)",
                color: isEditMode ? "#854d0e" : "#ffffff",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Edit3 size={13} />
              {isEditMode ? "เสร็จสิ้นการแก้ไข" : "✏️ แก้ไขข้อความ/คำบรรยายภาพ"}
            </button>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.8rem",
                background: "rgba(255,255,255,0.12)",
                padding: "5px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showBudget}
                onChange={(e) => setShowBudget(e.target.checked)}
                style={{ accentColor: "#facc15" }}
              />
              แสดงงบประมาณ
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.8rem",
                background: "rgba(255,255,255,0.12)",
                padding: "5px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showChecklist}
                onChange={(e) => setShowChecklist(e.target.checked)}
                style={{ accentColor: "#facc15" }}
              />
              แสดงเช็คลิสท์ 8 ขั้นตอน
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.8rem",
                background: "rgba(255,255,255,0.12)",
                padding: "5px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showPhotos}
                onChange={(e) => setShowPhotos(e.target.checked)}
                style={{ accentColor: "#facc15" }}
              />
              แสดงรูปถ่าย ({images.length})
            </label>

            {showPhotos && images.length > 0 && (
              <select
                value={photoColumns}
                onChange={(e) => setPhotoColumns(Number(e.target.value) as 2 | 3 | 4)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                <option value={2} style={{ color: "#1e293b" }}>รูปภาพ 2 คอลัมน์ (ใหญ่)</option>
                <option value={3} style={{ color: "#1e293b" }}>รูปภาพ 3 คอลัมน์ (มาตรฐาน)</option>
                <option value={4} style={{ color: "#1e293b" }}>รูปภาพ 4 คอลัมน์ (กะทัดรัด)</option>
              </select>
            )}
          </div>

          {/* Right: Export Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleCopySummaryText}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: copiedType === "text" ? "#22c55e" : "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="คัดลอกข้อความสรุปเพื่อส่งใน LINE"
            >
              {copiedType === "text" ? <Check size={14} /> : <Copy size={14} />}
              {copiedType === "text" ? "คัดลอกข้อความแล้ว!" : "คัดลอกข้อความสรุป"}
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              disabled={isExporting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: copiedType === "image" ? "#22c55e" : "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="คัดลอกสไลด์นี้เป็นรูปภาพเพื่อวาง (Ctrl+V) ใน LINE หรือ PowerPoint"
            >
              {copiedType === "image" ? <Check size={14} /> : <ImageIcon size={14} />}
              {copiedType === "image" ? "คัดลอกรูปภาพแล้ว!" : "คัดลอกรูปสไลด์"}
            </button>

            <button
              type="button"
              onClick={handlePrintPDF}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #fdba74",
                background: "#ea580c",
                color: "#fff",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
              title="ดาวน์โหลดเป็นไฟล์ PDF"
            >
              <Printer size={14} />
              ส่งออก PDF
            </button>

            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isExporting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
                fontSize: "0.84rem",
                fontWeight: 700,
                cursor: isExporting ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)",
              }}
              title="ดาวน์โหลดเป็นรูปภาพสไลด์ PNG ความละเอียดสูง"
            >
              {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              {isExporting ? "กำลังสร้างไฟล์..." : "🖼️ บันทึกรูปภาพ (PNG)"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
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

        {/* Scrollable Preview Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* =================================================================
              PRESENTATION SLIDE / REPORT CANVAS
              ================================================================= */}
          <div
            ref={slideRef}
            style={{
              width: "100%",
              maxWidth: "1220px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid #cbd5e1",
              fontFamily: "'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              color: "#1e293b",
            }}
          >
            {/* 1. HEADER BANNER */}
            <div
              style={{
                background: "linear-gradient(135deg, #4a044e 0%, #6b21a8 55%, #7e22ce 100%)",
                color: "#ffffff",
                padding: "20px 28px",
                borderBottom: "4px solid #facc15",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "300px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      background: "#facc15",
                      color: "#4a044e",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      padding: "2px 10px",
                      borderRadius: "999px",
                      letterSpacing: "0.03em",
                    }}
                  >
                    PEA ผกร.กรย.(ก3)
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        color: "#fde047",
                        border: "1px solid #fde047",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        width: "360px",
                      }}
                    />
                  ) : (
                    <span style={{ color: "#fde047", fontSize: "0.85rem", fontWeight: 700 }}>
                      {customTitle}
                    </span>
                  )}
                </div>

                {/* WBS + Status Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      color: "#ffffff",
                      background: "rgba(255,255,255,0.14)",
                      padding: "3px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    {wbs || "-"}
                  </span>

                  <span
                    style={{
                      padding: "4px 14px",
                      borderRadius: "8px",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      background:
                        status === "F4"
                          ? "#10b981"
                          : status === "D1" || status === "D2"
                          ? "#f59e0b"
                          : "#3b82f6",
                      color: "#ffffff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    }}
                  >
                    สถานะ: {status || "รอดำเนินการ"}
                  </span>

                  {pTracking && (
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "8px",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        background: "#ef4444",
                        color: "#ffffff",
                      }}
                    >
                      🚨 {pTracking}
                    </span>
                  )}
                </div>

                {/* Project Name */}
                <h1
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.35,
                  }}
                >
                  {name || "ไม่ระบุชื่องานโครงการ"}
                </h1>
              </div>

              {/* Right Big Progress Gauge Card */}
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.35)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: "14px",
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  minWidth: "240px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.75rem", color: "#e9d5ff", fontWeight: 600 }}>
                    ความก้าวหน้างานก่อสร้าง
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      color: physicalProgress >= 100 ? "#4ade80" : "#fde047",
                      lineHeight: 1.1,
                      marginTop: "2px",
                    }}
                  >
                    {physicalProgress.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#cbd5e1", marginTop: "4px" }}>
                    อัปเดตประจำเดือน {selectedMonth} • {new Date().toLocaleDateString("th-TH")}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KEY METADATA STRIP */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                padding: "14px 24px",
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#f3e8ff",
                    color: "#7e22ce",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                    ผู้ควบคุมงาน
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1e293b" }}>
                    {supervisor || "-"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Wallet size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                    มูลค่างานโครงการ
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#047857" }}>
                    {formatNum(projectValue)} บาท
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Calendar size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                    ปีที่เปิดงาน / ประเภท
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1e293b" }}>
                    ปี {openYear || "-"} ({project.project_type || yearCriteria || "งานก่อสร้าง"})
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#fef3c7",
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                    แผนปฏิบัติการ / แผนปิดงาน
                  </div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: status === "F4" ? "#059669" : "#dc2626",
                    }}
                  >
                    {status === "F4"
                      ? "ปิดงานเรียบร้อยแล้ว (F4)"
                      : closingPlan || actionPlan || "ตามแผนงานโครงการ"}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MAIN CONTENT GRID: LEFT (Progress & Remarks) | RIGHT (Budget & Checklist) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  showBudget || showChecklist ? "repeat(auto-fit, minmax(440px, 1fr))" : "1fr",
                gap: "20px",
                padding: "20px 24px",
              }}
            >
              {/* LEFT COLUMN: Construction Step Progress + Latest Progress Remark */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Construction Progress Card */}
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "16px",
                    background: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#581c87",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Layers size={18} color="#7e22ce" />
                      <span>ความก้าวหน้างานก่อสร้าง (หน้างาน)</span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: physicalProgress >= 100 ? "#059669" : "#7e22ce",
                        background: physicalProgress >= 100 ? "#d1fae5" : "#f3e8ff",
                        padding: "2px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      รวม {physicalProgress.toFixed(1)}%
                    </span>
                  </div>

                  {/* Overall Bar */}
                  <div
                    style={{
                      height: "10px",
                      background: "#e2e8f0",
                      borderRadius: "999px",
                      overflow: "hidden",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, physicalProgress)}%`,
                        background:
                          physicalProgress >= 100
                            ? "linear-gradient(90deg, #10b981, #059669)"
                            : "linear-gradient(90deg, #7e22ce, #a855f7)",
                        borderRadius: "999px",
                      }}
                    />
                  </div>

                  {/* Step Breakdown */}
                  {constructionType === "5" ? (
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        color: "#475569",
                      }}
                    >
                      ประเมินความก้าวหน้าภาพรวมหน้างาน: <strong>{physicalProgress.toFixed(1)}%</strong>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {activeSteps.map((st) => {
                        const pct =
                          st.target > 0 ? Math.min(100, Math.round((st.done / st.target) * 100)) : 0;
                        return (
                          <div
                            key={st.idx}
                            style={{
                              padding: "8px 10px",
                              borderRadius: "8px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                color: "#334155",
                                marginBottom: "4px",
                              }}
                            >
                              <span>{st.label}</span>
                              <span style={{ color: "#64748b" }}>({st.weight}%)</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "0.8rem",
                              }}
                            >
                              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                                {st.done} / {st.target} {st.unit}
                              </span>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: pct >= 100 ? "#059669" : "#7e22ce",
                                }}
                              >
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Progress Remarks / Highlights Box */}
                <div
                  style={{
                    border: "1px solid #d8b4fe",
                    borderRadius: "12px",
                    padding: "16px",
                    background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      color: "#581c87",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>📝 สรุปความก้าวหน้า / ผลการดำเนินงานล่าสุด</span>
                    {!isEditMode && (
                      <span
                        className="no-export no-print"
                        onClick={() => setIsEditMode(true)}
                        style={{
                          fontSize: "0.75rem",
                          color: "#7e22ce",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        คลิกเพื่อแก้ไขข้อความ
                      </span>
                    )}
                  </div>
                  {isEditMode ? (
                    <textarea
                      rows={3}
                      value={customNote || latestRemarkText}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="พิมพ์สรุปความก้าวหน้าสำหรับนำเสนอ..."
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #a855f7",
                        fontSize: "0.88rem",
                        fontFamily: "inherit",
                        background: "#ffffff",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#1e293b",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      {latestRemarkText}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Budget + Checklist */}
              {(showBudget || showChecklist) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Budget Summary Card */}
                  {showBudget && (
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "16px",
                        background: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#581c87",
                          marginBottom: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Wallet size={18} color="#7e22ce" />
                        <span>ข้อมูลงบประมาณและค่าใช้จ่ายหน้างาน</span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 12px",
                            background: "#f8fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            ประมาณการค่าใช้จ่ายหน้างาน
                          </div>
                          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>
                            {formatNum(estSiteExpense)} บาท
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "10px 12px",
                            background: "#f8fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            งบหน้างานที่ได้รับจัดสรร
                          </div>
                          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2563eb" }}>
                            {formatNum(allocatedSiteBudget)} บาท
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "10px 12px",
                            background: "#f8fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            เบิกจ่ายค่าใช้จ่ายหน้างานแล้ว
                          </div>
                          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#d97706" }}>
                            {formatNum(disbursedSiteExpense)} บาท
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "10px 12px",
                            background: remainingNum >= 0 ? "#ecfdf5" : "#fef2f2",
                            borderRadius: "8px",
                            border:
                              remainingNum >= 0 ? "1px solid #a7f3d0" : "1px solid #fecaca",
                          }}
                        >
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            ค่าใช้จ่ายหน้างานคงเหลือ
                          </div>
                          <div
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: 800,
                              color: remainingNum >= 0 ? "#059669" : "#dc2626",
                            }}
                          >
                            {formatNum(remainingNum)} บาท
                          </div>
                        </div>
                      </div>

                      {scrapWireName && (
                        <div
                          style={{
                            marginTop: "10px",
                            padding: "8px 12px",
                            background: "#eff6ff",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            color: "#1e40af",
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <span>
                            ♻️ <strong>สายรื้อถอน:</strong> {scrapWireName} (
                            {scrapWireLength || 0} กม.)
                          </span>
                          <span>
                            <strong>น้ำหนักส่งคืนจริง:</strong> {scrapReturnedWeight || 0} กก.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Checklist 8 Steps Card */}
                  {showChecklist && (
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "16px",
                        background: "#ffffff",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: "#581c87",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Award size={18} color="#7e22ce" />
                          <span>เช็คลิสท์การดำเนินงานและเอกสารปิดงาน</span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: checklistDoneCount === 8 ? "#059669" : "#475569",
                            background: checklistDoneCount === 8 ? "#d1fae5" : "#f1f5f9",
                            padding: "2px 10px",
                            borderRadius: "999px",
                          }}
                        >
                          สำเร็จ {checklistDoneCount} / 8 ขั้นตอน
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "8px",
                        }}
                      >
                        {CHECKLIST_ITEMS.map((item) => {
                          const isChecked = checks[item.id as keyof typeof checks];
                          return (
                            <div
                              key={item.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "7px 10px",
                                borderRadius: "8px",
                                background: isChecked ? "#f0fdf4" : "#f8fafc",
                                border: isChecked
                                  ? "1px solid #bbf7d0"
                                  : "1px solid #e2e8f0",
                                fontSize: "0.82rem",
                                fontWeight: isChecked ? 700 : 500,
                                color: isChecked ? "#166534" : "#64748b",
                              }}
                            >
                              {isChecked ? (
                                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                              ) : (
                                <Circle size={16} color="#cbd5e1" style={{ flexShrink: 0 }} />
                              )}
                              <span>{item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. SITE PHOTOS WITH CAPTIONS SECTION */}
            {showPhotos && images.length > 0 && (
              <div
                style={{
                  padding: "0 24px 22px 24px",
                }}
              >
                <div
                  style={{
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#581c87",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Camera size={19} color="#7e22ce" />
                      <span>ภาพถ่ายผลการดำเนินงานหน้างาน ({images.length} รูป)</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${photoColumns}, 1fr)`,
                      gap: "14px",
                    }}
                  >
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        style={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            height: photoColumns === 2 ? "240px" : photoColumns === 3 ? "185px" : "145px",
                            backgroundColor: "#f1f5f9",
                          }}
                        >
                          <img
                            src={img.url}
                            alt={img.caption || `ภาพที่ ${idx + 1}`}
                            crossOrigin="anonymous"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              top: "8px",
                              left: "8px",
                              background: "rgba(15, 23, 42, 0.75)",
                              color: "#ffffff",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            ภาพที่ {idx + 1}
                          </span>
                        </div>

                        {/* Caption Area under Photo */}
                        {(img.caption || isEditMode) && (
                          <div
                            style={{
                              padding: "8px 12px",
                              background: "#f8fafc",
                              borderTop: "1px solid #e2e8f0",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              fontWeight: 600,
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {isEditMode && onUpdateImageCaption ? (
                              <input
                                type="text"
                                value={img.caption || ""}
                                onChange={(e) => onUpdateImageCaption(idx, e.target.value)}
                                placeholder={`พิมพ์คำบรรยายภาพที่ ${idx + 1}...`}
                                style={{
                                  width: "100%",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid #a855f7",
                                  fontSize: "0.8rem",
                                  background: "#ffffff",
                                }}
                              />
                            ) : (
                              <span>{img.caption}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. FOOTER BAR */}
            <div
              style={{
                padding: "10px 24px",
                backgroundColor: "#f1f5f9",
                borderTop: "1px solid #cbd5e1",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.78rem",
                color: "#475569",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                ระบบติดตามสถานะงานก่อสร้าง แผนกก่อสร้างระบบไฟฟ้า ผกร.กรย.(ก3) • การไฟฟ้าส่วนภูมิภาค เขต 3 (ภาคกลาง)
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#6A1B9A",
                  color: "#ffffff",
                  padding: "3px 12px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              >
                <span>WBS: {wbs}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

