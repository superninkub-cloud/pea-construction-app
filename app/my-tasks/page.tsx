"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, MapPin, Calendar as CalendarIcon, Play, Edit3, ChevronDown, 
  Check, FileText, Wrench, Camera, ClipboardList, AlertCircle, Phone, 
  CheckCircle, ChevronRight, MessageSquareWarning, Megaphone, Plus, X, List,
  LogOut, Trash2
} from 'lucide-react';
import { mockTasks, Task, TaskStatus, TaskPriority } from './data';

export default function MyTasksDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals state
  const [showUpdateModal, setShowUpdateModal] = useState<string | null>(null);
  const [updateNote, setUpdateNote] = useState('');
  const [updateStatus, setUpdateStatus] = useState<'completed' | 'not_completed'>('completed');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '', location: '', time: '', type: 'maintenance', priority: 'normal', isTracked: false
  });

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('pea_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      setTasks(mockTasks);
      localStorage.setItem('pea_tasks', JSON.stringify(mockTasks));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pea_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const allTasksCount = tasks.length;
  const dueTodayCount = tasks.filter(t => t.time.includes('วันนี้') && !t.isTracked).length;
  const completedCount = tasks.filter(t => t.status === 'completed' || t.status === 'waiting_for_review').length;
  const trackedCount = tasks.filter(t => t.isTracked).length;

  const normalTasks = tasks.filter(t => !t.isTracked);
  const trackedTasks = tasks.filter(t => t.isTracked);

  // Actions
  const handleStartTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'in_progress' } : t));
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (showUpdateModal) {
      if (updateStatus === 'not_completed' && !updateNote.trim()) {
        alert('กรุณาชี้แจงสาเหตุที่ทำงานยังไม่เสร็จ');
        return;
      }
      setTasks(prev => prev.map(t => 
        t.id === showUpdateModal 
          ? { ...t, status: updateStatus === 'completed' ? 'waiting_for_review' : 'in_progress', note: updateNote } 
          : t
      ));
      setShowUpdateModal(null);
      setUpdateNote('');
    }
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('คุณต้องการลบงานนี้ใช่หรือไม่?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: `T-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: newTask.title || 'งานใหม่',
      location: newTask.location || 'ไม่ระบุสถานที่',
      time: newTask.time || 'วันนี้',
      status: 'not_started',
      priority: newTask.priority || 'normal',
      isTracked: newTask.isTracked || false,
      type: newTask.type || 'other',
    };
    setTasks([task, ...tasks]);
    setShowCreateModal(false);
    setNewTask({ title: '', location: '', time: '', type: 'maintenance', priority: 'normal', isTracked: false });
  };

  const handleToggleTrack = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isTracked: !t.isTracked } : t));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started': return <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-medium">ยังไม่เริ่ม</span>;
      case 'in_progress': return <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">กำลังทำ</span>;
      case 'completed': return <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-medium">เสร็จสิ้น</span>;
      case 'waiting_for_review': return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">รอส่งงาน/ตรวจ</span>;
      default: return null;
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Wrench size={20} /></div>;
      case 'survey': return <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><FileText size={20} /></div>;
      case 'inspection': return <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Camera size={20} /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><ClipboardList size={20} /></div>;
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Header */}
      <div className="bg-white px-4 md:px-8 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isManagerMode ? 'ระบบจัดการและมอบหมายงาน' : 'งานของฉันวันนี้'}
          </h1>
          <p className="text-sm text-slate-500">
            {isManagerMode ? 'มอบหมาย ติดตาม และตรวจสอบสถานะการทำงานของทีม' : 'ดูงานที่ได้รับมอบหมาย ทำให้เสร็จ และส่งรายงานได้ในหน้านี้'}
          </p>
        </div>
        <div className="flex items-center gap-4 self-end sm:self-auto">
          {/* Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
            <button 
              onClick={() => setIsManagerMode(false)}
              className={`px-3 py-1.5 rounded-md transition-colors ${!isManagerMode ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              พนักงาน
            </button>
            <button 
              onClick={() => setIsManagerMode(true)}
              className={`px-3 py-1.5 rounded-md transition-colors ${isManagerMode ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              หัวหน้างาน
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <button className="relative p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors hidden sm:block">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-bold text-slate-800 leading-tight">ADMIN</p>
            </div>
            <button className="flex items-center gap-2 text-sm text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-md transition-colors border border-rose-100 font-medium ml-2">
              <LogOut size={16} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full pb-24 lg:pb-32">
        
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-500 text-white p-3 rounded-xl shadow-sm">
              <ClipboardList size={28} />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-700">งานทั้งหมด</p>
              <p className="text-2xl md:text-3xl font-black text-slate-800 leading-none">{allTasksCount} <span className="text-xs md:text-sm font-normal text-slate-500">งาน</span></p>
            </div>
          </div>
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-rose-500 text-white p-3 rounded-xl shadow-sm">
              <CalendarIcon size={28} />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-700">ต้องทำวันนี้</p>
              <p className="text-2xl md:text-3xl font-black text-slate-800 leading-none">{dueTodayCount} <span className="text-xs md:text-sm font-normal text-slate-500">งาน</span></p>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-sm">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-700">{isManagerMode ? 'รอตรวจ/เสร็จ' : 'เสร็จแล้ว'}</p>
              <p className="text-2xl md:text-3xl font-black text-slate-800 leading-none">{completedCount} <span className="text-xs md:text-sm font-normal text-slate-500">งาน</span></p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-amber-500 text-white p-3 rounded-xl shadow-sm">
              <AlertCircle size={28} />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-700">ติดตามอยู่</p>
              <p className="text-2xl md:text-3xl font-black text-slate-800 leading-none">{trackedCount} <span className="text-xs md:text-sm font-normal text-slate-500">งาน</span></p>
            </div>
          </div>
        </div>

        {/* Manager Mode Controls */}
        {isManagerMode && (
          <div className="flex justify-end">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              มอบหมายงานใหม่
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Tasks */}
          <div className={`${isManagerMode ? 'lg:col-span-3' : 'lg:col-span-2'} flex flex-col gap-6`}>
            
            {/* Regular Tasks */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList size={22} className="text-slate-700" />
                  {isManagerMode ? 'รายการงานทั้งหมด' : 'งานที่ต้องทำ'}
                </h2>
                <span className="text-sm font-medium text-slate-500">รวม {normalTasks.length} งาน</span>
              </div>
              <div className="divide-y divide-slate-100">
                {normalTasks.length === 0 && (
                  <div className="p-8 text-center text-slate-500">ไม่มีรายการงานที่ต้องทำ</div>
                )}
                {normalTasks.map(task => (
                  <div key={task.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-4 items-start">
                      {getTaskIcon(task.type)}
                      <div>
                        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                          {task.title}
                          {isManagerMode && (
                            <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                              รับผิดชอบ: สมชาย
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                          <MapPin size={14} />
                          {task.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                          <CalendarIcon size={14} className="text-rose-500" />
                          {task.time}
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                      
                      {/* Action buttons based on mode */}
                      {!isManagerMode ? (
                        <>
                          {task.status === 'not_started' && (
                            <button onClick={() => handleStartTask(task.id)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap w-28">
                              <Play size={16} fill="currentColor" />
                              เริ่มงาน
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button onClick={() => setShowUpdateModal(task.id)} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap w-32">
                              <Edit3 size={16} />
                              อัปเดตงาน
                            </button>
                          )}
                          {(task.status === 'waiting_for_review' || task.status === 'completed') && (
                            <button disabled className="flex items-center justify-center gap-2 bg-slate-100 text-slate-400 px-5 py-2 rounded-xl font-medium text-sm whitespace-nowrap w-32 cursor-not-allowed border border-slate-200">
                              <Check size={16} strokeWidth={3} />
                              ส่งงานแล้ว
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleTrack(task.id)} 
                            className="flex items-center gap-1 text-amber-600 hover:bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            <Megaphone size={14} />
                            ติดตามงาน
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id)} 
                            className="flex items-center gap-1 text-rose-500 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Trash2 size={14} /> ลบ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracked Tasks */}
            {trackedTasks.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <div className="px-6 py-4 border-b border-amber-100 flex justify-between items-center bg-amber-100/50">
                  <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <Megaphone size={22} className="text-amber-600" />
                    งานที่หัวหน้ากำลังติดตาม
                  </h2>
                  <span className="text-sm font-medium text-amber-700">{trackedTasks.length} งาน</span>
                </div>
                <div className="divide-y divide-amber-100">
                  {trackedTasks.map(task => (
                    <div key={task.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 hover:bg-white transition-colors">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                          <AlertCircle size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                            {task.title}
                            {isManagerMode && (
                              <span className="text-xs font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                รับผิดชอบ: สมชาย
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                            <MapPin size={14} />
                            {task.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-md whitespace-nowrap">
                          <CalendarIcon size={14} />
                          {task.time}
                        </div>
                        {getStatusBadge(task.status)}
                        
                        {isManagerMode ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggleTrack(task.id)} 
                              className="flex items-center gap-1 text-slate-500 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              เลิกติดตาม
                            </button>
                            <button 
                              onClick={() => handleDeleteTask(task.id)} 
                              className="flex items-center gap-1 text-rose-500 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Trash2 size={14} /> ลบ
                            </button>
                          </div>
                        ) : (
                          <>
                            {task.status === 'in_progress' && (
                              <button onClick={() => setShowUpdateModal(task.id)} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap">
                                <Edit3 size={16} /> อัปเดตงาน
                              </button>
                            )}
                            {task.status === 'not_started' && (
                              <button onClick={() => handleStartTask(task.id)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap">
                                <Play size={16} fill="currentColor" /> เริ่มงาน
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Workflow & Actions (Hidden in Manager Mode) */}
          {!isManagerMode && (
            <div className="flex flex-col gap-6">
              
              {/* Workflow Guide */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-6">
                  <CheckCircle size={20} className="text-slate-600" />
                  ขั้นตอนการทำงาน
                </h3>
                
                <div className="flex items-center justify-between mb-8 relative">
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200 -z-10"></div>
                  
                  <div className="flex flex-col items-center gap-2 text-center w-1/4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                      <ClipboardList size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs md:text-sm whitespace-nowrap">1. รับงาน</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden xl:block">ดูรายละเอียดงาน</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 -mt-8 shrink-0" />
                  
                  <div className="flex flex-col items-center gap-2 text-center w-1/4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                      <Play size={18} fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs md:text-sm whitespace-nowrap">2. เริ่มทำ</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden xl:block">กดเริ่มงาน</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 -mt-8 shrink-0" />
                  
                  <div className="flex flex-col items-center gap-2 text-center w-1/4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                      <Camera size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs md:text-sm whitespace-nowrap">3. ถ่ายรูป</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden xl:block">บันทึกผลทำงาน</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 -mt-8 shrink-0" />
                  
                  <div className="flex flex-col items-center gap-2 text-center w-1/4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                      <Check size={22} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs md:text-sm whitespace-nowrap">4. เสร็จสิ้น</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden xl:block">กดส่งงาน</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to use */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm p-6 relative overflow-hidden">
                <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2 mb-4">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">?</div>
                  วิธีใช้งาน (ทำได้ง่ายๆ)
                </h3>
                
                <div className="space-y-4 relative z-10 w-3/4">
                  <div className="flex gap-3">
                    <div className="bg-blue-200 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-slate-700"><span className="font-bold">กดดูงาน</span> เลือกงานที่ได้รับมอบหมาย</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-blue-200 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-slate-700"><span className="font-bold">กดเริ่มงาน</span> เมื่อไปถึงหน้างาน</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-blue-200 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</div>
                    <p className="text-sm text-slate-700"><span className="font-bold">เมื่อเสร็จให้กดส่งงาน</span> พร้อมแนบรูป (ถ้ามี)</p>
                  </div>
                </div>

                <div className="absolute -right-4 -bottom-4 w-32 h-40 bg-emerald-100/50 rounded-tl-full flex items-center justify-center flex-col z-0">
                   <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-2xl rounded-br-sm shadow-md mb-2 -ml-8 rotate-[-5deg]">
                     ง่ายๆ<br/>แค่นี้ครับ!
                   </div>
                   <div className="w-16 h-16 bg-blue-100 rounded-full border-2 border-emerald-200 flex items-center justify-center text-2xl" title="PEA Worker">👷‍♂️</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 h-full mt-auto">
                <button className="flex flex-col items-center justify-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 py-3 rounded-xl font-bold shadow-sm transition-colors h-20">
                  <div className="flex items-center gap-1.5">
                    <Phone size={18} /> โทรหาหัวหน้า
                  </div>
                  <div className="text-[10px] font-normal text-emerald-600/70 block">ติดต่อหัวหน้าได้ทันที</div>
                </button>
                <button className="flex flex-col items-center justify-center gap-1 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 py-3 rounded-xl font-bold shadow-sm transition-colors h-20">
                  <div className="flex items-center gap-1.5">
                    <MessageSquareWarning size={18} /> แจ้งติดปัญหา
                  </div>
                  <div className="text-[10px] font-normal text-rose-600/70 block">หากมีปัญหาทำงาน</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Update/Submit Task Modal (Worker) */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Edit3 size={20} className="text-indigo-600" /> อัปเดตและส่งงาน
              </h3>
              <button onClick={() => setShowUpdateModal(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="update-form" onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">สถานะงาน <span className="text-rose-500">*</span></label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex-1 justify-center transition-colors hover:bg-emerald-100">
                      <input type="radio" name="status" value="completed" checked={updateStatus === 'completed'} onChange={() => setUpdateStatus('completed')} className="text-emerald-500 focus:ring-emerald-500 w-4 h-4" />
                      <span className="text-sm font-bold text-emerald-700">เสร็จแล้ว</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-rose-50 px-4 py-2 rounded-lg border border-rose-100 flex-1 justify-center transition-colors hover:bg-rose-100">
                      <input type="radio" name="status" value="not_completed" checked={updateStatus === 'not_completed'} onChange={() => setUpdateStatus('not_completed')} className="text-rose-500 focus:ring-rose-500 w-4 h-4" />
                      <span className="text-sm font-bold text-rose-700">ยังไม่เสร็จ</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ผลการดำเนินงาน / ชี้แจงสาเหตุ <span className="text-rose-500">*</span></label>
                  <textarea 
                    required={updateStatus === 'not_completed'}
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    placeholder="พิมพ์รายละเอียดการทำงาน หรือปัญหาที่ทำให้งานยังไม่เสร็จ..."
                    rows={4}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">แนบรูปภาพ (ออปชัน)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-500 transition-colors cursor-pointer">
                    <Camera size={32} className="mb-2" />
                    <span className="text-sm">คลิกเพื่ออัปโหลดรูปถ่ายหน้างาน</span>
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setShowUpdateModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">ยกเลิก</button>
              <button type="submit" form="update-form" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">ส่งงาน</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Create Task Modal (Manager) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" /> มอบหมายงานใหม่
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="create-form" onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ชื่องาน <span className="text-rose-500">*</span></label>
                  <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} type="text" placeholder="เช่น ตรวจสอบมิเตอร์..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สถานที่ <span className="text-rose-500">*</span></label>
                  <input required value={newTask.location} onChange={e => setNewTask({...newTask, location: e.target.value})} type="text" placeholder="เช่น อาคาร C..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">เวลา <span className="text-rose-500">*</span></label>
                    <input required value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} type="text" placeholder="เช่น วันนี้ 15:00 น." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทงาน <span className="text-rose-500">*</span></label>
                    <select value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value as any})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="maintenance">ซ่อมบำรุง</option>
                      <option value="survey">สำรวจ</option>
                      <option value="inspection">ตรวจสอบ</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2 p-3 border border-amber-200 bg-amber-50 rounded-lg">
                    <input type="checkbox" checked={newTask.isTracked} onChange={e => setNewTask({...newTask, isTracked: e.target.checked})} className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-amber-300" />
                    <span className="text-sm font-medium text-amber-900 flex items-center gap-1.5"><Megaphone size={16} /> ต้องการติดตามงานนี้เป็นพิเศษ (Track)</span>
                  </label>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">ยกเลิก</button>
              <button type="submit" form="create-form" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">สร้างและมอบหมาย</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
