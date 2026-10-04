"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import dynamic from 'next/dynamic';
import { Camera, MapPin, Save, Plus, AlertTriangle, FileText, Wrench, Users, Info } from "lucide-react";

// Use dynamic import for the map to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

import exifr from 'exifr';

interface EmergencyJob {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
  damage_details: string;
  pole_details: string;
  team_required: number;
  image_url: string | null;
  created_at: string;
}

export default function EmergencyPlan() {
  const [jobs, setJobs] = useState<EmergencyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    damage_details: "",
    pole_details: "",
    team_required: 1,
  });
  
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
        
      if (error && error.code !== "42P01") throw error; // Ignore relation not found error for now
      
      setJobs(data || []);
    } catch (e: any) {
      console.error(e);
      if (e.code === "42P01") {
        console.warn("Table emergency_jobs does not exist yet. Please run the SQL migration.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    
    // Try to extract GPS from EXIF
    try {
      const exifData = await exifr.gps(file);
      if (exifData && exifData.latitude && exifData.longitude) {
        setPosition({ lat: exifData.latitude, lng: exifData.longitude });
        alert(`พบพิกัด GPS จากรูปภาพ! แผนที่จะทำการปักหมุดที่: ${exifData.latitude.toFixed(5)}, ${exifData.longitude.toFixed(5)}`);
      } else {
        alert("ไม่พบข้อมูลพิกัด GPS ในรูปภาพนี้ คุณสามารถปักหมุดตำแหน่งบนแผนที่ด้วยตัวเองได้");
      }
    } catch (error) {
      console.error("Error reading EXIF:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return alert("กรุณาระบุชื่องาน");
    if (!position) return alert("กรุณาปักหมุดบนแผนที่ หรืออัปโหลดรูปภาพที่มีพิกัด");
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from("emergency_jobs").insert([{
        title: formData.title,
        damage_details: formData.damage_details,
        pole_details: formData.pole_details,
        team_required: formData.team_required,
        latitude: position.lat,
        longitude: position.lng,
        // Since we don't have a storage bucket set up in this demo, we'll store local blob if we had one, 
        // but typically you'd upload to Supabase Storage first.
        image_url: null 
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

  const resetForm = () => {
    setFormData({ title: "", damage_details: "", pole_details: "", team_required: 1 });
    setPosition(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
            สร้างโปรเจคท์, ปักหมุดแผนที่ และวางแผนชุดงานสำหรับงานฉุกเฉิน
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          เพิ่มงานฉุกเฉิน
        </button>
      </div>

      {/* List of Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : jobs.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <AlertTriangle className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">ยังไม่มีงานฉุกเฉินในระบบ</p>
            <p className="text-sm text-slate-400 mt-1">คลิกที่ปุ่ม &quot;เพิ่มงานฉุกเฉิน&quot; เพื่อเริ่มต้น</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              {/* Map Preview for the job */}
              <div className="h-40 w-full bg-slate-100 relative">
                {job.latitude && job.longitude ? (
                  <MapComponent position={{lat: job.latitude, lng: job.longitude}} setPosition={() => {}} readonly={true} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    ไม่มีข้อมูลพิกัด
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 line-clamp-1 mb-2">{job.title}</h3>
                
                <div className="space-y-2 mt-2 text-sm text-slate-600 flex-1">
                  <p className="flex items-start gap-2">
                    <MapPin className="text-rose-500 shrink-0 mt-0.5" size={16} />
                    <span className="line-clamp-2">{job.latitude?.toFixed(4)}, {job.longitude?.toFixed(4)}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <FileText className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <span className="line-clamp-2" title={job.damage_details}>{job.damage_details || "-"}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Wrench className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <span className="line-clamp-1">{job.pole_details || "-"}</span>
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    <Users size={16} /> {job.team_required} ชุดงาน
                  </span>
                  <span className="text-slate-400 text-xs">
                    {new Date(job.created_at).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
            
            {/* Map Area */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 relative">
              <MapComponent position={position} setPosition={setPosition} />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur text-xs p-3 rounded-xl shadow-lg border border-slate-200 z-[400] pointer-events-none">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5"><Info size={14} className="text-blue-500"/> วิธีปักหมุด:</p>
                <ul className="mt-1 space-y-1 text-slate-600 ml-5 list-disc">
                  <li>อัปโหลดรูปภาพที่มีข้อมูล GPS ระบบจะปักหมุดให้อัตโนมัติ</li>
                  <li>คลิกบนพื้นที่ในแผนที่เพื่อปักหมุดด้วยตัวเอง</li>
                </ul>
              </div>
            </div>

            {/* Form Area */}
            <div className="w-full md:w-1/2 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">รายละเอียดงานฉุกเฉิน</h2>
                <button onClick={() => {setShowModal(false); resetForm();}} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ชื่องาน <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="เช่น รถชนเสาไฟหน้าซอย 12" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รูปถ่ายหน้างาน (เพื่อดึง GPS)</label>
                  <div className="flex gap-3">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" id="photo-upload" />
                    <label htmlFor="photo-upload" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors border border-slate-200 text-sm font-medium">
                      <Camera size={18} /> ถ่ายภาพ/อัปโหลดรูป
                    </label>
                    {position && (
                      <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                        <MapPin size={16} /> ปักหมุดแล้ว
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดสภาพชำรุด</label>
                  <textarea value={formData.damage_details} onChange={e => setFormData({...formData, damage_details: e.target.value})} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="เช่น เสาหักครึ่งท่อน สายขาดรุ่ย..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดหัวเสา / อุปกรณ์ที่ต้องใช้</label>
                  <textarea value={formData.pole_details} onChange={e => setFormData({...formData, pole_details: e.target.value})} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="เช่น ต้องใช้เสา 12ม 1 ต้น, ลูกถ้วย 3 ลูก..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ประเมินจำนวนชุดงาน (ทีม)</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setFormData(p => ({...p, team_required: Math.max(1, p.team_required - 1)}))} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold">-</button>
                    <div className="w-16 text-center font-bold text-lg text-slate-800">{formData.team_required}</div>
                    <button type="button" onClick={() => setFormData(p => ({...p, team_required: p.team_required + 1}))} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold">+</button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button type="button" onClick={() => {setShowModal(false); resetForm();}} className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">
                    ยกเลิก
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm shadow-blue-200 transition-all">
                    {isSubmitting ? "กำลังบันทึก..." : <><Save size={20} /> บันทึกข้อมูล</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
