"use client";

import React, { useState, useMemo } from "react";
import { TeamMemberPerformance, PlanTargetItem } from "../types";
import { Project } from "../../../lib/types";
import { findConnectedProjectsForPlanItem } from "../performanceData";
import { exportMemberToCSV, copyMemberSummaryToClipboard, downloadMemberPDF } from "../utils/exportUtils";
import { generateSmartAIInsights } from "../utils/aiInsights";
import TaskEditModal from "./TaskEditModal";
import EditPresentationModal from "./EditPresentationModal";
import {
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  Coins,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
  Brain,
  ShieldCheck,
  Zap,
  Target,
  MessageSquare,

  Link2,
  FileCheck,
  Calendar,
  AlertTriangle,
  Search,
  Download,
  Printer,
  Copy,
  Plus,
  Edit2,
  Edit3,
  Trash2,
  Check,
  FileSpreadsheet,
  FileText,
  Presentation,
  CheckCheck,
  RotateCw
} from "lucide-react";

interface IndividualScorecardProps {
  member: TeamMemberPerformance;
  allMembers: TeamMemberPerformance[];
  projects: Project[];
  onSelectMember: (memberId: string) => void;
  onBackToOverview: () => void;
  onOpenDeckForMember: (memberIndex: number) => void;
  onUpdateMember: (updatedMember: TeamMemberPerformance) => void;
}

export default function IndividualScorecard({
  member,
  allMembers,
  projects,
  onSelectMember,
  onBackToOverview,
  onOpenDeckForMember,
  onUpdateMember
}: IndividualScorecardProps) {
  const [activeTab, setActiveTab] = useState<"plan" | "projects" | "slide_preview" | "analysis">("plan");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState("ALL");
  const [projectYearFilter, setProjectYearFilter] = useState("ALL");

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingPlanItem, setEditingPlanItem] = useState<PlanTargetItem | null>(null);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);

  // Status feedback
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Projects assigned to this member in DB
  const memberProjects = useMemo(() => {
    const sName = member.shortName;
    const fName = member.fullName;
    return projects.filter((p) => {
      if (!p.supervisor) return false;
      const s = p.supervisor.trim();
      return s.includes(sName) || fName.includes(s) || s === sName;
    });
  }, [member, projects]);

  // Overall member statistics
  const memberStats = useMemo(() => {
    let sumRatio = 0;
    let count = 0;
    let completedCount = 0;

    member.planItems.forEach((item) => {
      const acc = item.accumulatedPercent ?? 0;
      const tgt = item.targetPercent ?? 100;
      if (tgt > 0) {
        sumRatio += Math.min(100, (acc / tgt) * 100);
        count++;
      }
      if (acc >= tgt && tgt > 0) {
        completedCount++;
      }
    });

    const avgAchievement = count > 0 ? Math.round(sumRatio / count) : 0;
    const totalBudget = memberProjects.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
    const f4Count = memberProjects.filter((p) => p.status === "F4").length;
    const d1Count = memberProjects.filter((p) => p.status === "D1").length;
    const year69Count = memberProjects.filter((p) => p.open_year === "2569").length;

    return {
      avgAchievement,
      completedCount,
      totalBudget,
      f4Count,
      d1Count,
      year69Count,
      totalProjects: memberProjects.length
    };
  }, [member, memberProjects]);

  // Filtered DB projects
  const filteredMemberProjects = useMemo(() => {
    return memberProjects.filter((p) => {
      if (projectStatusFilter !== "ALL" && p.status !== projectStatusFilter) return false;
      if (projectYearFilter !== "ALL" && p.open_year !== projectYearFilter) return false;
      if (projectSearch) {
        const text = `${p.name || ""} ${p.wbs || ""} ${p.remarks || ""}`.toLowerCase();
        if (!text.includes(projectSearch.toLowerCase())) return false;
      }
      return true;
    });
  }, [memberProjects, projectStatusFilter, projectYearFilter, projectSearch]);

  // Navigation indexes
  const currentIndex = allMembers.findIndex((m) => m.id === member.id);
  const prevMember = currentIndex > 0 ? allMembers[currentIndex - 1] : null;
  const nextMember = currentIndex < allMembers.length - 1 ? allMembers[currentIndex + 1] : null;

  // Add / Edit Task Item
  const handleSaveTaskItem = (savedItem: PlanTargetItem) => {
    let updatedPlanItems: PlanTargetItem[] = [];
    const exists = member.planItems.some((it) => it.id === savedItem.id);

    if (exists) {
      updatedPlanItems = member.planItems.map((it) => (it.id === savedItem.id ? savedItem : it));
    } else {
      updatedPlanItems = [...member.planItems, savedItem];
    }

    onUpdateMember({
      ...member,
      planItems: updatedPlanItems
    });
  };

  // Delete Task Item
  const handleDeleteTaskItem = (itemId: string) => {
    if (confirm("ยืนยันการลบรายการแผนงานนี้?")) {
      const updatedPlanItems = member.planItems.filter((it) => it.id !== itemId);
      onUpdateMember({
        ...member,
        planItems: updatedPlanItems
      });
    }
  };

  // Save full presentation details (highlights, challenges, notes)
  const handleSavePresentationDetails = (updated: TeamMemberPerformance) => {
    onUpdateMember(updated);
  };

  // Quick Inline Progress Stepper (+5%, -5%, Set 100%)
  const handleQuickAdjustProgress = (itemId: string, delta: number) => {
    const updatedPlanItems = member.planItems.map((it) => {
      if (it.id !== itemId) return it;
      const current = it.accumulatedPercent ?? 0;
      const next = Math.max(0, Math.min(100, current + delta));
      return { ...it, accumulatedPercent: next };
    });
    onUpdateMember({
      ...member,
      planItems: updatedPlanItems
    });
  };

  const handleSetProgress = (itemId: string, percent: number) => {
    const updatedPlanItems = member.planItems.map((it) => {
      if (it.id !== itemId) return it;
      return { ...it, accumulatedPercent: percent };
    });
    onUpdateMember({
      ...member,
      planItems: updatedPlanItems
    });
  };

  // Direct PDF Download Handler
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    const filename = `ผลการปฏิบัติงาน_ผกร_${member.shortName}_2569.pdf`;
    await downloadMemberPDF("individual-pdf-report", filename);
    setIsGeneratingPDF(false);
  };

  // Quick Copy Summary for Chat
  const handleCopySummary = () => {
    const ok = copyMemberSummaryToClipboard(
      member,
      memberStats.avgAchievement,
      memberStats.totalProjects,
      memberStats.totalBudget
    );
    if (ok) {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2200);
    }
  };

    const aiInsights = useMemo(() => {
    return generateSmartAIInsights(member, memberProjects, memberStats.avgAchievement);
  }, [member, memberProjects, memberStats.avgAchievement]);

  const [copiedTalkingPoints, setCopiedTalkingPoints] = useState(false);
  const handleCopyTalkingPoints = () => {
    try {
      const script = [
        `🎙️ บทพูดสรุปนำเสนอผู้บริหาร - ${member.fullName} (${member.shortName})`,
        `เกรดการประเมิน: ${aiInsights.grade} | ${aiInsights.ratingLabel}`,
        `ความสำเร็จสะสม: ${memberStats.avgAchievement}% (${member.planItems.length} แผนงาน)`,
        ``,
        `ประเด็นนำเสนอสำคัญ:`,
        ...aiInsights.executiveTalkingPoints.map((tp, idx) => `${idx + 1}. ${tp}`),
        ``,
        `ข้อเสนอแนะเชิงกลยุทธ์ AI:`,
        ...aiInsights.strategicAdvice.map((sa, idx) => `- ${sa}`)
      ].join("\n");
      navigator.clipboard.writeText(script);
      setCopiedTalkingPoints(true);
      setTimeout(() => setCopiedTalkingPoints(false), 2200);
    } catch (e) {}
  };

  return (
    <div className="space-y-4 font-sans">
      {/* =========================================================================
          EXECUTIVE COMMAND DOCK (ROUNDED-3XL FLOATING ACTIONS)
          ========================================================================= */}
      <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-3.5 border border-purple-100/90 shadow-[0_10px_35px_rgba(79,70,229,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Left: Back & Person Status Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBackToOverview}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-purple-950 bg-slate-100/90 hover:bg-purple-50 border border-slate-200/80 hover:border-purple-200 px-3.5 py-2 rounded-2xl shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-0 active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>← กลับภาพรวม</span>
          </button>

          {/* Previous / Next Member Navigation Pill */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              type="button"
              disabled={!prevMember}
              onClick={() => prevMember && onSelectMember(prevMember.id)}
              className="p-1.5 rounded-xl hover:bg-white text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all focus:outline-none"
              title={prevMember ? `ไปยัง ${prevMember.shortName}` : "คนแรก"}
            >
              <ChevronLeft size={15} />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl shadow-xs border border-purple-100">
              <span className="font-extrabold text-purple-950">
                #{member.order} {member.fullName}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-purple-700 font-bold">{member.shortName}</span>
            </div>

            <button
              type="button"
              disabled={!nextMember}
              onClick={() => nextMember && onSelectMember(nextMember.id)}
              className="p-1.5 rounded-xl hover:bg-white text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all focus:outline-none"
              title={nextMember ? `ไปยัง ${nextMember.shortName}` : "คนสุดท้าย"}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* AI Grade Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-sm">
            <Sparkles size={13} className="text-emerald-600" />
            <span>AI Grade: {aiInsights.grade} ({memberStats.avgAchievement}%)</span>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck size={13} className="text-indigo-600" />
            <span>{aiInsights.riskLabel}</span>
          </span>
        </div>

        {/* Right: Modern Futuristic Action Buttons (Rounded-2xl) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Button: Launch Fullscreen Presentation Slide */}
          <button
            type="button"
            onClick={() => onOpenDeckForMember(currentIndex + 2)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-400/30 hover:shadow-xl hover:shadow-amber-400/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-0"
            title="ฉายสไลด์ของบุคคลนี้เพื่อนำเสนอผู้บริหาร"
          >
            <Sparkles size={14} className="text-purple-950" />
            <span>✨ ฉายสไลด์ท่านนี้</span>
          </button>

          {/* Button: Download Direct PDF */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-0"
            title="ดาวน์โหลดสรุปผลงานเป็นไฟล์ PDF อัตโนมัติ"
          >
            {isGeneratingPDF ? (
              <RotateCw size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            <span>{isGeneratingPDF ? "สร้าง PDF..." : "ดาวน์โหลด PDF"}</span>
          </button>

          {/* Button: Export Excel CSV */}
          <button
            type="button"
            onClick={() => exportMemberToCSV(member)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-0"
            title="ส่งออกตารางแผนงานเป็นไฟล์ Excel (CSV)"
          >
            <FileSpreadsheet size={14} />
            <span>Excel (CSV)</span>
          </button>

          {/* Button: Edit Presentation Details */}
          <button
            type="button"
            onClick={() => setIsPresentationModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-0"
            title="แก้ไขผลงานเด่น ปัญหาอุปสรรค และบันทึกนำเสนอผู้บริหาร"
          >
            <Edit3 size={14} />
            <span>แก้ไขนำเสนอ</span>
          </button>

          {/* Button: Add Task Item */}
          <button
            type="button"
            onClick={() => {
              setEditingPlanItem(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-0"
          >
            <Plus size={14} />
            <span>+ เพิ่มแผนงาน</span>
          </button>

          {/* Button: Copy Summary */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-0"
            title="คัดลอกข้อความสรุปผลงานส่งผู้บริหารใน LINE"
          >
            {copiedNotice ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedNotice ? "คัดลอกแล้ว!" : "คัดลอกสรุป"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          EXECUTIVE GLASS DOSSIER HERO (ROUNDED-[32PX] ROYAL PEA GRADIENT)
          ========================================================================= */}
      <div
        className="rounded-[32px] p-6 text-white shadow-2xl relative overflow-hidden border border-purple-400/30"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(168, 85, 247, 0.25) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.2) 0%, transparent 60%), linear-gradient(135deg, #130b2b 0%, #240e4f 50%, #0d061c 100%)"
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-purple-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-400/25 ring-4 ring-white/10 shrink-0">
              {member.order}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/25 text-amber-300 border border-amber-400/40 shadow-sm">
                  {member.teamName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-purple-200 border border-white/15">
                  ผู้รับผิดชอบลำดับที่ {member.order}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {aiInsights.ratingLabel}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {member.fullName}
              </h2>
              <p className="text-xs md:text-sm text-purple-200/90 font-medium">{member.title}</p>
            </div>
          </div>

          {/* 3 Soft Floating KPI Capsules */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center shrink-0">
            <div className="px-3 py-1">
              <div className="text-[10px] text-purple-200 font-semibold mb-0.5">ความสำเร็จสะสม</div>
              <div className="text-2xl font-black text-amber-300">{memberStats.avgAchievement}%</div>
            </div>
            <div className="px-3 py-1 border-l border-white/10">
              <div className="text-[10px] text-purple-200 font-semibold mb-0.5">แผนงานเป้าหมาย</div>
              <div className="text-2xl font-black text-white">{member.planItems.length}</div>
            </div>
            <div className="px-3 py-1 border-l border-white/10 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-purple-200 font-semibold mb-0.5">บรรลุเป้าหมาย 100%</div>
              <div className="text-2xl font-black text-emerald-300">{memberStats.completedCount} รายการ</div>
            </div>
          </div>
        </div>

        {/* Executive Presentation Notes Banner (if provided) */}
        {member.executiveNotes && (
          <div className="mt-4 pt-3 border-t border-white/15 text-xs text-amber-200/95 flex items-start gap-2.5 bg-black/30 p-3.5 rounded-2xl border border-amber-400/20">
            <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-amber-300 font-bold">ประเด็นนำเสนอผู้บริหาร:</strong>{" "}
              {member.executiveNotes}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          🌟 ภารกิจกอบกู้ภัยพิบัติฉุกเฉิน & กองยานยนต์ขนเสา ประจำปี 2569 (รายบุคคล)
          ========================================================================= */}
      {member.disasterMission && (
        <div className="rounded-[30px] p-5 border border-rose-200/80 bg-gradient-to-r from-rose-950 via-[#180f28] to-amber-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 ring-2 ring-white/10 shrink-0">
                  <Zap size={20} className="text-amber-200 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                      ภารกิจเด่นระดับแผนกประจำปี 2569 (เกิดเหตุหนักเกือบทุกเดือนตลอดปี)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/30 text-rose-200 border border-rose-400/40">
                      ⚡ ภัยพิบัติ & รถขนเสา
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-amber-300 tracking-tight">
                    {member.disasterMission.roleTitle}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>{member.disasterMission.statusBadge}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
              <div className="md:col-span-8 space-y-2.5">
                <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="font-extrabold text-amber-300">เหตุการณ์วิกฤตรุนแรงที่รับผิดชอบ: </span>
                    <span className="text-white font-bold">{member.disasterMission.incidentFocus}</span>
                  </div>
                </div>

                <p className="text-slate-200 leading-relaxed text-[12px] bg-black/25 p-3.5 rounded-2xl border border-white/5">
                  {member.disasterMission.description}
                </p>
              </div>

              <div className="md:col-span-4 bg-gradient-to-br from-amber-950/60 to-purple-950/60 p-3.5 rounded-2xl border border-amber-500/30 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs mb-1">
                    <span>🚛 ภารกิจกองยานยนต์ขนเสา & เครื่องจักรกลหนัก:</span>
                  </div>
                  <p className="text-slate-200 text-[11.5px] leading-relaxed">
                    {member.disasterMission.fleetSupport || "สนับสนุนการลำเลียงเสาคอนกรีตและการเดินเครื่องจักรกลหนักเร่งด่วน 24 ชั่วโมง ไร้อุบัติเหตุ (Zero Accident)"}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-lg bg-rose-900/60 text-rose-200 border border-rose-700/50">
                    🌪️ ตลาดบางหลวง
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-900/60 text-amber-200 border border-amber-700/50">
                    ⚡ ดอนเจดีย์
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
                    🏔️ ทองผาภูมิ-สังขละฯ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          🤖 PEA AI EXECUTIVE INTELLIGENCE & DIAGNOSTIC COPILOT (อัจฉริยะแบบชัดเจน)
          ========================================================================= */}
      <div className="rounded-[28px] p-5 border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/30 shadow-[0_10px_30px_rgba(99,102,241,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/80 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-800 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Brain size={20} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm md:text-base text-slate-900 tracking-tight">
                  ระบบวิเคราะห์และสังเคราะห์ผลงานอัจฉริยะ (PEA Executive Intelligence Copilot)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                  AI Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ประมวลผลเชิงกลยุทธ์เทียบเป้าหมายไตรมาส 3/2569 และภาระงานโครงการจริงในระบบ WBS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTalkingPoints}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-purple-900 bg-white/90 hover:bg-purple-100 border border-purple-200/80 shadow-sm transition-all"
              title="คัดลอกบทพูดสรุปสำหรับนำเสนอผู้บริหาร"
            >
              {copiedTalkingPoints ? (
                <CheckCheck size={14} className="text-emerald-600" />
              ) : (
                <MessageSquare size={14} className="text-purple-700" />
              )}
              <span>{copiedTalkingPoints ? "คัดลอกบทพูดแล้ว!" : "คัดลอกบทพูดนำเสนอ"}</span>
            </button>
          </div>
        </div>

        {/* 3 Intelligent Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {/* Card 1: Executive Diagnostic Summary */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-indigo-100 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <div className="w-6 h-6 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Zap size={14} />
              </div>
              <span>บทวิเคราะห์สรุปผลงาน (Executive Summary)</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11.5px]">
              {aiInsights.smartSummary}
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">คะแนนศักยภาพเชิงแผน:</span>
              <span className="font-extrabold text-indigo-700">
                {aiInsights.smartMetrics.planExecutionScore}/100
              </span>
            </div>
          </div>

          {/* Card 2: Key Strategic Highlights */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-emerald-100 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
              <div className="w-6 h-6 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
              <span>จุดเด่นและความสำเร็จ (Key Achievements)</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 text-[11.5px]">
              {aiInsights.keyStrengths.map((st, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="leading-snug">{st}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: AI Tactical Action Items */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-amber-100 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
              <div className="w-6 h-6 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Target size={14} />
              </div>
              <span>ข้อเสนอแนะเชิงกลยุทธ์ (AI Strategic Action)</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 text-[11.5px]">
              {aiInsights.strategicAdvice.slice(0, 3).map((ad, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-snug">{ad}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Executive Talking Script Box */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-purple-100 p-4 rounded-2xl border border-purple-400/30 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare size={15} className="text-amber-400" />
              <span className="font-extrabold text-xs text-amber-300">
                🎙️ สคริปต์บทพูดนำเสนอคณะผู้บริหาร (Executive Talking Points)
              </span>
            </div>
            <span className="text-[10px] text-purple-300/80">ใช้สำหรับอ่านหรืออ้างอิงขณะบรรยายสไลด์</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11.5px] text-slate-200 leading-relaxed">
            {aiInsights.executiveTalkingPoints.map((tp, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{tp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW SWITCHER TABS (ROUNDED CAPSULES)
          ========================================================================= */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-1.5 border border-purple-100/80 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab("plan")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "plan"
                ? "bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md shadow-purple-900/20 scale-[1.02]"
                : "text-slate-600 hover:text-purple-950 hover:bg-purple-50"
            }`}
          >
            <FileCheck size={14} />
            <span>ตารางแผนงานเป้าหมาย ({member.planItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("slide_preview")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "slide_preview"
                ? "bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md shadow-purple-900/20 scale-[1.02]"
                : "text-slate-600 hover:text-purple-950 hover:bg-purple-50"
            }`}
          >
            <Presentation size={14} className={activeTab === "slide_preview" ? "text-amber-400" : "text-amber-600"} />
            <span>มุมมองสไลด์นำเสนอผู้บริหาร (Executive Slide)</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "projects"
                ? "bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md shadow-purple-900/20 scale-[1.02]"
                : "text-slate-600 hover:text-purple-950 hover:bg-purple-50"
            }`}
          >
            <Layers size={14} />
            <span>แฟ้มโครงการจริงในระบบ ({memberProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "analysis"
                ? "bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md shadow-purple-900/20 scale-[1.02]"
                : "text-slate-600 hover:text-purple-950 hover:bg-purple-50"
            }`}
          >
            <Sparkles size={14} />
            <span>ผลงานเด่น & ข้อจำกัด</span>
          </button>
        </div>

        <button
          onClick={() => setIsPresentationModalOpen(true)}
          className="text-xs font-bold text-purple-700 hover:text-purple-900 px-3 py-1.5 rounded-2xl hover:bg-purple-50 flex items-center gap-1.5 transition-colors"
        >
          <Edit2 size={13} />
          <span>แก้ไขข้อมูลนำเสนอ</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PLAN TARGETS TABLE (SOFT FLOATING ROWS / CARDS)
          ========================================================================= */}
      {activeTab === "plan" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span className="font-medium">
              ตารางแผนงานเป้าหมาย ไตรมาส 3/2569 (แก้ไขเปอร์เซ็นต์หรือชื่องานได้ทันที)
            </span>
            <button
              onClick={() => {
                setEditingPlanItem(null);
                setIsTaskModalOpen(true);
              }}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-2xl transition-all flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>+ เพิ่มแผนงาน</span>
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-purple-100/80 shadow-[0_10px_35px_rgba(79,70,229,0.04)] overflow-hidden p-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] rounded-2xl">
                    <th className="py-3 px-3.5 w-10 text-center rounded-l-2xl">#</th>
                    <th className="py-3 px-3.5 min-w-[260px]">รายการแผนงาน</th>
                    <th className="py-3 px-3.5 w-24 text-center">สะสม (%)</th>
                    <th className="py-3 px-3.5 w-24 text-center">เป้าหมาย (%)</th>
                    <th className="py-3 px-3.5 w-36">ความก้าวหน้า</th>
                    <th className="py-3 px-3.5 min-w-[200px]">หมายเหตุ / การเชื่อมโยง</th>
                    <th className="py-3 px-3.5 w-20 text-center rounded-r-2xl no-print">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {member.planItems.map((item, idx) => {
                    const acc = item.accumulatedPercent ?? 0;
                    const tgt = item.targetPercent ?? 100;
                    const ratio = tgt > 0 ? Math.round((acc / tgt) * 100) : 0;
                    const connected = findConnectedProjectsForPlanItem(item, memberProjects, projects);
                    const isUrgent = item.category === "urgent";

                    return (
                      <tr
                        key={item.id}
                        className={`transition-all duration-200 group rounded-2xl ${
                          isUrgent
                            ? "bg-gradient-to-r from-amber-50/70 via-rose-50/40 to-transparent border-l-4 border-l-amber-500 hover:bg-amber-100/50"
                            : "hover:bg-purple-50/50"
                        }`}
                      >
                        <td className="py-3 px-3.5 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-900 group-hover:text-purple-950 text-xs md:text-sm flex items-center gap-1.5 flex-wrap">
                            {isUrgent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-sm">
                                ⚡ ภัยพิบัติ & รถขนเสา
                              </span>
                            )}
                            <span>{item.taskName}</span>
                          </div>
                          {connected.length > 0 && (
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                                <Link2 size={10} />
                                <span>ในระบบ SAP: {connected.length} โครงการ</span>
                              </span>
                              {connected.slice(0, 1).map((cp) => (
                                <span
                                  key={cp.id}
                                  className="text-[10px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200"
                                >
                                  {cp.wbs} ({cp.status})
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3.5 text-center font-black">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-slate-900 text-sm font-black">
                              {item.accumulatedPercent !== null ? `${item.accumulatedPercent}%` : "-"}
                            </span>
                            {/* Quick Stepper Buttons (no-print) */}
                            <div className="flex items-center gap-1 no-print">
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustProgress(item.id, -5)}
                                className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 font-black text-[10px] flex items-center justify-center transition-all shadow-xs border border-slate-200 focus:outline-none active:scale-95"
                                title="ลด 5%"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustProgress(item.id, 5)}
                                className="w-5 h-5 rounded-lg bg-purple-50 hover:bg-purple-200 text-purple-900 font-black text-[10px] flex items-center justify-center transition-all shadow-xs border border-purple-200 focus:outline-none active:scale-95"
                                title="เพิ่ม 5%"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetProgress(item.id, item.targetPercent ?? 100)}
                                className={`h-5 px-1.5 rounded-lg font-bold text-[9px] flex items-center justify-center transition-all border shadow-xs focus:outline-none active:scale-95 ${
                                  (item.accumulatedPercent ?? 0) >= (item.targetPercent ?? 100)
                                    ? "bg-emerald-500 text-white border-emerald-600 font-black"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                                }`}
                                title="บรรลุเป้าหมาย 100%"
                              >
                                100%
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3.5 text-center font-black text-purple-700">
                          {item.targetPercent !== null ? (
                            <span className="text-sm">{item.targetPercent}%</span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        <td className="py-3 px-3.5">
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                ratio >= 100
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                  : ratio >= 70
                                  ? "bg-gradient-to-r from-purple-600 to-indigo-500"
                                  : ratio >= 40
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                                  : "bg-gradient-to-r from-amber-500 to-yellow-400"
                              }`}
                              style={{ width: `${Math.min(100, ratio)}%` }}
                            />
                          </div>
                          <div className="text-[10.5px] text-slate-500 mt-1 flex justify-between font-semibold">
                            <span>{ratio}% เทียบเป้า</span>
                            {ratio >= 100 && (
                              <span className="text-emerald-700 font-black">✓ บรรลุ 100%</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3.5 text-slate-600">
                          {item.remarks ? (
                            <span className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200/80 inline-block text-[11px] font-medium leading-relaxed">
                              {item.remarks}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-3.5 text-center no-print">
                          <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100">
                            <button
                              onClick={() => {
                                setEditingPlanItem(item);
                                setIsTaskModalOpen(true);
                              }}
                              className="p-1.5 rounded-xl text-purple-700 hover:bg-purple-100 hover:text-purple-950 transition-colors shadow-sm"
                              title="แก้ไขรายการนี้"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteTaskItem(item.id)}
                              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors shadow-sm"
                              title="ลบรายการนี้"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: EXECUTIVE SLIDE PREVIEW (PRESENTATION CARD FOR EXECUTIVES)
          ========================================================================= */}
      {activeTab === "slide_preview" && (
        <div className="bg-gradient-to-br from-slate-950 via-[#130f2c] to-slate-950 text-white rounded-[28px] p-6 border border-purple-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                {member.order}
              </span>
              <div>
                <h3 className="font-black text-lg text-white">{member.fullName}</h3>
                <p className="text-xs text-purple-300">{member.title} • {member.teamName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPresentationModalOpen(true)}
                className="px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Edit3 size={13} />
                <span>แก้ไขเนื้อหาสไลด์</span>
              </button>
              <button
                onClick={() => onOpenDeckForMember(currentIndex + 2)}
                className="px-4 py-1.5 rounded-2xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/30"
              >
                <Presentation size={13} />
                <span>ฉายเต็มจอ</span>
              </button>
            </div>
          </div>

          {/* 🌟 Disaster & Fleet Mission Banner on Slide Preview */}
          {member.disasterMission && (
            <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/60 border border-rose-500/40 rounded-2xl p-4 shadow-lg space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-900/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black">
                    ⚡
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                      ภารกิจเด่นกู้ภัยพิบัติฉุกเฉิน & กองยานยนต์ขนเสา ประจำปี 2569
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-amber-300">
                      {member.disasterMission.roleTitle}
                    </h4>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  ✓ {member.disasterMission.statusBadge}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                <div className="md:col-span-8 space-y-1.5 text-slate-200">
                  <div className="text-[11px] text-amber-200 font-semibold bg-white/5 p-2 rounded-xl border border-white/10 flex items-start gap-1.5">
                    <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">พื้นที่/เหตุการณ์วิกฤต:</strong>{" "}
                      {member.disasterMission.incidentFocus}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-relaxed bg-black/20 p-2 rounded-xl">
                    {member.disasterMission.description}
                  </div>
                </div>
                <div className="md:col-span-4 bg-gradient-to-br from-amber-950/40 to-purple-950/40 p-2.5 rounded-xl border border-amber-500/30 text-[10.5px] text-slate-300 space-y-1 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-amber-300 flex items-center gap-1 mb-1">
                      <span>🚛 กองยานยนต์ขนเสา & เครน:</span>
                    </div>
                    <div className="leading-snug">
                      {member.disasterMission.fleetSupport || "สนับสนุนการลำเลียงเสาคอนกรีตฉุกเฉิน ไร้อุบัติเหตุ (Zero Accident)"}
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 flex flex-wrap gap-1 text-[9.5px]">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-rose-200">ตลาดบางหลวง</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-amber-200">ดอนเจดีย์</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-emerald-200">ทองผาภูมิ-สังขละฯ</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Talking Points & Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>ผลงานสำคัญและความสำเร็จ (Key Achievements)</span>
              </h4>
              <ul className="space-y-2 text-slate-200">
                {member.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>ประเด็นเร่งรัดและข้อจำกัดหน้างาน (Focus Areas)</span>
              </h4>
              <ul className="space-y-2 text-slate-200">
                {member.challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Top Plan Highlights in Slide */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-purple-300 mb-3">
              สถานะความก้าวหน้าแผนงานเป้าหมาย ({member.planItems.length} รายการ)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {member.planItems.map((it) => {
                const acc = it.accumulatedPercent ?? 0;
                const tgt = it.targetPercent ?? 100;
                const ratio = tgt > 0 ? Math.round((acc / tgt) * 100) : 0;
                return (
                  <div key={it.id} className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-white line-clamp-1">{it.taskName}</span>
                      <span className="font-bold text-amber-300 shrink-0">{acc}% / {tgt}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ratio >= 100 ? "bg-emerald-400" : ratio >= 70 ? "bg-purple-400" : "bg-amber-400"
                        }`}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CONNECTED REAL DB PROJECTS (ROUNDED-28PX)
          ========================================================================= */}
      {activeTab === "projects" && (
        <div className="space-y-3">
          <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-3 border border-purple-100/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="ค้นหาชื่อโครงการ, รหัส WBS..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={projectYearFilter}
                onChange={(e) => setProjectYearFilter(e.target.value)}
                className="text-xs border border-slate-200/80 rounded-2xl px-3 py-1.5 bg-white text-slate-700"
              >
                <option value="ALL">ปี: ทั้งหมด</option>
                <option value="2569">เฉพาะปี 2569</option>
                <option value="2568">เฉพาะปี 2568</option>
              </select>

              <select
                value={projectStatusFilter}
                onChange={(e) => setProjectStatusFilter(e.target.value)}
                className="text-xs border border-slate-200/80 rounded-2xl px-3 py-1.5 bg-white text-slate-700"
              >
                <option value="ALL">สถานะ: ทั้งหมด</option>
                <option value="F4">F4 (ปิดงานแล้ว)</option>
                <option value="D1">D1 (อยู่ระหว่างก่อสร้าง)</option>
                <option value="C1">C1 (เตรียมการ)</option>
              </select>

              <span className="text-[11px] text-slate-600 font-bold bg-purple-50 px-3 py-1.5 rounded-2xl border border-purple-200">
                {filteredMemberProjects.length} โครงการ
              </span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-purple-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden p-3 text-xs">
            {filteredMemberProjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] rounded-2xl">
                      <th className="py-2.5 px-3 w-10 text-center rounded-l-2xl">#</th>
                      <th className="py-2.5 px-3 w-20">ปีเปิด</th>
                      <th className="py-2.5 px-3 w-24">สถานะ</th>
                      <th className="py-2.5 px-3 w-52 font-mono">รหัส WBS</th>
                      <th className="py-2.5 px-3 min-w-[260px]">ชื่อโครงการ</th>
                      <th className="py-2.5 px-3 w-36 text-right rounded-r-2xl">งบประมาณ (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredMemberProjects.map((proj, i) => (
                      <tr key={proj.id} className="hover:bg-slate-50 transition-colors rounded-2xl">
                        <td className="py-2.5 px-3 text-center text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {proj.open_year || "-"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              proj.status === "F4"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : proj.status === "D1"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {proj.status || "-"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {proj.wbs}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{proj.name}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {(Number(proj.value) || 0).toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                ไม่พบโครงการที่ตรงกับเงื่อนไข
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: HIGHLIGHTS & CHALLENGES (EDITABLE - ROUNDED-28PX)
          ========================================================================= */}
      {activeTab === "analysis" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-5 border border-purple-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-emerald-900 flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} />
                  <span>ผลงานเด่นและความสำเร็จ (Key Achievements)</span>
                </h3>
                <button
                  onClick={() => setIsPresentationModalOpen(true)}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Edit2 size={12} />
                  <span>แก้ไข</span>
                </button>
              </div>
              <ul className="space-y-2">
                {member.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-5 border border-purple-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-amber-900 flex items-center gap-2 text-sm">
                  <AlertTriangle size={16} />
                  <span>ข้อจำกัดและประเด็นที่ต้องเร่งรัด (Immediate Actions)</span>
                </h3>
                <button
                  onClick={() => setIsPresentationModalOpen(true)}
                  className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                >
                  <Edit2 size={12} />
                  <span>แก้ไข</span>
                </button>
              </div>
              <ul className="space-y-2">
                {member.challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          OFFICIAL INDIVIDUAL PDF REPORT TEMPLATE (TARGETED BY HTML2PDF)
          ========================================================================= */}
      <div className="overflow-hidden h-0 w-0 opacity-0 pointer-events-none">
        <div
          id="individual-pdf-report"
          style={{
            width: "297mm",
            height: "208mm",
            maxHeight: "208mm",
            padding: "7mm 10mm",
            backgroundColor: "#ffffff",
            color: "#0f172a",
            fontFamily: "var(--font-prompt), sans-serif",
            fontSize: "10.5px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #6B2169", paddingBottom: "5px", marginBottom: "6px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#6B2169", lineHeight: "1.2" }}>
                การไฟฟ้าส่วนภูมิภาค เขต 3 (ภาคกลาง) จังหวัดนครปฐม
              </div>
              <div style={{ fontSize: "10px", color: "#475569", lineHeight: "1.2" }}>
                แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา ฝ่ายวิศวกรรมและบริการ
              </div>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#0f172a", marginTop: "2px", lineHeight: "1.2" }}>
                แบบรายงานสรุปผลการปฏิบัติงานรายบุคคล ประจำไตรมาส 3 ปี 2569
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "10px", color: "#64748b", lineHeight: "1.3" }}>
              <div>วันที่ออกรายงาน: {new Date().toLocaleDateString("th-TH")}</div>
              <div style={{ fontWeight: "bold", color: "#6B2169", fontSize: "11px" }}>
                ผู้รับผิดชอบลำดับที่ {member.order}
              </div>
            </div>
          </div>

          {/* Member Profile & KPI Ribbon */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "5px 12px", marginBottom: "6px" }}>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: "bold", color: "#0f172a", lineHeight: "1.2" }}>
                {member.fullName}
              </div>
              <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.2" }}>
                {member.title} | {member.teamName}
              </div>
            </div>
            <div style={{ display: "flex", gap: "20px", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: "9px", color: "#64748b" }}>ความสำเร็จเฉลี่ย</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#6B2169", lineHeight: "1.2" }}>{memberStats.avgAchievement}%</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", color: "#64748b" }}>แผนงานเป้าหมาย</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#0f172a", lineHeight: "1.2" }}>{member.planItems.length} งาน</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", color: "#64748b" }}>บรรลุ 100% แล้ว</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#059669", lineHeight: "1.2" }}>{memberStats.completedCount} งาน</div>
              </div>
            </div>
          </div>

          {/* Member Disaster & Fleet Mission Box */}
          {member.disasterMission && (
            <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "6px", padding: "5px 10px", marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                <div style={{ fontSize: "10.5px", fontWeight: "bold", color: "#9f1239" }}>
                  ⚡ ผลงานเด่น: ภารกิจกอบกู้ภัยพิบัติฉุกเฉิน & กองยานยนต์ขนเสา ประจำปี 2569 (เกิดเหตุหนักเกือบทุกเดือน)
                </div>
                <div style={{ fontSize: "9px", fontWeight: "bold", color: "#065f46", backgroundColor: "#d1fae5", padding: "1px 6px", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
                  ✓ {member.disasterMission.statusBadge}
                </div>
              </div>
              <div style={{ fontSize: "9.5px", color: "#1e293b", lineHeight: "1.2" }}>
                <strong>บทบาท:</strong> {member.disasterMission.roleTitle} • <strong>พื้นที่วิกฤต:</strong> {member.disasterMission.incidentFocus}
              </div>
              <div style={{ fontSize: "9px", color: "#475569", lineHeight: "1.2", marginTop: "1px" }}>
                {member.disasterMission.description}
              </div>
              {member.disasterMission.fleetSupport && (
                <div style={{ fontSize: "9px", color: "#9a3412", marginTop: "1.5px", fontWeight: "600", lineHeight: "1.2" }}>
                  🚛 ภารกิจกองยานยนต์ขนเสา & เครื่องจักรกลหนัก: {member.disasterMission.fleetSupport}
                </div>
              )}
            </div>
          )}

          {/* Target Plan Table */}
          <div style={{ marginBottom: "6px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#1e1b4b", marginBottom: "3px" }}>
              ตารางแผนงานเป้าหมาย และผลการดำเนินงานสะสม ไตรมาส 3/2569
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: member.planItems.length > 8 ? "8.5px" : "9.5px", lineHeight: "1.2" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "1.5px solid #cbd5e1" }}>
                    <th style={{ padding: member.planItems.length > 8 ? "3px 4px" : "4px 6px", width: "26px", textAlign: "center" }}>#</th>
                    <th style={{ padding: member.planItems.length > 8 ? "3px 4px" : "4px 6px", textAlign: "left" }}>รายการแผนงาน</th>
                    <th style={{ padding: member.planItems.length > 8 ? "3px 4px" : "4px 6px", width: "65px", textAlign: "center" }}>สะสม (%)</th>
                    <th style={{ padding: member.planItems.length > 8 ? "3px 4px" : "4px 6px", width: "65px", textAlign: "center" }}>เป้าหมาย (%)</th>
                    <th style={{ padding: member.planItems.length > 8 ? "3px 4px" : "4px 6px", width: "75px", textAlign: "center" }}>ผลสำเร็จ (%)</th>
                    <th style={{ padding: member.planItems.length > 8 ? "3px 4px" : "4px 6px", textAlign: "left", width: "230px" }}>หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {member.planItems.map((item, idx) => {
                    const acc = item.accumulatedPercent ?? 0;
                    const tgt = item.targetPercent ?? 100;
                    const ratio = tgt > 0 ? Math.round((acc / tgt) * 100) : 0;
                    const isUrgent = item.category === "urgent";
                    const cellPad = member.planItems.length > 8 ? "2px 4px" : "3px 6px";
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: "1px solid #e2e8f0",
                          backgroundColor: isUrgent ? "#fff7ed" : "transparent"
                        }}
                      >
                        <td style={{ padding: cellPad, textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: cellPad, fontWeight: 600 }}>
                          {isUrgent && (
                            <span style={{ color: "#c2410c", fontWeight: "bold", marginRight: "4px" }}>
                              [⚡ ภัยพิบัติ 2569]
                            </span>
                          )}
                          {item.taskName}
                        </td>
                        <td style={{ padding: cellPad, textAlign: "center" }}>{item.accumulatedPercent !== null ? `${item.accumulatedPercent}%` : "-"}</td>
                        <td style={{ padding: cellPad, textAlign: "center", color: "#6B2169", fontWeight: "bold" }}>{item.targetPercent !== null ? `${item.targetPercent}%` : "-"}</td>
                        <td style={{ padding: cellPad, textAlign: "center", fontWeight: "bold", color: ratio >= 100 ? "#059669" : "#b45309" }}>{ratio}%</td>
                        <td style={{ padding: cellPad, color: "#64748b" }}>{item.remarks || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Highlights & Challenges */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
            <div style={{ flex: 1, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "5px 8px" }}>
              <div style={{ fontWeight: "bold", color: "#166534", fontSize: "10px", marginBottom: "2px" }}>
                ✓ ผลงานสำคัญและความสำเร็จ
              </div>
              <ul style={{ margin: 0, paddingLeft: "14px", color: "#1e293b", fontSize: "9px", lineHeight: "1.25" }}>
                {member.highlights.slice(0, 3).map((h, i) => (
                  <li key={i} style={{ marginBottom: "1px" }}>{h}</li>
                ))}
              </ul>
            </div>

            <div style={{ flex: 1, backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "5px 8px" }}>
              <div style={{ fontWeight: "bold", color: "#92400e", fontSize: "10px", marginBottom: "2px" }}>
                ⚠ ประเด็นเร่งรัดและข้อจำกัดหน้างาน
              </div>
              <ul style={{ margin: 0, paddingLeft: "14px", color: "#1e293b", fontSize: "9px", lineHeight: "1.25" }}>
                {member.challenges.slice(0, 2).map((c, i) => (
                  <li key={i} style={{ marginBottom: "1px" }}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "4px", borderTop: "1px dashed #cbd5e1" }}>
            <div style={{ textAlign: "center", width: "200px" }}>
              <div style={{ marginBottom: "16px", fontSize: "9px", color: "#64748b" }}>
                ลงชื่อ........................................................
              </div>
              <div style={{ fontWeight: "bold", fontSize: "10px", color: "#0f172a" }}>
                ({member.fullName})
              </div>
              <div style={{ fontSize: "8.5px", color: "#64748b" }}>ผู้รับผิดชอบงาน / ผู้รายงาน</div>
            </div>

            <div style={{ textAlign: "center", width: "200px" }}>
              <div style={{ marginBottom: "16px", fontSize: "9px", color: "#64748b" }}>
                ลงชื่อ........................................................
              </div>
              <div style={{ fontWeight: "bold", fontSize: "10px", color: "#0f172a" }}>
                ({member.id === "pisan" ? "........................................................" : "นายพิสันติ์ จิตต์ปลื้ม"})
              </div>
              <div style={{ fontSize: "8.5px", color: "#64748b" }}>
                {member.id === "pisan" ? "ผู้บังคับบัญชา / ผจก.กฟก.3" : "หัวหน้าแผนกก่อสร้างระบบไฟฟ้า"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal (Add/Edit Task) */}
      <TaskEditModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTaskItem}
        initialItem={editingPlanItem}
        memberName={member.fullName}
      />

      {/* Presentation Content Modal (Edit Profile, Disaster Mission, Highlights, Challenges, Notes) */}
      <EditPresentationModal
        isOpen={isPresentationModalOpen}
        onClose={() => setIsPresentationModalOpen(false)}
        member={member}
        allMembers={allMembers}
        onSelectMember={onSelectMember}
        onSave={handleSavePresentationDetails}
      />
    </div>
  );
}
