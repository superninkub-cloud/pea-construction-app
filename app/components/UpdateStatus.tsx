"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";
import TopBar from "./TopBar";

export default function UpdateStatus() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<string[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("ALL");
  const [selectedWbs, setSelectedWbs] = useState("");
  
  const [project, setProject] = useState<Project | null>(null);
  
  // Form State
  const [status, setStatus] = useState("");
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
            <select className="form-select" style={{ fontWeight: '600', color: 'var(--pea-purple)' }} value={selectedWbs} onChange={(e) => setSelectedWbs(e.target.value)}>
              <option value="">-- เลือกรหัส WBS หรือ ชื่องาน --</option>
              {filteredProjects.map(p => (
                <option key={p.id} value={p.wbs}>[{p.wbs}] {p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {project && (
          <div className="card">
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px' }}>
               <h4 style={{ color: "var(--pea-purple)", fontSize: "1.5rem", fontWeight: "700", marginBottom: "4px" }}>{project.wbs}</h4>
               <h5 style={{ color: "var(--text-dark)", fontSize: "1.1rem", fontWeight: "500" }}>{project.name}</h5>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div><strong style={{ color: 'var(--text-light)' }}>ผู้ควบคุมงาน:</strong> <br/><span style={{ fontWeight: '600' }}>{project.supervisor}</span></div>
              <div><strong style={{ color: 'var(--text-light)' }}>ประเภทโครงการ:</strong> <br/><span style={{ fontWeight: '500' }}>{project.project_type || "-"}</span></div>
              <div><strong style={{ color: 'var(--text-light)' }}>มูลค่า:</strong> <br/><span style={{ fontWeight: '600', color: '#047857' }}>{(project.value || 0).toLocaleString()}</span> บาท</div>
              <div><strong style={{ color: 'var(--text-light)' }}>ปีเปิดงาน:</strong> <br/><span style={{ fontWeight: '500' }}>{project.open_year || "-"} ({project.year_criteria || "-"})</span></div>
            </div>
            
            <h5 style={{ color: "var(--pea-purple)", marginBottom: "16px", fontWeight: "600", fontSize: '1.1rem' }}>อัพเดทสถานะและการดำเนินงาน</h5>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label className="form-label">สถานะล่าสุด (เช่น C1, F4)</label>
                <input type="text" className="form-control" value={status} onChange={(e) => setStatus(e.target.value)} />
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
              
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ minWidth: '160px' }}>
                {loading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
