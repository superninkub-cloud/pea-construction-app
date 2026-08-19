"use client";

import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";

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

// Driver Data based on user requirements
const driverTypes = [
  { id: "type2", name: "ชนิดที่ 2", desc: "รถบรรทุกทั่วไป (ไม่ได้ประจำชุดงานก่อสร้าง)", base: 18720, ot15: 117.00, ot10: 78.00, ot30: 234.00, accom: 400 },
  { id: "type2plus", name: "ชนิดที่ 2+", desc: "รถบรรทุกติดเครน (6 ตัน, รถสว่าน)", base: 23820, ot15: 148.88, ot10: 99.25, ot30: 297.75, accom: 400 },
  { id: "type2special", name: "ชนิดที่ 2+พิเศษ", desc: "บังคับเครนพิกัดสูง (25, 30, 35 ตัน/เมตร)", base: 24540, ot15: 153.38, ot10: 102.25, ot30: 306.75, accom: 400 },
  { id: "type3plus", name: "ชนิดที่ 3+", desc: "รถเทรเลอร์ลากจูงติดเครน", base: 27120, ot15: 169.50, ot10: 113.00, ot30: 339.00, accom: 400 }
];

const driversList = [
  { plate: "84-1643 นฐ", desc: "รถสว่านขุดเจาะ", driver: "ณัฐพล พืชพันธ์" },
  { plate: "86-4715 นฐ", desc: "รถเทรลเลอร์", driver: "ฉลองชัย ปานเรือง" },
  { plate: "90-7312 นฐ", desc: "รถเครนขนาดพิกัด 30ตัน/เมตร", driver: "ขวัญเรือน มีถาวร" },
  { plate: "90-7311 นฐ", desc: "รถเครนขนาดพิกัด 30ตัน/เมตร", driver: "อินทพร สร้อยสังวาลย์" },
  { plate: "90-3515 นฐ", desc: "รถสว่านขุดเจาะ", driver: "อนิวัต จุลมูล" },
  { plate: "90-2235 นฐ", desc: "รถบรรทุก 6 ตัน คิดเครนพับ", driver: "กิตติภัฏ กาฬษร" },
  { plate: "85-3090 นฐ", desc: "รถเทรลเลอร์", driver: "ธวัชชัย โต๊ะศรีสุข" },
  { plate: "90-2230 นฐ", desc: "รถบรรทุก 6 ตัน คิดเครนพับ", driver: "วิสูตร เสือคล้าย" },
  { plate: "90-2952 นฐ", desc: "รถสว่านขุดเจาะ", driver: "วิสูตร เสือคล้าย" },
  { plate: "55-0774 กทม", desc: "รถเครนขนาดพิกัด 30ตัน/เมตร", driver: "เสนาะ ดาวเรือง" },
  { plate: "90-0423 นฐ", desc: "รถบรรทุก 6 ตัน คิดเครนพับ", driver: "โหนก แก้วบัวดี" },
  { plate: "90-2951 นฐ", desc: "รถสว่านขุดเจาะ", driver: "ไพฑูรย์ สุขสมบัติ" },
  { plate: "90-7310 นฐ", desc: "รถเครนขนาดพิกัด 30ตัน/เมตร", driver: "มานิตย์ ใจชื้น" },
  { plate: "89-5774 นฐ", desc: "รถเครนขนาดพิกัด 25ตัน/เมตร", driver: "อุเทน นามศร" },
  { plate: "84-9636 นฐ", desc: "รถเครนขนาดพิกัด 25ตัน/เมตร", driver: "อุเทน นามศร" },
  { plate: "89-2131 นฐ", desc: "รถบรรทุก 6 ตัน คิดเครนพับ", driver: "พงษ์พันธ์ จุติโรจนปกรณ์" },
  { plate: "89-6967 นฐ", desc: "รถสว่านขุดเจาะ", driver: "ผดุงเกียรติ ศรีใส" }
];

export default function DriverOTPage() {
  const [selectedDriverIdx, setSelectedDriverIdx] = useState("");
  
  const [selectedType, setSelectedType] = useState(driverTypes[1]); // Default to 2+
  const [ot15Hours, setOt15Hours] = useState("");
  const [ot10Hours, setOt10Hours] = useState("");
  const [ot30Hours, setOt30Hours] = useState("");
  const [accomDays, setAccomDays] = useState("");
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
      
      let ot15Mins = 0;
      let ot10Mins = 0;
      let ot30Mins = 0;
      let totalMinutes = 0;

      let current = new Date(d1);
      while (current < d2) {
        const h = current.getHours();
        if (h !== 12) { // ไม่นับเวลา 12:00 - 13:00 (พักเที่ยง)
          totalMinutes++;
          const isSunday = current.getDay() === 0;
          const isDayHoliday = isSunday || isHoliday;
          
          if (isDayHoliday) {
            if (h >= 8 && h < 17) ot10Mins++;
            else ot30Mins++;
          } else {
            if (h < 8 || h >= 17) ot15Mins++;
          }
        }
        current.setMinutes(current.getMinutes() + 1);
      }

      setCalculatedHours(totalMinutes > 0 ? totalMinutes / 60 : 0);

      const ot15 = ot15Mins / 60;
      const ot10 = ot10Mins / 60;
      const ot30 = ot30Mins / 60;

      setOt15Hours(ot15 > 0 ? (Math.round(ot15 * 100) / 100).toString() : "");
      setOt10Hours(ot10 > 0 ? (Math.round(ot10 * 100) / 100).toString() : "");
      setOt30Hours(ot30 > 0 ? (Math.round(ot30 * 100) / 100).toString() : "");

    } else {
      setCalculatedHours(0);
    }
  }, [startTime, endTime, startDate, isHoliday]);
  const handleDriverSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDriverIdx(val);
    
    if (val !== "") {
      const car = driversList[Number(val)];
      if (car) {
        if (car.desc.includes("รถเทรลเลอร์")) {
          setSelectedType(driverTypes[3]); // ชนิดที่ 3+
        } else if (car.desc.includes("เครนขนาดพิกัด")) {
          setSelectedType(driverTypes[2]); // ชนิดที่ 2+พิเศษ
        } else {
          setSelectedType(driverTypes[1]); // ชนิดที่ 2+ (รถสว่าน, เครนพับ)
        }
      }
    }
  };

  const calculateTotal = () => {
    const totalOT15 = (Number(ot15Hours) || 0) * selectedType.ot15;
    const totalOT10 = (Number(ot10Hours) || 0) * selectedType.ot10;
    const totalOT30 = (Number(ot30Hours) || 0) * selectedType.ot30;
    const totalAccom = (Number(accomDays) || 0) * selectedType.accom;
    
    return {
      totalOT15,
      totalOT10,
      totalOT30,
      totalAccom,
      grandTotal: totalOT15 + totalOT10 + totalOT30 + totalAccom
    };
  };

  const results = calculateTotal();
  const activeDriver = selectedDriverIdx !== "" ? driversList[Number(selectedDriverIdx)] : null;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "0 0 40px 0", background: "#f8fafc" }}>
      <TopBar title="โปรแกรมคำนวณค่าล่วงเวลา พขร.(บ)" />
      
      <div className="no-print" style={{ padding: "0 32px", maxWidth: "1000px", margin: "0 auto", marginTop: "24px" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
          {/* Left Column: Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Driver Selection from Database */}
            <div className="card animation-fade-in" style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                1. เลือกพนักงานขับรถ
              </h3>
              
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>รายชื่อพนักงานขับรถชุดงานก่อสร้าง</label>
                <select 
                  className="form-control" 
                  value={selectedDriverIdx} 
                  onChange={handleDriverSelect}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
                >
                  <option value="">-- ไม่ระบุ / ระบุเอง --</option>
                  {driversList.map((d, idx) => (
                    <option key={idx} value={idx}>
                      {d.plate} : {d.driver}
                    </option>
                  ))}
                </select>
                {activeDriver && (
                  <div style={{ marginTop: "12px", padding: "12px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "0.85rem", color: "#1e3a8a" }}>
                    ระบบได้แนะนำ <strong>{selectedType.name}</strong> ให้โดยอัตโนมัติตามข้อมูลทะเบียนรถ
                  </div>
                )}
              </div>
            </div>

            {/* Driver Type Selection */}
            <div className="card animation-fade-in" style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.4-1.7-1-2.1L17 8H7L3 11.2C2.4 11.6 2 12.3 2 13v3c0 .6.4 1 1 1h2"/><path d="M14 17H9"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>
                2. ยืนยันประเภท พขร.
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {driverTypes.map(type => (
                  <label key={type.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px", borderRadius: "12px", border: `2px solid ${selectedType.id === type.id ? '#7e22ce' : '#f1f5f9'}`, background: selectedType.id === type.id ? '#fdfbfe' : 'white', cursor: "pointer", transition: "all 0.2s" }}>
                    <input 
                      type="radio" 
                      name="driverType" 
                      checked={selectedType.id === type.id} 
                      onChange={() => setSelectedType(type)}
                      style={{ marginTop: "4px", accentColor: "#7e22ce", width: "18px", height: "18px" }}
                    />
                    <div>
                      <div style={{ fontWeight: "700", color: selectedType.id === type.id ? '#7e22ce' : '#334155', fontSize: "1rem" }}>{type.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>{type.desc}</div>
                      <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
                        ตั้งเบิกค่าแรง: <span style={{ fontWeight: "600", color: "#1e293b" }}>{type.base.toLocaleString()} บ.</span> | 
                        OT 1.5: <span style={{ fontWeight: "600", color: "#1e293b" }}>{type.ot15.toFixed(2)} บ./ชม.</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Input Form */}
            <div className="card animation-fade-in" style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                3. กรอกเวลาการทำงาน
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", color: "#334155", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <input type="checkbox" checked={isHoliday} onChange={e => setIsHoliday(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    ระบุว่าเป็นวันหยุดนักขัตฤกษ์ (สำหรับวันจันทร์-เสาร์)
                  </label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingBottom: "16px", borderBottom: "1px solid #e2e8f0" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>วันที่เริ่มต้น</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-control" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>วันที่สิ้นสุด</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-control" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <DropdownTimePicker label="เวลาเริ่มต้น" value={startTime} onChange={setStartTime} />
                  <DropdownTimePicker label="เวลาสิ้นสุด" value={endTime} onChange={setEndTime} />
                </div>

                {calculatedHours > 0 && (
                  <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "0.9rem", color: "#166534", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <span>ระยะเวลาที่คำนวณได้: <strong>{calculatedHours.toFixed(2)} ชั่วโมง</strong></span>
                    <span style={{ fontSize: "0.8rem" }}>(ระบบได้จัดสรรชั่วโมงลงในช่อง OT ให้แล้ว)</span>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>OT 1.5 เท่า (ชั่วโมง)</label>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px", marginTop: "-4px" }}>วันทำงาน จันทร์ - เสาร์ (00:00-08:00 และ 17:00-24:00)</p>
                  <input type="number" min="0" value={ot15Hours} onChange={e => setOt15Hours(e.target.value)} className="form-control" placeholder="0" style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }} />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>OT 1.0 เท่า (ชั่วโมง)</label>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px", marginTop: "-4px" }}>วันหยุดประเพณี/นักขัตฤกษ์/หยุดชดเชย (08:00-17:00)</p>
                  <input type="number" min="0" value={ot10Hours} onChange={e => setOt10Hours(e.target.value)} className="form-control" placeholder="0" style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>OT 3.0 เท่า (ชั่วโมง)</label>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px", marginTop: "-4px" }}>วันหยุดประเพณี/นักขัตฤกษ์/หยุดชดเชย (00:00-08:00 และ 17:00-24:00)</p>
                  <input type="number" min="0" value={ot30Hours} onChange={e => setOt30Hours(e.target.value)} className="form-control" placeholder="0" style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }} />
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginTop: "4px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>ค่าพักแรม (วัน)</label>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px", marginTop: "-4px" }}>เบิกจ่ายวันละ 400 บาท</p>
                  <input type="number" min="0" value={accomDays} onChange={e => setAccomDays(e.target.value)} className="form-control" placeholder="0" style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Receipt / Results */}
          <div className="animation-fade-in">
            <div style={{ background: "white", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", position: "sticky", top: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ width: "64px", height: "64px", background: "#f0fdf4", color: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>สรุปค่าล่วงเวลา</h2>
                
                <button onClick={() => window.print()} className="btn btn-primary" style={{ marginTop: "16px", borderRadius: "20px", padding: "8px 16px", fontSize: "0.85rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Export PDF
                </button>

                <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "12px" }}>
                  {activeDriver ? (
                    <span style={{ color: "#2563eb", fontWeight: "600" }}>{activeDriver.driver} ({activeDriver.plate})</span>
                  ) : (
                    "พนักงานขับรถ (ไม่ได้ระบุ)"
                  )}
                </p>
                <div style={{ display: "inline-block", background: "#f1f5f9", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", color: "#475569", marginTop: "8px", fontWeight: "500" }}>
                  {selectedType.name} - {selectedType.desc.split(' (')[0]}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderBottom: "2px dashed #e2e8f0", paddingBottom: "24px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>ค่าล่วงเวลา 1.5 เท่า</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{ot15Hours || "0"} ชม. x {selectedType.ot15.toFixed(2)} บ.</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                    {results.totalOT15.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>ค่าล่วงเวลา 1.0 เท่า</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{ot10Hours || "0"} ชม. x {selectedType.ot10.toFixed(2)} บ.</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                    {results.totalOT10.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>ค่าล่วงเวลา 3.0 เท่า</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{ot30Hours || "0"} ชม. x {selectedType.ot30.toFixed(2)} บ.</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                    {results.totalOT30.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "8px" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>ค่าพักแรม</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{accomDays || "0"} วัน x {selectedType.accom.toFixed(2)} บ.</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                    {results.totalAccom.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "1rem", fontWeight: "700", color: "#1e293b" }}>รวมสุทธิ (Total)</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#10b981" }}>
                  {results.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                </div>
              </div>
              
              <div style={{ marginTop: "24px", padding: "16px", background: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe", fontSize: "0.8rem", color: "#1e3a8a", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span>
                  <strong>หมายเหตุ:</strong> การตั้งเบิกค่าแรงต่อเดือนของคุณคือ <strong>{selectedType.base.toLocaleString()} บาท</strong> ยอดสรุปด้านบนคือยอดรวมของค่าล่วงเวลา (OT) และค่าพักแรมเพิ่มเติม
                </span>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedDriverIdx("");
                  setOt15Hours("");
                  setOt10Hours("");
                  setOt30Hours("");
                  setAccomDays("");
                  setStartDate("");
                  setEndDate("");
                  setStartTime("");
                  setEndTime("");
                }}
                style={{ width: "100%", marginTop: "20px", background: "white", border: "1px solid #e2e8f0", color: "#64748b", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" }}
                onMouseOver={e => e.currentTarget.style.background = "#f1f5f9"}
                onMouseOut={e => e.currentTarget.style.background = "white"}
              >
                ล้างข้อมูล (Reset)
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* Print Document View */}
      <div className="print-only" style={{ padding: "40px", color: "black", background: "white", width: "100%", maxWidth: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18pt", fontWeight: "bold", marginBottom: "8px" }}>รายการคำนวณค่าล่วงเวลา พขร. (บ)</h2>
          <p style={{ fontSize: "12pt", marginBottom: "4px" }}>
            <strong>ชื่อ-สกุล:</strong> {activeDriver ? activeDriver.driver : '-'} 
            <span style={{ marginLeft: "16px" }}><strong>ทะเบียนรถ:</strong> {activeDriver ? activeDriver.plate : '-'}</span>
          </p>
          <p style={{ fontSize: "12pt", marginBottom: "4px" }}>
            <strong>ประเภทรถ:</strong> {selectedType.name} - {selectedType.desc.split(' (')[0]}
            <span style={{ marginLeft: "16px" }}><strong>ตั้งเบิกค่าแรง:</strong> {selectedType.base.toLocaleString()} บาท/เดือน</span>
          </p>
          <p style={{ fontSize: "12pt" }}>
            <strong>วันที่ปฏิบัติงาน:</strong> {startDate || '-'} {endDate && endDate !== startDate ? `ถึง ${endDate}` : ''}
            <span style={{ marginLeft: "16px" }}><strong>เวลา:</strong> {startTime ? startTime.replace(':', '.') : '-'} น. ถึง {endTime ? endTime.replace(':', '.') : '-'} น.</span>
          </p>
        </div>
        
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "32px", fontSize: "12pt" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #000", padding: "12px", textAlign: "left", background: "#f1f5f9" }}>รายการ</th>
              <th style={{ border: "1px solid #000", padding: "12px", textAlign: "center", background: "#f1f5f9" }}>จำนวน</th>
              <th style={{ border: "1px solid #000", padding: "12px", textAlign: "right", background: "#f1f5f9" }}>อัตรา (บาท)</th>
              <th style={{ border: "1px solid #000", padding: "12px", textAlign: "right", background: "#f1f5f9" }}>รวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "12px" }}>ค่าล่วงเวลา 1.5 เท่า</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "center" }}>{ot15Hours || "0"} ชม.</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right" }}>{selectedType.ot15.toFixed(2)}</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right" }}>{results.totalOT15.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "12px" }}>ค่าล่วงเวลา 1.0 เท่า</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "center" }}>{ot10Hours || "0"} ชม.</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right" }}>{selectedType.ot10.toFixed(2)}</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right" }}>{results.totalOT10.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "12px" }}>ค่าล่วงเวลา 3.0 เท่า</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "center" }}>{ot30Hours || "0"} ชม.</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right" }}>{selectedType.ot30.toFixed(2)}</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right" }}>{results.totalOT30.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "12px" }}>ค่าพักแรม</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "center" }}>{accomDays || "0"} วัน</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right" }}>{selectedType.accom.toFixed(2)}</td>
              <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right" }}>{results.totalAccom.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={3} style={{ border: "1px solid #000", padding: "12px", textAlign: "right", fontWeight: "bold" }}>รวมสุทธิ (บาท)</th>
              <th style={{ border: "1px solid #000", padding: "12px", textAlign: "right", fontWeight: "bold", background: "#f0fdf4" }}>
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
