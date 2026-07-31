"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";
import TopBar from "./TopBar";

export default function Overview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [supervisorFilter, setSupervisorFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [pTrackingFilter, setPTrackingFilter] = useState("ALL");
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

  const filteredProjects = projects.filter((p) => {
    if (p.wbs && (p.wbs.includes("IMPORTANT_TASKS_") || p.wbs.includes("SAFETY_PLAN_"))) return false;
    const s = p.status || "ไม่มีข้อมูล";
    const sup = p.supervisor || "ไม่ระบุ";
    
    const matchYear = true; // year is handled in loop below
    let yearMatched = true;
    if (yearFilter !== "ALL") {
      const year = Number(p.open_year) || 0;
      if (yearFilter === "BEFORE_2568") yearMatched = year > 0 && year < 2568;
      else if (yearFilter === "2568") yearMatched = year === 2568;
      else if (yearFilter === "2569") yearMatched = year === 2569;
    }

    const matchStatus = statusFilter === "ALL" || s === statusFilter;
    const matchMonth = monthFilter === "ALL" || (p.remarks && p.remarks.includes(`[${monthFilter}`));
    const matchSupervisor = supervisorFilter === "ALL" || sup === supervisorFilter;
    const matchPTracking = pTrackingFilter === "ALL" || (pTrackingFilter === "TRACKED" && p.p_tracking && p.p_tracking !== "" && p.p_tracking !== "ไม่ติดตาม");
    const matchSearch = Object.values(p).some((val) => 
      val && val.toString().toLowerCase().includes(search.toLowerCase())
    );
    return matchStatus && matchMonth && matchSupervisor && matchSearch && yearMatched && matchPTracking;
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div className="stat-card">
              <div className="stat-circle">
                 {filteredProjects.length}
              </div>
              <div className="stat-title">โครงการทั้งหมด</div>
              <div className="stat-subtitle">ที่ตรงตามเงื่อนไข</div>
              <div style={{ marginTop: '12px', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--pea-purple)' }}>
                ฿ {formatNumber(filteredProjects.reduce((sum, p) => sum + (Number(p.value) || 0), 0))}
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
              <div className="stat-circle" style={{ color: '#10b981', background: '#d1fae5' }}>
                 {filteredProjects.filter(p => p.status === 'F4').length}
              </div>
              <div className="stat-title" style={{ color: '#047857' }}>สถานะ F4 (ปิดงาน)</div>
              <div className="stat-subtitle">โครงการที่เสร็จสิ้น</div>
              <div style={{ marginTop: '12px', fontSize: '1.1rem', fontWeight: 'bold', color: '#047857' }}>
                ฿ {formatNumber(filteredProjects.filter(p => p.status === 'F4').reduce((sum, p) => sum + (Number(p.value) || 0), 0))}
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div className="stat-circle" style={{ color: '#d97706', background: '#fef3c7' }}>
                 {filteredProjects.filter(p => p.status !== 'F4').length}
              </div>
              <div className="stat-title" style={{ color: '#b45309' }}>สถานะอื่นๆ</div>
              <div className="stat-subtitle">อยู่ระหว่างดำเนินการ</div>
              <div style={{ marginTop: '12px', fontSize: '1.1rem', fontWeight: 'bold', color: '#b45309' }}>
                ฿ {formatNumber(filteredProjects.filter(p => p.status !== 'F4').reduce((sum, p) => sum + (Number(p.value) || 0), 0))}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
            <div>
              <label className="form-label">🔎 ค้นหาอัจฉริยะ</label>
              <input
                type="text"
                className="form-control"
                placeholder="พิมพ์คำเพื่อค้นหา..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">📌 กรองตามสถานะ</label>
                <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="ALL">แสดงทั้งหมด</option>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
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
              <button className="btn btn-primary" onClick={handlePrint}>
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
                <th style={{ width: "28%", textAlign: "center" }}>ความคืบหน้า (8 ขั้นตอน)</th>
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
                    { checked: p.check8, label: 'ปรับแบบแผนผังแล้ว', failLabel: 'ยังไม่ปรับแบบแผนผัง' }
                  ];
                  const doneCount = steps.filter(s => s.checked).length;
                  const progressPercent = (doneCount / 8) * 100;
                  
                  return (
                    <tr key={p.id}>
                      <td style={{ paddingLeft: "24px" }}>
                        <div style={{ color: "var(--pea-purple)", fontWeight: "600" }}>{p.wbs}</div>
                        <div style={{ color: "var(--text-light)", fontSize: "0.8rem", marginTop: "4px" }}>เปิดปี: {p.open_year || '-'} <br/>เกณฑ์: {p.year_criteria || '-'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", color: "var(--text-dark)" }}>{p.name}</div>
                        <div style={{ color: "var(--text-light)", fontSize: "0.8rem", marginTop: "4px" }}>ผู้คุมงาน: {p.supervisor} | {p.project_type}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-light)", marginTop: "4px" }}>
                          เปิดงานปี: {p.open_year || "-"}
                        </div>
                        {p.p_tracking && p.p_tracking !== "" && p.p_tracking !== "ไม่ติดตาม" && <div style={{ marginTop: "6px" }}><span className="badge badge-danger">🚨 {p.p_tracking}</span></div>}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "600", color: "#047857" }}>
                        {formatNumber(p.value)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge ${p.status === "F4" ? "badge-success" : "badge-warning"}`}>{p.status || "-"}</span>
                      </td>
                      <td>
                        <div style={{ background: "#f1f5f9", height: "6px", borderRadius: "4px", overflow: "hidden", marginBottom: "10px", width: "80%", margin: "0 auto 10px auto" }}>
                           <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? "#10b981" : "var(--pea-purple)" }}></div>
                        </div>
                        <div style={{ fontSize: "0.7rem", display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
                           {steps.map((s, idx) => (
                             s.checked 
                              ? <span key={idx} style={{ color: "#047857", background: "#d1fae5", padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }}>✓ {s.label}</span> 
                              : <span key={idx} style={{ color: "#94a3b8", background: "#f8fafc", padding: "2px 6px", borderRadius: "4px" }}>✗ {s.failLabel}</span>
                           ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ maxHeight: "100px", overflowY: "auto", fontSize: "0.8rem", whiteSpace: "pre-wrap", color: "var(--text-light)" }}>
                           {p.remarks || "-"}
                        </div>
                      </td>
                      <td style={{ textAlign: "center", paddingRight: "24px" }}>
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
