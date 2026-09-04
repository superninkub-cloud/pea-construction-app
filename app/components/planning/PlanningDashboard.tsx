"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Project {
  id: string;
  wbs: string;
  name: string;
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
    const { data, error } = await supabase.from("projects").select("id, wbs, name").order("wbs");
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

  return (
    <div className="p-6 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">วางแผนงานก่อสร้าง</h1>
          <p className="text-gray-500 mt-1">Gantt Chart & Task Management</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-white/50 mb-6 transition-all">
        <label className="block text-sm font-semibold text-gray-700 mb-2">เลือกโครงการ (WBS)</label>
        <select
          value={selectedWbs}
          onChange={(e) => setSelectedWbs(e.target.value)}
          className="w-full p-3 bg-white/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all outline-none backdrop-blur-md"
        >
          <option value="">-- กรุณาเลือกโครงการ --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.wbs}>
              {p.wbs} - {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedWbs && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task List Section */}
          <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-6 overflow-hidden flex flex-col h-[700px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">รายการงาน (Tasks)</h2>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="bg-[#007AFF] hover:bg-[#005bb5] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-md shadow-blue-500/30"
              >
                + เพิ่มงาน
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ชื่องาน</label>
                    <input required type="text" value={taskName} onChange={e => setTaskName(e.target.value)} className="w-full p-2 text-sm border rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">เริ่ม (แผน)</label>
                      <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 text-sm border rounded bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">เสร็จ (แผน)</label>
                      <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 text-sm border rounded bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">เริ่ม (จริง)</label>
                      <input type="date" value={actualStartDate} onChange={e => setActualStartDate(e.target.value)} className="w-full p-2 text-sm border border-blue-200 rounded bg-blue-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">เสร็จ (จริง)</label>
                      <input type="date" value={actualEndDate} onChange={e => setActualEndDate(e.target.value)} className="w-full p-2 text-sm border border-blue-200 rounded bg-blue-50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ความก้าวหน้า (%)</label>
                      <input type="number" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full p-2 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ผู้รับผิดชอบ</label>
                      <input type="text" value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full p-2 text-sm border rounded" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded">ยกเลิก</button>
                    <button type="submit" className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded">บันทึก</button>
                  </div>
                </div>
              </form>
            )}

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-10">ยังไม่มีงานในโครงการนี้</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.id} className="p-3 border border-gray-100 rounded-lg hover:border-[#851a70] transition-colors group cursor-default">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{task.task_name}</h3>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(task)} className="text-blue-500 hover:text-blue-700 text-xs">แก้ไข</button>
                          <button onClick={() => handleDelete(task.id)} className="text-red-500 hover:text-red-700 text-xs">ลบ</button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        แผน: {new Date(task.start_date).toLocaleDateString('th-TH')} - {new Date(task.end_date).toLocaleDateString('th-TH')}
                        {task.assignee && ` • 👨‍🔧 ${task.assignee}`}
                      </p>
                      {(task.actual_start_date || task.actual_end_date) && (
                        <p className="text-xs text-blue-600 mb-2">
                          จริง: {task.actual_start_date ? new Date(task.actual_start_date).toLocaleDateString('th-TH') : '-'} - {task.actual_end_date ? new Date(task.actual_end_date).toLocaleDateString('th-TH') : 'ยังไม่ระบุ'}
                        </p>
                      )}
                      {(!task.actual_start_date && !task.actual_end_date) && <div className="mb-2"></div>}
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Gantt Chart Section */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-6 h-[700px] flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">ไทม์ไลน์ (Gantt Chart)</h2>
            {tasks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                เพิ่มงานเพื่อดูแผนภูมิ Gantt Chart
              </div>
            ) : (
              <div className="flex-1 overflow-auto border border-gray-100 rounded-2xl bg-gray-50/50 relative">
                <div className="min-w-[800px] h-full p-4 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex justify-between px-4 pointer-events-none opacity-10">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-full border-l border-gray-400 border-dashed"></div>
                    ))}
                  </div>

                  <div className="space-y-6 mt-8 relative z-10">
                    {tasks.map(task => {
                      const planLeft = getLeftOffset(task.start_date);
                      const planWidth = getWidth(task.start_date, task.end_date);
                      
                      let actualLeft = 0;
                      let actualWidth = 0;
                      let isDelayed = false;
                      
                      if (task.actual_start_date) {
                        actualLeft = getLeftOffset(task.actual_start_date);
                        // If no actual end date, use today's date or plan end date for visualization
                        const endDateToUse = task.actual_end_date || new Date().toISOString().split('T')[0];
                        actualWidth = getWidth(task.actual_start_date, endDateToUse);
                        
                        if (task.actual_end_date && new Date(task.actual_end_date) > new Date(task.end_date)) {
                          isDelayed = true;
                        } else if (!task.actual_end_date && new Date() > new Date(task.end_date)) {
                          isDelayed = true;
                        }
                      }

                      return (
                        <div key={task.id} className="relative h-14 w-full flex items-center group mb-2">
                          {/* Label and bars container */}
                          <div className="absolute w-full h-full flex flex-col justify-center gap-1">
                            
                            {/* PLAN BAR (Gray) */}
                            <div 
                              className="absolute h-6 rounded-md bg-gray-200 border border-gray-300 shadow-sm overflow-hidden flex items-center"
                              style={{ left: `${planLeft}%`, width: `${planWidth}%`, top: '0' }}
                            >
                               <span className="text-[10px] font-bold text-gray-500 px-2 truncate w-full text-center">แผน: {task.task_name}</span>
                            </div>

                            {/* ACTUAL BAR (Blue or Red) */}
                            {task.actual_start_date && (
                              <div 
                                className={`absolute h-6 rounded-md shadow-sm overflow-hidden flex items-center transition-all group-hover:shadow-md group-hover:scale-[1.01] ${isDelayed ? 'bg-red-100 border border-red-300' : 'bg-blue-100 border border-blue-200'}`}
                                style={{ left: `${actualLeft}%`, width: `${actualWidth}%`, bottom: '0' }}
                              >
                                 <div className={`h-full opacity-80 ${isDelayed ? 'bg-red-500' : 'bg-[#007AFF]'}`} style={{ width: `${task.progress}%` }}></div>
                                 <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-900 truncate px-2">
                                   จริง: {task.progress}%
                                 </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Tooltip on hover */}
                          <div className="hidden group-hover:block absolute z-20 bg-gray-900/95 backdrop-blur-md text-white text-xs p-3 rounded-xl shadow-xl -top-16" style={{ left: `${planLeft + (planWidth/2)}%`, transform: 'translateX(-50%)', minWidth: '200px' }}>
                            <p className="font-bold text-sm mb-2 pb-1 border-b border-gray-700">{task.task_name}</p>
                            <div className="grid grid-cols-2 gap-2 text-gray-300 mb-1">
                              <div><span className="text-gray-400">แผนเริ่ม:</span> {task.start_date}</div>
                              <div><span className="text-gray-400">แผนเสร็จ:</span> {task.end_date}</div>
                            </div>
                            <div className={`grid grid-cols-2 gap-2 mb-2 ${isDelayed ? 'text-red-300' : 'text-blue-300'}`}>
                              <div><span className="text-gray-400">จริงเริ่ม:</span> {task.actual_start_date || '-'}</div>
                              <div><span className="text-gray-400">จริงเสร็จ:</span> {task.actual_end_date || '-'}</div>
                            </div>
                            <p className="text-gray-300 mt-1">ก้าวหน้า: <span className="text-white font-bold">{task.progress}%</span></p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
