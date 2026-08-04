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
  const [actionPlan, setActionPlan] = useState("");
  const [closingPlan, setClosingPlan] = useState("");
  const [constructionType, setConstructionType] = useState("1");
  const [progTargets, setProgTargets] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [progDone, setProgDone] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [manualProgress, setManualProgress] = useState<number>(0);
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
  const [userRole, setUserRole] = useState("user");

  // Add New Project State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ wbs: "", name: "", supervisor: "", project_type: "", value: "", open_year: "", p_tracking: "" });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    const currentMonthIndex = new Date().getMonth();
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    setSelectedMonth(months[currentMonthIndex]);
    const role = sessionStorage.getItem("pea_role");
    if (role) setUserRole(role);
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*").order("wbs");
    if (error) {
      console.error(error);
    } else {
      let projData = data as Project[];
      projData = projData.filter((p) => {
        if (
          (p.wbs && (p.wbs.includes("IMPORTANT_TASKS") || p.wbs.includes("SAFETY_PLAN"))) ||
          (p.name && (p.name.includes("Important Tasks") || p.name.includes("Safety Training")))
        ) {
          return false;
        }
        return true;
      });
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
        setActionPlan(p.action_plan || "");
        setClosingPlan(p.closing_plan || "");
        setConstructionType(p.construction_type || "1");
        setProgTargets([
          p.step1_target || 0,
          p.step2_target || 0,
          p.step3_target || 0,
          p.step4_target || 0,
          p.step5_target || 0,
          p.step6_target || 0
        ]);
        setProgDone([
          p.step1_done || 0,
          p.step2_done || 0,
          p.step3_done || 0,
          p.step4_done || 0,
          p.step5_done || 0,
          p.step6_done || 0
        ]);
        setManualProgress(p.manual_progress || 0);

        // Clean up duplicate month markers in existing remarks
        let cleanedRemarks = p.remarks || "";
        if (cleanedRemarks) {
          const lines = cleanedRemarks.split('\n');
          const seenMarkers = new Set<string>();
          const newLines: string[] = [];
          for (const line of lines) {
            const match = line.match(/^(📍 \[[^\]]+\])/);
            if (match) {
              const marker = match[1];
              if (!seenMarkers.has(marker)) {
                seenMarkers.add(marker);
                newLines.push(line);
              }
            } else {
              newLines.push(line);
            }
          }
          cleanedRemarks = newLines.join('\n');
        }
        
        setOldRemarks(cleanedRemarks);
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
        const monthPrefix = `📍 [${selectedMonth} ${yearStr}]`;
        let newEntry = monthPrefix;
        if (status.trim() !== "") newEntry += ` สถานะ: ${status}`;
        if (newRemarks.trim() !== "") newEntry += ` | ${newRemarks.trim()}`;

        // Prepend new entry
        const tempRemarks = oldRemarks.trim() === "" ? newEntry : newEntry + "\n" + oldRemarks.trim();
        
        // Clean up any duplicates that might have been formed
        const lines = tempRemarks.split('\n');
        const seenMarkers = new Set<string>();
        const newLines: string[] = [];
        for (const line of lines) {
          const match = line.match(/^(📍 \[[^\]]+\])/);
          if (match) {
            const marker = match[1];
            if (!seenMarkers.has(marker)) {
              seenMarkers.add(marker);
              newLines.push(line);
            }
          } else {
            newLines.push(line);
          }
        }
        combinedRemarks = newLines.join('\n');
      }

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status,
          value: Number(projectValue) || 0,
          p_tracking: pTracking,
          action_plan: actionPlan,
          closing_plan: closingPlan,
          construction_type: constructionType,
          step1_target: progTargets[0],
          step1_done: progDone[0],
          step2_target: progTargets[1],
          step2_done: progDone[1],
          step3_target: progTargets[2],
          step3_done: progDone[2],
          step4_target: progTargets[3],
          step4_done: progDone[3],
          step5_target: progTargets[4],
          step5_done: progDone[4],
          step6_target: progTargets[5],
          step6_done: progDone[5],
          manual_progress: manualProgress,
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
              <div><strong style={{ color: 'var(--text-light)' }}>ผู้ควบคุมงาน:</strong> <br /><span style={{ fontWeight: '600' }}>{project.supervisor}</span></div>
              <div><strong style={{ color: 'var(--text-light)' }}>ประเภทโครงการ:</strong> <br /><span style={{ fontWeight: '500' }}>{project.project_type || "-"}</span></div>
              <div>
                <strong style={{ color: 'var(--text-light)' }}>มูลค่า:</strong> <br />
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
              <div><strong style={{ color: 'var(--text-light)' }}>ปีเปิดงาน:</strong> <br /><span style={{ fontWeight: '500' }}>{project.open_year || "-"} ({project.year_criteria || "-"})</span></div>
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
              {userRole === "admin" && (
                <>
                  <div>
                    <label className="form-label">แผนปฏิบัติการ</label>
                    <select className="form-select" value={actionPlan} onChange={(e) => setActionPlan(e.target.value)}>
                      <option value="">-- ไม่ได้กำหนด --</option>
                      <option value="ยังไม่ดำเนินการ">ยังไม่ดำเนินการ</option>
                      <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 1">ก่อสร้างแล้วเสร็จภายในไตรมาส 1</option>
                      <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 2">ก่อสร้างแล้วเสร็จภายในไตรมาส 2</option>
                      <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 3">ก่อสร้างแล้วเสร็จภายในไตรมาส 3</option>
                      <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 4">ก่อสร้างแล้วเสร็จภายในไตรมาส 4</option>
                      <option value="ไม่เสร็จในปี 2569">ไม่เสร็จในปี 2569</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">แผนปิดงาน</label>
                    <select className="form-select" value={closingPlan} onChange={(e) => setClosingPlan(e.target.value)}>
                      <option value="">-- ไม่ได้กำหนด --</option>
                      {["ม.ค. 69", "ก.พ. 69", "มี.ค. 69", "เม.ย. 69", "พ.ค. 69", "มิ.ย. 69", "ก.ค. 69", "ส.ค. 69", "ก.ย. 69", "ต.ค. 69", "พ.ย. 69", "ธ.ค. 69"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
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

            <h5 style={{ color: "var(--pea-purple)", marginBottom: "16px", fontWeight: "600", fontSize: '1.1rem' }}>ความก้าวหน้างานก่อสร้าง (หน้างาน)</h5>
            <div style={{ marginBottom: "32px", padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">รูปแบบลักษณะงานก่อสร้าง</label>
                <select className="form-select" value={constructionType} onChange={(e) => {
                  setConstructionType(e.target.value);
                  // Reset steps that are not applicable to 0? Or just let them be, the weight will be 0 anyway.
                }}>
                  <option value="1">รูปแบบที่ 1: มีครบ 6 ขั้นตอน</option>
                  <option value="2">รูปแบบที่ 2: ไม่มีพาดสายแรงต่ำ และไม่มีรื้อถอน (4 ขั้นตอน)</option>
                  <option value="3">รูปแบบที่ 3: ไม่มีพาดสายแรงต่ำ แต่มีรื้อถอน (5 ขั้นตอน)</option>
                  <option value="4">รูปแบบที่ 4: เฉพาะงานติดตั้งอุปกรณ์หัวเสาและงานพาดสายแรงสูง</option>
                  <option value="5">รูปแบบที่ 5: ประเมินความก้าวหน้ารวมเอง (%)</option>
                </select>
              </div>

              {constructionType === "5" ? (
                <div style={{ marginBottom: "16px", padding: "16px", background: "#fff", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                  <label className="form-label" style={{ fontSize: "0.95rem", marginBottom: "8px" }}>ความก้าวหน้างานก่อสร้างโดยรวม (ประเมินเอง)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '300px' }}>
                    <input
                      type="number"
                      min="0" max="100"
                      className="form-control"
                      value={manualProgress || ""}
                      onChange={(e) => setManualProgress(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    />
                    <span style={{ fontWeight: '500', color: 'var(--text-light)' }}>%</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                  {[
                    { label: "1. ขุดหลุมปักเสา", idx: 0, unit: "ต้น" },
                    { label: "2. ปักเสา", idx: 1, unit: "ต้น" },
                    { label: "3. ติดตั้งอุปกรณ์ประกอบหัวเสา", idx: 2, unit: "ชุด" },
                    { label: "4. พาดสายแรงสูง", idx: 3, unit: "เมตร" },
                    { label: "5. พาดสายแรงต่ำ", idx: 4, unit: "เมตร" },
                    { label: "6. งานรื้อถอน", idx: 5, unit: "ต้น" }
                  ].map(step => {
                    const weights = constructionType === "2" ? [20, 30, 25, 25, 0, 0] : (constructionType === "3" ? [20, 25, 25, 20, 0, 10] : (constructionType === "4" ? [0, 0, 50, 50, 0, 0] : [15, 25, 20, 20, 10, 10]));
                    const weight = weights[step.idx];
                    if (weight === 0) return null; // Hide if not applicable

                    return (
                      <div key={step.idx} style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="form-label" style={{ fontSize: "0.9rem", marginBottom: "4px" }}>{step.label} (Weight: {weight}%)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            placeholder="ผลงาน"
                            className="form-control"
                            value={progDone[step.idx] === 0 && progTargets[step.idx] === 0 ? "" : progDone[step.idx]}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value) || 0);
                              const newDone = [...progDone];
                              newDone[step.idx] = val;
                              setProgDone(newDone);
                            }}
                          />
                          <span style={{ color: 'var(--text-light)' }}>/</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="เป้าหมาย"
                            className="form-control"
                            value={progTargets[step.idx] === 0 && progDone[step.idx] === 0 ? "" : progTargets[step.idx]}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value) || 0);
                              const newTargets = [...progTargets];
                              newTargets[step.idx] = val;
                              setProgTargets(newTargets);
                            }}
                          />
                          <span style={{ fontWeight: '500', color: 'var(--text-light)', minWidth: '35px' }}>{step.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <span style={{ fontWeight: '600', marginRight: '12px' }}>Progress งานก่อสร้างรวม:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--pea-purple)' }}>
                  {(() => {
                    if (constructionType === "5") return (manualProgress || 0).toFixed(2);
                    const w = constructionType === "2" ? [20, 30, 25, 25, 0, 0] : (constructionType === "3" ? [20, 25, 25, 20, 0, 10] : (constructionType === "4" ? [0, 0, 50, 50, 0, 0] : [15, 25, 20, 20, 10, 10]));
                    const total = progDone.reduce((sum, doneVal, idx) => {
                      const targetVal = progTargets[idx];
                      if (targetVal === 0 || w[idx] === 0) return sum;
                      const percent = (doneVal / targetVal);
                      const cappedPercent = Math.min(1, percent);
                      return sum + (cappedPercent * w[idx]);
                    }, 0);
                    return total.toFixed(2);
                  })()}%
                </span>
              </div>
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
                { id: "check8", label: "ปรับแผนผังและประมาณการแล้ว" }
              ].map((chk, i) => (
                <div key={chk.id} className="check-item">
                  <input
                    type="checkbox"
                    id={chk.id}
                    checked={checks[chk.id as keyof typeof checks]}
                    onChange={(e) => setChecks({ ...checks, [chk.id]: e.target.checked })}
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
                {userRole === "admin" && (
                  <button className="btn" onClick={handleDeleteProject} disabled={loading} style={{ minWidth: '140px', background: '#fee2e2', color: '#b91c1c' }}>
                    🗑️ ลบโครงการ
                  </button>
                )}
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
                <input type="text" className="form-control" value={newProject.wbs} onChange={e => setNewProject({ ...newProject, wbs: e.target.value })} placeholder="เช่น I-63-I-..." />
              </div>
              <div>
                <label className="form-label">👷 ผู้ควบคุมงาน</label>
                <input type="text" className="form-control" value={newProject.supervisor} onChange={e => setNewProject({ ...newProject, supervisor: e.target.value })} placeholder="ชื่อผู้คุมงาน" />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">📝 ชื่องานโครงการ *</label>
              <textarea className="form-control" rows={2} value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} placeholder="เช่น ยน.ขยายเขต..."></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="form-label">ประเภทโครงการ</label>
                <input type="text" className="form-control" value={newProject.project_type} onChange={e => setNewProject({ ...newProject, project_type: e.target.value })} placeholder="เช่น ขยายเขต" />
              </div>
              <div>
                <label className="form-label">มูลค่างาน (บาท)</label>
                <input type="number" className="form-control" value={newProject.value} onChange={e => setNewProject({ ...newProject, value: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="form-label">📅 ปีที่เปิดงาน</label>
                <input type="text" className="form-control" value={newProject.open_year} onChange={e => setNewProject({ ...newProject, open_year: e.target.value })} placeholder="เช่น 2567" />
              </div>
              <div>
                <label className="form-label">🚨 สาย ป. ติดตาม</label>
                <select className="form-select" value={newProject.p_tracking} onChange={e => setNewProject({ ...newProject, p_tracking: e.target.value })}>
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
