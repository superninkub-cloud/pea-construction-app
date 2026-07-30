"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";

export default function Overview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [statuses, setStatuses] = useState<string[]>([]);

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
    const s = p.status || "ไม่มีข้อมูล";
    const matchStatus = statusFilter === "ALL" || s === statusFilter;
    const matchMonth = monthFilter === "ALL" || (p.remarks && p.remarks.includes(`[${monthFilter}`));
    const matchSearch = Object.values(p).some((val) => 
      val && val.toString().toLowerCase().includes(search.toLowerCase())
    );
    return matchStatus && matchMonth && matchSearch;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="animation-fade-in">
      {/* Print Header (Hidden on screen, visible on print via CSS) */}
      <div id="reportPrintHeader" style={{ display: 'none', marginBottom: '20px' }}>
        <h4 style={{ color: "var(--pea-purple)" }}>รายงานสรุปสถานะงานก่อสร้าง ผกร.กรย.(ก3) ประจำปี 2569</h4>
        <p>วันที่พิมพ์: {new Date().toLocaleString('th-TH')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="dashboard-summary-card">
          <h6>แสดงผล (โครงการ)</h6>
          <h2>{filteredProjects.length}</h2>
        </div>

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

        <div>
          <label className="form-label">📌 กรองตามสถานะ</label>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">แสดงทั้งหมด</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="form-label">📅 กรองประจำเดือน</label>
          <select className="form-select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="ALL">แสดงทุกเดือน</option>
            {["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-success" style={{ width: '100%', height: '42px' }} onClick={handlePrint}>
            📊 ออกรายงาน PDF
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table-custom">
          <thead>
            <tr>
              <th width="14%">WBS / ข้อมูลปี</th>
              <th width="20%">ชื่องาน / ผู้คุมงาน</th>
              <th width="11%" style={{ textAlign: "center" }}>มูลค่า (บาท)</th>
              <th width="7%" style={{ textAlign: "center" }}>สถานะ</th>
              <th width="28%" style={{ textAlign: "center" }}>ความคืบหน้า (8 ขั้นตอน)</th>
              <th width="12%">ประวัติหมายเหตุรายเดือน</th>
              <th width="8%" style={{ textAlign: "center" }}>รูปภาพ</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "red", padding: "20px" }}>ไม่พบข้อมูลโครงการ</td></tr>
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
                    <td>
                      <div style={{ color: "var(--pea-purple)", fontWeight: "bold" }}>{p.wbs}</div>
                      <small style={{ color: "var(--text-light)" }}>ปีเปิด: {p.open_year || '-'}<br/>เกณฑ์: {p.year_criteria || '-'}</small>
                    </td>
                    <td>
                      <div style={{ fontWeight: "bold" }}>{p.name}</div>
                      <small style={{ color: "var(--text-light)" }}>ผู้คุมงาน: {p.supervisor} | {p.project_type}</small><br/>
                      {p.p_tracking === "ติดตาม" && <span className="badge badge-status" style={{ background: "#ef4444", color: "white" }}>🚨 สาย ป ติดตาม</span>}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "bold", color: "#10b981" }}>
                      {formatNumber(p.value)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`badge ${p.status === "F4" ? "badge-success" : "badge-status"}`}>{p.status || "ไม่มีข้อมูล"}</span>
                    </td>
                    <td>
                      <div style={{ background: "#e2e8f0", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
                         <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? "#10b981" : "var(--pea-purple)" }}></div>
                      </div>
                      <div style={{ fontSize: "0.75rem", display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
                         {steps.map((s, idx) => (
                           s.checked 
                            ? <span key={idx} className="badge badge-success">✓ {s.label}</span> 
                            : <span key={idx} className="badge" style={{ background: "#f1f5f9", border: "1px solid #cbd5e1" }}>✗ {s.failLabel}</span>
                         ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxHeight: "150px", overflowY: "auto", fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
                         {p.remarks || "-"}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {p.image_url ? <a href={p.image_url} target="_blank" className="btn btn-pea" style={{ padding: "4px 8px", fontSize: "0.8rem" }}>ดูรูป</a> : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .container-main, .container-main * { visibility: visible; }
          .container-main { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: none; box-shadow: none; }
          .nav-tabs, .dashboard-summary-card, .btn, select, input { display: none !important; }
          #reportPrintHeader { display: block !important; }
        }
      `}</style>
    </div>
  );
}
