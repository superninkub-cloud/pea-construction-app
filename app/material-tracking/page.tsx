"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Package, Wrench, AlertCircle, User, Loader2, Briefcase, ChevronDown, ChevronUp, CheckCircle2, CircleDashed, Info, Camera } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";
import { savePhoto, loadAllPhotos } from "../../lib/photoIdb";

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
  status: string; // Legacy

  // New tracking fields
  track_new_done?: number; // นำไปก่อสร้างแล้ว
  track_new_pending?: number; // ยังไม่ได้ก่อสร้าง
  track_dem_pending?: number; // ยังไม่รื้อ
  track_dem_done_not_returned?: number; // รื้อแล้วยังไม่คืน
  track_dem_returned_good?: number; // คืนดี
  track_dem_returned_damaged?: number; // คืนชำรุด
}

export default function MaterialTracking() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [technicians, setTechnicians] = useState<string[]>([]);
  
  const [uploadingWbs, setUploadingWbs] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("ทั้งหมด");
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [showCampInventory, setShowCampInventory] = useState<Record<string, boolean>>({});

  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [activePhotoKey, setActivePhotoKey] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBaseData();
    loadAllPhotos().then(setPhotos).catch(console.error);
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

  const toggleCampInventory = (tech: string) => {
    setShowCampInventory(prev => ({
      ...prev,
      [tech]: !prev[tech]
    }));
  };

  const handleCaptureClick = (key: string) => {
    setActivePhotoKey(key);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const processPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoKey) return;
    setIsCapturing(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      }).catch(() => null);

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scale = Math.min(MAX_WIDTH / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Stamp text
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
          ctx.fillStyle = 'white';
          ctx.font = '16px sans-serif';
          const dateStr = new Date().toLocaleString('th-TH');
          ctx.fillText(`เวลา: ${dateStr}`, 10, canvas.height - 40);
          if (pos) {
            ctx.fillText(`GPS: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`, 10, canvas.height - 15);
          } else {
            ctx.fillText(`GPS: ไม่สามารถระบุตำแหน่งได้ (ไม่มีสิทธิ์)`, 10, canvas.height - 15);
          }

          const base64 = canvas.toDataURL('image/jpeg', 0.6);
          savePhoto(activePhotoKey, base64).then(() => {
            setPhotos(prev => ({ ...prev, [activePhotoKey]: base64 }));
          });
          setIsCapturing(false);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch(err) {
      console.error(err);
      setIsCapturing(false);
    }
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
            
            let track_new_pending = 0;
            let track_new_done = 0;
            let track_dem_pending = 0;
            let track_dem_done_not_returned = 0;
            let track_dem_returned_good = 0;
            let track_dem_returned_damaged = 0;

            if (m.part === "new") {
              initialStatus = "ยังไม่ได้ก่อสร้าง"; 
              track_new_pending = estimated;
            } else {
              track_dem_returned_good = actual;
              track_dem_returned_damaged = damaged;
              track_dem_done_not_returned = Math.max(0, estimated - actual - damaged);
              track_dem_pending = 0;

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
              status: initialStatus,
              track_new_done,
              track_new_pending,
              track_dem_pending,
              track_dem_done_not_returned,
              track_dem_returned_good,
              track_dem_returned_damaged
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

  const updateMaterialTracking = (id: string, updates: Partial<Material>) => {
    const updated = materials.map(m => m.id === id ? { ...m, ...updates } : m);
    saveToStorage(updated);
  };

  const markAllStatus = (wbs: string, part: "new" | "demolish", newStatus: string) => {
    if (confirm(part === "new" ? `ต้องการติ๊ก "นำไปก่อสร้างแล้ว" ทั้งหมดใช่หรือไม่?` : `ต้องการติ๊ก "รื้อถอนและส่งคืนทั้งหมด" ใช่หรือไม่?`)) {
      const updated = materials.map(m => {
        if (m.wbs === wbs && m.part === part) {
          if (part === "new") {
            return { ...m, track_new_pending: 0, track_new_done: m.estimated_quantity || m.quantity };
          } else {
            return { ...m, track_dem_pending: 0, track_dem_done_not_returned: 0, track_dem_returned_good: m.estimated_quantity || m.quantity, track_dem_returned_damaged: 0 };
          }
        }
        return m;
      });
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

            // คำนวณคลังแคมป์ (Camp Inventory) สำหรับช่างคนนี้
            const inventoryMap = new Map<string, { code: string, name: string, unit: string, newPending: number, demWaiting: number }>();
            techMaterials.forEach(m => {
              const key = `${m.material_code || 'no-code'}_${m.material_name}`;
              if (!inventoryMap.has(key)) {
                inventoryMap.set(key, { code: m.material_code || '', name: m.material_name, unit: m.unit, newPending: 0, demWaiting: 0 });
              }
              const stock = inventoryMap.get(key)!;
              
              if (m.part === 'new') {
                const pending = m.track_new_pending ?? m.actual_quantity;
                stock.newPending += pending;
              } else if (m.part === 'demolish') {
                const returnedGood = m.actual_quantity || 0;
                const returnedDamaged = m.damaged_quantity || 0;
                const totalReturned = returnedGood + returnedDamaged;
                const estimated = m.estimated_quantity || m.quantity || 0;
                const totalNotReturned = Math.max(0, estimated - totalReturned);

                const done_not_ret = m.track_dem_done_not_returned ?? totalNotReturned;
                const waitingToReturn = Math.min(done_not_ret, totalNotReturned);
                stock.demWaiting += waitingToReturn;
              }
            });
            const campInventory = Array.from(inventoryMap.values()).filter(item => item.newPending > 0 || item.demWaiting > 0);
            const isCampExpanded = showCampInventory[tech] || false;

            return (
              <div key={tech} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 text-white px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <User size={20} className="text-blue-400" />
                      {tech}
                    </h3>
                    <div className="hidden md:flex flex-wrap gap-2">
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
                  
                  <button 
                    onClick={() => toggleCampInventory(tech)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${isCampExpanded ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-md' : 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600 shadow-sm'}`}
                  >
                    ⛺ คลังประจำแคมป์ {isCampExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Camp Inventory Panel */}
                {isCampExpanded && (
                  <div className="p-4 md:p-6 bg-slate-100 border-b border-slate-200 shadow-inner">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                      <Package size={18} /> สต๊อกพัสดุหน้าแคมป์ (Camp Inventory)
                    </h4>
                    {campInventory.length > 0 ? (
                      <div className="space-y-4">
                        {/* Camp Photos Section */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Camera size={16} className="text-blue-500" /> ภาพถ่ายแคมป์และที่เก็บวัสดุ
                          </h5>
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {[1, 2, 3].map((slot) => {
                              const photoKey = `camp_photo_${tech}_${slot}`;
                              const currentPhoto = photos[photoKey];
                              return (
                                <div key={slot} className="shrink-0 w-32 h-32 relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleCaptureClick(photoKey)}>
                                  {currentPhoto ? (
                                    <>
                                      <img src={currentPhoto} alt={`Camp ${slot}`} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-bold flex flex-col items-center gap-1">
                                          <Camera size={16} /> ถ่ายใหม่
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center text-slate-400 gap-2">
                                      {isCapturing && activePhotoKey === photoKey ? <Loader2 size={24} className="animate-spin text-blue-500" /> : <Camera size={24} />}
                                      <span className="text-xs font-medium px-2 text-center">
                                        {isCapturing && activePhotoKey === photoKey ? 'ประมวลผล...' : `ถ่ายรูปที่ ${slot}`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Inventory List (Summarized) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                          <table className="w-full text-sm text-left text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-700">
                              <tr>
                                <th className="px-4 py-3">รายการพัสดุ</th>
                                <th className="px-4 py-3 text-center w-24">รอติดตั้ง</th>
                                <th className="px-4 py-3 text-center w-24">รอคืน</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {campInventory.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3">
                                    <div className="font-semibold text-slate-800 line-clamp-2">{item.name}</div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {item.newPending > 0 ? <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{item.newPending} {item.unit}</span> : <span className="text-slate-300">-</span>}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {item.demWaiting > 0 ? <span className="font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{item.demWaiting} {item.unit}</span> : <span className="text-slate-300">-</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
                        ไม่มีพัสดุค้างอยู่ในสต๊อกแคมป์นี้
                      </div>
                    )}
                  </div>
                )}

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

                      // จำนวนรายการเบิกใหม่
                      const totalNewItems = newMats.length;
                      const drawnNewItems = newMats.filter(m => (m.actual_quantity || 0) >= (m.estimated_quantity || m.quantity || 1)).length;
                      
                      // จำนวนรายการรื้อถอน (ไม่รวมรหัส 1-50...)
                      const validDemMats = demMats.filter(m => !m.material_code.startsWith("1-50"));
                      const totalDemItems = validDemMats.length;
                      const returnedDemItems = validDemMats.filter(m => {
                        const returned = (m.actual_quantity || 0) + (m.damaged_quantity || 0);
                        const estimated = m.estimated_quantity || m.quantity || 1;
                        return returned >= estimated;
                      }).length;

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
                                    {/* New Materials Item Summary */}
                                    <div>
                                      <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                                          <Package size={12}/> พัสดุเบิกใหม่ ({totalNewItems} รายการ)
                                        </span>
                                        <span className="text-slate-500 font-medium">
                                          เบิกครบ <span className="text-emerald-600">{drawnNewItems}</span> / ทั้งหมด <span className="text-slate-700">{totalNewItems}</span> รายการ
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-200 rounded-full h-2 flex overflow-hidden">
                                        <div className="bg-emerald-500 h-2 transition-all duration-500" style={{ width: `${totalNewItems ? Math.min((drawnNewItems/totalNewItems)*100, 100) : 0}%` }}></div>
                                      </div>
                                    </div>

                                    {/* Demolish Materials Item Summary */}
                                    <div>
                                      <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-bold text-amber-700 flex items-center gap-1">
                                          <Wrench size={12}/> พัสดุรื้อถอน ({totalDemItems} รายการหลัก)
                                        </span>
                                        <span className="text-slate-500 font-medium">
                                          ส่งคืนครบ <span className="text-emerald-600">{returnedDemItems}</span> / ทั้งหมด <span className="text-slate-700">{totalDemItems}</span> รายการ
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-200 rounded-full h-2 flex overflow-hidden">
                                        <div className="bg-emerald-500 h-2 transition-all duration-500" style={{ width: `${totalDemItems ? Math.min((returnedDemItems/totalDemItems)*100, 100) : 0}%` }}></div>
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
                                      
                                      {newMats.map(m => {
                                        const actual = m.actual_quantity || 0;
                                        const estimated = m.estimated_quantity || m.quantity || 0;
                                        const shortage = Math.max(0, estimated - actual);
                                        
                                        // Pending should cap at actual since we can only install what we have
                                        const pending = Math.min(m.track_new_pending ?? actual, actual);
                                        const done = Math.min(m.track_new_done ?? 0, actual);
                                        const isAllDone = done >= actual && actual > 0 && shortage === 0;

                                        return (
                                        <div key={m.id} className={`bg-white p-3 rounded-xl border shadow-sm transition-colors ${isAllDone ? 'border-emerald-200 bg-emerald-50/30' : shortage > 0 ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'}`}>
                                          <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-slate-800 text-sm line-clamp-2" title={m.material_name}>{m.material_name}</p>
                                          </div>
                                          <div className="mt-3 flex flex-col gap-3">
                                            
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                                ประเมิน: <span className="font-bold">{estimated} {m.unit}</span>
                                              </span>
                                              <span className={`px-2 py-1 rounded border font-medium ${actual > 0 ? (actual >= estimated ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200') : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                เบิกคลัง: <span className="font-bold">{actual} {m.unit}</span>
                                              </span>
                                              {shortage > 0 && (
                                                <span className="px-2 py-1 rounded border font-bold bg-rose-100 text-rose-700 border-rose-200 animate-pulse">
                                                  ⚠️ ขาดคลัง/รอเบิกเพิ่ม: {shortage} {m.unit}
                                                </span>
                                              )}
                                            </div>

                                            {actual > 0 && (
                                              <div className="flex flex-wrap gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 items-center mt-1">
                                                <span className="font-medium text-slate-600 w-full sm:w-auto">แบ่งยอดเบิกแล้ว ({actual} {m.unit}):</span>
                                                <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-1 rounded-md">
                                                  <span className="text-slate-500 whitespace-nowrap">ยังไม่ก่อสร้าง</span>
                                                  <input type="number" min="0" max={actual} value={pending} onChange={(e) => updateMaterialTracking(m.id, { track_new_pending: Number(e.target.value) })} className="w-12 text-center outline-none bg-slate-100 focus:bg-white focus:ring-1 ring-blue-400 rounded text-slate-800 font-bold" />
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-white border border-emerald-300 px-2 py-1 rounded-md">
                                                  <span className="text-emerald-700 whitespace-nowrap">ก่อสร้างแล้ว</span>
                                                  <input type="number" min="0" max={actual} value={done} onChange={(e) => updateMaterialTracking(m.id, { track_new_done: Number(e.target.value) })} className="w-12 text-center outline-none bg-emerald-50 focus:bg-white focus:ring-1 ring-emerald-400 rounded text-emerald-800 font-bold" />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )})}
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
                                        const returnedGood = m.actual_quantity || 0;
                                        const returnedDamaged = m.damaged_quantity || 0;
                                        const totalReturned = returnedGood + returnedDamaged;
                                        const estimated = m.estimated_quantity || m.quantity || 0;
                                        const totalNotReturned = Math.max(0, estimated - totalReturned);
                                        
                                        const pending = Math.min(m.track_dem_pending ?? 0, totalNotReturned);
                                        const done_not_ret = Math.min(m.track_dem_done_not_returned ?? totalNotReturned, totalNotReturned);
                                        const isAllDone = totalReturned >= estimated && estimated > 0;

                                        return (
                                        <div key={m.id} className={`bg-white p-3 rounded-xl border shadow-sm transition-colors ${isAllDone ? 'border-emerald-200 bg-emerald-50/30' : done_not_ret > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'}`}>
                                          <p className="font-semibold text-slate-800 text-sm line-clamp-2" title={m.material_name}>{m.material_name}</p>
                                          
                                          <div className="mt-3 flex flex-col gap-3">
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                                ประเมินรื้อ: <span className="font-bold">{estimated}</span> {m.unit}
                                              </span>
                                              
                                              <div className={`flex items-center px-2 py-1 rounded border font-medium ${totalNotReturned > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                ยังไม่ส่งคืน: <span className="font-bold ml-1">{totalNotReturned}</span>
                                              </div>

                                              <div className={`flex items-center gap-2 px-2 py-1 rounded border font-medium ${totalReturned > 0 ? (totalReturned >= estimated ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200') : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                <div className="flex items-center gap-1.5">
                                                  <span className="whitespace-nowrap">คืนดี:</span>
                                                  <input type="number" min="0" value={returnedGood} onChange={(e) => updateMaterialTracking(m.id, { actual_quantity: Number(e.target.value) })} className="w-12 text-center outline-none bg-white focus:ring-1 ring-emerald-400 rounded text-slate-800 font-bold border border-slate-300" />
                                                </div>
                                                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300/50">
                                                  <span className="whitespace-nowrap">คืนชำรุด:</span>
                                                  <input type="number" min="0" value={returnedDamaged} onChange={(e) => updateMaterialTracking(m.id, { damaged_quantity: Number(e.target.value) })} className="w-12 text-center outline-none bg-white focus:ring-1 ring-emerald-400 rounded text-slate-800 font-bold border border-slate-300" />
                                                </div>
                                              </div>
                                            </div>

                                            {totalNotReturned > 0 && (
                                              <div className="flex flex-wrap gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 items-center">
                                                <span className="font-medium text-slate-600 w-full sm:w-auto">แบ่งยอดที่ยังไม่ส่งคืน ({totalNotReturned} EA):</span>
                                                <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-1 rounded-md">
                                                  <span className="text-slate-500 whitespace-nowrap">ยังไม่รื้อ</span>
                                                  <input type="number" min="0" value={pending} onChange={(e) => updateMaterialTracking(m.id, { track_dem_pending: Number(e.target.value) })} className="w-12 text-center outline-none bg-slate-100 focus:bg-white focus:ring-1 ring-blue-400 rounded text-slate-800 font-bold" />
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-white border border-amber-300 px-2 py-1 rounded-md">
                                                  <span className="text-amber-700 whitespace-nowrap">รื้อรอคืน</span>
                                                  <input type="number" min="0" value={done_not_ret} onChange={(e) => updateMaterialTracking(m.id, { track_dem_done_not_returned: Number(e.target.value) })} className="w-12 text-center outline-none bg-amber-50 focus:bg-white focus:ring-1 ring-amber-400 rounded text-amber-800 font-bold" />
                                                </div>
                                              </div>
                                            )}
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
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                      {m.part === 'new' ? 'พัสดุเบิกใหม่' : 'พัสดุรื้อถอน'}
                                    </span>
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
      
      {/* Hidden file input for capturing photo */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={processPhoto} 
        className="hidden" 
      />
    </div>
  );
}
