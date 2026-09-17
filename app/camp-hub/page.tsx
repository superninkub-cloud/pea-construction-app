"use client";

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Sun, 
  Users, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Navigation,
  HardHat,
  ThermometerSun,
  Wind,
  ShieldCheck
} from 'lucide-react';
import MobileBottomNav from '../components/MobileBottomNav';

export default function CampHubPage() {
  const [activeTab, setActiveTab] = useState<'map' | 'brief' | 'team'>('brief');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  
  // Fake state for demo
  const [workers, setWorkers] = useState([
    { id: 1, name: 'สมชาย รักงาน', role: 'ช่างไฟฟ้า', status: 'present' },
    { id: 2, name: 'วิชัย ใจดี', role: 'ช่างโยธา', status: 'present' },
    { id: 3, name: 'สมศักดิ์ ขยัน', role: 'ผู้ช่วยช่าง', status: 'absent' },
    { id: 4, name: 'อำนาจ คงกระพัน', role: 'คนขับรถ', status: 'present' },
  ]);
  
  const [checks, setChecks] = useState<Record<string, boolean>>({
    ppe: false,
    tools: false,
    vehicle: false,
    briefing: false
  });

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleWorker = (id: number) => {
    setWorkers(workers.map(w => {
      if (w.id === id) {
        return { ...w, status: w.status === 'present' ? 'absent' : 'present' };
      }
      return w;
    }));
  };

  const isAllChecked = Object.values(checks).every(Boolean);

  if (!currentTime) return null; // Hydration fix

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-orange-200">
      
      {/* Dynamic Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 md:p-8 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <HardHat size={120} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Camp Hub</h1>
            <p className="text-orange-100 font-medium mt-1">ศูนย์บริหารแคมป์หน้างาน</p>
          </div>
          <div className="text-right bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
            <p className="text-2xl font-bold">{currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-xs text-orange-100">{currentTime.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mt-8 bg-black/10 p-1.5 rounded-2xl backdrop-blur-sm w-full md:w-max mx-auto md:mx-0">
          <button 
            onClick={() => setActiveTab('brief')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'brief' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            <Sun size={16} /> <span className="hidden sm:inline">Morning</span> Brief
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'team' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            <Users size={16} /> ลงเวลาคนงาน
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'map' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            <MapPin size={16} /> แผนที่
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 mt-2">
        
        {/* ---------------- MORNING BRIEF TAB ---------------- */}
        {activeTab === 'brief' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Weather Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CloudRain className="text-blue-500" /> สภาพอากาศวันนี้ ณ แคมป์
                </h2>
                <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">ปลอดภัยต่อการทำงาน</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <Sun className="text-amber-500 mb-2" size={32} />
                  <span className="text-2xl font-bold text-slate-800">32°</span>
                  <span className="text-xs text-slate-500">อุณหภูมิ</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <CloudRain className="text-blue-400 mb-2" size={32} />
                  <span className="text-2xl font-bold text-slate-800">20%</span>
                  <span className="text-xs text-slate-500">โอกาสฝนตก</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <Wind className="text-teal-500 mb-2" size={32} />
                  <span className="text-2xl font-bold text-slate-800">12</span>
                  <span className="text-xs text-slate-500">กม./ชม.</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <ThermometerSun className="text-rose-500 mb-2" size={32} />
                  <span className="text-2xl font-bold text-slate-800">สูง</span>
                  <span className="text-xs text-slate-500">รังสี UV</span>
                </div>
              </div>
            </div>

            {/* Safety Checklist */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <ShieldCheck className="text-emerald-500" /> เช็คลิสต์ความปลอดภัยก่อนเริ่มงาน
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 bg-slate-50 hover:bg-orange-50/50 rounded-2xl border border-slate-100 cursor-pointer transition-colors">
                  <input type="checkbox" checked={checks.ppe} onChange={e => setChecks({...checks, ppe: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  <div className="ml-4">
                    <p className="font-bold text-slate-700">ตรวจสอบอุปกรณ์ PPE</p>
                    <p className="text-xs text-slate-500">หมวก, ถุงมือ, เข็มขัดนิรภัย พร้อมใช้งาน 100%</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 bg-slate-50 hover:bg-orange-50/50 rounded-2xl border border-slate-100 cursor-pointer transition-colors">
                  <input type="checkbox" checked={checks.tools} onChange={e => setChecks({...checks, tools: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  <div className="ml-4">
                    <p className="font-bold text-slate-700">ตรวจสอบเครื่องมือช่างและ Hotline</p>
                    <p className="text-xs text-slate-500">เครื่องมือไม่ชำรุด ไม่มีรอยฉีกขาด</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 bg-slate-50 hover:bg-orange-50/50 rounded-2xl border border-slate-100 cursor-pointer transition-colors">
                  <input type="checkbox" checked={checks.vehicle} onChange={e => setChecks({...checks, vehicle: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  <div className="ml-4">
                    <p className="font-bold text-slate-700">ตรวจสอบสภาพรถบรรทุก/เครน</p>
                    <p className="text-xs text-slate-500">น้ำมันเชื้อเพลิง, ลมยาง, ระบบไฮดรอลิกปกติ</p>
                  </div>
                </label>

                <label className="flex items-center p-4 bg-slate-50 hover:bg-orange-50/50 rounded-2xl border border-slate-100 cursor-pointer transition-colors">
                  <input type="checkbox" checked={checks.briefing} onChange={e => setChecks({...checks, briefing: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  <div className="ml-4">
                    <p className="font-bold text-slate-700">ชี้แจงแผนงาน (Toolbox Talk)</p>
                    <p className="text-xs text-slate-500">พูดคุยความเสี่ยงและแบ่งหน้าที่หน้างานชัดเจนแล้ว</p>
                  </div>
                </label>
              </div>

              <div className="mt-6">
                <button 
                  disabled={!isAllChecked}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isAllChecked ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  <CheckCircle2 /> {isAllChecked ? "บันทึกข้อมูลและพร้อมออกปฏิบัติงาน!" : "กรุณาตรวจสอบให้ครบทุกข้อ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TEAM ATTENDANCE TAB ---------------- */}
        {activeTab === 'team' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users className="text-indigo-500" /> เช็คชื่อทีมงานประจำวัน
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">กดที่รายชื่อเพื่อเปลี่ยนสถานะ มา/ขาด</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                  <span className="text-2xl font-black text-indigo-700">{workers.filter(w => w.status==='present').length}</span>
                  <span className="text-sm font-semibold text-indigo-900 mt-1">/ {workers.length} คน</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workers.map(w => (
                  <div 
                    key={w.id} 
                    onClick={() => toggleWorker(w.id)}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${w.status === 'present' ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100' : 'border-rose-200 bg-rose-50/50 opacity-70 hover:opacity-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${w.status === 'present' ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                        {w.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-bold ${w.status === 'present' ? 'text-slate-800' : 'text-slate-500 line-through'}`}>{w.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{w.role}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {w.status === 'present' ? (
                        <div className="bg-emerald-500 text-white p-1 rounded-full shadow-sm"><CheckCircle2 size={20} /></div>
                      ) : (
                        <div className="bg-rose-500 text-white p-1 rounded-full shadow-sm"><AlertTriangle size={20} /></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                  <CheckCircle2 size={18} /> บันทึกการลงเวลา
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- MAP TAB ---------------- */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col h-[600px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="text-rose-500" /> แผนที่พิกัดแคมป์และหน้างาน
                </h2>
                <button className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1">
                  <Navigation size={14} /> นำทาง
                </button>
              </div>
              
              <div className="flex-1 bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden relative group">
                <div className="absolute inset-0 bg-cover bg-center opacity-70 transition-all group-hover:opacity-100" style={{ backgroundImage: "url('https://api.maptiler.com/maps/streets-v2/256/13/6468/3816.png?key=f4d9b')" }}></div>
                
                {/* Fake Markers */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                  <div className="bg-orange-500 text-white p-3 rounded-full shadow-xl shadow-orange-500/50 border-2 border-white">
                    <MapPin size={24} />
                  </div>
                  <span className="mt-2 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-lg border border-slate-100">แคมป์หลักทีม A</span>
                </div>

                <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-600/50 border-2 border-white">
                    <MapPin size={16} />
                  </div>
                  <span className="mt-2 bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200">จุดก่อสร้าง 1</span>
                </div>

                <div className="absolute top-3/4 left-2/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg shadow-indigo-600/50 border-2 border-white">
                    <MapPin size={16} />
                  </div>
                  <span className="mt-2 bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200">จุดก่อสร้าง 2</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <MobileBottomNav />
    </div>
  );
}
