"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";
import TopBar from "./TopBar";
import { Home, CheckCircle2, CircleDashed, Layers, Users, AlertTriangle } from "lucide-react";
import { wireDataList } from "../../lib/wireData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Overview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [supervisorFilter, setSupervisorFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [pTrackingFilter, setPTrackingFilter] = useState("ALL");
  const [actionPlanFilter, setActionPlanFilter] = useState("ALL");
  const [closingPlanFilter, setClosingPlanFilter] = useState("ALL");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [supervisors, setSupervisors] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("wbs", { ascending: true });

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
      const uniqueStatuses = Array.from(new Set(data?.map(p => p.status || "ไม่มีข้อมูล").filter(Boolean)));
      setStatuses(uniqueStatuses as string[]);
      const uniqueSupervisors = Array.from(new Set(data?.map(p => p.supervisor || "ไม่ระบุ").filter(Boolean)));
      setSupervisors(uniqueSupervisors as string[]);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatNumber = (num: number) => {
    return (num || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const projectsWithNonStatusFilters = projects.filter((p) => {
    if (
      (p.wbs && (p.wbs.includes("IMPORTANT_TASKS") || p.wbs.includes("SAFETY_PLAN"))) ||
      (p.name && (p.name.includes("Important Tasks") || p.name.includes("Safety Training")))
    ) {
      return false;
    }
    const matchYear = true; // year is handled in loop below
    let yearMatched = true;
    if (yearFilter !== "ALL") {
      const year = Number(p.open_year) || 0;
      if (yearFilter === "BEFORE_2568") yearMatched = year > 0 && year < 2568;
      else if (yearFilter === "2568") yearMatched = year === 2568;
      else if (yearFilter === "2569") yearMatched = year === 2569;
    }

    const matchMonth = monthFilter === "ALL" || (p.remarks && p.remarks.includes(`[${monthFilter}`));
    const matchPTracking = pTrackingFilter === "ALL" || (pTrackingFilter === "TRACKED" && p.p_tracking && p.p_tracking !== "" && p.p_tracking !== "ไม่ติดตาม");
    const currentActionPlan = p.action_plan || "";
    const matchActionPlan = actionPlanFilter === "ALL" || (currentActionPlan === "" && actionPlanFilter === "ไม่ได้กำหนด") || currentActionPlan === actionPlanFilter;
    const currentClosingPlan = p.closing_plan || "";
    const matchClosingPlan = closingPlanFilter === "ALL" || (currentClosingPlan === "" && closingPlanFilter === "ไม่ได้กำหนด") || currentClosingPlan === closingPlanFilter;
    const matchSearch = Object.values(p).some((val) =>
      val && val.toString().toLowerCase().includes(search.toLowerCase())
    );
    return matchMonth && matchSearch && yearMatched && matchPTracking && matchActionPlan && matchClosingPlan;
  });

  const projectsForTopCards = projectsWithNonStatusFilters.filter(p => supervisorFilter === "ALL" || (p.supervisor || "ไม่ระบุ") === supervisorFilter);

  const baseFilteredProjects = projectsWithNonStatusFilters.filter((p) => {
    const s = p.status || "ไม่มีข้อมูล";
    return statusFilters.length === 0 || statusFilters.includes(s);
  });

  const handleStatusClick = (type: 'ALL' | 'F4' | 'OTHER' | 'D1') => {
    if (type === 'ALL') {
      setStatusFilters([]);
    } else if (type === 'F4') {
      setStatusFilters(statusFilters.includes('F4') && statusFilters.length === 1 ? [] : ['F4']);
    } else if (type === 'D1') {
      setStatusFilters(statusFilters.includes('D1') && statusFilters.length === 1 ? [] : ['D1']);
    } else if (type === 'OTHER') {
      const nonF4 = statuses.filter(s => s !== 'F4');
      const isCurrentlyNonF4 = nonF4.every(o => statusFilters.includes(o)) && statusFilters.length === nonF4.length;
      setStatusFilters(isCurrentlyNonF4 ? [] : nonF4);
    }
  };

  const filteredProjects = baseFilteredProjects.filter(p => supervisorFilter === "ALL" || (p.supervisor || "ไม่ระบุ") === supervisorFilter);
  const totalF4OfAll = filteredProjects.filter(p => p.status === 'F4').length;
  
  const supervisorStats = supervisors.map(sup => {
    const supProjects = baseFilteredProjects.filter(p => (p.supervisor || "ไม่ระบุ") === sup);
    const total = supProjects.length;
    const f4 = supProjects.filter(p => p.status === 'F4').length;
    const percentage = total > 0 ? (f4 / total) * 100 : 0;
    return { name: sup, total, f4, percentage };
  }).filter(s => s.total > 0).sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return b.f4 - a.f4;
  });


  if (loading) {
    return (
      <>
        <TopBar title="ภาพรวมงานก่อสร้างของ ผกร.กรย.(ก3)" />
        <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>กำลังโหลดข้อมูล...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="ภาพรวมงานก่อสร้างของ ผกร.กรย.(ก3)" />

      <div className="content-area animation-fade-in">
        {/* Print Header */}
        <div id="reportPrintHeader" style={{ display: 'none', marginBottom: '20px' }}>
          <h4 style={{ color: "var(--pea-purple)" }}>รายงานสรุปสถานะงานก่อสร้าง ผกร.กรย.(ก3) ประจำปี 2569</h4>
          <p>วันที่พิมพ์: {new Date().toLocaleString('th-TH')}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>


          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div 
              className="stat-card" 
              onClick={() => handleStatusClick('ALL')}
              style={{ borderTop: '4px solid var(--pea-purple)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: statusFilters.length === 0 ? '0 4px 12px rgba(116, 56, 163, 0.2)' : 'none', outline: statusFilters.length === 0 ? '2px solid var(--pea-purple)' : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div className="stat-icon-wrapper" style={{ background: 'var(--pea-purple-soft)', color: 'var(--pea-purple)', marginBottom: '16px', padding: '16px', borderRadius: '50%' }}>
                  <Home size={36} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-title" style={{ fontSize: '1.15rem' }}>โครงการทั้งหมด</div>
                  <div className="stat-value" style={{ color: 'var(--pea-purple)', fontSize: '3rem', margin: '8px 0' }}>{projectsForTopCards.length}</div>
                  <div className="stat-subtitle" style={{ fontSize: '1rem' }}>โครงการ</div>
                </div>
              </div>
              <div style={{ width: '100%', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="stat-subtitle" style={{ fontSize: '0.95rem' }}>งบประมาณรวม</span>
                <span style={{ fontWeight: '600', color: 'var(--pea-purple)', fontSize: '1.1rem' }}>฿ {formatNumber(projectsForTopCards.reduce((sum, p) => sum + (Number(p.value) || 0), 0))}</span>
              </div>
            </div>

            <div 
              className="stat-card" 
              onClick={() => handleStatusClick('F4')}
              style={{ borderTop: '4px solid #10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: (statusFilters.includes('F4') && statusFilters.length === 1) ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none', outline: (statusFilters.includes('F4') && statusFilters.length === 1) ? '2px solid #10b981' : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div className="stat-icon-wrapper" style={{ background: '#d1fae5', color: '#10b981', marginBottom: '16px', padding: '16px', borderRadius: '50%' }}>
                  <CheckCircle2 size={36} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-title" style={{ fontSize: '1.15rem' }}>สถานะ F4 (ปิดงาน)</div>
                  <div className="stat-value" style={{ color: '#059669', fontSize: '3rem', margin: '8px 0' }}>{projectsForTopCards.filter(p => p.status === 'F4').length}</div>
                  <div className="stat-subtitle" style={{ fontSize: '1rem' }}>โครงการ</div>
                </div>
              </div>
              <div style={{ width: '100%', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="stat-subtitle" style={{ fontSize: '0.95rem' }}>งบประมาณรวม</span>
                <span style={{ fontWeight: '600', color: '#059669', fontSize: '1.1rem' }}>฿ {formatNumber(projectsForTopCards.filter(p => p.status === 'F4').reduce((sum, p) => sum + (Number(p.value) || 0), 0))}</span>
              </div>
            </div>

            <div 
              className="stat-card" 
              onClick={() => handleStatusClick('OTHER')}
              style={{ borderTop: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: (statusFilters.length > 0 && !statusFilters.includes('F4')) ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none', outline: (statusFilters.length > 0 && !statusFilters.includes('F4')) ? '2px solid #f59e0b' : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706', marginBottom: '16px', padding: '16px', borderRadius: '50%' }}>
                  <CircleDashed size={36} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-title" style={{ fontSize: '1.15rem' }}>สถานะอื่นๆ</div>
                  <div className="stat-value" style={{ color: '#d97706', fontSize: '3rem', margin: '8px 0' }}>{projectsForTopCards.filter(p => p.status !== 'F4').length}</div>
                  <div className="stat-subtitle" style={{ fontSize: '1rem' }}>โครงการ</div>
                </div>
              </div>
              <div style={{ width: '100%', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="stat-subtitle" style={{ fontSize: '0.95rem' }}>งบประมาณรวม</span>
                <span style={{ fontWeight: '600', color: '#d97706', fontSize: '1.1rem' }}>฿ {formatNumber(projectsForTopCards.filter(p => p.status !== 'F4').reduce((sum, p) => sum + (Number(p.value) || 0), 0))}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '20px' }}>

            {/* Recharts Pie Chart */}
            <div className="card" style={{ minWidth: 0, marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', alignSelf: 'flex-start', color: 'var(--text-dark)' }}>ความคืบหน้าตามสถานะ</h3>
              
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'F4 (ปิดงาน)', value: filteredProjects.filter(p => p.status === 'F4').length },
                        { name: 'D1', value: filteredProjects.filter(p => p.status === 'D1').length },
                        { name: 'อื่นๆ', value: filteredProjects.filter(p => p.status !== 'F4' && p.status !== 'D1').length }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => (percent && percent > 0) ? `${name} ${(percent * 100).toFixed(0)}%` : null}
                      onClick={(entry) => {
                        if (entry.name === 'F4 (ปิดงาน)') {
                          handleStatusClick('F4');
                        } else if (entry.name === 'D1') {
                          handleStatusClick('D1');
                        } else {
                          // For 'อื่นๆ' in pie chart
                          const nonF4D1 = statuses.filter(s => s !== 'F4' && s !== 'D1');
                          const isCurrentlyOthers = nonF4D1.every(o => statusFilters.includes(o)) && statusFilters.length === nonF4D1.length;
                          setStatusFilters(isCurrentlyOthers ? [] : nonF4D1);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="var(--pea-purple)" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#1e293b', fontWeight: '600' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Supervisor Comparison Progress Bar Cards */}
            {supervisorStats.length > 0 && (
              <div className="card animation-fade-in" style={{ marginBottom: '32px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="var(--pea-purple)" />
                  เปรียบเทียบผลงานการปิดงาน (F4) ของช่างแต่ละคน
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                  {supervisorStats.map(stat => (
                    <div 
                      key={stat.name} 
                      onClick={() => supervisorFilter === stat.name ? setSupervisorFilter("ALL") : setSupervisorFilter(stat.name)}
                      style={{ 
                        border: supervisorFilter === stat.name ? '2px solid var(--pea-purple)' : '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        background: supervisorFilter === stat.name ? '#f5f3ff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: supervisorFilter === stat.name ? '0 4px 12px rgba(116, 56, 163, 0.1)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', color: supervisorFilter === stat.name ? 'var(--pea-purple)' : '#1e293b' }}>{stat.name}</span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: '700', color: stat.percentage === 100 ? '#10b981' : (stat.percentage > 50 ? '#f59e0b' : '#ef4444') }}>
                            {stat.percentage.toFixed(1)}%
                          </span>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>(อัตราการปิดงานสำเร็จ)</div>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${stat.percentage}%`, 
                          background: stat.percentage === 100 ? '#10b981' : (stat.percentage > 50 ? '#f59e0b' : '#ef4444') 
                        }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                        <span>จำนวนงานทั้งหมด: <strong style={{ color: '#1e293b' }}>{stat.total}</strong> โครงการ</span>
                        <span>ปิดงาน F4 แล้ว: <strong style={{ color: '#10b981' }}>{stat.f4}</strong> โครงการ</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "14px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  หมายเหตุ: คลิกเลือกที่ชื่อช่างเพื่อดูงานที่รับผิดชอบ คลิกซ้ำเพื่อยกเลิกและดูงานทั้งหมด
                </div>
              </div>
            )}
          </div>

            {/* Filters Card */}
            <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
              <div>
                <label className="form-label">🔎 ค้นหาข้อมูลงานก่อสร้าง</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="พิมพ์คำเพื่อค้นหา..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <label className="form-label">📌 กรองตามสถานะ</label>
                  <div 
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className="form-control"
                    style={{ background: "white", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                  >
                    <span>{statusFilters.length === 0 ? "แสดงทั้งหมด" : `${statusFilters.length} สถานะ`}</span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>▼</span>
                  </div>
                  
                  {isStatusDropdownOpen && (
                    <>
                      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} onClick={() => setIsStatusDropdownOpen(false)}></div>
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", background: "white", border: "1px solid #cbd5e1", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", zIndex: 10, maxHeight: "250px", overflowY: "auto" }}>
                        <div 
                          style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: statusFilters.length === 0 ? "#f0fdf4" : "transparent" }}
                          onClick={() => { setStatusFilters([]); setIsStatusDropdownOpen(false); }}
                        >
                          <input type="checkbox" checked={statusFilters.length === 0} readOnly style={{ cursor: 'pointer' }} />
                          <span>แสดงทั้งหมด</span>
                        </div>
                        {statuses.map(s => (
                          <label key={s} style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", margin: 0, background: statusFilters.includes(s) ? "#f8fafc" : "transparent" }}>
                            <input 
                              type="checkbox" 
                              checked={statusFilters.includes(s)} 
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStatusFilters([...statusFilters, s]);
                                } else {
                                  setStatusFilters(statusFilters.filter(st => st !== s));
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: '#1e293b' }}>{s}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <label className="form-label">👷 กรองตามชื่อช่าง</label>
                  <select className="form-select" value={supervisorFilter} onChange={(e) => setSupervisorFilter(e.target.value)}>
                    <option value="ALL">แสดงทั้งหมด</option>
                    {supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">🗓️ กรองปีที่เปิดงาน</label>
                  <select className="form-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                    <option value="ALL">แสดงทุกปี</option>
                    <option value="BEFORE_2568">ก่อนปี 2568</option>
                    <option value="2568">ปี 2568</option>
                    <option value="2569">ปี 2569</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">🏁 กรองแผนปิดงาน</label>
                  <select className="form-select" value={closingPlanFilter} onChange={(e) => setClosingPlanFilter(e.target.value)}>
                    <option value="ALL">แสดงทั้งหมด</option>
                    <option value="ไม่ได้กำหนด">ไม่ได้กำหนด</option>
                    {["ม.ค. 69", "ก.พ. 69", "มี.ค. 69", "เม.ย. 69", "พ.ค. 69", "มิ.ย. 69", "ก.ค. 69", "ส.ค. 69", "ก.ย. 69", "ต.ค. 69", "พ.ย. 69", "ธ.ค. 69"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label className="form-label">📅 กรองประจำเดือน</label>
                  <select className="form-select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                    <option value="ALL">แสดงทุกเดือน</option>
                    {["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">🚨 กรองสาย ป.</label>
                  <select className="form-select" value={pTrackingFilter} onChange={(e) => setPTrackingFilter(e.target.value)}>
                    <option value="ALL">แสดงทั้งหมด</option>
                    <option value="TRACKED">เฉพาะที่ สาย ป. ติดตาม</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">📊 กรองแผนปฏิบัติการ</label>
                  <select className="form-select" value={actionPlanFilter} onChange={(e) => setActionPlanFilter(e.target.value)}>
                    <option value="ALL">แสดงทั้งหมด</option>
                    <option value="ไม่ได้กำหนด">ไม่ได้กำหนด</option>
                    <option value="ยังไม่ดำเนินการ">ยังไม่ดำเนินการ</option>
                    <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 1">ก่อสร้างแล้วเสร็จภายในไตรมาส 1</option>
                    <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 2">ก่อสร้างแล้วเสร็จภายในไตรมาส 2</option>
                    <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 3">ก่อสร้างแล้วเสร็จภายในไตรมาส 3</option>
                    <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 4">ก่อสร้างแล้วเสร็จภายในไตรมาส 4</option>
                    <option value="ไม่เสร็จในปี 2569">ไม่เสร็จในปี 2569</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={handlePrint} style={{ width: '100%' }}>
                  🖨️ พิมพ์
                </button>
              </div>
            </div>
          </div>




        <div className="card table-responsive" style={{ padding: "0" }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th style={{ width: "14%", paddingLeft: "24px" }}>WBS / ข้อมูลปี</th>
                <th style={{ width: "20%" }}>ชื่องาน / ผู้คุมงาน</th>
                <th style={{ width: "11%", textAlign: "center" }}>มูลค่า (บาท)</th>
                <th style={{ width: "7%", textAlign: "center" }}>สถานะ</th>
                <th style={{ width: "28%", textAlign: "center" }}>ความคืบหน้า (หน้างาน / 8 ขั้นตอน)</th>
                <th style={{ width: "12%" }}>ประวัติหมายเหตุ</th>
                <th style={{ width: "8%", textAlign: "center", paddingRight: "24px" }}>รูปภาพ</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-light)", padding: "40px" }}>ไม่พบข้อมูลโครงการที่ค้นหา</td></tr>
              ) : (
                filteredProjects.map((p) => {
                  const steps = [
                    { checked: p.check1, label: 'ก่อสร้างเสร็จ', failLabel: 'ไม่เสร็จ' },
                    { checked: p.check2, label: 'ส่งคืนเศษสายแล้ว', failLabel: 'ยังไม่ส่งคืนเศษสาย' },
                    { checked: p.check3, label: 'ส่งคืนเศษเหล็กแล้ว', failLabel: 'ยังไม่ส่งคืนเศษเหล็ก' },
                    { checked: p.check4, label: 'ทำ PM/ADS แล้ว', failLabel: 'ยังไม่ทำ PM/ADS' },
                    { checked: p.check5, label: 'ตรวจมาตรฐานแล้ว', failLabel: 'ยังไม่ตรวจมาตรฐาน' },
                    { checked: p.check6, label: 'ใบสำคัญจ่ายครบแล้ว', failLabel: 'ใบสำคัญจ่ายไม่ครบ' },
                    { checked: p.check7, label: 'ขออนุมัติโอนงบแล้ว', failLabel: 'ยังไม่ขออนุมัติโอนงบ' },
                    { checked: p.check8, label: 'ปรับแผนผังและประมาณการแล้ว', failLabel: 'ยังไม่ปรับแผนผังและประมาณการ' }
                  ];
                  const doneCount = steps.filter(s => s.checked).length;
                  const progressPercent = (doneCount / 8) * 100;

                  return (
                    <tr key={p.id}>
                      <td data-label="WBS / ข้อมูลปี" style={{ paddingLeft: "24px" }}>
                        <div style={{ color: "var(--pea-purple)", fontWeight: "600" }}>{p.wbs}</div>
                        <div style={{ color: "var(--text-light)", fontSize: "0.8rem", marginTop: "4px" }}>เปิดปี: {p.open_year || '-'} <br />เกณฑ์: {p.year_criteria || '-'}</div>
                      </td>
                      <td data-label="ชื่องาน / ผู้คุมงาน">
                        <div style={{ fontWeight: "600", color: "var(--text-dark)" }}>{p.name}</div>
                        <div style={{ color: "var(--text-light)", fontSize: "0.8rem", marginTop: "4px" }}>ผู้คุมงาน: {p.supervisor} | {p.project_type}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-light)", marginTop: "4px" }}>
                          เปิดงานปี: {p.open_year || "-"}
                        </div>
                        {p.p_tracking && p.p_tracking !== "" && p.p_tracking !== "ไม่ติดตาม" && <div style={{ marginTop: "6px" }}><span className="badge badge-danger">🚨 {p.p_tracking}</span></div>}
                      </td>
                      <td data-label="มูลค่า (บาท)" style={{ textAlign: "center", fontWeight: "600", color: "#047857" }}>
                        {formatNumber(p.value)}
                      </td>
                      <td data-label="สถานะ" style={{ textAlign: "center" }}>
                        <span className={`badge ${p.status === "F4" ? "badge-success" : "badge-warning"}`}>{p.status || "-"}</span>
                      </td>
                      <td data-label="ความคืบหน้า (หน้างาน / 8 ขั้นตอน)">
                        {/* Physical Progress */}
                        {(() => {
                          const type = p.construction_type || "1";
                          const physicalProgress = (() => {
                            if (type === "5") return p.manual_progress || 0;
                            const w = type === "2" ? [20, 30, 25, 25, 0, 0] : (type === "3" ? [20, 25, 25, 20, 0, 10] : (type === "4" ? [0, 0, 50, 50, 0, 0] : [15, 25, 20, 20, 10, 10]));
                            const targets = [p.step1_target, p.step2_target, p.step3_target, p.step4_target, p.step5_target, p.step6_target].map(val => Number(val) || 0);
                            const dones = [p.step1_done, p.step2_done, p.step3_done, p.step4_done, p.step5_done, p.step6_done].map(val => Number(val) || 0);

                            return dones.reduce((sum, doneVal, idx) => {
                              const targetVal = targets[idx];
                              if (targetVal === 0 || w[idx] === 0) return sum;
                              const percent = (doneVal / targetVal);
                              const cappedPercent = Math.min(1, percent);
                              return sum + (cappedPercent * w[idx]);
                            }, 0);
                          })();

                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', minWidth: '40px', textAlign: 'left' }}>หน้างาน:</span>
                              <div style={{ background: "#f1f5f9", height: "6px", borderRadius: "4px", overflow: "hidden", flex: 1, maxWidth: '100px' }}>
                                <div style={{ height: "100%", width: `${physicalProgress}%`, backgroundColor: physicalProgress === 100 ? "#10b981" : (physicalProgress > 50 ? "#3b82f6" : "#8b5cf6") }}></div>
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--pea-purple)', minWidth: '35px', textAlign: 'right' }}>
                                {physicalProgress.toFixed(1)}%
                              </span>
                            </div>
                          );
                        })()}

                        {/* Admin 8 Steps Progress */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', minWidth: '40px', textAlign: 'left' }}>เอกสาร:</span>
                          <div style={{ background: "#f1f5f9", height: "6px", borderRadius: "4px", overflow: "hidden", flex: 1, maxWidth: '100px' }}>
                            <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? "#10b981" : (progressPercent > 50 ? "#f59e0b" : "#ef4444") }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-dark)', minWidth: '35px', textAlign: 'right' }}>
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                        <div style={{ fontSize: "0.65rem", display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
                          {steps.map((s, idx) => (
                            s.checked
                              ? <span key={idx} style={{ color: "#047857", background: "#d1fae5", padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }}>✓ {s.label}</span>
                              : null // Hide unchecked steps to save space and look cleaner like the design
                          ))}
                        </div>
                      </td>
                      <td data-label="ประวัติหมายเหตุ">
                        <div style={{ maxHeight: "100px", overflowY: "auto", fontSize: "0.8rem", whiteSpace: "pre-wrap", color: "var(--text-light)" }}>
                          {(() => {
                            if (!p.remarks) return "-";
                            const lines = p.remarks.split('\n');
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
                            return newLines.join('\n');
                          })()}
                        </div>
                      </td>
                      <td data-label="รูปภาพ" style={{ textAlign: "center", paddingRight: "24px" }}>
                        {p.image_url ? <a href={p.image_url} target="_blank" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "8px" }}>รูปภาพ</a> : <span style={{ color: "var(--text-light)", fontSize: "0.8rem" }}>-</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
