"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Printer, Home, List, BarChart2, TrendingUp, Image as ImageIcon, DollarSign, Zap, Edit2, X, Search, Bell, ChevronDown, CheckCircle2, Clock, AlertTriangle, MoreVertical, Grid, Calendar, FileText, CheckCircle, Trash2, Plus } from 'lucide-react';

interface Project {
  id: string;
  wbs: string;
  name: string;
  contractor: string | null;
  supervisor: string | null;
  committee: string | null;
  duration: string | null;
  status: string | null;
  construction_type?: string;
  progress?: number;
  plan_progress?: number;
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
  step_order?: number;
  weight?: number;
  target_qty?: number;
  done_qty?: number;
}

// 7 ขั้นตอนงานก่อสร้างระบบจำหน่ายที่ตายตัว
const FIXED_CONSTRUCTION_STEPS = [
  { order: 0, name: "0. เบิกของเตรียมอุปกรณ์", unit: "รายการ", defaultWeight: 5 },
  { order: 1, name: "1. ขุดหลุมปักเสา", unit: "ต้น", defaultWeight: 15 },
  { order: 2, name: "2. ปักเสา", unit: "ต้น", defaultWeight: 20 },
  { order: 3, name: "3. ติดตั้งอุปกรณ์ประกอบหัวเสา", unit: "ชุด", defaultWeight: 20 },
  { order: 4, name: "4. พาดสายแรงสูง", unit: "วงจร-กม.", defaultWeight: 20 },
  { order: 5, name: "5. พาดสายแรงต่ำ", unit: "วงจร-กม.", defaultWeight: 10 },
  { order: 6, name: "6. งานรื้อถอน", unit: "ต้น", defaultWeight: 10 },
];

export default function PlanningDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedWbs, setSelectedWbs] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview"|"gantt"|"scurve"|"monthly"|"photos"|"budget">("overview");
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showBudgetMock, setShowBudgetMock] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED">("ALL");

  // Monthly Report states
  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthlyData, setMonthlyData] = useState<Record<string, number>>({});
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [allMonthlyData, setAllMonthlyData] = useState<any[]>([]);

  // New Project states
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjWbs, setNewProjWbs] = useState("");
  const [newProjName, setNewProjName] = useState("");
  const [newProjSupervisor, setNewProjSupervisor] = useState("");
  const [isLegacyProject, setIsLegacyProject] = useState(false);

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

  // Derived state for table
  const filteredProjects = projects.filter(p => {
    const matchesSupervisor = !selectedSupervisor || p.supervisor === selectedSupervisor;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.wbs.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "PLANNING") {
      matchesStatus = p.status === 'ร่างแผนงาน' || !p.status;
    } else if (statusFilter === "IN_PROGRESS") {
      matchesStatus = p.status === 'อยู่ระหว่างก่อสร้าง' || (p.status !== 'ก่อสร้างแล้วเสร็จ' && p.status !== 'ปิดงาน (TECO)' && p.status !== 'ร่างแผนงาน');
    } else if (statusFilter === "COMPLETED") {
      matchesStatus = p.status === 'ก่อสร้างแล้วเสร็จ' || p.status === 'ปิดงาน (TECO)';
    } else if (statusFilter === "DELAYED") {
      matchesStatus = (p.plan_progress || 0) > (p.progress || 0) && p.status !== 'ก่อสร้างแล้วเสร็จ' && p.status !== 'ปิดงาน (TECO)';
    }

    return matchesSupervisor && matchesSearch && matchesStatus;
  });
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSupervisor, itemsPerPage, statusFilter]);

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
    const { data, error } = await supabase.from("projects").select("id, wbs, name, contractor, supervisor, committee, duration, status, construction_type").order("wbs");
    const { data: tasksData, error: tasksError } = await supabase.from("project_tasks").select("project_wbs, weight, target_qty, done_qty, progress, start_date, end_date");
    if (tasksError) {
      console.warn("project_tasks query error (trying fallback):", tasksError.message);
    }
    
    if (!error && data) {
      let validProjects = data.filter(p => p.wbs !== 'SAFETY_PLAN_2026');
      
      // Calculate progress for each project
      if (tasksData) {
        validProjects = validProjects.map(p => {
          const pTasks = tasksData.filter(t => t.project_wbs === p.wbs);
          if (pTasks.length === 0) return { ...p, progress: 0 };
          
          const totalWeight = pTasks.reduce((sum, t) => sum + (Number(t.weight) || 0), 0);
          if (totalWeight === 0) return { ...p, progress: 0 };
          
          const totalProgress = pTasks.reduce((sum, t) => {
            const w = Number(t.weight) || 0;
            let pVal = 0;
            if (p.status === 'ก่อสร้างแล้วเสร็จ' || p.status === 'ปิดงาน (TECO)') {
              pVal = 100;
            } else {
              const targetQty = Number(t.target_qty) || 0;
              const doneQty = Number(t.done_qty) || 0;
              if (targetQty > 0) {
                pVal = Math.min(100, Math.round((doneQty / targetQty) * 100));
              } else if (Number(t.progress) > 0) {
                pVal = Number(t.progress);
              }
            }
            return sum + (w * pVal / 100);
          }, 0) / totalWeight * 100;
          
          const totalPlanProgress = pTasks.reduce((sum, t) => {
            const w = Number(t.weight) || 0;
            let planPercent = 0;
            if (p.status === 'ก่อสร้างแล้วเสร็จ' || p.status === 'ปิดงาน (TECO)') {
              planPercent = 100;
            } else if (t.start_date && t.end_date) {
              const todayStr = new Date().toISOString().split('T')[0];
              if (todayStr >= t.end_date) {
                planPercent = 100;
              } else if (todayStr > t.start_date) {
                const start = new Date(t.start_date).getTime();
                const end = new Date(t.end_date).getTime();
                const todayTime = new Date(todayStr).getTime();
                if (end > start) {
                  planPercent = ((todayTime - start) / (end - start)) * 100;
                }
              }
            }
            return sum + (w * planPercent / 100);
          }, 0) / totalWeight * 100;
          
          return { ...p, progress: Number(totalProgress.toFixed(1)), plan_progress: Number(totalPlanProgress.toFixed(1)) };
        });
      }
      
      setProjects(validProjects);
    }
    setLoading(false);
  };

  const fetchMonthlyData = async () => {
    if (!selectedWbs || !reportMonth) return;
    setMonthlyLoading(true);
    const { data, error } = await supabase
      .from("monthly_progress")
      .select("task_id, done_qty")
      .eq("project_wbs", selectedWbs)
      .eq("report_month", reportMonth);
    
    if (!error && data) {
      const mapped = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.task_id]: Number(curr.done_qty) }), {});
      setMonthlyData(mapped);
    } else {
      setMonthlyData({});
    }
    setMonthlyLoading(false);
  };

  const fetchAllMonthlyData = async () => {
    if (!selectedWbs) return;
    const { data, error } = await supabase
      .from("monthly_progress")
      .select("task_id, done_qty, report_month")
      .eq("project_wbs", selectedWbs)
      .order("report_month");
    if (!error && data) {
      setAllMonthlyData(data);
    } else {
      setAllMonthlyData([]);
    }
  };

  useEffect(() => {
    if (activeTab === "monthly" && selectedWbs) {
      fetchMonthlyData();
      fetchAllMonthlyData();
    }
  }, [activeTab, selectedWbs, reportMonth]);

  const fetchTasks = async (wbs: string) => {
    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_wbs", wbs)
      .order("step_order", { ascending: true });
    if (!error && data) {
      if (data.length === 0) {
        // Auto-initialize 7 fixed construction steps
        const today = new Date().toISOString().split('T')[0];
        const stepsToInsert = FIXED_CONSTRUCTION_STEPS.map(step => ({
          project_wbs: wbs,
          task_name: step.name,
          start_date: today,
          end_date: today,
          progress: 0,
          assignee: null,
          step_order: step.order,
          weight: step.defaultWeight,
        }));
        const { data: inserted, error: insertError } = await supabase
          .from("project_tasks")
          .insert(stepsToInsert)
          .select();
        if (!insertError && inserted) {
          setTasks(inserted.sort((a: Task, b: Task) => (a.step_order ?? 0) - (b.step_order ?? 0)));
        }
      } else {
        setTasks(data);
      }
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
      supervisor: newProjSupervisor,
      status: isLegacyProject ? 'ก่อสร้างแล้วเสร็จ' : 'ร่างแผนงาน'
    }).select();
    if (!error) {
      if (isLegacyProject) {
        const today = new Date().toISOString().split('T')[0];
        const stepsToInsert = FIXED_CONSTRUCTION_STEPS.map(step => ({
          project_wbs: newProjWbs,
          task_name: step.name,
          start_date: today,
          end_date: today,
          progress: 100,
          assignee: null,
          step_order: step.order,
          weight: step.defaultWeight,
          target_qty: 1,
          done_qty: 1,
          actual_start_date: today,
          actual_end_date: today
        }));
        await supabase.from("project_tasks").insert(stepsToInsert);
      }
      setIsCreatingProject(false);
      setNewProjWbs("");
      setNewProjName("");
      setNewProjSupervisor("");
      setIsLegacyProject(false);
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

  // Inline update for fixed step fields
  const [savingStepId, setSavingStepId] = useState<string | null>(null);

  const handleMonthlyUpdate = async (taskId: string, qty: number | null) => {
    const val = qty === null ? 0 : qty;
    setMonthlyData(prev => ({ ...prev, [taskId]: val }));
    
    // Optimistic update done, now save to DB
    const { data: existing } = await supabase
      .from("monthly_progress")
      .select("id")
      .eq("task_id", taskId)
      .eq("report_month", reportMonth)
      .single();
      
    if (existing) {
       await supabase.from("monthly_progress").update({ done_qty: val }).eq("id", existing.id);
    } else {
       await supabase.from("monthly_progress").insert({
          project_wbs: selectedWbs,
          task_id: taskId,
          report_month: reportMonth,
          done_qty: val
       });
    }

    // Recalculate total done_qty for this task
    const { data: allMonths } = await supabase
      .from("monthly_progress")
      .select("done_qty")
      .eq("task_id", taskId);
      
    if (allMonths) {
      const totalDone = allMonths.reduce((sum: number, row: any) => sum + Number(row.done_qty), 0);
      handleStepUpdate(taskId, "done_qty", totalDone);
    }
  };

  const handleStepUpdate = async (taskId: string, field: string, value: string | number | null) => {
    setSavingStepId(taskId);
    
    // Find the task to calculate new progress if needed
    const currentTask = tasks.find(t => t.id === taskId);
    let newProgress = currentTask?.progress || 0;
    
    if (field === 'target_qty' || field === 'done_qty') {
      const target = field === 'target_qty' ? Number(value) : Number(currentTask?.target_qty || 0);
      const done = field === 'done_qty' ? Number(value) : Number(currentTask?.done_qty || 0);
      
      if (target > 0) {
        newProgress = Math.min(100, Math.round((done / target) * 100));
      } else {
        newProgress = 0;
      }
    }

    // Update local state immediately for responsiveness
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          [field]: value,
          ...(field === 'target_qty' || field === 'done_qty' ? { progress: newProgress } : {})
        };
      }
      return t;
    }));
    
    // Update DB
    const updates: any = { [field]: value };
    if (field === 'target_qty' || field === 'done_qty') {
      updates.progress = newProgress;
    }
    await supabase.from("project_tasks").update(updates).eq("id", taskId);
    setSavingStepId(null);
  };

  const handlePatternChange = async (type: string) => {
    if (!selectedWbs) return;
    if (!confirm("การเปลี่ยนรูปแบบจะตั้งค่าน้ำหนัก (%) ของทุกขั้นตอนใหม่ ยืนยันหรือไม่?")) return;
    
    // Update DB projects table
    supabase.from("projects").update({ construction_type: type }).eq("wbs", selectedWbs);
    // Update local project state
    setProjects(prev => prev.map(p => p.wbs === selectedWbs ? { ...p, construction_type: type } : p));
    
    // Weights logic
    let w = [5, 15, 20, 20, 20, 10, 10]; // default type 1
    if (type === "2") w = [5, 20, 25, 25, 25, 0, 0];
    else if (type === "3") w = [5, 20, 20, 25, 20, 0, 10];
    else if (type === "4") w = [5, 0, 0, 45, 50, 0, 0];
    else if (type === "5") return;
    
    // Restore missing default steps and update weights
    const currentTasks = [...tasks];
    const today = new Date().toISOString().split('T')[0];

    for (const step of FIXED_CONSTRUCTION_STEPS) {
      const existingTask = currentTasks.find(t => t.step_order === step.order);
      const newWeight = w[step.order];

      if (existingTask) {
        // Update existing
        await supabase.from("project_tasks").update({ 
          task_name: step.name, 
          weight: newWeight 
        }).eq("id", existingTask.id);
      } else {
        // Insert missing
        const { error: insertError } = await supabase.from("project_tasks").insert([{
          project_wbs: selectedWbs,
          task_name: step.name,
          start_date: today,
          end_date: today,
          progress: 0,
          step_order: step.order,
          weight: newWeight,
          target_qty: 0,
          done_qty: 0
        }]);
        
        if (insertError) {
          console.error("Failed to restore step:", step.name, insertError);
          // Try again without target_qty and done_qty just in case schema differs slightly
          await supabase.from("project_tasks").insert([{
            project_wbs: selectedWbs,
            task_name: step.name,
            start_date: today,
            end_date: today,
            progress: 0,
            step_order: step.order,
            weight: newWeight
          }]);
        }
      }
    }

    // Hide any custom steps by setting weight to 0
    const customTasks = currentTasks.filter(t => (t.step_order ?? 0) > 6);
    for (const t of customTasks) {
      await supabase.from("project_tasks").update({ weight: 0 }).eq("id", t.id);
    }

    // Reload tasks from database to ensure state is perfectly synced
    await fetchTasks(selectedWbs);
  };

  const handleUnlockPlan = async () => {
    if (!selectedWbs) return;
    if (!confirm("คุณต้องการปลดล็อคเพื่อแก้ไขแผนงานใช่หรือไม่?\n\n(การปลดล็อคจะนำโครงการกลับสู่ 'โหมดวางแผนงาน' เพื่อแก้ไขเป้าหมายอีกครั้ง)")) return;
    
    await supabase.from("projects").update({ status: 'ร่างแผนงาน' }).eq("wbs", selectedWbs);
    setProjects(prev => prev.map(p => p.wbs === selectedWbs ? { ...p, status: 'ร่างแผนงาน' } : p));
  };

  const handleAddCustomStep = async () => {
    if (!selectedWbs) return;
    
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.step_order ?? 0)) : -1;
    const newOrder = maxOrder + 1;
    
    const payload = {
      project_wbs: selectedWbs,
      task_name: "ขั้นตอนใหม่",
      weight: 0,
      step_order: newOrder,
      progress: 0,
      target_qty: 0,
      done_qty: 0
    };
    
    const { data, error } = await supabase.from("project_tasks").insert([payload]).select();
    if (!error && data) {
      setTasks(prev => [...prev, ...data]);
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
  const activeTasks = currentProject?.construction_type === '5' 
    ? tasks 
    : tasks.filter(t => (t.weight ?? FIXED_CONSTRUCTION_STEPS.find(s => s.order === t.step_order)?.defaultWeight ?? 0) > 0);

  const isPlanningPhase = currentProject?.status === 'ร่างแผนงาน';

  const handleLockPlan = async () => {
    if (!selectedWbs) return;
    if (!confirm("ยืนยันการล็อคแผนงาน?\n\nเมื่อยืนยันแล้ว ข้อมูลแผนงาน (วันที่และเป้าหมาย) จะไม่สามารถแก้ไขได้อีก เพื่อให้คุณสามารถเริ่มบันทึกผลการดำเนินงานจริงได้")) return;
    
    await supabase.from("projects").update({ status: 'อยู่ระหว่างก่อสร้าง' }).eq("wbs", selectedWbs);
    setProjects(prev => prev.map(p => p.wbs === selectedWbs ? { ...p, status: 'อยู่ระหว่างก่อสร้าง' } : p));
  };

  const handleFastTrackLegacy = async () => {
    if (!selectedWbs) return;
    if (!confirm("ยืนยันนำเข้า 'โครงการที่เสร็จสิ้นแล้ว' (Legacy)?\n\nระบบจะข้ามขั้นตอนการทำแผน ปรับความก้าวหน้าทุกขั้นตอนเป็น 100% อัตโนมัติ และเปลี่ยนสถานะโครงการเป็น ก่อสร้างแล้วเสร็จ ทันที")) return;
    
    // Update project status
    await supabase.from("projects").update({ status: 'ก่อสร้างแล้วเสร็จ' }).eq("wbs", selectedWbs);
    
    // Update all tasks to 100%
    const today = new Date().toISOString().split('T')[0];
    const { data: existingTasks } = await supabase.from("project_tasks").select("id").eq("project_wbs", selectedWbs);
    if (existingTasks && existingTasks.length > 0) {
      for (const t of existingTasks) {
        await supabase.from("project_tasks").update({
          start_date: today,
          end_date: today,
          progress: 100,
          target_qty: 1,
          done_qty: 1,
          actual_start_date: today,
          actual_end_date: today
        }).eq("id", t.id);
      }
    }
    
    setProjects(prev => prev.map(p => p.wbs === selectedWbs ? { ...p, status: 'ก่อสร้างแล้วเสร็จ' } : p));
    await fetchTasks(selectedWbs);
    await fetchProjects();
  };

  const activeTasksWithDerivedProgress = activeTasks.map(t => {
    const targetQty = Number(t.target_qty) || 0;
    const doneQty = Number(t.done_qty) || 0;
    const derivedProgress = targetQty > 0 ? Math.min(100, Math.round((doneQty / targetQty) * 100)) : 0;
    return { ...t, derivedProgress };
  });

  const totalActiveWeight = activeTasksWithDerivedProgress.reduce((sum, t) => sum + (Number(t.weight) || 0), 0);
  const actualProgressPercentage = totalActiveWeight > 0 ? (activeTasksWithDerivedProgress.reduce((sum, t) => sum + ((Number(t.weight) || 0) * t.derivedProgress / 100), 0) / totalActiveWeight * 100).toFixed(0) : "0";

  const dashboardFilteredProjects = projects.filter(p => !selectedSupervisor || p.supervisor === selectedSupervisor);
  const countTotal = dashboardFilteredProjects.length;
  const countPlanning = dashboardFilteredProjects.filter(p => p.status === 'ร่างแผนงาน' || !p.status).length;
  const countInProgress = dashboardFilteredProjects.filter(p => p.status === 'อยู่ระหว่างก่อสร้าง' || (p.status !== 'ก่อสร้างแล้วเสร็จ' && p.status !== 'ปิดงาน (TECO)' && p.status !== 'ร่างแผนงาน')).length;
  const countCompleted = dashboardFilteredProjects.filter(p => p.status === 'ก่อสร้างแล้วเสร็จ' || p.status === 'ปิดงาน (TECO)').length;
  const countDelayed = dashboardFilteredProjects.filter(p => (p.plan_progress || 0) > (p.progress || 0) && p.status !== 'ก่อสร้างแล้วเสร็จ' && p.status !== 'ปิดงาน (TECO)').length;

  return (
    <div className="w-full text-sm text-gray-800 font-sans">
      <div className="w-full mx-auto space-y-6">
        
        {/* Project Selection Dashboard (When no project is selected) */}
        {!selectedWbs && (
          <div className="w-full bg-[#FAFAFA] min-h-screen pb-20 font-sans">
            {/* Premium Top Navigation Bar */}
            <div className="bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 py-4 sticky top-0 z-50 mb-8 border-b border-gray-200/50 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-5">
                <button className="text-gray-500 hover:bg-gray-100 p-2.5 rounded-xl transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="flex flex-col">
                  <h1 className="text-lg font-black text-gray-900 leading-tight tracking-tight">วางแผนงานก่อสร้างแผนกก่อสร้างระบบไฟฟ้า</h1>
                  <p className="text-[10px] text-gray-500 font-bold tracking-[0.15em] uppercase mt-0.5">Electrical Construction Planning</p>
                </div>
              </div>
              <div className="hidden md:flex relative w-[400px]">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="ค้นหาโครงการ, รหัสโครงการ, พื้นที่..." className="w-full bg-gray-100/80 border-transparent focus:bg-white border focus:border-purple-300 rounded-xl py-2.5 pl-11 pr-4 text-xs focus:ring-4 focus:ring-purple-500/10 outline-none font-medium transition-all duration-300 placeholder-gray-400" />
              </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-8">
              {/* Sleek Hero Header */}
              <div className="relative mb-20 z-10">
                {/* Hero Banner */}
                <div className="w-full h-[240px] rounded-[32px] overflow-visible relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-br from-[#4A148C] via-[#6B21A8] to-[#9333EA]">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay rounded-[32px]"></div>
                  <div className="absolute top-0 right-0 w-[600px] h-full opacity-30 bg-gradient-to-l from-white/20 to-transparent skew-x-12 translate-x-32 rounded-[32px]"></div>
                  <img src="/pea_construction_banner_1788531405932.jpg" alt="Construction Banner" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity rounded-[32px]" />
                  
                  {/* Text Content */}
                  <div className="relative h-full flex flex-col justify-center px-10 z-10">
                    <h2 className="text-4xl font-black text-white mb-2 drop-shadow-md tracking-tight">เลือกระบบงานก่อสร้าง</h2>
                    <p className="text-white/90 font-medium text-sm max-w-md leading-relaxed">เลือกผู้ควบคุมงานและดูโครงการที่รับผิดชอบ</p>
                  </div>
                  
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:block z-10">
                    <h3 className="text-6xl font-black text-white/10 italic transform -skew-x-12 leading-[0.9] text-right" style={{ fontFamily: 'Impact, sans-serif' }}>Power<br/><span className="text-5xl">for Better Life</span></h3>
                  </div>
                  
                  {/* Bottom Gradient Fade */}
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent rounded-b-[32px]"></div>
                </div>

                {/* Floating KPI Cards */}
                <div className="absolute -bottom-10 left-0 w-full px-10 z-20">
                  <div className="flex flex-wrap gap-4 items-stretch">
                    {/* Supervisor Select */}
                    <div className="bg-white rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] border-transparent p-4 flex items-center gap-4 flex-1 min-w-[200px] hover:-translate-y-1 hover:shadow-[0_15px_50px_rgb(0,0,0,0.06)] transition-all duration-500">
                      <div className="w-12 h-12 rounded-[16px] bg-purple-50/80 text-purple-600 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <div className="flex-1 w-full relative">
                        <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">ผู้ควบคุมงาน</p>
                        <div 
                          className="w-full bg-transparent text-sm font-black text-gray-900 cursor-pointer flex items-center justify-between"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                          <span className="truncate max-w-[100px]">{selectedSupervisor || "เลือกทั้งหมด"}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                        {isDropdownOpen && (
                          <div className="absolute top-full left-0 w-full mt-4 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] py-2 z-50 max-h-60 overflow-y-auto">
                            <div 
                              className="px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => { setSelectedSupervisor(""); setIsDropdownOpen(false); }}
                            >
                              เลือกทั้งหมด
                            </div>
                            {Array.from(new Set(projects.map(p => p.supervisor).filter(Boolean))).map(sup => (
                              <div 
                                key={sup as string}
                                className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors ${selectedSupervisor === sup ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => { setSelectedSupervisor(sup as string); setIsDropdownOpen(false); }}
                              >
                                {sup}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Total Projects */}
                    <div 
                      onClick={() => setStatusFilter("ALL")}
                      className={`bg-white rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] p-4 flex items-center gap-3 flex-1 min-w-[150px] cursor-pointer hover:-translate-y-1 hover:shadow-[0_15px_50px_rgb(0,0,0,0.06)] transition-all duration-500 border-2 ${statusFilter === "ALL" ? "border-purple-500" : "border-transparent"}`}>
                      <div className="w-12 h-12 rounded-[16px] bg-gray-50 text-gray-700 flex items-center justify-center shrink-0">
                        <List className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-gray-900 leading-none mb-1.5">{countTotal}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">โครงการทั้งหมด</p>
                      </div>
                    </div>
                    
                    {/* Planning */}
                    <div 
                      onClick={() => setStatusFilter("PLANNING")}
                      className={`bg-white rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] p-4 flex items-center gap-3 flex-1 min-w-[150px] cursor-pointer hover:-translate-y-1 hover:shadow-[0_15px_50px_rgb(0,0,0,0.06)] transition-all duration-500 border-2 ${statusFilter === "PLANNING" ? "border-[#1976D2]" : "border-transparent"}`}>
                      <div className="w-12 h-12 rounded-[16px] bg-[#E3F2FD]/80 text-[#1976D2] flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black leading-none mb-1.5 ${countPlanning > 0 ? 'text-[#1976D2]' : 'text-gray-300'}`}>{countPlanning}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">กำลังวางแผน</p>
                      </div>
                    </div>

                    {/* In Progress */}
                    <div 
                      onClick={() => setStatusFilter("IN_PROGRESS")}
                      className={`bg-white rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] p-4 flex items-center gap-3 flex-1 min-w-[150px] cursor-pointer hover:-translate-y-1 hover:shadow-[0_15px_50px_rgb(0,0,0,0.06)] transition-all duration-500 border-2 ${statusFilter === "IN_PROGRESS" ? "border-[#F57F17]" : "border-transparent"}`}>
                      <div className="w-12 h-12 rounded-[16px] bg-[#FFF8E1]/80 text-[#F57F17] flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black leading-none mb-1.5 ${countInProgress > 0 ? 'text-[#F57F17]' : 'text-gray-300'}`}>{countInProgress}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">กำลังดำเนินการ</p>
                      </div>
                    </div>

                    {/* Completed */}
                    <div 
                      onClick={() => setStatusFilter("COMPLETED")}
                      className={`bg-white rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] p-4 flex items-center gap-3 flex-1 min-w-[150px] cursor-pointer hover:-translate-y-1 hover:shadow-[0_15px_50px_rgb(0,0,0,0.06)] transition-all duration-500 border-2 ${statusFilter === "COMPLETED" ? "border-[#2E7D32]" : "border-transparent"}`}>
                      <div className="w-12 h-12 rounded-[16px] bg-[#E8F5E9]/80 text-[#2E7D32] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black leading-none mb-1.5 ${countCompleted > 0 ? 'text-[#2E7D32]' : 'text-gray-300'}`}>{countCompleted}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ก่อสร้างแล้วเสร็จ</p>
                      </div>
                    </div>
                    
                    {/* Delayed */}
                    <div 
                      onClick={() => setStatusFilter("DELAYED")}
                      className={`bg-white rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] p-4 flex items-center gap-3 flex-1 min-w-[150px] cursor-pointer hover:-translate-y-1 hover:shadow-[0_15px_50px_rgb(0,0,0,0.06)] transition-all duration-500 border-2 ${statusFilter === "DELAYED" ? "border-[#C62828]" : "border-transparent"}`}>
                      <div className="w-12 h-12 rounded-[16px] bg-[#FFEBEE]/80 text-[#C62828] flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black leading-none mb-1.5 ${countDelayed > 0 ? 'text-[#C62828]' : 'text-gray-300'}`}>{countDelayed}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">งานล่าช้า</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table Section */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-200/60 overflow-hidden text-left flex flex-col mt-4">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center border border-gray-200/50">
                      <Grid className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base tracking-tight">รายการโครงการ</h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">โครงการก่อสร้างในความรับผิดชอบทั้งหมด</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ค้นหา..." 
                        className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none font-medium transition-all" 
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> ตัวกรอง <ChevronDown className="w-3 h-3" />
                    </button>
                    <button onClick={() => setIsCreatingProject(!isCreatingProject)} className="flex items-center gap-2 px-4 py-2 bg-[#171717] text-white rounded-xl text-xs font-bold hover:bg-[#262626] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                      + เพิ่มโครงการ
                    </button>
                  </div>
                </div>

                {isCreatingProject ? (
                  <form onSubmit={handleCreateProject} className="max-w-3xl mx-auto bg-gray-50/50 p-8 rounded-2xl border border-gray-200/60 text-left my-8">
                    <h3 className="font-bold text-gray-900 mb-6 text-lg">สร้างโครงการใหม่</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
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
                      <div className="md:col-span-3 mt-2">
                        <label className="flex items-center gap-3 cursor-pointer p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-colors">
                          <input type="checkbox" checked={isLegacyProject} onChange={(e) => setIsLegacyProject(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer" />
                          <div>
                            <span className="block text-sm font-bold text-emerald-800">✅ โครงการนี้ดำเนินการเสร็จสิ้นแล้ว (นำเข้าข้อมูลประวัติ)</span>
                            <span className="block text-xs text-emerald-600/80 font-medium">ระบบจะข้ามขั้นตอนการทำแผนและปรับความก้าวหน้าเป็น 100% ทันที</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsCreatingProject(false)} className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all">ยกเลิก</button>
                      <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">บันทึกโครงการ</button>
                    </div>
                  </form>
                ) : (
                  <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-[#FAFAFA] border-y border-gray-100">
                        <tr>
                          <th className="px-6 py-4 w-16 text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">WBS</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ชื่อโครงการ</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ผู้ควบคุมงาน</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">สถานะ</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[120px]">ความก้าวหน้า</th>
                          <th className="px-6 py-4 text-center w-32 text-xs font-bold text-gray-400 uppercase tracking-wider">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/80 bg-white">
                        {paginatedProjects.length > 0 ? (
                          paginatedProjects.map((p, idx) => (
                            <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                              <td className="px-6 py-4 text-gray-400 font-medium text-xs">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                              <td className="px-6 py-4 font-mono font-medium text-gray-600 text-xs">{p.wbs}</td>
                              <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                              <td className="px-6 py-4 text-gray-500 font-medium">{p.supervisor || "-"}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wide ${
                                  p.status === 'F4' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]' : 
                                  p.status === 'D1' ? 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]' :
                                  'bg-[#F3E5F5] text-[#6A1B9A] border border-[#E1BEE7]'
                                }`}>
                                  {p.status === 'ปิดงาน (TECO)' ? 'ก่อสร้างแล้วเสร็จ' : (p.status || "C1")}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap min-w-[140px]">
                                <div className="flex flex-col gap-2">
                                  {/* Plan */}
                                  <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                      <span className="text-gray-500">ตามแผน</span>
                                      <span className="text-blue-600">{p.plan_progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-500 ease-out bg-blue-500"
                                        style={{ width: `${p.plan_progress || 0}%` }}
                                      />
                                    </div>
                                  </div>
                                  {/* Actual */}
                                  <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                      <span className="text-gray-500">ทำได้จริง</span>
                                      <span className={`${p.progress === 100 ? 'text-emerald-600' : (p.progress || 0) > 0 ? 'text-purple-700' : 'text-gray-400'}`}>{p.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ease-out ${p.progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                        style={{ width: `${p.progress || 0}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => setSelectedWbs(p.wbs)}
                                    className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-lg text-xs font-bold transition-all shadow-sm"
                                  >
                                    เข้าสู่โครงการ
                                  </button>
                                  <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-300"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                <p className="font-medium text-sm">ไม่พบโครงการที่ตรงกับเงื่อนไข</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {totalPages > 0 && (
                      <div className="px-6 py-4 flex items-center justify-between text-xs text-gray-500 font-medium bg-[#FAFAFA] border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">แสดง</span>
                          <select 
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all cursor-pointer font-bold"
                          >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          <span className="text-gray-400">รายการต่อหน้า</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm transition-all ${currentPage === 1 ? 'bg-gray-50 text-gray-300 cursor-not-allowed border-transparent' : 'bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 text-gray-400'}`}
                          >&lt;</button>
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Simple logic to show pages around current page
                            let pageNum = i + 1;
                            if (totalPages > 5 && currentPage > 3) {
                              pageNum = currentPage - 2 + i;
                              if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                            }
                            return (
                              <button 
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm transition-all font-bold ${currentPage === pageNum ? 'bg-gray-900 border border-gray-900 text-white shadow-md' : 'bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 text-gray-600'}`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}

                          <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm transition-all ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 cursor-not-allowed border-transparent' : 'bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 text-gray-400'}`}
                          >&gt;</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
                      <option value="ร่างแผนงาน">ร่างแผนงาน</option>
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
                  <p className="text-3xl font-black text-gray-900">{activeTasks.length}</p>
                  <p className="text-gray-400 text-[10px] mt-1 font-medium">รายการ</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-1 cursor-default">
                <div>
                  <p className="text-gray-500 text-xs font-bold mb-1">งานที่เสร็จแล้ว</p>
                  <p className="text-3xl font-black text-gray-900">{activeTasksWithDerivedProgress.filter(t => t.derivedProgress === 100).length}</p>
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
                      {actualProgressPercentage}%
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-4 relative z-10 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${actualProgressPercentage}%` }}></div>
                </div>
              </div>

              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-1 cursor-default">
                <div>
                  <p className="text-gray-500 text-xs font-bold mb-1">งานที่กำลังดำเนินการ</p>
                  <p className="text-3xl font-black text-gray-900">{activeTasksWithDerivedProgress.filter(t => t.derivedProgress > 0 && t.derivedProgress < 100).length}</p>
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
                <button onClick={() => setActiveTab("monthly")} className={`flex items-center gap-2 py-2.5 px-6 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "monthly" ? "bg-purple-700 text-white shadow-md shadow-purple-500/20" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                  <Calendar className="w-4 h-4" /> รายงานประจำเดือน
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
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-1">{isPlanningPhase ? "โหมดวางแผนงาน (Planning)" : "โหมดอัปเดตผลงาน (Execution)"}</h3>
                        <p className="text-xs text-gray-500 font-medium">{isPlanningPhase ? "กำหนดเป้าหมายและแผนงานก่อนเริ่มโครงการ" : "รายงานความก้าวหน้าและการดำเนินการจริง"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {isPlanningPhase && (
                          <>
                            <button onClick={handleFastTrackLegacy} className="flex items-center gap-2 px-5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg shadow-sm border border-blue-200 transition-all active:scale-95" title="ปรับ 100% ทันทีสำหรับโครงการเก่า">
                              <CheckCircle className="w-4 h-4" /> สรุปงานเสร็จสิ้น (Legacy)
                            </button>
                            <button onClick={handleLockPlan} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-900/20 transition-all active:scale-95">
                              <CheckCircle className="w-4 h-4" /> ยืนยันและล็อคแผนงาน
                            </button>
                          </>
                        )}
                        {!isPlanningPhase && (
                          <button onClick={handleUnlockPlan} className="flex items-center gap-2 px-5 py-2 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-lg shadow-sm border border-emerald-200 transition-all active:scale-95 group" title="คลิกเพื่อแก้ไขแผนงาน">
                            <CheckCircle2 className="w-4 h-4" /> แผนงานถูกล็อคแล้ว <span className="hidden group-hover:inline ml-1 text-emerald-600 underline">คลิกเพื่อแก้ไข</span>
                          </button>
                        )}
                      </div>
                      <button className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-[10px] text-gray-500 hover:bg-gray-50 transition-colors shadow-sm ml-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {selectedWbs && (
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1 w-full">
                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">รูปแบบลักษณะงานก่อสร้าง (หน้างาน)</label>
                        <select 
                          disabled={!isPlanningPhase}
                          className="w-full max-w-2xl text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-medium text-gray-700 shadow-sm transition-all disabled:bg-gray-100 disabled:text-gray-500"
                          value={projects.find(p => p.wbs === selectedWbs)?.construction_type || "1"}
                          onChange={(e) => handlePatternChange(e.target.value)}
                        >
                          <option value="1">รูปแบบที่ 1: มีครบ 6 ขั้นตอน</option>
                          <option value="2">รูปแบบที่ 2: ไม่มีพาดสายแรงต่ำ และไม่มีรื้อถอน (4 ขั้นตอน)</option>
                          <option value="3">รูปแบบที่ 3: ไม่มีพาดสายแรงต่ำ แต่มีรื้อถอน (5 ขั้นตอน)</option>
                          <option value="4">รูปแบบที่ 4: เฉพาะงานติดตั้งอุปกรณ์หัวเสาและงานพาดสายแรงสูง</option>
                          <option value="5">รูปแบบที่ 5: กำหนดค่าน้ำหนักเอง (Custom)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {showForm && (
                    <form onSubmit={handleSubmit} className="m-6 bg-purple-50/50 p-6 rounded-2xl border border-purple-100 shadow-inner">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">ชื่องาน</label>
                          <input required type="text" value={taskName} onChange={e => setTaskName(e.target.value)} className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-purple-100">
                          <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-200 rounded-xl font-bold transition-colors">ยกเลิก</button>
                          <button type="submit" className="px-5 py-2.5 text-sm bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-md transition-colors">บันทึกข้อมูล</button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Fixed Construction Steps Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-50 to-indigo-50 text-gray-600 text-[11px] uppercase tracking-wider border-b border-purple-100">
                          <th className="font-bold p-4 pl-6 w-8 text-center" rowSpan={2}>#</th>
                          <th className="font-bold p-4 min-w-[200px]" rowSpan={2}>ขั้นตอนงาน</th>
                          <th className="font-bold p-3 text-center border-l border-r border-purple-100 bg-white/50" colSpan={3}>แผนงาน (Plan)</th>
                          <th className="font-bold p-3 text-center border-r border-purple-100 bg-purple-50/50" colSpan={3}>ผลการดำเนินงาน (Actual)</th>
                          <th className="font-bold p-4 text-center min-w-[80px]" rowSpan={2}>น้ำหนัก<br/>(%)</th>
                          <th className="font-bold p-4 text-center min-w-[80px]" rowSpan={2}>ความก้าวหน้า<br/>(%)</th>
                          <th className="font-bold p-4 text-center min-w-[100px]" rowSpan={2}>สถานะ</th>
                        </tr>
                        <tr className="bg-gradient-to-r from-purple-50 to-indigo-50 text-gray-600 text-[10px] tracking-wider border-b border-purple-100">
                          <th className="font-medium p-2 text-center min-w-[110px] border-l border-purple-100 bg-white/50">วันที่เริ่ม</th>
                          <th className="font-medium p-2 text-center min-w-[110px] bg-white/50">วันที่เสร็จ</th>
                          <th className="font-medium p-2 text-center min-w-[90px] border-r border-purple-100 bg-white/50">เป้าหมาย</th>
                          <th className="font-medium p-2 text-center min-w-[110px] bg-purple-50/50">วันที่เริ่มจริง</th>
                          <th className="font-medium p-2 text-center min-w-[110px] bg-purple-50/50">วันที่เสร็จจริง</th>
                          <th className="font-medium p-2 text-center min-w-[90px] border-r border-purple-100 bg-purple-50/50">ทำได้จริง</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-sm">
                        {activeTasks.map((task, index) => {
                          const stepDef = FIXED_CONSTRUCTION_STEPS.find(s => s.order === (task.step_order ?? index));
                          const targetQty = Number(task.target_qty) || 0;
                          const doneQty = Number(task.done_qty) || 0;
                          const progressVal = targetQty > 0 ? Math.min(100, Math.round((doneQty / targetQty) * 100)) : 0;
                          let statusLabel = "รอดำเนินการ";
                          let statusColor = "bg-gray-100 text-gray-500 border-gray-200";
                          let statusDot = "bg-gray-400";
                          if (progressVal === 100) {
                            statusLabel = "เสร็จสมบูรณ์";
                            statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            statusDot = "bg-emerald-500";
                          } else if (progressVal > 0) {
                            statusLabel = "กำลังดำเนินการ";
                            statusColor = "bg-amber-50 text-amber-700 border-amber-200";
                            statusDot = "bg-amber-500";
                          }
                          const isSaving = savingStepId === task.id;
                          const stepColor = index === 0 ? "text-blue-600" : index <= 2 ? "text-purple-700" : index <= 4 ? "text-orange-600" : index === 5 ? "text-teal-600" : "text-red-600";

                          return (
                            <tr key={task.id} className={`hover:bg-purple-50/40 transition-all duration-200 group ${isSaving ? 'opacity-70' : ''}`}>
                              <td className="p-3 pl-6 text-center border-r border-gray-50">
                                <div className={`w-7 h-7 rounded-lg inline-flex items-center justify-center text-xs font-black ${
                                  progressVal === 100 ? 'bg-emerald-100 text-emerald-700' : progressVal > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {progressVal === 100 ? <CheckCircle2 className="w-4 h-4" /> : task.step_order}
                                </div>
                              </td>
                              <td className="p-3 border-r border-gray-50">
                                <div className="flex flex-col gap-0.5">
                                  {currentProject?.construction_type === '5' ? (
                                    <input
                                      type="text"
                                      value={task.task_name}
                                      disabled={!isPlanningPhase}
                                      onChange={(e) => handleStepUpdate(task.id, "task_name", e.target.value)}
                                      className={`font-bold text-[12px] ${stepColor} w-full bg-white border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-400 outline-none hover:border-purple-300 transition-colors disabled:opacity-70 disabled:bg-gray-50`}
                                    />
                                  ) : (
                                    <span className={`font-bold text-[12px] ${stepColor}`}>{task.task_name}</span>
                                  )}
                                  <span className="text-[10px] text-gray-400 font-medium">หน่วย: {stepDef?.unit || 'รายการ'}</span>
                                </div>
                              </td>
                              
                              {/* Plan Section */}
                              <td className="p-2 text-center bg-white/30 border-l border-gray-50">
                                <input
                                  type="date"
                                  value={task.start_date || ""}
                                  disabled={!isPlanningPhase}
                                  onChange={(e) => handleStepUpdate(task.id, "start_date", e.target.value)}
                                  className="w-[105px] text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-400 outline-none font-medium text-gray-600 hover:border-purple-300 transition-colors disabled:opacity-70 disabled:bg-gray-50"
                                />
                              </td>
                              <td className="p-2 text-center bg-white/30">
                                <input
                                  type="date"
                                  value={task.end_date || ""}
                                  disabled={!isPlanningPhase}
                                  onChange={(e) => handleStepUpdate(task.id, "end_date", e.target.value)}
                                  className="w-[105px] text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-400 outline-none font-medium text-gray-600 hover:border-purple-300 transition-colors disabled:opacity-70 disabled:bg-gray-50"
                                />
                              </td>
                              <td className="p-2 text-center bg-white/30 border-r border-gray-50">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={task.target_qty ?? ""}
                                    disabled={!isPlanningPhase}
                                    onChange={(e) => handleStepUpdate(task.id, "target_qty", e.target.value === "" ? null : Number(e.target.value))}
                                    className="w-14 text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:ring-2 focus:ring-purple-400 outline-none font-bold text-gray-700 hover:border-purple-300 transition-colors disabled:opacity-70 disabled:bg-gray-50"
                                  />
                                </div>
                              </td>
                              
                              {/* Actual Section */}
                              <td className="p-2 text-center bg-purple-50/30">
                                <input
                                  type="date"
                                  value={task.actual_start_date || ""}
                                  disabled={isPlanningPhase}
                                  onChange={(e) => handleStepUpdate(task.id, "actual_start_date", e.target.value)}
                                  className="w-[105px] text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-400 outline-none font-medium text-purple-700 hover:border-purple-300 transition-colors disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                              </td>
                              <td className="p-2 text-center bg-purple-50/30">
                                <input
                                  type="date"
                                  value={task.actual_end_date || ""}
                                  disabled={isPlanningPhase}
                                  onChange={(e) => handleStepUpdate(task.id, "actual_end_date", e.target.value)}
                                  className="w-[105px] text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-400 outline-none font-medium text-purple-700 hover:border-purple-300 transition-colors disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                              </td>
                              <td className="p-2 text-center bg-purple-50/30 border-r border-gray-50">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={task.done_qty ?? ""}
                                    disabled={isPlanningPhase}
                                    onChange={(e) => handleStepUpdate(task.id, "done_qty", e.target.value === "" ? null : Number(e.target.value))}
                                    className="w-14 text-[11px] bg-white border border-purple-200 rounded-lg px-2 py-1.5 text-center focus:ring-2 focus:ring-purple-500 outline-none font-bold text-purple-700 hover:border-purple-400 transition-colors shadow-sm disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  />
                                </div>
                              </td>

                              <td className="p-2 text-center border-r border-gray-50">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={task.weight ?? stepDef?.defaultWeight ?? 0}
                                  onChange={(e) => handleStepUpdate(task.id, "weight", Number(e.target.value))}
                                  disabled={currentProject?.construction_type !== '5' || !isPlanningPhase}
                                  className={`w-14 text-[11px] ${(currentProject?.construction_type === '5' && isPlanningPhase) ? 'bg-white hover:border-purple-300' : 'bg-gray-50'} border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:ring-2 focus:ring-purple-400 outline-none font-bold text-gray-700 transition-colors mx-auto block disabled:opacity-70 disabled:bg-gray-50`}
                                />
                              </td>
                              <td className="p-3 text-center border-r border-gray-50">
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span className={`text-sm font-black ${progressVal === 100 ? 'text-emerald-600' : progressVal > 0 ? 'text-purple-700' : 'text-gray-400'}`}>
                                    {progressVal}%
                                  </span>
                                  <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ease-out ${progressVal === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                      style={{ width: `${progressVal}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold border ${statusColor} whitespace-nowrap`}>
                                  <span className={`w-1 h-1 rounded-full ${statusDot}`}></span>
                                  {statusLabel}
                                </span>
                                {currentProject?.construction_type === '5' && (
                                  <button onClick={() => handleDelete(task.id)} className="ml-2 text-red-400 hover:text-red-600 transition-colors" title="ลบขั้นตอน">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Summary Row */}
                        {tasks.length > 0 && (
                          <tr className="bg-gradient-to-r from-purple-50 to-indigo-50 border-t-2 border-purple-200">
                            <td className="p-4 pl-6 text-center" colSpan={2}>
                              <span className="font-extrabold text-purple-800 text-sm">รวมทั้งหมด</span>
                            </td>
                            <td className="p-4 text-center" colSpan={6}>
                              <span className="text-xs text-gray-500 font-medium">
                                {tasks.filter(t => {
                                  const targetQty = Number(t.target_qty) || 0;
                                  const doneQty = Number(t.done_qty) || 0;
                                  const p = targetQty > 0 ? Math.min(100, Math.round((doneQty / targetQty) * 100)) : 0;
                                  return p === 100 && (t.weight ?? FIXED_CONSTRUCTION_STEPS.find(s => s.order === t.step_order)?.defaultWeight ?? 0) > 0;
                                }).length} / {activeTasks.length} ขั้นตอนเสร็จ
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-xs font-black text-purple-700">
                                {tasks.reduce((sum, t) => sum + (Number(t.weight) || 0), 0)}%
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                      width: `${(() => {
                                        const totalWeight = tasks.reduce((sum, t) => sum + (Number(t.weight) || 0), 0);
                                        if (totalWeight === 0) return 0;
                                        return tasks.reduce((sum, t) => {
                                          const w = Number(t.weight) || 0;
                                          const targetQty = Number(t.target_qty) || 0;
                                          const doneQty = Number(t.done_qty) || 0;
                                          const p = targetQty > 0 ? Math.min(100, Math.round((doneQty / targetQty) * 100)) : 0;
                                          return sum + (w * p / 100);
                                        }, 0) / totalWeight * 100;
                                      })()}%`
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-black text-purple-800 min-w-[42px] text-right">
                                  {(() => {
                                    const totalWeight = tasks.reduce((sum, t) => sum + (Number(t.weight) || 0), 0);
                                    if (totalWeight === 0) return "0.0";
                                    return (tasks.reduce((sum, t) => {
                                      const w = Number(t.weight) || 0;
                                      const targetQty = Number(t.target_qty) || 0;
                                      const doneQty = Number(t.done_qty) || 0;
                                      const p = targetQty > 0 ? Math.min(100, Math.round((doneQty / targetQty) * 100)) : 0;
                                      return sum + (w * p / 100);
                                    }, 0) / totalWeight * 100).toFixed(1);
                                  })()}%
                                </span>
                              </div>
                            </td>
                            <td className="p-4"></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    
                    {currentProject?.construction_type === '5' && (
                      <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-center">
                        <button onClick={handleAddCustomStep} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm">
                          <Plus className="w-4 h-4" /> เพิ่มขั้นตอนงาน
                        </button>
                      </div>
                    )}
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
                        {activeTasks.map(task => {
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

              {/* TAB: MONTHLY REPORT */}
              {activeTab === "monthly" && (
                <div className="p-6 min-h-[700px] flex flex-col animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900">อัปเดตผลงานประจำเดือน</h3>
                      <p className="text-sm text-gray-500 mt-1">ระบุปริมาณงานที่ดำเนินการแล้วเสร็จในแต่ละเดือน</p>
                    </div>
                    <div className="flex items-center gap-3 bg-purple-50 p-2.5 rounded-xl border border-purple-100 shadow-inner">
                      <label className="text-sm font-bold text-purple-900 ml-2">เลือกเดือนที่ต้องการรายงาน:</label>
                      <input 
                        type="month" 
                        value={reportMonth}
                        onChange={(e) => setReportMonth(e.target.value)}
                        className="bg-white border border-purple-200 rounded-lg px-4 py-2 font-bold text-purple-700 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {isPlanningPhase ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center animate-in fade-in zoom-in-95 duration-500">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 mb-6 shadow-sm border border-gray-100">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-black text-gray-700 mb-3">ยังอยู่ในโหมดวางแผนงาน</h4>
                      <p className="text-gray-500 max-w-md font-medium leading-relaxed">
                        คุณต้องทำการ <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ยืนยันและล็อคแผนงาน</span> ในหน้าแผนงานก่อน จึงจะสามารถเริ่มรายงานความก้าวหน้าประจำเดือนได้
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-6">
                      {/* Input Table */}
                      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                      {monthlyLoading ? (
                        <div className="flex justify-center items-center h-60">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-purple-700"></div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 text-gray-600 text-[11px] uppercase tracking-wider border-b border-purple-100">
                                <th className="font-bold p-4">ขั้นตอนงาน</th>
                                <th className="font-bold p-4 text-center w-24 border-l border-gray-100">เป้าหมาย</th>
                                <th className="font-bold p-4 text-center w-28 border-l border-gray-100">สะสมทั้งหมด</th>
                                <th className="font-bold p-4 text-center w-36 border-l border-gray-100">ความก้าวหน้า</th>
                                <th className="font-bold p-4 text-purple-700 text-center w-40 bg-purple-100/50 border-l border-purple-100">ทำได้เดือนนี้</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {activeTasks.map((task, index) => {
                                const stepDef = FIXED_CONSTRUCTION_STEPS.find(s => s.order === task.step_order);
                                const targetQty = Number(task.target_qty) || 0;
                                const totalDoneQty = Number(task.done_qty) || 0;
                                const monthQty = monthlyData[task.id] || 0;
                                const progressPct = targetQty > 0 ? Math.min(100, Math.round((totalDoneQty / targetQty) * 100)) : 0;
                                const stepColor = index === 0 ? "text-blue-600" : index <= 2 ? "text-purple-700" : index <= 4 ? "text-orange-600" : index === 5 ? "text-teal-600" : "text-red-600";
                                
                                return (
                                  <tr key={task.id} className="hover:bg-purple-50/20 transition-colors group">
                                    <td className="p-4">
                                      <p className={`font-bold text-[12px] ${stepColor} mb-0.5`}>{task.task_name}</p>
                                      <p className="text-[10px] text-gray-400 font-medium">หน่วย: {stepDef?.unit || 'รายการ'}</p>
                                    </td>
                                    <td className="p-4 text-center font-bold text-gray-600 border-l border-gray-50 bg-gray-50/30">{targetQty}</td>
                                    <td className="p-4 text-center border-l border-gray-50 bg-gray-50/30">
                                      <div className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-full font-black text-sm ${totalDoneQty >= targetQty && targetQty > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-700 border border-gray-200'}`}>
                                        {totalDoneQty}
                                      </div>
                                    </td>
                                    <td className="p-4 border-l border-gray-50">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                          <div 
                                            className={`h-full rounded-full transition-all duration-500 ${progressPct >= 100 ? 'bg-emerald-500' : progressPct > 50 ? 'bg-blue-500' : progressPct > 0 ? 'bg-amber-500' : 'bg-gray-200'}`}
                                            style={{ width: `${Math.min(progressPct, 100)}%` }}
                                          />
                                        </div>
                                        <span className={`text-xs font-black min-w-[36px] text-right ${progressPct >= 100 ? 'text-emerald-600' : progressPct > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{progressPct}%</span>
                                      </div>
                                    </td>
                                    <td className="p-3 bg-purple-50/30 border-l border-purple-50 relative group-hover:bg-purple-50/60 transition-colors">
                                      <div className="absolute inset-y-0 left-0 w-1 bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                      <input
                                        type="number"
                                        min="0"
                                        value={monthQty === 0 ? "" : monthQty}
                                        placeholder="0"
                                        onChange={(e) => handleMonthlyUpdate(task.id, e.target.value === "" ? null : Number(e.target.value))}
                                        className="w-full text-center bg-white border-2 border-purple-100 rounded-xl px-3 py-2.5 font-black text-purple-700 text-base focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none hover:border-purple-300 transition-all shadow-sm"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      </div>

                      {/* Monthly Summary Table */}
                      {(() => {
                        // Generate months from project start to current
                        const projectTasks = activeTasks;
                        if (projectTasks.length === 0) return null;
                        
                        const allStartDates = projectTasks.map(t => t.start_date).filter(Boolean).sort();
                        const allEndDates = projectTasks.map(t => t.end_date).filter(Boolean).sort();
                        if (allStartDates.length === 0) return null;
                        
                        const projectStartDate = new Date(allStartDates[0]);
                        const projectEndDate = allEndDates.length > 0 ? new Date(allEndDates[allEndDates.length - 1]) : new Date();
                        const today = new Date();
                        const lastDate = today > projectEndDate ? today : projectEndDate;
                        
                        const months: string[] = [];
                        const d = new Date(projectStartDate.getFullYear(), projectStartDate.getMonth(), 1);
                        while (d <= lastDate) {
                          months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                          d.setMonth(d.getMonth() + 1);
                        }
                        
                        if (months.length === 0) return null;
                        
                        const totalWeight = projectTasks.reduce((sum, t) => sum + (Number(t.weight) || 0), 0);
                        if (totalWeight === 0) return null;
                        
                        const thaiMonthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                        
                        const monthSummary = months.map(m => {
                          const [year, month] = m.split('-').map(Number);
                          const endOfMonth = new Date(year, month, 0); // last day of month
                          const endOfMonthStr = endOfMonth.toISOString().split('T')[0];
                          const thaiYear = year + 543;
                          
                          // Calculate plan % at end of this month
                          let planPct = 0;
                          projectTasks.forEach(t => {
                            const w = Number(t.weight) || 0;
                            const tStart = new Date(t.start_date).getTime();
                            const tEnd = new Date(t.end_date).getTime();
                            const eom = endOfMonth.getTime();
                            
                            let pct = 0;
                            if (eom >= tEnd) pct = 100;
                            else if (eom > tStart && tEnd > tStart) pct = ((eom - tStart) / (tEnd - tStart)) * 100;
                            
                            planPct += (w * pct / 100);
                          });
                          planPct = planPct / totalWeight * 100;
                          
                          // Calculate actual % — cumulative done_qty up to this month
                          let actualPct = 0;
                          projectTasks.forEach(t => {
                            const w = Number(t.weight) || 0;
                            const targetQty = Number(t.target_qty) || 0;
                            if (targetQty === 0) return;
                            
                            // Sum done_qty from allMonthlyData for this task up to this month
                            const cumulativeDone = allMonthlyData
                              .filter(r => r.task_id === t.id && r.report_month <= m)
                              .reduce((sum: number, r: any) => sum + Number(r.done_qty), 0);
                            
                            const pct = Math.min(100, (cumulativeDone / targetQty) * 100);
                            actualPct += (w * pct / 100);
                          });
                          actualPct = actualPct / totalWeight * 100;
                          
                          const diff = actualPct - planPct;
                          const currentMonth = new Date().toISOString().slice(0, 7);
                          const isFuture = m > currentMonth;
                          
                          return {
                            month: m,
                            label: `${thaiMonthNames[month - 1]} ${String(thaiYear).slice(-2)}`,
                            plan: Number(planPct.toFixed(1)),
                            actual: isFuture ? null : Number(actualPct.toFixed(1)),
                            diff: isFuture ? null : Number(diff.toFixed(1)),
                            isCurrent: m === currentMonth
                          };
                        });
                        
                        return (
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/30 to-purple-50/30">
                              <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                สรุปความก้าวหน้ารายเดือน
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">เปรียบเทียบผลงานจริงกับแผนงานตั้งแต่เริ่มโครงการ</p>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                    <th className="font-bold p-3 text-left">เดือน</th>
                                    <th className="font-bold p-3 text-center w-28">ตามแผน (%)</th>
                                    <th className="font-bold p-3 text-center w-28">ทำได้จริง (%)</th>
                                    <th className="font-bold p-3 text-center w-20">+/-</th>
                                    <th className="font-bold p-3 text-left min-w-[200px]">กราฟเปรียบเทียบ</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {monthSummary.map((row) => (
                                    <tr key={row.month} className={`hover:bg-gray-50/50 transition-colors ${row.isCurrent ? 'bg-purple-50/40 border-l-4 border-l-purple-500' : ''}`}>
                                      <td className={`p-3 font-bold text-sm ${row.isCurrent ? 'text-purple-700' : 'text-gray-700'}`}>
                                        {row.label}
                                        {row.isCurrent && <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">เดือนนี้</span>}
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className="font-bold text-blue-600">{row.plan}%</span>
                                      </td>
                                      <td className="p-3 text-center">
                                        {row.actual !== null ? (
                                          <span className={`font-bold ${row.actual >= row.plan ? 'text-emerald-600' : 'text-orange-600'}`}>{row.actual}%</span>
                                        ) : (
                                          <span className="text-gray-300">-</span>
                                        )}
                                      </td>
                                      <td className="p-3 text-center">
                                        {row.diff !== null ? (
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black ${
                                            row.diff >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                                          }`}>
                                            {row.diff >= 0 ? '+' : ''}{row.diff}%
                                          </span>
                                        ) : (
                                          <span className="text-gray-300">-</span>
                                        )}
                                      </td>
                                      <td className="p-3">
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] text-blue-500 font-bold w-6">แผน</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                              <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${row.plan}%` }} />
                                            </div>
                                          </div>
                                          {row.actual !== null && (
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[9px] text-purple-500 font-bold w-6">จริง</span>
                                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-500 ${row.actual >= row.plan ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ width: `${row.actual}%` }} />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
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
                      <option>ข้อมูลเดือน: ส.ค. 2569</option>
                    </select>
                  </div>
                  
                  {!showBudgetMock ? (
                    <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center mt-6">
                      <BarChart2 className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-bold text-lg mb-2">ยังไม่มีข้อมูลเบิกจ่ายงบประมาณ</p>
                      <p className="text-gray-400 text-sm mb-6">คุณสามารถเพิ่มรายละเอียดข้อมูลการเบิกจ่ายสำหรับโครงการนี้ได้</p>
                      <button 
                        onClick={() => setShowBudgetMock(true)}
                        className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">
                        + เพิ่มรายละเอียดเบิกจ่าย
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Summary KPI Cards */}
                      <div className="grid grid-cols-5 gap-4">
                        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border-l-4 border-[#8E24AA] p-4 flex flex-col justify-center">
                          <p className="text-[10px] text-gray-400 font-bold mb-1">วงเงินงบประมาณ</p>
                          <h4 className="text-xl font-black text-[#8E24AA]">฿10,008,111.96</h4>
                        </div>
                        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border-l-4 border-[#2E7D32] p-4 flex flex-col justify-center">
                          <p className="text-[10px] text-gray-400 font-bold mb-1">จ่ายจริงสะสม</p>
                          <h4 className="text-xl font-black text-[#2E7D32]">฿745,961.75</h4>
                        </div>
                        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border-l-4 border-[#D32F2F] p-4 flex flex-col justify-center">
                          <p className="text-[10px] text-gray-400 font-bold mb-1">ภาระผูกพัน</p>
                          <h4 className="text-xl font-black text-[#D32F2F]">฿1,265,226.38</h4>
                        </div>
                        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border-l-4 border-[#F57C00] p-4 flex flex-col justify-center">
                          <p className="text-[10px] text-gray-400 font-bold mb-1">งบคงเหลือ</p>
                          <h4 className="text-xl font-black text-[#F57C00]">฿7,996,923.83</h4>
                        </div>
                        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border-l-4 border-[#1976D2] p-4 flex flex-col justify-center">
                          <p className="text-[10px] text-gray-400 font-bold mb-1">อัตราเบิกจ่าย</p>
                          <h4 className="text-xl font-black text-[#1976D2]">7.45%</h4>
                        </div>
                      </div>

                      {/* Bar Chart */}
                      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6">
                        <h4 className="text-sm font-extrabold text-gray-800 mb-6">กราฟเปรียบเทียบแผนเบิกจ่าย vs จ่ายจริง (รายเดือน)</h4>
                        <div className="w-full h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { month: 'ม.ค. 2569', plan: 0, actual: 0 },
                                { month: 'ก.พ. 2569', plan: 0, actual: 0 },
                                { month: 'มี.ค. 2569', plan: 0, actual: 0 },
                                { month: 'เม.ย. 2569', plan: 0, actual: 300000 },
                                { month: 'พ.ค. 2569', plan: 300000, actual: 400000 },
                                { month: 'มิ.ย. 2569', plan: 500000, actual: 500000 },
                                { month: 'ก.ค. 2569', plan: 700000, actual: 600000 },
                                { month: 'ส.ค. 2569', plan: 1200000, actual: 745961.75 },
                                { month: 'ก.ย. 2569', plan: 4800000, actual: 0 },
                                { month: 'ต.ค. 2569', plan: 6000000, actual: 0 },
                                { month: 'พ.ย. 2569', plan: 8800000, actual: 0 },
                                { month: 'ธ.ค. 2569', plan: 15000000, actual: 0 },
                                { month: 'สะสมถึง ส.ค.', plan: 1200000, actual: 745961.75 },
                              ]}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#6B7280' }} 
                                tickFormatter={(val) => `${val / 1000000}M`}
                                dx={-10}
                              />
                              <RechartsTooltip 
                                formatter={(value: any) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value) || 0)}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                              />
                              <Legend iconType="rect" iconSize={12} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#4B5563', paddingBottom: '20px' }} verticalAlign="top" height={50} />
                              <Bar dataKey="plan" name="แผนเบิกจ่าย" fill="#5C93C7" radius={[2, 2, 0, 0]} barSize={30} />
                              <Bar dataKey="actual" name="จ่ายจริง" fill="#7DCEA0" radius={[2, 2, 0, 0]} barSize={30} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Detail Table */}
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-800 mb-4">รายละเอียดข้อมูลเบิกจ่าย</h4>
                        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-500 font-bold uppercase whitespace-nowrap">
                                <th className="p-4 text-center">ลำดับ</th>
                                <th className="p-4">รายการ</th>
                                <th className="p-4">WBS</th>
                                <th className="p-4 text-right">วงเงินงบประมาณ</th>
                                <th className="p-4 text-right">จ่ายจริงสะสม</th>
                                <th className="p-4 text-right">วงเงินคงเหลือ</th>
                                <th className="p-4 text-right">ภาระผูกพันรวม</th>
                                <th className="p-4 text-right">PR</th>
                                <th className="p-4 text-right">PO</th>
                                <th className="p-4 text-right">GR</th>
                                <th className="p-4 text-right">IR</th>
                                <th className="p-4 text-right">งบคงเหลือ</th>
                                <th className="p-4 text-right">% เบิกจ่าย</th>
                                <th className="p-4 text-center">สถานะ</th>
                              </tr>
                            </thead>
                            <tbody className="text-[11px] text-gray-700 divide-y divide-gray-50">
                              {[
                                { id: 1, item: "งานก่อสร้างสถานีไฟฟ้าสมุทรสาคร 18 (ทวิต)", wbs: "I-69-I-BNCXX.19.3904", totalBudget: 0.00, actualPaid: 0.00, remaining: 0.00, obligation: 0.00, pr: 0.00, po: 0.00, gr: 0.00, ir: 0.00, remainB: 0.00, percent: 0, status: "PREL BUDG AVAC // Z0", statusColor: "text-blue-500 bg-blue-50" },
                                { id: 2, item: "ก่อสร้างสถานีไฟฟ้าสมุทรสาคร 18 (ซ)", wbs: "I-69-I-BNCXX.19.3904.A", totalBudget: 7131005.88, actualPaid: 682124.35, remaining: 6448881.53, obligation: 1265226.38, pr: 362.62, po: 1255670.00, gr: 0.00, ir: 9193.76, remainB: 5183655.15, percent: 9.57, status: "REL BUDG AVAC NTUP SETC // C1", statusColor: "text-orange-500 bg-orange-50" },
                                { id: 3, item: "กล.สายส่ง 115kV รองรับ สฟฟ.สค.18(ซ)", wbs: "I-69-I-BNCXX.19.3904.B", totalBudget: 1277889.20, actualPaid: 0.00, remaining: 1277889.20, obligation: 0.00, pr: 0.00, po: 0.00, gr: 0.00, ir: 0.00, remainB: 1277889.20, percent: 0, status: "CRTD BUDG AVAC NTUP SETC // C1", statusColor: "text-orange-500 bg-orange-50" },
                                { id: 4, item: "กล.ระบบจำหน่าย 22kV รองรับ สฟฟ.สค.18(ซ)", wbs: "I-69-I-BNCXX.19.3904.C", totalBudget: 1196310.20, actualPaid: 0.00, remaining: 1196310.20, obligation: 0.00, pr: 0.00, po: 0.00, gr: 0.00, ir: 0.00, remainB: 1196310.20, percent: 0, status: "CRTD BUDG AVAC NTUP SETC // B2", statusColor: "text-orange-500 bg-orange-50" },
                                { id: 5, item: "กส.ระบบสื่อสาร รองรับ สฟฟ.สค.18(ซ)", wbs: "I-69-I-BNCXX.19.3904.D", totalBudget: 103286.04, actualPaid: 0.00, remaining: 103286.04, obligation: 0.00, pr: 0.00, po: 0.00, gr: 0.00, ir: 0.00, remainB: 103286.04, percent: 0, status: "CRTD BUDG AVAC SETC // B2", statusColor: "text-orange-500 bg-orange-50" },
                                { id: 6, item: "จุด A ติดตั้ง DIS Tie Line บริเวณ ปากซอย", wbs: "I-69-I-BNCXX.19.3904.E", totalBudget: 27135.00, actualPaid: 8.10, remaining: 27126.90, obligation: 0.00, pr: 0.00, po: 0.00, gr: 0.00, ir: 0.00, remainB: 27126.90, percent: 0.03, status: "REL BUDG AVAC NTUP SETC // C1", statusColor: "text-orange-500 bg-orange-50" },
                                { id: 7, item: "จุด B ติดตั้ง DIS Tie Line บริเวณ ปากซอย", wbs: "I-69-I-BNCXX.19.3904.F", totalBudget: 10691.12, actualPaid: 4.51, remaining: 10686.61, obligation: 0.00, pr: 0.00, po: 0.00, gr: 0.00, ir: 0.00, remainB: 10686.61, percent: 0.04, status: "REL BUDG AVAC NTUP SETC // C1", statusColor: "text-orange-500 bg-orange-50" },
                                { id: 8, item: "จุด C ติดตั้ง SF6 แทน DIS (KTB08S-11) บริ", wbs: "I-69-I-BNCXX.19.3904.G", totalBudget: 44684.48, actualPaid: 27.59, remaining: 44656.89, obligation: 0.00, pr: 0.00, po: 0.00, gr: 0.00, ir: 0.00, remainB: 44656.89, percent: 0.06, status: "REL BUDG AVAC NTUP SETC // C1", statusColor: "text-orange-500 bg-orange-50" }
                              ].map((row) => (
                                <tr key={row.id} className="hover:bg-purple-50/30 transition-colors">
                                  <td className="p-4 text-center font-medium">{row.id}</td>
                                  <td className="p-4 font-bold min-w-[200px]" title={row.item}>{row.item}</td>
                                  <td className="p-4 text-gray-500 whitespace-nowrap">{row.wbs}</td>
                                  <td className="p-4 text-right font-medium">{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(row.totalBudget)}</td>
                                  <td className="p-4 text-right font-medium">{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(row.actualPaid)}</td>
                                  <td className="p-4 text-right font-medium text-blue-600">{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(row.remaining)}</td>
                                  <td className="p-4 text-right font-medium text-red-500">{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(row.obligation)}</td>
                                  <td className="p-4 text-right text-gray-500">{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(row.pr)}</td>
                                  <td className="p-4 text-right text-green-600 font-medium">{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(row.po)}</td>
                                  <td className="p-4 text-right text-gray-500">{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(row.gr)}</td>
                                  <td className="p-4 text-right text-gray-500">{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(row.ir)}</td>
                                  <td className="p-4 text-right font-bold text-gray-800">{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(row.remainB)}</td>
                                  <td className="p-4 text-right font-medium">{row.percent}%</td>
                                  <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider whitespace-nowrap ${row.statusColor}`}>
                                      {row.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
