"use client";

import React, { useMemo } from 'react';
import { Bell, MapPin, Calendar as CalendarIcon, Play, Edit3, ChevronDown, Check, FileText, Wrench, Camera, ClipboardList, AlertCircle, Phone, CheckCircle, ChevronRight, MessageSquareWarning, Megaphone } from 'lucide-react';
import { mockTasks } from './data';

export default function MyTasksDashboard() {
  const allTasksCount = mockTasks.length;
  const dueTodayCount = mockTasks.filter(t => t.time.includes('วันนี้') && !t.isTracked).length;
  const completedCount = mockTasks.filter(t => t.status === 'completed').length;
  const trackedCount = mockTasks.filter(t => t.isTracked).length;

  const normalTasks = mockTasks.filter(t => !t.isTracked);
  const trackedTasks = mockTasks.filter(t => t.isTracked);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started':
        return <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-medium">ยังไม่เริ่ม</span>;
      case 'in_progress':
        return <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">กำลังทำ</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-medium">เสร็จสิ้น</span>;
      case 'waiting_for_review':
        return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">รอส่งงาน</span>;
      default:
        return null;
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Wrench size={20} /></div>;
      case 'survey': return <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><FileText size={20} /></div>;
      case 'inspection': return <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Camera size={20} /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><ClipboardList size={20} /></div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Header */}
      <div className="bg-white px-4 md:px-8 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">งานของฉันวันนี้</h1>
          <p className="text-sm text-slate-500">ดูงานที่ได้รับมอบหมาย ทำให้เสร็จ และส่งรายงานได้ในหน้านี้</p>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
          </button>
          <div className="flex items-center gap-3 border border-slate-200 rounded-full p-1 pr-4 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">สิริวิชญ์ ภิรมย์มาก</p>
              <p className="text-xs text-slate-500 leading-tight">พนักงาน บ ประเภท 1 Office ชั้น 6</p>
            </div>
            <ChevronDown size={16} className="text-slate-400 ml-1 hidden md:block" />
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
              <p className="text-sm font-bold text-slate-700">งานทั้งหมด</p>
              <p className="text-3xl font-black text-slate-800 leading-none">{allTasksCount} <span className="text-sm font-normal text-slate-500">งาน</span></p>
            </div>
          </div>
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-rose-500 text-white p-3 rounded-xl shadow-sm">
              <CalendarIcon size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">ต้องทำวันนี้</p>
              <p className="text-3xl font-black text-slate-800 leading-none">{dueTodayCount} <span className="text-sm font-normal text-slate-500">งาน</span></p>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-sm">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">เสร็จแล้ว</p>
              <p className="text-3xl font-black text-slate-800 leading-none">{completedCount} <span className="text-sm font-normal text-slate-500">งาน</span></p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-amber-500 text-white p-3 rounded-xl shadow-sm">
              <AlertCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">ติดตามอยู่</p>
              <p className="text-3xl font-black text-slate-800 leading-none">{trackedCount} <span className="text-sm font-normal text-slate-500">งาน</span></p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Tasks */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Regular Tasks */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList size={22} className="text-slate-700" />
                  งานที่ต้องทำ
                </h2>
                <span className="text-sm font-medium text-slate-500">วันนี้ {normalTasks.length} งาน</span>
              </div>
              <div className="divide-y divide-slate-100">
                {normalTasks.map(task => (
                  <div key={task.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-4 items-start">
                      {getTaskIcon(task.type)}
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{task.title}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                          <MapPin size={14} />
                          {task.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                          <CalendarIcon size={14} className="text-rose-500" />
                          {task.time}
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                      {task.status === 'not_started' ? (
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap">
                          <Play size={16} fill="currentColor" />
                          เริ่มงาน
                        </button>
                      ) : (
                        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap">
                          <Edit3 size={16} />
                          อัปเดตงาน
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracked Tasks */}
            {trackedTasks.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl shadow-sm overflow-hidden relative overflow-hidden">
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
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                          <AlertCircle size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">{task.title}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                            <MapPin size={14} />
                            {task.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-md">
                          <CalendarIcon size={14} />
                          {task.time}
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Workflow & Actions */}
          <div className="flex flex-col gap-6">
            
            {/* Workflow Guide */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-6">
                <CheckCircle size={20} className="text-slate-600" />
                ขั้นตอนการทำงาน
              </h3>
              
              <div className="flex items-center justify-between mb-8 relative">
                {/* Connecting Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200 -z-10"></div>
                
                <div className="flex flex-col items-center gap-2 text-center w-1/4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-4 border-white shadow-sm">
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm whitespace-nowrap">1. รับงาน</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden sm:block">ดูรายละเอียด<br/>งานที่ได้รับ</p>
                  </div>
                </div>
                
                <ChevronRight size={16} className="text-slate-300 -mt-8" />
                
                <div className="flex flex-col items-center gap-2 text-center w-1/4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-white shadow-sm">
                    <Play size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm whitespace-nowrap">2. เริ่มทำ</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden sm:block">กดเริ่มงาน<br/>เมื่อไปถึงหน้างาน</p>
                  </div>
                </div>

                <ChevronRight size={16} className="text-slate-300 -mt-8" />
                
                <div className="flex flex-col items-center gap-2 text-center w-1/4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border-4 border-white shadow-sm">
                    <Camera size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm whitespace-nowrap">3. ถ่ายรูป/รายงาน</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden sm:block">ถ่ายรูปและ<br/>บันทึกผลการทำงาน</p>
                  </div>
                </div>

                <ChevronRight size={16} className="text-slate-300 -mt-8" />
                
                <div className="flex flex-col items-center gap-2 text-center w-1/4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-sm">
                    <Check size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm whitespace-nowrap">4. เสร็จสิ้น</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5 hidden sm:block">กดส่งงาน<br/>เมื่อทำเสร็จ</p>
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

              {/* Character mockup text overlay - simple CSS approach */}
              <div className="absolute -right-4 -bottom-4 w-32 h-40 bg-emerald-100/50 rounded-tl-full flex items-center justify-center flex-col z-0">
                 <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-2xl rounded-br-sm shadow-md mb-2 -ml-8 rotate-[-5deg]">
                   ง่ายๆ<br/>แค่นี้ครับ!
                 </div>
                 <div className="w-16 h-16 bg-blue-100 rounded-full border-2 border-emerald-200 flex items-center justify-center text-2xl" title="PEA Worker">👷‍♂️</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 h-full">
              <button className="col-span-2 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-bold shadow-sm transition-colors h-16">
                <List size={20} />
                ดูงานทั้งหมด
                <div className="text-[10px] font-normal text-slate-400 block -ml-1 mt-1">(ดูงานที่ได้รับมอบหมายทั้งหมด)</div>
              </button>
              <button className="flex flex-col items-center justify-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 py-3 rounded-xl font-bold shadow-sm transition-colors h-20">
                <div className="flex items-center gap-1.5">
                  <Phone size={18} />
                  โทรหาหัวหน้า
                </div>
                <div className="text-[10px] font-normal text-emerald-600/70 block">ติดต่อหัวหน้าได้ทันที</div>
              </button>
              <button className="flex flex-col items-center justify-center gap-1 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 py-3 rounded-xl font-bold shadow-sm transition-colors h-20">
                <div className="flex items-center gap-1.5">
                  <MessageSquareWarning size={18} />
                  แจ้งติดปัญหา
                </div>
                <div className="text-[10px] font-normal text-rose-600/70 block">หากมีปัญหาในการทำงาน</div>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
