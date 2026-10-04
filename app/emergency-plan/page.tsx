"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import dynamic from 'next/dynamic';
import { Camera, MapPin, Save, Plus, AlertTriangle, FileText, Wrench, Users, Info, Image as ImageIcon, Trash2, Edit3, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Use dynamic import for the map to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

import exifr from 'exifr';

interface Point {
  id: string;
  lat: number;
  lng: number;
  image_url?: string;
  image_base64?: string;
  pole_name?: string;
  damage_details: string;
  pole_details: string;
  team_required: number;
  preview_url?: string; // For local display before upload
}

interface EmergencyJob {
  id: string;
  title: string;
  points: Point[];
  created_at: string;
}

export default function EmergencyPlan() {
  const [jobs, setJobs] = useState<EmergencyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [draftPoints, setDraftPoints] = useState<Point[]>([]);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("emergency_jobs")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error && error.code !== "42P01") throw error;
      
      setJobs(data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
          resolve(""); // Resolve empty string instead of rejecting to continue loop
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploadingImages(true);
    const files = Array.from(e.target.files);
    setUploadProgress({ current: 0, total: files.length });
    
    let newPoints: Point[] = [];
    let noGpsCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: files.length });
      // Yield to main thread so React can re-render progress
      await new Promise(resolve => setTimeout(resolve, 20));

      const objectUrl = URL.createObjectURL(file);
      const pointId = Math.random().toString(36).substring(2, 9);
      
      let lat = 13.7563; // Default BKK
      let lng = 100.5018;

      try {
        const exifData = await exifr.gps(file);
        if (exifData && exifData.latitude && exifData.longitude) {
          lat = exifData.latitude;
          lng = exifData.longitude;
        } else {
          noGpsCount++;
        }
      } catch (error) {
        noGpsCount++;
        console.error("Error reading EXIF:", error);
      }

      let base64 = "";
      try {
        base64 = await compressImage(file);
      } catch (err) {
        console.error("Failed to compress image", err);
      }

      newPoints.push({
        id: pointId,
        lat,
        lng,
        preview_url: objectUrl,
        image_base64: base64,
        pole_name: "",
        damage_details: "",
        pole_details: "",
        team_required: 1,
      });
    }

    if (noGpsCount > 0) {
      alert(`มีรูปภาพจำนวน ${noGpsCount} รูป ที่ไม่พบพิกัด GPS ระบบได้วางจุดไว้ตรงกลางแผนที่ คุณสามารถคลิกเลือกจุดและปักหมุดใหม่บนแผนที่ได้`);
    }

    setDraftPoints(prev => {
      const updated = [...prev, ...newPoints];
      if (!activePointId && updated.length > 0) {
        setActivePointId(updated[0].id);
      }
      return updated;
    });
    
    setIsUploadingImages(false);
    setUploadProgress({ current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (activePointId) {
      setDraftPoints(prev => prev.map(pt => 
        pt.id === activePointId ? { ...pt, lat, lng } : pt
      ));
    } else {
      // Create a new point if none is active and clicked on map
      const pointId = Math.random().toString(36).substring(2, 9);
      const newPt: Point = {
        id: pointId,
        lat,
        lng,
        pole_name: "",
        damage_details: "",
        pole_details: "",
        team_required: 1,
      };
      setDraftPoints(prev => [...prev, newPt]);
      setActivePointId(pointId);
    }
  };

  const updateActivePoint = (updates: Partial<Point>) => {
    if (!activePointId) return;
    setDraftPoints(prev => prev.map(pt => 
      pt.id === activePointId ? { ...pt, ...updates } : pt
    ));
  };

  const removePoint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftPoints(prev => {
      const updated = prev.filter(pt => pt.id !== id);
      if (activePointId === id) {
        setActivePointId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("กรุณาระบุชื่องาน");
    if (draftPoints.length === 0) return alert("กรุณาเพิ่มจุดอย่างน้อย 1 จุด");
    
    setIsSubmitting(true);
    try {
      // We would upload images to Storage here, but for now we'll just save the points (without preview_urls as they are local)
      const pointsToSave = draftPoints.map(pt => {
        const { preview_url, ...rest } = pt;
        return rest;
      });

      const { data, error } = await supabase.from("emergency_jobs").insert([{
        title,
        points: pointsToSave,
      }]);
      
      if (error) throw error;
      
      alert("บันทึกข้อมูลสำเร็จ!");
      setShowModal(false);
      resetForm();
      fetchJobs();
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบโปรเจกต์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    
    try {
      const { error } = await supabase.from("emergency_jobs").delete().eq("id", id);
      if (error) throw error;
      alert("ลบโปรเจกต์สำเร็จ!");
      fetchJobs();
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDraftPoints([]);
    setActivePointId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const activePoint = draftPoints.find(pt => pt.id === activePointId);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={32} />
            วางแผนงานฉุกเฉิน / รถชนเสา
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            อัปโหลดรูปภาพหลายรูปพร้อมกันเพื่อดูปริมาณงานรวม และใส่รายละเอียดแต่ละจุด
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          เพิ่มโปรเจกต์งานฉุกเฉิน
        </button>
      </div>

      {/* List of Jobs */}
      <div className="space-y-8">
        {loading ? (
          <div className="py-12 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <AlertTriangle className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">ยังไม่มีงานฉุกเฉินในระบบ</p>
            <p className="text-sm text-slate-400 mt-1">คลิกที่ปุ่ม &quot;เพิ่มโปรเจกต์งานฉุกเฉิน&quot; เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const pointsCount = job.points?.length || 0;
              const teamsCount = job.points?.reduce((acc: number, pt: any) => acc + (pt.team_required || 1), 0) || 0;
              const createdDate = new Date(job.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

              return (
                <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl text-slate-800 line-clamp-2">{job.title}</h3>
                      <button 
                        onClick={() => deleteJob(job.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-colors shrink-0 ml-2"
                        title="ลบโปรเจกต์"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                      <FileText size={16} />
                      สร้างเมื่อ {createdDate}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                      <div className="bg-blue-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                        <MapPin className="text-blue-600 mb-1" size={20} />
                        <span className="text-2xl font-bold text-blue-700">{pointsCount}</span>
                        <span className="text-xs font-medium text-blue-600 mt-1">จุดเกิดเหตุ</span>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                        <Users className="text-purple-600 mb-1" size={20} />
                        <span className="text-2xl font-bold text-purple-700">{teamsCount}</span>
                        <span className="text-xs font-medium text-purple-600 mt-1">ชุดปฏิบัติงาน</span>
                      </div>
                    </div>

                    <Link 
                      href={`/emergency-plan/${job.id}`}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-medium text-center flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit3 size={18} /> เข้าไปจัดการรายละเอียด
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">สร้างโปรเจกต์งานฉุกเฉิน</h2>
              <button onClick={() => {setShowModal(false); resetForm();}} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Map & List Area (Left) */}
              <div className="w-full md:w-3/5 flex flex-col border-r border-slate-100">
                <div className="h-64 md:h-1/2 bg-slate-100 relative">
                  <MapComponent 
                    points={draftPoints} 
                    activePointId={activePointId}
                    onMapClick={handleMapClick}
                    onMarkerClick={setActivePointId}
                  />
                  <div className="absolute top-4 left-4 z-[400]">
                    <div className="bg-white/95 backdrop-blur text-xs p-3 rounded-xl shadow-lg border border-slate-200">
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5"><Info size={14} className="text-blue-500"/> วิธีใช้งาน:</p>
                      <ul className="mt-1 space-y-1 text-slate-600 ml-5 list-disc">
                        <li>อัปโหลดรูปภาพหลายรูป ระบบจะปักหมุดทุกจุดให้อัตโนมัติ</li>
                        <li>คลิกที่หมุดบนแผนที่ เพื่อสลับไปดูและแก้ไขรายละเอียดจุดนั้น</li>
                        <li>หากพิกัดไม่ตรง ให้เลือกจุดในรายการ แล้วคลิกตำแหน่งใหม่บนแผนที่</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Points List */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin size={18} className="text-rose-500" />
                      รายการจุดเกิดเหตุ ({draftPoints.length})
                    </h3>
                    
                    <div>
                      <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleMultipleImageUpload} className="hidden" id="photo-upload-multi" disabled={isUploadingImages} />
                      <label htmlFor="photo-upload-multi" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${isUploadingImages ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cursor-pointer'}`}>
                        {isUploadingImages ? (
                          <><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> กำลังอัปโหลด...</>
                        ) : (
                          <><Plus size={16} /> อัปโหลดเพิ่ม</>
                        )}
                      </label>
                    </div>
                  </div>

                  {isUploadingImages ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                        <div 
                          className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                          {Math.round((uploadProgress.current / uploadProgress.total) * 100) || 0}%
                        </div>
                      </div>
                      <p className="font-medium text-lg text-slate-700">กำลังประมวลผลรูปภาพ...</p>
                      <p className="text-sm mt-1">
                        กำลังทำรายการ {uploadProgress.current} จาก {uploadProgress.total} รูป
                      </p>
                      <p className="text-xs mt-2 text-slate-400">กรุณารอสักครู่ หากเป็นไฟล์ HEIC จาก iPhone อาจใช้เวลา 1-3 วินาทีต่อรูป</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {draftPoints.map((pt, i) => (
                      <div 
                        key={pt.id} 
                        className={`relative rounded-xl border-2 overflow-hidden transition-all bg-white
                          ${activePointId === pt.id ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'}`}
                      >
                        <div className="h-20 bg-black relative group cursor-pointer" onClick={() => { setActivePointId(pt.id); if(pt.preview_url || pt.image_base64) setFullscreenImageUrl(pt.preview_url || pt.image_base64 || null); }}>
                          {pt.preview_url || pt.image_base64 ? (
                            <img src={pt.preview_url || pt.image_base64} alt="preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                              <ImageIcon size={24} />
                            </div>
                          )}
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded-md font-bold">
                            จุดที่ {i + 1}
                          </div>
                        </div>
                        <div className="p-2 text-xs truncate text-slate-600 cursor-pointer" onClick={() => setActivePointId(pt.id)}>
                          {pt.pole_name ? <span className="font-bold text-blue-700 block mb-0.5">{pt.pole_name}</span> : null}
                          {pt.damage_details || "ยังไม่มีรายละเอียด"}
                        </div>
                        
                        <button 
                          onClick={(e) => removePoint(pt.id, e)}
                          className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-md hover:bg-red-50"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {draftPoints.length === 0 && (
                      <label 
                        htmlFor={isUploadingImages ? "" : "photo-upload-multi"}
                        className={`col-span-full py-12 text-center text-sm border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${
                          isUploadingImages 
                            ? 'border-slate-200 text-slate-300 cursor-not-allowed' 
                            : 'border-slate-300 text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-blue-300 hover:text-blue-500'
                        }`}
                      >
                        <ImageIcon size={32} className="opacity-50" />
                        <span>คลิกเพื่ออัปโหลดรูปภาพเพื่อเพิ่มจุดบนแผนที่</span>
                      </label>
                    )}
                  </div>
                  )}
                </div>
              </div>

              {/* Edit Area (Right) */}
              <div className="w-full md:w-2/5 p-6 flex flex-col bg-white overflow-y-auto">
                <form id="emergency-form" onSubmit={handleSubmit} className="space-y-5 flex-1">
                  
                  {/* Global Project Details */}
                  <div className="pb-5 border-b border-slate-100">
                    <label className="block text-sm font-bold text-slate-800 mb-2">ชื่องาน (ภาพรวม) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium" 
                      placeholder="เช่น พายุพัดเสาไฟล้ม 10 ต้น ถ.มิตรภาพ" 
                    />
                  </div>

                  {/* Active Point Details */}
                  {activePoint ? (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                        <h3 className="font-bold text-slate-700">กำลังแก้ไขจุดที่เลือก</h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">พิกัด GPS</label>
                        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono">
                          {activePoint.lat.toFixed(6)}, {activePoint.lng.toFixed(6)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อเสา / ประเภทหัวเสา</label>
                        <input 
                          type="text" 
                          value={activePoint.pole_name || ""} 
                          onChange={e => updateActivePoint({ pole_name: e.target.value })} 
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm font-medium text-blue-800 transition-shadow" 
                          placeholder="เช่น SP, DDE, SA..." 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดสภาพชำรุดจุดนี้</label>
                        <textarea 
                          value={activePoint.damage_details} 
                          onChange={e => updateActivePoint({ damage_details: e.target.value })} 
                          rows={3} 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm" 
                          placeholder="เช่น เสาหักครึ่งท่อน สายขาดรุ่ย..." 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">รายการหัวเสา / อุปกรณ์ที่ต้องใช้</label>
                        <textarea 
                          value={activePoint.pole_details} 
                          onChange={e => updateActivePoint({ pole_details: e.target.value })} 
                          rows={2} 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm" 
                          placeholder="เช่น ต้องใช้เสา 12ม 1 ต้น, ลูกถ้วย 3 ลูก..." 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ประเมินจำนวนชุดงานจุดนี้</label>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => updateActivePoint({ team_required: Math.max(0, activePoint.team_required - 1) })} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold">-</button>
                          <div className="w-16 text-center font-bold text-lg text-slate-800">{activePoint.team_required}</div>
                          <button type="button" onClick={() => updateActivePoint({ team_required: activePoint.team_required + 1 })} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold">+</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400">
                      <MapPin className="mx-auto text-slate-200 mb-3" size={40} />
                      <p>เลือกจุดบนแผนที่หรือในรายการเพื่อใส่รายละเอียด</p>
                    </div>
                  )}

                </form>
                
                <div className="pt-5 mt-auto border-t border-slate-100">
                  <button 
                    type="submit" 
                    form="emergency-form"
                    disabled={isSubmitting || draftPoints.length === 0} 
                    className="w-full py-3.5 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm shadow-blue-200 transition-all"
                  >
                    {isSubmitting ? "กำลังบันทึก..." : <><Save size={20} /> บันทึกโปรเจกต์งานฉุกเฉิน</>}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

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
            alt="Fullscreen preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10" 
            onClick={() => setFullscreenImageUrl(null)}
          />
        </div>
      )}
    </div>
  );
}
