"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";
import dynamic from 'next/dynamic';
import { Camera, MapPin, Save, AlertTriangle, FileText, Wrench, Users, ArrowLeft, Image as ImageIcon, Trash2, Edit3, Check, Plus, ChevronRight, ChevronLeft, X, Maximize2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import exifr from 'exifr';

const MapComponent = dynamic(() => import("../MapComponent"), { ssr: false });

interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
}

interface Point {
  id: string;
  lat: number;
  lng: number;
  image_url?: string;
  image_base64?: string; // For simple demo without bucket
  pole_name?: string;
  damage_details: string;
  pole_details?: string;
  team_required?: number;
  materials?: MaterialItem[];
  preview_url?: string;
  is_fixed?: boolean;
}

interface EmergencyJob {
  id: string;
  title: string;
  points: Point[];
  created_at: string;
}

export default function EmergencyProjectDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<EmergencyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
  const [showMaterialSummary, setShowMaterialSummary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aggregatedMaterials = React.useMemo(() => {
    if (!job) return [];
    const map = new Map<string, number>();
    job.points.forEach(pt => {
      pt.materials?.forEach(m => {
        const current = map.get(m.name) || 0;
        map.set(m.name, current + m.quantity);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [job]);

  useEffect(() => {
    fetchJob();
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from("emergency_jobs")
        .select("*")
        .eq("id", params.id)
        .single();
        
      if (error) throw error;
      setJob(data);
      if (data?.points?.length > 0) {
        setActivePointId(data.points[0].id);
      }
    } catch (e: any) {
      console.error(e);
      alert("ไม่พบข้อมูลโปรเจกต์");
    } finally {
      setLoading(false);
    }
  };

  const addNewPoint = (lat: number, lng: number) => {
    if (!job) return;
    const pointId = Math.random().toString(36).substring(2, 9);
    const newPt: Point = {
      id: pointId,
      lat,
      lng,
      pole_name: "",
      damage_details: "",
      materials: [],
    };
    setJob({ ...job, points: [...job.points, newPt] });
    setActivePointId(pointId);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!job) return;
    if (activePointId) {
      const activePt = job.points.find(p => p.id === activePointId);
      if (activePt?.is_fixed) {
        addNewPoint(lat, lng);
      } else {
        updateActivePoint({ lat, lng });
      }
    } else {
      addNewPoint(lat, lng);
    }
  };

  const updateActivePoint = (updates: Partial<Point>) => {
    if (!job || !activePointId) return;
    setJob({
      ...job,
      points: job.points.map(pt => 
        pt.id === activePointId ? { ...pt, ...updates } : pt
      )
    });
  };

  const removePoint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!job) return;
    
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบจุดนี้?")) {
      const updatedPoints = job.points.filter(pt => pt.id !== id);
      setJob({ ...job, points: updatedPoints });
      if (activePointId === id) {
        setActivePointId(updatedPoints.length > 0 ? updatedPoints[0].id : null);
      }
    }
  };

  const addMaterial = () => {
    const pt = job?.points.find(p => p.id === activePointId);
    if (!pt) return;
    const newMat = { id: Math.random().toString(36).substring(2, 9), name: "", quantity: 1 };
    updateActivePoint({ materials: [...(pt.materials || []), newMat] });
  };

  const updateMaterial = (matId: string, field: 'name' | 'quantity', value: any) => {
    const pt = job?.points.find(p => p.id === activePointId);
    if (!pt || !pt.materials) return;
    updateActivePoint({
      materials: pt.materials.map(m => m.id === matId ? { ...m, [field]: value } : m)
    });
  };

  const removeMaterial = (matId: string) => {
    const pt = job?.points.find(p => p.id === activePointId);
    if (!pt || !pt.materials) return;
    updateActivePoint({
      materials: pt.materials.filter(m => m.id !== matId)
    });
  };

  // Helper to compress image to base64
  const compressImage = async (file: File): Promise<string> => {
    let processFile = file;
    if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic' || file.type === 'image/heif') {
      try {
        const heic2any = (await import('heic2any')).default;
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
        processFile = new File([Array.isArray(converted) ? converted[0] : converted], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      } catch (err) {
        console.error("HEIC conversion failed", err);
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(processFile);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = () => {
          console.warn("Could not load image into canvas, might be unsupported format (like HEIC)");
          resolve(""); // Resolve empty string instead of rejecting
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activePointId) return;
    const file = e.target.files[0];
    
    try {
      const base64 = await compressImage(file);
      updateActivePoint({ image_base64: base64, preview_url: URL.createObjectURL(file) });
      
      // Try to read GPS if the point hasn't been placed correctly yet
      const exifData = await exifr.gps(file);
      if (exifData && exifData.latitude && exifData.longitude) {
        if (confirm(`พบพิกัดในรูปภาพ: ${exifData.latitude.toFixed(5)}, ${exifData.longitude.toFixed(5)}\nคุณต้องการอัปเดตตำแหน่งหมุดนี้ตามรูปภาพหรือไม่?`)) {
          updateActivePoint({ lat: exifData.latitude, lng: exifData.longitude, is_fixed: true });
        }
      }
    } catch (error) {
      console.error("Error compressing image or reading EXIF:", error);
    }
  };

  const handleSave = async () => {
    if (!job) return;
    setIsSubmitting(true);
    try {
      // Remove temporary preview URLs before saving
      const pointsToSave = job.points.map(pt => {
        const { preview_url, ...rest } = pt;
        return rest;
      });

      const { error } = await supabase
        .from("emergency_jobs")
        .update({ title: job.title, points: pointsToSave })
        .eq("id", job.id);
        
      if (error) throw error;
      alert("บันทึกการเปลี่ยนแปลงสำเร็จ!");
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="text-xl text-slate-500 animate-pulse">กำลังโหลดข้อมูลโปรเจกต์...</div></div>;
  if (!job) return <div className="p-8 text-center">ไม่พบข้อมูลโปรเจกต์</div>;

  const activePoint = job.points.find(pt => pt.id === activePointId);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex justify-between items-center z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/emergency-plan" className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <input 
                type="text" 
                value={job.title}
                onChange={(e) => setJob({...job, title: e.target.value})}
                className="bg-transparent border-b border-dashed border-slate-300 hover:border-blue-500 focus:border-blue-500 focus:outline-none px-1"
              />
              <Edit3 size={16} className="text-slate-400" />
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={12} className="text-emerald-500"/> รวม {job.points.length} จุด 
              </span>
              <span className="text-slate-300">|</span> 
              <button 
                onClick={() => setShowMaterialSummary(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded flex items-center gap-1 transition-colors font-medium"
              >
                <Wrench size={12} /> สรุปรายการอุปกรณ์ ({aggregatedMaterials.length} รายการ)
              </button>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
        >
          {isSubmitting ? "กำลังบันทึก..." : <><Save size={18} /> บันทึกโปรเจกต์</>}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Map Area */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-full lg:w-2/3' : 'w-full'} h-1/2 lg:h-full bg-slate-200 relative z-0`}>
          <MapComponent 
            points={job.points} 
            activePointId={activePointId}
            onMapClick={handleMapClick}
            onMarkerClick={setActivePointId}
          />
          <div className="absolute top-4 left-4 z-[400]">
            <button 
              onClick={() => addNewPoint(13.7563, 100.5018)} // Fallback if they just want to add
              className="bg-white/90 backdrop-blur-sm text-slate-700 hover:text-blue-600 font-medium px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2"
            >
              <MapPin size={18} /> เพิ่มจุดใหม่ตรงนี้
            </button>
          </div>
          
          {/* Sidebar Toggle Button (Desktop Only) */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex absolute top-1/2 right-0 -translate-y-1/2 bg-white rounded-l-xl p-2 shadow-md border border-r-0 border-slate-200 z-[400] text-slate-500 hover:text-slate-800 transition-colors"
            title={isSidebarOpen ? "ซ่อนแถบด้านข้าง" : "แสดงแถบด้านข้าง"}
          >
            {isSidebarOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>

        {/* Right Sidebar */}
        <div className={`w-full lg:w-1/3 h-1/2 lg:h-full bg-white flex flex-col border-l border-slate-200 shadow-xl z-10 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}`}>
          
          {/* Active Point Editor */}
          {activePoint ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                  แก้ไขจุดที่ {job.points.findIndex(p => p.id === activePoint.id) + 1}
                </h2>
                <button onClick={(e) => removePoint(activePoint.id, e)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm flex items-center gap-1 transition-colors">
                  <Trash2 size={16} /> ลบจุดนี้
                </button>
              </div>

              {/* Image Section */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">รูปถ่ายหน้างาน</label>
                {activePoint.preview_url || activePoint.image_base64 ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-black">
                    <img 
                      src={activePoint.preview_url || activePoint.image_base64} 
                      alt="site" 
                      className="w-full max-h-64 object-contain cursor-pointer transition-transform hover:scale-[1.02]" 
                      onClick={() => setFullscreenImageUrl(activePoint.preview_url || activePoint.image_base64 || null)}
                      title="คลิกเพื่อขยายเต็มจอ"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none flex items-center justify-center">
                      <Maximize2 size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                    <label className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm p-2 rounded-full text-white cursor-pointer transition-colors border border-white/20" title="เปลี่ยนรูปภาพ">
                      <Camera size={18} />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 cursor-pointer transition-colors">
                    <Camera size={32} className="mb-2 text-slate-400" />
                    <span className="font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
                    <span className="text-xs mt-1">ระบบจะช่วยอ่านพิกัดให้อัตโนมัติ</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">พิกัดแผนที่ (ละติจูด, ลองจิจูด)</label>
                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono flex justify-between items-center">
                    <span>{activePoint.lat.toFixed(6)}, {activePoint.lng.toFixed(6)}</span>
                    <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">อัปเดตล่าสุด</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อเสา / ประเภทหัวเสา (เช่น SP, DDE)</label>
                  <input 
                    type="text" 
                    value={activePoint.pole_name || ""} 
                    onChange={e => updateActivePoint({ pole_name: e.target.value })} 
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm font-medium text-blue-800 transition-shadow" 
                    placeholder="เช่น SP, DDE, SA..." 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">รายละเอียดสภาพชำรุด</label>
                  <textarea 
                    value={activePoint.damage_details} 
                    onChange={e => updateActivePoint({ damage_details: e.target.value })} 
                    rows={3} 
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none text-sm transition-shadow" 
                    placeholder="เช่น เสาหักครึ่งท่อน สายขาดรุ่ย..." 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">รายการวัสดุอุปกรณ์ที่ต้องใช้</label>
                  <div className="space-y-2 mb-3">
                    {activePoint.materials && activePoint.materials.map((mat) => (
                      <div key={mat.id} className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={mat.name} 
                          onChange={e => updateMaterial(mat.id, 'name', e.target.value)} 
                          placeholder="ชื่ออุปกรณ์ (เช่น เสา 12ม)" 
                          className="flex-1 p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        />
                        <input 
                          type="number" 
                          value={mat.quantity || ""} 
                          onChange={e => updateMaterial(mat.id, 'quantity', parseInt(e.target.value) || 0)} 
                          placeholder="จำนวน" 
                          min={1}
                          className="w-20 p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-center font-medium text-blue-700"
                        />
                        <button 
                          onClick={() => removeMaterial(mat.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบรายการ"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    {(!activePoint.materials || activePoint.materials.length === 0) && (
                      <div className="text-sm text-slate-400 text-center py-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        ยังไม่มีรายการอุปกรณ์
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={addMaterial}
                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                  >
                    <Plus size={16} /> เพิ่มอุปกรณ์
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
              <MapPin className="mb-4 text-slate-300" size={64} />
              <h3 className="text-lg font-bold text-slate-600 mb-2">เลือกจุดบนแผนที่</h3>
              <p className="text-sm">คลิกที่หมุดบนแผนที่ หรือคลิกพื้นที่ว่างเพื่อสร้างหมุดใหม่ จากนั้นจึงใส่รายละเอียดและรูปถ่าย</p>
            </div>
          )}

          {/* Points List Slider */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 shrink-0 h-40">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">จุดทั้งหมด ({job.points.length})</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
              {job.points.map((pt, i) => (
                <div 
                  key={pt.id}
                  onClick={() => setActivePointId(pt.id)}
                  className={`snap-start shrink-0 w-24 h-24 rounded-xl border-2 cursor-pointer overflow-hidden transition-all relative group
                    ${activePointId === pt.id ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'}`}
                >
                  {pt.preview_url || pt.image_base64 ? (
                    <img src={pt.preview_url || pt.image_base64} alt={`Point ${i+1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon size={20} className="mb-1" />
                    </div>
                  )}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-1 left-2 text-white font-bold text-xs">
                    จุดที่ {i + 1}
                  </div>
                  {activePointId === pt.id && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                      <Check size={12} />
                    </div>
                  )}
                </div>
              ))}
              <div 
                onClick={() => addNewPoint(13.7563, 100.5018)}
                className="snap-start shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center cursor-pointer text-slate-500 transition-colors"
              >
                <Plus size={24} className="mb-1" />
                <span className="text-[10px] font-bold">เพิ่มจุด</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImageUrl && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
          <button 
            onClick={() => setFullscreenImageUrl(null)} 
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-[1010]"
          >
            <X size={32} />
          </button>
          <img 
            src={fullscreenImageUrl} 
            alt="Fullscreen site image" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10" 
            onClick={() => setFullscreenImageUrl(null)}
          />
        </div>
      )}

      {/* Material Summary Modal */}
      {showMaterialSummary && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Wrench size={20} className="text-indigo-500" /> สรุปรายการอุปกรณ์รวมทั้งโครงการ
              </h3>
              <button onClick={() => setShowMaterialSummary(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {aggregatedMaterials.length > 0 ? (
                <div className="space-y-2">
                  {aggregatedMaterials.map(([name, qty], idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-700 font-medium">{name || "ไม่ระบุชื่อ"}</span>
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">{qty}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Wrench size={32} className="mx-auto mb-2 opacity-50" />
                  ยังไม่มีการระบุอุปกรณ์ในโครงการนี้
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setShowMaterialSummary(false)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
