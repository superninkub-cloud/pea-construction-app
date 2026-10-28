"use client";

import React, { useState, useMemo } from "react";
import { TeamMemberPerformance } from "../types";
import { Project } from "../../../lib/types";
import { exportMemberToCSV } from "../utils/exportUtils";
import { DEPARTMENT_FLAGSHIP_2569 } from "../performanceData";
import EditPresentationModal from "./EditPresentationModal";
import {
  TrendingUp,
  CheckCircle2,
  Layers,
  ChevronRight,
  Sparkles,
  Coins,
  UserCheck,
  Download,
  FileSpreadsheet,
  Brain,
  Zap,
  ShieldCheck,
  Truck,
  AlertTriangle,
  Flame,
  ShieldAlert,
  MapPin,
  Activity,
  Edit3
} from "lucide-react";

interface DepartmentOverviewProps {
  members: TeamMemberPerformance[];
  projects: Project[];
  onSelectMember: (memberId: string) => void;
  onOpenDeck: (startSlideIndex?: number) => void;
  yearFilter: string;
  onUpdateMember?: (updatedMember: TeamMemberPerformance) => void;
}

export default function DepartmentOverview({
  members,
  projects,
  onSelectMember,
  onOpenDeck,
  yearFilter,
  onUpdateMember
}: DepartmentOverviewProps) {
  const [editingMember, setEditingMember] = useState<TeamMemberPerformance | null>(null);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalPlanItems = 0;
    let completedPlanItems = 0;
    let totalPlanProgress = 0;
    let ratedPlanItems = 0;

    members.forEach((m) => {
      m.planItems.forEach((item) => {
        totalPlanItems++;
        const acc = item.accumulatedPercent ?? 0;
        const target = item.targetPercent ?? 100;
        if (target > 0) {
          totalPlanProgress += Math.min(100, (acc / target) * 100);
          ratedPlanItems++;
        }
        if (acc >= target && target > 0) {
          completedPlanItems++;
        }
      });
    });

    const avgAchievement = ratedPlanItems > 0 ? Math.round(totalPlanProgress / ratedPlanItems) : 0;

    // Filter projects based on year
    const validProjects = projects.filter((p) => {
      if (yearFilter === "2569") return p.open_year === "2569";
      if (yearFilter === "2568") return p.open_year === "2568";
      return true;
    });

    const totalBudget = validProjects.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
    const f4Projects = validProjects.filter((p) => p.status === "F4").length;
    const d1Projects = validProjects.filter((p) => p.status === "D1").length;
    const otherProjects = validProjects.length - f4Projects - d1Projects;

    return {
      totalPlanItems,
      completedPlanItems,
      avgAchievement,
      totalProjects: validProjects.length,
      totalBudget,
      f4Projects,
      d1Projects,
      otherProjects
    };
  }, [members, projects, yearFilter]);

  // Chart data: Achievement by member
  const memberComparisonData = useMemo(() => {
    return members.map((m) => {
      let sumRatio = 0;
      let count = 0;
      m.planItems.forEach((item) => {
        const acc = item.accumulatedPercent ?? 0;
        const tgt = item.targetPercent ?? 100;
        if (tgt > 0) {
          sumRatio += Math.min(100, Math.round((acc / tgt) * 100));
          count++;
        }
      });
      const avg = count > 0 ? Math.round(sumRatio / count) : 0;

      const supProjects = projects.filter((p) => p.supervisor && p.supervisor.includes(m.shortName));
      const supBudget = supProjects.reduce((acc, p) => acc + (Number(p.value) || 0), 0) / 1000000;

      return {
        name: m.shortName,
        fullName: m.fullName,
        achievement: avg,
        target: 100,
        planCount: m.planItems.length,
        projectCount: supProjects.length,
        budgetMillions: Math.round(supBudget * 10) / 10,
        id: m.id,
        order: m.order,
        memberObj: m
      };
    });
  }, [members, projects]);

  // Export all members summary to CSV
  const handleExportAllToCSV = () => {
    const headers = [
      "ลำดับ",
      "ชื่อ-สกุล",
      "ตำแหน่ง/ทีม",
      "จำนวนแผนงานเป้าหมาย",
      "อัตราความสำเร็จตามแผน (%)",
      "จำนวนโครงการในระบบ",
      "งบประมาณรวม (บาท)"
    ];

    const rows = memberComparisonData.map((m) => {
      const supProjects = projects.filter((p) => p.supervisor && p.supervisor.includes(m.name));
      const totalVal = supProjects.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
      return [
        m.order,
        `"${m.fullName}"`,
        `"${m.memberObj.teamName}"`,
        m.planCount,
        `${m.achievement}%`,
        m.projectCount,
        totalVal.toFixed(2)
      ].join(",");
    });

    const csvContent =
      "\uFEFF" +
      [
        `"รายงานสรุปผลการปฏิบัติงานภาพรวม ผกร. ไตรมาส 3/2569"`,
        `"วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}"`,
        "",
        headers.join(","),
        ...rows
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `สรุปภาพรวมผลงาน_ผกร_2569.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* =========================================================================
          EXECUTIVE HERO BANNER (ROUNDED-[32PX] ROYAL PEA GRADIENT)
          ========================================================================= */}
      <div
        className="rounded-[32px] p-6 text-white shadow-2xl relative overflow-hidden border border-purple-400/30"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(168, 85, 247, 0.25) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.2) 0%, transparent 60%), linear-gradient(135deg, #130b2b 0%, #240e4f 50%, #0d061c 100%)"
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/25 text-amber-300 border border-amber-400/40 shadow-sm">
                ไตรมาส 3 ปี 2569
              </span>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ผกร. เขต 3 (นครปฐม)
              </span>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-purple-200 border border-white/15">
                9 ผู้รับผิดชอบ • 53 แผนงาน
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              การนำเสนอผลการปฏิบัติงาน ผกร. (ภาพรวมทีม 2569)
            </h1>
            <p className="text-purple-200/90 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา ฝ่ายวิศวกรรมและบริการ
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportAllToCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 bg-white/95 hover:bg-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              title="ส่งออกรายงานสรุปภาพรวมทั้ง 9 ท่านเป็น Excel CSV"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              <span>Export ภาพรวม (CSV)</span>
            </button>

            <button
              onClick={() => onOpenDeck(0)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-400/30 hover:shadow-xl hover:shadow-amber-400/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <Sparkles size={15} className="text-purple-950" />
              <span>โหมดสไลด์นำเสนอผู้บริหาร</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          🤖 AI DEPARTMENT OVERVIEW EXECUTIVE COPILOT BAR (ระบบประเมินผลภาพรวมอัจฉริยะ)
          ========================================================================= */}
      <div className="rounded-[28px] p-5 border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/30 shadow-[0_10px_30px_rgba(99,102,241,0.04)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-800 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Brain size={20} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm md:text-base text-slate-900 tracking-tight">
                  บทวิเคราะห์อัจฉริยะภาพรวมแผนก ผกร. (Executive AI Briefing)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ทีมระดับดีเยี่ยม (Grade A)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ประมวลผลบูรณาการจาก 53 แผนงานเป้าหมาย และ {stats.totalProjects} โครงการในระบบ SAP
              </p>
            </div>
          </div>
        </div>

        {/* 3 AI Quick Takeaways */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-indigo-100 shadow-sm flex items-start gap-2.5">
            <Zap size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900">อัตราความสำเร็จตามแผนสูงถึง {stats.avgAchievement}%</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                บรรลุเป้าหมายแล้ว {stats.completedPlanItems} จาก {stats.totalPlanItems} งาน ดำเนินการต่อเนื่องตามวงรอบไตรมาส 3
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-100 shadow-sm flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-emerald-950">ผลงานปิดงาน (F4) บรรลุ {stats.f4Projects} โครงการ</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                คิดเป็น {stats.totalProjects > 0 ? Math.round((stats.f4Projects / stats.totalProjects) * 100) : 0}% ของโครงการทั้งหมด ส่งมอบทรัพย์สินเข้าสู่ระบบบัญชีเรียบร้อย
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-amber-100 shadow-sm flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-amber-950">การควบคุมความเสี่ยงเชิงรุก</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                กำหนดแผนคู่ขนานสำหรับงานติดสะพานและเร่งลงนามสัญญาจ้าง ผรม. เพื่อส่งมอบงานได้ 100% ภายในปี 2569
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4 SOFT FLOATING METRIC CARDS (ROUNDED-3XL)
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 border border-purple-100/80 shadow-[0_8px_30px_rgba(79,70,229,0.03)] hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ความสำเร็จเฉลี่ยทั้งทีม</span>
            <div className="w-8 h-8 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-sm">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-purple-900">{stats.avgAchievement}%</span>
            <span className="text-xs text-emerald-600 font-bold">ไตรมาส 3</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-emerald-500"
              style={{ width: `${Math.min(100, stats.avgAchievement)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[10.5px] text-slate-500 flex justify-between font-medium">
            <span>บรรลุแล้ว {stats.completedPlanItems} รายการ</span>
            <span>ทั้งหมด {stats.totalPlanItems} งาน</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 border border-purple-100/80 shadow-[0_8px_30px_rgba(79,70,229,0.03)] hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">งบประมาณรวมในระบบ</span>
            <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-sm">
              <Coins size={16} />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-3xl font-black text-amber-900">
              {(stats.totalBudget / 1000000).toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-600">ล้านบาท</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            โครงการทั้งหมด: <strong className="text-slate-900">{stats.totalProjects} โครงการ</strong>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 border border-purple-100/80 shadow-[0_8px_30px_rgba(79,70,229,0.03)] hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ปิดงานแล้วเสร็จ (F4)</span>
            <div className="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-3xl font-black text-emerald-700">{stats.f4Projects}</span>
            <span className="text-xs text-slate-500 font-semibold">โครงการ</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            อัตราปิดงาน:{" "}
            <strong className="text-emerald-700 font-bold">
              {stats.totalProjects > 0 ? Math.round((stats.f4Projects / stats.totalProjects) * 100) : 0}%
            </strong>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 border border-purple-100/80 shadow-[0_8px_30px_rgba(79,70,229,0.03)] hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">อยู่ระหว่างก่อสร้าง (D1)</span>
            <div className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-sm">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-3xl font-black text-blue-800">{stats.d1Projects}</span>
            <span className="text-xs text-slate-500 font-semibold">โครงการ</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            เตรียมการ / อื่นๆ: <strong className="text-slate-800">{stats.otherProjects} โครงการ</strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          🌟 ภารกิจกอบกู้ภัยพิบัติฉุกเฉิน และกองยานยนต์ขนเสา ประจำปี 2569 (DEPARTMENT FLAGSHIP)
          ========================================================================= */}
      <div className="rounded-[32px] p-5 md:p-6 border border-rose-200/80 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 shadow-[0_12px_40px_rgba(225,29,72,0.06)] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 shrink-0 mt-1 sm:mt-0">
              <Truck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                  ผลงานเด่นระดับแผนก ประจำปี 2569
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  ⚡ รับมือเหตุการณ์หนักเกือบทุกเดือน
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  🛡️ ปลอดภัย Zero Accident 100%
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                {DEPARTMENT_FLAGSHIP_2569.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {DEPARTMENT_FLAGSHIP_2569.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => onOpenDeck(1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-md shadow-rose-600/20 hover:shadow-lg transition-all active:scale-95 focus:outline-none focus:ring-0"
            >
              <Sparkles size={14} />
              <span>เปิดสไลด์วาระภัยพิบัติ</span>
            </button>
          </div>
        </div>

        {/* 3 Severe Disaster Incidents Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {DEPARTMENT_FLAGSHIP_2569.severeIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-rose-100/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${incident.badgeColor}`}>
                    {incident.severityLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <MapPin size={12} className="text-rose-600" />
                    <span>จ.{incident.province}</span>
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {incident.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {incident.description}
                </p>

                <div className="space-y-1 pt-1.5 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-800">การระดมพลและแก้ไข:</div>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                    {incident.operations.map((op, idx) => (
                      <li key={idx} className="leading-tight">{op}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100/90 flex flex-col gap-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span>ผู้รับผิดชอบหลัก:</span>
                  <strong className="text-purple-950 font-bold">{incident.assignedLead}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                  <span className="line-clamp-1">{incident.outcome}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pole Transport Fleet Box */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-4 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Truck size={20} />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-amber-300">
                {DEPARTMENT_FLAGSHIP_2569.poleLogistics.title}
              </h4>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {DEPARTMENT_FLAGSHIP_2569.poleLogistics.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto shrink-0 text-center text-xs">
            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
              <div className="text-[10px] text-slate-300">ภารกิจฉุกเฉิน</div>
              <div className="font-black text-amber-300 text-sm">24 ชม.</div>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
              <div className="text-[10px] text-slate-300">เสาคอนกรีต</div>
              <div className="font-black text-white text-sm">8-14 ม.</div>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
              <div className="text-[10px] text-slate-300">พื้นที่รับผิดชอบ</div>
              <div className="font-black text-emerald-300 text-sm">ทั่ว กฟก.3</div>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
              <div className="text-[10px] text-slate-300">สถิติอุบัติเหตุ</div>
              <div className="font-black text-emerald-300 text-sm">0 ครั้ง</div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-purple-100/80 shadow-[0_10px_35px_rgba(79,70,229,0.04)] overflow-hidden p-3.5">
        <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck size={17} className="text-purple-700" />
              <span>ตารางสรุปผลการปฏิบัติงานรายบุคคล 9 ท่าน (คลิกเพื่อดูหรือส่งออกผลงาน)</span>
            </h3>
          </div>
          <span className="text-xs text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            9 ผู้รับผิดชอบ • 53 แผนงาน
          </span>
        </div>

        <div className="overflow-x-auto text-xs mt-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] rounded-2xl">
                <th className="py-3 px-3.5 w-10 text-center rounded-l-2xl">#</th>
                <th className="py-3 px-3.5 min-w-[200px]">ผู้รับผิดชอบ</th>
                <th className="py-3 px-3.5 min-w-[190px]">บทบาท / ตำแหน่งหน้าที่</th>
                <th className="py-3 px-3.5 w-36 text-center">ความก้าวหน้า</th>
                <th className="py-3 px-3.5 w-24 text-center">แผนงาน</th>
                <th className="py-3 px-3.5 w-24 text-center">ในระบบ</th>
                <th className="py-3 px-3.5 w-32 text-right">งบประมาณ</th>
                <th className="py-3 px-3.5 w-40 text-center rounded-r-2xl">จัดการ / ส่งออก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {memberComparisonData.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-purple-50/50 transition-all duration-200 group rounded-2xl"
                >
                  <td className="py-3 px-3.5 text-center font-bold text-slate-400">
                    <span className="w-7 h-7 rounded-2xl bg-purple-50 group-hover:bg-purple-200 text-purple-900 flex items-center justify-center font-black mx-auto transition-colors">
                      {m.order}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <button
                      type="button"
                      onClick={() => onSelectMember(m.id)}
                      className="group/name inline-flex items-center gap-2 px-3 py-1.5 -ml-1 rounded-2xl font-black text-slate-900 group-hover:text-purple-950 bg-slate-50/80 group-hover:bg-purple-100/90 border border-slate-200/80 group-hover:border-purple-300 shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-0 text-xs md:text-sm text-left active:scale-95"
                    >
                      <span>{m.fullName}</span>
                      <ChevronRight size={13} className="text-purple-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                    <div className="text-[11px] text-slate-500 pl-2 mt-0.5 font-medium flex items-center gap-1.5">
                      <span>{m.memberObj.title}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">ชื่อเล่น: {m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border shadow-xs ${
                        m.id === "pisan"
                          ? "bg-gradient-to-r from-purple-100 via-amber-50 to-amber-100 text-purple-950 border-amber-300 shadow-sm"
                          : m.id === "chanin"
                          ? "bg-indigo-50 text-indigo-950 border-indigo-200 shadow-sm"
                          : m.id === "kittipich" || m.id === "narubet"
                          ? "bg-teal-50 text-teal-900 border-teal-200 shadow-sm"
                          : "bg-slate-100 text-slate-800 border-slate-200/80"
                      }`}
                    >
                      {m.memberObj.teamName}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            m.achievement >= 80
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                              : m.achievement >= 60
                              ? "bg-gradient-to-r from-purple-600 to-indigo-500"
                              : "bg-gradient-to-r from-amber-500 to-yellow-400"
                          }`}
                          style={{ width: `${m.achievement}%` }}
                        />
                      </div>
                      <span className="font-black text-xs text-slate-800 w-9 text-right">
                        {m.achievement}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-center font-bold text-purple-900">
                    <span className="bg-purple-50 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {m.planCount} งาน
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center font-bold text-slate-700">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {m.projectCount} งาน
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-bold text-amber-900">
                    {m.budgetMillions > 0 ? `${m.budgetMillions} ลบ.` : "-"}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectMember(m.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-0"
                        title="ดูรายงานผลงานเดี่ยว"
                      >
                        <span>ดูผลงาน</span>
                        <ChevronRight size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMember(m.memberObj)}
                        className="p-1.5 rounded-full text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200 shadow-sm focus:outline-none focus:ring-0"
                        title="แก้ไขข้อมูลบุคคล/ตำแหน่ง/ภารกิจภัยพิบัติ"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => exportMemberToCSV(m.memberObj)}
                        className="p-1.5 rounded-full text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm focus:outline-none focus:ring-0"
                        title="Export CSV รายบุคคล"
                      >
                        <FileSpreadsheet size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit Presentation Modal from Department Table */}
      {editingMember && (
        <EditPresentationModal
          isOpen={true}
          onClose={() => setEditingMember(null)}
          member={editingMember}
          allMembers={members}
          onSelectMember={(id) => {
            const found = members.find((m) => m.id === id);
            if (found) setEditingMember(found);
          }}
          onSave={(updated) => {
            if (onUpdateMember) {
              onUpdateMember(updated);
            }
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}
