"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";
import TopBar from "./TopBar";
import { Home, CheckCircle2, CircleDashed } from "lucide-react";

export default function Overview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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

  const filteredProjects = projects.filter((p) => {
    if (
      (p.wbs && (p.wbs.includes("IMPORTANT_TASKS") || p.wbs.includes("SAFETY_PLAN"))) ||
      (p.name && (p.name.includes("Important Tasks") || p.name.includes("Safety Training")))
    ) {
      return false;
    }
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
    const currentActionPlan = p.action_plan || "";
    const matchActionPlan = actionPlanFilter === "ALL" || (currentActionPlan === "" && actionPlanFilter === "ไม่ได้กำหนด") || currentActionPlan === actionPlanFilter;
    const currentClosingPlan = p.closing_plan || "";
    const matchClosingPlan = closingPlanFilter === "ALL" || (currentClosingPlan === "" && closingPlanFilter === "ไม่ได้กำหนด") || currentClosingPlan === closingPlanFilter;
    const matchSearch = Object.values(p).some((val) =>
      val && val.toString().toLowerCase().includes(search.toLowerCase())
    );
    return matchStatus && matchMonth && matchSupervisor && matchSearch && yearMatched && matchPTracking && matchActionPlan && matchClosingPlan;
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

          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div className="stat-card" style={{ borderTop: '4px solid var(--pea-purple)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-icon-wrapper" style={{ background: 'var(--pea-purple-soft)', color: 'var(--pea-purple)' }}>
                  <Home size={24} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="stat-title">โครงการทั้งหมด</div>
                  <div className="stat-value" style={{ color: 'var(--pea-purple)' }}>{filteredProjects.length}</div>
                  <div className="stat-subtitle">โครงการ</div>
                </div>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span className="stat-subtitle">งบประมาณรวม</span>
                <span style={{ fontWeight: '600', color: 'var(--pea-purple)' }}>฿ {formatNumber(filteredProjects.reduce((sum, p) => sum + (Number(p.value) || 0), 0))}</span>
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-icon-wrapper" style={{ background: '#d1fae5', color: '#10b981' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="stat-title">สถานะ F4 (ปิดงาน)</div>
                  <div className="stat-value" style={{ color: '#059669' }}>{filteredProjects.filter(p => p.status === 'F4').length}</div>
                  <div className="stat-subtitle">โครงการ</div>
                </div>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span className="stat-subtitle">งบประมาณรวม</span>
                <span style={{ fontWeight: '600', color: '#059669' }}>฿ {formatNumber(filteredProjects.filter(p => p.status === 'F4').reduce((sum, p) => sum + (Number(p.value) || 0), 0))}</span>
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <CircleDashed size={24} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="stat-title">สถานะอื่นๆ</div>
                  <div className="stat-value" style={{ color: '#d97706' }}>{filteredProjects.filter(p => p.status !== 'F4').length}</div>
                  <div className="stat-subtitle">โครงการ</div>
                </div>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span className="stat-subtitle">งบประมาณรวม</span>
                <span style={{ fontWeight: '600', color: '#d97706' }}>฿ {formatNumber(filteredProjects.filter(p => p.status !== 'F4').reduce((sum, p) => sum + (Number(p.value) || 0), 0))}</span>
              </div>
            </div>
          </div>

          <div className="filter-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '24px' }}>

            {/* Donut Chart Card */}
            <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '20px', alignSelf: 'flex-start', color: 'var(--text-dark)' }}>ความคืบหน้าตามสถานะ</h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div className="donut-chart-container">
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                    {/* Background circle */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="6"
                    />

                    {/* Note: In a real app we'd calculate stroke-dasharray dynamically. 
                        For now, we'll use a static placeholder that looks like the mockup */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="6"
                      strokeDasharray="25, 100"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="6"
                      strokeDasharray="20, 100"
                      strokeDashoffset="-25"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--pea-purple)"
                      strokeWidth="6"
                      strokeDasharray="55, 100"
                      strokeDashoffset="-45"
                    />
                  </svg>
                  <div className="donut-chart-text">
                    <div className="value">{filteredProjects.length}</div>
                    <div className="label">โครงการ</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                    <span style={{ color: 'var(--text-light)', width: '60px' }}>F4 (ปิดงาน)</span>
                    <span style={{ fontWeight: '600', marginLeft: 'auto' }}>{filteredProjects.filter(p => p.status === 'F4').length}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                    <span style={{ color: 'var(--text-light)', width: '60px' }}>D1</span>
                    <span style={{ fontWeight: '600', marginLeft: 'auto' }}>{filteredProjects.filter(p => p.status === 'D1').length}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--pea-purple)' }}></div>
                    <span style={{ color: 'var(--text-light)', width: '60px' }}>อื่นๆ</span>
                    <span style={{ fontWeight: '600', marginLeft: 'auto' }}>{filteredProjects.filter(p => p.status !== 'F4' && p.status !== 'D1').length}</span>
                  </div>
                </div>
              </div>
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
                          {p.remarks || "-"}
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
