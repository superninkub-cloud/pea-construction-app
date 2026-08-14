"use client";

import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { supabase } from "../../lib/supabaseClient";
import { wireDataList } from "../../lib/wireData";
import { Project } from "../../lib/types";
import { Edit2, Save, X, Plus, Package, Recycle, PieChart, Info, Calculator } from "lucide-react";

export default function WireReturnPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("user");
  
  interface WireItem {
    id: string;
    type: string;
    length: number | "";
    returned_weight: number | "";
  }
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWires, setEditWires] = useState<WireItem[]>([]);
  const [categoryReturnedWeights, setCategoryReturnedWeights] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSelectedId, setAddSelectedId] = useState("");

  const [filterSupervisor, setFilterSupervisor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Calculator State
  const [calcWireId, setCalcWireId] = useState("");
  const [calcLength, setCalcLength] = useState("");
  const [calcWeight, setCalcWeight] = useState("");
  const [calcActiveInput, setCalcActiveInput] = useState<"length" | "weight" | null>(null);

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
    let initialWires: WireItem[] = [];
    if (p.scrap_wires_data && p.scrap_wires_data.length > 0) {
      initialWires = p.scrap_wires_data.map(w => ({
        id: w.id || Date.now().toString() + Math.random(),
        type: w.type || "",
        length: w.length || "",
        returned_weight: w.returned_weight || ""
      }));
    } else if (p.scrap_wire_type || p.scrap_wire_length) {
      initialWires = [{
        id: Date.now().toString(),
        type: p.scrap_wire_type || "",
        length: p.scrap_wire_length || "",
        returned_weight: p.scrap_returned_weight || ""
      }];
    } else {
      initialWires = [{ id: Date.now().toString(), type: "", length: "", returned_weight: "" }];
    }
    setEditWires(initialWires);

    const initialCatWeights: Record<string, string> = {};
    initialWires.forEach(w => {
      const wd = wireDataList.find(x => x.id === w.type);
      const cat = wd ? wd.category : (w.type || "ยังไม่ได้ระบุ");
      if (w.returned_weight) {
        initialCatWeights[cat] = (Number(initialCatWeights[cat] || 0) + Number(w.returned_weight)).toString();
      }
    });
    setCategoryReturnedWeights(initialCatWeights);
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      // Calculate total estimated weight per category
      const catEstMap: Record<string, number> = {};
      editWires.forEach(w => {
        const wd = wireDataList.find(x => x.id === w.type);
        const cat = wd ? wd.category : (w.type || "ยังไม่ได้ระบุ");
        const est = wd ? (Number(w.length) || 0) * wd.weightPerMeter : 0;
        catEstMap[cat] = (catEstMap[cat] || 0) + est;
      });

      const formattedWires = editWires.map(w => {
        const wd = wireDataList.find(x => x.id === w.type);
        const cat = wd ? wd.category : (w.type || "ยังไม่ได้ระบุ");
        const est = wd ? (Number(w.length) || 0) * wd.weightPerMeter : 0;
        const catTotalEst = catEstMap[cat] || 0;
        const catRetWeight = Number(categoryReturnedWeights[cat]) || 0;
        
        let distributedRet = 0;
        if (catTotalEst > 0) {
          distributedRet = catRetWeight * (est / catTotalEst);
        } else if (editWires.filter(x => {
          const xwd = wireDataList.find(y => y.id === x.type);
          return (xwd ? xwd.category : (x.type || "ยังไม่ได้ระบุ")) === cat;
        }).length > 0) {
          // If total estimated is 0, just divide evenly
          const count = editWires.filter(x => {
            const xwd = wireDataList.find(y => y.id === x.type);
            return (xwd ? xwd.category : (x.type || "ยังไม่ได้ระบุ")) === cat;
          }).length;
          distributedRet = catRetWeight / count;
        }

        return {
          id: w.id,
          type: w.type,
          length: Number(w.length) || 0,
          returned_weight: distributedRet
        };
      });
      
      const { error } = await supabase.from("projects").update({
        scrap_wires_data: formattedWires,
        scrap_wire_type: null,
        scrap_wire_length: null,
        scrap_returned_weight: null
      }).eq("id", id);
      
      if (error) throw error;
      await fetchProjects();
      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProject = async () => {
    if (!addSelectedId || editWires.some(w => !w.type || w.length === "")) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    setIsSaving(true);
    try {
      // Calculate total estimated weight per category
      const catEstMap: Record<string, number> = {};
      editWires.forEach(w => {
        const wd = wireDataList.find(x => x.id === w.type);
        const cat = wd ? wd.category : (w.type || "ยังไม่ได้ระบุ");
        const est = wd ? (Number(w.length) || 0) * wd.weightPerMeter : 0;
        catEstMap[cat] = (catEstMap[cat] || 0) + est;
      });

      const formattedWires = editWires.map(w => {
        const wd = wireDataList.find(x => x.id === w.type);
        const cat = wd ? wd.category : (w.type || "ยังไม่ได้ระบุ");
        const est = wd ? (Number(w.length) || 0) * wd.weightPerMeter : 0;
        const catTotalEst = catEstMap[cat] || 0;
        const catRetWeight = Number(categoryReturnedWeights[cat]) || 0;
        
        let distributedRet = 0;
        if (catTotalEst > 0) {
          distributedRet = catRetWeight * (est / catTotalEst);
        } else {
          const count = editWires.filter(x => {
            const xwd = wireDataList.find(y => y.id === x.type);
            return (xwd ? xwd.category : (x.type || "ยังไม่ได้ระบุ")) === cat;
          }).length;
          distributedRet = count > 0 ? catRetWeight / count : 0;
        }

        return {
          id: w.id,
          type: w.type,
          length: Number(w.length) || 0,
          returned_weight: distributedRet
        };
      });

      const { error } = await supabase.from("projects").update({
        scrap_wires_data: formattedWires,
        scrap_wire_type: null,
        scrap_wire_length: null,
        scrap_returned_weight: null
      }).eq("id", addSelectedId);
      
      if (error) throw error;
      await fetchProjects();
      setIsAddModalOpen(false);
      setAddSelectedId("");
      setEditWires([]);
    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const projectStats = projects.map(p => {
    const combinedWires = [...(p.scrap_wire_type ? [{ type: p.scrap_wire_type, length: p.scrap_wire_length, returned_weight: p.scrap_returned_weight }] : []), ...(p.scrap_wires_data || [])];
    
    const groupedWiresMap = new Map();
    combinedWires.forEach(w => {
      if (!w.type) return;
      const wd = wireDataList.find(x => x.id === w.type);
      const cat = wd ? wd.category : (w.type || "ยังไม่ได้ระบุ");
      const est = wd ? (Number(w.length) || 0) * wd.weightPerMeter : 0;
      
      if (groupedWiresMap.has(cat)) {
        const existing = groupedWiresMap.get(cat);
        existing.length = (Number(existing.length) || 0) + (Number(w.length) || 0);
        existing.returned_weight = (Number(existing.returned_weight) || 0) + (Number(w.returned_weight) || 0);
        existing.estimated = (Number(existing.estimated) || 0) + est;
      } else {
        groupedWiresMap.set(cat, { 
          category: cat, 
          length: Number(w.length) || 0, 
          returned_weight: Number(w.returned_weight) || 0,
          estimated: est
        });
      }
    });
    
    const groupedWires = Array.from(groupedWiresMap.values());
    
    let est = 0;
    let ret = 0;
    let estForPercentage = 0;
    
    groupedWires.forEach(w => {
      est += w.estimated;
      ret += w.returned_weight;
      
      if (w.returned_weight > 0) {
        estForPercentage += w.estimated;
      }
    });
    
    return {
      ...p,
      estimated: est,
      returned: ret,
      percentage: estForPercentage > 0 ? Math.min(100, (ret / estForPercentage) * 100) : 0,
      combinedWires: groupedWires
    };
  });

  const filteredProjectStats = projectStats.filter(p => {
    const matchSupervisor = filterSupervisor ? p.supervisor === filterSupervisor : true;
    const matchStatus = filterStatus ? p.status === filterStatus : true;
    return matchSupervisor && matchStatus;
  });

  let totalEstimated = 0;
  let totalReturned = 0;

  filteredProjectStats.forEach(p => {
    totalEstimated += p.estimated;
    totalReturned += p.returned;
  });

  const overallPercentage = totalEstimated > 0 ? (totalReturned / totalEstimated) * 100 : 0;

  const uniqueSupervisors = Array.from(new Set(projectStats.map(p => p.supervisor).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(projectStats.map(p => p.status).filter(Boolean)));

  // Calculator Logic
  const selectedCalcWire = wireDataList.find(w => w.id === calcWireId);
  const handleCalcWireChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setCalcWireId(newId);
    const wire = wireDataList.find(w => w.id === newId);
    if (wire) {
      if (calcActiveInput === "length" && calcLength && !isNaN(Number(calcLength))) {
        setCalcWeight((Number(calcLength) * wire.weightPerMeter).toFixed(2));
      } else if (calcActiveInput === "weight" && calcWeight && !isNaN(Number(calcWeight)) && wire.weightPerMeter > 0) {
        setCalcLength((Number(calcWeight) / wire.weightPerMeter).toFixed(2));
      }
    }
  };

  const handleCalcLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCalcLength(val);
    setCalcActiveInput("length");
    if (selectedCalcWire && val && !isNaN(Number(val))) {
      setCalcWeight((Number(val) * selectedCalcWire.weightPerMeter).toFixed(2));
    } else {
      setCalcWeight("");
    }
  };

  const handleCalcWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCalcWeight(val);
    setCalcActiveInput("weight");
    if (selectedCalcWire && selectedCalcWire.weightPerMeter > 0 && val && !isNaN(Number(val))) {
      setCalcLength((Number(val) / selectedCalcWire.weightPerMeter).toFixed(2));
    } else {
      setCalcLength("");
    }
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "0 0 40px 0" }}>
      <TopBar title="โหมดสถานะการส่งคืนเศษสาย" />
      
      <div style={{ padding: "24px 32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>กำลังโหลดข้อมูล...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className="card animation-fade-in" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                  <Package size={32} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                    ประมาณการเศษสายทั้งหมด <Info size={14} />
                  </div>
                  <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>
                    {totalEstimated.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#64748b' }}>กก.</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>จากงานก่อสร้างทั้งหมด</div>
                </div>
              </div>

              <div className="card animation-fade-in" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                  <Recycle size={32} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                    ส่งคืนแล้วทั้งหมด <Info size={14} />
                  </div>
                  <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>
                    {totalReturned.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#64748b' }}>กก.</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>จากประมาณการทั้งหมด</div>
                </div>
              </div>

              <div className="card animation-fade-in" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', flexShrink: 0 }}>
                  <PieChart size={32} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                    คิดเป็นร้อยละ
                  </div>
                  <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>
                    {overallPercentage.toLocaleString(undefined, { maximumFractionDigits: 1 })}%
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>ความคืบหน้าการส่งคืน</div>
                </div>
              </div>
            </div>

            {/* Calculator Section */}
            <div className="card animation-fade-in" style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>
                  <Calculator size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>โปรแกรมคำนวณเศษสายไฟฟ้า</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>เลือกประเภทสาย / รหัสพัสดุ</label>
                  <select 
                    className="form-select"
                    style={{ width: '100%', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', outline: 'none', fontSize: '0.9rem', color: '#334155', fontWeight: '500', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                    value={calcWireId}
                    onChange={handleCalcWireChange}
                  >
                    <option value="">-- เลือกสายไฟฟ้า --</option>
                    {wireDataList.map(w => (
                      <option key={w.id} value={w.id}>[{w.id}] {w.name} ({w.category})</option>
                    ))}
                  </select>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', height: '16px' }}>
                    {selectedCalcWire ? (
                      <>น้ำหนัก: <span style={{ fontWeight: '600', color: '#3b82f6' }}>{selectedCalcWire.weightPerMeter}</span> กก./เมตร</>
                    ) : ""}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>ความยาว (เมตร)</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      placeholder="ระบุความยาว"
                      style={{ width: '100%', padding: '10px 16px', paddingRight: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', outline: 'none', color: calcActiveInput === 'length' ? '#0f172a' : '#ef4444', fontWeight: calcActiveInput === 'weight' && calcLength ? '700' : '500', fontSize: '1rem', boxShadow: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                      value={calcLength}
                      onChange={handleCalcLengthChange}
                      disabled={!selectedCalcWire}
                    />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>ม.</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>น้ำหนัก (กิโลกรัม)</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      placeholder="ระบุน้ำหนัก"
                      style={{ width: '100%', padding: '10px 16px', paddingRight: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', outline: 'none', color: calcActiveInput === 'weight' ? '#0f172a' : '#ef4444', fontWeight: calcActiveInput === 'length' && calcWeight ? '700' : '500', fontSize: '1rem', boxShadow: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                      value={calcWeight}
                      onChange={handleCalcWeightChange}
                      disabled={!selectedCalcWire}
                    />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>กก.</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", margin: 0 }}>รายการงานก่อสร้างที่ต้องส่งคืนเศษสาย</h2>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--pea-purple)" }}>👷 ผู้ควบคุมงาน:</span>
                    <select 
                      className="form-select" 
                      style={{ width: "180px", background: "white", border: "1px solid #cbd5e1", fontWeight: "500", padding: "6px 12px", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                      value={filterSupervisor}
                      onChange={e => setFilterSupervisor(e.target.value)}
                    >
                      <option value="">แสดงทั้งหมด</option>
                      {uniqueSupervisors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ width: "1px", height: "32px", background: "#cbd5e1" }}></div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--pea-purple)" }}>📌 สถานะ:</span>
                    <select 
                      className="form-select" 
                      style={{ width: "160px", background: "white", border: "1px solid #cbd5e1", fontWeight: "500", padding: "6px 12px", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                    >
                      <option value="">แสดงทั้งหมด</option>
                      {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {userRole === "admin" && (
                  <button
                    onClick={() => {
                      setEditWires([{ id: Date.now().toString(), type: "", length: "", returned_weight: "" }]);
                      setIsAddModalOpen(true);
                    }}
                    className="btn btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", fontSize: "0.95rem", fontWeight: "600", whiteSpace: "nowrap", boxShadow: "0 4px 6px -1px rgba(124, 58, 237, 0.3)", transition: "all 0.2s" }}
                  >
                    <Plus size={18} /> ดึงงานก่อสร้างมาประเมินเศษสาย
                  </button>
                )}
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }}>
              {filteredProjectStats.map(p => {
                const isEditing = editingId === p.id;
                return (
                  <div key={p.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: p.percentage >= 100 ? '#10b981' : (p.percentage > 0 ? '#f59e0b' : '#ef4444') }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--pea-purple)' }}>{p.wbs}</span>
                      <span className={`badge ${p.check2 ? "badge-success" : "badge-warning"}`}>{p.check2 ? "ส่งคืนเศษสายครบแล้ว" : "ยังไม่คืนเศษสาย"}</span>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-dark)', marginBottom: '8px' }}>{p.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '16px' }}>
                      <span>ผู้ควบคุมงาน: <span style={{ fontWeight: '500', color: 'var(--text-dark)' }}>{p.supervisor || '-'}</span></span>
                      <span>สถานะ: <span style={{ fontWeight: '500', color: 'var(--text-dark)' }}>{p.status || '-'}</span></span>
                    </div>
                    
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>1. ระบุความยาวเศษสายที่รื้อถอน</div>
                        {editWires.map((wire, idx) => (
                          <div key={wire.id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', position: 'relative', background: '#fff' }}>
                            {editWires.length > 1 && (
                              <button onClick={() => setEditWires(editWires.filter(w => w.id !== wire.id))} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                            )}
                            <div>
                              <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px', display: 'block' }}>ชนิดสายไฟ</label>
                              <select className="form-select" value={wire.type} onChange={(e) => {
                                const newWires = [...editWires];
                                newWires[idx].type = e.target.value;
                                setEditWires(newWires);
                              }} style={{ padding: '6px' }}>
                                <option value="">-- เลือกชนิดสายไฟ --</option>
                                {wireDataList.map(w => (
                                  <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                              </select>
                            </div>
                            <div style={{ marginTop: '8px' }}>
                              <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px', display: 'block' }}>จำนวนเศษสายส่งคืน (เมตร)</label>
                              <input type="number" min="0" step="0.01" className="form-control" value={wire.length} onChange={(e) => {
                                const newWires = [...editWires];
                                newWires[idx].length = e.target.value === "" ? "" : Number(e.target.value);
                                setEditWires(newWires);
                              }} style={{ padding: '6px' }} />
                            </div>
                          </div>
                        ))}
                        <button onClick={() => setEditWires([...editWires, { id: Date.now().toString() + Math.random(), type: "", length: "", returned_weight: "" }])} className="btn" style={{ padding: '6px', fontSize: '0.85rem', background: '#e0e7ff', color: '#4f46e5', border: '1px dashed #4f46e5' }}>
                          + เพิ่มชนิดสายไฟ
                        </button>
                        
                        {editWires.some(w => w.type) && (
                          <div style={{ marginTop: '16px', borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>2. กรอกน้ำหนักที่ส่งคืนจริงรวมตามกลุ่มสายไฟ</div>
                            
                            {(() => {
                              const editCategoriesMap = new Map();
                              editWires.forEach(w => {
                                if (!w.type) return;
                                const wd = wireDataList.find(x => x.id === w.type);
                                const cat = wd ? wd.category : w.type;
                                const est = wd ? (Number(w.length) || 0) * wd.weightPerMeter : 0;
                                if (editCategoriesMap.has(cat)) {
                                  editCategoriesMap.get(cat).estimated += est;
                                } else {
                                  editCategoriesMap.set(cat, { category: cat, estimated: est });
                                }
                              });
                              
                              return Array.from(editCategoriesMap.values()).map(catData => (
                                <div key={catData.category} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', marginBottom: '8px' }}>
                                  <div style={{ fontWeight: '600', color: 'var(--pea-purple)', marginBottom: '4px' }}>{catData.category}</div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '8px' }}>
                                    ประมาณการรวม: {catData.estimated.toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.
                                  </div>
                                  <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px', display: 'block' }}>น้ำหนักที่ส่งคืนจริงรวม (กก.)</label>
                                  <input 
                                    type="number" 
                                    min="0" 
                                    className="form-control" 
                                    value={categoryReturnedWeights[catData.category] || ""} 
                                    onChange={(e) => {
                                      setCategoryReturnedWeights({
                                        ...categoryReturnedWeights,
                                        [catData.category]: e.target.value
                                      });
                                    }} 
                                    style={{ padding: '6px', borderColor: categoryReturnedWeights[catData.category] ? '#10b981' : '#cbd5e1' }} 
                                    placeholder="กรอกน้ำหนักรวมที่ชั่งได้จริง"
                                  />
                                </div>
                              ));
                            })()}
                          </div>
                        )}
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
                          {p.combinedWires.length > 0 ? p.combinedWires.map((w: any, idx: number) => {
                            const estimatedKg = w.estimated || 0;
                            return (
                              <div key={idx} style={{ borderBottom: idx < p.combinedWires.length - 1 ? '1px solid #e2e8f0' : 'none', paddingBottom: idx < p.combinedWires.length - 1 ? '8px' : '0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'var(--text-light)' }}>กลุ่มชนิดสายไฟ:</span>
                                  <span style={{ fontWeight: '500' }}>{w.category}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'var(--text-light)' }}>จำนวนเศษสายส่งคืน:</span>
                                  <span style={{ fontWeight: '500' }}>{w.length || 0} เมตร <span style={{ color: 'var(--pea-purple)', fontSize: '0.9em' }}>({estimatedKg.toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.)</span></span>
                                </div>
                                {estimatedKg > 0 && (
                                  <div style={{ marginTop: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                      <span style={{ color: 'var(--text-light)' }}>ส่งคืนแล้ว: {(w.returned_weight || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.</span>
                                      <span style={{ fontWeight: '600', color: (w.returned_weight || 0) > 0 ? '#10b981' : '#f59e0b' }}>
                                        {(((w.returned_weight || 0) / estimatedKg) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
                                      </span>
                                    </div>
                                    <div style={{ background: "#f1f5f9", height: "4px", borderRadius: "2px", overflow: "hidden" }}>
                                      <div style={{ height: "100%", width: `${Math.min((((w.returned_weight || 0) / estimatedKg) * 100), 100)}%`, backgroundColor: ((w.returned_weight || 0) / estimatedKg) * 100 >= 100 ? "#10b981" : "#3b82f6", transition: "width 0.3s ease" }}></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-light)' }}>ยังไม่ได้ระบุชนิดสายไฟ</div>
                          )}
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
              
              {filteredProjectStats.length === 0 && (
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {editWires.map((wire, idx) => (
                <div key={wire.id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', position: 'relative' }}>
                  {editWires.length > 1 && (
                    <button onClick={() => setEditWires(editWires.filter(w => w.id !== wire.id))} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label">ชนิดสายไฟที่รื้อถอน</label>
                      <select className="form-select" value={wire.type} onChange={(e) => {
                        const newWires = [...editWires];
                        newWires[idx].type = e.target.value;
                        setEditWires(newWires);
                      }}>
                        <option value="">-- เลือกชนิดสายไฟ --</option>
                        {wireDataList.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">จำนวนเศษสายส่งคืน (เมตร)</label>
                      <input type="number" min="0" step="0.01" className="form-control" value={wire.length} onChange={(e) => {
                        const newWires = [...editWires];
                        newWires[idx].length = e.target.value === "" ? "" : Number(e.target.value);
                        setEditWires(newWires);
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setEditWires([...editWires, { id: Date.now().toString() + Math.random(), type: "", length: "", returned_weight: "" }])} className="btn" style={{ padding: '6px', fontSize: '0.85rem', background: '#e0e7ff', color: '#4f46e5', border: '1px dashed #4f46e5' }}>
                + เพิ่มชนิดสายไฟ
              </button>
            </div>

            {editWires.some(w => w.type) && (
              <div style={{ marginBottom: '24px', borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>สรุปน้ำหนักที่ส่งคืนจริงรวมตามกลุ่มสายไฟ</div>
                
                {(() => {
                  const editCategoriesMap = new Map();
                  editWires.forEach(w => {
                    if (!w.type) return;
                    const wd = wireDataList.find(x => x.id === w.type);
                    const cat = wd ? wd.category : w.type;
                    const est = wd ? (Number(w.length) || 0) * wd.weightPerMeter : 0;
                    if (editCategoriesMap.has(cat)) {
                      editCategoriesMap.get(cat).estimated += est;
                    } else {
                      editCategoriesMap.set(cat, { category: cat, estimated: est });
                    }
                  });
                  
                  return Array.from(editCategoriesMap.values()).map(catData => (
                    <div key={catData.category} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--pea-purple)', marginBottom: '4px' }}>{catData.category}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '8px' }}>
                        ประมาณการรวม: {catData.estimated.toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.
                      </div>
                      <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px', display: 'block' }}>น้ำหนักที่ส่งคืนจริงรวม (กก.)</label>
                      <input 
                        type="number" 
                        min="0" 
                        className="form-control" 
                        value={categoryReturnedWeights[catData.category] || ""} 
                        onChange={(e) => {
                          setCategoryReturnedWeights({
                            ...categoryReturnedWeights,
                            [catData.category]: e.target.value
                          });
                        }} 
                        style={{ padding: '6px', borderColor: categoryReturnedWeights[catData.category] ? '#10b981' : '#cbd5e1' }} 
                        placeholder="กรอกน้ำหนักรวมที่ชั่งได้จริง"
                      />
                    </div>
                  ));
                })()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button className="btn" onClick={() => setIsAddModalOpen(false)} style={{ background: '#f1f5f9', color: 'var(--text-dark)' }}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleAddProject} disabled={isSaving || !addSelectedId || editWires.some(w => !w.type || w.length === "")}>
                {isSaving ? "กำลังบันทึก..." : "เพิ่มในรายการติดตาม"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
