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
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Save,
  FolderOpen,
  FilePlus,
  Clock,
  Info,
  Megaphone,
  ClipboardCheck,
  PenTool,
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

export interface SavedClaimReportRecord {
  id: string;
  reportTitle: string;
  savedAt: string;
  claimantName: string;
  claimantPosition: string;
  claimAffiliation: string;
  claimType: string;
  claimPeriod: string;
  travelOrderNo: string;
  vehiclePlate: string;
  executiveNote: string;
  approverName: string;
  selectedWbsList: string[];
  projectOverrides: Record<string, ClaimProjectOverride>;
  otherTasks: OtherWorkTask[];
  showPhotosInReport: boolean;
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
const STORAGE_KEY_SAVED_CLAIM_REPORTS = "pea_work_report_claim_saved_list_v1";

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

  // Saved Reports Archive State (บันทึกเก็บรายงานผลที่กรอกไปแล้ว เรียกมาแก้ไข/ลบได้)
  const [savedReports, setSavedReports] = useState<SavedClaimReportRecord[]>([]);
  const [activeSavedReportId, setActiveSavedReportId] = useState<string | null>(null);
  const [customReportTitle, setCustomReportTitle] = useState<string>("");
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(true);
  const [saveToastMsg, setSaveToastMsg] = useState<string | null>(null);

  // Collapsible sections 1-4 (default all collapsed so UI looks clean; click to expand)
  const [expandedSections, setExpandedSections] = useState<Record<1 | 2 | 3 | 4, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const toggleSection = (sec: 1 | 2 | 3 | 4) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const showTempToast = (msg: string) => {
    setSaveToastMsg(msg);
    setTimeout(() => setSaveToastMsg(null), 3200);
  };

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
      const savedListStr = localStorage.getItem(STORAGE_KEY_SAVED_CLAIM_REPORTS);
      if (savedListStr) {
        const parsedList = JSON.parse(savedListStr);
        if (Array.isArray(parsedList)) {
          setSavedReports(parsedList);
        }
      }
    } catch (e) {
      console.warn("Failed to load claim draft:", e);
    }
  }, []);

  const persistSavedReports = (list: SavedClaimReportRecord[]) => {
    setSavedReports(list);
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_CLAIM_REPORTS, JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to persist saved reports:", e);
    }
  };

  // Save current form as a new record or update currently loaded record
  const handleSaveCurrentReport = (asNew: boolean = false) => {
    const autoTitle =
      customReportTitle.trim() ||
      `${claimantName || "ไม่ระบุชื่อ"} • ${claimPeriod || "ไม่ระบุงวด"} (${
        selectedWbsList.length + otherTasks.length
      } งาน)`;
    const nowIso = new Date().toISOString();

    if (!asNew && activeSavedReportId) {
      const updated = savedReports.map((r) =>
        r.id === activeSavedReportId
          ? {
              ...r,
              reportTitle: autoTitle,
              savedAt: nowIso,
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
              showPhotosInReport,
            }
          : r
      );
      persistSavedReports(updated);
      setCustomReportTitle(autoTitle);
      showTempToast("✓ บันทึกทับรายงานเดิมเรียบร้อยแล้ว");
    } else {
      const newId = `claim_rep_${Date.now()}`;
      const newRecord: SavedClaimReportRecord = {
        id: newId,
        reportTitle: autoTitle,
        savedAt: nowIso,
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
        showPhotosInReport,
      };
      persistSavedReports([newRecord, ...savedReports]);
      setActiveSavedReportId(newId);
      setCustomReportTitle(autoTitle);
      setIsArchiveOpen(true);
      showTempToast("✓ บันทึกเก็บรายงานฉบับใหม่เรียบร้อยแล้ว");
    }
  };

  const handleLoadSavedReport = (record: SavedClaimReportRecord) => {
    setActiveSavedReportId(record.id);
    setCustomReportTitle(record.reportTitle);
    setClaimantName(record.claimantName || "");
    setClaimantPosition(record.claimantPosition || "");
    setClaimAffiliation(record.claimAffiliation || "");
    setClaimType(record.claimType || "");
    setClaimPeriod(record.claimPeriod || "");
    setTravelOrderNo(record.travelOrderNo || "");
    setVehiclePlate(record.vehiclePlate || "");
    setExecutiveNote(record.executiveNote || "");
    setApproverName(record.approverName || "");
    setSelectedWbsList(Array.isArray(record.selectedWbsList) ? record.selectedWbsList : []);
    setProjectOverrides(record.projectOverrides || {});
    setOtherTasks(Array.isArray(record.otherTasks) ? record.otherTasks : []);
    setShowPhotosInReport(record.showPhotosInReport !== false);
    showTempToast(`✓ เรียกข้อมูลรายงาน "${record.reportTitle}" มาแก้ไขแล้ว`);
  };

  const handleDeleteSavedReport = (id: string, title: string) => {
    const filtered = savedReports.filter((r) => r.id !== id);
    persistSavedReports(filtered);
    if (activeSavedReportId === id) {
      setActiveSavedReportId(null);
    }
    showTempToast(`🗑️ ลบรายงาน "${title}" ออกเรียบร้อยแล้ว`);
  };

  const handleCreateBlankReport = () => {
    setActiveSavedReportId(null);
    setCustomReportTitle("");
    setSelectedWbsList([]);
    setProjectOverrides({});
    setOtherTasks([]);
    setTravelOrderNo("");
    setVehiclePlate("");
    showTempToast("✨ เริ่มสร้างแบบรายงานฉบับใหม่");
  };

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

  // Print / Save PDF (Matches screen preview layout while optimizing shadows & borders for crisp ink-saving A4 printing)
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
              padding: 8px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              body { padding: 0; margin: 0; background: #ffffff !important; }
              @page { size: A4 portrait; margin: 6mm 8mm; }
              * { box-shadow: none !important; text-shadow: none !important; }
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

  // Grouped photos per job (latest 3 photos per job only, separated clearly by job)
  const groupedReportPhotos = useMemo(() => {
    const groups: {
      groupKey: string;
      badge: string;
      title: string;
      subtitle: string;
      totalOriginalCount: number;
      photos: { url: string; caption: string }[];
    }[] = [];

    selectedProjects.forEach((p, idx) => {
      const ov = projectOverrides[p.wbs];
      if (ov && !ov.includeImages) return;
      const imgs = parseProjectImagesWithCaptions(p.image_url);
      if (imgs.length === 0) return;
      // Take the latest 3 photos (last 3 uploaded)
      const latestThree = imgs.slice(-3);
      groups.push({
        groupKey: `proj_${p.wbs}`,
        badge: `งานที่ ${idx + 1} • ${p.wbs}`,
        title: p.name || p.wbs,
        subtitle: `สถานะ ${p.status || "-"} (${calculateProjectProgress(p)}%)`,
        totalOriginalCount: imgs.length,
        photos: latestThree.map((img) => ({
          url: img.url,
          caption: img.caption || "",
        })),
      });
    });

    otherTasks.forEach((t, idx) => {
      if (!t.images || t.images.length === 0) return;
      const latestThree = t.images.slice(-3);
      groups.push({
        groupKey: `other_${t.id}`,
        badge: `งานอื่นๆ #${idx + 1}`,
        title: t.title,
        subtitle: t.category,
        totalOriginalCount: t.images.length,
        photos: latestThree.map((img) => ({
          url: img.url,
          caption: img.caption || t.resultDetail,
        })),
      });
    });

    return groups;
  }, [selectedProjects, projectOverrides, otherTasks]);

  const totalDisplayedPhotosCount = useMemo(() => {
    return groupedReportPhotos.reduce((acc, g) => acc + g.photos.length, 0);
  }, [groupedReportPhotos]);

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
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans text-[#0F172A]">
      <TopBar title="รายงานผลการปฏิบัติงาน (เบิกค่าตอบแทน)" />

      {/* Page Header - Modern Clean Microsoft 365 Style (PEA Purple Tone) */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#6B2169] text-white flex items-center justify-center shrink-0">
            <FileCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-extrabold text-[#0F172A] tracking-tight">
                โปรแกรมรายงานผลการปฏิบัติงาน เพื่อประกอบการเบิกค่าตอบแทน
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3E8F3] text-[#6B2169] border border-[#E2CBE2]">
                PEA ผกร.กรย.(ก3)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ดึงรายละเอียดจากการอัปเดตสถานะงานก่อสร้างในระบบ + เพิ่มเติมงานอื่นๆ นอกระบบ เพื่อพิมพ์แนบเบิกค่าตอบแทน/เบี้ยเลี้ยง/OT
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-[#EA580C] hover:bg-[#C2410C] text-white transition-colors border-0 cursor-pointer"
          >
            <Printer size={16} /> พิมพ์ สำหรับแนบเบิกค่าตอบแทน
          </button>
          <button
            type="button"
            disabled={isExportingPng}
            onClick={handleDownloadPNG}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-[#16A34A] hover:bg-[#15803D] text-white transition-colors border-0 cursor-pointer disabled:opacity-60"
          >
            <Download size={16} /> {isExportingPng ? "กำลังสร้างรูปภาพ..." : "บันทึกรูปภาพรายงาน (PNG)"}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1700px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Data Entry (5 cols on XL) */}
        <div className="xl:col-span-5 space-y-3.5">
          {/* Toast Notification */}
          {saveToastMsg && (
            <div className="px-4 py-2.5 rounded-xl bg-[#16A34A] text-white text-xs font-bold flex items-center justify-between">
              <span>{saveToastMsg}</span>
              <button
                type="button"
                onClick={() => setSaveToastMsg(null)}
                className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Card 0: คลังบันทึกเก็บรายงานผลการปฏิบัติงาน (Microsoft 365 Clean Style) */}
          <div className="rounded-2xl border border-[#CBD5E1] bg-white overflow-hidden transition-all">
            <div
              onClick={() => setIsArchiveOpen((prev) => !prev)}
              className="flex items-stretch cursor-pointer select-none hover:bg-slate-50 transition-colors"
            >
              <div className="w-16 bg-[#475569] text-white flex items-center justify-center shrink-0">
                <FolderOpen size={24} strokeWidth={2.2} />
              </div>
              <div className="flex-1 px-4 py-3 flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <h2 className="font-extrabold text-[15px] text-[#0F172A] leading-snug truncate">
                    แฟ้มบันทึกรายงานผลที่กรอกไว้
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5 truncate">
                    บันทึกเก็บไว้เรียกมาแก้ไข พิมพ์ซ้ำ หรือลบออกเมื่อไม่ใช้แล้ว
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#334155] text-white">
                    {savedReports.length} ฉบับ
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                    {isArchiveOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>
              </div>
            </div>

            {isArchiveOpen && (
              <div className="p-4 space-y-3 text-xs bg-[#F8FAFC] border-t border-slate-200">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customReportTitle}
                    onChange={(e) => setCustomReportTitle(e.target.value)}
                    placeholder={`ตั้งชื่อแฟ้มรายงาน เช่น ${claimantName} - ${claimPeriod}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeSavedReportId ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveCurrentReport(false)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold border-0 cursor-pointer transition-colors"
                          title="บันทึกทับฉบับที่กำลังเปิดแก้ไข"
                        >
                          <Save size={14} /> บันทึกแก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveCurrentReport(true)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold border-0 cursor-pointer transition-colors"
                          title="บันทึกแยกเป็นฉบับใหม่"
                        >
                          <FilePlus size={14} /> บันทึกฉบับใหม่
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSaveCurrentReport(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold border-0 cursor-pointer transition-colors"
                      >
                        <Save size={14} /> บันทึกเก็บรายงานนี้
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCreateBlankReport}
                      className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 cursor-pointer transition-colors"
                      title="ล้างฟอร์มเพื่อสร้างรายงานฉบับใหม่"
                    >
                      <RefreshCw size={13} /> เริ่มใหม่
                    </button>
                  </div>
                </div>

                {savedReports.length === 0 ? (
                  <div className="py-3.5 px-3 rounded-xl border border-dashed border-slate-300 bg-white text-center text-slate-500">
                    ยังไม่มีรายงานที่บันทึกเก็บไว้ • กดปุ่ม{" "}
                    <span className="font-bold text-[#4F46E5]">บันทึกเก็บรายงานนี้</span> เพื่อเก็บไว้เรียกใช้ภายหลัง
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                    {savedReports.map((rec) => {
                      const isCurrent = rec.id === activeSavedReportId;
                      const savedDate = new Date(rec.savedAt);
                      const dateLabel = !isNaN(savedDate.getTime())
                        ? `${savedDate.toLocaleDateString("th-TH")} ${savedDate
                            .getHours()
                            .toString()
                            .padStart(2, "0")}:${savedDate.getMinutes().toString().padStart(2, "0")} น.`
                        : "-";
                      return (
                        <div
                          key={rec.id}
                          className={`p-2.5 rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                            isCurrent
                              ? "bg-[#EEF2FF] border-[#818CF8]"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div
                            onClick={() => handleLoadSavedReport(rec)}
                            className="min-w-0 flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4F46E5] text-white">
                                  กำลังเปิดแก้ไข
                                </span>
                              )}
                              <span className="font-bold text-[#0F172A] truncate">{rec.reportTitle}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>ผู้ขอเบิก: {rec.claimantName || "-"}</span>
                              <span>•</span>
                              <span>
                                งานในระบบ {rec.selectedWbsList?.length || 0} + งานอื่นๆ {rec.otherTasks?.length || 0}
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-0.5 text-slate-400">
                                <Clock size={11} /> {dateLabel}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleLoadSavedReport(rec)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#EEF2FF] hover:bg-[#4F46E5] text-[#4338CA] hover:text-white font-bold border border-[#C7D2FE] transition-colors cursor-pointer text-[11px]"
                            >
                              เรียกใช้/แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSavedReport(rec.id, rec.reportTitle)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                              title="ลบรายงานนี้"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Expand/Collapse Toolbar (Matches uploaded reference image) */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white rounded-2xl border border-slate-200/90 text-xs">
            <span className="font-bold text-[#1E293B] flex items-center gap-2">
              <Edit3 size={15} className="text-[#6B2169]" />
              คลิกที่หัวข้อส่วนที่ 1 - 4 เพื่อเปิดกรอกหรือดูข้อมูลรายละเอียด
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpandedSections({ 1: true, 2: true, 3: true, 4: true })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F3E8F3] text-[#6B2169] font-bold border border-[#D5B3D5] cursor-pointer transition-colors"
              >
                <RefreshCw size={12} /> เปิดทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setExpandedSections({ 1: false, 2: false, 3: false, 4: false })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-bold border-0 cursor-pointer transition-colors"
              >
                <ChevronUp size={13} /> ยุบทั้งหมด
              </button>
            </div>
          </div>

          {/* Card 1: ม่วง กฟภ. = ข้อมูลผู้ควบคุมงาน (Microsoft 365 Modern Clean Card) */}
          <div className="rounded-2xl border border-[#E2CBE2] bg-[#F8F1F8] overflow-hidden transition-all">
            <div
              onClick={() => toggleSection(1)}
              className="flex items-stretch cursor-pointer select-none hover:bg-[#EFE0EF] transition-colors min-h-[78px]"
            >
              {/* Left Solid Category Block (PEA Purple) */}
              <div className="w-16 bg-[#6B2169] text-white flex items-center justify-center shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center">
                  <User size={22} strokeWidth={2.3} />
                </div>
              </div>

              {/* Center Navy Text on Soft PEA Purple */}
              <div className="flex-1 px-4 py-3 flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <h2 className="font-extrabold text-[15px] text-[#0F172A] leading-snug truncate">
                    1. ข้อมูลช่างผู้ควบคุมงาน / ผู้ขอเบิกค่าตอบแทน
                  </h2>
                  <p className="text-xs text-[#334155] mt-0.5 truncate">
                    ผู้ขอเบิก: <span className="font-extrabold text-[#6B2169]">{claimantName || "-"}</span> •{" "}
                    {claimPeriod} (แตะเพื่อแก้ไข)
                  </p>
                </div>

                {/* Right Action Pill + Circular Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#6B2169] text-white">
                    {expandedSections[1] ? "ยุบซ่อน" : "กดเพื่อกรอก"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#E2CBE2] text-[#4A154B] flex items-center justify-center">
                    {expandedSections[1] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>
              </div>
            </div>

            {expandedSections[1] && (
              <div className="p-5 space-y-3.5 text-xs bg-[#FCF9FC] border-t border-[#E2CBE2]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">ชื่อ-สกุล ผู้ขอเบิก</label>
                    <input
                      type="text"
                      value={claimantName}
                      onChange={(e) => setClaimantName(e.target.value)}
                      placeholder="เช่น นายอุดมศักดิ์ จันทร์กลิ่น"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5B3D5] font-bold text-[#0F172A] focus:outline-none focus:border-[#6B2169]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">ตำแหน่ง</label>
                    <input
                      type="text"
                      value={claimantPosition}
                      onChange={(e) => setClaimantPosition(e.target.value)}
                      placeholder="ช่างผู้ควบคุมงาน"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5B3D5] font-semibold text-[#1E293B] focus:outline-none focus:border-[#6B2169]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">สังกัด / แผนก</label>
                    <input
                      type="text"
                      value={claimAffiliation}
                      onChange={(e) => setClaimAffiliation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5B3D5] font-semibold text-[#1E293B] focus:outline-none focus:border-[#6B2169]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">งวด / ช่วงวันที่ขอเบิก</label>
                    <input
                      type="text"
                      value={claimPeriod}
                      onChange={(e) => setClaimPeriod(e.target.value)}
                      placeholder="เช่น ประจำเดือน พ.ย. 2569 หรือ 1-15 พ.ย. 69"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#C697C6] font-extrabold text-[#6B2169] focus:outline-none focus:border-[#6B2169]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">ประเภทการเบิกค่าตอบแทน</label>
                  <input
                    type="text"
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5B3D5] font-semibold text-[#1E293B] focus:outline-none focus:border-[#6B2169]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">เลขที่อนุมัติเดินทาง / คำสั่ง (ถ้ามี)</label>
                    <input
                      type="text"
                      value={travelOrderNo}
                      onChange={(e) => setTravelOrderNo(e.target.value)}
                      placeholder="เช่น ก.3 ผกร.(ก3) / -"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5B3D5] font-semibold text-[#1E293B] focus:outline-none focus:border-[#6B2169]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">รถยนต์ที่ใช้ปฏิบัติงาน (ถ้ามี)</label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="เช่น ทะเบียน 4กฒ-xxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5B3D5] font-semibold text-[#1E293B] focus:outline-none focus:border-[#6B2169]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: น้ำเงิน = งานก่อสร้าง (Microsoft 365 Modern Clean Card) */}
          <div className="rounded-2xl border border-[#BFDBFE] bg-[#EAF3FF] overflow-hidden transition-all">
            <div
              onClick={() => toggleSection(2)}
              className="flex items-stretch cursor-pointer select-none hover:bg-[#DCEBFE] transition-colors min-h-[78px]"
            >
              {/* Left Solid Category Block */}
              <div className="w-16 bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center">
                  <Layers size={21} strokeWidth={2.3} />
                </div>
              </div>

              {/* Center Navy Text on Soft Sky Blue */}
              <div className="flex-1 px-4 py-3 flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <h2 className="font-extrabold text-[15px] text-[#0F172A] leading-snug truncate">
                    2. ส่วนที่ 1: เลือกงานจากระบบอัปเดตสถานะงานก่อสร้าง
                  </h2>
                  <p className="text-xs text-[#1E3A8A] mt-0.5 truncate">
                    <span className="font-extrabold text-[#1D4ED8]">เลือกไว้แล้ว {selectedProjects.length} โครงการ</span>{" "}
                    (แตะเพื่อเปิดเลือกงานหรือแก้ไขรายละเอียด)
                  </p>
                </div>

                {/* Right Action Pill + Circular Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#1D4ED8] text-white">
                    เลือกแล้ว {selectedProjects.length} งาน
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#BFDBFE] text-[#1E3A8A] flex items-center justify-center">
                    {expandedSections[2] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>
              </div>
            </div>

            {expandedSections[2] && (
              <div className="p-5 space-y-3.5 bg-[#F4F9FF] border-t border-[#BFDBFE]">
                {/* Filter Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">กรองตามช่างผู้ควบคุมงาน</label>
                    <select
                      value={selectedSupervisor}
                      onChange={(e) => handleSupervisorChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#93C5FD] bg-white font-bold text-[#0F172A] focus:outline-none focus:border-[#1D4ED8]"
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
                    <label className="block font-bold text-[#1E293B] mb-1">ค้นหาหมายเลข WBS / ชื่องาน</label>
                    <div className="relative">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B82F6]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="พิมพ์ WBS หรือชื่องาน..."
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#93C5FD] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#1D4ED8]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[#1E3A8A] font-bold">
                    พบ {filteredProjects.length} โครงการในระบบ
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="px-3 py-1.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold transition-colors border-0 cursor-pointer"
                    >
                      + เลือกทั้งหมดที่กรอง
                    </button>
                    {selectedWbsList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedWbsList([])}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-bold transition-colors border border-rose-200 cursor-pointer"
                      >
                        ล้างที่เลือก
                      </button>
                    )}
                  </div>
                </div>

                {/* Project Picker List */}
                <div className="max-h-[280px] overflow-y-auto border border-[#BFDBFE] rounded-xl divide-y divide-slate-100 bg-white">
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
                            isChecked ? "bg-[#EFF6FF]" : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="pt-0.5 text-[#1D4ED8] shrink-0">
                            {isChecked ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-300" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-mono text-xs font-extrabold text-[#1E3A8A] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                                {proj.wbs}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#166534]">
                                สถานะ: {proj.status || "-"} ({pct}%)
                              </span>
                              <span className="text-[11px] font-bold text-slate-600">
                                ผู้คุมงาน: {proj.supervisor || "-"}
                              </span>
                              {imgs.length > 0 && (
                                <span className="text-[10px] font-bold text-[#6B2169] bg-[#F3E8F3] px-1.5 py-0.5 rounded">
                                  📷 {imgs.length} รูป
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-[#0F172A] text-xs mt-1 truncate" title={proj.name}>
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
                  <div className="pt-2 space-y-2">
                    <p className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                      <Edit3 size={14} className="text-[#1D4ED8]" />
                      ปรับแต่งวันที่ออกไปปฏิบัติงาน / รายละเอียดการปฏิบัติงานรายโครงการ ({selectedProjects.length} งาน):
                    </p>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
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
                            className="p-3 rounded-xl bg-white border border-[#BFDBFE] space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-[#0F172A] truncate">
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-[#1E3A8A] mb-1">
                                  วันที่ออกไปปฏิบัติงาน
                                </label>
                                <input
                                  type="date"
                                  value={ov.workDate}
                                  onChange={(e) => updateOverride(proj.wbs, { workDate: e.target.value })}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#BFDBFE] bg-[#F8FAFC] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#1D4ED8]"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-[#1E3A8A] mb-1">
                                  รายละเอียดผลการปฏิบัติงาน / การอัปเดตสถานะในระบบ
                                </label>
                                <input
                                  type="text"
                                  value={ov.customActivity}
                                  onChange={(e) => updateOverride(proj.wbs, { customActivity: e.target.value })}
                                  placeholder="ระบุผลการออกไปควบคุมงาน..."
                                  className="w-full px-3 py-1.5 rounded-lg border border-[#BFDBFE] bg-[#F8FAFC] text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#1D4ED8]"
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
            )}
          </div>

          {/* Card 3: เขียว = งานอื่น ๆ (Microsoft 365 Modern Clean Card) */}
          <div className="rounded-2xl border border-[#BBF7D0] bg-[#EAFBF0] overflow-hidden transition-all">
            <div
              onClick={() => toggleSection(3)}
              className="flex items-stretch cursor-pointer select-none hover:bg-[#DCFCE7] transition-colors min-h-[78px]"
            >
              {/* Left Solid Category Block */}
              <div className="w-16 bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center">
                  <Briefcase size={20} strokeWidth={2.3} />
                </div>
              </div>

              {/* Center Navy Text on Soft Mint Green */}
              <div className="flex-1 px-4 py-3 flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <h2 className="font-extrabold text-[15px] text-[#0F172A] leading-snug truncate">
                    3. ส่วนที่ 2: งานอื่นๆ (ที่ไม่อยู่ในระบบอัปเดตสถานะงาน)
                  </h2>
                  <p className="text-xs text-[#14532D] mt-0.5 truncate">
                    <span className="font-extrabold text-[#15803D]">มีงานอื่นๆ {otherTasks.length} รายการ</span>{" "}
                    (แตะเพื่อเพิ่มรายการงานอื่นๆ)
                  </p>
                </div>

                {/* Right Action Pill + Circular Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#15803D] text-white">
                    {otherTasks.length} รายการ
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#BBF7D0] text-[#14532D] flex items-center justify-center">
                    {expandedSections[3] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>
              </div>
            </div>

            {expandedSections[3] && (
              <form
                onSubmit={handleAddOtherTask}
                className="p-5 space-y-3.5 text-xs bg-[#F4FDF7] border-t border-[#BBF7D0]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">วันที่ปฏิบัติงาน</label>
                    <input
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#86EFAC] bg-white font-bold text-[#0F172A] focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">ประเภทงานอื่นๆ</label>
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#86EFAC] bg-white font-bold text-[#0F172A] focus:outline-none focus:border-[#16A34A]"
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
                    <label className="block font-bold text-[#1E293B] mb-1">
                      ชื่องาน / ภารกิจที่ออกไปปฏิบัติ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="เช่น สำรวจประมาณการขยายเขตระบบจำหน่าย / ตรวจรับเสาไฟฟ้า"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#86EFAC] bg-white font-semibold text-[#0F172A] focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">เลขบันทึก / อ้างอิง (ถ้ามี)</label>
                    <input
                      type="text"
                      value={newTaskRef}
                      onChange={(e) => setNewTaskRef(e.target.value)}
                      placeholder="เช่น ก.3 กรย. / ใบสั่งงาน"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#86EFAC] bg-white font-semibold text-[#0F172A] focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">สถานที่ปฏิบัติงาน / พื้นที่</label>
                    <input
                      type="text"
                      value={newTaskLocation}
                      onChange={(e) => setNewTaskLocation(e.target.value)}
                      placeholder="เช่น ต.บ้านโพธิ์ อ.เมือง จ.นครปฐม"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#86EFAC] bg-white font-semibold text-[#0F172A] focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">ผลการปฏิบัติงาน</label>
                    <input
                      type="text"
                      value={newTaskDetail}
                      onChange={(e) => setNewTaskDetail(e.target.value)}
                      placeholder="เช่น สำรวจและจัดทำแผนผังแล้วเสร็จ 100%"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#86EFAC] bg-white font-semibold text-[#0F172A] focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                </div>

                {/* Optional Photo Upload for Other Task */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-bold cursor-pointer transition-colors">
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-bold transition-colors border-0 cursor-pointer"
                  >
                    <Plus size={16} /> เพิ่มรายการงานอื่นๆ
                  </button>
                </div>

                {newTaskImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {newTaskImages.map((img, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#86EFAC]">
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
                  <div className="pt-3 border-t border-[#BBF7D0] space-y-2">
                    {otherTasks.map((task, idx) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-white border border-[#BBF7D0] flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#15803D] text-white">
                              งานอื่นๆ #{idx + 1}
                            </span>
                            <span className="text-[11px] font-bold text-[#14532D]">
                              วันที่ {formatThaiDateShort(task.date)}
                            </span>
                            <span className="text-[10px] text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#BBF7D0] font-semibold">
                              {task.category}
                            </span>
                          </div>
                          <p className="font-bold text-[#0F172A] text-xs mt-1">{task.title}</p>
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
            )}
          </div>

          {/* Card 4: ส้ม = คำรับรองและเอกสาร (Microsoft 365 Modern Clean Card) */}
          <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF4E5] overflow-hidden text-xs transition-all">
            <div
              onClick={() => toggleSection(4)}
              className="flex items-stretch cursor-pointer select-none hover:bg-[#FFEDD5] transition-colors min-h-[78px]"
            >
              {/* Left Solid Category Block */}
              <div className="w-16 bg-[#EA580C] text-white flex items-center justify-center shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center">
                  <FileText size={20} strokeWidth={2.3} />
                </div>
              </div>

              {/* Center Navy Text on Soft Apricot Orange */}
              <div className="flex-1 px-4 py-3 flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <h2 className="font-extrabold text-[15px] text-[#0F172A] leading-snug truncate">
                    4. คำรับรอง / หมายเหตุประกอบการเบิกค่าตอบแทน
                  </h2>
                  <p className="text-xs text-[#7C2D12] mt-0.5 truncate">
                    {showPhotosInReport
                      ? `แสดงรูปถ่าย (${totalDisplayedPhotosCount} รูป)`
                      : "ไม่แสดงรูปถ่าย"}{" "}
                    • แตะเพื่อแก้ไขคำรับรอง/ผู้บังคับบัญชา
                  </p>
                </div>

                {/* Right Action Pill + Circular Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-[#0F172A] bg-white px-3 py-1.5 rounded-full border border-[#FDBA74] text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={showPhotosInReport}
                      onChange={(e) => setShowPhotosInReport(e.target.checked)}
                      className="rounded text-[#2563EB]"
                    />
                    แนบรูป ({totalDisplayedPhotosCount})
                  </label>
                  <div className="w-8 h-8 rounded-full bg-[#FED7AA] text-[#9A3412] flex items-center justify-center">
                    {expandedSections[4] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>
              </div>
            </div>

            {expandedSections[4] && (
              <div className="p-5 space-y-3.5 bg-[#FFF9F2] border-t border-[#FED7AA]">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">
                    ข้อความรับรองผลการปฏิบัติงาน / หมายเหตุเพิ่มเติม
                  </label>
                  <textarea
                    rows={2}
                    value={executiveNote}
                    onChange={(e) => setExecutiveNote(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-[#FDBA74] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">
                    ตำแหน่งผู้บังคับบัญชา / ผู้รับรองผลการปฏิบัติงาน
                  </label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#FDBA74] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Official Document Preview (7 cols on XL) */}
        <div className="xl:col-span-7">
          <div className="bg-[#EEF2F6] rounded-3xl p-3 md:p-5 border border-slate-200/90">
            {/* Top Preview Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 px-2">
              <div>
                <span className="text-[13px] font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Eye size={16} className="text-[#6B2169]" />
                  ตัวอย่างเอกสารรายงานผลการปฏิบัติงาน (A4 Preview - พร้อมพิมพ์แนบเบิกค่าตอบแทน)
                </span>
                <span className="text-[11px] font-semibold text-slate-500 block mt-0.5 ml-6">
                  รวมงานในระบบ {selectedProjects.length} งาน • งานอื่นๆ {otherTasks.length} งาน
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold bg-[#6B2169] hover:bg-[#581A56] text-white transition-colors border-0 cursor-pointer"
                >
                  <Printer size={15} /> พิมพ์ สำหรับแนบเบิกค่าตอบแทน
                </button>
                <button
                  type="button"
                  disabled={isExportingPng}
                  onClick={handleDownloadPNG}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-[#16A34A] hover:bg-[#15803D] text-white transition-colors border-0 cursor-pointer disabled:opacity-60"
                >
                  <Download size={14} /> บันทึกรูป (PNG)
                </button>
              </div>
            </div>

            {/* PRINTABLE A4 SHEET - White base, 4-color category accents, print-friendly ink-saving design */}
            <div
              ref={reportRef}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 text-[#0F172A] space-y-3.5 max-w-[920px] mx-auto"
            >
              {/* 1. Official Document Header */}
              <div className="pb-3.5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#6B2169] text-white flex flex-col items-center justify-center font-black shrink-0">
                    <span className="text-base leading-none tracking-tight">PEA</span>
                    <span className="text-[9px] font-bold text-[#F3E8F3] mt-1">ผกร.(ก3)</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#F3E8F3] text-[#6B2169] border border-[#E2CBE2] mb-1">
                      การไฟฟ้าส่วนภูมิภาค เขต 3 (ภาคกลาง) จ.นครปฐม • PEA ผกร.กรย.(ก3)
                    </div>
                    <h2 className="text-base md:text-[19px] font-black text-[#0F172A] leading-snug">
                      แบบรายงานผลการปฏิบัติงานและอัปเดตสถานะงาน (ประกอบการเบิกค่าตอบแทน)
                    </h2>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {claimType} • <span className="text-[#6B2169] font-extrabold">{claimPeriod}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-[#FAF5FA] border border-[#E2CBE2] rounded-2xl px-4 py-2 text-center shrink-0 min-w-[135px]">
                  <p className="text-[10px] font-bold text-[#6B2169]">สรุปภารกิจที่ขอเบิก</p>
                  <p className="text-xl font-black text-[#581A56] leading-tight my-0.5">
                    {selectedProjects.length + otherTasks.length} รายการ
                  </p>
                  <p className="text-[10px] font-medium text-slate-500">
                    งานในระบบ {selectedProjects.length} • งานอื่นๆ {otherTasks.length}
                  </p>
                </div>
              </div>

              {/* 2. Claimant Info Box - 4-column divided cells with icons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#F8FAFC] rounded-xl border border-slate-200/90 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90 text-xs">
                <div className="p-2.5 flex items-start gap-2">
                  <User size={15} className="text-[#6B2169] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-500 block">ผู้ขอเบิก / ช่างผู้ควบคุมงาน</span>
                    <span className="font-extrabold text-[#0F172A] block truncate">{claimantName || "-"}</span>
                  </div>
                </div>
                <div className="p-2.5 flex items-start gap-2">
                  <Calendar size={15} className="text-[#6B2169] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-500 block">ตำแหน่ง / สังกัด</span>
                    <span className="font-bold text-[#0F172A] block truncate">{claimantPosition}</span>
                  </div>
                </div>
                <div className="p-2.5 flex items-start gap-2">
                  <MapPin size={15} className="text-[#6B2169] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-500 block">เลขที่อนุมัติเดินทาง / คำสั่ง</span>
                    <span className="font-bold text-[#0F172A] block truncate">{travelOrderNo || "-"}</span>
                  </div>
                </div>
                <div className="p-2.5 flex items-start gap-2">
                  <FileText size={15} className="text-[#6B2169] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-500 block">รถยนต์ที่ใช้ปฏิบัติงาน</span>
                    <span className="font-bold text-[#0F172A] block truncate">{vehiclePlate || "-"}</span>
                  </div>
                </div>
              </div>

              {/* 3. PART 1: งานจากการอัปเดตสถานะงานในระบบ (Blue Category Header Bar) */}
              <div className="space-y-2">
                <div className="px-3 py-1.5 rounded-xl bg-[#EAF3FF] border border-[#BFDBFE] flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-extrabold text-[#0F172A] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1D4ED8] text-white inline-flex items-center justify-center text-xs font-black shrink-0">
                      1
                    </span>
                    <span>
                      ส่วนที่ 1: รายละเอียดงานก่อสร้างที่อัปเดตสถานะในระบบติดตาม ผกร.กรย.(ก3) ({selectedProjects.length}{" "}
                      โครงการ)
                    </span>
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-[#15803D] bg-white px-2.5 py-0.5 rounded-full border border-[#86EFAC]">
                    <CheckCircle2 size={12} className="text-[#16A34A]" /> อัปเดตสถานะในระบบแล้ว
                  </span>
                </div>

                {selectedProjects.length === 0 ? (
                  <div className="py-3.5 px-4 rounded-xl border border-dashed border-[#93C5FD] bg-[#F8FAFC] text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Info size={15} className="text-[#3B82F6] shrink-0" />
                    <span>ยังไม่ได้เลือกโครงการจากระบบอัปเดตสถานะงาน (กรุณาติ๊กเลือกโครงการจากแถบด้านซ้าย)</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#BFDBFE] rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-[#F0F7FF] text-[#1E3A8A] border-b border-[#BFDBFE]">
                          <th className="py-1.5 px-2.5 font-extrabold w-10 text-center">ลำดับ</th>
                          <th className="py-1.5 px-2.5 font-extrabold w-20">วันที่</th>
                          <th className="py-1.5 px-2.5 font-extrabold">หมายเลข WBS / ชื่องานก่อสร้าง</th>
                          <th className="py-1.5 px-2.5 font-extrabold text-center w-20">สถานะ / %</th>
                          <th className="py-1.5 px-2.5 font-extrabold">ปริมาณงานและรายละเอียดที่อัปเดตในระบบ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
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
                              <td className="py-1.5 px-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-2.5 font-bold text-[#0F172A] whitespace-nowrap">
                                {formatThaiDateShort(ov?.workDate)}
                              </td>
                              <td className="py-1.5 px-2.5">
                                <div className="font-mono font-extrabold text-[#1D4ED8] text-[11px] leading-tight">
                                  {proj.wbs}
                                </div>
                                <div className="font-bold text-[#0F172A] leading-snug">{proj.name}</div>
                                <div className="text-[10px] text-slate-500">
                                  ผู้ควบคุมงาน: {proj.supervisor || claimantName}
                                </div>
                              </td>
                              <td className="py-1.5 px-2.5 text-center">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-extrabold text-[10px]">
                                  {proj.status || "-"}
                                </span>
                                <div className="font-black text-[#15803D] text-xs mt-0.5">{pct}%</div>
                              </td>
                              <td className="py-1.5 px-2.5 space-y-0.5">
                                <p className="font-bold text-[#0F172A] leading-snug">
                                  {ov?.customActivity || getLatestRemarkLines(proj.remarks)}
                                </p>
                                {activeMetrics.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {activeMetrics.map((m) => (
                                      <span
                                        key={m.idx}
                                        className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9.5px] font-semibold border border-slate-200"
                                      >
                                        {m.label}: {m.done}/{m.target} {m.unit}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {checkedItems.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {checkedItems.map((c) => (
                                      <span
                                        key={String(c.key)}
                                        className="px-1.5 py-0.2 rounded bg-[#F0FDF4] text-[#166534] text-[9.5px] font-bold border border-[#BBF7D0]"
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

              {/* 4. PART 2: งานอื่นๆ ที่ไม่อยู่ในการอัปเดตสถานะงาน (Green Category Header Bar) */}
              <div className="space-y-2">
                <div className="px-3 py-1.5 rounded-xl bg-[#EAFBF0] border border-[#BBF7D0] flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-extrabold text-[#0F172A] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#16A34A] text-white inline-flex items-center justify-center text-xs font-black shrink-0">
                      2
                    </span>
                    <span>
                      ส่วนที่ 2: งานปฏิบัติการอื่นๆ นอกเหนือจากงานอัปเดตสถานะ ({otherTasks.length} รายการ)
                    </span>
                  </h3>
                  <span className="text-[10.5px] font-bold text-[#14532D]">
                    งานสำรวจ / ตรวจรับ / แก้ไฟขัดข้อง / งานมอบหมายพิเศษ
                  </span>
                </div>

                {otherTasks.length === 0 ? (
                  <div className="py-2 px-3 rounded-xl bg-[#F4FDF7] border border-[#BBF7D0] text-center text-[11px] font-medium text-slate-500">
                    - ไม่มีรายการงานอื่นๆ เพิ่มเติม -
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#BBF7D0] rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-[#F0FDF4] text-[#14532D] border-b border-[#BBF7D0]">
                          <th className="py-1.5 px-2.5 font-extrabold w-10 text-center">ลำดับ</th>
                          <th className="py-1.5 px-2.5 font-extrabold w-20">วันที่</th>
                          <th className="py-1.5 px-2.5 font-extrabold">ประเภทภารกิจ / ชื่องานอื่นๆ</th>
                          <th className="py-1.5 px-2.5 font-extrabold">สถานที่ / พื้นที่ปฏิบัติงาน</th>
                          <th className="py-1.5 px-2.5 font-extrabold">ผลการปฏิบัติงานเพื่อประกอบการเบิก</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {otherTasks.map((task, idx) => (
                          <tr key={task.id} className="align-top">
                            <td className="py-1.5 px-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="py-1.5 px-2.5 font-bold text-[#0F172A] whitespace-nowrap">
                              {formatThaiDateShort(task.date)}
                            </td>
                            <td className="py-1.5 px-2.5">
                              <span className="inline-block px-1.5 py-0.2 rounded bg-[#DCFCE7] text-[#166534] text-[9.5px] font-extrabold mr-1">
                                {task.category}
                              </span>
                              <span className="font-bold text-[#0F172A]">{task.title}</span>
                              {task.referenceNo && (
                                <span className="text-[10px] text-slate-500 ml-1">(อ้างอิง: {task.referenceNo})</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2.5 font-medium text-slate-700">{task.location || "-"}</td>
                            <td className="py-1.5 px-2.5 font-bold text-[#0F172A]">{task.resultDetail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 5. PART 3: ประมวลภาพถ่ายการปฏิบัติงานหน้างาน (แยกแต่ละงาน งานละไม่เกิน 3 รูป ล่าสุด และจัดขนาดให้พอดี 12 รูปในหน้าแรก) */}
              {showPhotosInReport && groupedReportPhotos.length > 0 && (
                <div className="space-y-2 pt-0.5">
                  <div className="px-3 py-1.5 rounded-xl bg-[#F8F1F8] border border-[#E2CBE2] flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-[#0F172A] flex items-center gap-2">
                      <ImageIcon size={15} className="text-[#6B2169]" />
                      ภาพถ่ายหลักฐานการออกไปปฏิบัติงานหน้างาน แยกตามรายโครงการ (แสดงภาพล่าสุดงานละไม่เกิน 3 รูป • รวม{" "}
                      {totalDisplayedPhotosCount} รูป)
                    </h3>
                  </div>

                  <div
                    className={`grid gap-2.5 ${
                      groupedReportPhotos.length >= 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    {groupedReportPhotos.map((group) => (
                      <div
                        key={group.groupKey}
                        className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-2 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1.5 border-b border-slate-200 pb-1">
                          <div className="min-w-0 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#6B2169] text-white font-mono text-[9.5px] font-extrabold shrink-0">
                              {group.badge}
                            </span>
                            <span className="font-extrabold text-[#0F172A] text-[10.5px] truncate" title={group.title}>
                              {group.title}
                            </span>
                          </div>
                          <span className="text-[9.5px] font-bold text-[#6B2169] bg-[#F3E8F3] px-1.5 py-0.5 rounded shrink-0">
                            ล่าสุด {group.photos.length} รูป
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {group.photos.map((photo, pIdx) => (
                            <div
                              key={pIdx}
                              className="rounded-lg border border-slate-200 overflow-hidden bg-white flex flex-col"
                            >
                              <div
                                className={`${
                                  groupedReportPhotos.length >= 3 ? "h-20" : "h-24"
                                } w-full bg-slate-100 overflow-hidden relative`}
                              >
                                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                <span className="absolute top-1 left-1 bg-black/65 text-white text-[8.5px] font-bold px-1.5 py-0.2 rounded">
                                  รูปที่ {pIdx + 1}
                                </span>
                              </div>
                              {photo.caption && (
                                <div className="px-1.5 py-1 text-[9px] text-slate-600 truncate leading-tight">
                                  {photo.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Clarification / Certification Box (Soft Apricot Orange Style) */}
              {executiveNote && (
                <div className="p-3 rounded-xl bg-[#FFF4E5] border border-[#FED7AA] flex items-start gap-3 text-[11px] leading-snug">
                  <div className="w-8 h-8 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                    <Megaphone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-[#9A3412]">คำรับรองและหมายเหตุประกอบการขอเบิกค่าตอบแทน</p>
                    <p className="text-[#0F172A] font-medium mt-0.5">({executiveNote})</p>
                  </div>
                </div>
              )}

              {/* 7. Official Signature Blocks - 2 Separate Framed Cards (Claimant vs Approver) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[11px]">
                {/* Left Box: Claimant (PEA Purple Tint Header) */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#F8F1F8] border-b border-[#E2CBE2] flex items-center justify-center gap-1.5 font-extrabold text-[#4A154B]">
                    <PenTool size={13} className="text-[#6B2169]" />
                    <span>ขอรับรองว่าได้ออกไปปฏิบัติงานและอัปเดตสถานะงานจริง</span>
                  </div>
                  <div className="p-3.5 text-center space-y-1.5">
                    <div className="pt-3 text-slate-500 font-medium">
                      ลงชื่อ ............................................................ ผู้ขอเบิก
                    </div>
                    <p className="font-extrabold text-[#0F172A] text-xs">
                      ( {claimantName || "................................................"} )
                    </p>
                    <p className="text-slate-600 font-medium">{claimantPosition}</p>
                    <p className="text-[10.5px] text-slate-500">วันที่ ......... / ............... / ............</p>
                  </div>
                </div>

                {/* Right Box: Approver (Blue Tint Header) */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#EAF3FF] border-b border-[#BFDBFE] flex items-center justify-center gap-1.5 font-extrabold text-[#1E3A8A]">
                    <ClipboardCheck size={14} className="text-[#1D4ED8]" />
                    <span>ได้ตรวจสอบผลการปฏิบัติงานในระบบแล้ว เห็นควรอนุมัติเบิกจ่าย</span>
                  </div>
                  <div className="p-3.5 text-center space-y-1.5">
                    <div className="pt-3 text-slate-500 font-medium">
                      ลงชื่อ ................................................... ผู้รับรอง/ผู้บังคับบัญชา
                    </div>
                    <p className="font-extrabold text-[#0F172A] text-xs">
                      ( ............................................................ )
                    </p>
                    <p className="text-slate-600 font-medium">{approverName}</p>
                    <p className="text-[10.5px] text-slate-500">วันที่ ......... / ............... / ............</p>
                  </div>
                </div>
              </div>

              {/* 8. Document Footer */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <FileText size={12} className="text-[#6B2169]" />
                  เอกสารอ้างอิงจากระบบติดตามงานก่อสร้าง PEA ผกร.กรย.(ก3)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-400" />
                  พิมพ์เมื่อ : {new Date().toLocaleDateString("th-TH")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

