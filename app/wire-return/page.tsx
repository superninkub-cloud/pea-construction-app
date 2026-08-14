"use client";

import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { supabase } from "../../lib/supabaseClient";
import { wireDataList } from "../../lib/wireData";
import { Project } from "../../lib/types";
import { Edit2, Save, X, Plus } from "lucide-react";

export default function WireReturnPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("user");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    scrap_wire_type: string;
    scrap_wire_length: number | "";
    scrap_returned_weight: number | "";
  }>({ scrap_wire_type: "", scrap_wire_length: "", scrap_returned_weight: "" });
  const [isSaving, setIsSaving] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSelectedId, setAddSelectedId] = useState("");

  useEffect(() => {
    fetchProjects();
    const role = sessionStorage.getItem("pea_role");
    if (role) setUserRole(role);
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").order("wbs");
      if (data) {
        setAllProjects(data);
        // Filter projects that have scrap wire info or are not finished
        const filtered = data.filter((p: any) => 
          p.scrap_wire_type || 
          p.scrap_wire_length > 0 || 
          (p.status !== "F4" && p.status !== "ยกเลิก")
        );
        setProjects(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setEditForm({
      scrap_wire_type: p.scrap_wire_type || "",
      scrap_wire_length: p.scrap_wire_length || "",
      scrap_returned_weight: p.scrap_returned_weight || ""
    });
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from("projects").update({
        scrap_wire_type: editForm.scrap_wire_type,
        scrap_wire_length: Number(editForm.scrap_wire_length) || 0,
        scrap_returned_weight: Number(editForm.scrap_returned_weight) || 0
      }).eq("id", id);
      
      if (error) throw error;
      await fetchProjects();
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProject = async () => {
    if (!addSelectedId || !editForm.scrap_wire_type || editForm.scrap_wire_length === "") {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from("projects").update({
        scrap_wire_type: editForm.scrap_wire_type,
        scrap_wire_length: Number(editForm.scrap_wire_length) || 0,
        scrap_returned_weight: Number(editForm.scrap_returned_weight) || 0
      }).eq("id", addSelectedId);
      
      if (error) throw error;
      await fetchProjects();
      setIsAddModalOpen(false);
      setAddSelectedId("");
      setEditForm({ scrap_wire_type: "", scrap_wire_length: "", scrap_returned_weight: "" });
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  let totalEstimated = 0;
  let totalReturned = 0;

  const projectStats = projects.map(p => {
    const wire = wireDataList.find(w => w.id === p.scrap_wire_type);
    const est = wire && p.scrap_wire_length ? (p.scrap_wire_length * 1000) * wire.weightPerMeter : 0;
    const ret = p.scrap_returned_weight || 0;
    
    totalEstimated += est;
    totalReturned += ret;
    
    return {
      ...p,
      estimated: est,
      returned: ret,
      percentage: est > 0 ? Math.min(100, (ret / est) * 100) : 0
    };
  });

  const overallPercentage = totalEstimated > 0 ? (totalReturned / totalEstimated) * 100 : 0;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "0 0 40px 0" }}>
      <TopBar title="โหมดสถานะการส่งคืนเศษสาย" />
      
      <div style={{ padding: "24px 32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>กำลังโหลดข้อมูล...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.9 }}>ประมาณการเศษสายทั้งหมด</h3>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '8px' }}>{totalEstimated.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span style={{ fontSize: '1rem', fontWeight: '500' }}>กก.</span></div>
              </div>
              <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.9 }}>ส่งคืนแล้วทั้งหมด</h3>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '8px' }}>{totalReturned.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span style={{ fontSize: '1rem', fontWeight: '500' }}>กก.</span></div>
              </div>
              <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', border: 'none' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.9 }}>คิดเป็นร้อยละ</h3>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '8px' }}>{overallPercentage.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", margin: 0 }}>รายการงานก่อสร้างที่ต้องส่งคืนเศษสาย</h2>
              {userRole === "admin" && (
                <button
                  onClick={() => {
                    setEditForm({ scrap_wire_type: "", scrap_wire_length: "", scrap_returned_weight: "" });
                    setIsAddModalOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", fontSize: "0.9rem" }}
                >
                  <Plus size={16} /> ดึงงานก่อสร้างมาประเมินเศษสาย
                </button>
              )}
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }}>
              {projectStats.map(p => {
                const isEditing = editingId === p.id;
                return (
                  <div key={p.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: p.percentage >= 100 ? '#10b981' : (p.percentage > 0 ? '#f59e0b' : '#ef4444') }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--pea-purple)' }}>{p.wbs}</span>
                      <span className={`badge ${p.check2 ? "badge-success" : "badge-warning"}`}>{p.check2 ? "ส่งคืนแล้ว (เอกสาร)" : "ยังไม่ส่งคืน (เอกสาร)"}</span>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-dark)', marginBottom: '16px' }}>{p.name}</div>
                    
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px', display: 'block' }}>ชนิดสายไฟ</label>
                          <select className="form-select" value={editForm.scrap_wire_type} onChange={(e) => setEditForm({ ...editForm, scrap_wire_type: e.target.value })} style={{ padding: '6px' }}>
                            <option value="">-- เลือกชนิดสายไฟ --</option>
                            {wireDataList.map(wire => (
                              <option key={wire.id} value={wire.id}>{wire.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px', display: 'block' }}>ระยะทางที่รื้อถอน (กม.)</label>
                          <input type="number" min="0" step="0.01" className="form-control" value={editForm.scrap_wire_length} onChange={(e) => setEditForm({ ...editForm, scrap_wire_length: e.target.value === "" ? "" : Number(e.target.value) })} style={{ padding: '6px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px', display: 'block' }}>น้ำหนักที่ส่งคืนจริง (กก.)</label>
                          <input type="number" min="0" className="form-control" value={editForm.scrap_returned_weight} onChange={(e) => setEditForm({ ...editForm, scrap_returned_weight: e.target.value === "" ? "" : Number(e.target.value) })} style={{ padding: '6px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                          <button onClick={() => setEditingId(null)} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#f1f5f9' }}>ยกเลิก</button>
                          <button onClick={() => handleSave(p.id)} disabled={isSaving} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Save size={14} /> บันทึก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>ชนิดสายไฟ:</span>
                            <span style={{ fontWeight: '500' }}>{wireDataList.find(w => w.id === p.scrap_wire_type)?.name || p.scrap_wire_type || "ยังไม่ได้ระบุ"}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>ระยะทางที่รื้อถอน:</span>
                            <span style={{ fontWeight: '500' }}>{p.scrap_wire_length || 0} กม.</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: '500', color: 'var(--text-light)' }}>ประมาณการ: {p.estimated.toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.</span>
                            <span style={{ fontWeight: '500', color: 'var(--text-light)' }}>ส่งคืนแล้ว: {p.returned.toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.</span>
                          </div>
                          <div style={{ background: "#e2e8f0", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${p.percentage}%`, backgroundColor: p.percentage >= 100 ? "#10b981" : "#3b82f6", transition: "width 0.3s ease" }}></div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {userRole === "admin" ? (
                              <button onClick={() => startEdit(p)} className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid #cbd5e1', color: '#475569' }}>
                                <Edit2 size={12} /> อัพเดทข้อมูล
                              </button>
                            ) : <div></div>}
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: p.percentage >= 100 ? '#10b981' : 'var(--pea-purple)' }}>
                              {p.percentage.toLocaleString(undefined, { maximumFractionDigits: 2 })}%
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              
              {projectStats.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                  ยังไม่มีข้อมูลงานก่อสร้างที่มีการรื้อถอนเศษสาย
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card animation-fade-in" style={{ width: '100%', maxWidth: '600px', margin: 0, position: 'relative' }}>
            <button
              onClick={() => setIsAddModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
            >
              <X />
            </button>
            <h3 style={{ color: 'var(--pea-purple)', marginBottom: '24px', fontWeight: 'bold' }}>ดึงงานก่อสร้างมาประเมินเศษสาย</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">เลือกโครงการ</label>
              <select className="form-select" value={addSelectedId} onChange={(e) => setAddSelectedId(e.target.value)}>
                <option value="">-- เลือกโครงการ --</option>
                {allProjects.filter(p => !projects.find(ext => ext.id === p.id)).map(p => (
                  <option key={p.id} value={p.id}>[{p.wbs}] {p.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="form-label">ชนิดสายไฟที่รื้อถอน</label>
                <select className="form-select" value={editForm.scrap_wire_type} onChange={(e) => setEditForm({ ...editForm, scrap_wire_type: e.target.value })}>
                  <option value="">-- เลือกชนิดสายไฟ --</option>
                  {wireDataList.map(wire => (
                    <option key={wire.id} value={wire.id}>{wire.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">ระยะทางที่รื้อถอน (กม.)</label>
                <input type="number" min="0" step="0.01" className="form-control" value={editForm.scrap_wire_length} onChange={(e) => setEditForm({ ...editForm, scrap_wire_length: e.target.value === "" ? "" : Number(e.target.value) })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button className="btn" onClick={() => setIsAddModalOpen(false)} style={{ background: '#f1f5f9', color: 'var(--text-dark)' }}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleAddProject} disabled={isSaving || !addSelectedId || !editForm.scrap_wire_type || editForm.scrap_wire_length === ""}>
                {isSaving ? "กำลังบันทึก..." : "เพิ่มในรายการติดตาม"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
