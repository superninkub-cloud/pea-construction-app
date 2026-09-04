"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Printer, Home, List, BarChart2, TrendingUp, Image as ImageIcon, DollarSign, Zap, Edit2, X } from 'lucide-react';

interface Project {
  id: string;
  wbs: string;
  name: string;
  contractor: string | null;
  supervisor: string | null;
  committee: string | null;
  duration: string | null;
  status: string | null;
}

export interface Task {
  id: string;
  project_wbs: string;
  task_name: string;
  start_date: string;
  end_date: string;
  progress: number;
  assignee: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
}

export default function PlanningDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedWbs, setSelectedWbs] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview"|"gantt"|"scurve"|"photos"|"budget">("overview");
  const [selectedSupervisor, setSelectedSupervisor] = useState("");

  // Project Edit states
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projContractor, setProjContractor] = useState("");
  const [projSupervisor, setProjSupervisor] = useState("");
  const [projCommittee, setProjCommittee] = useState("");
  const [projDuration, setProjDuration] = useState("");
  const [projStatus, setProjStatus] = useState("อยู่ระหว่างก่อสร้าง");

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState("");
  const [taskName, setTaskName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actualStartDate, setActualStartDate] = useState("");
  const [actualEndDate, setActualEndDate] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [assignee, setAssignee] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedWbs) {
      fetchTasks(selectedWbs);
    } else {
      setTasks([]);
    }
  }, [selectedWbs]);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("id, wbs, name, contractor, supervisor, committee, duration, status").order("wbs");
    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const fetchTasks = async (wbs: string) => {
    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_wbs", wbs)
      .order("start_date");
    if (!error && data) {
      setTasks(data);
    }
  };

  const openProjectEdit = () => {
    const p = projects.find(p => p.wbs === selectedWbs);
    if (!p) return;
    setProjContractor(p.contractor || "");
    setProjSupervisor(p.supervisor || "");
    setProjCommittee(p.committee || "");
    setProjDuration(p.duration || "");
    setProjStatus(p.status || "อยู่ระหว่างก่อสร้าง");
    setIsEditingProject(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWbs) return;
    await supabase.from("projects").update({
      contractor: projContractor,
      supervisor: projSupervisor,
      committee: projCommittee,
      duration: projDuration,
      status: projStatus
    }).eq("wbs", selectedWbs);
    setIsEditingProject(false);
    fetchProjects();
  };

  const resetForm = () => {
    setTaskName("");
    setStartDate("");
    setEndDate("");
    setActualStartDate("");
    setActualEndDate("");
    setProgress(0);
    setAssignee("");
    setIsEditing(false);
    setEditTaskId("");
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWbs) return;

    const payload = {
      project_wbs: selectedWbs,
      task_name: taskName,
      start_date: startDate,
      end_date: endDate,
      actual_start_date: actualStartDate || null,
      actual_end_date: actualEndDate || null,
      progress,
      assignee,
    };

    if (isEditing && editTaskId) {
      await supabase.from("project_tasks").update(payload).eq("id", editTaskId);
    } else {
      await supabase.from("project_tasks").insert([payload]);
    }
    fetchTasks(selectedWbs);
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setIsEditing(true);
    setEditTaskId(task.id);
    setTaskName(task.task_name);
    setStartDate(task.start_date);
    setEndDate(task.end_date);
    setActualStartDate(task.actual_start_date || "");
    setActualEndDate(task.actual_end_date || "");
    setProgress(task.progress);
    setAssignee(task.assignee || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("ยืนยันการลบงานนี้?")) {
      await supabase.from("project_tasks").delete().eq("id", id);
      fetchTasks(selectedWbs);
    }
  };

  // Gantt Chart Logic
  const getMinMaxDates = () => {
    if (tasks.length === 0) return { min: new Date(), max: new Date(), days: 0 };
    
    let allDates: number[] = [];
    tasks.forEach(t => {
      allDates.push(new Date(t.start_date).getTime());
      allDates.push(new Date(t.end_date).getTime());
      if (t.actual_start_date) allDates.push(new Date(t.actual_start_date).getTime());
      if (t.actual_end_date) allDates.push(new Date(t.actual_end_date).getTime());
    });
    
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    
    // Add padding (7 days before and after)
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);
    
    const diffTime = Math.abs(maxDate.getTime() - minDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { min: minDate, max: maxDate, days: diffDays };
  };

  const { min, days } = getMinMaxDates();

  const getLeftOffset = (dateString: string) => {
    const d = new Date(dateString);
    const diff = d.getTime() - min.getTime();
    return (diff / (1000 * 60 * 60 * 24)) / days * 100;
  };

  const getWidth = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    const w = (diff / (1000 * 60 * 60 * 24) + 1) / days * 100; 
    return w;
  };

  const generateSCurveData = () => {
    const sCurveData = [];
    if (tasks.length === 0) return [];
    
    const starts = tasks.map(t => new Date(t.start_date).getTime());
    const ends = tasks.map(t => new Date(t.end_date).getTime());
    const pMin = new Date(Math.min(...starts));
    const pMax = new Date(Math.max(...ends));
    
    tasks.forEach(t => {
      if (t.actual_end_date) {
        const aEnd = new Date(t.actual_end_date).getTime();
        if (aEnd > pMax.getTime()) pMax.setTime(aEnd);
      }
    });

    const totalWeight = tasks.reduce((acc, t) => {
      return acc + Math.max(1, new Date(t.end_date).getTime() - new Date(t.start_date).getTime());
    }, 0);

    const today = new Date().setHours(0,0,0,0);

    for (let d = new Date(pMin); d <= pMax; d.setDate(d.getDate() + 1)) {
      const dTime = d.getTime();
      let totalPlan = 0;
      let totalActual = 0;
      
      tasks.forEach(t => {
        const weight = Math.max(1, new Date(t.end_date).getTime() - new Date(t.start_date).getTime());
        
        let plan = 0;
        const pStart = new Date(t.start_date).getTime();
        const pEnd = new Date(t.end_date).getTime();
        if (dTime >= pEnd) plan = 100;
        else if (dTime > pStart) plan = ((dTime - pStart) / (pEnd - pStart)) * 100;
        totalPlan += (plan * weight);
        
        if (dTime <= today) {
          let actual = 0;
          if (t.actual_start_date) {
             const aStart = new Date(t.actual_start_date).getTime();
             if (dTime >= aStart) {
               if (t.actual_end_date) {
                  const aEnd = new Date(t.actual_end_date).getTime();
                  if (dTime >= aEnd) actual = 100;
                  else actual = ((dTime - aStart) / Math.max(1, aEnd - aStart)) * 100;
               } else {
                  actual = ((dTime - aStart) / Math.max(1, today - aStart)) * t.progress;
               }
             }
          }
          totalActual += (actual * weight);
        }
      });

      sCurveData.push({
        date: d.toISOString().split('T')[0],
        "แผนงาน (Plan) %": Number((totalPlan / totalWeight).toFixed(2)),
        "ผลงานจริง (Actual) %": dTime <= today ? Number((totalActual / totalWeight).toFixed(2)) : null
      });
    }
    return sCurveData;
  };

  const sCurveData = generateSCurveData();
  const currentProject = projects.find(p => p.wbs === selectedWbs);

  const calculateTotalWeight = () => {
    return tasks.reduce((acc, t) => acc + Math.max(1, new Date(t.end_date).getTime() - new Date(t.start_date).getTime()), 0);
  };
  const totalW = calculateTotalWeight();

  return (
    <div className="w-full text-sm text-gray-800 font-sans">
      <div className="w-full mx-auto space-y-6">
        
        {/* Cool Header */}
        {!selectedWbs && (
          <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white p-8 rounded-2xl shadow-lg border border-purple-900/50 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">วางแผนงานก่อสร้างแผนกก่อสร้างระบบไฟฟ้า</h1>
              <p className="text-purple-200 text-xs md:text-sm uppercase tracking-[0.2em] font-bold">Electrical Construction Planning System</p>
            </div>
            <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
              <Zap className="w-10 h-10 text-purple-300" />
            </div>
          </div>
        )}

        {/* Project Selector */}
        {!selectedWbs && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-xl font-extrabold text-gray-800 mb-8">เลือกระบบงานก่อสร้าง</h2>
            
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">1</span> 
                  กรองตามผู้ควบคุมงาน
                </label>
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none font-bold text-sm shadow-sm cursor-pointer hover:border-purple-300 transition-colors"
                >
                  <option value="">-- ผู้ควบคุมงานทั้งหมด --</option>
                  {Array.from(new Set(projects.map(p => p.supervisor).filter(Boolean))).map(sup => (
                    <option key={sup} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>

              <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100">
                <label className="block text-xs font-bold text-purple-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-purple-800">2</span>
                  เลือกโครงการ
                </label>
                <select
                  value={selectedWbs}
                  onChange={(e) => setSelectedWbs(e.target.value)}
                  className="w-full p-3 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none font-bold text-sm shadow-sm text-purple-900 cursor-pointer hover:border-purple-400 transition-colors"
                >
                  <option value="">-- กรุณาเลือกโครงการ --</option>
                  {projects.filter(p => !selectedSupervisor || p.supervisor === selectedSupervisor).map((p) => (
                    <option key={p.id} value={p.wbs}>{p.wbs} - {p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedWbs && (
          <>
            {/* Project Header Card */}
            {isEditingProject ? (
              <form onSubmit={handleProjectSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-800">แก้ไขรายละเอียดโครงการ</h3>
                  <button type="button" onClick={() => setIsEditingProject(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5"/></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">ผู้รับเหมา</label>
                    <input type="text" value={projContractor} onChange={e => setProjContractor(e.target.value)} className="w-full p-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">ผู้ควบคุมงาน</label>
                    <input type="text" value={projSupervisor} onChange={e => setProjSupervisor(e.target.value)} className="w-full p-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">กรรมการตรวจรับ</label>
                    <input type="text" value={projCommittee} onChange={e => setProjCommittee(e.target.value)} className="w-full p-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">ระยะเวลา</label>
                    <input type="text" value={projDuration} onChange={e => setProjDuration(e.target.value)} className="w-full p-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">สถานะ</label>
                    <select value={projStatus} onChange={e => setProjStatus(e.target.value)} className="w-full p-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                      <option value="อยู่ระหว่างก่อสร้าง">อยู่ระหว่างก่อสร้าง</option>
                      <option value="ส่งมอบพื้นที่แล้ว">ส่งมอบพื้นที่แล้ว</option>
                      <option value="ก่อสร้างแล้วเสร็จ">ก่อสร้างแล้วเสร็จ</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95">บันทึกข้อมูล</button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-purple-700"></div>
                
                {/* Edit Button */}
                <button onClick={openProjectEdit} className="absolute top-3 right-3 text-gray-400 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity border border-transparent hover:border-purple-200" title="แก้ไขข้อมูลโครงการ">
                  <Edit2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-5 ml-2 pr-12">
                  <div className="w-14 h-14 bg-purple-50 text-purple-700 flex items-center justify-center rounded-2xl border border-purple-100 shadow-sm shrink-0">
                    <Home className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 mb-1">{currentProject?.name || "ไม่ระบุชื่อโครงการ"}</h2>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed">
                      ผู้รับเหมา: {currentProject?.contractor || "-"} | 
                      ผู้ควบคุมงาน: {currentProject?.supervisor || "-"} | 
                      กรรมการตรวจรับ: {currentProject?.committee || "-"} | 
                      ระยะเวลา: {currentProject?.duration || "-"} | 
                      สถานะ: {currentProject?.status || "อยู่ระหว่างก่อสร้าง"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => setSelectedWbs("")} className="flex-1 md:flex-none px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-bold border border-gray-200 transition-colors">
                    เปลี่ยนโครงการ
                  </button>
                  <button className="flex-1 md:flex-none bg-[#334155] hover:bg-[#1e293b] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors">
                    <Printer className="w-4 h-4" /> พิมพ์รายงาน (PDF)
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 sticky top-[68px] z-40 rounded-xl px-2 shadow-sm">
              <div className="flex gap-2 px-4 overflow-x-auto custom-scrollbar">
                <button onClick={() => setActiveTab("overview")} className={`flex items-center gap-2 py-4 px-4 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap ${activeTab === "overview" ? "border-purple-700 text-purple-800" : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
                  <List className="w-4 h-4" /> แผนงาน/ผลงานก่อสร้าง
                </button>
                <button onClick={() => setActiveTab("gantt")} className={`flex items-center gap-2 py-4 px-4 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap ${activeTab === "gantt" ? "border-purple-700 text-purple-800" : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
                  <BarChart2 className="w-4 h-4" /> Gantt Chart
                </button>
                <button onClick={() => setActiveTab("scurve")} className={`flex items-center gap-2 py-4 px-4 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap ${activeTab === "scurve" ? "border-purple-700 text-purple-800" : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
                  <TrendingUp className="w-4 h-4" /> S-Curve
                </button>
                <button onClick={() => setActiveTab("photos")} className={`flex items-center gap-2 py-4 px-4 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap ${activeTab === "photos" ? "border-purple-700 text-purple-800" : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
                  <ImageIcon className="w-4 h-4" /> รูปภาพความก้าวหน้า
                </button>
                <button onClick={() => setActiveTab("budget")} className={`flex items-center gap-2 py-4 px-4 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap ${activeTab === "budget" ? "border-purple-700 text-purple-800" : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
                  <DollarSign className="w-4 h-4" /> เบิกจ่ายงบประมาณ
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="animate-in fade-in duration-300">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">แผนงาน/ผลงานก่อสร้าง</h3>
                    <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95">
                      + เพิ่มงาน
                    </button>
                  </div>

                  {showForm && (
                    <form onSubmit={handleSubmit} className="m-6 bg-purple-50/50 p-6 rounded-2xl border border-purple-100 shadow-inner">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">ชื่องาน</label>
                          <input required type="text" value={taskName} onChange={e => setTaskName(e.target.value)} className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">เริ่ม (แผน)</label>
                            <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">เสร็จ (แผน)</label>
                            <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <label className="block text-xs font-bold text-purple-800 mb-1.5">เริ่ม (จริง)</label>
                            <input type="date" value={actualStartDate} onChange={e => setActualStartDate(e.target.value)} className="w-full p-3 text-sm border border-purple-200 rounded-xl bg-purple-50 focus:ring-2 focus:ring-purple-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-purple-800 mb-1.5">เสร็จ (จริง)</label>
                            <input type="date" value={actualEndDate} onChange={e => setActualEndDate(e.target.value)} className="w-full p-3 text-sm border border-purple-200 rounded-xl bg-purple-50 focus:ring-2 focus:ring-purple-500 outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">ความก้าวหน้า (%)</label>
                            <input type="number" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">ผู้รับผิดชอบ</label>
                            <input type="text" value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-purple-100">
                          <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-200 rounded-xl font-bold transition-colors">ยกเลิก</button>
                          <button type="submit" className="px-5 py-2.5 text-sm bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-md transition-colors">บันทึกข้อมูล</button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 text-gray-500 text-xs tracking-wider border-b border-gray-100">
                          <th className="font-bold p-5 w-1/3">ชื่องาน (Task)</th>
                          <th className="font-bold p-5">วันที่เริ่ม - สิ้นสุด</th>
                          <th className="font-bold p-5">น้ำหนัก (%)</th>
                          <th className="font-bold p-5 w-1/4">ความก้าวหน้าจริง (%)</th>
                          <th className="font-bold p-5 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {tasks.map(task => {
                          const tWeight = Math.max(1, new Date(task.end_date).getTime() - new Date(task.start_date).getTime());
                          const pctWeight = totalW > 0 ? ((tWeight / totalW) * 100).toFixed(0) : "0";
                          return (
                            <tr key={task.id} className="hover:bg-purple-50/40 transition-colors group">
                              <td className="p-5 font-bold text-gray-800">{task.task_name}</td>
                              <td className="p-5 text-gray-600 text-xs font-medium">
                                {new Date(task.start_date).toISOString().split('T')[0]} ถึง {new Date(task.end_date).toISOString().split('T')[0]}
                              </td>
                              <td className="p-5 text-gray-600 font-semibold">{pctWeight}%</td>
                              <td className="p-5">
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-gray-900 font-bold text-xs">{task.progress}%</span>
                                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                                    <div className="bg-purple-800 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${task.progress}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-5 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(task)} className="text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">แก้ไข</button>
                                  <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">ลบ</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {tasks.length === 0 && (
                          <tr><td colSpan={5} className="text-center p-12 text-gray-400 font-medium">ยังไม่มีข้อมูลงานก่อสร้างในระบบ</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: GANTT CHART */}
              {activeTab === "gantt" && (
                <div className="p-6 h-[700px] flex flex-col animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-extrabold text-gray-900">Gantt Chart แผนงานย่อย</h3>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button className="px-4 py-1.5 text-xs font-bold rounded bg-white shadow-sm text-gray-800">สัปดาห์</button>
                      <button className="px-4 py-1.5 text-xs font-bold rounded text-gray-500 hover:text-gray-800">เดือน</button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto border border-gray-200 rounded-xl bg-white relative">
                    <div className="min-w-[1000px] h-full p-4 relative">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex justify-between px-4 pointer-events-none opacity-10">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="h-full border-l border-gray-400 border-dashed"></div>
                        ))}
                      </div>

                      <div className="space-y-6 mt-10 relative z-10">
                        {tasks.map(task => {
                          const planLeft = getLeftOffset(task.start_date);
                          const planWidth = getWidth(task.start_date, task.end_date);
                          
                          let actualLeft = 0;
                          let actualWidth = 0;
                          
                          if (task.actual_start_date) {
                            actualLeft = getLeftOffset(task.actual_start_date);
                            const endDateToUse = task.actual_end_date || new Date().toISOString().split('T')[0];
                            actualWidth = getWidth(task.actual_start_date, endDateToUse);
                          }

                          return (
                            <div key={task.id} className="relative h-14 w-full flex items-center group mb-2">
                              <div className="absolute w-full h-full flex flex-col justify-center gap-1.5">
                                
                                {/* PLAN BAR */}
                                <div 
                                  className="absolute h-4 rounded bg-gray-200 shadow-sm border border-gray-300"
                                  style={{ left: `${planLeft}%`, width: `${planWidth}%`, top: '0' }}
                                >
                                </div>

                                {/* ACTUAL BAR */}
                                {task.actual_start_date && (
                                  <div 
                                    className="absolute h-4 rounded bg-purple-100 border border-purple-300 overflow-hidden shadow-sm"
                                    style={{ left: `${actualLeft}%`, width: `${actualWidth}%`, bottom: '0' }}
                                  >
                                     <div className="h-full bg-purple-600 opacity-90" style={{ width: `${task.progress}%` }}></div>
                                  </div>
                                )}
                                <span className="absolute text-[11px] text-gray-600 font-bold whitespace-nowrap" style={{ left: `calc(${planLeft}% + ${planWidth}% + 12px)`, top: '6px' }}>
                                  {task.task_name}
                                </span>
                              </div>
                              
                              <div className="hidden group-hover:block absolute z-20 bg-white border border-gray-200 text-gray-700 text-xs p-4 rounded-xl shadow-2xl -top-20" style={{ left: `${planLeft + (planWidth/2)}%`, transform: 'translateX(-50%)', minWidth: '240px' }}>
                                <p className="font-bold text-sm text-purple-800 mb-3">{task.task_name}</p>
                                <p className="mb-1"><span className="font-semibold">เริ่ม:</span> {task.start_date}</p>
                                <p className="mb-2"><span className="font-semibold">สิ้นสุด:</span> {task.end_date}</p>
                                <p className="font-bold text-purple-700">ความก้าวหน้า: {task.progress}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: S-CURVE */}
              {activeTab === "scurve" && (
                <div className="p-6 h-[700px] flex flex-col animate-in fade-in duration-300">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-8">S-Curve ความก้าวหน้าโครงการ</h3>
                  <div className="flex-1 bg-amber-50/30 p-4 pt-12 relative rounded-xl border border-gray-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sCurveData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f3f4f6" />
                        <XAxis 
                          dataKey="date" 
                          tick={{fontSize: 11, fill: '#6b7280', fontWeight: 600}} 
                          tickFormatter={(val) => new Date(val).toLocaleDateString('th-TH', {month: 'short', year: '2-digit'})}
                          axisLine={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                          tickLine={false}
                          dy={15}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{fontSize: 11, fill: '#6b7280', fontWeight: 600}} 
                          tickFormatter={(val) => `${val}`}
                          axisLine={false}
                          tickLine={false}
                          dx={-15}
                        />
                        <RechartsTooltip 
                          formatter={(value: any) => [`${value}%`, '']}
                          labelFormatter={(label: any) => new Date(label).toLocaleDateString('th-TH', {year: 'numeric', month: 'long', day: 'numeric'})}
                          contentStyle={{ borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '16px', fontWeight: 'bold' }}
                        />
                        <Legend wrapperStyle={{ top: -40 }} iconType="plainline" />
                        <Line type="monotone" dataKey="แผนงาน (Plan) %" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{r: 5, fill: '#f59e0b', strokeWidth: 0}} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="ผลงานจริง (Actual) %" stroke="#7c3aed" strokeWidth={4} dot={{r: 5, fill: '#7c3aed', strokeWidth: 0}} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* TAB 4: PHOTOS */}
              {activeTab === "photos" && (
                <div className="p-6 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-extrabold text-gray-900">รูปภาพความก้าวหน้าล่าสุด</h3>
                    <button className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> อัพโหลดภาพ
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                      <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all bg-white shadow-sm group cursor-pointer hover:-translate-y-1">
                        <div className="aspect-video bg-gray-200 relative overflow-hidden">
                          <img src={`https://picsum.photos/seed/${i + 200}/400/300`} alt="progress" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-4">
                          <p className="text-[10px] text-gray-500 mb-2 flex items-center gap-1.5 font-bold">
                            <ImageIcon className="w-3.5 h-3.5" /> 2026-09-02
                          </p>
                          <p className="text-xs text-gray-800 font-bold line-clamp-2 leading-relaxed">ตัวอย่างรูปภาพความก้าวหน้างานก่อสร้าง (Mockup Data)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: BUDGET */}
              {activeTab === "budget" && (
                <div className="p-6 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-extrabold text-gray-900">เบิกจ่ายงบประมาณ</h3>
                    <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-purple-500">
                      <option>ข้อมูลเดือน: ก.ย. 2569</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-6 mb-10">
                    <div className="bg-white border-l-8 border-purple-800 shadow-md rounded-2xl p-6 border-y border-r border-gray-100">
                      <p className="text-gray-500 text-[11px] font-bold mb-2 uppercase tracking-wider">วงเงินงบประมาณ</p>
                      <p className="text-2xl font-extrabold text-purple-900">฿10,008,111.96</p>
                    </div>
                    <div className="bg-white border-l-8 border-emerald-500 shadow-md rounded-2xl p-6 border-y border-r border-gray-100">
                      <p className="text-gray-500 text-[11px] font-bold mb-2 uppercase tracking-wider">จ่ายจริงสะสม</p>
                      <p className="text-2xl font-extrabold text-emerald-600">฿745,961.75</p>
                    </div>
                    <div className="bg-white border-l-8 border-red-500 shadow-md rounded-2xl p-6 border-y border-r border-gray-100">
                      <p className="text-gray-500 text-[11px] font-bold mb-2 uppercase tracking-wider">ภาระผูกพัน</p>
                      <p className="text-2xl font-extrabold text-red-600">฿1,265,226.38</p>
                    </div>
                    <div className="bg-white border-l-8 border-amber-500 shadow-md rounded-2xl p-6 border-y border-r border-gray-100">
                      <p className="text-gray-500 text-[11px] font-bold mb-2 uppercase tracking-wider">งบคงเหลือ</p>
                      <p className="text-2xl font-extrabold text-amber-600">฿7,996,923.83</p>
                    </div>
                  </div>

                  <div className="h-[400px] bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-inner mb-10">
                    <BarChart2 className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-bold text-lg">กราฟเปรียบเทียบแผนเบิกจ่าย vs จ่ายจริง</p>
                    <p className="text-gray-400 text-sm mt-2">พื้นที่สำหรับแสดงกราฟแท่งเปรียบเทียบงบประมาณรายเดือน (Mockup)</p>
                  </div>

                  {/* Budget Details Table */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">รายละเอียดข้อมูลเบิกจ่าย</h4>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="bg-gray-50/80 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-200">
                            <th className="font-bold p-4">ลำดับ</th>
                            <th className="font-bold p-4">รายการ</th>
                            <th className="font-bold p-4">WBS</th>
                            <th className="font-bold p-4 text-right">วงเงินงบประมาณ</th>
                            <th className="font-bold p-4 text-right">จ่ายจริงสะสม</th>
                            <th className="font-bold p-4 text-right">วงเงินคงเหลือ</th>
                            <th className="font-bold p-4 text-right">ภาระผูกพันรวม</th>
                            <th className="font-bold p-4 text-right">PR</th>
                            <th className="font-bold p-4 text-right">PO</th>
                            <th className="font-bold p-4 text-right">GR</th>
                            <th className="font-bold p-4 text-right">IR</th>
                            <th className="font-bold p-4 text-right">งบคงเหลือ</th>
                            <th className="font-bold p-4 text-center">% เบิกจ่าย</th>
                            <th className="font-bold p-4">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                          <tr className="hover:bg-purple-50/40 transition-colors">
                            <td className="p-4 font-bold text-gray-800">1</td>
                            <td className="p-4 font-bold text-gray-800">{currentProject?.name || "งานก่อสร้างสถานีไฟฟ้า"}</td>
                            <td className="p-4 text-gray-500 font-medium">{currentProject?.wbs || "I-69-I-BNCXX.19.3904"}</td>
                            <td className="p-4 text-right font-semibold text-gray-700">10,008,111.96</td>
                            <td className="p-4 text-right font-bold text-emerald-600">745,961.75</td>
                            <td className="p-4 text-right font-semibold text-gray-700">9,262,150.21</td>
                            <td className="p-4 text-right font-semibold text-red-500">1,265,226.38</td>
                            <td className="p-4 text-right text-gray-500">0.00</td>
                            <td className="p-4 text-right text-gray-500">1,265,226.38</td>
                            <td className="p-4 text-right text-gray-500">0.00</td>
                            <td className="p-4 text-right text-gray-500">0.00</td>
                            <td className="p-4 text-right font-bold text-amber-600">7,996,923.83</td>
                            <td className="p-4 text-center font-bold text-gray-800">7.45%</td>
                            <td className="p-4">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">PREL BUDG AVAC</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
