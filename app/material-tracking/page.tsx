"use client";

import React, { useState, useEffect } from "react";
import { Upload, Package, Wrench, AlertCircle, CheckCircle, User, Loader2, ArrowRight } from "lucide-react";

interface Material {
  id: string; // generated client-side for UI tracking
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("ทั้งหมด");

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("material_tracking_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMaterials(parsed);
        extractTechnicians(parsed);
      } catch (e) {
        console.error("Failed to parse local storage data", e);
      }
    }
  }, []);

  const saveToStorage = (data: Material[]) => {
    setMaterials(data);
    localStorage.setItem("material_tracking_data", JSON.stringify(data));
    extractTechnicians(data);
  };

  const extractTechnicians = (data: Material[]) => {
    const techs = Array.from(new Set(data.map(m => m.technician_name || "ยังไม่ระบุช่าง"))).sort();
    setTechnicians(techs);
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
        // Map API response to our UI model
        const newMaterials: Material[] = result.materials.map((m: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          wbs: m.wbs || "",
          technician_name: m.technician_name || "",
          material_code: m.material_code || "",
          material_name: m.material_name || "ไม่ระบุชื่อ",
          quantity: Number(m.quantity) || 0,
          unit: m.unit || "",
          part: m.part === "demolish" ? "demolish" : "new",
          status: m.part === "demolish" ? "ยังไม่ได้รื้อถอนและยังไม่ส่งคืน" : "ยังไม่ได้ก่อสร้าง"
        }));

        // Combine with existing (or replace - for this demo let's add to existing)
        const updated = [...materials, ...newMaterials];
        saveToStorage(updated);
        setSelectedFile(null);
        alert(`ดึงข้อมูลสำเร็จ ${newMaterials.length} รายการ`);
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
      setSelectedTechnician("ทั้งหมด");
    }
  };

  const updateStatus = (id: string, newStatus: string) => {
    const updated = materials.map(m => m.id === id ? { ...m, status: newStatus } : m);
    saveToStorage(updated);
  };

  const assignTechnician = (id: string, name: string) => {
    const updated = materials.map(m => m.id === id ? { ...m, technician_name: name } : m);
    saveToStorage(updated);
  };

  const assignTechnicianToAllUnassigned = () => {
    const name = prompt("ระบุชื่อช่าง สำหรับพัสดุที่ยังไม่ระบุช่างทั้งหมด:");
    if (name && name.trim()) {
      const updated = materials.map(m => (!m.technician_name) ? { ...m, technician_name: name.trim() } : m);
      saveToStorage(updated);
    }
  };

  const filteredMaterials = selectedTechnician === "ทั้งหมด" 
    ? materials 
    : materials.filter(m => (m.technician_name || "ยังไม่ระบุช่าง") === selectedTechnician);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package size={28} />
          ติดตามพัสดุรายช่าง (ZPSR018)
        </h1>
        <p className="opacity-80 text-sm mt-1">อัปโหลดไฟล์ ZPSR018 เพื่อติดตามพัสดุเบิกใหม่และพัสดุรื้อถอนของช่างแต่ละคน</p>
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
              {isUploading ? "กำลังวิเคราะห์ด้วย AI..." : "เริ่มดึงข้อมูล"}
            </button>
          </div>
          {uploadError && <p className="text-red-500 text-sm mt-3 flex items-center gap-1"><AlertCircle size={14}/> {uploadError}</p>}
        </div>

        {/* Dashboard Area */}
        {materials.length > 0 && (
          <div className="space-y-6">
            
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <label className="text-sm font-medium text-slate-600 shrink-0">กรองตามช่าง:</label>
                <select 
                  value={selectedTechnician} 
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full md:w-48 p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500"
                >
                  <option value="ทั้งหมด">ทั้งหมด ({materials.length} รายการ)</option>
                  {technicians.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={assignTechnicianToAllUnassigned}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200"
                >
                  กำหนดช่างให้รายการที่ว่าง
                </button>
                <button 
                  onClick={clearData}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors border border-red-100"
                >
                  ล้างข้อมูลทั้งหมด
                </button>
              </div>
            </div>

            {/* Technician Groups */}
            <div className="space-y-8">
              {Array.from(new Set(filteredMaterials.map(m => m.technician_name || "ยังไม่ระบุช่าง"))).sort().map(tech => {
                const techMaterials = filteredMaterials.filter(m => (m.technician_name || "ยังไม่ระบุช่าง") === tech);
                const newMaterials = techMaterials.filter(m => m.part === "new");
                const demolishMaterials = techMaterials.filter(m => m.part === "demolish");

                return (
                  <div key={tech} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <User size={20} className="text-blue-400" />
                        {tech}
                      </h3>
                      <span className="bg-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                        รวม {techMaterials.length} รายการ
                      </span>
                    </div>

                    <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                      
                      {/* พัสดุเบิกใหม่ */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-emerald-700 flex items-center gap-2 pb-2 border-b border-emerald-100">
                          <Package size={18} />
                          พัสดุเบิกใหม่ ({newMaterials.length})
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
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {materials.length === 0 && !isUploading && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center text-blue-800 shadow-inner">
            <Package size={48} className="mx-auto text-blue-300 mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">ยังไม่มีข้อมูลพัสดุในระบบ</h3>
            <p className="text-sm opacity-80">กรุณาอัปโหลดไฟล์รายงาน ZPSR018 ที่เป็น PDF เพื่อเริ่มการดึงข้อมูลและติดตามพัสดุ</p>
          </div>
        )}
      </div>
    </div>
  );
}
