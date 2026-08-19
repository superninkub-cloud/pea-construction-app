"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import TopBar from "./TopBar";

interface TeamMember {
  id: string;
  full_name: string;
  wage: number;
  selected: boolean;
  days: number;
}

export default function TeamOTComponent() {
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Time and OT Inputs
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [defaultDays, setDefaultDays] = useState<number>(0);

  const [ot15Hours, setOt15Hours] = useState("");
  const [ot10Hours, setOt10Hours] = useState("");
  const [ot30Hours, setOt30Hours] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  // Recalculate days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
      setDefaultDays(diffDays > 0 ? diffDays : 0);
      
      // Update all currently selected members' days if they match the old default
      setMembers(prev => prev.map(m => ({ ...m, days: diffDays > 0 ? diffDays : 0 })));
    }
  }, [startDate, endDate]);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("personnel")
      .select("team")
      .ilike("position", "%พนักงาน บ%");
    
    if (!error && data) {
      const uniqueTeams = Array.from(new Set(data.map(item => item.team).filter(Boolean)));
      setTeams(uniqueTeams);
    }
  };

  const fetchTeamMembers = async (teamName: string) => {
    if (!teamName) {
      setMembers([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("personnel")
      .select("id, full_name, wage")
      .eq("team", teamName)
      .ilike("position", "%พนักงาน บ%");
    
    if (!error && data) {
      setMembers(data.map(p => ({
        id: p.id,
        full_name: p.full_name,
        wage: p.wage ? Number(p.wage) : 0,
        selected: true,
        days: defaultDays
      })));
    }
    setLoading(false);
  };

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const team = e.target.value;
    setSelectedTeam(team);
    fetchTeamMembers(team);
  };

  const toggleMemberSelection = (id: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };

  const handleMemberDaysChange = (id: string, days: number) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, days: days } : m));
  };

  const calculateTotals = () => {
    const activeMembers = members.filter(m => m.selected);
    
    let totalBaseWage = 0;
    let totalOT15 = 0;
    let totalOT10 = 0;
    let totalOT30 = 0;

    const ot15H = Number(ot15Hours) || 0;
    const ot10H = Number(ot10Hours) || 0;
    const ot30H = Number(ot30Hours) || 0;

    activeMembers.forEach(m => {
      // Base wage for the period
      totalBaseWage += m.wage * m.days;
      
      // Hourly rate
      const hourlyRate = m.wage / 8;
      
      // OT for this member
      totalOT15 += hourlyRate * 1.5 * ot15H;
      totalOT10 += hourlyRate * 1.0 * ot10H;
      totalOT30 += hourlyRate * 3.0 * ot30H;
    });

    return {
      totalBaseWage,
      totalOT15,
      totalOT10,
      totalOT30,
      totalOT: totalOT15 + totalOT10 + totalOT30,
      grandTotal: totalBaseWage + totalOT15 + totalOT10 + totalOT30,
      activeCount: activeMembers.length
    };
  };

  const results = calculateTotals();

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "0 0 40px 0", background: "#f8fafc" }}>
      <TopBar title="โปรแกรมคำนวณ OT พนักงาน บ." />
      
      <div style={{ padding: "0 32px", maxWidth: "1200px", margin: "0 auto", marginTop: "24px" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
          {/* Left Column: Form & Member Selection */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Team Selection */}
            <div className="card animation-fade-in" style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                1. เลือกชุดงาน
              </h3>
              
              <div>
                <select 
                  className="form-control" 
                  value={selectedTeam} 
                  onChange={handleTeamChange}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
                >
                  <option value="">-- กรุณาเลือกชุดงาน --</option>
                  {teams.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time Period & OT Input */}
            <div className="card animation-fade-in" style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                2. ระบุช่วงเวลาการทำงานและ OT
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>วันที่เริ่มต้น</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-control" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>วันที่สิ้นสุด</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-control" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>

                <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "0.9rem", color: "#1e3a8a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>จำนวนวันทำงานตั้งต้น:</span>
                  <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>{defaultDays} วัน</span>
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginTop: "4px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>OT 1.5 เท่า (ชั่วโมงรวมของทีม)</label>
                  <input type="number" min="0" value={ot15Hours} onChange={e => setOt15Hours(e.target.value)} className="form-control" placeholder="0" style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }} />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>OT 1.0 เท่า (ชั่วโมงรวมของทีม)</label>
                  <input type="number" min="0" value={ot10Hours} onChange={e => setOt10Hours(e.target.value)} className="form-control" placeholder="0" style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>OT 3.0 เท่า (ชั่วโมงรวมของทีม)</label>
                  <input type="number" min="0" value={ot30Hours} onChange={e => setOt30Hours(e.target.value)} className="form-control" placeholder="0" style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }} />
                </div>
              </div>
            </div>

          </div>

          {/* Middle Column: Member Selection (Appears when team is selected) */}
          {selectedTeam && (
            <div className="card animation-fade-in" style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "fit-content" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
                  3. จัดการรายชื่อพนักงาน
                </span>
                <span style={{ fontSize: "0.85rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "12px", color: "#64748b" }}>
                  {results.activeCount} / {members.length} คน
                </span>
              </h3>
              
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>กำลังโหลดข้อมูล...</div>
              ) : members.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#ef4444" }}>ไม่พบพนักงาน บ. ในชุดงานนี้</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "500px", overflowY: "auto", paddingRight: "4px" }}>
                  {members.map(m => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", border: `1px solid ${m.selected ? '#34d399' : '#e2e8f0'}`, background: m.selected ? '#f0fdf4' : '#f8fafc', transition: "all 0.2s" }}>
                      <input 
                        type="checkbox" 
                        checked={m.selected} 
                        onChange={() => toggleMemberSelection(m.id)}
                        style={{ width: "18px", height: "18px", accentColor: "#10b981", cursor: "pointer" }}
                      />
                      <div style={{ flex: 1, opacity: m.selected ? 1 : 0.5 }}>
                        <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.95rem" }}>{m.full_name}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>ค่าแรง: {m.wage > 0 ? `${m.wage} บ./วัน` : <span style={{color: '#ef4444'}}>ไม่ได้ระบุค่าแรง</span>}</div>
                      </div>
                      
                      {/* Individual Days Input */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: m.selected ? 1 : 0.5 }}>
                        <input 
                          type="number" 
                          min="0"
                          value={m.days}
                          onChange={(e) => handleMemberDaysChange(m.id, Number(e.target.value))}
                          disabled={!m.selected}
                          style={{ width: "60px", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "center" }}
                        />
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>วัน</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Right Column: Receipt / Results */}
          <div className="animation-fade-in">
            <div style={{ background: "white", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", position: "sticky", top: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ width: "64px", height: "64px", background: "#f0fdf4", color: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>สรุปค่าใช้จ่ายทีม</h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "4px" }}>
                  {selectedTeam ? (
                    <span style={{ color: "#2563eb", fontWeight: "600" }}>ชุดงาน: {selectedTeam}</span>
                  ) : (
                    "ยังไม่ได้เลือกชุดงาน"
                  )}
                </p>
                <div style={{ display: "inline-block", background: "#f1f5f9", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", color: "#475569", marginTop: "8px", fontWeight: "500" }}>
                  จำนวนพนักงานที่นำมาคำนวณ: {results.activeCount} คน
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderBottom: "2px dashed #e2e8f0", paddingBottom: "24px", marginBottom: "24px" }}>
                
                {/* Base Wage Total */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>ค่าแรงปกติตามวันทำงาน</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>รวมพนักงาน {results.activeCount} คน</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                    {results.totalBaseWage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                  </div>
                </div>

                {/* OT Totals */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "8px" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>ค่าล่วงเวลา 1.5 เท่า รวม</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{ot15Hours || "0"} ชม. (คิดจากเรทรายบุคคล)</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                    {results.totalOT15.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>ค่าล่วงเวลา 1.0 เท่า รวม</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{ot10Hours || "0"} ชม. (คิดจากเรทรายบุคคล)</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                    {results.totalOT10.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>ค่าล่วงเวลา 3.0 เท่า รวม</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{ot30Hours || "0"} ชม. (คิดจากเรทรายบุคคล)</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                    {results.totalOT30.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "1rem", fontWeight: "700", color: "#1e293b" }}>รวมสุทธิ (Grand Total)</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#10b981" }}>
                  {results.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                </div>
              </div>
              
              <div style={{ marginTop: "24px", padding: "16px", background: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe", fontSize: "0.8rem", color: "#1e3a8a", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span>
                  <strong>หมายเหตุ:</strong> การคิดค่า OT คำนวณจาก (ค่าแรงรายวัน ÷ 8) x เรท x จำนวนชั่วโมง. บุคคลที่ไม่ได้ระบุค่าแรง หรือไม่ได้ถูกเลือก จะไม่ถูกนำมารวมในยอดสรุปนี้
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
