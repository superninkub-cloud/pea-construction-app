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
    const starts = tasks.map(t => new Date(t.start_date).getTime());
    const ends = tasks.map(t => new Date(t.end_date).getTime());
    const minDate = new Date(Math.min(...starts));
    const maxDate = new Date(Math.max(...ends));
    
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
    <div className="p-6 max-w-[1400px] mx-auto bg-gray-50 min-h-screen rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">วางแผนงานก่อสร้าง</h1>
          <p className="text-gray-500 mt-1">Gantt Chart & Task Management</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">เลือกโครงการ (WBS)</label>
        <select
          value={selectedWbs}
          onChange={(e) => setSelectedWbs(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#851a70] focus:border-transparent transition-all outline-none"
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
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden flex flex-col h-[700px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">รายการงาน (Tasks)</h2>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="bg-[#851a70] hover:bg-[#6c155b] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">วันที่เริ่ม</label>
                      <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">วันที่เสร็จ</label>
                      <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 text-sm border rounded" />
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
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(task.start_date).toLocaleDateString('th-TH')} - {new Date(task.end_date).toLocaleDateString('th-TH')}
                        {task.assignee && ` • 👨‍🔧 ${task.assignee}`}
                      </p>
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
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-[700px] flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ไทม์ไลน์ (Gantt Chart)</h2>
            {tasks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                เพิ่มงานเพื่อดูแผนภูมิ Gantt Chart
              </div>
            ) : (
              <div className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-gray-50 relative">
                <div className="min-w-[800px] h-full p-4 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex justify-between px-4 pointer-events-none opacity-20">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-full border-l border-gray-400 border-dashed"></div>
                    ))}
                  </div>

                  <div className="space-y-6 mt-8 relative z-10">
                    {tasks.map(task => {
                      const left = getLeftOffset(task.start_date);
                      const width = getWidth(task.start_date, task.end_date);
                      return (
                        <div key={task.id} className="relative h-10 w-full flex items-center group">
                          {/* Label on the left of the bar */}
                          <div className="absolute w-full flex items-center h-full">
                            <div 
                              className="absolute h-8 rounded-md bg-blue-100 border border-blue-300 shadow-sm overflow-hidden"
                              style={{ left: `${left}%`, width: `${width}%` }}
                            >
                               <div className="h-full bg-blue-500 opacity-60" style={{ width: `${task.progress}%` }}></div>
                               <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-900 truncate px-2 mix-blend-multiply">
                                 {task.task_name}
                               </span>
                            </div>
                          </div>
                          
                          {/* Tooltip on hover */}
                          <div className="hidden group-hover:block absolute z-20 bg-gray-900 text-white text-xs p-2 rounded shadow-lg -top-10" style={{ left: `${left + (width/2)}%`, transform: 'translateX(-50%)' }}>
                            <p className="font-bold">{task.task_name}</p>
                            <p>เริ่ม: {task.start_date} | เสร็จ: {task.end_date}</p>
                            <p>ก้าวหน้า: {task.progress}%</p>
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
