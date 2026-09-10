"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, X, HardHat, ChevronDown, 
  List, CheckCircle, AlertTriangle, Box, RefreshCw,
  Filter, ChevronLeft, ChevronRight, Wrench, MoreVertical, Calendar, Trash2, Edit3
} from 'lucide-react';
import { safetyData } from './data';

// --- Type Definitions ---
type ExplodedEquipment = {
  id: string; // e.g., PPE-00128
  teamId: string;
  userName: string;
  category: string;
  name: string;
  status: 'ready' | 'pending' | 'damaged' | 'disposed';
  lastInspected: string;
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
  const [localData, setLocalData] = useState<ExplodedEquipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updateItem, setUpdateItem] = useState<ExplodedEquipment | null>(null);
  const [updateTargetStatus, setUpdateTargetStatus] = useState<'ready' | 'pending' | 'damaged' | 'disposed'>('ready');

  useEffect(() => {
    setUserRole(sessionStorage.getItem("pea_role"));
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const saved = localStorage.getItem('pea_safety_data_v4_exploded');
    if (saved) {
      setLocalData(JSON.parse(saved));
    } else {
      // Generate exploded data from safetyData
      const exploded: ExplodedEquipment[] = [];
      safetyData.forEach(team => {
        team.equipment.forEach(eq => {
          const totalToCreate = Math.max(eq.standard, eq.actual + (eq.missing || 0));
          let readyToCreate = Math.max(0, eq.actual - (eq.damaged || 0) - (eq.pending || 0));
          let pendingToCreate = eq.pending || 0;
          let damagedToCreate = eq.damaged || 0;
          let disposedToCreate = eq.missing || 0;

          for (let i = 0; i < totalToCreate; i++) {
            let status = 'disposed';
            if (readyToCreate > 0) { status = 'ready'; readyToCreate--; }
            else if (pendingToCreate > 0) { status = 'pending'; pendingToCreate--; }
            else if (damagedToCreate > 0) { status = 'damaged'; damagedToCreate--; }
            else if (disposedToCreate > 0) { status = 'disposed'; disposedToCreate--; }

            // Deterministic random ID based on team and item for stability, or just random
            const randomId = Math.floor(10000 + Math.random() * 90000);
            
            // Random date within last 3 months
            const randomDate = new Date();
            randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 90));

            exploded.push({
              id: `PPE-${randomId}`,
              teamId: team.id,
              userName: team.name.replace('ชุดงาน นาย', 'นาย'),
              category: eq.category,
              name: eq.name,
              status: status as any,
              lastInspected: randomDate.toISOString().split('T')[0],
              originalItemId: eq.id
            });
          }
        });
      });
      setLocalData(exploded);
      localStorage.setItem('pea_safety_data_v4_exploded', JSON.stringify(exploded));
    }
    setIsLoaded(true);
    
    return () => clearInterval(timer);
  }, []);

  const saveLocalData = (newData: ExplodedEquipment[]) => {
    setLocalData(newData);
    localStorage.setItem('pea_safety_data_v4_exploded', JSON.stringify(newData));
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateItem) return;
    
    const newData = localData.map(item => {
      if (item.id === updateItem.id) {
        return { ...item, status: updateTargetStatus, lastInspected: new Date().toISOString().split('T')[0] };
      }
      return item;
    });
    
    saveLocalData(newData);
    setUpdateItem(null);
  };

  // Derived filter options
  const allCategories = useMemo(() => Array.from(new Set(localData.map(i => i.category))).sort(), [localData]);
  const allUsers = useMemo(() => Array.from(new Set(localData.map(i => i.userName))).sort(), [localData]);

  // Apply filters
  const filteredData = useMemo(() => {
    return localData.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchUser = selectedUser === 'all' || item.userName === selectedUser;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      
      return matchSearch && matchCat && matchUser && matchStatus;
    });
  }, [localData, searchQuery, selectedCategory, selectedUser, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats calculation
  const stats = useMemo(() => {
    let ready = 0, pending = 0, damaged = 0, disposed = 0;
    
    localData.forEach(i => {
      if (i.status === 'ready') ready++;
      else if (i.status === 'pending') pending++;
      else if (i.status === 'damaged') damaged++;
      else if (i.status === 'disposed') disposed++;
    });
    
    const total = localData.length;
    
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
  }, [localData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"><CheckCircle size={12} /> พร้อมใช้งาน</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"><Wrench size={12} /> รอตรวจ/ซ่อม</span>;
      case 'damaged':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"><AlertTriangle size={12} /> ชำรุด</span>;
      case 'disposed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200"><Trash2 size={12} /> จำหน่ายแล้ว</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear() + 543}`;
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear() + 543;
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}`;
  };

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
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">ระบบติดตามสถานะอุปกรณ์ (PPE)</h1>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Calendar size={14} /> {formatDateTime(currentTime)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center font-bold">ธ</div>
          <div className="text-sm">
            <p className="font-bold text-slate-800 leading-tight">นายธีรภัทร</p>
            <p className="text-xs text-slate-500 leading-tight">หัวหน้าแผนก</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
        
        {/* Stat Cards - 5 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div 
            onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'all' ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-400/20' : 'bg-white border-slate-200'}`}
          >
            <div className="bg-blue-50 text-blue-500 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
              <Box size={24} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">อุปกรณ์ทั้งหมด</p>
              <p className="text-2xl font-black text-[#1A237E] leading-none">{stats.total}</p>
            </div>
          </div>

          <div 
            onClick={() => { setSelectedStatus('ready'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'ready' ? 'bg-[#DCFCE7]/60 border-[#22C55E] ring-2 ring-[#22C55E]/20' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#059669]">
                <CheckCircle size={16} strokeWidth={2.5} />
                <p className="text-xs font-bold">พร้อมใช้งาน</p>
              </div>
              <span className="bg-[#DCFCE7] text-[#166534] px-1.5 py-0.5 rounded text-[10px] font-bold">{stats.readyPct}%</span>
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">{stats.ready}</p>
          </div>

          <div 
            onClick={() => { setSelectedStatus('pending'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'pending' ? 'bg-[#FEF3C7]/60 border-[#F59E0B] ring-2 ring-[#F59E0B]/20' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#D97706]">
                <Wrench size={16} strokeWidth={2.5} />
                <p className="text-xs font-bold">รอตรวจ/รอซ่อม</p>
              </div>
              <span className="bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded text-[10px] font-bold">{stats.pendingPct}%</span>
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">{stats.pending}</p>
          </div>

          <div 
            onClick={() => { setSelectedStatus('damaged'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'damaged' ? 'bg-[#FEE2E2]/60 border-[#EF4444] ring-2 ring-[#EF4444]/20' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#DC2626]">
                <AlertTriangle size={16} strokeWidth={2.5} />
                <p className="text-xs font-bold">ชำรุด</p>
              </div>
              <span className="bg-[#FEE2E2] text-[#991B1B] px-1.5 py-0.5 rounded text-[10px] font-bold">{stats.damagedPct}%</span>
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">{stats.damaged}</p>
          </div>

          <div 
            onClick={() => { setSelectedStatus('disposed'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'disposed' ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Trash2 size={16} strokeWidth={2.5} />
                <p className="text-xs font-bold">จำหน่าย/เลิกใช้งาน</p>
              </div>
              <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{stats.disposedPct}%</span>
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">{stats.disposed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <div className="relative col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหารหัส PPE, ชื่ออุปกรณ์, ผู้ใช้งาน ..." 
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
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">สถานะ</label>
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
                  <option value="disposed">จำหน่าย/เลิกใช้งาน</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col gap-2 shrink-0">
            {userRole === 'admin' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#7C5EE4] hover:bg-[#6D53C9] text-white py-2.5 px-6 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus size={18} /> เพิ่มอุปกรณ์ใหม่
              </button>
            )}
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedUser('all'); setSelectedStatus('all'); setCurrentPage(1); }}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-6 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap border border-slate-200"
            >
              <RefreshCw size={16} /> ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Tabs & Table Container */}
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {/* Table Toolbar */}
          <div className="px-4 pt-4 pb-0 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
            <div className="flex gap-6 border-b border-transparent text-sm font-bold">
              <button className="pb-3 border-b-2 border-[#1E88E5] text-[#1E88E5]">ดูตามอุปกรณ์ (รายชิ้น)</button>
              <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700">ดูตามช่างผู้เบิก</button>
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
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200">
                  <th className="px-5 py-3.5 font-bold">รหัส/หมายเลข</th>
                  <th className="px-5 py-3.5 font-bold">รูปภาพ</th>
                  <th className="px-5 py-3.5 font-bold text-slate-800">ชื่ออุปกรณ์</th>
                  <th className="px-5 py-3.5 font-bold">หมวดหมู่</th>
                  <th className="px-5 py-3.5 font-bold">ผู้ใช้งาน / ช่าง</th>
                  <th className="px-5 py-3.5 font-bold">ตรวจล่าสุด</th>
                  <th className="px-5 py-3.5 font-bold">สถานะ</th>
                  <th className="px-5 py-3.5 font-bold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      ไม่มีข้อมูลที่ตรงกับตัวกรอง
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs font-bold text-slate-600">{item.id}</td>
                        <td className="px-5 py-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm border border-slate-200">
                            {getEmojiIcon(item.category, item.name)}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-800 max-w-[200px] truncate" title={item.name}>{item.name}</td>
                        <td className="px-5 py-3 text-slate-500 max-w-[150px] truncate" title={item.category}>{item.category.split(' ')[1] || item.category}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                              {item.userName.charAt(0)}
                            </div>
                            <span className="text-slate-700 font-medium">{item.userName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(item.lastInspected)}</td>
                        <td className="px-5 py-3">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {userRole === 'admin' ? (
                            <button 
                              onClick={() => { setUpdateItem(item); setUpdateTargetStatus(item.status); }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#1E88E5] hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            >
                              <Edit3 size={14} /> อัปเดต
                            </button>
                          ) : (
                            <button className="text-slate-400 cursor-not-allowed">
                              <MoreVertical size={16} />
                            </button>
                          )}
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
              แสดง {(currentPage - 1) * itemsPerPage + (filteredData.length > 0 ? 1 : 0)} - {Math.min(currentPage * itemsPerPage, filteredData.length)} จาก {filteredData.length} รายการ
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              {/* Simple pagination logic for demo */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let page = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  page = currentPage - 2 + i;
                  if (page > totalPages) return null;
                }
                
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

      {/* Update Status Modal */}
      {updateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Edit3 size={20} className="text-indigo-600" /> อัปเดตสถานะรายชิ้น
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{updateItem.id}</span>
                    <span className="text-xs text-slate-500">ผู้ถือครอง: {updateItem.userName}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 leading-tight">{updateItem.name}</h4>
                </div>
              </div>

              <form id="update-form" onSubmit={handleUpdateStatus} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">สถานะปัจจุบัน: {getStatusBadge(updateItem.status)}</label>
                  <label className="block text-sm font-bold text-slate-700 mb-2">อัปเดตเป็น <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center justify-center gap-2 cursor-pointer px-3 py-3 rounded-xl border-2 transition-colors ${updateTargetStatus === 'ready' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'}`}>
                      <input type="radio" className="hidden" checked={updateTargetStatus === 'ready'} onChange={() => setUpdateTargetStatus('ready')} />
                      <CheckCircle size={18} /> พร้อมใช้งาน
                    </label>
                    <label className={`flex items-center justify-center gap-2 cursor-pointer px-3 py-3 rounded-xl border-2 transition-colors ${updateTargetStatus === 'pending' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-200'}`}>
                      <input type="radio" className="hidden" checked={updateTargetStatus === 'pending'} onChange={() => setUpdateTargetStatus('pending')} />
                      <Wrench size={18} /> รอซ่อม
                    </label>
                    <label className={`flex items-center justify-center gap-2 cursor-pointer px-3 py-3 rounded-xl border-2 transition-colors ${updateTargetStatus === 'damaged' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200'}`}>
                      <input type="radio" className="hidden" checked={updateTargetStatus === 'damaged'} onChange={() => setUpdateTargetStatus('damaged')} />
                      <AlertTriangle size={18} /> ชำรุด
                    </label>
                    <label className={`flex items-center justify-center gap-2 cursor-pointer px-3 py-3 rounded-xl border-2 transition-colors ${updateTargetStatus === 'disposed' ? 'bg-slate-100 border-slate-500 text-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      <input type="radio" className="hidden" checked={updateTargetStatus === 'disposed'} onChange={() => setUpdateTargetStatus('disposed')} />
                      <Trash2 size={18} /> จำหน่ายแล้ว
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setUpdateItem(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">ยกเลิก</button>
              <button type="submit" form="update-form" className="px-6 py-2 text-sm font-bold text-white bg-[#1E88E5] hover:bg-blue-600 rounded-lg transition-colors shadow-sm">
                บันทึกสถานะ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add new equipment mock modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">เพิ่มอุปกรณ์ใหม่</h3>
            <p className="text-slate-500 text-sm mb-6">ฟังก์ชันการเพิ่มอุปกรณ์ชิ้นใหม่ยังอยู่ในระหว่างการพัฒนา</p>
            <button onClick={() => setShowCreateModal(false)} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}
    </div>
  );
}
