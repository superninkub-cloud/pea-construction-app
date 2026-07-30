"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";

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
      
      // Upload image if selected
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
      
      // Construct new remarks
      let combinedRemarks = oldRemarks;
      if (newRemarks.trim() !== "" || status.trim() !== "") {
        const yearStr = (new Date().getFullYear() + 543).toString().slice(-2);
        let newEntry = `📍 [${selectedMonth} ${yearStr}]`;
        if(status.trim() !== "") newEntry += ` สถานะ: ${status}`;
        if(newRemarks.trim() !== "") newEntry += ` | ${newRemarks.trim()}`;
        
        combinedRemarks = oldRemarks.trim() === "" ? newEntry : newEntry + "\n" + oldRemarks.trim();
      }
      
      // Update DB
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
      
      setMessage({ text: "✅ บันทึกสถานะงานและเช็คลิสท์เรียบร้อยแล้ว", type: "success" });
      setOldRemarks(combinedRemarks);
      setNewRemarks("");
      setFile(null);
      // Refresh global projects list in background
      fetchProjects();
      
    } catch (error: any) {
      console.error(error);
      setMessage({ text: `❌ ล้มเหลว: ${error.message}`, type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="animation-fade-in">
      <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
        <div style={{ marginBottom: "20px" }}>
          <label className="form-label">👷 1. กรองตามผู้ควบคุมงาน</label>
          <select className="form-select" value={selectedSupervisor} onChange={(e) => setSelectedSupervisor(e.target.value)}>
            <option value="ALL">-- แสดงทั้งหมด --</option>
            {supervisors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">📌 2. เลือกรหัส WBS / ชื่องานโครงการ</label>
          <select className="form-select" style={{ fontSize: "1.1rem", padding: "12px" }} value={selectedWbs} onChange={(e) => setSelectedWbs(e.target.value)}>
            <option value="">-- เลือกรหัส WBS หรือ ชื่องาน --</option>
            {filteredProjects.map(p => (
              <option key={p.id} value={p.wbs}>[{p.wbs}] {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {project && (
        <div className="project-card">
          <h4 className="wbs-title">{project.wbs}</h4>
          <h5 className="wbs-subtitle">{project.name}</h5>
          
          <div className="info-box">
            <div className="info-item"><strong>👷 ผู้ควบคุมงาน:</strong> <span style={{ color: "var(--pea-purple)", fontWeight: "bold" }}>{project.supervisor}</span></div>
            <div className="info-item"><strong>💼 โครงการ:</strong> {project.project_type || "-"}</div>
            <div className="info-item"><strong>💰 มูลค่า:</strong> <span style={{ color: "#10b981", fontWeight: "bold" }}>{(project.value || 0).toLocaleString()}</span> บาท</div>
            <div className="info-item"><strong>📅 ปีเปิดงาน:</strong> {project.open_year || "-"} ({project.year_criteria || "-"})</div>
            <div className="info-item" style={{ gridColumn: "1 / -1", marginTop: "8px" }}>
              {project.p_tracking === "ติดตาม" ? (
                <span className="badge" style={{ background: "#ef4444", color: "white" }}>🚨 สาย ป ติดตาม</span>
              ) : (
                <span className="badge" style={{ background: "#f1f5f9", border: "1px solid #cbd5e1" }}>✅ สาย ป ไม่ติดตาม</span>
              )}
            </div>
          </div>
          
          <hr style={{ borderColor: "#e2e8f0", margin: "30px 0" }} />
          <h5 style={{ color: "var(--pea-purple-light)", marginBottom: "20px", fontWeight: "600" }}>อัพเดทข้อมูลสถานะทั่วไป (บันทึกประวัติรายเดือน)</h5>
          
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
            <label className="form-label" style={{ color: "#10b981" }}>📝 อัพเดทความคืบหน้าใหม่</label>
            <textarea 
              className="form-control" 
              rows={2} 
              placeholder="พิมพ์ความคืบหน้าของเดือนนี้ ระบบจะนำไปต่อทับประวัติเดิมให้อัตโนมัติ..."
              value={newRemarks}
              onChange={(e) => setNewRemarks(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label className="form-label" style={{ color: "#64748b" }}>🕒 ประวัติหมายเหตุเดิมทั้งหมด</label>
            <textarea 
              className="form-control" 
              rows={4} 
              style={{ backgroundColor: "#f8fafc", color: "#475569", fontSize: "0.85rem" }}
              value={oldRemarks}
              disabled
            />
          </div>

          <hr style={{ borderColor: "#e2e8f0", margin: "30px 0" }} />
          <h5 style={{ color: "var(--pea-purple-light)", marginBottom: "20px", fontWeight: "600" }}>✅ เช็คลิสท์ความคืบหน้าโครงการ</h5>
          
          <div className="checklist-grid">
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
                <label htmlFor={chk.id} style={{ cursor: "pointer", userSelect: "none" }}>{chk.label}</label>
              </div>
            ))}
          </div>

          <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginTop: "24px", marginBottom: "24px" }}>
            <label className="form-label">📷 อัพโหลดภาพถ่ายหน้างาน (ไม่บังคับ)</label>
            <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
            {previewUrl && (
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px", border: "2px dashed #cbd5e1", padding: "4px" }} />
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="btn btn-pea" onClick={handleSubmit} disabled={loading}>
              {loading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูลและรูปภาพ"}
            </button>
            {message.text && (
              <div style={{ padding: "10px 16px", borderRadius: "8px", background: message.type === "success" ? "#d1fae5" : "#fee2e2", color: message.type === "success" ? "#065f46" : "#991b1b", fontWeight: "500" }}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
