"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, X, MoreVertical, HardHat, Calendar, ChevronDown, 
  List, Grid, ShieldAlert, CheckCircle, AlertTriangle, Box, RefreshCw,
  XCircle, Filter, Edit3, Image as ImageIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { safetyData } from './data';

// --- Type Definitions ---
type IndividualEquipment = {
  instanceId: string;
  name: string;
  category: string;
  code: string;
  userName: string;
  lastChecked: string;
  status: 'ready' | 'pending' | 'damaged' | 'disposed';
  teamId: string;
  originalItemId: string;
};

// Emoji mapping for images based on name or category
const getEmojiIcon = (category: string, name: string) => {
  if (name.includes('หมวก')) return '🪖';
  if (name.includes('แว่น')) return '🥽';
  if (name.includes('ปลั๊กอุดหู')) return '🎧';
  if (name.includes('ถุงมือ')) return '🧤';
  if (name.includes('เสื้อ') || name.includes('กั๊ก')) return '🦺';
  if (name.includes('รองเท้า')) return '🥾';
  if (name.includes('หน้ากาก')) return '😷';
  if (name.includes('เข็มขัด') || name.includes('ขาปีน')) return '🧗';
  if (name.includes('กรวย') || name.includes('ป้าย') || name.includes('สัญญาณ')) return '🚧';
  if (name.includes('ถังดับเพลิง')) return '🧯';
  if (category.includes('ตรวจวัด')) return '⚡';
  return '🛠️';
};

export default function SafetyPPEDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [localData, setLocalData] = useState(safetyData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'by_equipment' | 'by_worker'>('by_equipment');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    const saved = localStorage.getItem('pea_safety_data_v2');
    if (saved) {
      setLocalData(JSON.parse(saved));
    } else {
      setLocalData(safetyData);
      localStorage.setItem('pea_safety_data_v2', JSON.stringify(safetyData));
    }
    setIsLoaded(true);
  }, []);

  // Explode aggregated data into individual items
  const allInstances = useMemo(() => {
    const instances: IndividualEquipment[] = [];
    
    // Seed for pseudo-random deterministic code generation based on item ID
    const generateCode = (baseId: string, idx: number) => {
      let hash = 0;
      const str = baseId + idx;
      for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
      return `PPE-${Math.abs(hash).toString().padStart(5, '0').substring(0, 5)}`;
    };

    localData.forEach(team => {
      // Mock random dates within last 30 days
      const mockDates = ['8 ก.ย. 2568', '6 ก.ย. 2568', '5 ก.ย. 2568', '2 ก.ย. 2568', '1 ก.ย. 2568', '28 ส.ค. 2568', '25 ส.ค. 2568'];
      
      team.equipment.forEach(item => {
        const teamNameShort = team.name.replace('ชุดงาน นาย', 'นาย');
        
        // Ready items
        const readyCount = Math.max(0, item.actual - item.damaged);
        for (let i = 0; i < readyCount; i++) {
          instances.push({
            instanceId: `${team.id}-${item.id}-r${i}`,
            name: item.name,
            category: item.category,
            code: generateCode(item.id, i),
            userName: teamNameShort,
            lastChecked: mockDates[i % mockDates.length],
            status: 'ready',
            teamId: team.id,
            originalItemId: item.id
          });
        }
        
        // Damaged items
        for (let i = 0; i < item.damaged; i++) {
          instances.push({
            instanceId: `${team.id}-${item.id}-d${i}`,
            name: item.name,
            category: item.category,
            code: generateCode(item.id, 100 + i),
            userName: teamNameShort,
            lastChecked: mockDates[(i+3) % mockDates.length],
            status: 'damaged',
            teamId: team.id,
            originalItemId: item.id
          });
        }
        
        // Missing (Disposed) items
        for (let i = 0; i < item.missing; i++) {
          instances.push({
            instanceId: `${team.id}-${item.id}-m${i}`,
            name: item.name,
            category: item.category,
            code: generateCode(item.id, 200 + i),
            userName: teamNameShort,
            lastChecked: '-',
            status: 'disposed',
            teamId: team.id,
            originalItemId: item.id
          });
        }
      });
    });
    
    // Convert some 'damaged' to 'pending' to match UI requirements mock
    instances.forEach((inst, index) => {
      if (inst.status === 'damaged' && index % 2 === 0) {
        inst.status = 'pending';
      }
    });

    return instances;
  }, [localData]);

  // Derived filter options
  const allCategories = useMemo(() => Array.from(new Set(allInstances.map(i => i.category))).sort(), [allInstances]);
  const allUsers = useMemo(() => Array.from(new Set(allInstances.map(i => i.userName))).sort(), [allInstances]);

  // Apply filters
  const filteredInstances = useMemo(() => {
    return allInstances.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchUser = selectedUser === 'all' || item.userName === selectedUser;
      
      let matchStatus = true;
      if (selectedStatus === 'ready') matchStatus = item.status === 'ready';
      else if (selectedStatus === 'pending') matchStatus = item.status === 'pending';
      else if (selectedStatus === 'damaged') matchStatus = item.status === 'damaged';
      else if (selectedStatus === 'disposed') matchStatus = item.status === 'disposed';
      
      return matchSearch && matchCat && matchUser && matchStatus;
    });
  }, [allInstances, searchQuery, selectedCategory, selectedUser, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredInstances.length / itemsPerPage);
  const currentData = filteredInstances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats calculation
  const stats = useMemo(() => {
    const total = allInstances.length;
    const ready = allInstances.filter(i => i.status === 'ready').length;
    const pending = allInstances.filter(i => i.status === 'pending').length;
    const damaged = allInstances.filter(i => i.status === 'damaged').length;
    const disposed = allInstances.filter(i => i.status === 'disposed').length;
    
    return {
      total,
      ready,
      readyPct: total ? Math.round((ready / total) * 100) : 0,
      damaged,
      damagedPct: total ? Math.round((damaged / total) * 100) : 0,
      pending,
      pendingPct: total ? Math.round((pending / total) * 100) : 0,
      disposed,
      disposedPct: total ? Math.round((disposed / total) * 100) : 0,
    };
  }, [allInstances]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <span className="text-4xl drop-shadow-sm">🪖</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">ระบบติดตามสถานะอุปกรณ์</h1>
            <p className="text-sm text-slate-500">กฟย.(ก3) งานก่อสร้างและบำรุงรักษา ดูแลจ่าย ใช้งานได้จริง</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-slate-600 text-sm bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Calendar size={16} />
            <span>วันจันทร์ที่ 8 กันยายน 2568</span>
            <span className="text-slate-400">เวลา 10:24 น.</span>
          </div>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200"
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 leading-tight">นายธีรภัทร</p>
              <p className="text-xs text-slate-500">หัวหน้าแผนก</p>
            </div>
            <ChevronDown size={16} className="text-slate-400 ml-1 hidden sm:block" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <div className="relative col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาอุปกรณ์, รหัส, ชื่อช่าง ..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] bg-white shadow-sm transition-shadow hover:border-slate-300"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">หมวดหมู่</label>
              <div className="relative">
                <List className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  className="pl-9 pr-8 py-2.5 w-full border border-slate-200 rounded-xl text-sm appearance-none bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] cursor-pointer hover:border-slate-300"
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">ทั้งหมด</option>
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">ผู้ใช้งาน / ช่าง</label>
              <div className="relative">
                <HardHat className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  className="pl-9 pr-8 py-2.5 w-full border border-slate-200 rounded-xl text-sm appearance-none bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] cursor-pointer hover:border-slate-300"
                  value={selectedUser}
                  onChange={(e) => { setSelectedUser(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">ทุกคน</option>
                  {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">สภาพอุปกรณ์</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
                <select 
                  className="pl-9 pr-8 py-2.5 w-full border border-slate-200 rounded-xl text-sm appearance-none bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] cursor-pointer hover:border-slate-300"
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="ready">พร้อมใช้งาน</option>
                  <option value="pending">รอตรวจ / รอซ่อม</option>
                  <option value="damaged">ชำรุด</option>
                  <option value="disposed">จำหน่าย / เลิกใช้งาน</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col gap-2 shrink-0">
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#7C5EE4] hover:bg-[#6D53C9] text-white py-2.5 px-6 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap">
              <Plus size={18} /> เพิ่มอุปกรณ์ใหม่
            </button>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedUser('all'); setSelectedStatus('all'); setCurrentPage(1); }}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-6 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap border border-slate-200"
            >
              <RefreshCw size={16} /> ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-blue-50 text-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
              <Box size={28} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800 mb-1">อุปกรณ์ทั้งหมด</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-[32px] font-black text-[#1A237E] leading-none tracking-tight">{stats.total}</p>
                <p className="text-xs font-medium text-slate-400">รายการ</p>
              </div>
            </div>
          </div>

          {/* Card 2: Ready */}
          <div className="bg-[#F0FDF4] p-5 rounded-2xl shadow-sm border border-[#DCFCE7] flex items-center gap-4 relative overflow-hidden">
            <div className="bg-[#22C55E] text-white w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm border-[3px] border-white">
              <CheckCircle size={26} strokeWidth={2.5} />
            </div>
            <div className="w-full relative z-10">
              <p className="text-[13px] font-bold text-slate-800 mb-1">พร้อมใช้งาน</p>
              <div className="flex items-baseline justify-between w-full">
                <div className="flex items-baseline gap-1.5">
                  <p className="text-[32px] font-black text-slate-800 leading-none tracking-tight">{stats.ready}</p>
                  <p className="text-xs font-medium text-slate-400">รายการ</p>
                </div>
                <span className="bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded-md text-xs font-bold">{stats.readyPct}%</span>
              </div>
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-[#FFFBEB] p-5 rounded-2xl shadow-sm border border-[#FEF3C7] flex items-center gap-4 relative overflow-hidden">
            <div className="bg-[#F59E0B] text-white w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm border-[3px] border-white">
              <Wrench size={24} strokeWidth={2.5} />
            </div>
            <div className="w-full relative z-10">
              <p className="text-[13px] font-bold text-slate-800 mb-1">รอตรวจ / รอซ่อม</p>
              <div className="flex items-baseline justify-between w-full">
                <div className="flex items-baseline gap-1.5">
                  <p className="text-[32px] font-black text-slate-800 leading-none tracking-tight">{stats.pending}</p>
                  <p className="text-xs font-medium text-slate-400">รายการ</p>
                </div>
                <span className="bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-md text-xs font-bold">{stats.pendingPct}%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Damaged */}
          <div className="bg-[#FEF2F2] p-5 rounded-2xl shadow-sm border border-[#FEE2E2] flex items-center gap-4 relative overflow-hidden">
            <div className="bg-[#EF4444] text-white w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm border-[3px] border-white">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <div className="w-full relative z-10">
              <p className="text-[13px] font-bold text-slate-800 mb-1">ชำรุด</p>
              <div className="flex items-baseline justify-between w-full">
                <div className="flex items-baseline gap-1.5">
                  <p className="text-[32px] font-black text-slate-800 leading-none tracking-tight">{stats.damaged}</p>
                  <p className="text-xs font-medium text-slate-400">รายการ</p>
                </div>
                <span className="bg-[#FEE2E2] text-[#991B1B] px-2 py-0.5 rounded-md text-xs font-bold">{stats.damagedPct}%</span>
              </div>
            </div>
          </div>

          {/* Card 5: Disposed */}
          <div className="bg-[#F8FAFC] p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex items-center gap-4 relative overflow-hidden">
            <div className="bg-[#64748B] text-white w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm border-[3px] border-white">
              <XCircle size={26} strokeWidth={2.5} />
            </div>
            <div className="w-full relative z-10">
              <p className="text-[13px] font-bold text-slate-800 mb-1">จำหน่าย / เลิกใช้งาน</p>
              <div className="flex items-baseline justify-between w-full">
                <div className="flex items-baseline gap-1.5">
                  <p className="text-[32px] font-black text-slate-800 leading-none tracking-tight">{stats.disposed}</p>
                  <p className="text-xs font-medium text-slate-400">รายการ</p>
                </div>
                <span className="bg-[#E2E8F0] text-[#334155] px-2 py-0.5 rounded-md text-xs font-bold">{stats.disposedPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Table Container */}
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {/* Table Toolbar */}
          <div className="px-4 pt-4 pb-0 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('by_equipment')}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-sm transition-all -mb-px border-b-2 ${activeTab === 'by_equipment' ? 'bg-[#1E88E5] text-white border-[#1E88E5]' : 'text-slate-600 bg-slate-50 border-transparent hover:bg-slate-100'}`}
              >
                <Grid size={18} /> ดูตามอุปกรณ์
              </button>
              <button 
                onClick={() => setActiveTab('by_worker')}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-sm transition-all -mb-px border-b-2 ${activeTab === 'by_worker' ? 'bg-[#1E88E5] text-white border-[#1E88E5]' : 'text-slate-600 bg-slate-50 border-transparent hover:bg-slate-100'}`}
              >
                <HardHat size={18} /> ดูตามช่าง
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                <List size={16} className="text-slate-500" />
                <span className="font-medium text-slate-600">แสดง {itemsPerPage} รายการ</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200">
                  <th className="px-5 py-3.5 font-bold">#</th>
                  <th className="px-5 py-3.5 font-bold">รูปภาพ</th>
                  <th className="px-5 py-3.5 font-bold text-slate-800">ชื่ออุปกรณ์</th>
                  <th className="px-5 py-3.5 font-bold">หมวดหมู่</th>
                  <th className="px-5 py-3.5 font-bold">รหัส/หมายเลข</th>
                  <th className="px-5 py-3.5 font-bold">ผู้ใช้งาน / ช่าง</th>
                  <th className="px-5 py-3.5 font-bold">ตรวจล่าสุด</th>
                  <th className="px-5 py-3.5 font-bold">สถานะ</th>
                  <th className="px-5 py-3.5 font-bold text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      ไม่มีข้อมูลที่ตรงกับตัวกรอง
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => {
                    const idx = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={item.instanceId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 text-slate-500">{idx}</td>
                        <td className="px-5 py-3">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm border border-slate-200">
                            {getEmojiIcon(item.category, item.name)}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-800">{item.name}</td>
                        <td className="px-5 py-3 text-slate-500">{item.category}</td>
                        <td className="px-5 py-3 font-mono text-slate-600 font-medium">{item.code}</td>
                        <td className="px-5 py-3 text-slate-700 font-medium">{item.userName}</td>
                        <td className="px-5 py-3 text-slate-500">{item.lastChecked}</td>
                        <td className="px-5 py-3">
                          {item.status === 'ready' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span> พร้อมใช้งาน</span>}
                          {item.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> รอตรวจ/รอซ่อม</span>}
                          {item.status === 'damaged' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> ชำรุด</span>}
                          {item.status === 'disposed' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"><span className="w-2 h-2 rounded-full bg-[#64748B]"></span> เลิกใช้งาน</span>}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {item.status === 'ready' && <button className="bg-[#1E88E5] hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors w-28 h-8">อัปเดตสถานะ</button>}
                            {item.status === 'damaged' && <button className="bg-[#EF4444] hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors w-28 h-8">ดำเนินการ</button>}
                            {item.status === 'pending' && <button className="bg-[#FEF08A] hover:bg-[#FDE047] text-[#854D0E] px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors w-28 h-8">ดูรายละเอียด</button>}
                            {item.status === 'disposed' && <button className="bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#334155] px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors w-28 h-8">ประวัติ</button>}
                            
                            <button className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md transition-colors h-8 w-8 flex items-center justify-center">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F8FAFC]">
            <p className="text-sm font-medium text-slate-500">
              แสดง {(currentPage - 1) * itemsPerPage + (filteredInstances.length > 0 ? 1 : 0)} - {Math.min(currentPage * itemsPerPage, filteredInstances.length)} จาก {filteredInstances.length} รายการ
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === page ? 'bg-[#1E88E5] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
                  >
                    {page}
                  </button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm font-bold">...</span>
                  <button 
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === totalPages ? 'bg-[#1E88E5] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
