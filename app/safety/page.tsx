"use client";

import React, { useState, useEffect, useMemo } from "react";
import TopBar from "../components/TopBar";
import { supabase } from "../../lib/supabaseClient";
import { compressMultipleImages } from "../utils/imageCompressor";
import {
  ShieldCheck,
  Search,
  Users,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  X,
  Trash2,
  Calendar,
  BarChart3,
  LayoutGrid,
  Table as TableIcon,
  Image as ImageIcon,
  FileText,
  Sparkles,
  UserCheck,
  Eye,
} from "lucide-react";

interface TrainingPlanItem {
  id: number;
  topic: string;
  instructor: string;
  months: number[];
}

interface TrainingCellRecord {
  completed: boolean;
  images: string[];
  note?: string;
  updatedAt?: string;
  legacyNoPhoto?: boolean;
}

const TRAINING_PLANS: TrainingPlanItem[] = [
  { id: 1, topic: "การฝึกซ้อมการติดตั้งเครื่องมือต่อลงดิน", instructor: "นายวีรพัฒน์ นาคลมัย", months: [3, 5, 7, 9, 11] },
  { id: 2, topic: "การฝึกประกอบและติดตั้งอุปกรณ์หัวเสาแรงสูง", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [3, 5, 7, 9, 11] },
  { id: 3, topic: "การฝึกการจัดการทางจราจร การวางกรวยยาง", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [4, 6, 8, 10, 12] },
  { id: 4, topic: "การฝึกใช้สลิงจับเสา, การจับเสา, การบังคับเสา", instructor: "นายวีรพัฒน์ นาคลมัย", months: [5, 7, 9, 11] },
  { id: 5, topic: "การฝึกทดสอบแรงดันไฟฟ้า, การฝึกตรวจสอบเสาและอุปกรณ์หัวเสา...", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [6, 8, 10, 12] },
  { id: 6, topic: "ฝึกการพาดสายเปลือย, สาย SAC", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [7, 9, 11] },
  { id: 7, topic: "การฝึกอ่านแบบ, วัดระยะการก่อสร้าง, การฝึกใช้กล้องวัดระดับ", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [8, 10, 12] },
  { id: 8, topic: "การฝึกตีปรีฟอร์มสายส่ง 115 เควี", instructor: "นายวีรพัฒน์ นาคลมัย", months: [9, 11] },
  { id: 9, topic: "การฝึกปักเสาและการเล็งแนว เสา คอร. ขนาด 22 เมตร", instructor: "นายวีรพัฒน์ นาคลมัย", months: [10, 12] },
  { id: 10, topic: "การฝึกต่อสายด้วยหลอดต่อสาย (รับแรง, และไม่รับแรงดึง)", instructor: "นายวีรพัฒน์ นาคลมัย", months: [11] },
  { id: 11, topic: "การฝึกขุดหลุมปักเสา การใช้รถสว่าน", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [12] },
  { id: 12, topic: "การฝึกปีนเสาแรงสูงและทักษะการปฏิบัติงานบนเสาไฟฟ้า", instructor: "นายวีรพัฒน์ นาคลมัย", months: [3] },
  { id: 13, topic: "การฝึกตรวจเช็คสายกันตก", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [3] },
  { id: 14, topic: "การฝึกตรวจถุงมือแรงสูง", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [4] },
  { id: 15, topic: "การฝึกผูกขาปีนเสา", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [4] },
  { id: 16, topic: "การฝึกตรวจเช็คไม้ชักฟิวส์", instructor: "นายศุภวิชญ์ เกาะลอย", months: [5] },
  { id: 17, topic: "การฝึกให้สัญญาณมือ", instructor: "นายวีรพัฒน์ นาคลมัย", months: [5] },
  { id: 18, topic: "การฝึกตรวจสภาพรถเครน", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [6] },
  { id: 19, topic: "การฝึกตรวจเช็คสลิงยกเสา", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [6] },
  { id: 20, topic: "การฝึกวิเคราะห์จุดอันตราย", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [7] },
  { id: 21, topic: "การฝึกซ้อมการติดต่อสื่อสารและการฝึกประสานงานที่ดี (การ SWITCHING ดับไฟ)", instructor: "นายศุภวิชญ์ เกาะลอย", months: [7] },
  { id: 22, topic: "การฝึกใช้ Voltage Dectector", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [8] },
  { id: 23, topic: "การฝึก Short ground", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [8] },
  { id: 24, topic: "การฝึกปอกสายแรงสูง และพันสายแรงสูง", instructor: "นายศุภวิชญ์ เกาะลอย", months: [9] },
  { id: 25, topic: "การฝึกปฐมพยาบาลเบื้องต้น", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [9] },
  { id: 26, topic: "การฝึกผูกกระเช้าติดปลายเครน", instructor: "นายศุภวิชญ์ เกาะลอย", months: [10] },
  { id: 27, topic: "การฝึกเปลี่ยน / ผูกลูกถ้วยแรงสูง, ลูกถ้วยแขวน", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [10] },
  { id: 28, topic: "การฝึกคล้องสายกันตก", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [11] },
  { id: 29, topic: "การฝึกตรวจสอบประเมินเสาไฟฟ้าก่อนปฏิบัติงาน", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [11] },
  { id: 30, topic: "ฝึกปฏิบัติงานบนเสาแรงต่ำที่มีอายุมากกว่า 30 ปี และเสาที่อยู่ในสภาพผิดปกติ...", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [12] },
];

const MONTH_NAMES = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const MONTH_FULL_NAMES = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const LOCAL_BACKUP_KEY = "pea_safety_training_plan_2026_v2";

function normalizeProgressData(raw: Record<string, unknown>): Record<string, TrainingCellRecord> {
  const normalized: Record<string, TrainingCellRecord> = {};
  if (!raw || typeof raw !== "object") return normalized;

  Object.entries(raw).forEach(([key, val]) => {
    if (typeof val === "boolean") {
      // Legacy boolean record -> strictly require photo upload to show completed status!
      // We keep legacyNoPhoto flag just in case, but completed is strictly driven by images.length > 0
      normalized[key] = {
        completed: false,
        images: [],
        legacyNoPhoto: val,
      };
    } else if (typeof val === "string" && val.trim() !== "") {
      normalized[key] = {
        completed: true,
        images: [val.trim()],
      };
    } else if (val && typeof val === "object") {
      const obj = val as Partial<TrainingCellRecord>;
      const imgs = Array.isArray(obj.images)
        ? obj.images.filter((u): u is string => typeof u === "string" && u.trim() !== "")
        : [];
      normalized[key] = {
        completed: imgs.length > 0,
        images: imgs,
        note: typeof obj.note === "string" ? obj.note : "",
        updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : undefined,
      };
    }
  });

  return normalized;
}

export default function SafetyPlan() {
  const [search, setSearch] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"ALL" | "COMPLETED" | "PENDING">("ALL");
  const [activeViewMode, setActiveViewMode] = useState<"matrix" | "overview">("matrix");
  const [records, setRecords] = useState<Record<string, TrainingCellRecord>>({});
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Active Photo Upload Modal State
  const [activeModalCell, setActiveModalCell] = useState<{
    plan: TrainingPlanItem;
    monthIndex: number; // 1..12
  } | null>(null);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalNote, setModalNote] = useState<string>("");
  const [modalUpdatedAt, setModalUpdatedAt] = useState<string>("");
  const [isUploadingPhotos, setIsUploadingPhotos] = useState<boolean>(false);
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("wbs", "SAFETY_PLAN_2026")
        .single();

      if (data) {
        setProjectId(data.id);
        if (data.remarks) {
          try {
            const parsed = JSON.parse(data.remarks);
            const norm = normalizeProgressData(parsed);
            setRecords(norm);
            localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(norm));
            setIsLoading(false);
            return;
          } catch (e) {
            console.warn("Failed to parse SAFETY_PLAN_2026 remarks", e);
          }
        }
      }

      // Fallback to localStorage if exists
      const localRaw = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (localRaw) {
        const parsed = JSON.parse(localRaw);
        setRecords(normalizeProgressData(parsed));
      }
    } catch (err) {
      console.warn("Fetch safety plan fallback to local:", err);
      const localRaw = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (localRaw) {
        try {
          setRecords(normalizeProgressData(JSON.parse(localRaw)));
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const persistRecords = async (nextRecords: Record<string, TrainingCellRecord>) => {
    setRecords(nextRecords);
    try {
      localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(nextRecords));
    } catch (e) {
      console.warn("Local backup storage warning:", e);
    }

    setIsSaving(true);
    try {
      const payload = {
        wbs: "SAFETY_PLAN_2026",
        name: "Safety Training Progress",
        remarks: JSON.stringify(nextRecords),
      };

      if (projectId) {
        await supabase.from("projects").update(payload).eq("id", projectId);
      } else {
        const { data } = await supabase.from("projects").insert(payload).select().single();
        if (data) setProjectId(data.id);
      }
    } catch (err) {
      console.error("Failed to save SAFETY_PLAN_2026 to Supabase:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // List of unique instructors
  const instructors = useMemo(() => {
    return Array.from(new Set(TRAINING_PLANS.map((p) => p.instructor)));
  }, []);

  // Helper to check if a cell (topicId + month 1..12) has uploaded photos -> completed
  const getCellRecord = (topicId: number, month: number): TrainingCellRecord => {
    const key = `${topicId}_${month}`;
    const rec = records[key];
    if (!rec) return { completed: false, images: [] };
    return {
      ...rec,
      completed: Array.isArray(rec.images) && rec.images.length > 0,
    };
  };

  // Compute statistics per instructor & overall
  const stats = useMemo(() => {
    let totalSessions = 0;
    let completedSessions = 0;
    let totalPhotos = 0;

    const byInstructor: Record<
      string,
      {
        instructor: string;
        topicsCount: number;
        totalSessions: number;
        completedSessions: number;
        pendingSessions: number;
        photosCount: number;
        percent: number;
      }
    > = {};

    instructors.forEach((inst) => {
      byInstructor[inst] = {
        instructor: inst,
        topicsCount: 0,
        totalSessions: 0,
        completedSessions: 0,
        pendingSessions: 0,
        photosCount: 0,
        percent: 0,
      };
    });

    const byMonth: { monthIndex: number; monthName: string; planned: number; completed: number }[] = MONTH_NAMES.map(
      (name, idx) => ({
        monthIndex: idx + 1,
        monthName: name,
        planned: 0,
        completed: 0,
      })
    );

    TRAINING_PLANS.forEach((plan) => {
      const instStat = byInstructor[plan.instructor];
      if (instStat) instStat.topicsCount += 1;

      plan.months.forEach((m) => {
        totalSessions += 1;
        if (instStat) instStat.totalSessions += 1;
        if (byMonth[m - 1]) byMonth[m - 1].planned += 1;

        const rec = records[`${plan.id}_${m}`];
        const hasPhoto = rec && Array.isArray(rec.images) && rec.images.length > 0;
        if (hasPhoto) {
          completedSessions += 1;
          totalPhotos += rec.images.length;
          if (instStat) {
            instStat.completedSessions += 1;
            instStat.photosCount += rec.images.length;
          }
          if (byMonth[m - 1]) byMonth[m - 1].completed += 1;
        }
      });
    });

    Object.values(byInstructor).forEach((st) => {
      st.pendingSessions = Math.max(0, st.totalSessions - st.completedSessions);
      st.percent = st.totalSessions > 0 ? Math.round((st.completedSessions / st.totalSessions) * 100) : 0;
    });

    const pendingSessions = Math.max(0, totalSessions - completedSessions);
    const overallPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    return {
      totalTopics: TRAINING_PLANS.length,
      totalSessions,
      completedSessions,
      pendingSessions,
      totalPhotos,
      overallPercent,
      byInstructor: Object.values(byInstructor),
      byMonth,
    };
  }, [records, instructors]);

  // Filtered plans for table
  const filteredPlans = useMemo(() => {
    return TRAINING_PLANS.filter((plan) => {
      if (selectedInstructor !== "ALL" && plan.instructor !== selectedInstructor) {
        return false;
      }
      if (search.trim() !== "") {
        const q = search.trim().toLowerCase();
        if (!plan.topic.toLowerCase().includes(q) && !plan.instructor.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedStatusFilter !== "ALL") {
        const completedCount = plan.months.filter((m) => {
          const rec = records[`${plan.id}_${m}`];
          return rec && Array.isArray(rec.images) && rec.images.length > 0;
        }).length;
        const isAllCompleted = completedCount === plan.months.length;
        if (selectedStatusFilter === "COMPLETED" && !isAllCompleted) return false;
        if (selectedStatusFilter === "PENDING" && isAllCompleted) return false;
      }
      return true;
    });
  }, [selectedInstructor, search, selectedStatusFilter, records]);

  // Open Modal for a Scheduled Cell
  const openCellModal = (plan: TrainingPlanItem, monthIndex: number) => {
    const rec = getCellRecord(plan.id, monthIndex);
    setActiveModalCell({ plan, monthIndex });
    setModalImages(rec.images || []);
    setModalNote(rec.note || "");
    setModalUpdatedAt(rec.updatedAt || new Date().toISOString().split("T")[0]);
  };

  const closeCellModal = () => {
    setActiveModalCell(null);
    setModalImages([]);
    setModalNote("");
  };

  // Handle Photo Upload in Modal (Uploads to Supabase Storage 'project_images' or falls back to compressed DataURL)
  const handleUploadCellPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !activeModalCell) return;
    e.target.value = "";

    const remaining = Math.max(0, 6 - modalImages.length);
    if (remaining <= 0) {
      alert("สามารถอัปโหลดรูปหลักฐานการฝึกซ้อมได้สูงสุด 6 รูปต่อครั้งครับ");
      return;
    }

    setIsUploadingPhotos(true);
    try {
      const filesToProcess = files.slice(0, remaining);
      const compressedList = await compressMultipleImages(filesToProcess, undefined, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.76,
      });

      const uploadedUrls: string[] = [];

      for (let i = 0; i < compressedList.length; i++) {
        const item = compressedList[i];
        const fileName = `SAFETY_PLAN_2026_${activeModalCell.plan.id}_M${activeModalCell.monthIndex}_${Date.now()}_${i + 1}.jpg`;

        let finalUrl = "";
        try {
          const { error: uploadErr } = await supabase.storage
            .from("project_images")
            .upload(fileName, item.file, { cacheControl: "3600", upsert: false });

          if (!uploadErr) {
            const { data: pubData } = supabase.storage.from("project_images").getPublicUrl(fileName);
            if (pubData?.publicUrl) {
              finalUrl = pubData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn("Supabase storage fallback to base64:", storageErr);
        }

        // Fallback to compressed base64 data URL if storage bucket fails
        if (!finalUrl) {
          finalUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () =>
              resolve(typeof reader.result === "string" ? reader.result : item.previewUrl);
            reader.readAsDataURL(item.file);
          });
        }

        uploadedUrls.push(finalUrl);
      }

      const nextImages = [...modalImages, ...uploadedUrls];
      setModalImages(nextImages);

      // Immediately save so status turns "ถูกต้อง / ดำเนินการแล้ว" right away upon photo upload!
      const key = `${activeModalCell.plan.id}_${activeModalCell.monthIndex}`;
      const todayIso = modalUpdatedAt || new Date().toISOString().split("T")[0];
      const nextRecords: Record<string, TrainingCellRecord> = {
        ...records,
        [key]: {
          completed: nextImages.length > 0,
          images: nextImages,
          note: modalNote.trim(),
          updatedAt: todayIso,
        },
      };
      await persistRecords(nextRecords);
      showToast(
        `อัปโหลดรูปภาพสำเร็จ (${nextImages.length} รูป) • บันทึกสถานะ "ดำเนินการถูกต้อง" เรียบร้อยแล้ว`
      );
    } catch (err) {
      console.error("Upload training photo error:", err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  // Remove single photo inside modal
  const handleRemoveModalPhoto = async (indexToRemove: number) => {
    if (!activeModalCell) return;
    const nextImages = modalImages.filter((_, idx) => idx !== indexToRemove);
    setModalImages(nextImages);

    const key = `${activeModalCell.plan.id}_${activeModalCell.monthIndex}`;
    const nextRecords: Record<string, TrainingCellRecord> = {
      ...records,
      [key]: {
        completed: nextImages.length > 0,
        images: nextImages,
        note: modalNote.trim(),
        updatedAt: modalUpdatedAt || new Date().toISOString().split("T")[0],
      },
    };
    await persistRecords(nextRecords);
    if (nextImages.length === 0) {
      showToast("ลบรูปภาพทั้งหมดแล้ว • สถานะกลับเป็นรอดำเนินการ (ต้องมีรูปภาพจึงจะแสดงสถานะถูกต้อง)");
    }
  };

  // Save Note / Date changes in modal
  const handleSaveModalDetails = async () => {
    if (!activeModalCell) return;
    const key = `${activeModalCell.plan.id}_${activeModalCell.monthIndex}`;
    const nextRecords: Record<string, TrainingCellRecord> = {
      ...records,
      [key]: {
        completed: modalImages.length > 0,
        images: modalImages,
        note: modalNote.trim(),
        updatedAt: modalUpdatedAt || new Date().toISOString().split("T")[0],
      },
    };
    await persistRecords(nextRecords);
    showToast(
      modalImages.length > 0
        ? "บันทึกข้อมูลและรูปภาพหลักฐานการฝึกซ้อมเรียบร้อยแล้ว"
        : "บันทึกหมายเหตุแล้ว (กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป เพื่อเปลี่ยนสถานะเป็นถูกต้อง)"
    );
    closeCellModal();
  };

  // Current selected instructor stats (when filtered by specific supervisor)
  const activeInstructorStat = useMemo(() => {
    if (selectedInstructor === "ALL") return null;
    return stats.byInstructor.find((s) => s.instructor === selectedInstructor) || null;
  }, [selectedInstructor, stats]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans text-[#0F172A]">
      <TopBar title="แผนฝึกซ้อม/ทบทวนความตระหนักด้านความปลอดภัย ประจำปี 2569" />

      {/* Top Page Header - Microsoft 365 Modern Clean UI with Official PEA Purple */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#6B2169] text-white flex items-center justify-center shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-extrabold text-[#0F172A] tracking-tight">
                แผนฝึกซ้อมขั้นตอนการปฏิบัติงานและความตระหนักด้านความปลอดภัย ปี 2569
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3E8F3] text-[#6B2169] border border-[#E2CBE2]">
                PEA ผกร.กรย.(ก3)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>ดูภาพรวมทั้งแผนก หรือแยกตามช่างผู้ควบคุมงาน (ผู้ฝึกสอน)</span>
              <span>•</span>
              <span className="font-bold text-[#15803D] inline-flex items-center gap-1">
                <Camera size={13} /> ต้องอัปโหลดรูปภาพหลักฐานการฝึกซ้อม ระบบจึงจะแสดงสถานะถูกต้อง (✓)
              </span>
            </p>
          </div>
        </div>

        {/* View Switcher: ตารางแผนรายเดือน vs ภาพรวม & แยกตามผู้ควบคุมงาน */}
        <div className="flex items-center gap-2 bg-[#EEF2F6] p-1.5 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveViewMode("matrix")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all border-0 cursor-pointer ${
              activeViewMode === "matrix"
                ? "bg-[#6B2169] text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-[#0F172A]"
            }`}
          >
            <TableIcon size={15} /> ตารางแผนฝึกซ้อม & อัปโหลดรูป
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode("overview")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all border-0 cursor-pointer ${
              activeViewMode === "overview"
                ? "bg-[#6B2169] text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-[#0F172A]"
            }`}
          >
            <LayoutGrid size={15} /> ภาพรวม & สรุปรายช่างผู้ควบคุมงาน
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1650px] mx-auto w-full space-y-5">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="px-4 py-3 rounded-2xl bg-[#15803D] text-white text-xs font-bold flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              {toastMsg}
            </span>
            <button
              type="button"
              onClick={() => setToastMsg(null)}
              className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* 1. Executive KPI Summary Cards (4 Color Categories: Purple, Blue, Green, Orange) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: ม่วง กฟภ. = หัวข้อและช่างผู้ควบคุมงาน */}
          <div className="rounded-2xl border border-[#E2CBE2] bg-[#F8F1F8] overflow-hidden flex items-stretch">
            <div className="w-16 bg-[#6B2169] text-white flex items-center justify-center shrink-0">
              <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>
            <div className="p-3.5 flex-1 min-w-0">
              <span className="text-[11px] font-bold text-[#6B2169] block">หัวข้อการฝึกซ้อม / ผู้ฝึกสอน</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#0F172A]">{stats.totalTopics}</span>
                <span className="text-xs font-bold text-slate-600">หัวข้อ ({instructors.length} ช่างผู้ควบคุมงาน)</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                แผนฝึกซ้อมรวมทั้งปี {stats.totalSessions} ครั้ง
              </p>
            </div>
          </div>

          {/* Card 2: เขียว = ดำเนินการถูกต้อง (มีรูปภาพหลักฐานแล้ว) */}
          <div className="rounded-2xl border border-[#BBF7D0] bg-[#EAFBF0] overflow-hidden flex items-stretch">
            <div className="w-16 bg-[#16A34A] text-white flex items-center justify-center shrink-0">
              <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center">
                <CheckCircle2 size={21} />
              </div>
            </div>
            <div className="p-3.5 flex-1 min-w-0">
              <span className="text-[11px] font-bold text-[#15803D] block">ดำเนินการถูกต้อง (แนบรูปแล้ว)</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#14532D]">{stats.completedSessions}</span>
                <span className="text-xs font-bold text-[#15803D]">
                  / {stats.totalSessions} ครั้ง ({stats.overallPercent}%)
                </span>
              </div>
              <p className="text-[11px] text-[#166534] mt-0.5 truncate">
                มีรูปภาพหลักฐานยืนยันครบถ้วน ({stats.totalPhotos} รูป)
              </p>
            </div>
          </div>

          {/* Card 3: ส้ม = รออัปโหลดรูปภาพหลักฐาน */}
          <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF4E5] overflow-hidden flex items-stretch">
            <div className="w-16 bg-[#EA580C] text-white flex items-center justify-center shrink-0">
              <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center">
                <Camera size={20} />
              </div>
            </div>
            <div className="p-3.5 flex-1 min-w-0">
              <span className="text-[11px] font-bold text-[#9A3412] block">รออัปโหลดรูปภาพฝึกซ้อม</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#7C2D12]">{stats.pendingSessions}</span>
                <span className="text-xs font-bold text-[#9A3412]">ครั้งที่ยังไม่มีรูป</span>
              </div>
              <p className="text-[11px] text-[#9A3412] mt-0.5 truncate">
                คลิกที่ช่องเดือนเพื่ออัปโหลดรูปภาพเปลี่ยนสถานะ
              </p>
            </div>
          </div>

          {/* Card 4: น้ำเงิน = ความก้าวหน้าภาพรวมทั้งแผนก */}
          <div className="rounded-2xl border border-[#BFDBFE] bg-[#EAF3FF] overflow-hidden flex items-stretch">
            <div className="w-16 bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
              <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
            </div>
            <div className="p-3.5 flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#1E3A8A]">ความก้าวหน้าภาพรวม ปี 2569</span>
                <span className="text-sm font-black text-[#1D4ED8]">{stats.overallPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#BFDBFE] my-1.5">
                <div
                  className="h-full bg-[#1D4ED8] transition-all duration-300"
                  style={{ width: `${stats.overallPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-[#1E3A8A] truncate">
                {isSaving ? "กำลังบันทึกข้อมูล..." : "อัปเดตสถานะอัตโนมัติจากรูปภาพที่แนบ"}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Supervisor Pill Selector Bar (ดูภาพรวมทุกคน หรือ เลือกดูแยกตามช่างผู้ควบคุมงาน) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserCheck size={17} className="text-[#6B2169]" />
              <h2 className="text-sm font-extrabold text-[#0F172A]">
                เลือกมุมมอง: ดูภาพรวมทั้งหมด หรือ แยกตามช่างผู้ควบคุมงาน (ผู้ฝึกสอน)
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              คลิกชื่อช่างผู้ควบคุมงานเพื่อกรองเฉพาะหัวข้อที่รับผิดชอบ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
            {/* Overall Pill Card */}
            <button
              type="button"
              onClick={() => setSelectedInstructor("ALL")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedInstructor === "ALL"
                  ? "bg-[#F8F1F8] border-[#6B2169] ring-2 ring-[#6B2169]/20"
                  : "bg-[#F8FAFC] border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#6B2169] text-white">
                  ภาพรวมทั้งหมด
                </span>
                <span className="text-xs font-black text-[#6B2169]">{stats.overallPercent}%</span>
              </div>
              <div className="mt-2">
                <p className="font-extrabold text-xs text-[#0F172A] truncate">ทุกช่างผู้ควบคุมงาน (กรย.ก3)</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {stats.totalTopics} หัวข้อ • ถูกต้อง {stats.completedSessions}/{stats.totalSessions} ครั้ง
                </p>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-[#6B2169] transition-all"
                  style={{ width: `${stats.overallPercent}%` }}
                />
              </div>
            </button>

            {/* Individual Supervisor Cards */}
            {stats.byInstructor.map((sup) => {
              const isSelected = selectedInstructor === sup.instructor;
              return (
                <button
                  type="button"
                  key={sup.instructor}
                  onClick={() => setSelectedInstructor(sup.instructor)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#F8F1F8] border-[#6B2169] ring-2 ring-[#6B2169]/20"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? "bg-[#6B2169] text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {sup.topicsCount} หัวข้อ
                    </span>
                    <span
                      className={`text-xs font-black ${
                        sup.percent === 100
                          ? "text-[#15803D]"
                          : sup.percent > 0
                          ? "text-[#1D4ED8]"
                          : "text-slate-500"
                      }`}
                    >
                      {sup.percent}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="font-extrabold text-xs text-[#0F172A] truncate" title={sup.instructor}>
                      {sup.instructor}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 flex items-center justify-between">
                      <span>
                        ถูกต้อง <strong className="text-[#15803D]">{sup.completedSessions}</strong>/{sup.totalSessions} ครั้ง
                      </span>
                      {sup.photosCount > 0 && (
                        <span className="text-[10px] font-bold text-[#6B2169] bg-[#F3E8F3] px-1.5 py-0.2 rounded">
                          📷 {sup.photosCount}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all ${
                        sup.percent === 100 ? "bg-[#16A34A]" : "bg-[#1D4ED8]"
                      }`}
                      style={{ width: `${sup.percent}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. OVERVIEW DASHBOARD VIEW (เมื่อเลือกแท็บ "ภาพรวม & สรุปรายช่างผู้ควบคุมงาน") */}
        {activeViewMode === "overview" && (
          <div className="space-y-5">
            {/* Monthly Progress Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                    <Calendar size={17} className="text-[#1D4ED8]" />
                    สรุปผลการฝึกซ้อมและอัปโหลดรูปภาพรายเดือน (ม.ค. – ธ.ค. 2569)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    เปรียบเทียบจำนวนครั้งที่กำหนดในแผน กับจำนวนครั้งที่มีการอัปโหลดรูปภาพยืนยันสถานะถูกต้องแล้ว
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2.5">
                {stats.byMonth.map((m) => {
                  const pct = m.planned > 0 ? Math.round((m.completed / m.planned) * 100) : 0;
                  const isDoneAll = m.planned > 0 && m.completed === m.planned;
                  return (
                    <div
                      key={m.monthIndex}
                      className={`p-3 rounded-xl border text-center space-y-1.5 ${
                        m.planned === 0
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : isDoneAll
                          ? "bg-[#EAFBF0] border-[#86EFAC]"
                          : m.completed > 0
                          ? "bg-[#EAF3FF] border-[#93C5FD]"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <span className="text-xs font-extrabold text-[#0F172A] block">{m.monthName}</span>
                      {m.planned === 0 ? (
                        <span className="text-[11px] text-slate-400 block py-2">ไม่มีแผน</span>
                      ) : (
                        <>
                          <div className="text-base font-black text-[#0F172A]">
                            <span className={isDoneAll ? "text-[#15803D]" : "text-[#1D4ED8]"}>{m.completed}</span>
                            <span className="text-slate-400 text-xs font-bold">/{m.planned}</span>
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isDoneAll
                                ? "bg-[#16A34A] text-white"
                                : m.completed > 0
                                ? "bg-[#1D4ED8] text-white"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {pct}%
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Cards by Supervisor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {stats.byInstructor
                .filter((s) => selectedInstructor === "ALL" || s.instructor === selectedInstructor)
                .map((sup) => {
                  const supPlans = TRAINING_PLANS.filter((p) => p.instructor === sup.instructor);
                  return (
                    <div
                      key={sup.instructor}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col"
                    >
                      <div className="px-5 py-3.5 bg-[#F8F1F8] border-b border-[#E2CBE2] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#6B2169] text-white flex items-center justify-center font-black text-sm">
                            {sup.instructor.replace("นาย", "").slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="text-sm font-extrabold text-[#0F172A]">{sup.instructor}</h3>
                            <p className="text-xs text-slate-600">
                              รับผิดชอบ {sup.topicsCount} หัวข้อ • แผนรวม {sup.totalSessions} ครั้ง
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#EAFBF0] text-[#15803D] border border-[#86EFAC]">
                            ✓ ถูกต้อง {sup.completedSessions}/{sup.totalSessions} ครั้ง ({sup.percent}%)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInstructor(sup.instructor);
                              setActiveViewMode("matrix");
                            }}
                            className="px-3 py-1 rounded-xl bg-[#6B2169] hover:bg-[#581A56] text-white text-xs font-bold border-0 cursor-pointer transition-colors"
                          >
                            จัดการรูปภาพ
                          </button>
                        </div>
                      </div>

                      <div className="p-4 divide-y divide-slate-100 space-y-2.5 flex-1">
                        {supPlans.map((plan) => (
                          <div key={plan.id} className="pt-2.5 first:pt-0 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-xs font-bold text-[#0F172A]">
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-extrabold mr-1.5">
                                  #{plan.id}
                                </span>
                                {plan.topic}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {plan.months.map((m) => {
                                const rec = getCellRecord(plan.id, m);
                                return (
                                  <button
                                    type="button"
                                    key={m}
                                    onClick={() => openCellModal(plan, m)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${
                                      rec.completed
                                        ? "bg-[#EAFBF0] text-[#15803D] border-[#86EFAC] hover:bg-[#DCFCE7]"
                                        : "bg-[#FFF4E5] text-[#9A3412] border-[#FED7AA] hover:bg-[#FFEDD5]"
                                    }`}
                                  >
                                    <span>เดือน {MONTH_NAMES[m - 1]}:</span>
                                    {rec.completed ? (
                                      <span className="inline-flex items-center gap-1 font-extrabold text-[#15803D]">
                                        <CheckCircle2 size={13} /> ถูกต้อง ({rec.images.length} รูป)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 font-bold text-[#EA580C]">
                                        <Camera size={12} /> อัปโหลดรูป
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 4. MATRIX TABLE VIEW (ตารางแผนฝึกซ้อมรายเดือน + อัปโหลดรูปเพื่อแสดงสถานะถูกต้อง) */}
        {activeViewMode === "matrix" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Filter & Legend Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-[#F8FAFC] flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3">
              {/* Left: Active Supervisor Banner or Status Filter */}
              <div className="flex flex-wrap items-center gap-2">
                {activeInstructorStat ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F8F1F8] border border-[#E2CBE2] text-xs">
                    <span className="font-extrabold text-[#6B2169]">
                      ผู้ควบคุมงาน: {activeInstructorStat.instructor}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-[#15803D]">
                      ดำเนินการถูกต้อง {activeInstructorStat.completedSessions}/{activeInstructorStat.totalSessions} ครั้ง (
                      {activeInstructorStat.percent}%)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedInstructor("ALL")}
                      className="ml-1 px-2 py-0.5 rounded-lg bg-white text-[#6B2169] border border-[#D5B3D5] text-[11px] font-bold cursor-pointer hover:bg-[#F3E8F3]"
                    >
                      ดูทุกคน
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#EEF2F6] text-xs font-bold text-[#334155]">
                    <span>แสดงภาพรวมทุกช่างผู้ควบคุมงาน ({filteredPlans.length} หัวข้อ)</span>
                  </div>
                )}

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter("ALL")}
                    className={`px-2.5 py-1 rounded-lg font-bold border-0 cursor-pointer transition-colors ${
                      selectedStatusFilter === "ALL"
                        ? "bg-[#6B2169] text-white"
                        : "bg-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter("COMPLETED")}
                    className={`px-2.5 py-1 rounded-lg font-bold border-0 cursor-pointer transition-colors ${
                      selectedStatusFilter === "COMPLETED"
                        ? "bg-[#16A34A] text-white"
                        : "bg-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ✓ ครบทุกเดือนแล้ว
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter("PENDING")}
                    className={`px-2.5 py-1 rounded-lg font-bold border-0 cursor-pointer transition-colors ${
                      selectedStatusFilter === "PENDING"
                        ? "bg-[#EA580C] text-white"
                        : "bg-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    📷 รออัปโหลดรูป
                  </button>
                </div>
              </div>

              {/* Right: Legend & Search Box */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#15803D]">
                    <span className="w-5 h-5 rounded-md bg-[#16A34A] text-white inline-flex items-center justify-center text-xs font-black">
                      ✓
                    </span>
                    มีรูปภาพแล้ว = สถานะถูกต้อง
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#9A3412]">
                    <span className="w-5 h-5 rounded-md bg-[#FFF4E5] border border-dashed border-[#EA580C] text-[#EA580C] inline-flex items-center justify-center">
                      <Camera size={12} />
                    </span>
                    กดเพื่ออัปโหลดรูปภาพ
                  </span>
                </div>

                <div className="relative min-w-[260px]">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาหัวข้อฝึก หรือ ชื่อผู้ฝึกสอน..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6B2169]"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1150px]">
                <thead>
                  <tr className="bg-[#EEF2F6] text-[#1E293B] text-xs border-b border-slate-300">
                    <th className="py-3 px-3 text-center font-extrabold w-14 border-r border-slate-200">ลำดับ</th>
                    <th className="py-3 px-4 font-extrabold min-w-[290px] border-r border-slate-200">
                      แผนงาน / หัวข้อการฝึกซ้อมด้านความปลอดภัย
                    </th>
                    {MONTH_NAMES.map((m, i) => (
                      <th
                        key={i}
                        className="py-3 px-1.5 text-center font-extrabold w-16 border-r border-slate-200"
                      >
                        {m}
                      </th>
                    ))}
                    <th className="py-3 px-3 text-center font-extrabold w-28 border-r border-slate-200">
                      สถานะหัวข้อ
                    </th>
                    <th className="py-3 px-4 text-center font-extrabold w-48">
                      ช่างผู้ควบคุมงาน (ผู้ฝึกสอน)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={16} className="py-12 text-center text-slate-400 font-semibold">
                        กำลังโหลดข้อมูลแผนฝึกซ้อมความปลอดภัย...
                      </td>
                    </tr>
                  ) : filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="py-12 text-center text-slate-500 font-semibold">
                        ไม่พบรายการแผนฝึกซ้อมที่ค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan, index) => {
                      const completedInTopic = plan.months.filter((m) => getCellRecord(plan.id, m).completed).length;
                      const totalInTopic = plan.months.length;
                      const isTopicAllDone = completedInTopic === totalInTopic;

                      return (
                        <tr
                          key={plan.id}
                          className={`transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"
                          } hover:bg-[#F8F1F8]/50`}
                        >
                          <td className="py-2.5 px-3 text-center font-extrabold text-slate-500 border-r border-slate-200">
                            {plan.id}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#0F172A] border-r border-slate-200">
                            <div className="leading-snug">{plan.topic}</div>
                          </td>

                          {/* 12 Month Cells */}
                          {MONTH_NAMES.map((mName, i) => {
                            const monthNum = i + 1;
                            const isScheduled = plan.months.includes(monthNum);
                            if (!isScheduled) {
                              return (
                                <td
                                  key={i}
                                  className="py-2 px-1 text-center align-middle border-r border-slate-200"
                                />
                              );
                            }

                            const rec = getCellRecord(plan.id, monthNum);
                            const hasPhoto = rec.completed;
                            const photoCount = rec.images.length;
                            const firstThumb = rec.images[0];

                            return (
                              <td
                                key={i}
                                className="py-2 px-1.5 text-center align-middle border-r border-slate-200"
                              >
                                <button
                                  type="button"
                                  onClick={() => openCellModal(plan, monthNum)}
                                  title={
                                    hasPhoto
                                      ? `ดำเนินการถูกต้องแล้ว (${photoCount} รูป) • คลิกเพื่อดูหรือเพิ่มรูปภาพ`
                                      : `แผนเดือน${MONTH_FULL_NAMES[i]} • คลิกเพื่ออัปโหลดรูปภาพหลักฐานการฝึกซ้อม`
                                  }
                                  className={`group relative mx-auto w-12 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer p-0.5 ${
                                    hasPhoto
                                      ? "bg-[#EAFBF0] border-2 border-[#16A34A] text-[#15803D] hover:bg-[#DCFCE7]"
                                      : "bg-[#FFF4E5] border-2 border-dashed border-[#F97316] text-[#EA580C] hover:bg-[#FFEDD5]"
                                  }`}
                                >
                                  {hasPhoto ? (
                                    <>
                                      <div className="flex items-center gap-0.5">
                                        <span className="w-5 h-5 rounded-md bg-[#16A34A] text-white inline-flex items-center justify-center text-xs font-black shadow-sm">
                                          ✓
                                        </span>
                                        {firstThumb && (
                                          <img
                                            src={firstThumb}
                                            alt=""
                                            className="w-4 h-5 rounded object-cover border border-[#86EFAC]"
                                          />
                                        )}
                                      </div>
                                      <span className="text-[9px] font-extrabold text-[#15803D] leading-none mt-0.5">
                                        {photoCount} รูป
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Camera size={15} className="text-[#EA580C] group-hover:scale-110 transition-transform" />
                                      <span className="text-[8.5px] font-extrabold text-[#9A3412] leading-none mt-0.5">
                                        แนบรูป
                                      </span>
                                    </>
                                  )}
                                </button>
                              </td>
                            );
                          })}

                          {/* Topic Progress Column */}
                          <td className="py-2.5 px-2.5 text-center border-r border-slate-200">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                isTopicAllDone
                                  ? "bg-[#EAFBF0] text-[#15803D] border border-[#86EFAC]"
                                  : completedInTopic > 0
                                  ? "bg-[#EAF3FF] text-[#1D4ED8] border border-[#BFDBFE]"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {isTopicAllDone ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                              {completedInTopic}/{totalInTopic} ครั้ง
                            </span>
                          </td>

                          {/* Instructor / Supervisor Column (Clickable to filter by this supervisor) */}
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedInstructor((prev) =>
                                  prev === plan.instructor ? "ALL" : plan.instructor
                                )
                              }
                              className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors cursor-pointer border ${
                                selectedInstructor === plan.instructor
                                  ? "bg-[#6B2169] text-white border-[#6B2169]"
                                  : "bg-[#F8F1F8] hover:bg-[#EFE0EF] text-[#6B2169] border-[#E2CBE2]"
                              }`}
                              title="คลิกเพื่อดูเฉพาะหัวข้อของช่างผู้ควบคุมงานท่านนี้"
                            >
                              {plan.instructor}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* 5. PHOTO UPLOAD & VERIFICATION MODAL */}
      {activeModalCell && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={closeCellModal}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (PEA Purple) */}
            <div className="px-6 py-4 bg-[#F8F1F8] border-b border-[#E2CBE2] flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#6B2169] text-white flex items-center justify-center shrink-0 font-black text-sm">
                  #{activeModalCell.plan.id}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#6B2169] text-white">
                      ประจำเดือน{MONTH_FULL_NAMES[activeModalCell.monthIndex - 1]} 2569
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white text-[#6B2169] border border-[#D5B3D5]">
                      ผู้ฝึกสอน: {activeModalCell.plan.instructor}
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-extrabold text-[#0F172A] mt-1.5 leading-snug">
                    {activeModalCell.plan.topic}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCellModal}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 cursor-pointer shrink-0"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Current Verification Status Banner */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  modalImages.length > 0
                    ? "bg-[#EAFBF0] border-[#86EFAC] text-[#14532D]"
                    : "bg-[#FFF4E5] border-[#FED7AA] text-[#7C2D12]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base ${
                      modalImages.length > 0
                        ? "bg-[#16A34A] text-white"
                        : "bg-[#EA580C] text-white"
                    }`}
                  >
                    {modalImages.length > 0 ? "✓" : <Camera size={20} />}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm">
                      {modalImages.length > 0
                        ? `สถานะ: ดำเนินการฝึกซ้อมถูกต้องแล้ว (มีรูปภาพ ${modalImages.length} รูป)`
                        : "สถานะ: รออัปโหลดรูปภาพหลักฐานการฝึกซ้อม"}
                    </p>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {modalImages.length > 0
                        ? "ระบบตรวจสอบพบรูปภาพหลักฐานแล้ว จึงแสดงเครื่องหมาย ✓ สีเขียวในตาราง"
                        : "กรุณาอัปโหลดรูปภาพการฝึกซ้อมอย่างน้อย 1 รูป ระบบจึงจะเปลี่ยนสถานะเป็นถูกต้อง (✓)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Dropzone / Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-[#0F172A] flex items-center gap-1.5">
                    <ImageIcon size={15} className="text-[#6B2169]" />
                    รูปภาพหลักฐานการฝึกซ้อม ({modalImages.length}/6 รูป)
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6B2169] hover:bg-[#581A56] text-white font-extrabold cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>{isUploadingPhotos ? "กำลังอัปโหลดรูป..." : "+ เลือกรูปภาพเพิ่ม"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingPhotos}
                      onChange={handleUploadCellPhotos}
                      className="hidden"
                    />
                  </label>
                </div>

                {modalImages.length === 0 ? (
                  <label className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl border-2 border-dashed border-[#C697C6] bg-[#FCF9FC] hover:bg-[#F8F1F8] cursor-pointer transition-colors text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#F3E8F3] text-[#6B2169] flex items-center justify-center mb-2">
                      <Camera size={24} />
                    </div>
                    <span className="font-extrabold text-sm text-[#6B2169]">
                      {isUploadingPhotos ? "กำลังบีบอัดและอัปโหลดรูปภาพ..." : "คลิกที่นี่เพื่ออัปโหลดรูปภาพการฝึกซ้อม"}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      สามารถเลือกได้หลายรูปพร้อมกัน (เมื่อมีรูปภาพแล้ว สถานะจะเปลี่ยนเป็น ✓ ถูกต้องทันที)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingPhotos}
                      onChange={handleUploadCellPhotos}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {modalImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 h-32"
                      >
                        <img
                          src={imgUrl}
                          alt={`หลักฐานรูปที่ ${idx + 1}`}
                          onClick={() => setPreviewLightboxUrl(imgUrl)}
                          className="w-full h-full object-cover cursor-zoom-in"
                        />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/65 text-white text-[10px] font-bold">
                          รูปที่ {idx + 1}
                        </span>
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewLightboxUrl(imgUrl)}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white border-0 cursor-pointer"
                            title="ดูรูปขยาย"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveModalPhoto(idx)}
                            className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white border-0 cursor-pointer"
                            title="ลบรูปนี้"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Date & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">วันที่ดำเนินการฝึกซ้อม</label>
                  <input
                    type="date"
                    value={modalUpdatedAt}
                    onChange={(e) => setModalUpdatedAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-[#0F172A] focus:outline-none focus:border-[#6B2169]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#1E293B] mb-1">หมายเหตุ / รายละเอียดการฝึกซ้อม (ถ้ามี)</label>
                  <input
                    type="text"
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                    placeholder="เช่น ทบทวนขั้นตอนก่อนออกปฏิบัติงานหน้างานครบทุกชุดงาน..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-[#0F172A] focus:outline-none focus:border-[#6B2169]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-500">
                {modalImages.length > 0
                  ? "✅ มีรูปภาพหลักฐานครบถ้วน พร้อมแสดงสถานะถูกต้อง"
                  : "⚠️ ยังไม่มีรูปภาพ สถานะจะแสดงเป็นรออัปโหลดรูป"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeCellModal}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalDetails}
                  className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold border-0 cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Full Image Preview */}
      {previewLightboxUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPreviewLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setPreviewLightboxUrl(null)}
              className="absolute -top-10 right-0 px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-extrabold border-0 cursor-pointer"
            >
              ✕ ปิดรูปขยาย
            </button>
            <img
              src={previewLightboxUrl}
              alt="รูปขยายหลักฐานการฝึกซ้อม"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain border-2 border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
