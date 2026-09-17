"use client";

import React, { useState, useEffect } from "react";
import { Upload, Package, Wrench, AlertCircle, User, Loader2, Briefcase, ChevronDown, ChevronUp, CheckCircle2, CircleDashed, Info } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";

interface Material {
  id: string;
  wbs: string;
  technician_name: string;
  material_code: string;
  material_name: string;
  quantity: number; // Fallback legacy
  estimated_quantity: number; // ประมาณการ
  actual_quantity: number; // เบิกจริง หรือ คืนจริง
  damaged_quantity?: number; // ชำรุด
  unit: string;
  part: "new" | "demolish";
  status: string;
}

export default function MaterialTracking() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [technicians, setTechnicians] = useState<string[]>([]);
  
  const [uploadingWbs, setUploadingWbs] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("ทั้งหมด");
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;

      if (data) {
        const active = data.filter(p => p.status !== "F4" && p.status !== "ปิดงาน (TECO)");
        setActiveProjects(active);

        const techs = Array.from(new Set(active.map(p => p.supervisor).filter(Boolean))).sort();
        setTechnicians(techs);
      }

      const saved = localStorage.getItem("material_tracking_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        setMaterials(parsed);
      }
    } catch (e) {
      console.error("Failed to fetch base data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = (data: Material[]) => {
    setMaterials(data);
    localStorage.setItem("material_tracking_data", JSON.stringify(data));
  };

  const toggleProject = (wbs: string) => {
    setExpandedProjects(prev => ({ ...prev, [wbs]: !prev[wbs] }));
  };

  const handleUploadForProject = async (e: React.ChangeEvent<HTMLInputElement>, targetWbs: string, targetSupervisor: string) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploadingWbs(targetWbs);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/extract-zpsr018-material", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to extract data");
      }

      if (result.materials && result.materials.length > 0) {
        const newMaterials: Material[] = result.materials
          .map((m: any) => {
            const estimated = Number(m.estimated_quantity) || Number(m.quantity) || 0;
            const actual = Number(m.actual_quantity) || 0;
            const damaged = Number(m.damaged_quantity) || 0;
            const totalReturned = actual + damaged;
            
            let initialStatus = "";
            if (m.part === "new") {
              initialStatus = "ยังไม่ได้ก่อสร้าง"; 
            } else {
              if (totalReturned > 0 && totalReturned >= estimated) {
                initialStatus = "ส่งคืนแล้ว";
              } else if (totalReturned > 0) {
                initialStatus = "รื้อถอนแล้วยังไม่ส่งคืน";
              } else {
                initialStatus = "ยังไม่ได้รื้อถอนและยังไม่ส่งคืน";
              }
            }

            return {
              id: Math.random().toString(36).substring(2, 9),
              wbs: targetWbs,
              technician_name: targetSupervisor || "ยังไม่ระบุช่าง",
              material_code: m.material_code || "",
              material_name: m.material_name || "ไม่ระบุชื่อ",
              quantity: estimated, // Fallback legacy
              estimated_quantity: estimated,
              actual_quantity: actual,
              damaged_quantity: damaged,
              unit: m.unit || "",
              part: m.part === "demolish" ? "demolish" : "new",
              status: initialStatus
            };
          });

        const updated = [...materials, ...newMaterials];
        saveToStorage(updated);
        
        setExpandedProjects(prev => ({ ...prev, [targetWbs]: true }));
        alert(`ดึงข้อมูลสำเร็จ ${newMaterials.length} รายการสำหรับงาน ${targetWbs}\n(ระบบจัดการแยกพัสดุดี/ชำรุดให้อัตโนมัติ พร้อมตัดเศษเหล็ก/ลวดตีเกลียวออกตามกฎแล้ว)`);
      } else {
        alert("ไม่พบข้อมูลพัสดุในเอกสารนี้ (อาจเป็นโครงการสถานะ F4 ทั้งหมด หรือไม่มีรายการที่ดึงได้)");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "เกิดข้อผิดพลาดในการอ่านไฟล์");
    } finally {
      setUploadingWbs(null);
      e.target.value = '';
    }
  };

  const clearDataForWbs = (wbs: string) => {
    if (confirm(`ต้องการล้างข้อมูลพัสดุสำหรับงาน ${wbs} ใช่หรือไม่?`)) {
      const updated = materials.filter(m => m.wbs !== wbs);
      saveToStorage(updated);
    }
  };

  const updateStatus = (id: string, newStatus: string) => {
    const updated = materials.map(m => m.id === id ? { ...m, status: newStatus } : m);
    saveToStorage(updated);
  };

  const markAllStatus = (wbs: string, part: "new" | "demolish", newStatus: string) => {
    if (confirm(`ต้องการอัปเดตสถานะทั้งหมดเป็น "${newStatus}" ใช่หรือไม่?`)) {
      const updated = materials.map(m => (m.wbs === wbs && m.part === part) ? { ...m, status: newStatus } : m);
      saveToStorage(updated);
    }
  };

  const allTechsToDisplay = Array.from(new Set([
    ...technicians,
    ...materials.map(m => m.technician_name || "ยังไม่ระบุช่าง")
  ])).sort();

  const displayTechs = selectedTechnician === "ทั้งหมด" 
    ? allTechsToDisplay 
    : [selectedTechnician];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">กำลังโหลดฐานข้อมูลงานและช่าง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package size={28} />
          ติดตามพัสดุรายช่าง (ZPSR018)
        </h1>
        <p className="opacity-80 text-sm mt-1">
          เปรียบเทียบยอดประมาณการและยอดเบิก-คืนจากคลัง (แยกพัสดุดี/ชำรุด) เพื่อใช้ติดตามการจัดการพัสดุของช่าง
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-medium text-slate-600 shrink-0">เลือกช่างชุด:</label>
            <select 
              value={selectedTechnician} 
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full md:w-64 p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500 font-medium"
            >
              <option value="ทั้งหมด">แสดงช่างทั้งหมด ({allTechsToDisplay.length})</option>
              {allTechsToDisplay.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {materials.length > 0 && (
              <button 
                onClick={() => {
                  if(confirm("ต้องการล้างรายการพัสดุทั้งหมดในระบบใช่หรือไม่?")) saveToStorage([]);
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors border border-red-100"
              >
                ล้างรายการพัสดุทั้งหมด
              </button>
            )}
          </div>
        </div>

        {/* Technician Groups */}
        <div className="space-y-8">
          {displayTechs.map(tech => {
            const techProjects = activeProjects.filter(p => p.supervisor === tech);
            const techMaterials = materials.filter(m => (m.technician_name || "ยังไม่ระบุช่าง") === tech);
            
            const activeWbsSet = new Set(techProjects.map(p => p.wbs));
            const orphanWbs = Array.from(new Set(techMaterials.map(m => m.wbs))).filter(wbs => !activeWbsSet.has(wbs));

            return (
              <div key={tech} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 text-white px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <User size={20} className="text-blue-400" />
                    {tech}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                      งานที่รับผิดชอบ {techProjects.length} งาน
                    </span>
                    {techMaterials.length > 0 && (
                      <span className="bg-emerald-600 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500">
                        ดึงพัสดุแล้ว {Array.from(new Set(techMaterials.map(m=>m.wbs))).length} งาน
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 md:p-6 bg-slate-50">
                  {techProjects.length === 0 && orphanWbs.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed border-slate-300 rounded-xl">
                      <p className="text-slate-500 text-sm">ไม่พบงานที่กำลังดำเนินการสำหรับช่างชุดนี้</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Active Projects */}
                    {techProjects.map(p => {
                      const projMaterials = materials.filter(m => m.wbs === p.wbs);
                      const isExpanded = expandedProjects[p.wbs] || false;
                      const isUploadingThis = uploadingWbs === p.wbs;

                      // Summary Stats Calculation
                      const newMats = projMaterials.filter(m => m.part === 'new');
                      const demMats = projMaterials.filter(m => m.part === 'demolish');

                      // ยอดรวม ZPSR018
                      const totalNewEstimated = newMats.reduce((sum, m) => sum + (m.estimated_quantity || 0), 0);
                      const totalNewDrawn = newMats.reduce((sum, m) => sum + (m.actual_quantity || 0), 0);
                      
                      const totalDemEstimated = demMats.reduce((sum, m) => sum + (m.estimated_quantity || 0), 0);
                      const totalDemReturnedGood = demMats.reduce((sum, m) => sum + (m.actual_quantity || 0), 0);
                      const totalDemReturnedDamaged = demMats.reduce((sum, m) => sum + (m.damaged_quantity || 0), 0);
                      const totalDemReturnedTotal = totalDemReturnedGood + totalDemReturnedDamaged;

                      return (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:border-blue-300">
                          {/* Project Header (Clickable) */}
                          <div 
                            onClick={() => toggleProject(p.wbs)}
                            className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <Briefcase className="text-blue-500 shrink-0 mt-1" size={20} />
                              <div className="w-full pr-4">
                                <h4 className="font-bold text-slate-800 text-sm md:text-base">{p.wbs}</h4>
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{p.name}</p>
                                
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span className="text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium">
                                    สถานะงาน: {p.status}
                                  </span>
                                </div>

                                {/* Summary Progress Bars (Only show when materials are loaded) */}
                                {projMaterials.length > 0 && (
                                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-inner">
                                    {/* New Materials ZPSR018 Summary */}
                                    <div>
                                      <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                                          <Package size={12}/> พัสดุเบิกใหม่ ({newMats.length} รายการ)
                                        </span>
                                        <span className="text-slate-500 font-medium">
                                          เบิกคลัง <span className="text-emerald-600">{totalNewDrawn}</span> / ประมาณการ <span className="text-slate-700">{totalNewEstimated}</span>
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-200 rounded-full h-2 flex overflow-hidden">
                                        <div className="bg-emerald-500 h-2 transition-all duration-500" style={{ width: `${totalNewEstimated ? Math.min((totalNewDrawn/totalNewEstimated)*100, 100) : 0}%` }}></div>
                                      </div>
                                    </div>

                                    {/* Demolish Materials ZPSR018 Summary */}
                                    <div>
                                      <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-bold text-amber-700 flex items-center gap-1">
                                          <Wrench size={12}/> พัสดุรื้อถอน ({demMats.length} รายการ)
                                        </span>
                                        <span className="text-slate-500 font-medium">
                                          รวมคืนคลัง <span className="text-emerald-600">{totalDemReturnedTotal}</span> (ดี {totalDemReturnedGood}, ชำรุด {totalDemReturnedDamaged}) / ประมาณการรื้อ <span className="text-slate-700">{totalDemEstimated}</span>
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-200 rounded-full h-2 flex overflow-hidden">
                                        <div className="bg-emerald-500 h-2 transition-all duration-500" style={{ width: `${totalDemEstimated ? Math.min((totalDemReturnedTotal/totalDemEstimated)*100, 100) : 0}%` }}></div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center justify-end">
                              {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                            </div>
                          </div>

                          {/* Expanded Content: Upload & Materials */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                              
                              {/* Upload Action */}
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 shadow-sm">
                                <div>
                                  <h5 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                    <Upload size={18} className="text-blue-600" /> นำเข้ายอดจากระบบ (ZPSR018) สำหรับงานนี้
                                  </h5>
                                  <p className="text-xs text-blue-600/80 mt-1">
                                    ใช้อัปเดตข้อมูล &quot;ยอดเบิกจริง&quot; และ &quot;ยอดคืนจริง&quot; (แบบแยกชำรุด) ในระบบ
                                  </p>
                                </div>
                                <div className="shrink-0 w-full sm:w-auto relative group">
                                  <input 
                                    type="file" 
                                    accept=".pdf"
                                    onChange={(e) => handleUploadForProject(e, p.wbs, tech)}
                                    disabled={isUploadingThis}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                  />
                                  <button 
                                    disabled={isUploadingThis}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 group-hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    {isUploadingThis ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    {isUploadingThis ? "กำลังวิเคราะห์ด้วย AI..." : "เลือกไฟล์ ZPSR018"}
                                  </button>
                                </div>
                              </div>

                              {/* Materials List for this Project */}
                              {projMaterials.length > 0 ? (
                                <div className="space-y-6">
                                  <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border border-slate-200">
                                    <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                      <CheckCircle2 size={16} className="text-emerald-500" /> รายการพัสดุในงานนี้ (ข้อมูลจากการดึงล่าสุด)
                                    </h5>
                                    <button 
                                      onClick={() => clearDataForWbs(p.wbs)}
                                      className="text-xs font-medium text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded border border-red-200 hover:border-red-500 transition-colors"
                                    >
                                      ล้างพัสดุงานนี้ทั้งหมด
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {/* พัสดุเบิกใหม่ */}
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-end pb-2 border-b border-emerald-100">
                                        <div>
                                          <h6 className="font-bold text-emerald-700 flex items-center gap-2 text-sm">
                                            <Package size={16} /> พัสดุเบิกใหม่ 
                                          </h6>
                                          <p className="text-[11px] text-slate-500 mt-1">จัดการสถานะเพื่ออัปเดตการนำไปใช้งานจริง</p>
                                        </div>
                                        {newMats.length > 0 && (
                                          <button 
                                            onClick={() => markAllStatus(p.wbs, "new", "นำไปก่อสร้างแล้ว")}
                                            className="text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 font-medium"
                                          >
                                            ติ๊กสร้างแล้วทั้งหมด
                                          </button>
                                        )}
                                      </div>
                                      
                                      {newMats.map(m => (
                                        <div key={m.id} className={`bg-white p-3 rounded-xl border shadow-sm transition-colors ${m.status === 'นำไปก่อสร้างแล้ว' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
                                          <p className="font-semibold text-slate-800 text-sm line-clamp-2" title={m.material_name}>{m.material_name}</p>
                                          <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                                            
                                            <div className="flex items-center gap-2 text-xs">
                                              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                                ประเมิน: <span className="font-bold">{m.estimated_quantity || m.quantity} {m.unit}</span>
                                              </span>
                                              <span className={`px-2 py-1 rounded border font-medium ${m.actual_quantity > 0 ? (m.actual_quantity >= (m.estimated_quantity || m.quantity) ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200') : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                เบิกคลัง: <span className="font-bold">{m.actual_quantity} {m.unit}</span>
                                              </span>
                                            </div>

                                            <select
                                              value={m.status}
                                              onChange={(e) => updateStatus(m.id, e.target.value)}
                                              className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg outline-none border cursor-pointer transition-colors ${
                                                m.status === "นำไปก่อสร้างแล้ว" 
                                                  ? "bg-emerald-600 text-white border-emerald-700 shadow-sm" 
                                                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                              }`}
                                            >
                                              <option value="ยังไม่ได้ก่อสร้าง">สถานะ: ยังไม่ได้ก่อสร้าง</option>
                                              <option value="นำไปก่อสร้างแล้ว">สถานะ: นำไปก่อสร้างแล้ว</option>
                                            </select>
                                          </div>
                                        </div>
                                      ))}
                                      {newMats.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                          <CircleDashed size={24} className="mb-2 opacity-50" />
                                          <p className="text-xs">ไม่มีรายการพัสดุเบิกใหม่</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* พัสดุรื้อถอน */}
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-end pb-2 border-b border-amber-100">
                                        <div>
                                          <h6 className="font-bold text-amber-700 flex items-center gap-2 text-sm">
                                            <Wrench size={16} /> พัสดุรื้อถอน 
                                          </h6>
                                          <p className="text-[11px] text-slate-500 mt-1">แยกรายการส่งคืนแบบ พัสดุดี และ พัสดุชำรุด</p>
                                        </div>
                                        {demMats.length > 0 && (
                                          <button 
                                            onClick={() => markAllStatus(p.wbs, "demolish", "ส่งคืนแล้ว")}
                                            className="text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 font-medium"
                                          >
                                            ติ๊กส่งคืนแล้วทั้งหมด
                                          </button>
                                        )}
                                      </div>

                                      {demMats.map(m => {
                                        const isReturned = (m.actual_quantity + (m.damaged_quantity || 0)) > 0;
                                        const isFullyReturned = (m.actual_quantity + (m.damaged_quantity || 0)) >= (m.estimated_quantity || m.quantity);

                                        return (
                                        <div key={m.id} className={`bg-white p-3 rounded-xl border shadow-sm transition-colors ${m.status === 'ส่งคืนแล้ว' ? 'border-emerald-200 bg-emerald-50/30' : m.status === 'รื้อถอนแล้วยังไม่ส่งคืน' ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'}`}>
                                          <p className="font-semibold text-slate-800 text-sm line-clamp-2" title={m.material_name}>{m.material_name}</p>
                                          
                                          <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                                ประเมินรื้อ: <span className="font-bold">{m.estimated_quantity || m.quantity}</span> {m.unit}
                                              </span>
                                              <div className={`flex items-center divide-x px-2 py-1 rounded border font-medium ${isReturned ? (isFullyReturned ? 'bg-emerald-100 text-emerald-800 border-emerald-200 divide-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-200 divide-amber-300') : 'bg-red-50 text-red-600 border-red-100 divide-red-200'}`}>
                                                <span className="pr-2">คืนดี: <span className="font-bold">{m.actual_quantity}</span></span>
                                                <span className="pl-2">ชำรุด: <span className="font-bold">{m.damaged_quantity || 0}</span></span>
                                              </div>
                                            </div>

                                            <select
                                              value={m.status}
                                              onChange={(e) => updateStatus(m.id, e.target.value)}
                                              className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg outline-none border cursor-pointer transition-colors ${
                                                m.status === "ส่งคืนแล้ว" 
                                                  ? "bg-emerald-600 text-white border-emerald-700 shadow-sm" 
                                                  : m.status === "รื้อถอนแล้วยังไม่ส่งคืน"
                                                    ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                                                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                              }`}
                                            >
                                              <option value="ยังไม่ได้รื้อถอนและยังไม่ส่งคืน">สถานะ: ยังไม่ได้รื้อถอน</option>
                                              <option value="รื้อถอนแล้วยังไม่ส่งคืน">สถานะ: รื้อแล้วรอส่งคืน</option>
                                              <option value="ส่งคืนแล้ว">สถานะ: ส่งคืนแล้ว</option>
                                            </select>
                                          </div>
                                        </div>
                                      )})}
                                      {demMats.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                          <CircleDashed size={24} className="mb-2 opacity-50" />
                                          <p className="text-xs">ไม่มีรายการพัสดุรื้อถอน</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                  งานนี้ยังไม่ได้นำเข้าพัสดุ (อัปโหลดไฟล์ ZPSR018 ในกล่องด้านบนเพื่อดึงรายการ)
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Orphan WBS */}
                    {orphanWbs.map(wbs => {
                      const projMaterials = materials.filter(m => m.wbs === wbs);
                      const isExpanded = expandedProjects[wbs] || false;

                      return (
                        <div key={wbs} className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden opacity-75">
                          <div 
                            onClick={() => toggleProject(wbs)}
                            className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <AlertCircle className="text-slate-400" size={20} />
                              <div>
                                <h4 className="font-bold text-slate-600 text-sm">{wbs}</h4>
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium mt-1 inline-block">
                                  ไม่มีในฐานข้อมูลงานปัจจุบัน (แต่อาจมีพัสดุค้างอยู่ {projMaterials.length} รายการ)
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center justify-end">
                              {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t border-slate-200 p-4 bg-slate-100/50 space-y-6">
                              <div className="flex justify-between items-center">
                                <h5 className="font-bold text-slate-600 text-sm">รายการพัสดุที่ค้างอยู่</h5>
                                <button 
                                  onClick={() => clearDataForWbs(wbs)}
                                  className="text-xs text-red-500 hover:text-red-700 underline"
                                >
                                  ล้างพัสดุงานนี้
                                </button>
                              </div>
                              <div className="space-y-2">
                                {projMaterials.map(m => (
                                  <div key={m.id} className="bg-white p-2 px-3 rounded flex justify-between items-center border border-slate-200">
                                    <span className="text-sm text-slate-700">{m.material_name} </span>
                                    <select
                                      value={m.status}
                                      onChange={(e) => updateStatus(m.id, e.target.value)}
                                      className="text-xs border rounded p-1"
                                    >
                                      <option value="ยังไม่ได้ก่อสร้าง">ยังไม่ได้ก่อสร้าง</option>
                                      <option value="นำไปก่อสร้างแล้ว">นำไปก่อสร้างแล้ว</option>
                                      <option value="ยังไม่ได้รื้อถอนและยังไม่ส่งคืน">ยังไม่ได้รื้อถอน</option>
                                      <option value="รื้อถอนแล้วยังไม่ส่งคืน">รื้อแล้วรอส่งคืน</option>
                                      <option value="ส่งคืนแล้ว">ส่งคืนแล้ว</option>
                                    </select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  );
}
