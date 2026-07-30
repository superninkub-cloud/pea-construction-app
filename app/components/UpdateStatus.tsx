"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";
import TopBar from "./TopBar";
import { Plus, X } from "lucide-react";

export default function UpdateStatus() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<string[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("ALL");
  const [selectedWbs, setSelectedWbs] = useState("");
  
  const [project, setProject] = useState<Project | null>(null);
  
  // Form State
  const [status, setStatus] = useState("");
  const [projectValue, setProjectValue] = useState("");
  const [pTracking, setPTracking] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("ม.ค.");
  const [newRemarks, setNewRemarks] = useState("");
  const [oldRemarks, setOldRemarks] = useState("");
  const [checks, setChecks] = useState({
    check1: false, check2: false, check3: false, check4: false,
    check5: false, check6: false, check7: false, check8: false
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Add New Project State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ wbs: "", name: "", supervisor: "", project_type: "", value: "", open_year: "", p_tracking: "" });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    const currentMonthIndex = new Date().getMonth();
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    setSelectedMonth(months[currentMonthIndex]);
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*").order("wbs");
    if (error) {
      console.error(error);
    } else {
      const projData = data as Project[];
      setProjects(projData);
      setFilteredProjects(projData);
      const uniqueSups = Array.from(new Set(projData.map(p => p.supervisor || "ไม่มีข้อมูล")));
      setSupervisors(uniqueSups as string[]);
    }
  };

  useEffect(() => {
    if (selectedSupervisor === "ALL") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => (p.supervisor || "ไม่มีข้อมูล") === selectedSupervisor));
    }
    setSelectedWbs("");
    setProject(null);
  }, [selectedSupervisor, projects]);

  useEffect(() => {
    if (selectedWbs) {
      const p = projects.find(x => x.wbs === selectedWbs);
      if (p) {
        setProject(p);
        setStatus(p.status || "");
        setProjectValue(p.value ? p.value.toString() : "");
        setPTracking(p.p_tracking || "");
        setOldRemarks(p.remarks || "");
        setNewRemarks("");
        setChecks({
          check1: p.check1, check2: p.check2, check3: p.check3, check4: p.check4,
          check5: p.check5, check6: p.check6, check7: p.check7, check8: p.check8
        });
        setFile(null);
        setPreviewUrl(p.image_url || "");
        setMessage({ text: "", type: "" });
      }
    } else {
      setProject(null);
    }
  }, [selectedWbs, projects]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!project) return;
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      let imageUrl = project.image_url;
      
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${project.wbs}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("project_images")
          .upload(fileName, file, { cacheControl: '3600', upsert: false });
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from("project_images").getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
      
      let combinedRemarks = oldRemarks;
      if (newRemarks.trim() !== "" || status.trim() !== "") {
        const yearStr = (new Date().getFullYear() + 543).toString().slice(-2);
        let newEntry = `📍 [${selectedMonth} ${yearStr}]`;
        if(status.trim() !== "") newEntry += ` สถานะ: ${status}`;
        if(newRemarks.trim() !== "") newEntry += ` | ${newRemarks.trim()}`;
        
        combinedRemarks = oldRemarks.trim() === "" ? newEntry : newEntry + "\n" + oldRemarks.trim();
      }
      
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status,
          value: Number(projectValue) || 0,
          p_tracking: pTracking,
          remarks: combinedRemarks,
          image_url: imageUrl,
          ...checks,
          updated_at: new Date().toISOString()
        })
        .eq("id", project.id);
        
      if (updateError) throw updateError;
      
      setMessage({ text: "บันทึกสถานะงานและเช็คลิสท์เรียบร้อยแล้ว", type: "success" });
      setOldRemarks(combinedRemarks);
      setNewRemarks("");
      setFile(null);
      fetchProjects();
      
    } catch (error: any) {
      console.error(error);
      setMessage({ text: `ล้มเหลว: ${error.message}`, type: "error" });
    }
    setLoading(false);
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบโครงการ ${project.wbs}? ข้อมูลทั้งหมดของโครงการนี้จะหายไป`)) {
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("projects").delete().eq("id", project.id);
      if (error) throw error;
      
      alert("ลบโครงการเรียบร้อยแล้ว");
      setProject(null);
      setSelectedWbs("");
      fetchProjects();
    } catch (error: any) {
      console.error(error);
      alert(`ลบล้มเหลว: ${error.message}`);
    }
    setLoading(false);
  };

  const handleAddNewProject = async () => {
    if (!newProject.wbs || !newProject.name) {
      alert("กรุณากรอกรหัส WBS และชื่องานให้ครบถ้วน");
      return;
    }
    setAddLoading(true);
    try {
      const { error } = await supabase.from("projects").insert({
        wbs: newProject.wbs,
        name: newProject.name,
        supervisor: newProject.supervisor,
        project_type: newProject.project_type,
        value: Number(newProject.value) || 0,
        open_year: newProject.open_year,
        p_tracking: newProject.p_tracking,
        status: "",
        remarks: ""
      });
      
      if (error) throw error;
      
      setIsAddModalOpen(false);
      setNewProject({ wbs: "", name: "", supervisor: "", project_type: "", value: "", open_year: "", p_tracking: "" });
      fetchProjects();
      alert("เพิ่มงานใหม่เรียบร้อยแล้ว!");
    } catch (error: any) {
      console.error(error);
      alert(`ล้มเหลว: ${error.message}`);
    }
    setAddLoading(false);
  };

  return (
    <>
      <TopBar title="อัพเดทสถานะงาน" />
      <div className="content-area animation-fade-in">
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div>
            <label className="form-label">👷 กรองตามผู้ควบคุมงาน</label>
            <select className="form-select" value={selectedSupervisor} onChange={(e) => setSelectedSupervisor(e.target.value)}>
              <option value="ALL">-- แสดงทั้งหมด --</option>
              {supervisors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">📌 เลือกรหัส WBS / ชื่องานโครงการ</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select className="form-select" style={{ fontWeight: '600', color: 'var(--pea-purple)', flex: 1 }} value={selectedWbs} onChange={(e) => setSelectedWbs(e.target.value)}>
                <option value="">-- หรือคลิกเลือกจากรายการด้านล่าง --</option>
                {filteredProjects.map(p => (
                  <option key={p.id} value={p.wbs}>[{p.wbs}] {p.name} - สถานะ: {p.status || "-"}</option>
                ))}
              </select>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={18} /> เพิ่มงานใหม่
              </button>
            </div>
          </div>
        </div>

        {project ? (
          <div className="card">
            <button onClick={() => setSelectedWbs("")} className="btn" style={{ marginBottom: '20px', background: '#f8fafc', color: 'var(--text-dark)', border: '1px solid var(--border-color)', fontSize: '0.9rem', padding: '8px 16px' }}>
              ⬅️ ย้อนกลับไปหน้ารายการ
            </button>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px' }}>
               <h4 style={{ color: "var(--pea-purple)", fontSize: "1.5rem", fontWeight: "700", marginBottom: "4px" }}>{project.wbs}</h4>
               <h5 style={{ color: "var(--text-dark)", fontSize: "1.1rem", fontWeight: "500" }}>{project.name}</h5>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div><strong style={{ color: 'var(--text-light)' }}>ผู้ควบคุมงาน:</strong> <br/><span style={{ fontWeight: '600' }}>{project.supervisor}</span></div>
              <div><strong style={{ color: 'var(--text-light)' }}>ประเภทโครงการ:</strong> <br/><span style={{ fontWeight: '500' }}>{project.project_type || "-"}</span></div>
              <div>
                <strong style={{ color: 'var(--text-light)' }}>มูลค่า:</strong> <br/>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ maxWidth: '130px', padding: '4px 8px' }} 
                    value={projectValue} 
                    onChange={(e) => setProjectValue(e.target.value)} 
                  />
                  <span style={{ fontWeight: '600', color: '#047857' }}>บาท</span>
                </div>
              </div>
              <div><strong style={{ color: 'var(--text-light)' }}>ปีเปิดงาน:</strong> <br/><span style={{ fontWeight: '500' }}>{project.open_year || "-"} ({project.year_criteria || "-"})</span></div>
            </div>
            
            <h5 style={{ color: "var(--pea-purple)", marginBottom: "16px", fontWeight: "600", fontSize: '1.1rem' }}>อัพเดทสถานะและการดำเนินงาน</h5>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label className="form-label">สถานะล่าสุด (เช่น C1, F4)</label>
                <input type="text" className="form-control" value={status} onChange={(e) => setStatus(e.target.value)} />
              </div>
              <div>
                <label className="form-label">🚨 สถานะ สาย ป. ติดตาม</label>
                <select className="form-select" value={pTracking} onChange={(e) => setPTracking(e.target.value)}>
                  <option value="">-- ไม่ได้ติดตาม --</option>
                  <option value="ติดตาม">ติดตาม (ทั่วไป)</option>
                  <option value="งานกลุ่ม 1 งานก่อนปี 68 ที่ตกแผน สาย ป ติดตาม">งานกลุ่ม 1 งานก่อนปี 68 ที่ตกแผน สาย ป ติดตาม</option>
                </select>
              </div>
              <div>
                <label className="form-label">📅 ประจำเดือน</label>
                <select className="form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  {["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">📝 อัพเดทความคืบหน้าใหม่</label>
              <textarea 
                className="form-control" 
                rows={2} 
                placeholder="พิมพ์รายละเอียดที่นี่... (จะไปต่อท้ายประวัติเดิมโดยอัตโนมัติ)"
                value={newRemarks}
                onChange={(e) => setNewRemarks(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label className="form-label" style={{ color: 'var(--text-light)' }}>🕒 ประวัติหมายเหตุเดิมทั้งหมด</label>
              <textarea 
                className="form-control" 
                rows={4} 
                style={{ backgroundColor: "#f8fafc", color: "var(--text-light)", fontSize: "0.85rem" }}
                value={oldRemarks}
                disabled
              />
            </div>

            <h5 style={{ color: "var(--pea-purple)", marginBottom: "16px", fontWeight: "600", fontSize: '1.1rem' }}>ตรวจสอบเช็คลิสท์</h5>
            
            <div className="checklist-grid" style={{ marginBottom: '32px' }}>
              {[
                { id: "check1", label: "ก่อสร้างเสร็จ" },
                { id: "check2", label: "ส่งคืนเศษสายแล้ว" },
                { id: "check3", label: "ส่งคืนเศษเหล็กแล้ว" },
                { id: "check4", label: "ทำ PM/ADS แล้ว" },
                { id: "check5", label: "ตรวจมาตรฐานแล้ว" },
                { id: "check6", label: "ใบสำคัญจ่ายครบแล้ว" },
                { id: "check7", label: "ขออนุมัติโอนงบแล้ว" },
                { id: "check8", label: "ปรับแบบแผนผังแล้ว" }
              ].map((chk, i) => (
                <div key={chk.id} className="check-item">
                  <input 
                    type="checkbox" 
                    id={chk.id}
                    checked={checks[chk.id as keyof typeof checks]}
                    onChange={(e) => setChecks({...checks, [chk.id]: e.target.checked})}
                  />
                  <label htmlFor={chk.id} style={{ cursor: "pointer", userSelect: "none", fontSize: '0.95rem' }}>{chk.label}</label>
                </div>
              ))}
            </div>

            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "16px", border: "1px dashed #cbd5e1", marginBottom: "32px", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: '12px' }}>📷 อัพโหลดภาพถ่ายหน้างาน (ไม่บังคับ)</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} style={{ maxWidth: '400px' }} />
              {previewUrl && (
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "12px", border: "4px solid white", boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between' }}>
              {message.text ? (
                <div style={{ padding: "12px 20px", borderRadius: "10px", background: message.type === "success" ? "#d1fae5" : "#fee2e2", color: message.type === "success" ? "#047857" : "#b91c1c", fontWeight: "500", flex: 1, marginRight: '20px' }}>
                  {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
                </div>
              ) : <div></div>}
              
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn" onClick={handleDeleteProject} disabled={loading} style={{ minWidth: '140px', background: '#fee2e2', color: '#b91c1c' }}>
                  🗑️ ลบโครงการ
                </button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ minWidth: '160px' }}>
                  {loading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredProjects.map(p => {
               const steps = [p.check1, p.check2, p.check3, p.check4, p.check5, p.check6, p.check7, p.check8];
               const doneCount = steps.filter(Boolean).length;
               const progressPercent = (doneCount / 8) * 100;
               return (
                 <div 
                   key={p.id} 
                   className="card" 
                   style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', cursor: 'pointer', border: '1px solid #e2e8f0' }} 
                   onClick={() => setSelectedWbs(p.wbs)}
                   onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--pea-purple)'}
                   onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                 >
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--pea-purple)' }}>{p.wbs}</span>
                      <span className={`badge ${p.status === "F4" ? "badge-success" : "badge-warning"}`}>{p.status || "-"}</span>
                   </div>
                   <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '8px', flex: 1, color: 'var(--text-dark)' }}>{p.name}</div>
                   <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginBottom: '16px' }}>ผู้ควบคุมงาน: {p.supervisor}</div>
                   
                   <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '6px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: progressPercent === 100 ? '#10b981' : 'var(--pea-purple)' }}></div>
                   </div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'right' }}>ความคืบหน้า {doneCount}/8 ขั้นตอน</div>
                 </div>
               )
            })}
            {filteredProjects.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                ยังไม่มีข้อมูลโครงการ กรุณานำเข้าข้อมูลจาก Supabase ก่อนครับ
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add New Project Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card animation-fade-in" style={{ width: '100%', maxWidth: '600px', margin: 0, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setIsAddModalOpen(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
            >
              <X />
            </button>
            
            <h3 style={{ color: 'var(--pea-purple)', marginBottom: '24px', fontWeight: 'bold' }}>➕ เพิ่มข้อมูลงานก่อสร้างใหม่</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="form-label">📌 รหัส WBS *</label>
                <input type="text" className="form-control" value={newProject.wbs} onChange={e => setNewProject({...newProject, wbs: e.target.value})} placeholder="เช่น I-63-I-..." />
              </div>
              <div>
                <label className="form-label">👷 ผู้ควบคุมงาน</label>
                <input type="text" className="form-control" value={newProject.supervisor} onChange={e => setNewProject({...newProject, supervisor: e.target.value})} placeholder="ชื่อผู้คุมงาน" />
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">📝 ชื่องานโครงการ *</label>
              <textarea className="form-control" rows={2} value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder="เช่น ยน.ขยายเขต..."></textarea>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="form-label">ประเภทโครงการ</label>
                <input type="text" className="form-control" value={newProject.project_type} onChange={e => setNewProject({...newProject, project_type: e.target.value})} placeholder="เช่น ขยายเขต" />
              </div>
              <div>
                <label className="form-label">มูลค่างาน (บาท)</label>
                <input type="number" className="form-control" value={newProject.value} onChange={e => setNewProject({...newProject, value: e.target.value})} placeholder="0" />
              </div>
              <div>
                <label className="form-label">📅 ปีที่เปิดงาน</label>
                <input type="text" className="form-control" value={newProject.open_year} onChange={e => setNewProject({...newProject, open_year: e.target.value})} placeholder="เช่น 2567" />
              </div>
              <div>
                <label className="form-label">🚨 สาย ป. ติดตาม</label>
                <select className="form-select" value={newProject.p_tracking} onChange={e => setNewProject({...newProject, p_tracking: e.target.value})}>
                  <option value="">-- ไม่ระบุ --</option>
                  <option value="ติดตาม">ติดตาม (ทั่วไป)</option>
                  <option value="งานกลุ่ม 1 งานก่อนปี 68 ที่ตกแผน สาย ป ติดตาม">งานกลุ่ม 1 งานก่อนปี 68 ที่ตกแผน สาย ป ติดตาม</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button className="btn" onClick={() => setIsAddModalOpen(false)} style={{ background: '#f1f5f9', color: 'var(--text-dark)' }}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleAddNewProject} disabled={addLoading || !newProject.wbs || !newProject.name}>
                {addLoading ? "กำลังบันทึก..." : "💾 บันทึกงานใหม่"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
