"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, X, MoreVertical, HardHat, ChevronDown, 
  List, Grid, CheckCircle, AlertTriangle, Box, RefreshCw,
  Filter, Edit3, ChevronLeft, ChevronRight, Wrench, LogOut, Check, Save
} from 'lucide-react';
import { safetyData } from './data';

// --- Type Definitions ---
type AggregatedEquipment = {
  instanceId: string;
  name: string;
  category: string;
  standard: number;
  totalActual: number;
  readyCount: number;
  pendingCount: number;
  damagedCount: number;
  unit: string;
  userName: string;
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

  // Modal states
  const [updateItem, setUpdateItem] = useState<AggregatedEquipment | null>(null);
  const [updateSourceStatus, setUpdateSourceStatus] = useState<'ready' | 'pending' | 'damaged'>('ready');
  const [updateAmount, setUpdateAmount] = useState(1);
  const [updateTargetStatus, setUpdateTargetStatus] = useState<'ready' | 'damaged'>('ready');

  useEffect(() => {
    const saved = localStorage.getItem('pea_safety_data_v3');
    if (saved) {
      setLocalData(JSON.parse(saved));
    } else {
      setLocalData(safetyData);
      localStorage.setItem('pea_safety_data_v3', JSON.stringify(safetyData));
    }
    setIsLoaded(true);
  }, []);

  const saveLocalData = (newData: any) => {
    setLocalData(newData);
    localStorage.setItem('pea_safety_data_v3', JSON.stringify(newData));
  };

  const handleOpenUpdate = (item: AggregatedEquipment, sourceStatus: 'ready' | 'pending' | 'damaged') => {
    setUpdateItem(item);
    setUpdateSourceStatus(sourceStatus);
    setUpdateAmount(1);
    setUpdateTargetStatus(sourceStatus === 'ready' ? 'damaged' : 'ready');
  };

  const handleSubmitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateItem) return;

    const newData = [...localData];
    const teamIndex = newData.findIndex((t: any) => t.id === updateItem.teamId);
    if (teamIndex >= 0) {
      const eqIndex = newData[teamIndex].equipment.findIndex((e: any) => e.id === updateItem.originalItemId);
      if (eqIndex >= 0) {
        const eq = newData[teamIndex].equipment[eqIndex];
        
        let maxAvailable = 0;
        if (updateSourceStatus === 'ready') maxAvailable = updateItem.readyCount;
        if (updateSourceStatus === 'pending') maxAvailable = updateItem.pendingCount;
        if (updateSourceStatus === 'damaged') maxAvailable = updateItem.damagedCount;
        
        const amount = Math.min(updateAmount, maxAvailable);
        
        if (updateSourceStatus === 'ready' && updateTargetStatus === 'damaged') {
          eq.damaged += amount;
        } else if ((updateSourceStatus === 'damaged' || updateSourceStatus === 'pending') && updateTargetStatus === 'ready') {
          eq.damaged = Math.max(0, eq.damaged - amount);
        }
      }
    }
    
    saveLocalData(newData);
    setUpdateItem(null);
  };

  // Convert aggregated data into 1 row per equipment per person
  const allInstances = useMemo(() => {
    const instances: AggregatedEquipment[] = [];
    
    localData.forEach((team: any) => {
      team.equipment.forEach((item: any) => {
        const teamNameShort = team.name.replace('ชุดงาน นาย', 'นาย');
        
        const readyCount = Math.max(0, item.actual - item.damaged);
        const pendingCount = 0;
        const damagedCount = item.damaged;
        
        if (item.actual > 0 || item.standard > 0) {
          instances.push({
            instanceId: `${team.id}-${item.id}`,
            name: item.name,
            category: item.category,
            standard: item.standard,
            totalActual: item.actual,
            readyCount,
            pendingCount,
            damagedCount,
            unit: item.unit,
            userName: teamNameShort,
            teamId: team.id,
            originalItemId: item.id
          });
        }
      });
    });
    
    return instances.sort((a, b) => a.name.localeCompare(b.name));
  }, [localData]);

  // Derived filter options
  const allCategories = useMemo(() => Array.from(new Set(allInstances.map(i => i.category))).sort(), [allInstances]);
  const allUsers = useMemo(() => Array.from(new Set(allInstances.map(i => i.userName))).sort(), [allInstances]);

  // Apply filters
  const filteredInstances = useMemo(() => {
    return allInstances.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchUser = selectedUser === 'all' || item.userName === selectedUser;
      
      let matchStatus = true;
      if (selectedStatus === 'ready') matchStatus = item.readyCount > 0;
      else if (selectedStatus === 'pending') matchStatus = item.pendingCount > 0;
      else if (selectedStatus === 'damaged') matchStatus = item.damagedCount > 0;
      
      return matchSearch && matchCat && matchUser && matchStatus;
    });
  }, [allInstances, searchQuery, selectedCategory, selectedUser, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredInstances.length / itemsPerPage);
  const currentData = filteredInstances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats calculation
  const stats = useMemo(() => {
    let total = 0, ready = 0, pending = 0, damaged = 0;
    
    allInstances.forEach(i => {
      total += i.totalActual;
      ready += i.readyCount;
      pending += i.pendingCount;
      damaged += i.damagedCount;
    });
    
    return {
      total,
      ready,
      readyPct: total ? Math.round((ready / total) * 100) : 0,
      damaged,
      damagedPct: total ? Math.round((damaged / total) * 100) : 0,
      pending,
      pendingPct: total ? Math.round((pending / total) * 100) : 0,
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
            <p className="text-sm text-slate-500">ผกร.กรย.(ก3)</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors border border-transparent hover:border-slate-200">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center border border-indigo-200 shadow-sm">
              AD
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 leading-tight">ADMIN</p>
            </div>
            <div title="ออกจากระบบ" className="flex items-center">
              <LogOut size={18} className="text-rose-500 hover:text-rose-600 ml-2" />
            </div>
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
                placeholder="ค้นหาอุปกรณ์, ชื่อช่าง ..." 
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

        {/* Stat Cards - Changed from 5 to 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total */}
          <div 
            onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
            className={`p-5 rounded-2xl shadow-sm border flex items-center gap-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'all' ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-400/20' : 'bg-white border-slate-200'}`}
          >
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
          <div 
            onClick={() => { setSelectedStatus('ready'); setCurrentPage(1); }}
            className={`p-5 rounded-2xl shadow-sm border flex items-center gap-4 relative overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'ready' ? 'bg-[#DCFCE7]/60 border-[#22C55E] ring-2 ring-[#22C55E]/20' : 'bg-[#F0FDF4] border-[#DCFCE7]'}`}
          >
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
          <div 
            onClick={() => { setSelectedStatus('pending'); setCurrentPage(1); }}
            className={`p-5 rounded-2xl shadow-sm border flex items-center gap-4 relative overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'pending' ? 'bg-[#FEF3C7]/60 border-[#F59E0B] ring-2 ring-[#F59E0B]/20' : 'bg-[#FFFBEB] border-[#FEF3C7]'}`}
          >
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
          <div 
            onClick={() => { setSelectedStatus('damaged'); setCurrentPage(1); }}
            className={`p-5 rounded-2xl shadow-sm border flex items-center gap-4 relative overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'damaged' ? 'bg-[#FEE2E2]/60 border-[#EF4444] ring-2 ring-[#EF4444]/20' : 'bg-[#FEF2F2] border-[#FEE2E2]'}`}
          >
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
                  <th className="px-5 py-3.5 font-bold">ผู้ใช้งาน / ช่าง</th>
                  <th className="px-5 py-3.5 font-bold text-center">มีอยู่ / มาตรฐาน</th>
                  <th className="px-5 py-3.5 font-bold">สถานะ (คลิกเพื่ออัปเดต)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
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
                        <td className="px-5 py-3 text-slate-700 font-medium">{item.userName}</td>
                        <td className="px-5 py-3 text-center">
                          <span className="font-black text-slate-700 text-base">{item.totalActual}</span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-slate-500 font-medium">{item.standard}</span>
                          <span className="text-slate-400 text-xs ml-1">{item.unit}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {item.readyCount > 0 && (
                              <button 
                                onClick={() => handleOpenUpdate(item, 'ready')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] hover:bg-[#D1FAE5] transition-colors cursor-pointer"
                                title="คลิกเพื่อแจ้งชำรุด"
                              >
                                <CheckCircle size={12} strokeWidth={3} /> พร้อมใช้งาน: {item.readyCount}
                              </button>
                            )}
                            {item.pendingCount > 0 && (
                              <button 
                                onClick={() => handleOpenUpdate(item, 'pending')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] hover:bg-[#FEF3C7] transition-colors cursor-pointer"
                                title="คลิกเพื่ออัปเดต"
                              >
                                <Wrench size={12} strokeWidth={3} /> รอตรวจ/รอซ่อม: {item.pendingCount}
                              </button>
                            )}
                            {item.damagedCount > 0 && (
                              <button 
                                onClick={() => handleOpenUpdate(item, 'damaged')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                                title="คลิกเพื่ออัปเดต"
                              >
                                <AlertTriangle size={12} strokeWidth={3} /> ชำรุด: {item.damagedCount}
                              </button>
                            )}
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

      {/* Update Modal */}
      {updateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Edit3 size={20} className="text-indigo-600" /> อัปเดตสถานะอุปกรณ์
              </h3>
              <button onClick={() => setUpdateItem(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm border border-slate-200 shrink-0">
                  {getEmojiIcon(updateItem.category, updateItem.name)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{updateItem.name}</h4>
                  <p className="text-sm text-slate-500">
                    เลือกอัปเดตสถานะจากยอด <span className="font-bold text-slate-700">{updateSourceStatus === 'ready' ? 'พร้อมใช้งาน' : updateSourceStatus === 'damaged' ? 'ชำรุด' : 'รอตรวจ/รอซ่อม'}</span> ที่มีอยู่ {updateSourceStatus === 'ready' ? updateItem.readyCount : updateSourceStatus === 'damaged' ? updateItem.damagedCount : updateItem.pendingCount} {updateItem.unit}
                  </p>
                </div>
              </div>

              <form id="update-form" onSubmit={handleSubmitUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ต้องการเปลี่ยนเป็น <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border-2 transition-colors ${updateTargetStatus === 'ready' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'} ${updateSourceStatus === 'ready' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input type="radio" className="hidden" disabled={updateSourceStatus === 'ready'} checked={updateTargetStatus === 'ready'} onChange={() => setUpdateTargetStatus('ready')} />
                      <CheckCircle size={18} /> พร้อมใช้งาน
                    </label>
                    <label className={`flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border-2 transition-colors ${updateTargetStatus === 'damaged' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200'} ${updateSourceStatus === 'damaged' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input type="radio" className="hidden" disabled={updateSourceStatus === 'damaged'} checked={updateTargetStatus === 'damaged'} onChange={() => setUpdateTargetStatus('damaged')} />
                      <AlertTriangle size={18} /> ชำรุด/ส่งซ่อม
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">จำนวน ({updateItem.unit}) <span className="text-rose-500">*</span></label>
                  <div className="flex items-center">
                    <button type="button" onClick={() => setUpdateAmount(Math.max(1, updateAmount - 1))} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-l-lg border border-slate-300 font-bold text-lg">-</button>
                    <input 
                      type="number" 
                      min={1} 
                      max={updateSourceStatus === 'ready' ? updateItem.readyCount : updateSourceStatus === 'damaged' ? updateItem.damagedCount : updateItem.pendingCount} 
                      value={updateAmount} 
                      onChange={(e) => {
                        const max = updateSourceStatus === 'ready' ? updateItem.readyCount : updateSourceStatus === 'damaged' ? updateItem.damagedCount : updateItem.pendingCount;
                        setUpdateAmount(Math.max(1, Math.min(max, parseInt(e.target.value) || 1)));
                      }}
                      className="w-full h-10 text-center border-y border-slate-300 font-bold text-slate-800 focus:outline-none"
                    />
                    <button type="button" onClick={() => {
                        const max = updateSourceStatus === 'ready' ? updateItem.readyCount : updateSourceStatus === 'damaged' ? updateItem.damagedCount : updateItem.pendingCount;
                        setUpdateAmount(Math.min(max, updateAmount + 1));
                    }} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-r-lg border border-slate-300 font-bold text-lg">+</button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">ระบุจำนวนที่ต้องการเปลี่ยนสถานะ (สูงสุด {updateSourceStatus === 'ready' ? updateItem.readyCount : updateSourceStatus === 'damaged' ? updateItem.damagedCount : updateItem.pendingCount})</p>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setUpdateItem(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">ยกเลิก</button>
              <button type="submit" form="update-form" className="px-6 py-2 text-sm font-bold text-white bg-[#1E88E5] hover:bg-blue-600 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                <Save size={16} /> บันทึกการอัปเดต
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
