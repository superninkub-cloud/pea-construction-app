"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";
import TopBar from "../components/TopBar";
import {
  parseProjectImagesWithCaptions,
  compressMultipleImages,
  ProjectImageItem,
} from "../utils/imageCompressor";
import {
  FileCheck,
  Search,
  Plus,
  Trash2,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  User,
  Briefcase,
  Layers,
  Image as ImageIcon,
  Edit3,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  CheckSquare,
  Square,
  MapPin,
  FileText,
  Upload,
  X,
  Eye,
} from "lucide-react";
import { toPng } from "html-to-image";

const STEP_DEFINITIONS = [
  { label: "ขุดหลุมปักเสา", idx: 0, unit: "ต้น" },
  { label: "ปักเสา", idx: 1, unit: "ต้น" },
  { label: "ติดตั้งอุปกรณ์หัวเสา", idx: 2, unit: "ชุด" },
  { label: "พาดสายแรงสูง", idx: 3, unit: "วงจร-กม." },
  { label: "พาดสายแรงต่ำ", idx: 4, unit: "วงจร-กม." },
  { label: "งานรื้อถอน", idx: 5, unit: "ต้น" },
];

const CHECKLIST_LABELS: { key: keyof Project; label: string }[] = [
  { key: "check1", label: "ก่อสร้างเสร็จ" },
  { key: "check2", label: "ส่งคืนเศษสายแล้ว" },
  { key: "check3", label: "ส่งคืนเศษเหล็กแล้ว" },
  { key: "check4", label: "ทำ PM/ADS แล้ว" },
  { key: "check5", label: "ตรวจมาตรฐานแล้ว" },
  { key: "check6", label: "ใบสำคัญจ่ายครบแล้ว" },
  { key: "check7", label: "ขออนุมัติโอนงบแล้ว" },
  { key: "check8", label: "ปรับแผนผัง/ประมาณการแล้ว" },
];

export interface ClaimProjectOverride {
  workDate: string;
  customActivity: string;
  locationArea: string;
  includeImages: boolean;
}

export interface OtherWorkTask {
  id: string;
  date: string;
  category: string;
  title: string;
  referenceNo: string;
  location: string;
  resultDetail: string;
  images: ProjectImageItem[];
}

const OTHER_TASK_CATEGORIES = [
  "สำรวจหน้างาน / ประมาณการ",
  "ตรวจรับพัสดุ / ตรวจมาตรฐาน",
  "แก้ไขกระแสไฟฟ้าขัดข้อง / งานฉุกเฉิน",
  "ประสานงานหน่วยงานภายนอก / ผู้ใช้ไฟ",
  "งานบำรุงรักษาระบบจำหน่าย (PM)",
  "งานอื่นๆ ตามที่ได้รับมอบหมาย",
];

const STORAGE_KEY_CLAIM_DRAFT = "pea_work_report_claim_draft_v1";

function calculateProjectProgress(p: Project): number {
  if (p.status?.trim().toUpperCase() === "F4") return 100;
  const cType = p.construction_type || "1";
  if (cType === "5") return Number(p.manual_progress) || 0;
  const weights =
    cType === "2"
      ? [20, 30, 25, 25, 0, 0]
      : cType === "3"
      ? [20, 25, 25, 20, 0, 10]
      : cType === "4"
      ? [0, 0, 50, 50, 0, 0]
      : [15, 25, 20, 20, 10, 10];
  const targets = [
    p.step1_target || 0,
    p.step2_target || 0,
    p.step3_target || 0,
    p.step4_target || 0,
    p.step5_target || 0,
    p.step6_target || 0,
  ];
  const dones = [
    p.step1_done || 0,
    p.step2_done || 0,
    p.step3_done || 0,
    p.step4_done || 0,
    p.step5_done || 0,
    p.step6_done || 0,
  ];
  const total = dones.reduce((sum, doneVal, idx) => {
    const targetVal = targets[idx] || 0;
    if (targetVal === 0 || weights[idx] === 0) return sum;
    const pct = Math.min(1, doneVal / targetVal);
    return sum + pct * weights[idx];
  }, 0);
  return Math.round(total * 10) / 10;
}

function getLatestRemarkLines(remarks?: string): string {
  if (!remarks || !remarks.trim()) return "ดำเนินการควบคุมงานและตรวจสอบความก้าวหน้าหน้างานตามแผน";
  const lines = remarks
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.slice(0, 2).join(" | ");
}

export default function WorkReportClaimPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleChecked, setIsRoleChecked] = useState(false);

  // Supabase Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [supervisors, setSupervisors] = useState<string[]>([]);

  // Filter & Selection State
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedWbsList, setSelectedWbsList] = useState<string[]>([]);
  const [projectOverrides, setProjectOverrides] = useState<Record<string, ClaimProjectOverride>>({});

  // Section 2: Other Tasks (งานอื่นๆ ที่ไม่อยู่ในระบบอัปเดตสถานะงาน)
  const [otherTasks, setOtherTasks] = useState<OtherWorkTask[]>([]);
  const [newTaskDate, setNewTaskDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [newTaskCategory, setNewTaskCategory] = useState<string>(OTHER_TASK_CATEGORIES[0]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskRef, setNewTaskRef] = useState<string>("");
  const [newTaskLocation, setNewTaskLocation] = useState<string>("");
  const [newTaskDetail, setNewTaskDetail] = useState<string>("");
  const [newTaskImages, setNewTaskImages] = useState<ProjectImageItem[]>([]);
  const [compressingTaskImg, setCompressingTaskImg] = useState<boolean>(false);

  // Claim Header Metadata
  const [claimantName, setClaimantName] = useState<string>("นายอุดมศักดิ์ จันทร์กลิ่น");
  const [claimantPosition, setClaimantPosition] = useState<string>("ช่างผู้ควบคุมงาน / พนักงานช่าง");
  const [claimAffiliation, setClaimAffiliation] = useState<string>("แผนกก่อสร้างระบบไฟฟ้า ผกร.กรย.(ก3)");
  const [claimType, setClaimType] = useState<string>("เบิกค่าตอบแทนการออกไปปฏิบัติงานควบคุมงาน / เบี้ยเลี้ยง / ค่าล่วงเวลา (OT)");
  const [claimPeriod, setClaimPeriod] = useState<string>("ประจำเดือน พฤศจิกายน 2569");
  const [travelOrderNo, setTravelOrderNo] = useState<string>("");
  const [vehiclePlate, setVehiclePlate] = useState<string>("");
  const [executiveNote, setExecutiveNote] = useState<string>(
    "ได้ดำเนินการอัปเดตสถานะความก้าวหน้างานก่อสร้างในระบบติดตาม ผกร.กรย.(ก3) เรียบร้อยแล้ว พร้อมแนบรายละเอียดผลการปฏิบัติงานเพื่อประกอบการขอเบิกค่าตอบแทน"
  );
  const [approverName, setApproverName] = useState<string>("หัวหน้าแผนกก่อสร้างระบบไฟฟ้า ผกร.กรย.(ก3)");
  const [showPhotosInReport, setShowPhotosInReport] = useState<boolean>(true);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // Check Admin Role
  useEffect(() => {
    const role = sessionStorage.getItem("pea_role");
    setUserRole(role);
    setIsRoleChecked(true);
  }, []);

  // Load saved draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLAIM_DRAFT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.claimantName) setClaimantName(parsed.claimantName);
        if (parsed.claimantPosition) setClaimantPosition(parsed.claimantPosition);
        if (parsed.claimAffiliation) setClaimAffiliation(parsed.claimAffiliation);
        if (parsed.claimType) setClaimType(parsed.claimType);
        if (parsed.claimPeriod) setClaimPeriod(parsed.claimPeriod);
        if (parsed.travelOrderNo !== undefined) setTravelOrderNo(parsed.travelOrderNo);
        if (parsed.vehiclePlate !== undefined) setVehiclePlate(parsed.vehiclePlate);
        if (parsed.executiveNote !== undefined) setExecutiveNote(parsed.executiveNote);
        if (parsed.approverName !== undefined) setApproverName(parsed.approverName);
        if (Array.isArray(parsed.selectedWbsList)) setSelectedWbsList(parsed.selectedWbsList);
        if (parsed.projectOverrides) setProjectOverrides(parsed.projectOverrides);
        if (Array.isArray(parsed.otherTasks)) setOtherTasks(parsed.otherTasks);
      }
    } catch (e) {
      console.warn("Failed to load claim draft:", e);
    }
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    if (!isRoleChecked) return;
    try {
      localStorage.setItem(
        STORAGE_KEY_CLAIM_DRAFT,
        JSON.stringify({
          claimantName,
          claimantPosition,
          claimAffiliation,
          claimType,
          claimPeriod,
          travelOrderNo,
          vehiclePlate,
          executiveNote,
          approverName,
          selectedWbsList,
          projectOverrides,
          otherTasks,
        })
      );
    } catch (e) {
      console.warn("Failed to save claim draft:", e);
    }
  }, [
    isRoleChecked,
    claimantName,
    claimantPosition,
    claimAffiliation,
    claimType,
    claimPeriod,
    travelOrderNo,
    vehiclePlate,
    executiveNote,
    approverName,
    selectedWbsList,
    projectOverrides,
    otherTasks,
  ]);

  // Fetch Projects from Supabase
  const fetchProjects = async () => {
    setLoadingProjects(true);
    const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
    if (!error && data) {
      const validProjects = (data as Project[]).filter((p) => {
        if (
          (p.wbs && (p.wbs.includes("IMPORTANT_TASKS") || p.wbs.includes("SAFETY_PLAN"))) ||
          (p.name && (p.name.includes("Important Tasks") || p.name.includes("Safety Training")))
        ) {
          return false;
        }
        return true;
      });
      setProjects(validProjects);
      const uniqueSups = Array.from(
        new Set(validProjects.map((p) => (p.supervisor || "").trim()).filter(Boolean))
      ).sort();
      setSupervisors(uniqueSups);
    }
    setLoadingProjects(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // When user picks a supervisor filter, auto-fill claimantName if specific supervisor chosen
  const handleSupervisorChange = (sup: string) => {
    setSelectedSupervisor(sup);
    if (sup !== "ALL") {
      setClaimantName(sup.startsWith("นาย") ? sup : `นาย${sup}`);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSup = selectedSupervisor === "ALL" || (p.supervisor || "").trim() === selectedSupervisor;
      const matchStatus = statusFilter === "ALL" || (p.status || "").trim() === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.wbs || "").toLowerCase().includes(q) ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.supervisor || "").toLowerCase().includes(q) ||
        (p.remarks || "").toLowerCase().includes(q);
      return matchSup && matchStatus && matchSearch;
    });
  }, [projects, selectedSupervisor, statusFilter, searchQuery]);

  const selectedProjects = useMemo(() => {
    return selectedWbsList
      .map((wbs) => projects.find((p) => p.wbs === wbs))
      .filter((p): p is Project => !!p);
  }, [selectedWbsList, projects]);

  const toggleSelectProject = (proj: Project) => {
    const wbs = proj.wbs;
    if (selectedWbsList.includes(wbs)) {
      setSelectedWbsList((prev) => prev.filter((id) => id !== wbs));
    } else {
      setSelectedWbsList((prev) => [...prev, wbs]);
      if (!projectOverrides[wbs]) {
        const defaultDate = proj.updated_at
          ? new Date(proj.updated_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        setProjectOverrides((prev) => ({
          ...prev,
          [wbs]: {
            workDate: defaultDate,
            customActivity: getLatestRemarkLines(proj.remarks),
            locationArea: proj.name || "",
            includeImages: true,
          },
        }));
      }
    }
  };

  const selectAllFiltered = () => {
    const newWbs = filteredProjects.slice(0, 15).map((p) => p.wbs);
    const merged = Array.from(new Set([...selectedWbsList, ...newWbs]));
    const nextOverrides = { ...projectOverrides };
    filteredProjects.slice(0, 15).forEach((proj) => {
      if (!nextOverrides[proj.wbs]) {
        nextOverrides[proj.wbs] = {
          workDate: proj.updated_at
            ? new Date(proj.updated_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          customActivity: getLatestRemarkLines(proj.remarks),
          locationArea: proj.name || "",
          includeImages: true,
        };
      }
    });
    setProjectOverrides(nextOverrides);
    setSelectedWbsList(merged);
  };

  const updateOverride = (wbs: string, patch: Partial<ClaimProjectOverride>) => {
    setProjectOverrides((prev) => ({
      ...prev,
      [wbs]: {
        ...(prev[wbs] || {
          workDate: new Date().toISOString().split("T")[0],
          customActivity: "",
          locationArea: "",
          includeImages: true,
        }),
        ...patch,
      },
    }));
  };

  // Add Other Task Photos
  const handleAddOtherTaskPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setCompressingTaskImg(true);
    try {
      const compressed = await compressMultipleImages(files.slice(0, 4), undefined, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.72,
      });
      const dataUrls: ProjectImageItem[] = await Promise.all(
        compressed.map(
          (item) =>
            new Promise<ProjectImageItem>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  url: typeof reader.result === "string" ? reader.result : item.previewUrl,
                  caption: "",
                });
              };
              reader.readAsDataURL(item.file);
            })
        )
      );
      setNewTaskImages((prev) => [...prev, ...dataUrls].slice(0, 6));
    } catch (err) {
      console.error("Failed to compress task image:", err);
    } finally {
      setCompressingTaskImg(false);
      e.target.value = "";
    }
  };

  const handleAddOtherTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const item: OtherWorkTask = {
      id: `task_${Date.now()}`,
      date: newTaskDate,
      category: newTaskCategory,
      title: newTaskTitle.trim(),
      referenceNo: newTaskRef.trim(),
      location: newTaskLocation.trim(),
      resultDetail: newTaskDetail.trim() || "ดำเนินการเรียบร้อยตามที่ได้รับมอบหมาย",
      images: newTaskImages,
    };
    setOtherTasks((prev) => [...prev, item]);
    setNewTaskTitle("");
    setNewTaskRef("");
    setNewTaskLocation("");
    setNewTaskDetail("");
    setNewTaskImages([]);
  };

  const handleDeleteOtherTask = (id: string) => {
    setOtherTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const formatThaiDateShort = (isoDate?: string) => {
    if (!isoDate) return "-";
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear() + 543}`;
  };

  // Export PNG
  const handleDownloadPNG = async () => {
    if (!reportRef.current) return;
    try {
      setIsExportingPng(true);
      const dataUrl = await toPng(reportRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `รายงานผลการปฏิบัติงาน_เบิกค่าตอบแทน_${claimantName.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export PNG error:", err);
      alert("กรุณาใช้ปุ่ม พิมพ์ / บันทึก PDF แทนครับ");
    } finally {
      setIsExportingPng(false);
    }
  };

  // Print / Save PDF
  const handlePrintPDF = () => {
    if (!reportRef.current) return;
    const clone = reportRef.current.cloneNode(true) as HTMLElement;
    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>รายงานผลการปฏิบัติงานเพื่อประกอบการเบิกค่าตอบแทน - ${claimantName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body {
              font-family: 'Prompt', sans-serif;
              background: #ffffff;
              color: #0f172a;
              margin: 0;
              padding: 16px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              body { padding: 0; }
              @page { size: A4 portrait; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div>${clone.innerHTML}</div>
          <script>
            setTimeout(() => { window.print(); }, 650);
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // All attached photos across selected projects + other tasks
  const allReportPhotos = useMemo(() => {
    const list: { sourceLabel: string; url: string; caption: string }[] = [];
    selectedProjects.forEach((p) => {
      const ov = projectOverrides[p.wbs];
      if (ov && !ov.includeImages) return;
      const imgs = parseProjectImagesWithCaptions(p.image_url);
      imgs.slice(0, 4).forEach((img) => {
        list.push({
          sourceLabel: `${p.wbs}`,
          url: img.url,
          caption: img.caption || p.name,
        });
      });
    });
    otherTasks.forEach((t, idx) => {
      t.images.forEach((img) => {
        list.push({
          sourceLabel: `งานอื่นๆ #${idx + 1}: ${t.title}`,
          url: img.url,
          caption: img.caption || t.resultDetail,
        });
      });
    });
    return list;
  }, [selectedProjects, projectOverrides, otherTasks]);

  if (!isRoleChecked) return null;

  // Restrict to Admin, pscc3 (user), and Office (exclude guest)
  const canAccess = userRole === "admin" || userRole === "user" || userRole === "office";
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <TopBar title="รายงานผลการปฏิบัติงาน (เบิกค่าตอบแทน)" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={36} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">จำกัดสิทธิ์เฉพาะเจ้าหน้าที่</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              โปรแกรมรายงานผลการปฏิบัติงานเพื่อประกอบการเบิกค่าตอบแทน เปิดให้ใช้งานสำหรับผู้ใช้งาน{" "}
              <span className="font-bold text-purple-700">Admin, pscc3 และ Office</span> เท่านั้น
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <TopBar title="รายงานผลการปฏิบัติงาน (เบิกค่าตอบแทน)" />

      {/* Page Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6B2169] to-[#8A3B87] text-white flex items-center justify-center shadow-md shrink-0">
            <FileCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                โปรแกรมรายงานผลการปฏิบัติงาน เพื่อประกอบการเบิกค่าตอบแทน
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-[#6B2169] border border-purple-300">
                PEA ผกร.กรย.(ก3)
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              ดึงรายละเอียดจากการอัปเดตสถานะงานก่อสร้างในระบบ + เพิ่มเติมงานอื่นๆ นอกระบบ เพื่อพิมพ์แนบเบิกค่าตอบแทน/เบี้ยเลี้ยง/OT
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-sm transition-all border-0 cursor-pointer"
          >
            <Printer size={17} /> พิมพ์ สำหรับแนบเบิกค่าตอบแทน
          </button>
          <button
            type="button"
            disabled={isExportingPng}
            onClick={handleDownloadPNG}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all border-0 cursor-pointer disabled:opacity-60"
          >
            <Download size={17} /> {isExportingPng ? "กำลังสร้างรูปภาพ..." : "บันทึกรูปภาพรายงาน (PNG)"}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1700px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Data Entry (5 cols on XL) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Card 1: ข้อมูลผู้ขอเบิกและรอบการเบิก (Purple Theme) */}
          <div className="bg-purple-50/70 rounded-2xl shadow-sm border-2 border-purple-200/90 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#581C87] via-[#6B2169] to-[#8A3B87] text-white flex items-center justify-between">
              <h2 className="font-extrabold text-sm flex items-center gap-2">
                <User size={18} className="text-amber-300" />
                1. ข้อมูลช่างผู้ควบคุมงาน / ผู้ขอเบิกค่าตอบแทน
              </h2>
              <span className="text-[11px] font-bold text-purple-950 bg-amber-300 px-2.5 py-0.5 rounded-full shadow-sm">
                บันทึกอัตโนมัติ
              </span>
            </div>
            <div className="p-5 space-y-4 text-xs bg-gradient-to-b from-purple-100/60 via-purple-50/50 to-fuchsia-50/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-extrabold text-purple-950 mb-1.5">ชื่อ-สกุล ผู้ขอเบิก</label>
                  <input
                    type="text"
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="เช่น นายอุดมศักดิ์ จันทร์กลิ่น"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 shadow-sm font-bold text-slate-900 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-purple-950 mb-1.5">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={claimantPosition}
                    onChange={(e) => setClaimantPosition(e.target.value)}
                    placeholder="ช่างผู้ควบคุมงาน"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 shadow-sm font-semibold text-slate-800 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-extrabold text-purple-950 mb-1.5">สังกัด / แผนก</label>
                  <input
                    type="text"
                    value={claimAffiliation}
                    onChange={(e) => setClaimAffiliation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 shadow-sm font-semibold text-slate-800 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-purple-950 mb-1.5">งวด / ช่วงวันที่ขอเบิก</label>
                  <input
                    type="text"
                    value={claimPeriod}
                    onChange={(e) => setClaimPeriod(e.target.value)}
                    placeholder="เช่น ประจำเดือน พ.ย. 2569 หรือ 1-15 พ.ย. 69"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-purple-300 shadow-sm font-extrabold text-[#6B2169] hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-purple-950 mb-1.5">ประเภทการเบิกค่าตอบแทน</label>
                <input
                  type="text"
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 shadow-sm font-semibold text-slate-800 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-extrabold text-purple-950 mb-1.5">เลขที่อนุมัติเดินทาง / คำสั่ง (ถ้ามี)</label>
                  <input
                    type="text"
                    value={travelOrderNo}
                    onChange={(e) => setTravelOrderNo(e.target.value)}
                    placeholder="เช่น ก.3 ผกร.(ก3) / -"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 shadow-sm font-semibold text-slate-800 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-purple-950 mb-1.5">รถยนต์ที่ใช้ปฏิบัติงาน (ถ้ามี)</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="เช่น ทะเบียน 4กฒ-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 shadow-sm font-semibold text-slate-800 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: ส่วนที่ 1 ดึงงานจากการอัปเดตสถานะงานในระบบ (Soft Blue Theme) */}
          <div className="bg-blue-50/60 rounded-2xl shadow-sm border-2 border-blue-200/90 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-sm flex items-center gap-2">
                  <Layers size={18} className="text-sky-200" />
                  2. ส่วนที่ 1: เลือกงานจากระบบอัปเดตสถานะงานก่อสร้าง
                </h2>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  ติ๊กเลือกงานที่ช่างได้อัปเดตสถานะในระบบแล้ว เพื่อนำรายละเอียดความก้าวหน้ามาแนบเบิก
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-300 text-slate-900 shadow-sm shrink-0">
                เลือกแล้ว {selectedProjects.length} งาน
              </span>
            </div>

            <div className="p-5 space-y-3.5 bg-gradient-to-b from-blue-100/50 via-blue-50/40 to-sky-50/30">
              {/* Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-extrabold text-blue-950 mb-1.5">กรองตามช่างผู้ควบคุมงาน</label>
                  <select
                    value={selectedSupervisor}
                    onChange={(e) => handleSupervisorChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white shadow-sm font-bold text-slate-800 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="ALL">-- ช่างผู้ควบคุมงานทุกคน ({projects.length} งาน) --</option>
                    {supervisors.map((sup) => (
                      <option key={sup} value={sup}>
                        ช่าง: {sup}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-blue-950 mb-1.5">ค้นหาหมายเลข WBS / ชื่องาน</label>
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="พิมพ์ WBS หรือชื่องาน..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-blue-200 bg-white shadow-sm text-xs font-semibold hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-blue-900 font-bold">
                  พบ {filteredProjects.length} โครงการในระบบ
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors border-0 shadow-sm cursor-pointer"
                  >
                    + เลือกทั้งหมดที่กรอง
                  </button>
                  {selectedWbsList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedWbsList([])}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-bold transition-colors border border-rose-200 shadow-sm cursor-pointer"
                    >
                      ล้างที่เลือก
                    </button>
                  )}
                </div>
              </div>

              {/* Project Picker List */}
              <div className="max-h-[290px] overflow-y-auto border border-blue-200 rounded-xl divide-y divide-blue-100 bg-white shadow-sm">
                {loadingProjects ? (
                  <div className="p-8 text-center text-xs text-slate-400">กำลังดึงข้อมูลงานจากระบบอัปเดตสถานะงาน...</div>
                ) : filteredProjects.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">ไม่พบโครงการที่ค้นหา</div>
                ) : (
                  filteredProjects.map((proj) => {
                    const isChecked = selectedWbsList.includes(proj.wbs);
                    const pct = calculateProjectProgress(proj);
                    const imgs = parseProjectImagesWithCaptions(proj.image_url);
                    return (
                      <div
                        key={proj.wbs}
                        onClick={() => toggleSelectProject(proj)}
                        className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                          isChecked ? "bg-blue-100/70 hover:bg-blue-100" : "bg-white hover:bg-blue-50/40"
                        }`}
                      >
                        <div className="pt-0.5 text-blue-600 shrink-0">
                          {isChecked ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-300" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-xs font-extrabold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {proj.wbs}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                              สถานะ: {proj.status || "-"} ({pct}%)
                            </span>
                            <span className="text-[11px] font-bold text-slate-600">
                              ผู้คุมงาน: {proj.supervisor || "-"}
                            </span>
                            {imgs.length > 0 && (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                📷 {imgs.length} รูป
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-800 text-xs mt-1 truncate" title={proj.name}>
                            {proj.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            อัปเดตล่าสุด: {getLatestRemarkLines(proj.remarks)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Projects Fine-Tuning */}
              {selectedProjects.length > 0 && (
                <div className="pt-2 space-y-2.5">
                  <p className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                    <Edit3 size={14} className="text-blue-700" />
                    ปรับแต่งวันที่ออกไปปฏิบัติงาน / รายละเอียดการปฏิบัติงานรายโครงการ ({selectedProjects.length} งาน):
                  </p>
                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {selectedProjects.map((proj, idx) => {
                      const ov = projectOverrides[proj.wbs] || {
                        workDate: new Date().toISOString().split("T")[0],
                        customActivity: getLatestRemarkLines(proj.remarks),
                        locationArea: proj.name,
                        includeImages: true,
                      };
                      return (
                        <div
                          key={proj.wbs}
                          className="p-3.5 rounded-xl bg-white border border-blue-200 shadow-sm space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-blue-950 truncate">
                              #{idx + 1} {proj.wbs} - {proj.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSelectProject(proj)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded border-0 bg-transparent cursor-pointer shrink-0"
                              title="นำออกจากรายงาน"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-extrabold text-blue-900 mb-1">
                                วันที่ออกไปปฏิบัติงาน
                              </label>
                              <input
                                type="date"
                                value={ov.workDate}
                                onChange={(e) => updateOverride(proj.wbs, { workDate: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/30 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-extrabold text-blue-900 mb-1">
                                รายละเอียดผลการปฏิบัติงาน / การอัปเดตสถานะในระบบ
                              </label>
                              <input
                                type="text"
                                value={ov.customActivity}
                                onChange={(e) => updateOverride(proj.wbs, { customActivity: e.target.value })}
                                placeholder="ระบุผลการออกไปควบคุมงาน..."
                                className="w-full px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/30 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: ส่วนที่ 2 งานอื่นๆ ที่ไม่อยู่ในการอัปเดตสถานะงาน (Soft Emerald Theme) */}
          <div className="bg-emerald-50/60 rounded-2xl shadow-sm border-2 border-emerald-200/90 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#065F46] via-[#047857] to-[#059669] text-white flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-sm flex items-center gap-2">
                  <Briefcase size={18} className="text-emerald-200" />
                  3. ส่วนที่ 2: งานอื่นๆ (ที่ไม่อยู่ในระบบอัปเดตสถานะงาน)
                </h2>
                <p className="text-[11px] text-emerald-100 mt-0.5">
                  เพิ่มงานสำรวจ, งานตรวจรับ, งานแก้ไขไฟขัดข้อง หรืองานมอบหมายพิเศษเพื่อประกอบการเบิก
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-300 text-slate-900 shadow-sm shrink-0">
                {otherTasks.length} รายการ
              </span>
            </div>

            <form
              onSubmit={handleAddOtherTask}
              className="p-5 space-y-3.5 text-xs bg-gradient-to-b from-emerald-100/50 via-emerald-50/40 to-teal-50/30"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-emerald-950 mb-1.5">วันที่ปฏิบัติงาน</label>
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white shadow-sm font-bold text-slate-800 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-emerald-950 mb-1.5">ประเภทงานอื่นๆ</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white shadow-sm font-bold text-slate-800 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    {OTHER_TASK_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-extrabold text-emerald-950 mb-1.5">
                    ชื่องาน / ภารกิจที่ออกไปปฏิบัติ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="เช่น สำรวจประมาณการขยายเขตระบบจำหน่าย / ตรวจรับเสาไฟฟ้า"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white shadow-sm font-semibold text-slate-800 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-emerald-950 mb-1.5">เลขบันทึก / อ้างอิง (ถ้ามี)</label>
                  <input
                    type="text"
                    value={newTaskRef}
                    onChange={(e) => setNewTaskRef(e.target.value)}
                    placeholder="เช่น ก.3 กรย. / ใบสั่งงาน"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white shadow-sm font-semibold text-slate-800 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-emerald-950 mb-1.5">สถานที่ปฏิบัติงาน / พื้นที่</label>
                  <input
                    type="text"
                    value={newTaskLocation}
                    onChange={(e) => setNewTaskLocation(e.target.value)}
                    placeholder="เช่น ต.บ้านโพธิ์ อ.เมือง จ.นครราชสีมา"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white shadow-sm font-semibold text-slate-800 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-emerald-950 mb-1.5">ผลการปฏิบัติงาน</label>
                  <input
                    type="text"
                    value={newTaskDetail}
                    onChange={(e) => setNewTaskDetail(e.target.value)}
                    placeholder="เช่น สำรวจและจัดทำแผนผังแล้วเสร็จ 100%"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white shadow-sm font-semibold text-slate-800 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Optional Photo Upload for Other Task */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm font-bold cursor-pointer transition-colors">
                  <Upload size={14} />
                  <span>{compressingTaskImg ? "กำลังบีบอัดรูป..." : "แนบรูปถ่ายงานอื่นๆ (ถ้ามี)"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddOtherTaskPhotos}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-colors border-0 cursor-pointer"
                >
                  <Plus size={16} /> เพิ่มรายการงานอื่นๆ
                </button>
              </div>

              {newTaskImages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {newTaskImages.map((img, i) => (
                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 shadow-sm">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewTaskImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 border-0 cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* List of Added Other Tasks */}
              {otherTasks.length > 0 && (
                <div className="pt-3 border-t border-emerald-200/80 space-y-2">
                  {otherTasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white">
                            งานอื่นๆ #{idx + 1}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-900">
                            วันที่ {formatThaiDateShort(task.date)}
                          </span>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                            {task.category}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800 text-xs mt-1">{task.title}</p>
                        <p className="text-[11px] text-slate-600">
                          พื้นที่: {task.location || "-"} • ผลปฏิบัติงาน: {task.resultDetail}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteOtherTask(task.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 bg-transparent border-0 cursor-pointer shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Card 4: หมายเหตุและการตั้งค่ารายงาน (Soft Amber Theme) */}
          <div className="bg-amber-50/70 rounded-2xl shadow-sm border-2 border-amber-200/90 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#F59E0B] text-white flex flex-wrap items-center justify-between gap-2">
              <label className="font-extrabold text-sm flex items-center gap-2">
                <FileText size={17} className="text-amber-100" />
                4. คำรับรอง / หมายเหตุประกอบการเบิกค่าตอบแทน
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-extrabold text-amber-950 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                <input
                  type="checkbox"
                  checked={showPhotosInReport}
                  onChange={(e) => setShowPhotosInReport(e.target.checked)}
                  className="rounded text-amber-600"
                />
                แนบรูปถ่ายหน้างาน ({allReportPhotos.length} รูป)
              </label>
            </div>
            <div className="p-5 space-y-3.5 bg-gradient-to-b from-amber-100/50 via-amber-50/40 to-orange-50/30">
              <div>
                <label className="block font-extrabold text-amber-950 mb-1.5">
                  ข้อความรับรองผลการปฏิบัติงาน / หมายเหตุเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  value={executiveNote}
                  onChange={(e) => setExecutiveNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-amber-200 shadow-sm text-xs font-semibold text-slate-800 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block font-extrabold text-amber-950 mb-1.5">
                  ตำแหน่งผู้บังคับบัญชา / ผู้รับรองผลการปฏิบัติงาน
                </label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 shadow-sm text-xs font-semibold text-slate-800 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Official Document Preview (7 cols on XL) */}
        <div className="xl:col-span-7">
          <div className="bg-slate-200/70 rounded-3xl p-3 md:p-6 border border-slate-300/80 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2">
              <div>
                <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Eye size={15} className="text-[#6B2169]" />
                  ตัวอย่างเอกสารรายงานผลการปฏิบัติงาน (A4 Preview - พร้อมพิมพ์แนบเบิกค่าตอบแทน)
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  รวมงานในระบบ {selectedProjects.length} งาน + งานอื่นๆ {otherTasks.length} งาน
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#6B2169] to-[#8A3B87] hover:from-[#581a56] hover:to-[#732f70] text-white shadow-md transition-all border-0 cursor-pointer"
                >
                  <Printer size={15} className="text-amber-300" /> พิมพ์ สำหรับแนบเบิกค่าตอบแทน
                </button>
                <button
                  type="button"
                  disabled={isExportingPng}
                  onClick={handleDownloadPNG}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all border-0 cursor-pointer disabled:opacity-60"
                >
                  <Download size={14} /> บันทึกรูป (PNG)
                </button>
              </div>
            </div>

            {/* PRINTABLE SHEET */}
            <div
              ref={reportRef}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 text-slate-900 space-y-5 max-w-[920px] mx-auto"
            >
              {/* Official Banner Header */}
              <div className="border-b-2 border-[#6B2169] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#6B2169] text-white flex flex-col items-center justify-center font-black shadow-sm shrink-0">
                    <span className="text-base leading-none">PEA</span>
                    <span className="text-[9px] font-bold text-amber-300 mt-0.5">ผกร.(ก3)</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#6B2169] mb-1">
                      การไฟฟ้าส่วนภูมิภาค เขต 3 (ภาคกลาง) จ.นครปฐม • PEA ผกร.กรย.(ก3)
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 leading-snug">
                      แบบรายงานผลการปฏิบัติงานและอัปเดตสถานะงาน (ประกอบการเบิกค่าตอบแทน)
                    </h2>
                    <p className="text-xs font-semibold text-slate-600">
                      {claimType} • <span className="text-[#6B2169] font-extrabold">{claimPeriod}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl px-3.5 py-2 text-right shrink-0">
                  <p className="text-[10px] font-bold text-purple-700">สรุปภารกิจที่ขอเบิก</p>
                  <p className="text-xl font-black text-[#6B2169] leading-tight">
                    {selectedProjects.length + otherTasks.length} รายการ
                  </p>
                  <p className="text-[10px] text-slate-500">
                    งานในระบบ {selectedProjects.length} • งานอื่นๆ {otherTasks.length}
                  </p>
                </div>
              </div>

              {/* Claimant Info Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">ผู้ขอเบิก / ช่างผู้ควบคุมงาน</span>
                  <span className="font-extrabold text-slate-900">{claimantName || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">ตำแหน่ง / สังกัด</span>
                  <span className="font-bold text-slate-800">{claimantPosition}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">เลขที่อนุมัติเดินทาง / คำสั่ง</span>
                  <span className="font-bold text-slate-800">{travelOrderNo || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">รถยนต์ที่ใช้ปฏิบัติงาน</span>
                  <span className="font-bold text-slate-800">{vehiclePlate || "-"}</span>
                </div>
              </div>

              {/* PART 1: งานจากการอัปเดตสถานะงานในระบบ */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h3 className="text-xs md:text-sm font-extrabold text-[#1E3A8A] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white inline-flex items-center justify-center text-[11px]">
                      1
                    </span>
                    ส่วนที่ 1: รายละเอียดงานก่อสร้างที่อัปเดตสถานะในระบบติดตาม ผกร.กรย.(ก3) ({selectedProjects.length}{" "}
                    โครงการ)
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ อัปเดตสถานะในระบบแล้ว
                  </span>
                </div>

                {selectedProjects.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    ยังไม่ได้เลือกโครงการจากระบบอัปเดตสถานะงาน (กรุณาติ๊กเลือกโครงการจากแถบด้านซ้าย)
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11.5px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                          <th className="py-2 px-2.5 font-bold w-10 text-center">ลำดับ</th>
                          <th className="py-2 px-2.5 font-bold w-24">วันที่ปฏิบัติงาน</th>
                          <th className="py-2 px-2.5 font-bold">หมายเลข WBS / ชื่องานก่อสร้าง</th>
                          <th className="py-2 px-2.5 font-bold text-center w-24">สถานะ / % งาน</th>
                          <th className="py-2 px-2.5 font-bold">ปริมาณงานและรายละเอียดที่อัปเดตในระบบ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedProjects.map((proj, idx) => {
                          const ov = projectOverrides[proj.wbs];
                          const pct = calculateProjectProgress(proj);
                          const targets = [
                            proj.step1_target || 0,
                            proj.step2_target || 0,
                            proj.step3_target || 0,
                            proj.step4_target || 0,
                            proj.step5_target || 0,
                            proj.step6_target || 0,
                          ];
                          const dones = [
                            proj.step1_done || 0,
                            proj.step2_done || 0,
                            proj.step3_done || 0,
                            proj.step4_done || 0,
                            proj.step5_done || 0,
                            proj.step6_done || 0,
                          ];
                          const activeMetrics = STEP_DEFINITIONS.map((s) => ({
                            ...s,
                            done: dones[s.idx],
                            target: targets[s.idx],
                          })).filter((m) => m.target > 0 || m.done > 0);

                          const checkedItems = CHECKLIST_LABELS.filter((c) => Boolean(proj[c.key]));

                          return (
                            <tr key={proj.wbs} className="align-top">
                              <td className="py-2.5 px-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                              <td className="py-2.5 px-2.5 font-bold text-slate-800 whitespace-nowrap">
                                {formatThaiDateShort(ov?.workDate)}
                              </td>
                              <td className="py-2.5 px-2.5">
                                <div className="font-mono font-extrabold text-indigo-900 text-xs">{proj.wbs}</div>
                                <div className="font-bold text-slate-900 mt-0.5">{proj.name}</div>
                                <div className="text-[10.5px] text-slate-500 mt-0.5">
                                  ผู้ควบคุมงาน: {proj.supervisor || claimantName}
                                </div>
                              </td>
                              <td className="py-2.5 px-2.5 text-center">
                                <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-[#6B2169] font-extrabold text-[11px]">
                                  {proj.status || "-"}
                                </span>
                                <div className="font-black text-emerald-700 text-sm mt-1">{pct}%</div>
                              </td>
                              <td className="py-2.5 px-2.5 space-y-1">
                                <p className="font-bold text-slate-800">
                                  {ov?.customActivity || getLatestRemarkLines(proj.remarks)}
                                </p>
                                {activeMetrics.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {activeMetrics.map((m) => (
                                      <span
                                        key={m.idx}
                                        className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200"
                                      >
                                        {m.label}: {m.done}/{m.target} {m.unit}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {checkedItems.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {checkedItems.map((c) => (
                                      <span
                                        key={String(c.key)}
                                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200"
                                      >
                                        ✓ {c.label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* PART 2: งานอื่นๆ ที่ไม่อยู่ในการอัปเดตสถานะงาน */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h3 className="text-xs md:text-sm font-extrabold text-emerald-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white inline-flex items-center justify-center text-[11px]">
                      2
                    </span>
                    ส่วนที่ 2: งานปฏิบัติการอื่นๆ นอกเหนือจากงานอัปเดตสถานะ ({otherTasks.length} รายการ)
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    งานสำรวจ / ตรวจรับ / แก้ไฟขัดข้อง / งานมอบหมายพิเศษ
                  </span>
                </div>

                {otherTasks.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                    - ไม่มีรายการงานอื่นๆ เพิ่มเติม (หากมีงานนอกระบบ สามารถกรอกเพิ่มได้ที่กล่องส่วนที่ 2 ด้านซ้าย) -
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11.5px]">
                      <thead>
                        <tr className="bg-emerald-50/70 text-emerald-950 border-b border-slate-200">
                          <th className="py-2 px-2.5 font-bold w-10 text-center">ลำดับ</th>
                          <th className="py-2 px-2.5 font-bold w-24">วันที่ปฏิบัติงาน</th>
                          <th className="py-2 px-2.5 font-bold">ประเภทภารกิจ / ชื่องานอื่นๆ</th>
                          <th className="py-2 px-2.5 font-bold">สถานที่ / พื้นที่ปฏิบัติงาน</th>
                          <th className="py-2 px-2.5 font-bold">ผลการปฏิบัติงานเพื่อประกอบการเบิก</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {otherTasks.map((task, idx) => (
                          <tr key={task.id} className="align-top">
                            <td className="py-2 px-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-2.5 font-bold text-slate-800 whitespace-nowrap">
                              {formatThaiDateShort(task.date)}
                            </td>
                            <td className="py-2 px-2.5">
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold mb-0.5">
                                {task.category}
                              </span>
                              <div className="font-bold text-slate-900">{task.title}</div>
                              {task.referenceNo && (
                                <div className="text-[10.5px] text-slate-500">อ้างอิง: {task.referenceNo}</div>
                              )}
                            </td>
                            <td className="py-2 px-2.5 font-medium text-slate-700">{task.location || "-"}</td>
                            <td className="py-2 px-2.5 font-bold text-slate-800">{task.resultDetail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* PART 3: ประมวลภาพถ่ายการปฏิบัติงานหน้างาน (ถ้ามี) */}
              {showPhotosInReport && allReportPhotos.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <h3 className="text-xs md:text-sm font-extrabold text-purple-950 flex items-center gap-2">
                      <ImageIcon size={16} className="text-[#6B2169]" />
                      ภาพถ่ายหลักฐานการออกไปปฏิบัติงานหน้างาน ({allReportPhotos.length} รูป)
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allReportPhotos.slice(0, 9).map((photo, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col">
                        <div className="h-32 w-full bg-slate-100 overflow-hidden">
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2 text-[10.5px]">
                          <div className="font-extrabold text-[#6B2169] truncate">{photo.sourceLabel}</div>
                          <div className="text-slate-600 line-clamp-2 leading-snug mt-0.5">{photo.caption}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clarification / Certification Box */}
              {executiveNote && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                  <span className="font-extrabold text-amber-900">คำรับรองและหมายเหตุประกอบการขอเบิกค่าตอบแทน: </span>
                  <span className="text-slate-800 font-medium">{executiveNote}</span>
                </div>
              )}

              {/* Official Signature Blocks */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-center">
                <div className="space-y-2">
                  <p className="font-bold text-slate-600">ขอรับรองว่าได้ออกไปปฏิบัติงานและอัปเดตสถานะงานจริง</p>
                  <div className="pt-7 text-slate-400">ลงชื่อ ............................................................ ผู้ขอเบิก</div>
                  <p className="font-extrabold text-slate-900">({claimantName || "................................................"})</p>
                  <p className="text-slate-600">{claimantPosition}</p>
                  <p className="text-[11px] text-slate-400">วันที่ ......... / .................... / ............</p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-600">ได้ตรวจสอบผลการปฏิบัติงานในระบบแล้ว เห็นควรอนุมัติเบิกจ่าย</p>
                  <div className="pt-7 text-slate-400">ลงชื่อ ............................................................ ผู้รับรอง/ผู้บังคับบัญชา</div>
                  <p className="font-extrabold text-slate-900">(............................................................)</p>
                  <p className="text-slate-600">{approverName}</p>
                  <p className="text-[11px] text-slate-400">วันที่ ......... / .................... / ............</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <span>เอกสารอ้างอิงจากระบบติดตามงานก่อสร้าง PEA ผกร.กรย.(ก3)</span>
                <span>พิมพ์เมื่อ: {new Date().toLocaleDateString("th-TH")}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

