"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Printer, Home, List, BarChart2, TrendingUp, Image as ImageIcon, DollarSign, Zap, Edit2, X, Search, Bell, ChevronDown, CheckCircle2, Clock, AlertTriangle, MoreVertical, Grid, Calendar, FileText, CheckCircle } from 'lucide-react';

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

  // New Project states
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjWbs, setNewProjWbs] = useState("");
  const [newProjName, setNewProjName] = useState("");
  const [newProjSupervisor, setNewProjSupervisor] = useState("");

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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjWbs || !newProjName) return;
    const { data, error } = await supabase.from("projects").insert({
      wbs: newProjWbs,
      name: newProjName,
      supervisor: newProjSupervisor
    }).select();
    if (!error) {
      setIsCreatingProject(false);
      setNewProjWbs("");
      setNewProjName("");
      setNewProjSupervisor("");
      fetchProjects();
      setSelectedWbs(newProjWbs);
    } else {
      alert("เกิดข้อผิดพลาดในการสร้างโครงการ หรือมีรหัส WBS นี้อยู่แล้ว");
    }
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
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                <path d="M22 11h-4l-3-6H5v10H3v6h2" />
                <circle cx="8" cy="19" r="2" />
                <circle cx="18" cy="19" r="2" />
                <path d="M10 19h6" />
                <path d="M13 11v4" />
                <path d="M15 5l4 6" />
              </svg>
            </div>
          </div>
        )}

        {/* Project Selector */}
        {!selectedWbs && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-gray-800">เลือกระบบงานก่อสร้าง</h2>
              <button onClick={() => setIsCreatingProject(!isCreatingProject)} className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2">
                {isCreatingProject ? "ยกเลิก" : "+ เพิ่มโครงการใหม่"}
              </button>
            </div>
            
            {isCreatingProject ? (
              <form onSubmit={handleCreateProject} className="max-w-3xl mx-auto bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left">
                <h3 className="font-bold text-gray-800 mb-4">สร้างโครงการใหม่</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">WBS (รหัสโครงการ)</label>
                    <input type="text" required value={newProjWbs} onChange={e => setNewProjWbs(e.target.value)} className="w-full p-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" placeholder="เช่น I-69-I-BNCXX" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">ชื่อโครงการ</label>
                    <input type="text" required value={newProjName} onChange={e => setNewProjName(e.target.value)} className="w-full p-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" placeholder="ชื่อโครงการ" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">ชื่อผู้ควบคุมงาน</label>
                    <input type="text" value={newProjSupervisor} onChange={e => setNewProjSupervisor(e.target.value)} className="w-full p-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" placeholder="นาย..." />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">บันทึกโครงการ</button>
                </div>
              </form>
            ) : (
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
                      <option key={sup as string} value={sup as string}>{sup}</option>
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
            )}
          </div>
        )}

        {selectedWbs && (
          <>
            {/* Top Navigation Bar for Project View */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 py-3 sticky top-0 z-50 rounded-2xl shadow-sm mb-2">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedWbs("")} className="w-10 h-10 bg-purple-100 text-purple-700 flex items-center justify-center rounded-xl shadow-sm hover:bg-purple-200 transition-colors" title="กลับไปหน้าหลัก">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V2"/><path d="M7 6h10"/><path d="M7 10h10"/><path d="M12 6L9 10"/><path d="M12 6l3 4"/></svg>
                </button>
                <div>
                  <h1 className="text-lg font-extrabold text-gray-900 leading-tight">{currentProject?.name || "ไม่ระบุชื่อโครงการ"}</h1>
                  <p className="text-xs text-gray-500 font-medium">ผู้ควบคุมงาน: {currentProject?.supervisor || "-"} | สถานะ: {currentProject?.status || "อยู่ระหว่างก่อสร้าง"}</p>
                </div>
              </div>
              <div className="hidden md:flex relative w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="ค้นหางาน โครงการ หรือสถานที่..." className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-medium" />
              </div>
            </div>

            {/* Hero Banner */}
            <div className="relative w-full h-[220px] rounded-[24px] overflow-hidden shadow-lg group border border-purple-900/20">
              <img src="/images/pea_construction_banner.jpg" alt="Construction Banner" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-purple-900/60 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-between p-8">
                <div>
                  <p className="text-purple-200 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Construction Project</p>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">{currentProject?.name || "ไม่ระบุชื่อโครงการ"}</h2>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3 mt-auto">
                  <div className="flex items-center gap-2 bg-[#523F67]/90 px-4 py-1.5 rounded-lg text-white text-xs font-bold shadow-sm border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div> สถานะ: {currentProject?.status || "C1"}
                  </div>
                </div>
              </div>
              <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden md:block">
                <h3 className="text-6xl font-black text-white/20 italic transform -skew-x-12 leading-[0.9] text-right" style={{ fontFamily: 'Impact, sans-serif' }}>Power<br/><span className="text-5xl">for Better Life</span></h3>
              </div>
              <button onClick={openProjectEdit} className="absolute top-5 right-5 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2.5 rounded-xl backdrop-blur-sm transition-all border border-white/10" title="แก้ไขข้อมูลโครงการ">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Project Edit Form Overlay */}
            {isEditingProject && (
              <form onSubmit={handleProjectSubmit} className="bg-white rounded-2xl shadow-2xl border border-purple-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 absolute z-[60] left-1/2 -translate-x-1/2 top-40 w-11/12 max-w-4xl">
                <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-extrabold text-gray-800">แก้ไขรายละเอียดโครงการ</h3>
                  <button type="button" onClick={() => setIsEditingProject(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-full p-1.5"><X className="w-5 h-5"/></button>
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
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 mt-4">
                  <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">บันทึกข้อมูล</button>
                </div>
              </form>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-1 cursor-default">
                <div>
                  <p className="text-gray-500 text-xs font-bold mb-1">งานทั้งหมด</p>
                  <p className="text-3xl font-black text-gray-900">{tasks.length}</p>
                  <p className="text-gray-400 text-[10px] mt-1 font-medium">รายการ</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-1 cursor-default">
                <div>
                  <p className="text-gray-500 text-xs font-bold mb-1">งานที่เสร็จแล้ว</p>
                  <p className="text-3xl font-black text-gray-900">{tasks.filter(t => t.progress === 100).length}</p>
                  <p className="text-gray-400 text-[10px] mt-1 font-medium">รายการ</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <CheckCircle className="w-6 h-6 relative z-10" />
                </div>
              </div>

              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex flex-col justify-between group hover:shadow-md transition-all hover:-translate-y-1 cursor-default relative overflow-hidden">
                <div className="flex items-center justify-between w-full relative z-10">
                  <div>
                    <p className="text-gray-500 text-xs font-bold mb-1">ความก้าวหน้าจริง</p>
                    <p className="text-3xl font-black text-gray-900">
                      {tasks.length > 0 ? (tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length).toFixed(0) : "0"}%
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-4 relative z-10 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${tasks.length > 0 ? (tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length) : 0}%` }}></div>
                </div>
              </div>

              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-1 cursor-default">
                <div>
                  <p className="text-gray-500 text-xs font-bold mb-1">งานที่กำลังดำเนินการ</p>
                  <p className="text-3xl font-black text-gray-900">{tasks.filter(t => t.progress > 0 && t.progress < 100).length}</p>
                  <p className="text-gray-400 text-[10px] mt-1 font-medium">รายการ</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-1 cursor-default">
                <div>
                  <p className="text-gray-500 text-xs font-bold mb-1">งานล่าช้า</p>
                  <p className="text-3xl font-black text-gray-900">0</p>
                  <p className="text-gray-400 text-[10px] mt-1 font-medium">รายการ</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-red-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-red-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Modern Tab Navigation & Controls */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-4 py-2 mt-2">
              <div className="flex gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 custom-scrollbar hide-scroll-indicator">
                <button onClick={() => setActiveTab("overview")} className={`flex items-center gap-2 py-2.5 px-6 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "overview" ? "bg-purple-700 text-white shadow-md shadow-purple-500/20" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                  <List className="w-4 h-4" /> แผนงาน/ผลงานก่อสร้าง
                </button>
                <button onClick={() => setActiveTab("gantt")} className={`flex items-center gap-2 py-2.5 px-6 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "gantt" ? "bg-purple-700 text-white shadow-md shadow-purple-500/20" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                  <BarChart2 className="w-4 h-4" /> Gantt Chart
                </button>
                <button onClick={() => setActiveTab("scurve")} className={`flex items-center gap-2 py-2.5 px-6 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "scurve" ? "bg-purple-700 text-white shadow-md shadow-purple-500/20" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                  <TrendingUp className="w-4 h-4" /> S-Curve
                </button>
                <button onClick={() => setActiveTab("photos")} className={`flex items-center gap-2 py-2.5 px-6 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "photos" ? "bg-purple-700 text-white shadow-md shadow-purple-500/20" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                  <ImageIcon className="w-4 h-4" /> รูปภาพความก้าวหน้า
                </button>
                <button onClick={() => setActiveTab("budget")} className={`flex items-center gap-2 py-2.5 px-6 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "budget" ? "bg-purple-700 text-white shadow-md shadow-purple-500/20" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                  <DollarSign className="w-4 h-4" /> เบิกจ่ายงบประมาณ
                </button>
              </div>

              <div className="flex items-center gap-3 w-full xl:w-auto">
                <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  ทั้งหมด <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <div className="relative flex-1 xl:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="ค้นหางาน..." className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-medium shadow-sm" />
                </div>
                <button onClick={() => { setActiveTab("overview"); resetForm(); setShowForm(true); }} className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95 flex items-center gap-2 shrink-0">
                  + เพิ่มงาน
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="animate-in fade-in duration-300">
                  <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-700 shadow-sm border border-purple-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V2"/><path d="M7 6h10"/><path d="M7 10h10"/><path d="M12 6L9 10"/><path d="M12 6l3 4"/></svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-1">แผนงาน/ผลงานก่อสร้าง</h3>
                        <p className="text-xs text-gray-500 font-medium">รายการงานและความก้าวหน้าของโครงการ</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <button className="flex items-center gap-2 px-5 py-2 bg-[#7B32D9] text-white text-xs font-bold rounded-lg shadow-sm border border-purple-800 shadow-purple-900/20">
                          <List className="w-4 h-4" /> รายการ
                        </button>
                      </div>
                      <button className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-[10px] text-gray-500 hover:bg-gray-50 transition-colors shadow-sm ml-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
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

                  <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-100">
                          <th className="font-bold p-5 w-1/3">ชื่องาน (Task)</th>
                          <th className="font-bold p-5 text-center">วันที่เริ่ม - สิ้นสุด</th>
                          <th className="font-bold p-5 text-center">น้ำหนัก (%)</th>
                          <th className="font-bold p-5 text-center w-1/5">ความก้าวหน้าจริง (%)</th>
                          <th className="font-bold p-5 text-center">สถานะ</th>
                          <th className="font-bold p-5 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {tasks.map(task => {
                          const tWeight = Math.max(1, new Date(task.end_date).getTime() - new Date(task.start_date).getTime());
                          const pctWeight = totalW > 0 ? ((tWeight / totalW) * 100).toFixed(0) : "0";
                          let statusLabel = "กำลังดำเนินการ";
                          let statusColor = "bg-orange-100 text-orange-700";
                          if (task.progress === 100) {
                            statusLabel = "เสร็จสมบูรณ์";
                            statusColor = "bg-emerald-100 text-emerald-700";
                          } else if (task.progress === 0) {
                            statusLabel = "รอดำเนินการ";
                            statusColor = "bg-gray-100 text-gray-600";
                          }
                          return (
                            <tr key={task.id} className="hover:bg-purple-50/30 transition-colors group border-b border-gray-50/50">
                              <td className="p-5 font-bold text-gray-800">{task.task_name}</td>
                              <td className="p-5 text-gray-500 text-xs font-medium text-center">
                                {new Date(task.start_date).toLocaleDateString('th-TH')} - {new Date(task.end_date).toLocaleDateString('th-TH')}
                              </td>
                              <td className="p-5 text-gray-600 font-bold text-center">{pctWeight}%</td>
                              <td className="p-5">
                                <div className="flex flex-col gap-1.5 items-center">
                                  <span className="text-gray-900 font-bold text-xs">{task.progress}%</span>
                                  <div className="w-full max-w-[120px] bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-purple-600 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${task.progress}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-5 text-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusColor}`}>{statusLabel}</span>
                              </td>
                              <td className="p-5 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(task)} className="text-gray-400 hover:text-purple-700 hover:bg-purple-50 p-2 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {tasks.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-16">
                              <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                <div className="relative w-48 h-48 mb-4">
                                  <div className="absolute inset-0 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
                                  <img src="https://illustrations.popsy.co/purple/under-construction.svg" alt="Empty State" className="w-full h-full relative z-10 opacity-90 drop-shadow-md" onError={(e) => { e.currentTarget.src = "https://illustrations.popsy.co/purple/work-from-home.svg"; }} />
                                </div>
                                <h4 className="text-xl font-extrabold text-gray-900 mb-2">ยังไม่มีข้อมูลงานก่อสร้างในระบบ</h4>
                                <p className="text-sm text-gray-500 font-medium mb-8">เริ่มต้นสร้างงานแรกของคุณ เพื่อวางแผนและติดตามความก้าวหน้า</p>
                                <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/30 transition-all active:scale-95 flex items-center gap-2">
                                  + เพิ่มงาน
                                </button>
                              </div>
                            </td>
                          </tr>
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
                  <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center mt-6">
                    <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-bold text-lg mb-2">ยังไม่มีรูปภาพความก้าวหน้า</p>
                    <p className="text-gray-400 text-sm">กรุณากดปุ่ม &quot;อัพโหลดภาพ&quot; เพื่อเพิ่มรูปภาพสำหรับโครงการนี้</p>
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
                  
                  <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center mt-6">
                    <BarChart2 className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-bold text-lg mb-2">ยังไม่มีข้อมูลเบิกจ่ายงบประมาณ</p>
                    <p className="text-gray-400 text-sm mb-6">คุณสามารถเพิ่มรายละเอียดข้อมูลการเบิกจ่ายสำหรับโครงการนี้ได้</p>
                    <button className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">
                      + เพิ่มรายละเอียดเบิกจ่าย
                    </button>
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
