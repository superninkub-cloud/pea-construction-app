"use client";

import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { supabase } from "../../lib/supabaseClient";
import { wireDataList } from "../../lib/wireData";
import { Project } from "../../lib/types";
import { Edit2, Save, X, Plus, Package, Recycle, PieChart as PieChartIcon, Info, Calculator, BarChart3, Layers } from "lucide-react";

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
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [filterScrapStatuses, setFilterScrapStatuses] = useState<string[]>([]);
  const [isScrapStatusDropdownOpen, setIsScrapStatusDropdownOpen] = useState(false);
  // Calculator State
  const [calcWireId, setCalcWireId] = useState("");
  const [calcLength, setCalcLength] = useState("");
  const [calcPercentage, setCalcPercentage] = useState("100");
  const [calcWeight, setCalcWeight] = useState("");
  const [calcActiveInput, setCalcActiveInput] = useState<"length" | "weight" | "percentage" | null>(null);

  // New Filters & Display State
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("latest");
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);

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
          (p.status !== "ยกเลิก")
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
    
    groupedWires.forEach(w => {
      est += w.estimated;
      ret += w.returned_weight;
    });
    
    return {
      ...p,
      estimated: est,
      returned: ret,
      percentage: est > 0 ? (ret / est) * 100 : 0,
      combinedWires: groupedWires
    };
  });

  const filteredProjectStats = projectStats.filter(p => {
    const matchSupervisor = filterSupervisor ? p.supervisor === filterSupervisor : true;
    const matchStatus = filterStatuses.length > 0 ? filterStatuses.includes(p.status) : true;
    
    let scrapStatus = "ยังไม่ส่งคืนเศษสาย";
    const isNoReturn = p.scrap_wires_data?.some((w: any) => w.type === 'ไม่ต้องส่งคืน');
    const isComplete = p.percentage >= 90 || p.check2;
    if (isNoReturn) {
      scrapStatus = "ไม่ต้องส่งคืน";
    } else if (isComplete) {
      scrapStatus = "ส่งคืนเศษสายแล้ว";
    }
    const matchScrapStatus = filterScrapStatuses.length > 0 ? filterScrapStatuses.includes(scrapStatus) : true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = searchTerm ? 
      ((p.wbs && p.wbs.toLowerCase().includes(searchLower)) || 
       (p.name && p.name.toLowerCase().includes(searchLower))) : true;

    return matchSupervisor && matchStatus && matchScrapStatus && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "latest") {
      return (b.id || "").localeCompare(a.id || ""); // Simple approximation for latest
    }
    return 0;
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

  const supervisorStats = Array.from(new Set(projectStats.map(p => p.supervisor || "ไม่ระบุ"))).map(sup => {
    let est = 0;
    let ret = 0;
    
    projectStats.filter(p => (p.supervisor || "ไม่ระบุ") === sup).forEach(p => {
      est += p.estimated;
      ret += p.returned;
    });
    
    return {
      supervisor: sup,
      estimated: est,
      returned: ret,
      percentage: est > 0 ? (ret / est) * 100 : 0
    };
  }).filter(s => s.supervisor !== "ไม่ระบุ").sort((a, b) => b.percentage - a.percentage);

  // Calculator Logic
  const selectedCalcWire = wireDataList.find(w => w.id === calcWireId);

  const handleCalcWireChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setCalcWireId(newId);
    const wire = wireDataList.find(w => w.id === newId);
    if (wire) {
      if ((calcActiveInput === "length" || calcActiveInput === "percentage") && calcLength && !isNaN(Number(calcLength))) {
        const p = Number(calcPercentage) || 0;
        setCalcWeight((Number(calcLength) * (p / 100) * wire.weightPerMeter).toFixed(2));
      } else if (calcActiveInput === "weight" && calcWeight && !isNaN(Number(calcWeight)) && wire.weightPerMeter > 0) {
        if (calcLength && !isNaN(Number(calcLength)) && Number(calcLength) > 0) {
           const newPercent = (Number(calcWeight) / (Number(calcLength) * wire.weightPerMeter)) * 100;
           setCalcPercentage(newPercent.toFixed(1));
        } else {
           const p = Number(calcPercentage) || 100;
           if (p > 0) {
             setCalcLength((Number(calcWeight) / (wire.weightPerMeter * (p / 100))).toFixed(2));
           }
        }
      }
    }
  };

  const handleCalcLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCalcLength(val);
    setCalcActiveInput("length");
    if (selectedCalcWire && val && !isNaN(Number(val))) {
      const p = Number(calcPercentage) || 0;
      setCalcWeight((Number(val) * (p / 100) * selectedCalcWire.weightPerMeter).toFixed(2));
    } else {
      setCalcWeight("");
    }
  };

  const handleCalcPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCalcPercentage(val);
    setCalcActiveInput("percentage");
    if (selectedCalcWire && calcLength && !isNaN(Number(calcLength))) {
      const p = Number(val) || 0;
      setCalcWeight((Number(calcLength) * (p / 100) * selectedCalcWire.weightPerMeter).toFixed(2));
    } else if (selectedCalcWire && calcWeight && !isNaN(Number(calcWeight))) {
      const p = Number(val) || 0;
      if (p > 0) {
        setCalcLength((Number(calcWeight) / (selectedCalcWire.weightPerMeter * (p / 100))).toFixed(2));
      }
    }
  };

  const handleCalcWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCalcWeight(val);
    setCalcActiveInput("weight");
    if (selectedCalcWire && selectedCalcWire.weightPerMeter > 0 && val && !isNaN(Number(val))) {
      if (calcLength && !isNaN(Number(calcLength)) && Number(calcLength) > 0) {
        const newPercent = (Number(val) / (Number(calcLength) * selectedCalcWire.weightPerMeter)) * 100;
        setCalcPercentage(newPercent.toFixed(1));
      } else {
        const p = Number(calcPercentage) || 100;
        if (p > 0) {
          setCalcLength((Number(val) / (selectedCalcWire.weightPerMeter * (p / 100))).toFixed(2));
        }
      }
    } else if (!val) {
      setCalcPercentage("100");
    }
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "0 0 40px 0" }}>
      <TopBar title="ภาพรวมสถานะการส่งคืนเศษสาย" />
      <div style={{ padding: "0 32px", marginTop: "-12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "0.85rem" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>ข้อมูลล่าสุด ณ วันที่ 31 ธ.ค. 2568 เวลา 10:30 น.</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px", cursor: "pointer" }}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.6-6.4L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 1 0-2.6 6.4L3 16"/></svg>
      </div>
      
      <div style={{ padding: "0 32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>กำลังโหลดข้อมูล...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {/* Card 1: Purple (Estimated) */}
              <div className="card animation-fade-in" style={{ position: 'relative', overflow: 'hidden', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(145deg, #ffffff, #fdfbfe)', border: '1px solid #f3e8f3', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(107, 33, 105, 0.05), 0 4px 6px -2px rgba(107, 33, 105, 0.02)' }}>
                <div style={{ display: 'flex', gap: '16px', zIndex: 2 }}>
                  <div style={{ width: '56px', height: '56px', flexShrink: 0, background: '#f5eff5', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7e22ce' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 18v-7"/><path d="M12 21a9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9Z"/><path d="M15 11h-6"/><path d="M15 14h-6"/></svg>
                  </div>
                  <div>
                    <div style={{ color: '#7e22ce', fontSize: '0.9rem', fontWeight: '600', marginBottom: '2px' }}>ประมาณการเศษสายทั้งหมด</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>
                      {totalEstimated.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>กก.</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>จากงานก่อสร้างทั้งหมด</div>
                  </div>
                </div>
                {/* Wave Background */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1, opacity: 0.15, transform: 'translateY(10%)' }}>
                  <svg viewBox="0 0 1440 320" style={{ width: '100%', height: 'auto', display: 'block' }}>
                    <path fill="#7e22ce" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,144C384,160,480,224,576,218.7C672,213,768,139,864,122.7C960,107,1056,149,1152,186.7C1248,224,1344,256,1392,272L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                  </svg>
                </div>
                <div style={{ marginTop: 'auto', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f5eff5', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#7e22ce', fontWeight: '500' }}>เป้าหมายรวม</span>
                  <span style={{ fontSize: '0.85rem', color: '#7e22ce', fontWeight: '600' }}>{totalEstimated.toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.</span>
                </div>
              </div>

              {/* Card 2: Green (Returned) */}
              <div className="card animation-fade-in" style={{ position: 'relative', overflow: 'hidden', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(145deg, #ffffff, #f9fdfa)', border: '1px solid #ecfdf5', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.05), 0 4px 6px -2px rgba(16, 185, 129, 0.02)' }}>
                <div style={{ display: 'flex', gap: '16px', zIndex: 2 }}>
                  <div style={{ width: '56px', height: '56px', flexShrink: 0, background: '#ecfdf5', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9h-4V5H14v12h3"/><path d="M7 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/><path d="M17 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/></svg>
                  </div>
                  <div>
                    <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600', marginBottom: '2px' }}>ส่งคืนแล้วทั้งหมด</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>
                      {totalReturned.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>กก.</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>จากประมาณการทั้งหมด</div>
                  </div>
                </div>
                {/* Wave Background */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1, opacity: 0.15, transform: 'translateY(10%)' }}>
                  <svg viewBox="0 0 1440 320" style={{ width: '100%', height: 'auto', display: 'block' }}>
                    <path fill="#10b981" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,170.7C672,139,768,85,864,80C960,75,1056,117,1152,144C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                  </svg>
                </div>
                <div style={{ marginTop: 'auto', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#ecfdf5', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '500' }}>ส่งคืนเพิ่มขึ้น</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
                      <span style={{ fontSize: '1rem', marginRight: '4px' }}>↑</span> 
                      {(totalReturned * 0.12).toLocaleString(undefined, { maximumFractionDigits: 2 })} กก. (12.34%)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>จากสัปดาห์ที่ผ่านมา</div>
                  </div>
                </div>
              </div>

              {/* Card 3: Orange (Percentage Donut) */}
              <div className="card animation-fade-in" style={{ position: 'relative', overflow: 'hidden', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(145deg, #ffffff, #fffcf9)', border: '1px solid #fff7ed', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.05), 0 4px 6px -2px rgba(249, 115, 22, 0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 2 }}>
                  <div>
                    <div style={{ color: '#ea580c', fontSize: '0.9rem', fontWeight: '600', marginBottom: '2px' }}>คิดเป็นร้อยละ</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b', lineHeight: '1' }}>
                      {overallPercentage.toLocaleString(undefined, { maximumFractionDigits: 0 })}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px' }}>ความคืบหน้าการส่งคืน</div>
                  </div>
                  
                  {/* Donut Chart SVG */}
                  <div style={{ width: '80px', height: '80px', position: 'relative' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#ffedd5" strokeWidth="4"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#ea580c" strokeWidth="4"
                        strokeDasharray={`${overallPercentage}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div style={{ marginTop: 'auto', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#ffedd5', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: '500' }}>เป้าหมาย</span>
                  <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '600' }}>100%</span>
                </div>
              </div>

              {/* Card 4: Supervisor Chart */}
              <div className="card animation-fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>เปรียบเทียบการส่งคืนตามผู้ควบคุมงาน</h3>
                  <button style={{ background: '#f5eff5', color: '#7e22ce', border: 'none', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>ดูทั้งหมด</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                  {supervisorStats.map((sup, idx) => {
                    const isGreen = sup.percentage >= 90;
                    const isOrange = sup.percentage >= 50 && sup.percentage < 90;
                    const color = isGreen ? '#10b981' : (isOrange ? '#f59e0b' : '#ef4444');
                    
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '16px', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' }}>{idx + 1}</span>
                        <span style={{ width: '70px', fontSize: '0.75rem', fontWeight: '500', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sup.supervisor}</span>
                        <div style={{ flex: 1, background: '#f1f5f9', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(sup.percentage, 100)}%`, background: color, height: '100%', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ width: '40px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: color }}>
                          {sup.percentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.65rem', color: '#94a3b8', fontWeight: '500' }}>
                    <span style={{ marginLeft: '94px' }}>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                    <span>120%</span>
                  </div>
                </div>
              </div>
            </div>



            <div style={{ marginBottom: "24px", display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>รายการงานก่อสร้างที่ต้องส่งคืนเศษสาย</h2>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
                  {/* Supervisor Filter */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>ผู้ควบคุมงาน</label>
                    <select 
                      className="form-select" 
                      style={{ width: "160px", background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: "500", padding: "8px 12px", borderRadius: "10px", outline: 'none', color: '#1e293b', fontSize: '0.85rem' }}
                      value={filterSupervisor}
                      onChange={e => setFilterSupervisor(e.target.value)}
                    >
                      <option value="">แสดงทั้งหมด</option>
                      {uniqueSupervisors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>สถานะ</label>
                    <div 
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      style={{ width: "160px", background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: "500", padding: "8px 12px", borderRadius: "10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: '#1e293b', fontSize: '0.85rem' }}
                    >
                      <span>{filterStatuses.length === 0 ? "แสดงทั้งหมด" : `${filterStatuses.length} สถานะ`}</span>
                      <span style={{ fontSize: "0.7rem", color: "#64748b" }}>▼</span>
                    </div>
                    {isStatusDropdownOpen && (
                      <>
                        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} onClick={() => setIsStatusDropdownOpen(false)}></div>
                        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: "4px", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 10, width: "200px", maxHeight: "300px", overflowY: "auto" }}>
                          <div 
                            style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: filterStatuses.length === 0 ? "#f0fdf4" : "transparent" }}
                            onClick={() => { setFilterStatuses([]); setIsStatusDropdownOpen(false); }}
                          >
                            <input type="checkbox" checked={filterStatuses.length === 0} readOnly style={{ cursor: 'pointer', accentColor: '#7e22ce' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>แสดงทั้งหมด</span>
                          </div>
                          {uniqueStatuses.map(s => (
                            <label key={s} style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", margin: 0, background: filterStatuses.includes(s) ? "#f8fafc" : "transparent" }}>
                              <input 
                                type="checkbox" 
                                checked={filterStatuses.includes(s)} 
                                onChange={(e) => {
                                  if (e.target.checked) setFilterStatuses([...filterStatuses, s]);
                                  else setFilterStatuses(filterStatuses.filter(st => st !== s));
                                }}
                                style={{ cursor: 'pointer', accentColor: '#7e22ce' }}
                              />
                              <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{s}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Return Status Filter */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>สถานะส่งคืน</label>
                    <div 
                      onClick={() => setIsScrapStatusDropdownOpen(!isScrapStatusDropdownOpen)}
                      style={{ width: "160px", background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: "500", padding: "8px 12px", borderRadius: "10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: '#1e293b', fontSize: '0.85rem' }}
                    >
                      <span>{filterScrapStatuses.length === 0 ? "แสดงทั้งหมด" : `${filterScrapStatuses.length} สถานะ`}</span>
                      <span style={{ fontSize: "0.7rem", color: "#64748b" }}>▼</span>
                    </div>
                    {isScrapStatusDropdownOpen && (
                      <>
                        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} onClick={() => setIsScrapStatusDropdownOpen(false)}></div>
                        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: "4px", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 10, width: "200px", maxHeight: "300px", overflowY: "auto" }}>
                          <div 
                            style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: filterScrapStatuses.length === 0 ? "#f0fdf4" : "transparent" }}
                            onClick={() => { setFilterScrapStatuses([]); setIsScrapStatusDropdownOpen(false); }}
                          >
                            <input type="checkbox" checked={filterScrapStatuses.length === 0} readOnly style={{ cursor: 'pointer', accentColor: '#7e22ce' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>แสดงทั้งหมด</span>
                          </div>
                          {["ยังไม่ส่งคืนเศษสาย", "ส่งคืนเศษสายแล้ว", "ไม่ต้องส่งคืน"].map(s => (
                            <label key={s} style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", margin: 0, background: filterScrapStatuses.includes(s) ? "#f8fafc" : "transparent" }}>
                              <input 
                                type="checkbox" 
                                checked={filterScrapStatuses.includes(s)} 
                                onChange={(e) => {
                                  if (e.target.checked) setFilterScrapStatuses([...filterScrapStatuses, s]);
                                  else setFilterScrapStatuses(filterScrapStatuses.filter(st => st !== s));
                                }}
                                style={{ cursor: 'pointer', accentColor: '#7e22ce' }}
                              />
                              <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{s}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Search Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ffffff', userSelect: 'none' }}>ค้นหา</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      </div>
                      <input
                        type="text"
                        placeholder="ค้นหารหัสงาน หรือ ชื่องาน..."
                        style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.85rem', color: '#1e293b' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '100%', paddingTop: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5eff5', padding: '6px 12px', borderRadius: '10px', color: '#7e22ce' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 16H3"/><path d="M16 16h5"/><path d="M16 20h5"/><path d="M11 20H3"/><path d="M11 12H3"/><path d="M16 12h5"/><path d="M16 8h5"/><path d="M11 8H3"/><path d="M16 4h5"/><path d="M11 4H3"/></svg>
                    <select 
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: '#7e22ce', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                    >
                      <option value="latest">จัดเรียง: ล่าสุด</option>
                      <option value="progress">ความคืบหน้า</option>
                      <option value="wbs">รหัสงาน</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                    <button 
                      onClick={() => setViewMode("grid")}
                      style={{ background: viewMode === "grid" ? '#7e22ce' : 'transparent', color: viewMode === "grid" ? 'white' : '#64748b', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                    </button>
                    <button 
                      onClick={() => setViewMode("list")}
                      style={{ background: viewMode === "list" ? '#7e22ce' : 'transparent', color: viewMode === "list" ? 'white' : '#64748b', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }}>
              {filteredProjectStats.map(p => {
                const isEditing = editingId === p.id;
                const isNoReturn = p.scrap_wires_data?.some((w: any) => w.type === 'ไม่ต้องส่งคืน');
                const isExpanded = expandedProjects[p.id] || false;
                return (
                  <div key={p.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                    {(() => {
                      const isNoReturn = p.scrap_wires_data?.some((w: any) => w.type === 'ไม่ต้องส่งคืน');
                      return <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: (p.percentage >= 90 || isNoReturn || p.check2) ? '#10b981' : '#ef4444' }}></div>;
                    })()}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--pea-purple)' }}>{p.wbs}</span>
                      {(() => {
                        const isNoReturn = p.scrap_wires_data?.some((w: any) => w.type === 'ไม่ต้องส่งคืน');
                        const isComplete = p.percentage >= 90;
                        let badgeClass = "badge-warning";
                        let badgeText = "ยังไม่คืนเศษสาย";
                        if (isNoReturn) {
                          badgeClass = "badge-success";
                          badgeText = "ไม่ต้องส่งคืน";
                        } else if (isComplete || p.check2) {
                          badgeClass = "badge-success";
                          badgeText = "ส่งคืนเศษสายครบแล้ว";
                        }
                        return <span className={`badge ${badgeClass}`}>{badgeText}</span>;
                      })()}
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
                                <option value="ไม่ต้องส่งคืน">ไม่ต้องส่งคืน</option>
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
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                              ข้อมูลการส่งคืนสายไฟ
                            </div>
                            <span style={{ fontSize: '1.1rem', fontWeight: '700', color: isNoReturn ? '#10b981' : (p.percentage >= 90 ? '#10b981' : '#1e293b') }}>
                              {isNoReturn ? "ไม่ต้องส่งคืน" : `${p.percentage.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
                            </span>
                          </div>
                          
                          {!isNoReturn && (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                <span style={{ color: '#64748b' }}>ประมาณการทั้งหมด: <span style={{ fontWeight: '600', color: '#1e293b' }}>{p.estimated.toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.</span></span>
                                <span style={{ color: '#64748b' }}>ส่งคืนแล้ว: <span style={{ fontWeight: '600', color: '#1e293b' }}>{p.returned.toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.</span></span>
                              </div>
                              <div style={{ background: "#e2e8f0", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${Math.min(p.percentage, 100)}%`, backgroundColor: p.percentage >= 90 ? "#10b981" : (p.percentage > 0 ? "#f59e0b" : "#ef4444"), transition: "width 0.3s ease" }}></div>
                              </div>
                            </>
                          )}

                          {p.combinedWires.length > 0 && !isNoReturn && (
                            <div style={{ marginTop: '16px' }}>
                              <button 
                                onClick={() => setExpandedProjects(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                                style={{ background: 'none', border: 'none', padding: 0, color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                {isExpanded ? 'ซ่อนรายละเอียด' : `แสดงรายละเอียด ${p.combinedWires.length} รายการ`}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                              </button>
                              
                              {isExpanded && (
                                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s' }}>
                                  {p.combinedWires.map((w: any, idx: number) => {
                                    const estimatedKg = w.estimated || 0;
                                    const pct = estimatedKg > 0 ? ((w.returned_weight || 0) / estimatedKg) * 100 : 0;
                                    return (
                                      <div key={idx} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>{w.category}</span>
                                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: pct >= 90 ? '#10b981' : '#f59e0b' }}>{pct.toLocaleString(undefined, { maximumFractionDigits: 1 })}%</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>
                                          <span>เป้าหมาย: {estimatedKg.toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.</span>
                                          <span>ส่งคืน: {(w.returned_weight || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.</span>
                                        </div>
                                        <div style={{ background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                                          <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, backgroundColor: pct >= 90 ? "#10b981" : "#f59e0b", transition: "width 0.3s ease" }}></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'auto' }}>
                          {userRole === "admin" && (
                            <>
                              <button style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                ล้างข้อมูล
                              </button>
                              <button onClick={() => startEdit(p)} style={{ background: '#7e22ce', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px -1px rgba(126, 34, 206, 0.2)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                อัพเดทสถานะการส่งคืน
                              </button>
                            </>
                          )}
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
                        <option value="ไม่ต้องส่งคืน">ไม่ต้องส่งคืน</option>
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

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsCalcModalOpen(true)}
        className="animation-fade-in"
        style={{ position: 'fixed', bottom: '32px', right: '32px', background: '#7e22ce', color: 'white', border: 'none', borderRadius: '50px', padding: '16px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(126, 34, 206, 0.3), 0 4px 6px -2px rgba(126, 34, 206, 0.15)', zIndex: 100, transition: 'transform 0.2s, box-shadow 0.2s' }}
      >
        <Calculator size={24} />
        คำนวณเศษสายไฟฟ้า
      </button>

      {/* Calculator Modal */}
      {isCalcModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card animation-fade-in" style={{ width: '100%', maxWidth: '500px', margin: 0, position: 'relative', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <button
              onClick={() => setIsCalcModalOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f5eff5', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calculator size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>โปรแกรมคำนวณเศษสายไฟฟ้า</h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>คำนวณน้ำหนักและความยาวของเศษสายได้อย่างรวดเร็ว</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>เลือกประเภทสาย / รหัสพัสดุ</label>
                <select 
                  className="form-select"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', outline: 'none', fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}
                  value={calcWireId}
                  onChange={handleCalcWireChange}
                >
                  <option value="">-- เลือกสายไฟฟ้า --</option>
                  {wireDataList.map(w => (
                    <option key={w.id} value={w.id}>[{w.id}] {w.name} ({w.category})</option>
                  ))}
                </select>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', height: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  {selectedCalcWire ? (
                    <>
                      <span>น้ำหนัก: <span style={{ fontWeight: '600', color: '#3b82f6' }}>{selectedCalcWire.weightPerMeter}</span> กก./เมตร</span>
                      <span style={{ color: '#94a3b8' }}>{selectedCalcWire.category}</span>
                    </>
                  ) : ""}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f1f5f9', padding: '16px', borderRadius: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>ความยาว (เมตร)</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      placeholder="0"
                      style={{ width: '100%', padding: '10px 16px', paddingRight: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', outline: 'none', color: calcActiveInput === 'length' ? '#0f172a' : '#ef4444', fontWeight: calcActiveInput !== 'length' && calcLength ? '700' : '500', fontSize: '1rem' }}
                      value={calcLength}
                      onChange={handleCalcLengthChange}
                      disabled={!selectedCalcWire}
                    />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>ม.</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>น้ำหนัก (กิโลกรัม)</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      placeholder="0"
                      style={{ width: '100%', padding: '10px 16px', paddingRight: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', outline: 'none', color: calcActiveInput === 'weight' ? '#0f172a' : '#ef4444', fontWeight: calcActiveInput !== 'weight' && calcWeight ? '700' : '500', fontSize: '1rem' }}
                      value={calcWeight}
                      onChange={handleCalcWeightChange}
                      disabled={!selectedCalcWire}
                    />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>กก.</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>% การส่งคืน (โดยประมาณ)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="range" 
                    min="0" max="120" step="1" 
                    style={{ flex: 1, accentColor: '#7e22ce' }}
                    value={calcPercentage || "0"}
                    onChange={(e) => handleCalcPercentageChange(e as any)}
                    disabled={!selectedCalcWire}
                  />
                  <div style={{ position: 'relative', width: '80px' }}>
                    <input 
                      type="number"
                      style={{ width: '100%', padding: '8px 12px', paddingRight: '24px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', outline: 'none', color: '#0f172a', fontWeight: '600', fontSize: '0.95rem' }}
                      value={calcPercentage}
                      onChange={handleCalcPercentageChange}
                      disabled={!selectedCalcWire}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '32px' }}>
              <button onClick={() => setIsCalcModalOpen(false)} style={{ width: '100%', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
