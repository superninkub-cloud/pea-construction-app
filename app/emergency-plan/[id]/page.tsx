"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";
import dynamic from 'next/dynamic';
import { Camera, MapPin, Save, AlertTriangle, FileText, Wrench, Users, ArrowLeft, Image as ImageIcon, Trash2, Edit3, Check, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import exifr from 'exifr';

const MapComponent = dynamic(() => import("../MapComponent"), { ssr: false });

interface Point {
  id: string;
  lat: number;
  lng: number;
  image_url?: string;
  image_base64?: string; // For simple demo without bucket
  damage_details: string;
  pole_details: string;
  team_required: number;
  preview_url?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleMapClick = (lat: number, lng: number) => {
    if (!job) return;
    if (activePointId) {
      updateActivePoint({ lat, lng });
    } else {
      const pointId = Math.random().toString(36).substring(2, 9);
      const newPt: Point = {
        id: pointId,
        lat,
        lng,
        damage_details: "",
        pole_details: "",
        team_required: 1,
      };
      setJob({ ...job, points: [...job.points, newPt] });
      setActivePointId(pointId);
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

  // Helper to compress image to base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
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
          updateActivePoint({ lat: exifData.latitude, lng: exifData.longitude });
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
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <MapPin size={12} className="text-emerald-500"/> รวม {job.points.length} จุด 
              <span className="text-slate-300">|</span> 
              <Users size={12} className="text-indigo-500"/> ใช้กำลังคน {job.points.reduce((sum, pt) => sum + pt.team_required, 0)} ชุดงาน
            </p>
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
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Map Area (Full screen on left) */}
        <div className="w-full lg:w-2/3 h-1/2 lg:h-full bg-slate-200 relative z-0">
          <MapComponent 
            points={job.points} 
            activePointId={activePointId}
            onMapClick={handleMapClick}
            onMarkerClick={setActivePointId}
          />
          <div className="absolute top-4 left-4 z-[400]">
            <button 
              onClick={() => handleMapClick(13.7563, 100.5018)} // Fallback if they just want to add
              className="bg-white/90 backdrop-blur-sm text-slate-700 hover:text-blue-600 font-medium px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2"
            >
              <MapPin size={18} /> เพิ่มจุดใหม่ตรงนี้
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-1/3 h-1/2 lg:h-full bg-white flex flex-col border-l border-slate-200 shadow-xl z-10">
          
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
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={activePoint.preview_url || activePoint.image_base64} alt="site" className="w-full max-h-64 object-contain bg-black" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium cursor-pointer transition-opacity">
                      <Camera size={24} className="mr-2" /> เปลี่ยนรูปภาพ
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1">รายการหัวเสา / วัสดุอุปกรณ์ที่ต้องใช้</label>
                  <textarea 
                    value={activePoint.pole_details} 
                    onChange={e => updateActivePoint({ pole_details: e.target.value })} 
                    rows={4} 
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none text-sm transition-shadow" 
                    placeholder="เช่น ต้องใช้เสา 12ม 1 ต้น, ลูกถ้วย 3 ลูก, แร็ค..." 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">ประเมินจำนวนชุดงาน (ทีม)</label>
                  <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200 w-fit">
                    <button type="button" onClick={() => updateActivePoint({ team_required: Math.max(0, activePoint.team_required - 1) })} className="w-10 h-10 rounded-lg bg-white shadow-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center font-bold text-xl transition-colors">-</button>
                    <div className="w-8 text-center font-bold text-xl text-slate-800">{activePoint.team_required}</div>
                    <button type="button" onClick={() => updateActivePoint({ team_required: activePoint.team_required + 1 })} className="w-10 h-10 rounded-lg bg-white shadow-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center font-bold text-xl transition-colors">+</button>
                  </div>
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
                onClick={() => handleMapClick(13.7563, 100.5018)}
                className="snap-start shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center cursor-pointer text-slate-500 transition-colors"
              >
                <Plus size={24} className="mb-1" />
                <span className="text-[10px] font-bold">เพิ่มจุด</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
