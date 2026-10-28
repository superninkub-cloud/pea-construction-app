"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TeamMemberPerformance } from "../types";
import { Project } from "../../../lib/types";
import { matchProjectsToMember, findConnectedProjectsForPlanItem, DEPARTMENT_FLAGSHIP_2569 } from "../performanceData";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Award,
  TrendingUp,
  Layers,
  CheckCircle2,
  Sparkles,
  Printer,
  Calendar,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Link2,
  Truck,
  MapPin,
  Clock
} from "lucide-react";

interface ExecutivePresentationDeckProps {
  members: TeamMemberPerformance[];
  projects: Project[];
  initialSlide?: number;
  onClose: () => void;
}

export default function ExecutivePresentationDeck({
  members,
  projects,
  initialSlide = 0,
  onClose
}: ExecutivePresentationDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Presenter timer
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Total slides: Cover (1) + Overview (1) + 9 Members (9) + Conclusion (1) = 12 slides
  const totalSlides = 2 + members.length + 1;

  // Key navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Escape") {
        if (isFullscreen) {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    },
    [totalSlides, isFullscreen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Helper stats for overview slide
  const overviewStats = useMemo(() => {
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
    const year69Projects = projects.filter((p) => p.open_year === "2569");
    const totalBudget = projects.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
    const f4Projects = projects.filter((p) => p.status === "F4").length;
    const d1Projects = projects.filter((p) => p.status === "D1").length;

    return {
      avgAchievement,
      totalPlanItems,
      completedPlanItems,
      totalProjects: projects.length,
      year69Projects: year69Projects.length,
      totalBudget,
      f4Projects,
      d1Projects
    };
  }, [members, projects]);

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 text-white flex flex-col select-none overflow-hidden font-sans">
      {/* Presentation Top Bar */}
      <div className="h-14 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-amber-500 flex items-center justify-center font-bold text-xs text-white shadow">
            PEA
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>รายงานผลการปฏิบัติงาน ผกร. (ก3) ไตรมาส 3/2569</span>
              <span className="text-[10px] bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded-full border border-purple-700">
                สไลด์ที่ {currentSlide + 1} จาก {totalSlides}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา ฝ่ายวิศวกรรมและบริการ
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Slide Jump Dropdown */}
          <select
            value={currentSlide}
            onChange={(e) => setCurrentSlide(Number(e.target.value))}
            className="hidden md:block bg-slate-800 text-slate-200 hover:text-white text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold cursor-pointer max-w-[210px] truncate"
            title="กระโดดข้ามสไลด์"
          >
            <option value={0}>0. ปก: รายงาน ผกร. 2569</option>
            <option value={1}>1. ภารกิจกู้ภัยพิบัติ & ภาพรวม</option>
            {members.map((m, idx) => (
              <option key={m.id} value={idx + 2}>
                {idx + 2}. #{m.order} {m.shortName} ({m.fullName.replace("นาย", "").trim()})
              </option>
            ))}
            <option value={totalSlides - 1}>{totalSlides - 1}. บทสรุปและทิศทางงาน</option>
          </select>

          {/* Presenter Stopwatch Timer */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700/80 text-xs shadow-inner">
            <Clock size={13} className="text-amber-400 shrink-0" />
            <span className="font-mono font-black text-amber-300 w-11 text-center">
              {String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:{String(elapsedSeconds % 60).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setIsTimerRunning((prev) => !prev)}
              className="text-[11px] text-slate-400 hover:text-white px-1 font-bold"
              title={isTimerRunning ? "หยุดชั่วคราว" : "เริ่มจับเวลา"}
            >
              {isTimerRunning ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              onClick={() => { setElapsedSeconds(0); setIsTimerRunning(false); }}
              className="text-[11px] text-slate-400 hover:text-white px-1 font-bold"
              title="รีเซ็ตเวลา"
            >
              ↺
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1.5"
            title="พิมพ์สไลด์"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">พิมพ์</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1.5"
            title="สลับเต็มจอ (F)"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span className="hidden sm:inline">{isFullscreen ? "ย่อจอ" : "เต็มจอ"}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1.5 ml-2"
            title="ปิดหน้าต่างนำเสนอ (ESC)"
          >
            <X size={18} />
            <span className="hidden sm:inline">ออก</span>
          </button>
        </div>
      </div>

      {/* Main Slide Content Canvas */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-950 via-[#0e0c1f] to-slate-950">
        {/* SLIDE 0: COVER SLIDE */}
        {currentSlide === 0 && (
          <div className="max-w-4xl w-full text-center py-12 px-6 relative animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/50 border border-purple-500/40 text-purple-200 text-xs font-bold mb-6">
              <Sparkles size={14} className="text-amber-400" />
              <span>การไฟฟ้าส่วนภูมิภาค เขต 3 (ภาคกลาง) จังหวัดนครปฐม</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              การนำเสนอผลการปฏิบัติงาน
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-300 to-amber-200 mt-2">
                แผนกก่อสร้างระบบไฟฟ้า (ผกร.)
              </span>
            </h1>

            <p className="text-base md:text-xl text-slate-300 mt-4 max-w-2xl mx-auto font-light leading-relaxed">
              ตารางแผนงานเป้าหมาย ผู้รับผิดชอบ และความก้าวหน้าโครงการก่อสร้างระบบไฟฟ้า
              <br />
              <strong className="font-semibold text-amber-300">ประจำไตรมาส 3 ปี 2569</strong>
            </p>

            <div className="mt-8 flex justify-center">
              <div className="inline-grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="px-4 py-2 text-center">
                  <div className="text-2xl font-black text-amber-400">9</div>
                  <div className="text-xs text-slate-400">ผู้รับผิดชอบหลัก</div>
                </div>
                <div className="px-4 py-2 text-center border-l border-white/10">
                  <div className="text-2xl font-black text-purple-400">53</div>
                  <div className="text-xs text-slate-400">รายการตามแผน</div>
                </div>
                <div className="px-4 py-2 text-center border-l border-white/10">
                  <div className="text-2xl font-black text-emerald-400">{overviewStats.avgAchievement}%</div>
                  <div className="text-xs text-slate-400">ผลงานบรรลุเฉลี่ย</div>
                </div>
                <div className="px-4 py-2 text-center border-l border-white/10">
                  <div className="text-2xl font-black text-blue-400">
                    {(overviewStats.totalBudget / 1000000).toFixed(1)} ลบ.
                  </div>
                  <div className="text-xs text-slate-400">มูลค่างานรวม</div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentSlide(1)}
                className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
              >
                <span>เข้าสู่วาระการนำเสนอ</span>
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mt-12 text-xs text-slate-500">
              กองก่อสร้างระบบไฟฟ้าและงานโยธา • ฝ่ายวิศวกรรมและบริการ • การไฟฟ้าส่วนภูมิภาค
            </div>
          </div>
        )}

        {/* SLIDE 1: DEPARTMENT EXECUTIVE OVERVIEW */}
        {currentSlide === 1 && (
          <div className="max-w-5xl w-full py-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
                  วาระที่ 1: ภาพรวมผลการดำเนินงานระดับแผนก
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  สรุปความก้าวหน้า ผกร. ไตรมาส 3 ปี 2569
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/50 px-3 py-1 rounded-full">
                  ความสำเร็จเฉลี่ย {overviewStats.avgAchievement}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">รายการตามแผนงาน</div>
                <div className="text-3xl font-extrabold text-white mt-1">
                  {overviewStats.totalPlanItems}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  บรรลุ 100% แล้ว: {overviewStats.completedPlanItems} รายการ
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">งานประจำปี 2569</div>
                <div className="text-3xl font-extrabold text-amber-400 mt-1">
                  {overviewStats.year69Projects}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">โครงการในระบบปี 2569</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">ปิดงานสำเร็จ (F4)</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                  {overviewStats.f4Projects}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  คิดเป็น {Math.round((overviewStats.f4Projects / overviewStats.totalProjects) * 100)}% ของโครงการ
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">มูลค่างานรวมทั้งระบบ</div>
                <div className="text-3xl font-extrabold text-purple-400 mt-1">
                  {(overviewStats.totalBudget / 1000000).toFixed(1)}
                  <span className="text-sm font-normal text-slate-400 ml-1">ลบ.</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  โครงการทั้งหมด: {overviewStats.totalProjects} โครงการ
                </div>
              </div>
            </div>

            {/* 🌟 DEPARTMENT FLAGSHIP: DISASTER RESPONSE & POLE TRANSPORT 2569 */}
            <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/50 border border-rose-800/60 rounded-2xl p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-rose-900/50 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow">
                    <Truck size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>{DEPARTMENT_FLAGSHIP_2569.title}</span>
                      <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                        ⚡ รับมือเหตุหนักเกือบทุกเดือน
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        Zero Accident 100%
                      </span>
                    </h3>
                  </div>
                </div>
                <span className="text-[11px] text-rose-300 font-medium">ระดมพล 5 ชุดงาน & ยานยนต์หนัก 24 ชม.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {DEPARTMENT_FLAGSHIP_2569.severeIncidents.map((incident) => (
                  <div key={incident.id} className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-rose-400">{incident.severityLabel}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin size={10} className="text-rose-400" />
                          <span>จ.{incident.province}</span>
                        </span>
                      </div>
                      <div className="font-bold text-white text-xs leading-snug">{incident.title}</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">{incident.description}</p>
                    </div>
                    <div className="text-[10px] text-amber-300 pt-1.5 border-t border-slate-800 flex items-center justify-between">
                      <span>ทีมหลัก: {incident.assignedLead}</span>
                      <span className="text-emerald-400 font-bold">สำเร็จ 100%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 9 Members Summary Bar Matrix */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                <span>ตารางสรุปผลงาน 9 ผู้รับผิดชอบ (เปรียบเทียบผลสะสม vs เป้าหมาย)</span>
                <span className="text-xs text-slate-400 font-normal">
                  คลิกที่ชื่อเพื่อเปิดสไลด์ของแต่ละท่าน
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((m, idx) => {
                  let sumRatio = 0;
                  let count = 0;
                  m.planItems.forEach((it) => {
                    const acc = it.accumulatedPercent ?? 0;
                    const tgt = it.targetPercent ?? 100;
                    if (tgt > 0) {
                      sumRatio += Math.min(100, Math.round((acc / tgt) * 100));
                      count++;
                    }
                  });
                  const achievement = count > 0 ? Math.round(sumRatio / count) : 0;

                  return (
                    <div
                      key={m.id}
                      onClick={() => setCurrentSlide(idx + 2)}
                      className="p-3 rounded-xl bg-slate-800/60 hover:bg-purple-900/40 border border-slate-700/60 hover:border-purple-500/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-purple-700 text-white font-bold text-xs flex items-center justify-center">
                            {m.order}
                          </span>
                          <span className="font-bold text-xs text-white group-hover:text-amber-300">
                            {m.shortName}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            achievement >= 80
                              ? "bg-emerald-900/70 text-emerald-300"
                              : achievement >= 60
                              ? "bg-blue-900/70 text-blue-300"
                              : "bg-amber-900/70 text-amber-300"
                          }`}
                        >
                          {achievement}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            achievement >= 80
                              ? "bg-emerald-400"
                              : achievement >= 60
                              ? "bg-purple-400"
                              : "bg-amber-400"
                          }`}
                          style={{ width: `${achievement}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                        <span>{m.planItems.length} แผนงาน</span>
                        <span className="text-slate-300 line-clamp-1">{m.teamName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SLIDES 2 to 10: INDIVIDUAL SLIDES */}
        {currentSlide >= 2 && currentSlide <= 10 && (
          (() => {
            const memberIndex = currentSlide - 2;
            const member = members[memberIndex];
            if (!member) return null;

            const memberProjects = matchProjectsToMember(member, projects);
            const totalBudget = memberProjects.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
            const f4Count = memberProjects.filter((p) => p.status === "F4").length;
            const d1Count = memberProjects.filter((p) => p.status === "D1").length;

            let sumRatio = 0;
            let count = 0;
            let completedCount = 0;
            member.planItems.forEach((it) => {
              const acc = it.accumulatedPercent ?? 0;
              const tgt = it.targetPercent ?? 100;
              if (tgt > 0) {
                sumRatio += Math.min(100, Math.round((acc / tgt) * 100));
                count++;
              }
              if (acc >= tgt && tgt > 0) completedCount++;
            });
            const avgAchievement = count > 0 ? Math.round(sumRatio / count) : 0;

            return (
              <div className="max-w-5xl w-full py-2 animate-fadeIn space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-purple-950 font-black text-xl flex items-center justify-center shrink-0 shadow">
                      {member.order}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400">
                          ผู้รับผิดชอบลำดับที่ {member.order} • {member.teamName}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">{member.fullName}</h2>
                      <p className="text-xs text-slate-300">{member.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-right">
                      <div className="text-[10px] text-slate-400 uppercase">ผลงานตามแผนสะสม</div>
                      <div className="text-xl font-black text-amber-400">{avgAchievement}%</div>
                    </div>
                    <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-right">
                      <div className="text-[10px] text-slate-400 uppercase">แผนงานเป้าหมาย</div>
                      <div className="text-xl font-black text-emerald-400">
                        {member.planItems.length} <span className="text-xs font-normal text-slate-400">รายการ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🌟 DISASTER & FLEET MISSION SHOWCASE ON INDIVIDUAL SLIDE */}
                {member.disasterMission && (
                  <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/60 border border-rose-500/40 rounded-2xl p-3.5 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-900/50 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow">
                          ⚡
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                              ภารกิจเด่นกู้ภัยพิบัติฉุกเฉิน & กองยานยนต์ขนเสา ประจำปี 2569
                            </span>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-rose-500/30 text-rose-200 border border-rose-400/40">
                              เกิดเหตุหนักเกือบทุกเดือน
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-amber-300">
                            {member.disasterMission.roleTitle}
                          </h4>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 self-start sm:self-auto flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>{member.disasterMission.statusBadge}</span>
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
                      <div className="md:col-span-4 bg-gradient-to-br from-amber-950/40 to-purple-950/40 p-2.5 rounded-xl border border-amber-500/30 text-[10.5px] text-slate-300 space-y-1.5 flex flex-col justify-between">
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

                {/* Plan Items Table (Image Data) */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>ตารางแผนงานเป้าหมาย ไตรมาส 3/2569 ({member.planItems.length} รายการ)</span>
                    <span className="text-[11px] text-amber-400">บรรลุแล้ว {completedCount} รายการ</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/80 text-xs">
                    {member.planItems.map((item, i) => {
                      const acc = item.accumulatedPercent ?? 0;
                      const tgt = item.targetPercent ?? 100;
                      const ratio = tgt > 0 ? Math.round((acc / tgt) * 100) : 0;
                      const connected = findConnectedProjectsForPlanItem(item, memberProjects, projects);
                      const isUrgent = item.category === "urgent";

                      return (
                        <div
                          key={item.id}
                          className={`p-3 transition-colors ${
                            isUrgent
                              ? "bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-transparent border-l-4 border-l-amber-400"
                              : "hover:bg-slate-800/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-semibold text-white flex items-center gap-2 flex-wrap">
                                <span className="text-slate-500 font-mono text-[11px]">{i + 1}.</span>
                                {isUrgent && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-sm">
                                    ⚡ ภารกิจภัยพิบัติ 2569
                                  </span>
                                )}
                                <span>{item.taskName}</span>
                              </div>
                              {item.remarks && (
                                <div className="text-[11px] text-amber-300/80 mt-1 pl-4">
                                  หมายเหตุ: {item.remarks}
                                </div>
                              )}
                              {connected.length > 0 && (
                                <div className="mt-1 pl-4 flex items-center gap-2 text-[10px] text-purple-300">
                                  <Link2 size={11} />
                                  <span>
                                    เชื่อมโยงกับโครงการ: {connected.map((c) => `${c.wbs} (${c.status})`).join(", ")}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="w-40 shrink-0 text-right">
                              <div className="flex justify-end items-center gap-2 text-xs font-bold">
                                <span className="text-slate-300">
                                  {item.accumulatedPercent !== null ? `${item.accumulatedPercent}%` : "-"}
                                </span>
                                <span className="text-slate-500">/</span>
                                <span className="text-amber-400">
                                  {item.targetPercent !== null ? `${item.targetPercent}%` : "-"}
                                </span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    ratio >= 100 ? "bg-emerald-400" : ratio >= 70 ? "bg-purple-400" : "bg-amber-400"
                                  }`}
                                  style={{ width: `${Math.min(100, ratio)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Executive Notes (if present) */}
                {member.executiveNotes && (
                  <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                    <Sparkles size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">ประเด็นนำเสนอผู้บริหาร:</strong> {member.executiveNotes}
                    </div>
                  </div>
                )}

                {/* Bottom Row: Key Highlights & Connected DB Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Highlights */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 size={14} />
                      <span>ผลงานสำคัญและจุดเด่น</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {member.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Immediate Action Items */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                      <AlertTriangle size={14} />
                      <span>ประเด็นที่ต้องเร่งรัดและข้อจำกัด</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {member.challenges.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {/* SLIDE 11: CONCLUSION & ACTION PLAN */}
        {currentSlide === 11 && (
          <div className="max-w-4xl w-full text-center py-8 animate-fadeIn">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              วาระสุดท้าย: ทิศทางการขับเคลื่อนและข้อเสนอแนะ
            </span>
            <h2 className="text-3xl font-black text-white mt-2">
              แผนเร่งรัดและการขับเคลื่อนสู่ความสำเร็จ ผกร.
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl mx-auto">
              ข้อเสนอแนะและมาตรการในการปฏิบัติงานสำหรับไตรมาสถัดไปเพื่อบรรลุเป้าหมายองค์กร 100%
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-purple-900/60 text-purple-300 flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h3 className="font-bold text-white text-sm">เร่งรัดงานปิดโครงการ (F4 & TECO)</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  บูรณาการงานเอกสารระหว่างชุดงานภาคสนามและวิศวกรประสานงาน (นายกิตติพิชญ์, นายนฤเบศ)
                  เพื่อให้ส่งมอบงานและปรับปรุงบัญชีทรัพย์สินได้ตามกำหนด
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-900/60 text-amber-300 flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h3 className="font-bold text-white text-sm">ปลดล็อคพื้นที่ข้อจำกัด</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  ประสานกรมทางหลวงและหน่วยงานภายนอกในจุดก่อสร้างสะพาน (คลองท่าแร้ง) และแนวถนนพระราม 2
                  เพื่อเร่งเข้าดำเนินงานย้ายแนวสายส่ง 115 kV ได้ทันที
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h3 className="font-bold text-white text-sm">ขับเคลื่อนงานลงทุนปี 2569</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  เร่งรัดการเบิกจ่ายงบลงทุนของโครงการปี 2569 (เช่น สถานีอัดประจุ สฟฟ.นครปฐม 3,
                  งานรองรับ สฟฟ.บางเลน 3 ชั่วคราว) ให้เป็นไปตามไทม์ไลน์
                </p>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-xs"
              >
                จบการนำเสนอ และกลับสู่ Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide Navigation Controls & Thumbnails Bar */}
      <div className="h-16 px-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
            <span>ก่อนหน้า</span>
          </button>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
            disabled={currentSlide === totalSlides - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-700 text-xs font-semibold text-white hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow"
          >
            <span>ถัดไป</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Thumbnail Dots / Slide indicator */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-xl py-1">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === idx
                  ? "w-8 bg-amber-400"
                  : "w-2.5 bg-slate-700 hover:bg-slate-500"
              }`}
              title={`สไลด์ที่ ${idx + 1}`}
            />
          ))}
        </div>

        <div className="text-xs text-slate-400">
          สไลด์ <strong className="text-white">{currentSlide + 1}</strong> / {totalSlides}
        </div>
      </div>
    </div>
  );
}
