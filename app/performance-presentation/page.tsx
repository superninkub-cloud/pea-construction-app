"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";
import { TEAM_MEMBERS_DATA } from "./performanceData";
import { TeamMemberPerformance } from "./types";
import DepartmentOverview from "./components/DepartmentOverview";
import IndividualScorecard from "./components/IndividualScorecard";
import ExecutivePresentationDeck from "./components/ExecutivePresentationDeck";
import TopBar from "../components/TopBar";
import {
  Presentation,
  Award,
  Users,
  Layers,
  Sparkles,
  Printer,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Home,
  Save,
  RotateCcw
} from "lucide-react";

export default function PerformancePresentationPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMemberPerformance[]>(TEAM_MEMBERS_DATA);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [deckInitialSlide, setDeckInitialSlide] = useState(0);
  const [yearFilter, setYearFilter] = useState<string>("2569");
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch DB Projects
      const { data: projData, error: projError } = await supabase
        .from("projects")
        .select("*")
        .order("open_year", { ascending: false });

      if (!projError && projData) {
        setProjects(projData);

        // Check if there is customized performance data in DB
        const savedRecord = projData.find(
          (p) => p.wbs === "PERFORMANCE_PRESENTATION_2569"
        );
        if (savedRecord && savedRecord.remarks && savedRecord.remarks.startsWith("[")) {
          try {
            const parsed = JSON.parse(savedRecord.remarks);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const synced = TEAM_MEMBERS_DATA.map((def) => {
                const found = parsed.find((m: TeamMemberPerformance) => m.id === def.id);
                if (!found) return def;

                // Merge plan items to ensure disaster & fleet tasks are present
                const existingPlan = found.planItems || [];
                const urgentItems = (def.planItems || []).filter((it) => it.category === "urgent");
                const mergedPlan = [...existingPlan];
                urgentItems.forEach((uItem) => {
                  if (!mergedPlan.some((p) => p.id === uItem.id || p.category === "urgent")) {
                    mergedPlan.unshift(uItem);
                  }
                });

                return {
                  ...found,
                  fullName: def.fullName,
                  title: def.title,
                  position: def.position,
                  teamName: def.teamName,
                  teamType: def.teamType,
                  highlights: def.highlights,
                  disasterMission: def.disasterMission,
                  planItems: mergedPlan,
                  executiveNotes: found.executiveNotes || def.executiveNotes
                };
              });
              setMembers(synced);
              try {
                localStorage.setItem("pea_perf_pres_2569", JSON.stringify(synced));
              } catch (e) {}
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Could not parse saved performance data", e);
          }
        }
      }

      // 2. Check localStorage fallback
      try {
        const local = localStorage.getItem("pea_perf_pres_2569");
        if (local) {
          const parsedLocal = JSON.parse(local);
          if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
            const synced = TEAM_MEMBERS_DATA.map((def) => {
              const found = parsedLocal.find((m: TeamMemberPerformance) => m.id === def.id);
              if (!found) return def;

              const existingPlan = found.planItems || [];
              const urgentItems = (def.planItems || []).filter((it) => it.category === "urgent");
              const mergedPlan = [...existingPlan];
              urgentItems.forEach((uItem) => {
                if (!mergedPlan.some((p) => p.id === uItem.id || p.category === "urgent")) {
                  mergedPlan.unshift(uItem);
                }
              });

              return {
                ...found,
                fullName: def.fullName,
                title: def.title,
                position: def.position,
                teamName: def.teamName,
                teamType: def.teamType,
                highlights: def.highlights,
                disasterMission: def.disasterMission,
                planItems: mergedPlan,
                executiveNotes: found.executiveNotes || def.executiveNotes
              };
            });
            setMembers(synced);
            try {
              localStorage.setItem("pea_perf_pres_2569", JSON.stringify(synced));
            } catch (e) {}
            setLoading(false);
            return;
          }
        }
      } catch (e) {}

      // 3. Fallback to default
      setMembers(TEAM_MEMBERS_DATA);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Save updated member to state, localStorage, and Supabase
  const handleUpdateMember = async (updatedMember: TeamMemberPerformance) => {
    const newMembers = members.map((m) =>
      m.id === updatedMember.id ? updatedMember : m
    );
    setMembers(newMembers);

    // Save locally
    try {
      localStorage.setItem("pea_perf_pres_2569", JSON.stringify(newMembers));
    } catch (e) {}

    // Save to Supabase in background
    try {
      await supabase
        .from("projects")
        .update({
          remarks: JSON.stringify(newMembers),
          updated_at: new Date().toISOString()
        })
        .eq("wbs", "PERFORMANCE_PRESENTATION_2569");
    } catch (e) {
      console.warn("Supabase update error:", e);
    }

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  // Reset to original document defaults
  const handleResetDefaults = () => {
    if (confirm("ต้องการรีเซ็ตข้อมูลผลงานและแผนงานกลับเป็นค่าเริ่มต้นจากเอกสารหรือไม่?")) {
      setMembers(TEAM_MEMBERS_DATA);
      try {
        localStorage.removeItem("pea_perf_pres_2569");
        supabase
          .from("projects")
          .update({
            remarks: JSON.stringify(TEAM_MEMBERS_DATA),
            updated_at: new Date().toISOString()
          })
          .eq("wbs", "PERFORMANCE_PRESENTATION_2569");
      } catch (e) {}
    }
  };

  const handleOpenDeck = (startSlideIndex: number = 0) => {
    setDeckInitialSlide(startSlideIndex);
    setIsDeckOpen(true);
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  // Quick helper for member badge progress
  const getMemberAvgProgress = (m: TeamMemberPerformance) => {
    let sum = 0;
    let count = 0;
    m.planItems.forEach((it) => {
      const acc = it.accumulatedPercent ?? 0;
      const tgt = it.targetPercent ?? 100;
      if (tgt > 0) {
        sum += Math.min(100, (acc / tgt) * 100);
        count++;
      }
    });
    return count > 0 ? Math.round(sum / count) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/80 via-slate-50 to-indigo-50/20 flex flex-col font-sans">
      <TopBar title="โปรแกรมนำเสนอผลการปฏิบัติงาน ผกร." />

      <main className="flex-1 p-3 md:p-6 max-w-7xl mx-auto w-full space-y-4">
        {/* =========================================================================
            EXECUTIVE DOCK: ULTRA-MODERN GLASS DOCK (ROUNDED-3XL)
            ========================================================================= */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-3.5 border border-purple-100/80 shadow-[0_10px_35px_rgba(79,70,229,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Left: View Mode Switches */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedMemberId(null)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all duration-200 focus:outline-none focus:ring-0 active:scale-95 ${
                selectedMemberId === null
                  ? "bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white shadow-lg shadow-purple-950/25 scale-[1.02]"
                  : "bg-slate-100/90 hover:bg-purple-50 text-slate-700 hover:text-purple-950 hover:border-purple-200 border border-transparent"
              }`}
            >
              <Award size={15} className={selectedMemberId === null ? "text-amber-400" : "text-slate-500"} />
              <span>🏛️ ภาพรวมแผนก ผกร.</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenDeck(0)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-400/30 hover:shadow-xl hover:shadow-amber-400/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-0"
            >
              <Presentation size={15} className="text-purple-950" />
              <span>✨ โหมดสไลด์นำเสนอผู้บริหาร (Deck)</span>
            </button>

            {saveToast && (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-3.5 py-2 rounded-2xl shadow-sm animate-fadeIn">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>บันทึกการแก้ไขข้อมูลผลงานเรียบร้อยแล้ว</span>
              </span>
            )}
          </div>

          {/* Right: Year Filters & Tools */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            {/* Year selector capsule */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
              <span className="text-slate-500 font-bold px-2 text-[11px]">ปีโครงการ:</span>
              <button
                type="button"
                onClick={() => setYearFilter("2569")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all focus:outline-none focus:ring-0 ${
                  yearFilter === "2569"
                    ? "bg-gradient-to-r from-purple-800 to-indigo-800 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ปี 2569
              </button>
              <button
                type="button"
                onClick={() => setYearFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all focus:outline-none focus:ring-0 ${
                  yearFilter === "ALL"
                    ? "bg-gradient-to-r from-purple-800 to-indigo-800 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ทุกปี
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-2xl text-[11px] font-medium flex items-center gap-1.5 transition-all border border-slate-200/70 hover:border-purple-200 focus:outline-none focus:ring-0 active:scale-95"
              title="รีเซ็ตตารางผลงานกลับเป็นค่าเริ่มต้นตามเอกสาร"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">รีเซ็ตเริ่มต้น</span>
            </button>

            <button
              type="button"
              onClick={fetchInitialData}
              className="p-2 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-2xl transition-all border border-slate-200/70 hover:border-purple-200 focus:outline-none focus:ring-0 active:scale-95"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* =========================================================================
            9-MEMBER CAPSULE BAR (SMART LIVE PROGRESS TAGS & SOFT CURVES)
            ========================================================================= */}
        <div className="bg-white/85 backdrop-blur-xl p-3 rounded-3xl border border-purple-100/80 shadow-[0_8px_30px_rgba(79,70,229,0.04)] overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max text-xs">
            <span className="font-extrabold text-slate-600 flex items-center gap-1.5 mr-1 text-[11px] px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60 rounded-2xl shadow-sm">
              <Users size={14} className="text-purple-700" />
              <span>ผู้รับผิดชอบ 9 ท่าน:</span>
            </span>

            {members.map((m) => {
              const isSelected = selectedMemberId === m.id;
              const avg = getMemberAvgProgress(m);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 border focus:outline-none focus:ring-0 active:scale-95 ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white border-purple-800 shadow-lg shadow-purple-950/30 scale-[1.03]"
                      : "bg-white/90 text-slate-700 border-slate-200/80 hover:bg-purple-50/80 hover:border-purple-300 hover:text-purple-950 shadow-sm hover:shadow"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 transition-transform ${
                      isSelected
                        ? "bg-amber-400 text-purple-950 shadow-md scale-110"
                        : "bg-purple-100 text-purple-900"
                    }`}
                  >
                    {m.order}
                  </span>
                  <span>{m.shortName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? "bg-white/20 text-amber-300 border border-white/25"
                        : avg >= 90
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {avg}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
            <RefreshCw size={32} className="animate-spin text-purple-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">กำลังโหลดข้อมูล...</h3>
          </div>
        ) : (
          <>
            {selectedMemberId === null ? (
              <DepartmentOverview
                members={members}
                projects={projects}
                onSelectMember={(memberId) => setSelectedMemberId(memberId)}
                onOpenDeck={handleOpenDeck}
                yearFilter={yearFilter}
                onUpdateMember={handleUpdateMember}
              />
            ) : (
              selectedMember && (
                <IndividualScorecard
                  member={selectedMember}
                  allMembers={members}
                  projects={projects}
                  onSelectMember={(memberId) => setSelectedMemberId(memberId)}
                  onBackToOverview={() => setSelectedMemberId(null)}
                  onOpenDeckForMember={(slideIndex) => handleOpenDeck(slideIndex)}
                  onUpdateMember={handleUpdateMember}
                />
              )
            )}
          </>
        )}
      </main>

      {/* Fullscreen Presentation Deck Modal */}
      {isDeckOpen && (
        <ExecutivePresentationDeck
          members={members}
          projects={projects}
          initialSlide={deckInitialSlide}
          onClose={() => setIsDeckOpen(false)}
        />
      )}
    </div>
  );
}
