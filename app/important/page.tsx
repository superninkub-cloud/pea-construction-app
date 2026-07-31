"use client";

import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { AlertTriangle, AlertCircle, CheckCircle2, XCircle, Edit2, Save, X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const defaultProjects = [
  {
    id: 1,
    name: "ปป.22kVใต้แนวสายส่ง ช่วง สฟฟ.กพส. ถึง แยกตลาดกำแพงแสน",
    wbs: "I-68-I-KPN03.19.3918",
    distance: "1.555 วงจร-กม.",
    target: "พฤศจิกายน 2569",
    status: "อยู่ระหว่างก่อสร้าง",
    progress: 21.72,
    note: "ต้องเร่งรัดการก่อสร้างและการเบิกจ่ายให้สอดคล้องกับแผนงานที่ตั้งไว้อย่างเร่งด่วน (เบิกจ่ายล่าช้า 3.13% - 21.72%)",
    type: "urgent",
  },
  {
    id: 2,
    name: "ปป.เชื่อมโยง อ่างเก็บน้ำเขื่อนเขาแหลม (รองรับการแก้ไขปัญหาไฟดับ กฟส.สังขละบุรี)",
    wbs: "P-TDD02.3-I-TPMNA.0015",
    distance: "2.590 กม.",
    target: "ภายในปี 2569",
    status: "รอทำราคากลาง",
    progress: 0,
    note: "E-bidding ให้ กฟฟ.หน้างาน ดำเนินการต่อเอง (ต้องเร่งรัดดำเนินการ)",
    type: "urgent",
  },
  {
    id: 3,
    name: "สายส่ง TAB LINE สฟ.พนมทวน-กาญจนบุรี2 - สฟ.กาญจนบุรี 5 (ชั่วคราว)",
    wbs: "I-69-I-KCI02.19.3907",
    distance: "3.120 กม.",
    target: "ภายในปี 2569",
    status: "ผรม.เริ่มเข้าทำฐาน",
    progress: 5,
    note: "โรงหล่อผลิตซองฐานรากให้ยังไม่ทัน (เจรจาขอพื้นที่ทำงานก่อสร้างกับกรมทางหลวงสำเร็จแล้ว ทีมงานสามารถเข้าดำเนินการต่อได้ทันที)",
    type: "urgent",
  },
  {
    id: 4,
    name: "งานก่อสร้างย้ายแนว 115 เควี บริเวณแยกเทียนดัด และแยกโรมัน",
    wbs: "I-69-I-KCI02.19.3908",
    distance: "1.152 กม.",
    target: "รอดำเนินการ",
    status: "ติดข้อจำกัดกรมทางหลวง",
    progress: 0,
    note: "แนวตอกเสาเข็ม/ฐานราก ทับซ้อนแนวสายเคเบิลใต้ดิน 115kV (ผศร. จะสามารถดำเนินการย้ายแนว 115kV ได้ก็ต่อเมื่อกรมทางหลวงตอกเสาเข็มและก่อสร้างฐานรากเสร็จสิ้นเท่านั้น)",
    type: "warning",
  },
  {
    id: 5,
    name: "งานก่อสร้างระบบจำหน่ายรองรับ สถานีไฟฟ้าสุพรรณบุรี 2",
    wbs: "P-TDD02.3-I-SPINA.0001 - .0013",
    distance: "หลายช่วง",
    target: "ไตรมาส 4/69",
    status: "ดำเนินการตามแผน",
    progress: 100,
    note: "หลายช่วงดำเนินการเสร็จสิ้น (100%) และบางส่วนรอปิดงาน",
    type: "normal",
  },
  {
    id: 6,
    name: "ย้ายแนว 115 เควี บริเวณแยกแก่งเสี้ยน จ.กาญจนบุรี",
    wbs: "รอ กวว. Interphase งาน",
    distance: "0.285 กม.",
    target: "ยกเลิก",
    status: "ยกเลิกไม่ทำ",
    progress: 0,
    note: "กรมทางหลวงยังเวนคืนที่ดินไม่เรียบร้อย กรมที่ดินมาวัดแนวเขตวันที่ 8 เม.ย.69 (ยกเลิกไฟแดง และก่อสร้างถนนวงเวียน)",
    type: "cancelled",
  },
];

export default function ImportantTasksPage() {
  const [projectData, setProjectData] = useState<any[]>(defaultProjects);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name?: string;
    wbs?: string;
    distance?: string;
    target?: string;
    status?: string;
    progress?: number;
    note?: string;
    type?: string;
    monthlyProgress?: { id: number; month: string; progress: number; note: string }[];
  }>({});
  const [dbId, setDbId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedProjects(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('wbs', 'IMPORTANT_TASKS_2026')
        .single();
        
      if (data && data.remarks) {
        const parsed = JSON.parse(data.remarks);
        const hasFullData = Object.values(parsed).some((p: any) => p && p.name);
        
        let loadedProjects = [];
        if (hasFullData) {
          loadedProjects = Object.keys(parsed).map(key => ({
            id: Number(key),
            ...parsed[key]
          })).sort((a, b) => a.id - b.id);
        } else {
          loadedProjects = defaultProjects.map(p => ({
            ...p,
            ...(parsed[p.id] || {})
          }));
        }
        setProjectData(loadedProjects);
        setDbId(data.id);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const startEdit = (proj: any) => {
    setEditingId(proj.id);
    setEditForm({
      name: proj.name,
      wbs: proj.wbs,
      distance: proj.distance,
      target: proj.target,
      status: proj.status,
      progress: proj.progress || 0,
      note: proj.note,
      type: proj.type,
      monthlyProgress: proj.monthlyProgress || [],
    });
  };

  const cancelEdit = () => {
    const editingProj = projectData.find(p => p.id === editingId);
    if (editingProj && !editingProj.name && !editingProj.wbs) {
      setProjectData(projectData.filter(p => p.id !== editingId));
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleAddProject = () => {
    const newId = Date.now();
    const newProject = {
      id: newId,
      name: "",
      wbs: "",
      distance: "",
      target: "",
      status: "รอดำเนินการ",
      progress: 0,
      note: "",
      type: "normal",
      monthlyProgress: []
    };
    setProjectData([newProject, ...projectData]);
    startEdit(newProject);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณต้องการลบโครงการนี้ใช่หรือไม่?')) return;
    
    setIsSaving(true);
    const updatedData = projectData.filter(p => p.id !== id);
    setProjectData(updatedData);
    
    try {
      const changesToSave = updatedData.reduce((acc: any, curr) => {
        acc[curr.id] = { 
          name: curr.name,
          wbs: curr.wbs,
          distance: curr.distance,
          target: curr.target,
          status: curr.status, 
          note: curr.note, 
          progress: curr.progress,
          type: curr.type,
          monthlyProgress: curr.monthlyProgress || []
        };
        return acc;
      }, {});
      
      const payload = {
        wbs: 'IMPORTANT_TASKS_2026',
        name: 'Important Tasks 2026 Tracker',
        remarks: JSON.stringify(changesToSave)
      };
      
      if (dbId) {
        await supabase.from('projects').update(payload).eq('id', dbId);
      } else {
        const { data } = await supabase.from('projects').insert(payload).select().single();
        if (data) setDbId(data.id);
      }
    } catch (err) {
      console.error("Error deleting data:", err);
    }
    
    setIsSaving(false);
    if (editingId === id) setEditingId(null);
  };

  const handleSave = async (id: number) => {
    setIsSaving(true);
    const updatedData = projectData.map(p => p.id === id ? { ...p, ...editForm } : p);
    setProjectData(updatedData);
    
    try {
      const changesToSave = updatedData.reduce((acc: any, curr) => {
        acc[curr.id] = { 
          name: curr.name,
          wbs: curr.wbs,
          distance: curr.distance,
          target: curr.target,
          status: curr.status, 
          note: curr.note, 
          progress: curr.progress,
          type: curr.type,
          monthlyProgress: curr.monthlyProgress || []
        };
        return acc;
      }, {});
      
      const payload = {
        wbs: 'IMPORTANT_TASKS_2026',
        name: 'Important Tasks 2026 Tracker',
        remarks: JSON.stringify(changesToSave)
      };
      
      if (dbId) {
        await supabase.from('projects').update(payload).eq('id', dbId);
      } else {
        const { data } = await supabase.from('projects').insert(payload).select().single();
        if (data) setDbId(data.id);
      }
    } catch (err) {
      console.error("Error saving data:", err);
    }
    
    setIsSaving(false);
    setEditingId(null);
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "urgent": return <AlertTriangle size={24} className="text-red-600" />;
      case "warning": return <AlertCircle size={24} className="text-yellow-600" />;
      case "normal": return <CheckCircle2 size={24} className="text-green-600" />;
      case "cancelled": return <XCircle size={24} className="text-gray-500" />;
      default: return null;
    }
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case "urgent": return { borderTop: "4px solid #ef4444", backgroundColor: "#fef2f2" };
      case "warning": return { borderTop: "4px solid #eab308", backgroundColor: "#fefce8" };
      case "normal": return { borderTop: "4px solid #22c55e", backgroundColor: "#f0fdf4" };
      case "cancelled": return { borderTop: "4px solid #6b7280", backgroundColor: "#f9fafb" };
      default: return {};
    }
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "0 0 40px 0" }}>
      <TopBar title="ระบบติดตามงานสำคัญ (ปี 2569)" />
      
      <div style={{ padding: "24px 32px" }}>
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
              ภาพรวมงานที่ต้องเร่งรัด
            </h2>
            <p style={{ color: "#64748b" }}>
              ข้อมูลอ้างอิงจากแฟ้มการประชุม แผนก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา (กฟก.3)
            </p>
          </div>
          <button
            onClick={handleAddProject}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "#2563eb", color: "white",
              padding: "8px 16px", borderRadius: "8px",
              fontWeight: "600", fontSize: "0.95rem",
              border: "none", cursor: "pointer",
              boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
              marginTop: "4px"
            }}
          >
            <Plus size={18} /> เพิ่มโครงการ
          </button>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", 
          gap: "24px" 
        }}>
          {projectData.map((proj) => {
            const isEditing = editingId === proj.id;
            
            return (
              <div 
                key={proj.id} 
                style={{
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  ...getCardStyle(proj.type)
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {getStatusIcon(proj.type)}
                    {isEditing ? (
                      <select 
                        value={editForm.type}
                        onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                        style={{ padding: "2px 4px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      >
                        <option value="urgent">ต้องเร่งรัดด่วน</option>
                        <option value="warning">ติดอุปสรรค</option>
                        <option value="normal">ปกติ</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                    ) : (
                      <span style={{ 
                        fontWeight: "600", 
                        fontSize: "0.9rem",
                        color: proj.type === "urgent" ? "#b91c1c" : 
                               proj.type === "warning" ? "#a16207" : 
                               proj.type === "normal" ? "#15803d" : "#4b5563",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        {proj.type === "urgent" ? "ต้องเร่งรัดด่วน" : 
                         proj.type === "warning" ? "ติดอุปสรรค" : 
                         proj.type === "normal" ? "ปกติ" : "ยกเลิก"}
                      </span>
                    )}
                  </div>
                  
                  {!isEditing ? (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button 
                        onClick={() => startEdit(proj)}
                        style={{ 
                          display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", 
                          color: "#3b82f6", backgroundColor: "white", border: "1px solid #bfdbfe", 
                          padding: "4px 8px", borderRadius: "12px", cursor: "pointer", fontWeight: "600"
                        }}
                      >
                        <Edit2 size={12} /> แก้ไข
                      </button>
                      <button 
                        onClick={() => handleDelete(proj.id)}
                        style={{ 
                          display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", 
                          color: "#ef4444", backgroundColor: "white", border: "1px solid #fecaca", 
                          padding: "4px 8px", borderRadius: "12px", cursor: "pointer", fontWeight: "600"
                        }}
                        title="ลบโครงการ"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button 
                        onClick={() => handleSave(proj.id)}
                        disabled={isSaving}
                        style={{ 
                          display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", 
                          color: "white", backgroundColor: "#22c55e", border: "none", 
                          padding: "4px 8px", borderRadius: "12px", cursor: "pointer", fontWeight: "600"
                        }}
                      >
                        <Save size={12} /> {isSaving ? "..." : "บันทึก"}
                      </button>
                      <button 
                        onClick={cancelEdit}
                        style={{ 
                          display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", 
                          color: "#ef4444", backgroundColor: "white", border: "1px solid #fecaca", 
                          padding: "4px 8px", borderRadius: "12px", cursor: "pointer", fontWeight: "600"
                        }}
                      >
                        <X size={12} /> ยกเลิก
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "1rem", fontWeight: "600", marginBottom: "12px", minHeight: "60px", resize: "vertical" }}
                  />
                ) : (
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#0f172a", marginBottom: "12px", lineHeight: "1.4" }}>
                    {proj.name}
                  </h3>
                )}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", flex: 1 }}>
                  <div style={{ display: "flex", fontSize: "0.9rem", alignItems: isEditing ? "center" : "flex-start", marginBottom: isEditing ? "4px" : "0" }}>
                    <span style={{ color: "#64748b", width: "90px" }}>WBS:</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.wbs} 
                        onChange={(e) => setEditForm({...editForm, wbs: e.target.value})}
                        style={{ flex: 1, padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                      />
                    ) : (
                      <span style={{ fontWeight: "500", color: "#334155" }}>{proj.wbs}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", fontSize: "0.9rem", alignItems: isEditing ? "center" : "flex-start", marginBottom: isEditing ? "4px" : "0" }}>
                    <span style={{ color: "#64748b", width: "90px" }}>ระยะทาง:</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.distance} 
                        onChange={(e) => setEditForm({...editForm, distance: e.target.value})}
                        style={{ flex: 1, padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                      />
                    ) : (
                      <span style={{ fontWeight: "500", color: "#334155" }}>{proj.distance}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", fontSize: "0.9rem", alignItems: isEditing ? "center" : "flex-start", marginBottom: isEditing ? "4px" : "0" }}>
                    <span style={{ color: "#64748b", width: "90px" }}>เป้าหมาย:</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.target} 
                        onChange={(e) => setEditForm({...editForm, target: e.target.value})}
                        style={{ flex: 1, padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                      />
                    ) : (
                      <span style={{ fontWeight: "500", color: "#334155" }}>{proj.target}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", fontSize: "0.9rem", alignItems: isEditing ? "center" : "flex-start" }}>
                    <span style={{ color: "#64748b", width: "90px", marginTop: isEditing ? "0" : "0" }}>สถานะ:</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.status} 
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        style={{ flex: 1, padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                      />
                    ) : (
                      <span style={{ fontWeight: "600", color: "#0f172a" }}>{proj.status}</span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "8px", alignItems: "center" }}>
                    <span style={{ color: "#64748b", fontWeight: "500" }}>ความคืบหน้า (%)</span>
                    {isEditing ? (
                      <input 
                        type="number" 
                        min="0" max="100" step="0.01"
                        value={editForm.progress} 
                        onChange={(e) => setEditForm({...editForm, progress: Number(e.target.value)})}
                        style={{ width: "70px", padding: "2px 4px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textAlign: "right" }}
                      />
                    ) : (
                      <span style={{ fontWeight: "600", color: "#0f172a" }}>{proj.progress}%</span>
                    )}
                  </div>
                  <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ 
                      height: "100%", 
                      width: `${isEditing ? editForm.progress : proj.progress}%`, 
                      backgroundColor: (isEditing ? editForm.progress : proj.progress) === 100 ? "#22c55e" : "#3b82f6",
                      borderRadius: "4px",
                      transition: "width 0.3s ease"
                    }}></div>
                  </div>
                </div>

                <div style={{ 
                  backgroundColor: "rgba(255,255,255,0.6)", 
                  padding: "12px", 
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  fontSize: "0.85rem",
                  color: "#475569",
                  lineHeight: "1.5"
                }}>
                  <span style={{ fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>ข้อสังเกต / อุปสรรค:</span>
                  {isEditing ? (
                    <textarea 
                      value={editForm.note} 
                      onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                      style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.85rem", minHeight: "60px", resize: "vertical" }}
                    />
                  ) : (
                    <span>{proj.note}</span>
                  )}
                </div>

                {proj.monthlyProgress && proj.monthlyProgress.length > 0 && !isEditing && (
                  <div style={{ marginTop: "16px" }}>
                    <button 
                      onClick={() => toggleExpand(proj.id)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                        backgroundColor: "#f8fafc", padding: "8px 12px", borderRadius: "6px",
                        border: "1px solid #e2e8f0", color: "#475569", fontSize: "0.85rem", fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      <span>ความคืบหน้ารายเดือน ({proj.monthlyProgress.length} รายการ)</span>
                      {expandedProjects.includes(proj.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {expandedProjects.includes(proj.id) && (
                      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {proj.monthlyProgress.map((mp: any) => (
                          <div key={mp.id} style={{ backgroundColor: "white", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontWeight: "600", color: "#334155" }}>{mp.month}</span>
                              <span style={{ fontWeight: "600", color: (mp.progress === 100 ? "#15803d" : "#0f172a") }}>{mp.progress}%</span>
                            </div>
                            {mp.note && <div style={{ color: "#64748b", marginTop: "4px" }}>{mp.note}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isEditing && (
                  <div style={{ marginTop: "16px", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "600", color: "#334155", fontSize: "0.85rem" }}>ความคืบหน้ารายเดือน</span>
                      <button 
                        onClick={() => {
                          const newMp = { id: Date.now(), month: "", progress: 0, note: "" };
                          setEditForm({...editForm, monthlyProgress: [...(editForm.monthlyProgress || []), newMp]});
                        }}
                        style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", backgroundColor: "#3b82f6", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
                      >
                        <Plus size={12} /> เพิ่มเดือน
                      </button>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(editForm.monthlyProgress || []).map((mp, idx) => (
                        <div key={mp.id} style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px", backgroundColor: "white", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input 
                              type="text" placeholder="เดือน (เช่น ม.ค. 69)" value={mp.month}
                              onChange={(e) => {
                                const newMp = [...(editForm.monthlyProgress || [])];
                                newMp[idx].month = e.target.value;
                                setEditForm({...editForm, monthlyProgress: newMp});
                              }}
                              style={{ flex: 1, padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                            />
                            <input 
                              type="number" placeholder="%" value={mp.progress} min="0" max="100" step="0.01"
                              onChange={(e) => {
                                const newMp = [...(editForm.monthlyProgress || [])];
                                newMp[idx].progress = Number(e.target.value);
                                setEditForm({...editForm, monthlyProgress: newMp});
                              }}
                              style={{ width: "60px", padding: "4px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                            />
                            <button 
                              onClick={() => {
                                const newMp = (editForm.monthlyProgress || []).filter((_, i) => i !== idx);
                                setEditForm({...editForm, monthlyProgress: newMp});
                              }}
                              style={{ backgroundColor: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "4px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <input 
                            type="text" placeholder="สถานะ/หมายเหตุ" value={mp.note}
                            onChange={(e) => {
                              const newMp = [...(editForm.monthlyProgress || [])];
                              newMp[idx].note = e.target.value;
                              setEditForm({...editForm, monthlyProgress: newMp});
                            }}
                            style={{ width: "100%", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                          />
                        </div>
                      ))}
                      {(editForm.monthlyProgress || []).length === 0 && (
                        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", padding: "8px 0" }}>ยังไม่มีข้อมูลรายเดือน</div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
