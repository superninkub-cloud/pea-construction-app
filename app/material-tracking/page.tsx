"use client";

import React, { useState, useEffect } from "react";
import { Upload, Package, Wrench, AlertCircle, User, Loader2, ArrowRight, Briefcase } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";

interface Material {
  id: string;
  wbs: string;
  technician_name: string;
  material_code: string;
  material_name: string;
  quantity: number;
  unit: string;
  part: "new" | "demolish";
  status: string;
}

export default function MaterialTracking() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [technicians, setTechnicians] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("ทั้งหมด");

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    setIsLoading(true);
    try {
      // Fetch active projects to use as base for technicians
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;

      if (data) {
        // Exclude F4 and TECO
        const active = data.filter(p => p.status !== "F4" && p.status !== "ปิดงาน (TECO)");
        setActiveProjects(active);

        // Extract unique technicians (supervisors)
        const techs = Array.from(new Set(active.map(p => p.supervisor).filter(Boolean))).sort();
        setTechnicians(techs);
      }

      // Load saved materials from local storage
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

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
        const newMaterials: Material[] = result.materials.map((m: any) => {
          // Attempt to auto-assign technician using active projects base
          let assignedTech = m.technician_name || "";
          
          if (!assignedTech && m.wbs) {
            const cleanWbs = m.wbs.replace(/\s/g, "");
            const matchedProject = activeProjects.find(p => 
              p.wbs.replace(/\s/g, "").includes(cleanWbs) || 
              cleanWbs.includes(p.wbs.replace(/\s/g, ""))
            );
            if (matchedProject && matchedProject.supervisor) {
              assignedTech = matchedProject.supervisor;
            }
          }

          return {
            id: Math.random().toString(36).substring(2, 9),
            wbs: m.wbs || "",
            technician_name: assignedTech,
            material_code: m.material_code || "",
            material_name: m.material_name || "ไม่ระบุชื่อ",
            quantity: Number(m.quantity) || 0,
            unit: m.unit || "",
            part: m.part === "demolish" ? "demolish" : "new",
            status: m.part === "demolish" ? "ยังไม่ได้รื้อถอนและยังไม่ส่งคืน" : "ยังไม่ได้ก่อสร้าง"
          };
        });

        const updated = [...materials, ...newMaterials];
        saveToStorage(updated);
        setSelectedFile(null);
        alert(`ดึงข้อมูลสำเร็จ ${newMaterials.length} รายการ\n(ระบบจับคู่ช่างให้อัตโนมัติจากฐานข้อมูลงานที่กำลังทำ)`);
      } else {
        setUploadError("ไม่พบข้อมูลพัสดุในเอกสารนี้ (อาจเป็นโครงการสถานะ F4 ทั้งหมด)");
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "เกิดข้อผิดพลาดในการอ่านไฟล์");
    } finally {
      setIsUploading(false);
    }
  };

  const clearData = () => {
    if (confirm("ต้องการล้างข้อมูลพัสดุทั้งหมดใช่หรือไม่?")) {
      saveToStorage([]);
    }
  };

  const updateStatus = (id: string, newStatus: string) => {
    const updated = materials.map(m => m.id === id ? { ...m, status: newStatus } : m);
    saveToStorage(updated);
  };

  // Ensure "ยังไม่ระบุช่าง" is included if there are materials without a tech
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
          อ้างอิงฐานข้อมูลงานจากสถานะปัจจุบัน (ไม่รวม F4) เพื่อง่ายต่อการระบุช่างและติดตามพัสดุ
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Upload size={20} className="text-blue-600" />
            นำเข้าข้อมูล ZPSR018 (PDF)
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 cursor-pointer"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2 shrink-0"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {isUploading ? "กำลังวิเคราะห์และจับคู่ช่าง..." : "เริ่มดึงข้อมูล"}
            </button>
          </div>
          {uploadError && <p className="text-red-500 text-sm mt-3 flex items-center gap-1"><AlertCircle size={14}/> {uploadError}</p>}
        </div>

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
                onClick={clearData}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors border border-red-100"
              >
                ล้างรายการพัสดุ
              </button>
            )}
          </div>
        </div>

        {/* Technician Groups */}
        <div className="space-y-8">
          {displayTechs.map(tech => {
            const techProjects = activeProjects.filter(p => p.supervisor === tech);
            const techMaterials = materials.filter(m => (m.technician_name || "ยังไม่ระบุช่าง") === tech);
            const newMaterials = techMaterials.filter(m => m.part === "new");
            const demolishMaterials = techMaterials.filter(m => m.part === "demolish");

            return (
              <div key={tech} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <User size={20} className="text-blue-400" />
                    {tech}
                  </h3>
                  <div className="flex gap-2">
                    {techProjects.length > 0 && (
                      <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                        งานที่รับผิดชอบ {techProjects.length} งาน
                      </span>
                    )}
                    {techMaterials.length > 0 && (
                      <span className="bg-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                        พัสดุ {techMaterials.length} รายการ
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* งานที่รับผิดชอบ (ฐานข้อมูลงาน) */}
                  {techProjects.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-bold text-blue-700 flex items-center gap-2 pb-2 border-b border-blue-100 mb-4">
                        <Briefcase size={18} />
                        ฐานข้อมูลงานที่กำลังดำเนินการ (จากระบบอัปเดตสถานะงาน)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {techProjects.map(p => (
                          <div key={p.id} className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex flex-col gap-1">
                            <span className="text-xs font-bold text-blue-600">{p.wbs}</span>
                            <span className="text-sm font-medium text-slate-700 line-clamp-2">{p.name}</span>
                            <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 self-start mt-1">
                              สถานะ: {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {techMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      
                      {/* พัสดุเบิกใหม่ */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-emerald-700 flex items-center gap-2 pb-2 border-b border-emerald-100">
                          <Package size={18} />
                          พัสดุเบิกใหม่ที่ตรวจพบ ({newMaterials.length})
                        </h4>
                        {newMaterials.length === 0 ? (
                          <p className="text-sm text-slate-400 italic">ไม่มีพัสดุเบิกใหม่</p>
                        ) : (
                          <div className="space-y-3">
                            {newMaterials.map(m => (
                              <div key={m.id} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <p className="font-semibold text-slate-800 text-sm">{m.material_name}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      รหัส: {m.material_code || "-"} | WBS: {m.wbs}
                                    </p>
                                    <p className="text-sm font-medium text-emerald-600 mt-2">
                                      จำนวน: {m.quantity} {m.unit}
                                    </p>
                                  </div>
                                  <div className="shrink-0">
                                    <select
                                      value={m.status}
                                      onChange={(e) => updateStatus(m.id, e.target.value)}
                                      className={`text-xs font-bold px-3 py-1.5 rounded-lg outline-none border cursor-pointer ${
                                        m.status === "นำไปก่อสร้างแล้ว" 
                                          ? "bg-emerald-600 text-white border-emerald-700" 
                                          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                      }`}
                                    >
                                      <option value="ยังไม่ได้ก่อสร้าง">ยังไม่ได้ก่อสร้าง</option>
                                      <option value="นำไปก่อสร้างแล้ว">นำไปก่อสร้างแล้ว</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* พัสดุรื้อถอน */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-amber-700 flex items-center gap-2 pb-2 border-b border-amber-100">
                          <Wrench size={18} />
                          พัสดุรื้อถอนค้างส่งคืน ({demolishMaterials.length})
                        </h4>
                        {demolishMaterials.length === 0 ? (
                          <p className="text-sm text-slate-400 italic">ไม่มีพัสดุรื้อถอน</p>
                        ) : (
                          <div className="space-y-3">
                            {demolishMaterials.map(m => (
                              <div key={m.id} className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <p className="font-semibold text-slate-800 text-sm">{m.material_name}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      รหัส: {m.material_code || "-"} | WBS: {m.wbs}
                                    </p>
                                    <p className="text-sm font-medium text-amber-600 mt-2">
                                      จำนวน: {m.quantity} {m.unit}
                                    </p>
                                  </div>
                                  <div className="shrink-0 flex flex-col items-end gap-2">
                                    <select
                                      value={m.status}
                                      onChange={(e) => updateStatus(m.id, e.target.value)}
                                      className={`text-xs font-bold px-3 py-1.5 rounded-lg outline-none border cursor-pointer ${
                                        m.status === "ส่งคืนแล้ว" 
                                          ? "bg-emerald-600 text-white border-emerald-700" 
                                          : m.status === "รื้อถอนแล้วยังไม่ส่งคืน"
                                            ? "bg-amber-500 text-white border-amber-600"
                                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                      }`}
                                    >
                                      <option value="ยังไม่ได้รื้อถอนและยังไม่ส่งคืน">ยังไม่ได้รื้อถอน</option>
                                      <option value="รื้อถอนแล้วยังไม่ส่งคืน">รื้อแล้วรอส่งคืน</option>
                                      <option value="ส่งคืนแล้ว">ส่งคืนแล้ว</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-slate-500 text-sm">ยังไม่มีพัสดุระบุว่าเป็นของช่างชุดนี้ (ลองอัปโหลด ZPSR018 ที่มี WBS ตรงกับงานที่รับผิดชอบ)</p>
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  );
}
