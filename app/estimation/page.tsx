"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import estimationDataRaw from "@/lib/estimationData.json";
import { Assembly, EstimationItem } from "@/lib/estimationTypes";
import { Save, Plus, Trash2, X, ChevronLeft, Edit, List, FileText, Zap, ShieldCheck, BarChart2, ArrowRight, Package, Search, Clock } from "lucide-react";

const estimationData = estimationDataRaw as Assembly[];

type Mode = "SELECT_PROJECT" | "PROJECT_DETAILS" | "EDIT_POLE";
type Tab = "POLES" | "SUMMARY";

export default function EstimationPage() {
  const [mode, setMode] = useState<Mode>("SELECT_PROJECT");
  const [isAdmin, setIsAdmin] = useState(false);

  // Project Level
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [newProjectInput, setNewProjectInput] = useState("");
  const [projectPoles, setProjectPoles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("POLES");
  const [isLoading, setIsLoading] = useState(false);

  // Pole Editor Level
  const [editingPoleId, setEditingPoleId] = useState<number | null>(null);
  const [poleName, setPoleName] = useState("");
  const [selectedAssembly, setSelectedAssembly] = useState<string>("");
  const [items, setItems] = useState<EstimationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<EstimationItem>({ code: "", name: "", unit: "ชิ้น", qty: 1 });
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState("");
  const [image2Preview, setImage2Preview] = useState("");
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem("pea_role");
    if (role === "admin") setIsAdmin(true);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("pole_estimations")
        .select("project_name");
      if (!error && data) {
        const uniqueProjects = Array.from(new Set(data.map(d => d.project_name).filter(Boolean)));
        setProjects(uniqueProjects as string[]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProjectPoles = async (projectName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pole_estimations")
        .select("*")
        .eq("project_name", projectName)
        .order("id", { ascending: true });
      if (!error && data) {
        // Natural sort by pole_name so P2 comes before P15
        const sortedData = data.sort((a, b) => 
          (a.pole_name || "").localeCompare(b.pole_name || "", undefined, { numeric: true, sensitivity: 'base' })
        );
        setProjectPoles(sortedData);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleSelectProject = (proj: string) => {
    setSelectedProject(proj);
    setMode("PROJECT_DETAILS");
    setActiveTab("POLES");
    fetchProjectPoles(proj);
  };

  const handleCreateProject = () => {
    if (!newProjectInput.trim()) return;
    setSelectedProject(newProjectInput.trim());
    setProjectPoles([]);
    setMode("PROJECT_DETAILS");
    setActiveTab("POLES");
  };

  // --- Pole Editor Logic ---
  const handleAddNewPole = () => {
    setEditingPoleId(null);
    setPoleName("");
    setSelectedAssembly("");
    setItems([]);
    setImage1(null);
    setImage2(null);
    setImage1Preview("");
    setImage2Preview("");
    setMode("EDIT_POLE");
  };

  const handleEditPole = (pole: any) => {
    setEditingPoleId(pole.id);
    setPoleName(pole.pole_name);
    setSelectedAssembly(pole.assembly_type === "Custom" ? "" : pole.assembly_type);
    setItems(pole.items || []);
    setImage1Preview(pole.image1_url || "");
    setImage2Preview(pole.image2_url || "");
    setImage1(null);
    setImage2(null);
    setMode("EDIT_POLE");
  };

  const handleDeletePole = async (id: number, poleNameStr: string) => {
    if (!isAdmin) {
      alert("เฉพาะ Admin เท่านั้นที่ลบได้");
      return;
    }
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบเสา: ${poleNameStr}?`)) return;
    try {
      await supabase.from("pole_estimations").delete().eq("id", id);
      fetchProjectPoles(selectedProject);
    } catch (error) {
      alert("ลบล้มเหลว");
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
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
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
              else resolve(file);
            },
            "image/jpeg",
            0.7
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressedFile = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressedFile);
      if (imageNumber === 1) {
        setImage1(compressedFile);
        setImage1Preview(previewUrl);
      } else {
        setImage2(compressedFile);
        setImage2Preview(previewUrl);
      }
    }
  };

  const handleAssemblyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const asmName = e.target.value;
    setSelectedAssembly(asmName);
    if (asmName) {
      const found = estimationData.find(a => a.assemblyName === asmName);
      if (found) {
        setItems(JSON.parse(JSON.stringify(found.items)));
      }
    } else {
      setItems([]);
    }
  };

  const handleSavePole = async () => {
    if (!poleName) {
      alert("กรุณาระบุชื่อหรือเบอร์เสาไฟ");
      return;
    }
    if (items.length === 0) {
      alert("ไม่มีรายการพัสดุให้บันทึก");
      return;
    }

    setIsSaving(true);
    try {
      let img1Url = image1Preview; 
      let img2Url = image2Preview;

      if (image1) {
        const fileExt = image1.name.split(".").pop();
        const fileName = `estimation_${Date.now()}_1.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("project_images").upload(fileName, image1);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("project_images").getPublicUrl(fileName);
        img1Url = data.publicUrl;
      }

      if (image2) {
        const fileExt = image2.name.split(".").pop();
        const fileName = `estimation_${Date.now()}_2.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("project_images").upload(fileName, image2);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("project_images").getPublicUrl(fileName);
        img2Url = data.publicUrl;
      }

      const payload = {
        project_name: selectedProject,
        pole_name: poleName,
        assembly_type: selectedAssembly || "Custom",
        items: items,
        image1_url: img1Url && img1Url.startsWith('blob:') ? null : img1Url, 
        image2_url: img2Url && img2Url.startsWith('blob:') ? null : img2Url
      };

      if (editingPoleId) {
        const { error } = await supabase.from("pole_estimations").update(payload).eq("id", editingPoleId);
        if (error) throw error;
        alert("อัปเดตข้อมูลเสาเรียบร้อยแล้ว");
      } else {
        const { error } = await supabase.from("pole_estimations").insert(payload);
        if (error) throw error;
        alert("เพิ่มเสาต้นใหม่เรียบร้อยแล้ว");
      }

      fetchProjectPoles(selectedProject);
      if (!projects.includes(selectedProject)) fetchProjects();
      setMode("PROJECT_DETAILS");

    } catch (error: any) {
      console.error(error);
      alert("ไม่สามารถบันทึกข้อมูลได้: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Aggregation
  const getAggregatedItems = () => {
    const summary: Record<string, EstimationItem> = {};
    projectPoles.forEach(pole => {
      if (pole.items && Array.isArray(pole.items)) {
        pole.items.forEach((item: EstimationItem) => {
          if (!summary[item.code]) {
            summary[item.code] = { ...item, qty: 0 };
          }
          summary[item.code].qty += Number(item.qty) || 0;
        });
      }
    });
    return Object.values(summary).sort((a, b) => a.code.localeCompare(b.code));
  };

  return (
    <div className="p-4 max-w-5xl mx-auto pb-24 animation-fade-in">
      
      {/* ---------------- MODE: SELECT PROJECT ---------------- */}
      {mode === "SELECT_PROJECT" && (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 relative">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-purple-100/50 blur-[100px]"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-indigo-100/50 blur-[100px]"></div>
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-4 text-center tracking-tight">
              โปรแกรมประมาณการอุปกรณ์ (เสาไฟ)
            </h1>
            <p className="text-[#64748b] text-lg mb-8 text-center max-w-2xl">
              สร้างและจัดการโครงการประมาณการอุปกรณ์เสาไฟได้อย่างสะดวก รวดเร็ว และเป็นระบบ
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <span className="flex items-center gap-2 text-sm font-medium text-purple-700 bg-purple-50 px-4 py-2 rounded-full"><Zap size={16} /> ใช้งานง่าย</span>
              <span className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 px-4 py-2 rounded-full"><ShieldCheck size={16} /> ข้อมูลปลอดภัย</span>
              <span className="flex items-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full"><BarChart2 size={16} /> จัดการโครงการได้อย่างมีประสิทธิภาพ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              
              {/* Create New Project Card */}
              <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-purple-100 text-purple-600 p-4 rounded-2xl flex-shrink-0">
                      <Plus size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">สร้างโครงการใหม่</h2>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        เริ่มต้นสร้างโครงการประมาณการอุปกรณ์เสาไฟเพื่อจัดทำรายการเสาและอุปกรณ์ที่ต้องใช้
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-8 mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อโครงการ</label>
                    <input
                      type="text"
                      className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none text-gray-700 placeholder-gray-400 bg-gray-50/50 hover:bg-gray-50 transition-all text-base"
                      placeholder="ก่อสร้างสายส่ง 115 เควี รองรับ สถานีไฟฟ้า ..."
                      value={newProjectInput}
                      onChange={e => setNewProjectInput(e.target.value)}
                      onKeyDown={e => { if(e.key === 'Enter') handleCreateProject() }}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleCreateProject}
                  disabled={!newProjectInput.trim()}
                  className="w-full bg-[#5b21b6] hover:bg-[#4c1d95] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
                >
                  เริ่มสร้างรายการเสา <ArrowRight size={20} />
                </button>
              </div>

              {/* Select Existing Project Card */}
              <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-[450px] flex flex-col hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl flex-shrink-0">
                    <List size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">โครงการที่บันทึกไว้แล้ว</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      เปิดดู แก้ไข หรือติดตามโครงการที่คุณเคยบันทึกไว้
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                  {projects.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                       <div className="bg-gray-50 rounded-full p-8 mb-4">
                         <FileText size={64} className="text-gray-300" strokeWidth={1.5} />
                       </div>
                       <h3 className="text-xl font-bold text-gray-700 mb-2">ยังไม่มีโครงการในระบบ</h3>
                       <p className="text-gray-500 text-sm max-w-[200px]">เมื่อคุณสร้างโครงการแล้ว รายการจะปรากฏที่นี่</p>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto pr-2 space-y-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {projects.map((p, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => handleSelectProject(p)}
                          className="p-4 border-2 border-gray-50 rounded-xl hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all flex justify-between items-center group"
                        >
                          <span className="font-semibold text-gray-700 group-hover:text-blue-700">{p}</span>
                          <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:bg-blue-600 group-hover:text-white text-gray-400 transition-colors">
                            <ChevronLeft size={16} className="rotate-180" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODE: PROJECT DETAILS ---------------- */}
      {mode === "PROJECT_DETAILS" && (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
          {/* Header Section */}
          {/* Header Section */}
          <div className="relative bg-[#f8f9ff] rounded-3xl p-8 border border-purple-100 shadow-sm overflow-hidden">
            {/* Background Pylons */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-end">
              <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
                <path d="M 600 200 L 600 50 L 590 50 L 580 200 Z" fill="#5b21b6" />
                <path d="M 600 80 L 550 100 L 550 110 L 600 90 Z" fill="#5b21b6" />
                <path d="M 600 80 L 650 100 L 650 110 L 600 90 Z" fill="#5b21b6" />
                <path d="M 600 120 L 530 150 L 530 160 L 600 130 Z" fill="#5b21b6" />
                <path d="M 600 120 L 670 150 L 670 160 L 600 130 Z" fill="#5b21b6" />
                
                <path d="M 750 200 L 750 20 L 740 20 L 730 200 Z" fill="#5b21b6" />
                <path d="M 750 50 L 690 70 L 690 80 L 750 60 Z" fill="#5b21b6" />
                <path d="M 750 50 L 810 70 L 810 80 L 750 60 Z" fill="#5b21b6" />
                <path d="M 750 100 L 670 130 L 670 140 L 750 110 Z" fill="#5b21b6" />
                <path d="M 750 100 L 830 130 L 830 140 L 750 110 Z" fill="#5b21b6" />
                
                <path d="M 400 200 L 400 100 L 395 100 L 390 200 Z" fill="#5b21b6" />
                <path d="M 400 120 L 370 130 L 370 135 L 400 125 Z" fill="#5b21b6" />
                <path d="M 400 120 L 430 130 L 430 135 L 400 125 Z" fill="#5b21b6" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <button 
                onClick={() => { setMode("SELECT_PROJECT"); fetchProjects(); }}
                className="flex items-center text-gray-500 hover:text-purple-700 mb-6 transition bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-sm font-semibold w-fit"
              >
                <ChevronLeft size={18} className="mr-1" /> กลับไปเลือกโครงการ
              </button>
              
              <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
                โครงการ: <span className="text-[#5b21b6]">{selectedProject}</span>
              </h1>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-4 min-w-[240px] flex-1">
                  <div className="text-purple-600 bg-purple-50 p-4 rounded-full">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L12 22"/><path d="M8 22L16 22"/><path d="M10 2L14 2"/><path d="M12 7L6 10"/><path d="M12 7L18 10"/><path d="M12 13L4 17"/><path d="M12 13L20 17"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">จำนวนเสาไฟทั้งหมด</p>
                    <p className="text-2xl font-bold text-gray-800">{projectPoles.length} <span className="text-sm font-medium text-gray-500">ต้น</span></p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-4 min-w-[240px] flex-1">
                  <div className="text-purple-600 bg-purple-50 p-4 rounded-full">
                    <Package size={28} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">จำนวนพัสดุทั้งหมด</p>
                    <p className="text-2xl font-bold text-gray-800">{getAggregatedItems().length} <span className="text-sm font-medium text-gray-500">รายการ</span></p>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-4 min-w-[300px] flex-1">
                  <div className="text-purple-600 bg-purple-50 p-4 rounded-full">
                    <Clock size={28} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">อัปเดตล่าสุด</p>
                    <p className="text-sm font-bold text-gray-800">
                      {projectPoles.length > 0 && projectPoles[projectPoles.length - 1].created_at 
                        ? new Date(projectPoles[projectPoles.length - 1].created_at).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' น.' 
                        : "ยังไม่มีข้อมูล"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">โดย ผู้ใช้งานระบบ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button 
                onClick={() => setActiveTab("POLES")}
                className={`flex-1 py-5 font-bold text-center flex justify-center items-center gap-2 transition-all rounded-tl-3xl ${activeTab === 'POLES' ? 'text-[#5b21b6] border-b-4 border-[#5b21b6] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
              >
                <List size={20} /> รายการเสาไฟ ({projectPoles.length})
              </button>
              <button 
                onClick={() => setActiveTab("SUMMARY")}
                className={`flex-1 py-5 font-bold text-center flex justify-center items-center gap-2 transition-all rounded-tr-3xl ${activeTab === 'SUMMARY' ? 'text-[#5b21b6] border-b-4 border-[#5b21b6] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
              >
                <FileText size={20} /> สรุปวัสดุรวมทั้งหมด
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8 flex-1 flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                  กำลังโหลดข้อมูล...
                </div>
              ) : activeTab === "POLES" ? (
                <div className="animation-fade-in flex flex-col h-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="text-purple-600 p-2 hidden sm:block">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L12 22"/><path d="M8 22L16 22"/><path d="M10 2L14 2"/><path d="M12 7L6 10"/><path d="M12 7L18 10"/><path d="M12 13L4 17"/><path d="M12 13L20 17"/></svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">เสาไฟในโครงการนี้</h2>
                        <p className="text-sm text-gray-500 mt-1">รายการเสาไฟทั้งหมดในโครงการ หรือตรวจสอบย่อยพัสดุและการดำเนินงาน</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="ค้นหาเสาไฟ (เช่น P1, P2...)" 
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm transition-all bg-white"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={handleAddNewPole}
                        className="bg-[#5b21b6] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#4c1d95] text-sm font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95 whitespace-nowrap"
                      >
                        <Plus size={18} strokeWidth={2.5} /> เพิ่มเสาไฟใหม่
                      </button>
                    </div>
                  </div>
                  
                  {projectPoles.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10 mt-10">
                      <div className="bg-gray-50 rounded-full p-8 mb-6 relative">
                        <Package size={64} className="text-gray-300 relative z-10" strokeWidth={1.5} />
                        <div className="absolute top-0 right-0 w-4 h-4 bg-purple-200 rounded-full"></div>
                        <div className="absolute bottom-2 left-2 w-3 h-3 bg-blue-200 rounded-full"></div>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-purple-300">
                          <svg width="40" height="20" viewBox="0 0 40 20" fill="none"><path d="M5 15L15 5M20 18L20 2M35 15L25 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">มีเสาไฟทั้งหมด 0 ต้น</h3>
                      <p className="text-gray-500 text-sm">คลิก &quot;เพิ่มเสาไฟใหม่&quot; เพื่อเพิ่มรายการเสาไฟในโครงการ</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-5 relative">
                      {projectPoles.filter(p => p.pole_name.toLowerCase().includes(searchTerm.toLowerCase())).map(pole => (
                        <div key={pole.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-purple-200 hover:shadow-md transition-all flex gap-4 group">
                          <div className="bg-[#f3efff] text-[#5b21b6] p-4 rounded-xl h-fit flex-shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L12 22"/><path d="M8 22L16 22"/><path d="M10 2L14 2"/><path d="M12 7L6 10"/><path d="M12 7L18 10"/><path d="M12 13L4 17"/><path d="M12 13L20 17"/></svg>
                          </div>
                          <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-gray-800 text-lg group-hover:text-purple-700 transition-colors">{pole.pole_name}</h3>
                              <ChevronLeft size={16} className="text-gray-300 rotate-180" />
                            </div>
                            <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed" title={pole.assembly_type}>
                              อุปประกอบ: {pole.assembly_type || 'Custom'}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-[#5b21b6] bg-[#f3efff] px-3 py-1.5 rounded-lg">
                                <Package size={14} /> พัสดุ {pole.items?.length || 0} รายการ
                              </span>
                              <div className="flex gap-2">
                                <button onClick={() => handleEditPole(pole)} className="text-blue-500 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors border border-blue-100" title="แก้ไข">
                                  <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeletePole(pole.id, pole.pole_name)} className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors border border-red-100" title="ลบ">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Empty state illustration slot (Visible if there's only 1 pole to match mock, or just as a filler) */}
                      {projectPoles.length > 0 && projectPoles.filter(p => p.pole_name.toLowerCase().includes(searchTerm.toLowerCase())).length < 2 && (
                         <div className="hidden xl:flex flex-col items-center justify-center text-center opacity-60">
                           <div className="bg-gray-50 rounded-full p-8 mb-6 relative">
                             <Package size={64} className="text-gray-300 relative z-10" strokeWidth={1.5} />
                             <div className="absolute top-0 right-0 w-4 h-4 bg-purple-200 rounded-full"></div>
                             <div className="absolute bottom-2 left-2 w-3 h-3 bg-blue-200 rounded-full"></div>
                             <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-purple-300">
                               <svg width="40" height="20" viewBox="0 0 40 20" fill="none"><path d="M5 15L15 5M20 18L20 2M35 15L25 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                             </div>
                           </div>
                           <h3 className="text-lg font-bold text-gray-700 mb-2">มีเสาไฟทั้งหมด {projectPoles.length} ต้น</h3>
                           <p className="text-gray-500 text-sm max-w-[200px]">คลิก &quot;เพิ่มเสาไฟใหม่&quot; เพื่อเพิ่มรายการเสาไฟในโครงการ</p>
                         </div>
                      )}

                      {projectPoles.filter(p => p.pole_name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                         <div className="col-span-full py-10 text-center text-gray-400">ไม่พบเสาไฟที่ค้นหา</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="animation-fade-in flex flex-col h-full">
                   <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-gray-800">สรุปจำนวนวัสดุทั้งหมดที่ต้องใช้ในโครงการ</h2>
                     <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                       รวมจาก {projectPoles.length} ต้น
                     </span>
                   </div>
                   <div className="bg-white rounded-2xl border-2 border-gray-50 overflow-hidden shadow-sm flex-1">
                     <table className="w-full text-sm text-left">
                       <thead className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b-2 border-gray-100">
                         <tr>
                           <th className="px-6 py-4 font-bold w-32">รหัสพัสดุ</th>
                           <th className="px-6 py-4 font-bold">ชื่อพัสดุ</th>
                           <th className="px-6 py-4 font-bold text-right w-32">จำนวนรวม</th>
                           <th className="px-6 py-4 font-bold w-24">หน่วย</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                         {getAggregatedItems().length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-16 text-center text-gray-400 font-medium">ไม่มีรายการวัสดุที่จะสรุป (โปรดเพิ่มเสาไฟก่อน)</td></tr>
                         ) : getAggregatedItems().map((item, idx) => (
                           <tr key={idx} className="hover:bg-purple-50/50 transition-colors group">
                             <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.code}</td>
                             <td className="px-6 py-4 font-medium text-gray-800 group-hover:text-purple-800">{item.name}</td>
                             <td className="px-6 py-4 text-right">
                               <span className="font-bold text-purple-700 text-base bg-purple-50 px-3 py-1 rounded-lg">
                                 {item.qty.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                               </span>
                             </td>
                             <td className="px-6 py-4 text-gray-500 font-medium">{item.unit}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODE: EDIT POLE ---------------- */}
      {mode === "EDIT_POLE" && (
        <div className="animation-fade-in">
          <div className="mb-6">
            <button 
              onClick={() => setMode("PROJECT_DETAILS")}
              className="flex items-center text-gray-500 hover:text-purple-600 mb-4 transition bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 text-sm font-medium w-fit"
            >
              <ChevronLeft size={18} className="mr-1" /> ยกเลิก / กลับไปโครงการ
            </button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {editingPoleId ? <Edit className="text-blue-500" /> : <Plus className="text-purple-600" />}
              {editingPoleId ? "แก้ไขข้อมูลเสาไฟ" : "เพิ่มเสาไฟต้นใหม่"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">บันทึกภายใต้โครงการ: <span className="font-semibold">{selectedProject}</span></p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ชื่อหรือเบอร์เสาไฟ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                placeholder="เช่น เสาต้นที่ 1, Pole-A01"
                value={poleName}
                onChange={(e) => setPoleName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชนิดชุดประกอบ (Assembly)</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50 focus:bg-white transition-colors cursor-pointer"
                value={selectedAssembly}
                onChange={handleAssemblyChange}
              >
                <option value="">-- กำหนดเอง (Custom) / เริ่มต้นว่างเปล่า --</option>
                {estimationData.map((asm, idx) => (
                  <option key={idx} value={asm.assemblyName}>{asm.assemblyName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-gray-100 mt-2">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">📸 รูปเสาต้นที่ 1</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 1)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                />
                {image1Preview && (
                  <img 
                    src={image1Preview} 
                    alt="Preview 1" 
                    onClick={() => setPreviewModalImg(image1Preview)}
                    className="mt-4 h-48 w-full object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                  />
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">📸 รูปเสาต้นที่ 2</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 2)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                />
                {image2Preview && (
                  <img 
                    src={image2Preview} 
                    alt="Preview 2" 
                    onClick={() => setPreviewModalImg(image2Preview)}
                    className="mt-4 h-48 w-full object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                  />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <List size={18} className="text-purple-600" /> รายการวัสดุสำหรับเสาต้นนี้
              </h2>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="text-sm flex items-center gap-1 bg-white border border-purple-200 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 font-medium transition-colors shadow-sm"
              >
                {isAdding ? <><X size={16} /> ปิดหน้าต่างเพิ่ม</> : <><Plus size={16} /> พิมพ์พัสดุเพิ่มเอง</>}
              </button>
            </div>

            {isAdding && (
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-end shadow-inner">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">รหัสพัสดุ</label>
                  <input type="text" className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" value={newItem.code} onChange={e => setNewItem({...newItem, code: e.target.value})} placeholder="เช่น 1010110200" />
                </div>
                <div className="flex-[2] min-w-[200px]">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">ชื่อพัสดุ</label>
                  <input type="text" className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="ชื่ออุปกรณ์" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">จำนวน</label>
                  <input type="number" min="1" step="0.01" className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">หน่วย</label>
                  <input type="text" className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} placeholder="ชุด/ชิ้น" />
                </div>
                <button 
                  onClick={() => {
                    if (!newItem.code || !newItem.name) return alert("กรุณากรอกรหัสและชื่อพัสดุให้ครบถ้วน");
                    setItems([...items, newItem]);
                    setNewItem({ code: "", name: "", unit: "ชิ้น", qty: 1 });
                    setIsAdding(false);
                  }} 
                  className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 shadow-md shadow-purple-200 transition-all active:scale-95"
                >
                  บันทึกรายการลงตาราง
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 w-32">รหัสพัสดุ</th>
                    <th className="px-5 py-3">ชื่อพัสดุ</th>
                    <th className="px-5 py-3 text-right w-32">จำนวน</th>
                    <th className="px-5 py-3 w-24">หน่วย</th>
                    <th className="px-5 py-3 text-center w-20">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-600 font-mono text-xs">{item.code}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-5 py-3 text-right">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-24 text-right border border-gray-300 rounded-md p-1.5 focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-purple-700 bg-white shadow-inner"
                          value={item.qty}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[idx].qty = parseFloat(e.target.value) || 0;
                            setItems(newItems);
                          }}
                        />
                      </td>
                      <td className="px-5 py-3 text-gray-600">{item.unit}</td>
                      <td className="px-5 py-3 text-center">
                        <button 
                          onClick={() => {
                            const newItems = [...items];
                            newItems.splice(idx, 1);
                            setItems(newItems);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="ลบรายการนี้"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400 bg-gray-50/50">
                        <p className="mb-2">ยังไม่มีรายการวัสดุ</p>
                        <p className="text-xs text-gray-400 font-medium">กรุณาเลือกชนิดชุดประกอบ หรือเพิ่มรายการพัสดุเอง</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {(isAdmin || true) && (
            <div className="flex justify-end mb-10 border-t border-gray-200 pt-6">
              <button
                onClick={handleSavePole}
                disabled={isSaving}
                className={`flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-base ${
                  isSaving ? "bg-purple-400 cursor-wait shadow-none" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-200 hover:shadow-purple-300"
                }`}
              >
                <Save size={20} />
                {isSaving ? "กำลังบันทึกข้อมูล..." : (editingPoleId ? "อัปเดตข้อมูลเสาต้นนี้" : "บันทึกเสาต้นใหม่")}
              </button>
            </div>
          )}
          {!isAdmin && false && (
            <div className="text-center text-red-500 text-sm mt-4 bg-red-50 py-3 rounded-lg border border-red-100">
              เฉพาะ Admin เท่านั้นที่สามารถบันทึกข้อมูลได้
            </div>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animation-fade-in"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              className="absolute top-0 right-0 md:-top-4 md:-right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-md transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setPreviewModalImg(null); }}
            >
              <X size={24} />
            </button>
            <img 
              src={previewModalImg} 
              alt="Full Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
}
