"use client";

import React, { useState } from 'react';
import { Shield, Search, Bell, LogOut, Calendar, Users, List, Filter, AlertTriangle, CheckCircle, Package, ShoppingCart, TrendingUp, TrendingDown, FileEdit, Activity, Plus, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { safetyData, getSafetyStats } from './data';

export default function SafetyPPEDashboard() {
  const stats = getSafetyStats();
  
  // Prepare data for the Bar Chart (Status per team)
  const barChartData = safetyData.map(team => {
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
  safetyData.forEach(team => {
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
  const topIssues = missingDamagedList.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto font-sans">
      
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">ช่วงเวลา</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm appearance-none bg-slate-50">
              <option>พฤษภาคม 2567</option>
              <option>มิถุนายน 2567</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">หน่วยงาน / ทีมงาน</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm appearance-none bg-slate-50">
              <option>-- ทุกหน่วยงาน --</option>
              <option>นายขวัญนคร</option>
              <option>นายวีรพัฒน์</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">ประเภทอุปกรณ์</label>
          <div className="relative">
            <List className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm appearance-none bg-slate-50">
              <option>-- ทุกประเภท --</option>
              <option>ป้องกันศีรษะ</option>
              <option>ป้องกันมือและแขน</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">สถานะ</label>
          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm appearance-none bg-slate-50">
              <option>-- ทุกสถานะ --</option>
              <option>พร้อมใช้งาน</option>
              <option>ชำรุด</option>
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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between border-b-4 border-b-emerald-400 hover:shadow-md transition-shadow">
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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between border-b-4 border-b-rose-400 hover:shadow-md transition-shadow">
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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between border-b-4 border-b-amber-400 hover:shadow-md transition-shadow">
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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" /> 
              แนวโน้มการตรวจสภาพอุปกรณ์
            </h3>
            <select className="border border-slate-200 text-xs rounded-md px-2 py-1 bg-slate-50">
              <option>2567</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Line type="monotone" dataKey="total" name="ตรวจทั้งหมด" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="pass" name="ผ่านการตรวจ" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                <Line type="monotone" dataKey="fail" name="ไม่ผ่าน (ต้องแก้ไข)" stroke="#f43f5e" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs & Lists */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side Lists */}
        <div className="w-full lg:w-2/5">
          <div className="flex items-center gap-4 border-b border-slate-200 mb-4 pb-2 overflow-x-auto">
            <button className="text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 pb-2 whitespace-nowrap">การตรวจสภาพล่าสุด</button>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-2 whitespace-nowrap">รายการขาดแคลน</button>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-2 whitespace-nowrap">คำขอจัดหา (PR)</button>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-2 whitespace-nowrap">อุปกรณ์ชำรุด</button>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">รายการตรวจสภาพล่าสุด</h3>
            <button className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              ดูทั้งหมด <TrendingUp size={12} className="rotate-45" />
            </button>
          </div>

          <div className="space-y-3">
            {/* List Items */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h20"></path><path d="M12 2v8"></path><path d="m4.93 10.93 2.83-2.83"></path><path d="m16.24 8.1 2.83 2.83"></path><path d="M2 22h20"></path><path d="M12 10a6 6 0 0 0-6 6v2h12v-2a6 6 0 0 0-6-6Z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">หมวกนิรภัย</h4>
                    <p className="text-xs text-slate-500">ตรวจเมื่อ 14 พ.ค. 2567</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">ผ่าน</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">จำนวนที่ตรวจ <span className="font-bold text-slate-700">48 / 50</span></span>
                  <span className="font-bold text-emerald-600">96%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                </div>
                <button className="w-full py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                  ดูรายละเอียด →
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">เสื้อกั๊กสะท้อนแสง</h4>
                    <p className="text-xs text-slate-500">ตรวจเมื่อ 12 พ.ค. 2567</p>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md font-medium">พบปัญหา</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">จำนวนที่ตรวจ <span className="font-bold text-slate-700">35 / 40</span></span>
                  <span className="font-bold text-amber-500">87%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                  <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '87%' }}></div>
                </div>
                <button className="w-full py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                  ดูรายละเอียด →
                </button>
              </div>
            </div>
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
              <button className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors">
                <Plus size={14} /> สร้างคำขอจัดหา
              </button>
              <button className="text-xs border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors">
                ดูทั้งหมด →
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
                {topIssues.map((item, index) => (
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
                      <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                        item.action === 'เร่งดำเนินการ' 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.action}
                      </span>
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

      {/* Footer Banner */}
      <div className="mt-8 bg-indigo-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden shadow-lg">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <Shield size={36} className="text-indigo-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">&quot;ความปลอดภัย เริ่มต้นจากอุปกรณ์ที่พร้อมใช้งาน&quot;</h2>
            <p className="text-indigo-200 text-sm">ตรวจสอบ PPE อย่างสม่ำเสมอ ใช้งานอย่างถูกต้อง และดูแลซึ่งกันและกัน เพื่อให้ทุกคนกลับบ้านอย่างปลอดภัย</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 relative z-10 text-right">
          <p className="text-sm font-medium text-indigo-200 italic">&quot;ใส่ใจความปลอดภัย<br/>ในทุกวัน ทำงานได้อย่างมั่นใจ&quot;</p>
        </div>
      </div>

    </div>
  );
}
