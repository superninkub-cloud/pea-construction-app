"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Search, Bell, LogOut, Calendar, Users, List, Filter, AlertTriangle, CheckCircle, Package, ShoppingCart, TrendingUp, TrendingDown, FileEdit, Activity, Plus, X, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { safetyData, getSafetyStats } from './data';

export default function SafetyPPEDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('latest');
  const [showAllListItems, setShowAllListItems] = useState(false);
  const [showAllTableItems, setShowAllTableItems] = useState(false);
  
  const [localData, setLocalData] = useState(safetyData);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const saveLocalData = (newData: any) => {
    setLocalData(newData);
    localStorage.setItem('pea_safety_data_v2', JSON.stringify(newData));
  };

  // Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateItem, setUpdateItem] = useState<any>(null);
  const [updateAction, setUpdateAction] = useState<'repair' | 'purchase'>('repair');
  const [updateAmount, setUpdateAmount] = useState(1);

  const handleOpenUpdate = (item: any, defaultAction: 'repair' | 'purchase' = 'repair') => {
    setUpdateItem(item);
    setUpdateAction(defaultAction);
    setUpdateAmount(1);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateItem) return;

    const newData = [...localData];
    const teamIndex = newData.findIndex(t => t.name.includes(updateItem.teamName));
    if (teamIndex >= 0) {
      const eqIndex = newData[teamIndex].equipment.findIndex((e: any) => e.name === updateItem.itemName);
      if (eqIndex >= 0) {
        const eq = newData[teamIndex].equipment[eqIndex];
        if (updateAction === 'repair') {
          if (eq.damaged >= updateAmount) {
            eq.damaged -= updateAmount;
          } else {
            eq.damaged = 0;
          }
        } else if (updateAction === 'purchase') {
          if (eq.missing >= updateAmount) {
            eq.missing -= updateAmount;
          } else {
            eq.missing = 0;
          }
          eq.actual += updateAmount;
        }
      }
    }
    
    saveLocalData(newData);
    setIsUpdateModalOpen(false);
    setUpdateItem(null);
  };
  
  // PR Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prItem, setPrItem] = useState('');
  const [prAmount, setPrAmount] = useState('');
  const [prTeam, setPrTeam] = useState('');
  const [prNote, setPrNote] = useState('');

  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prItem || !prAmount || !prTeam) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    alert(`สร้างคำขอจัดหา ${prItem} จำนวน ${prAmount} สำเร็จ (ระบบ Demo)`);
    setIsModalOpen(false);
    setPrItem('');
    setPrAmount('');
    setPrTeam('');
    setPrNote('');
  };

  const allTeams = useMemo(() => localData.map(t => t.name), [localData]);
  const allCategories = useMemo(() => Array.from(new Set(localData.flatMap(t => t.equipment.map(e => e.category)))).sort(), [localData]);

  const filteredData = useMemo(() => {
    return localData.map(team => {
      if (selectedTeam !== 'all' && team.name !== selectedTeam) {
        return { ...team, equipment: [] };
      }
      const filteredEquipment = team.equipment.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        let matchesStatus = true;
        if (selectedStatus === 'ready') matchesStatus = (item.actual - item.damaged) > 0;
        else if (selectedStatus === 'damaged') matchesStatus = item.damaged > 0;
        else if (selectedStatus === 'missing') matchesStatus = item.missing > 0;
        return matchesSearch && matchesCategory && matchesStatus;
      });
      return { ...team, equipment: filteredEquipment };
    }).filter(team => selectedTeam === 'all' || team.name === selectedTeam);
  }, [searchQuery, selectedTeam, selectedCategory, selectedStatus, localData]);

  const stats = useMemo(() => getSafetyStats(filteredData), [filteredData]);
  
  // Prepare data for the Bar Chart (Status per team)
  const barChartData = filteredData.map(team => {
    let ready = 0;
    let damaged = 0;
    let missing = 0;
    team.equipment.forEach(item => {
      ready += (item.actual - item.damaged);
      damaged += item.damaged;
      missing += item.missing;
    });
    // Shorten team name for chart
    const shortName = team.name.replace('ชุดงาน นาย', '');
    return { name: shortName, ready, damaged, missing };
  });

  // Mock data for Line Chart
  const lineChartData = [
    { name: 'ม.ค.', total: 30, pass: 15, fail: 8 },
    { name: 'ก.พ.', total: 38, pass: 20, fail: 10 },
    { name: 'มี.ค.', total: 42, pass: 25, fail: 12 },
    { name: 'เม.ย.', total: 50, pass: 30, fail: 15 },
    { name: 'พ.ค.', total: 52, pass: 32, fail: 14 },
    { name: 'มิ.ย.', total: 46, pass: 26, fail: 10 },
    { name: 'ก.ค.', total: 50, pass: 30, fail: 12 },
    { name: 'ส.ค.', total: 49, pass: 29, fail: 14 },
    { name: 'ก.ย.', total: 55, pass: 35, fail: 16 },
    { name: 'ต.ค.', total: 59, pass: 40, fail: 17 },
    { name: 'พ.ย.', total: 60, pass: 43, fail: 15 },
    { name: 'ธ.ค.', total: 65, pass: 45, fail: 14 },
  ];

  // Prepare table data for missing/damaged
  const missingDamagedList: any[] = [];
  filteredData.forEach(team => {
    team.equipment.forEach(item => {
      if (item.missing > 0 || item.damaged > 0) {
        missingDamagedList.push({
          id: `${team.id}-${item.id}`,
          itemName: item.name,
          unit: item.unit,
          missing: item.missing,
          damaged: item.damaged,
          teamName: team.name.replace('ชุดงาน ', ''),
          action: item.damaged > 0 ? 'เร่งดำเนินการ' : 'จัดหา'
        });
      }
    });
  });
  
  // Sort by highest missing + damaged
  missingDamagedList.sort((a, b) => (b.missing + b.damaged) - (a.missing + a.damaged));
  const topIssues = missingDamagedList;

  const groupedEquipment = useMemo(() => {
    const map = new Map();
    filteredData.forEach(team => {
      team.equipment.forEach(eq => {
        if (!map.has(eq.name)) {
          map.set(eq.name, { name: eq.name, standard: 0, actual: 0, missing: 0, damaged: 0 });
        }
        const g = map.get(eq.name);
        g.standard += eq.standard;
        g.actual += eq.actual;
        g.missing += eq.missing;
        g.damaged += eq.damaged;
      });
    });
    return Array.from(map.values());
  }, [filteredData]);

  const listItems = useMemo(() => {
    let items = [...groupedEquipment];
    if (activeTab === 'missing') items = items.filter(i => i.missing > 0).sort((a, b) => b.missing - a.missing);
    else if (activeTab === 'damaged') items = items.filter(i => i.damaged > 0).sort((a, b) => b.damaged - a.damaged);
    else if (activeTab === 'pr') items = items.filter(i => i.missing > 0).sort((a, b) => b.missing - a.missing);
    else {
      items.sort((a, b) => {
        const rateA = a.standard > 0 ? (a.actual - a.damaged) / a.standard : 0;
        const rateB = b.standard > 0 ? (b.actual - b.damaged) / b.standard : 0;
        return rateA - rateB;
      });
    }
    return items;
  }, [groupedEquipment, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-6 lg:p-8 pb-20 lg:pb-32 w-full max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 text-indigo-700 p-2.5 rounded-lg">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">ศูนย์บริหารความปลอดภัยและ PPE</h1>
            <p className="text-sm text-slate-500">ดูแลอุปกรณ์ความปลอดภัย ตรวจสอบการใช้งาน และเสริมสร้างวัฒนธรรมความปลอดภัยในองค์กร</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาอุปกรณ์, รายงาน..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">หน่วยงาน / ทีมงาน</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm appearance-none bg-slate-50"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="all">-- ทุกหน่วยงาน --</option>
              {allTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">ประเภทอุปกรณ์</label>
          <div className="relative">
            <List className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm appearance-none bg-slate-50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">-- ทุกประเภท --</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">สถานะ</label>
          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm appearance-none bg-slate-50"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">-- ทุกสถานะ --</option>
              <option value="ready">พร้อมใช้งาน</option>
              <option value="missing">ขาดแคลน</option>
              <option value="damaged">ชำรุด</option>
            </select>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Search size={16} /> ค้นหา
          </button>
          <button className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div 
          onClick={() => { setSelectedStatus('all'); setSelectedTeam('all'); setSelectedCategory('all'); setActiveTab('latest'); }}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer hover:border-indigo-300"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
              <FileEdit size={14} className="text-indigo-500" />
              จำนวนรายการทั้งหมด
            </div>
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">{stats.totalItems}</h2>
            <div className="flex items-center text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp size={12} className="mr-1" />
              <span>+12%</span>
              <span className="text-slate-400 font-normal ml-1">จากเดือนก่อน</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => { setSelectedStatus('ready'); setActiveTab('latest'); }}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between border-b-4 border-b-emerald-400 hover:shadow-md transition-all cursor-pointer hover:border-emerald-300"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" />
              PPE พร้อมใช้งาน
            </div>
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">{stats.readyItems}</h2>
            <div className="flex items-center text-xs text-emerald-600 font-medium mt-1">
              <span>{Math.round((stats.readyItems / stats.totalItems) * 100)}%</span>
              <span className="text-slate-400 font-normal ml-1">จากทั้งหมด</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => { setSelectedStatus('damaged'); setActiveTab('damaged'); }}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between border-b-4 border-b-rose-400 hover:shadow-md transition-all cursor-pointer hover:border-rose-300"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-rose-500" />
              อุปกรณ์ชำรุด
            </div>
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">{stats.damagedItems}</h2>
            <div className="flex items-center text-xs text-rose-600 font-medium mt-1">
              <TrendingUp size={12} className="mr-1" />
              <span>{Math.round((stats.damagedItems / stats.totalItems) * 100)}%</span>
              <span className="text-slate-400 font-normal ml-1">เพิ่มขึ้นจากเดือนก่อน</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => { setSelectedStatus('missing'); setActiveTab('missing'); }}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between border-b-4 border-b-amber-400 hover:shadow-md transition-all cursor-pointer hover:border-amber-300"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
              <Package size={14} className="text-amber-500" />
              รายการขาดแคลน
            </div>
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">{stats.missingItems}</h2>
            <div className="flex items-center text-xs text-amber-600 font-medium mt-1">
              <TrendingDown size={12} className="mr-1" />
              <span>{Math.round((stats.missingItems / stats.totalItems) * 100)}%</span>
              <span className="text-slate-400 font-normal ml-1">ต้องจัดหาเพิ่มเติม</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('pr')}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
              <ShoppingCart size={14} className="text-blue-500" />
              คำขอจัดหาค้าง
            </div>
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">12</h2>
            <div className="flex items-center text-xs text-blue-600 font-medium mt-1">
              <TrendingDown size={12} className="mr-1" />
              <span>2.4%</span>
              <span className="text-slate-400 font-normal ml-1">รออนุมัติ / จัดหา</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setSelectedTeam('all')}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer hover:border-indigo-300"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
              <Users size={14} className="text-indigo-500" />
              ทีมงานทั้งหมด
            </div>
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">{stats.totalTeams}</h2>
            <div className="flex items-center text-xs text-emerald-600 font-medium mt-1">
              <span>ชุดงาน</span>
              <span className="text-slate-400 font-normal ml-1">ผกร.(ก3)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChartIcon size={20} className="text-indigo-600" /> 
              สรุปสถานะ PPE รายทีมงาน
            </h3>
            <select className="border border-slate-200 text-xs rounded-md px-2 py-1 bg-slate-50">
              <option>2567</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Bar dataKey="ready" name="พร้อมใช้งาน" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={30} />
                <Bar dataKey="damaged" name="ชำรุด" stackId="a" fill="#f59e0b" />
                <Bar dataKey="missing" name="ขาดแคลน" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs & Lists */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side Lists */}
        <div className="w-full lg:w-2/5">
          <div className="flex items-center gap-2 mb-4 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button 
              onClick={() => setActiveTab('latest')}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap outline-none focus:outline-none border-none transition-all ${activeTab === 'latest' ? 'bg-indigo-100 text-indigo-700 font-bold shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}>
              การตรวจสภาพล่าสุด
            </button>
            <button 
              onClick={() => setActiveTab('missing')}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap outline-none focus:outline-none border-none transition-all ${activeTab === 'missing' ? 'bg-indigo-100 text-indigo-700 font-bold shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}>
              รายการขาดแคลน
            </button>
            <button 
              onClick={() => setActiveTab('pr')}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap outline-none focus:outline-none border-none transition-all ${activeTab === 'pr' ? 'bg-indigo-100 text-indigo-700 font-bold shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}>
              คำขอจัดหา (PR)
            </button>
            <button 
              onClick={() => setActiveTab('damaged')}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap outline-none focus:outline-none border-none transition-all ${activeTab === 'damaged' ? 'bg-indigo-100 text-indigo-700 font-bold shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}>
              อุปกรณ์ชำรุด
            </button>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">
              {activeTab === 'latest' && 'รายการตรวจสภาพล่าสุด'}
              {activeTab === 'missing' && 'รายการอุปกรณ์ขาดแคลน'}
              {activeTab === 'pr' && 'รายการคำขอจัดหา (PR)'}
              {activeTab === 'damaged' && 'รายการอุปกรณ์ชำรุด'}
            </h3>
            <button 
              onClick={() => setShowAllListItems(!showAllListItems)}
              className="text-xs text-indigo-600 bg-transparent hover:bg-indigo-50 px-3 py-1.5 rounded-full border-none flex items-center gap-1 outline-none focus:outline-none transition-colors font-medium"
            >
              {showAllListItems ? 'ดูน้อยลง' : 'ดูทั้งหมด'} <TrendingUp size={12} className={showAllListItems ? "-rotate-45" : "rotate-45"} />
            </button>
          </div>

          <div className="space-y-3">
            {listItems.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm">
                ไม่พบรายการในหมวดหมู่นี้
              </div>
            ) : (
              (showAllListItems ? listItems : listItems.slice(0, 4)).map((item, idx) => {
                const passRate = item.standard > 0 ? Math.round(((item.actual - item.damaged) / item.standard) * 100) : 0;
                const hasProblem = passRate < 100;
                const isDanger = passRate <= 80;
                
                return (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                    <div className={`absolute top-0 left-0 w-1 h-full ${hasProblem ? (isDanger ? 'bg-rose-500' : 'bg-amber-400') : 'bg-emerald-500'}`}></div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${hasProblem ? (isDanger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600') : 'bg-emerald-50 text-emerald-600'}`}>
                          {hasProblem ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm max-w-[200px] truncate">{item.name}</h4>
                          <p className="text-xs text-slate-500">ผลรวมจาก {filteredData.length} ทีม</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-md font-medium whitespace-nowrap ${hasProblem ? (isDanger ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700') : 'bg-emerald-100 text-emerald-700'}`}>
                        {hasProblem ? (isDanger ? 'วิกฤต' : 'พบปัญหา') : 'พร้อมใช้'}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">จำนวนที่พร้อมใช้ <span className="font-bold text-slate-700">{(item.actual - item.damaged)} / {item.standard}</span></span>
                        <span className={`font-bold ${hasProblem ? (isDanger ? 'text-rose-600' : 'text-amber-500') : 'text-emerald-600'}`}>{passRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                        <div className={`h-1.5 rounded-full ${hasProblem ? (isDanger ? 'bg-rose-500' : 'bg-amber-400') : 'bg-emerald-500'}`} style={{ width: `${passRate}%` }}></div>
                      </div>
                      {(item.missing > 0 || item.damaged > 0) && (
                        <div className="flex gap-4 text-xs mt-2 mb-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {item.missing > 0 && <span>ขาดแคลน: <strong className="text-rose-500">{item.missing}</strong></span>}
                          {item.damaged > 0 && <span>ชำรุด: <strong className="text-amber-500">{item.damaged}</strong></span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side Table */}
        <div className="w-full lg:w-3/5 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-500" />
              รายการ PPE ที่ขาดแคลน / ชำรุด
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
              >
                <Plus size={14} /> สร้างคำขอจัดหา
              </button>
              <button 
                onClick={() => setShowAllTableItems(!showAllTableItems)}
                className="text-xs border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors outline-none focus:outline-none"
              >
                {showAllTableItems ? 'ดูน้อยลง ←' : 'ดูทั้งหมด →'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">รายการอุปกรณ์</th>
                  <th className="px-4 py-3 font-medium text-center">หน่วยนับ</th>
                  <th className="px-4 py-3 font-medium text-center">ขาดแคลน</th>
                  <th className="px-4 py-3 font-medium text-center">ชำรุด</th>
                  <th className="px-4 py-3 font-medium">ทีมงาน/ผู้ใช้งาน</th>
                  <th className="px-4 py-3 font-medium text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(showAllTableItems ? topIssues : topIssues.slice(0, 5)).map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{item.itemName}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{item.unit}</td>
                    <td className="px-4 py-3 text-center">
                      {item.missing > 0 ? (
                        <span className="text-rose-600 font-bold">{item.missing}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.damaged > 0 ? (
                        <span className="text-amber-500 font-bold">{item.damaged}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.teamName}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {item.damaged > 0 && (
                          <button 
                            onClick={() => handleOpenUpdate(item, 'repair')}
                            className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-md font-medium transition-colors outline-none focus:outline-none whitespace-nowrap"
                          >
                            แจ้งซ่อม
                          </button>
                        )}
                        {item.missing > 0 && (
                          <button 
                            onClick={() => handleOpenUpdate(item, 'purchase')}
                            className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-md font-medium transition-colors outline-none focus:outline-none whitespace-nowrap"
                          >
                            รับของ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {topIssues.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      ไม่พบรายการขาดแคลนหรือชำรุด
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>




      {/* Spacer to fix bottom scrolling issue */}
      <div className="h-24 md:h-32 flex-shrink-0 w-full"></div>

      {/* PR Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" />
                สร้างคำขอจัดหา PPE
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="pr-form" onSubmit={handleCreatePR} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รายการอุปกรณ์ <span className="text-rose-500">*</span></label>
                  <select 
                    required
                    value={prItem}
                    onChange={(e) => setPrItem(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="">-- เลือกอุปกรณ์ --</option>
                    {allCategories.map(cat => (
                      <optgroup key={cat} label={cat}>
                        {Array.from(new Set(safetyData.flatMap(t => t.equipment.filter(e => e.category === cat).map(e => e.name)))).map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนที่ขอ <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={prAmount}
                      onChange={(e) => setPrAmount(e.target.value)}
                      placeholder="เช่น 10"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">หน่วยงาน <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      value={prTeam}
                      onChange={(e) => setPrTeam(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">-- เลือกทีม --</option>
                      {allTeams.map(team => (
                        <option key={team} value={team}>{team.replace('ชุดงาน ', '')}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เหตุผล/หมายเหตุ</label>
                  <textarea 
                    value={prNote}
                    onChange={(e) => setPrNote(e.target.value)}
                    placeholder="เช่น อุปกรณ์เดิมชำรุดเสียหายจากการปฏิบัติงาน..."
                    rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit"
                form="pr-form"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                บันทึกคำขอ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update/Repair Modal */}
      {isUpdateModalOpen && updateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FileEdit size={20} className="text-indigo-600" /> อัปเดตรายการ
              </h3>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors outline-none focus:outline-none">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">อุปกรณ์: <span className="font-bold text-slate-800">{updateItem.itemName}</span></p>
                <p className="text-sm text-slate-500 mb-1">ทีมงาน: <span className="font-bold text-slate-800">{updateItem.teamName}</span></p>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded">ขาดแคลน: {updateItem.missing}</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">ชำรุด: {updateItem.damaged}</span>
                </div>
              </div>
              <form id="update-form" onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทการอัปเดต</label>
                  <select 
                    value={updateAction} 
                    onChange={(e) => setUpdateAction(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="repair" disabled={updateItem.damaged === 0}>ซ่อมแซมเสร็จสิ้น (ลดชำรุด)</option>
                    <option value="purchase" disabled={updateItem.missing === 0}>รับของจัดซื้อ (ลดขาดแคลน)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนที่{updateAction === 'repair' ? 'ซ่อมแซมเสร็จ' : 'ได้รับของ'}</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={updateAction === 'repair' ? updateItem.damaged : updateItem.missing}
                    value={updateAmount}
                    onChange={(e) => setUpdateAmount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors outline-none focus:outline-none">ยกเลิก</button>
              <button type="submit" form="update-form" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm outline-none focus:outline-none">บันทึกอัปเดต</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
