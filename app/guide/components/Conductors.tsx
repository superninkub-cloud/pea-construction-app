import React, { useState } from "react";
import { Zap, Info, Shield, Scale, Activity, ArrowRight, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

interface ConductorDetail {
  code: string;
  type: "AAC" | "ACSR" | "AAAC" | "OHGW";
  typeName: string;
  crossSection: string;
  weight: number; // kg/m
  rtsKg: number; // kgf
  rtsKn: number; // kN
  maxWorkingKg: number; // 40% RTS
  everydayKg: number; // 20% RTS
  ampacityA: number; // Current rating (A)
  thermalMva: number; // MVA @ 115kV
  application: string;
}

const CONDUCTOR_DATA: ConductorDetail[] = [
  // AAC Series
  {
    code: "AAC 400 sq.mm.",
    type: "AAC",
    typeName: "สายอลูมิเนียมล้วน (AAC)",
    crossSection: "400 ตร.มม.",
    weight: 1.102,
    rtsKg: 6440,
    rtsKn: 63.2,
    maxWorkingKg: 2576,
    everydayKg: 1288,
    ampacityA: 650,
    thermalMva: 130,
    application: "สายหลักมาตรฐาน 115 kV กฟภ. สำหรับช่วงเสาทั่วไป (60-100 ม.)"
  },
  {
    code: "AAC 240 sq.mm.",
    type: "AAC",
    typeName: "สายอลูมิเนียมล้วน (AAC)",
    crossSection: "240 ตร.มม.",
    weight: 0.665,
    rtsKg: 4000,
    rtsKn: 39.2,
    maxWorkingKg: 1600,
    everydayKg: 800,
    ampacityA: 470,
    thermalMva: 94,
    application: "สายแยกหรือเชื่อมต่อระบบย่อย"
  },
  {
    code: "AAC 185 sq.mm.",
    type: "AAC",
    typeName: "สายอลูมิเนียมล้วน (AAC)",
    crossSection: "185 ตร.มม.",
    weight: 0.510,
    rtsKg: 3100,
    rtsKn: 30.4,
    maxWorkingKg: 1240,
    everydayKg: 620,
    ampacityA: 400,
    thermalMva: 80,
    application: "งานดึงสายช่วงสั้นและจ่ายไฟเฉพาะจุด"
  },
  {
    code: "AAC 120 sq.mm.",
    type: "AAC",
    typeName: "สายอลูมิเนียมล้วน (AAC)",
    crossSection: "120 ตร.มม.",
    weight: 0.332,
    rtsKg: 2050,
    rtsKn: 20.1,
    maxWorkingKg: 820,
    everydayKg: 410,
    ampacityA: 300,
    thermalMva: 60,
    application: "สายแยกพิกัดขนาดเล็ก"
  },

  // ACSR Series
  {
    code: "ACSR 400 (380/50 sq.mm.)",
    type: "ACSR",
    typeName: "สายอลูมิเนียมแกนเหล็ก (ACSR)",
    crossSection: "380/50 ตร.มม.",
    weight: 1.485,
    rtsKg: 12500,
    rtsKn: 122.6,
    maxWorkingKg: 5000,
    everydayKg: 2500,
    ampacityA: 720,
    thermalMva: 143,
    application: "ช่วงเสายาวพิเศษ (Long Span) ข้ามแม่น้ำ หุบเขา ทางหลวงกว้าง"
  },
  {
    code: "ACSR 795 MCM (Drake)",
    type: "ACSR",
    typeName: "สายอลูมิเนียมแกนเหล็ก (ACSR)",
    crossSection: "402.8 ตร.มม.",
    weight: 1.628,
    rtsKg: 14300,
    rtsKn: 140.2,
    maxWorkingKg: 5720,
    everydayKg: 2860,
    ampacityA: 900,
    thermalMva: 179,
    application: "สายส่งหลักรับกระแสและแรงดึงสูงพิเศษ"
  },
  {
    code: "ACSR 477 MCM (Hawk)",
    type: "ACSR",
    typeName: "สายอลูมิเนียมแกนเหล็ก (ACSR)",
    crossSection: "241.7 ตร.มม.",
    weight: 0.976,
    rtsKg: 8850,
    rtsKn: 86.8,
    maxWorkingKg: 3540,
    everydayKg: 1770,
    ampacityA: 660,
    thermalMva: 131,
    application: "สายส่งแรงดึงสูงช่วงเสากลาง-ยาว"
  },
  {
    code: "ACSR 240/40 sq.mm.",
    type: "ACSR",
    typeName: "สายอลูมิเนียมแกนเหล็ก (ACSR)",
    crossSection: "240/40 ตร.มม.",
    weight: 0.969,
    rtsKg: 8600,
    rtsKn: 84.3,
    maxWorkingKg: 3440,
    everydayKg: 1720,
    ampacityA: 520,
    thermalMva: 103,
    application: "ทางโค้งแรงดึงสูง หรือพื้นที่ลมแรง"
  },

  // AAAC Series
  {
    code: "AAAC 400 sq.mm.",
    type: "AAAC",
    typeName: "สายอลูมิเนียมอัลลอยด์ (AAAC)",
    crossSection: "400 ตร.มม.",
    weight: 1.105,
    rtsKg: 12200,
    rtsKn: 119.6,
    maxWorkingKg: 4880,
    everydayKg: 2440,
    ampacityA: 680,
    thermalMva: 135,
    application: "พื้นที่ชายทะเล ทนการกัดกร่อนจากไอเกลือ และรับแรงดึงสูงเทียม ACSR"
  },

  // Overhead Ground Wire
  {
    code: "Steel Shield Wire 3/8\"",
    type: "OHGW",
    typeName: "สายล่อฟ้าเหล็กชุบสังกะสี (OHGW)",
    crossSection: "7 เส้นตีเกลียว",
    weight: 0.410,
    rtsKg: 5100,
    rtsKn: 50.0,
    maxWorkingKg: 2040,
    everydayKg: 1020,
    ampacityA: 150,
    thermalMva: 0,
    application: "สายล่อฟ้าบนยอดเสา ป้องกันฟ้าผ่าตรงเข้าสู่สายส่ง 115 kV"
  }
];

export default function Conductors() {
  const [activeTab, setActiveTab] = useState<"tension" | "thermal" | "compare">("tension");
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredConductors = filterType === "ALL"
    ? CONDUCTOR_DATA
    : CONDUCTOR_DATA.filter((c) => c.type === filterType);

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" }}>
            <Zap size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>พิกัดการรับแรงดึงและคุณสมบัติสายไฟฟ้า 115 kV</h2>
            <p style={{ color: "#fef3c7", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              ตารางพิกัดแรงดึงประลัย (Max RTS), เกณฑ์แรงดึงใช้งาน (40% / 20%), และพิกัดความจุไฟฟ้า (Thermal Limit)
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("tension")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: activeTab === "tension" ? "#f59e0b" : "#f1f5f9",
            color: activeTab === "tension" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Scale size={18} /> พิกัดการรับแรงดึง (Tensile Strength & RTS)
        </button>
        <button
          onClick={() => setActiveTab("thermal")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: activeTab === "thermal" ? "#f59e0b" : "#f1f5f9",
            color: activeTab === "thermal" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Zap size={18} /> พิกัดกระแส &amp; Thermal Limit (MVA)
        </button>
        <button
          onClick={() => setActiveTab("compare")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: activeTab === "compare" ? "#f59e0b" : "#f1f5f9",
            color: activeTab === "compare" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Layers size={18} /> เปรียบเทียบ AAC vs ACSR vs AAAC
        </button>
      </div>

      {/* Tab 1: Tensile Strength & RTS Table */}
      {activeTab === "tension" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Quick Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#64748b" }}>ประเภทสาย:</span>
            {[
              { id: "ALL", label: "ทั้งหมด" },
              { id: "AAC", label: "สายเปลือย AAC" },
              { id: "ACSR", label: "สายแกนเหล็ก ACSR" },
              { id: "AAAC", label: "สายอัลลอยด์ AAAC" },
              { id: "OHGW", label: "สายล่อฟ้า OHGW" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "16px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  backgroundColor: filterType === f.id ? "#d97706" : "#f1f5f9",
                  color: filterType === f.id ? "white" : "#475569"
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tensile Strength Table */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: "bold", color: "#92400e", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Scale size={20} className="text-amber-600" />
                ตารางพิกัดแรงดึงประลัยสูงสุด (RTS) และเกณฑ์แรงดึงใช้งานมาตรฐาน กฟภ.
              </div>
            </div>

            <div style={{ padding: "16px 20px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", color: "#334155", borderBottom: "2px solid #cbd5e1" }}>
                    <th style={{ padding: "12px 14px", fontWeight: "bold" }}>ขนาดและชนิดสายไฟ</th>
                    <th style={{ padding: "12px 14px", fontWeight: "bold" }}>นน. สาย (kg/m)</th>
                    <th style={{ padding: "12px 14px", fontWeight: "bold", color: "#dc2626" }}>แรงดึงประลัย Max RTS (kgf / kN)</th>
                    <th style={{ padding: "12px 14px", fontWeight: "bold", color: "#d97706" }}>แรงดึงใช้งานสูงสุด 40% (kgf)</th>
                    <th style={{ padding: "12px 14px", fontWeight: "bold", color: "#059669" }}>แรงดึงสภาวะปกติ 20% (kgf)</th>
                    <th style={{ padding: "12px 14px", fontWeight: "bold" }}>ลักษณะการนำไปใช้งาน</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConductors.map((c) => (
                    <tr key={c.code} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#1e293b" }}>
                        <div>{c.code}</div>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "normal" }}>{c.typeName}</span>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#475569" }}>
                        {c.weight.toFixed(3)}
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#dc2626", fontSize: "1rem" }}>
                        {c.rtsKg.toLocaleString()} kgf
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#991b1b", fontWeight: "normal" }}>({c.rtsKn} kN)</span>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#d97706" }}>
                        {c.maxWorkingKg.toLocaleString()} kgf
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#059669" }}>
                        {c.everydayKg.toLocaleString()} kgf
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "0.85rem", color: "#64748b", maxWidth: "250px" }}>
                        {c.application}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Engineering Rules Info */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontWeight: "bold", color: "#059669", marginBottom: "6px", fontSize: "0.95rem" }}>
                1. สภาวะปกติ (Everyday Tension : EDS ~20% RTS)
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5", margin: 0 }}>
                ควบคุมแรงดึงคงที่ในสภาวะอุณหภูมิปกติ (30°C - 40°C) ไม่ให้เกิน 18% - 22% ของ RTS เพื่อป้องกันความเสียหายจากแรงสั่นสะเทือนจากลม (Aeolian Vibration Fatigue)
              </p>
            </div>

            <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontWeight: "bold", color: "#d97706", marginBottom: "6px", fontSize: "0.95rem" }}>
                2. สภาวะวิกฤต (Max Working Tension : 40% - 50% RTS)
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5", margin: 0 }}>
                ในสภาวะที่มีแรงลมปะทะสายสูงสุด (Max Wind Pressure) ร่วมกับอุณหภูมิต่ำสุด แรงดึงในสายต้องไม่เกิน 40% ของ RTS เพื่อความปลอดภัยของโครงสร้างหัวเสา
              </p>
            </div>

            <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontWeight: "bold", color: "#dc2626", marginBottom: "6px", fontSize: "0.95rem" }}>
                3. แรงดึงประลัย (Rated Tensile Strength : RTS)
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5", margin: 0 }}>
                คือพิกัดแรงดึงขาดสูงสุดที่สายไฟสามารถรับได้ตามมาตรฐานการผลิต ห้ามให้แรงดึงในการทำงานเข้าใกล้ค่านี้เด็ดขาด
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Thermal Limits */}
      {activeTab === "thermal" && (
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a", fontWeight: "bold", color: "#92400e", fontSize: "1.05rem" }}>
            ⚡ ตารางพิกัดกระแสและความสามารถในการจ่ายโหลด (Thermal Capacity @ 115 kV)
          </div>
          
          <div style={{ padding: "20px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "2px solid #cbd5e1" }}>
                  <th style={{ padding: "12px 16px", fontWeight: "bold" }}>ขนาดสายไฟ</th>
                  <th style={{ padding: "12px 16px", fontWeight: "bold" }}>พิกัดกระแสต่อเนื่อง (Amperes)</th>
                  <th style={{ padding: "12px 16px", fontWeight: "bold", color: "#2563eb" }}>พิกัดกำลังไฟฟ้า @ 115 kV (MVA)</th>
                  <th style={{ padding: "12px 16px", fontWeight: "bold" }}>อุณหภูมิใช้งานสูงสุด (°C)</th>
                </tr>
              </thead>
              <tbody>
                {CONDUCTOR_DATA.filter(c => c.type !== "OHGW").map((c) => (
                  <tr key={c.code} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#1e293b" }}>{c.code}</td>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#059669" }}>{c.ampacityA} A</td>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#2563eb", fontSize: "1.1rem" }}>{c.thermalMva} MVA</td>
                    <td style={{ padding: "12px 16px", color: "#64748b" }}>75°C - 90°C</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "12px" }}>
              *อ้างอิงอุณหภูมิบรรยากาศ 40°C, ความเร็วลม 0.6 m/s, รังสีอาทิตย์ 1000 W/m²
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Comparison between Material Types */}
      {activeTab === "compare" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          
          {/* AAC Card */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #93c5fd", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "10px", borderRadius: "10px", fontWeight: "bold" }}>
                AAC
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>สายอลูมิเนียมล้วน</h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>All Aluminium Conductor</span>
              </div>
            </div>
            <ul style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.6", margin: 0, paddingLeft: "20px" }}>
              <li><b>โครงสร้าง:</b> เส้นลวดอลูมิเนียมเกรด EC 1350 ตีเกลียวล้วน ไม่มีแกนเหล็ก</li>
              <li><b>น้ำหนัก:</b> เบา (1.102 kg/m สำหรับ 400 ตร.มม.)</li>
              <li><b>การรับแรงดึง:</b> ปานกลาง (RTS = <b>6,440 kgf</b>)</li>
              <li><b>จุดเด่น:</b> ดัดโค้งง่าย ราคาประหยัด นำไฟฟ้าได้ดีเยี่ยม</li>
              <li><b>ข้อจำกัด:</b> ไม่เหมาะกับช่วงเสายาว หรือจุดที่ต้องดึงตึงมาก</li>
            </ul>
          </div>

          {/* ACSR Card */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #fbcfe8", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ backgroundColor: "#fce7f3", color: "#be185d", padding: "10px", borderRadius: "10px", fontWeight: "bold" }}>
                ACSR
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>สายอลูมิเนียมแกนเหล็ก</h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Aluminium Conductor Steel Reinforced</span>
              </div>
            </div>
            <ul style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.6", margin: 0, paddingLeft: "20px" }}>
              <li><b>โครงสร้าง:</b> ลวดอลูมิเนียมตีเกลียวหุ้มรอบแกนเหล็กกล้ากัลวาไนซ์</li>
              <li><b>น้ำหนัก:</b> หนักกว่า (1.485 kg/m สำหรับ 380/50)</li>
              <li><b>การรับแรงดึง:</b> สูงมาก (RTS = <b>12,500 kgf</b> หรือ 2 เท่าของ AAC)</li>
              <li><b>จุดเด่น:</b> ทนแรงดึงสูงมาก พาดสายช่วงเสายาวข้ามแม่น้ำได้ดี</li>
              <li><b>ข้อจำกัด:</b> ไม่ควรใช้ใกล้ชายทะเล เพราะไอเกลืออาจกัดกร่อนแกนเหล็ก</li>
            </ul>
          </div>

          {/* AAAC Card */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #bbf7d0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ backgroundColor: "#dcfce7", color: "#15803d", padding: "10px", borderRadius: "10px", fontWeight: "bold" }}>
                AAAC
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>สายอลูมิเนียมอัลลอยด์</h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>All Aluminium Alloy Conductor</span>
              </div>
            </div>
            <ul style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.6", margin: 0, paddingLeft: "20px" }}>
              <li><b>โครงสร้าง:</b> ทำจากอลูมิเนียมผสมอัลลอยด์ (Al-Mg-Si Series 6000)</li>
              <li><b>น้ำหนัก:</b> เบาใกล้เคียง AAC (1.105 kg/m)</li>
              <li><b>การรับแรงดึง:</b> สูงมาก (RTS = <b>12,200 kgf</b> เทียบเท่า ACSR)</li>
              <li><b>จุดเด่น:</b> ทนทานการกัดกร่อนจากไอเกลือชายทะเลสูงมาก และทนแรงดึงสูง</li>
              <li><b>ข้อจำกัด:</b> ราคาสูงกว่า AAC</li>
            </ul>
          </div>

        </div>
      )}

    </div>
  );
}
