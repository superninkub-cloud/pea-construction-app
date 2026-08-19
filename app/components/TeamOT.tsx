"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import TopBar from "./TopBar";

const DropdownTimePicker = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => {
  const [h, m] = value ? value.split(':') : ['', ''];
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "white", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <select value={h} onChange={e => onChange(`${e.target.value}:${m || '00'}`)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', cursor: 'pointer', appearance: 'none', textAlign: 'center', width: '40px' }}>
          <option value="">--</option>
          {Array.from({length: 24}).map((_, i) => {
            const val = i.toString().padStart(2, '0');
            return <option key={val} value={val}>{val}</option>;
          })}
        </select>
        <span style={{ fontWeight: "bold" }}>:</span>
        <select value={m} onChange={e => onChange(`${h || '00'}:${e.target.value}`)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', cursor: 'pointer', appearance: 'none', textAlign: 'center', width: '40px' }}>
          <option value="">--</option>
          {Array.from({length: 60}).map((_, i) => {
            const val = i.toString().padStart(2, '0');
            return <option key={val} value={val}>{val}</option>;
          })}
        </select>
        <span style={{ fontSize: "0.8rem", color: "#64748b", marginLeft: "auto" }}>น.</span>
      </div>
    </div>
  );
};

interface TeamMember {
  id: string;
  full_name: string;
  wage: number;
  selected: boolean;
  days: number;
  ot15: number;
  ot20: number;
  ot30: number;
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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isHoliday, setIsHoliday] = useState(false);
  const [calculatedHours, setCalculatedHours] = useState<number>(0);

  useEffect(() => {
    if (startTime && endTime && startDate) {
      const dateObj = new Date(startDate);
      const isSunday = dateObj.getDay() === 0;
      const isHolidayOrSunday = isSunday || isHoliday;

      const [h1, m1] = startTime.split(':').map(Number);
      const [h2, m2] = endTime.split(':').map(Number);
      let d1 = new Date(); d1.setHours(h1, m1, 0, 0);
      let d2 = new Date(); d2.setHours(h2, m2, 0, 0);
      if (d2 < d1) d2.setDate(d2.getDate() + 1); // Cross midnight
      
      // Auto-allocate hours
      let bucketA = 0; // 08:00 - 17:00
      let bucketB = 0; // 17:00 - 08:00
      let totalMinutes = 0;

      let current = new Date(d1);
      while (current < d2) {
        const h = current.getHours();
        if (h !== 12) { // ไม่นับเวลา 12:00 - 13:00 (พักเที่ยง)
          if (h >= 8 && h < 17) bucketA++;
          else bucketB++;
          totalMinutes++;
        }
        current.setMinutes(current.getMinutes() + 1);
      }
      
      setCalculatedHours(totalMinutes > 0 ? totalMinutes / 60 : 0);

      let hA = bucketA / 60;
      let hB = bucketB / 60;

      let ot15 = 0;
      let ot20 = 0;
      let ot30 = 0;

      if (isHolidayOrSunday) {
        ot20 = Math.round(hA * 100) / 100;
        ot30 = Math.round(hB * 100) / 100;
      } else {
        ot15 = Math.round(hB * 100) / 100;
      }

      setMembers(prev => prev.map(m => m.selected ? { ...m, ot15, ot20, ot30 } : m));

    } else {
      setCalculatedHours(0);
    }
  }, [startTime, endTime, startDate, isHoliday]);

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
        days: defaultDays,
        ot15: 0,
        ot20: 0,
        ot30: 0
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

  const handleMemberOTChange = (id: string, field: 'ot15' | 'ot20' | 'ot30', value: number) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const calculateTotals = () => {
    const activeMembers = members.filter(m => m.selected);
    
    let totalBaseWage = 0;
    let totalOT15 = 0;
    let totalOT20 = 0;
    let totalOT30 = 0;
    
    let sumOT15H = 0;
    let sumOT20H = 0;
    let sumOT30H = 0;

    activeMembers.forEach(m => {
      // Base wage for the period
      totalBaseWage += m.wage * m.days;
      
      // Hourly rate
      const hourlyRate = m.wage / 8;
      
      // OT for this member
      totalOT15 += hourlyRate * 1.5 * m.ot15;
      totalOT20 += hourlyRate * 2.0 * m.ot20;
      totalOT30 += hourlyRate * 3.0 * m.ot30;
      
      sumOT15H += m.ot15;
      sumOT20H += m.ot20;
      sumOT30H += m.ot30;
    });

    return {
      totalBaseWage,
      totalOT15,
      totalOT20,
      totalOT30,
      totalOT: totalOT15 + totalOT20 + totalOT30,
      grandTotal: totalBaseWage + totalOT15 + totalOT20 + totalOT30,
      activeCount: activeMembers.length,
      sumOT15H,
      sumOT20H,
      sumOT30H
    };
  };

  const results = calculateTotals();

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "0 0 40px 0", background: "#f8fafc" }}>
      <TopBar title="โปรแกรมคำนวณ OT พนักงาน บ." />
      
      <div className="no-print" style={{ padding: "0 32px", maxWidth: "1200px", margin: "0 auto", marginTop: "24px" }}>
        
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
                
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", color: "#334155", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <input type="checkbox" checked={isHoliday} onChange={e => setIsHoliday(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    ระบุว่าเป็นวันหยุดนักขัตฤกษ์ (สำหรับวันจันทร์-เสาร์)
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                  <DropdownTimePicker label="เวลาเริ่มต้น" value={startTime} onChange={setStartTime} />
                  <DropdownTimePicker label="เวลาสิ้นสุด" value={endTime} onChange={setEndTime} />
                </div>

                {calculatedHours > 0 && (
                  <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "0.9rem", color: "#166534", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", flexWrap: "wrap", gap: "12px" }}>
                    <span>ระยะเวลาที่คำนวณได้: <strong>{calculatedHours.toFixed(2)} ชั่วโมง</strong></span>
                    <span style={{ fontSize: "0.8rem" }}>(ระบบได้จัดสรรชั่วโมงลงในช่อง OT ให้แล้ว)</span>
                  </div>
                )}

                <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "0.9rem", color: "#1e3a8a", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                  <span>จำนวนวันทำงานตั้งต้น:</span>
                  <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>{defaultDays} วัน</span>
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
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px", borderRadius: "12px", border: `1px solid ${m.selected ? '#34d399' : '#e2e8f0'}`, background: m.selected ? '#f0fdf4' : '#f8fafc', transition: "all 0.2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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

                      {/* Individual OT Inputs */}
                      {m.selected && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "8px", paddingTop: "12px", borderTop: "1px dashed #cbd5e1" }}>
                          <div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "4px", textAlign: "center" }}>OT 1.5</div>
                            <input 
                              type="number" 
                              min="0"
                              value={m.ot15 === 0 ? "" : m.ot15}
                              onChange={(e) => handleMemberOTChange(m.id, 'ot15', Number(e.target.value))}
                              placeholder="0"
                              style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "center", fontSize: "0.9rem" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.75rem", color: "#2563eb", marginBottom: "4px", textAlign: "center" }}>OT 2.0</div>
                            <input 
                              type="number" 
                              min="0"
                              value={m.ot20 === 0 ? "" : m.ot20}
                              onChange={(e) => handleMemberOTChange(m.id, 'ot20', Number(e.target.value))}
                              placeholder="0"
                              style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "center", fontSize: "0.9rem" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "4px", textAlign: "center" }}>OT 3.0</div>
                            <input 
                              type="number" 
                              min="0"
                              value={m.ot30 === 0 ? "" : m.ot30}
                              onChange={(e) => handleMemberOTChange(m.id, 'ot30', Number(e.target.value))}
                              placeholder="0"
                              style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "center", fontSize: "0.9rem" }}
                            />
                          </div>
                        </div>
                      )}
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
                
                <button onClick={() => window.print()} className="btn btn-primary" style={{ marginTop: "16px", borderRadius: "20px", padding: "8px 16px", fontSize: "0.85rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Export PDF
                </button>

                <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "12px" }}>
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
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{results.sumOT15H || "0"} ชม. (คิดจากเรทรายบุคคล)</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                    {results.totalOT15.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "8px" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#2563eb" }}>ค่าล่วงเวลา 2.0 เท่า รวม</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{results.sumOT20H || "0"} ชม. (คิดจากเรทรายบุคคล)</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2563eb" }}>
                    {results.totalOT20.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "8px" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>ค่าล่วงเวลา 3.0 เท่า รวม</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{results.sumOT30H || "0"} ชม. (คิดจากเรทรายบุคคล)</div>
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

      {/* Print Document View */}
      <div className="print-only" style={{ padding: "40px", color: "black", background: "white", width: "100%", maxWidth: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18pt", fontWeight: "bold", marginBottom: "8px" }}>รายการคำนวณค่าล่วงเวลาพนักงาน บ.</h2>
          <p style={{ fontSize: "12pt", marginBottom: "4px" }}><strong>ชุดงาน:</strong> {selectedTeam || '-'}</p>
          <p style={{ fontSize: "12pt", marginBottom: "4px" }}>
            <strong>วันที่ปฏิบัติงาน:</strong> {startDate || '-'} {endDate && endDate !== startDate ? `ถึง ${endDate}` : ''} (จำนวน {defaultDays} วัน)
          </p>
          <p style={{ fontSize: "12pt" }}>
            <strong>เวลา:</strong> {startTime ? startTime.replace(':', '.') : '-'} น. ถึง {endTime ? endTime.replace(':', '.') : '-'} น.
          </p>
        </div>
        
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "32px", fontSize: "11pt" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", background: "#f1f5f9" }}>ลำดับ</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "left", background: "#f1f5f9" }}>ชื่อ-สกุล</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "right", background: "#f1f5f9" }}>ค่าแรง/วัน</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", background: "#f1f5f9" }}>วันทำงาน</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", background: "#f1f5f9" }}>OT 1.5<br/>(ชม.)</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", background: "#f1f5f9" }}>OT 2.0<br/>(ชม.)</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", background: "#f1f5f9" }}>OT 3.0<br/>(ชม.)</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "right", background: "#f1f5f9" }}>รวมสุทธิ<br/>(บาท)</th>
            </tr>
          </thead>
          <tbody>
            {members.filter(m => m.selected).map((m, idx) => {
              const hourlyRate = m.wage / 8;
              const baseWage = m.wage * m.days;
              const ot15Cost = hourlyRate * 1.5 * m.ot15;
              const ot20Cost = hourlyRate * 2.0 * m.ot20;
              const ot30Cost = hourlyRate * 3.0 * m.ot30;
              const totalCost = baseWage + ot15Cost + ot20Cost + ot30Cost;
              
              return (
                <tr key={m.id}>
                  <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>{m.full_name}</td>
                  <td style={{ border: "1px solid #000", padding: "8px", textAlign: "right" }}>{m.wage.toLocaleString()}</td>
                  <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{m.days}</td>
                  <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{m.ot15 || '-'}</td>
                  <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{m.ot20 || '-'}</td>
                  <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{m.ot30 || '-'}</td>
                  <td style={{ border: "1px solid #000", padding: "8px", textAlign: "right" }}>{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
            {members.filter(m => m.selected).length === 0 && (
              <tr>
                <td colSpan={8} style={{ border: "1px solid #000", padding: "16px", textAlign: "center", color: "#64748b" }}>ไม่มีข้อมูลพนักงาน</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={7} style={{ border: "1px solid #000", padding: "8px", textAlign: "right", fontWeight: "bold" }}>รวมค่าใช้จ่ายทั้งสิ้น (บาท)</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "right", fontWeight: "bold", background: "#f0fdf4" }}>
                {results.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </th>
            </tr>
          </tfoot>
        </table>
        
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "80px" }}>
          <div style={{ textAlign: "center", width: "220px" }}>
            <div style={{ borderBottom: "1px dashed #000", height: "1px", marginBottom: "12px" }}></div>
            <div style={{ fontSize: "11pt" }}>ผู้จัดทำ / ผู้ขอเบิก</div>
            <div style={{ fontSize: "10pt", color: "#666", marginTop: "4px" }}>วันที่: ...../...../.....</div>
          </div>
          <div style={{ textAlign: "center", width: "220px" }}>
            <div style={{ borderBottom: "1px dashed #000", height: "1px", marginBottom: "12px" }}></div>
            <div style={{ fontSize: "11pt" }}>ผู้อนุมัติ</div>
            <div style={{ fontSize: "10pt", color: "#666", marginTop: "4px" }}>วันที่: ...../...../.....</div>
          </div>
        </div>
      </div>
    </div>
  );
}
