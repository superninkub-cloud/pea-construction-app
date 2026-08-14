"use client";

import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { supabase } from "../../lib/supabaseClient";
import { wireDataList } from "../../lib/wireData";
import { Project } from "../../lib/types";

export default function WireReturnPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").order("wbs");
      if (data) {
        // Filter projects that have scrap wire info
        const filtered = data.filter((p: any) => p.scrap_wire_type || p.scrap_wire_length > 0);
        setProjects(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "16px" }}>รายการงานก่อสร้างที่ต้องส่งคืนเศษสาย</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }}>
              {projectStats.map(p => (
                <div key={p.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: p.percentage >= 100 ? '#10b981' : (p.percentage > 0 ? '#f59e0b' : '#ef4444') }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--pea-purple)' }}>{p.wbs}</span>
                    <span className={`badge ${p.check2 ? "badge-success" : "badge-warning"}`}>{p.check2 ? "ส่งคืนแล้ว (เอกสาร)" : "ยังไม่ส่งคืน (เอกสาร)"}</span>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-dark)', marginBottom: '16px' }}>{p.name}</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light)' }}>ชนิดสายไฟ:</span>
                      <span style={{ fontWeight: '500' }}>{wireDataList.find(w => w.id === p.scrap_wire_type)?.name || p.scrap_wire_type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light)' }}>ระยะทางที่รื้อถอน:</span>
                      <span style={{ fontWeight: '500' }}>{p.scrap_wire_length} กม.</span>
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
                    <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: '600', color: p.percentage >= 100 ? '#10b981' : 'var(--pea-purple)' }}>
                      {p.percentage.toLocaleString(undefined, { maximumFractionDigits: 2 })}%
                    </div>
                  </div>
                </div>
              ))}
              
              {projectStats.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                  ยังไม่มีข้อมูลงานก่อสร้างที่มีการรื้อถอนเศษสาย (กรุณากรอกข้อมูลในหน้าอัพเดทสถานะงาน)
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
