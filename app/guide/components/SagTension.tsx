import React, { useState, useEffect } from "react";
import { Calculator, BookOpen, Activity, AlertTriangle, CheckCircle2, XCircle, Info, ArrowRightLeft, Layers, Sliders } from "lucide-react";

interface ConductorOption {
  id: string;
  name: string;
  category: "AAC" | "ACSR" | "AAAC" | "CUSTOM";
  categoryName: string;
  weight: number; // kg/m
  rts: number; // kgf (Rated Tensile Strength / Max Tension)
  maxWorkingPercent: number; // % of RTS for max working tension (typically 40%)
  everydayPercent: number; // % of RTS for normal everyday tension (typically 18-22%)
  desc: string;
}

const CONDUCTOR_PRESETS: ConductorOption[] = [
  // AAC (All Aluminium Conductor)
  {
    id: "aac-400",
    name: "AAC 400 sq.mm. (สายอลูมิเนียมเปลือย)",
    category: "AAC",
    categoryName: "สายอลูมิเนียมล้วน (AAC)",
    weight: 1.102,
    rts: 6440,
    maxWorkingPercent: 40,
    everydayPercent: 20,
    desc: "สายอลูมิเนียมล้วนยอดนิยมในระบบ 115 kV ของ กฟภ. เหมาะสำหรับช่วงเสาทั่วไปและไม่ข้ามแม่น้ำยาว"
  },
  {
    id: "aac-240",
    name: "AAC 240 sq.mm. (สายอลูมิเนียมเปลือย)",
    category: "AAC",
    categoryName: "สายอลูมิเนียมล้วน (AAC)",
    weight: 0.665,
    rts: 4000,
    maxWorkingPercent: 40,
    everydayPercent: 20,
    desc: "สายอลูมิเนียมล้วนขนาด 240 ตร.มม."
  },
  {
    id: "aac-185",
    name: "AAC 185 sq.mm. (สายอลูมิเนียมเปลือย)",
    category: "AAC",
    categoryName: "สายอลูมิเนียมล้วน (AAC)",
    weight: 0.510,
    rts: 3100,
    maxWorkingPercent: 40,
    everydayPercent: 20,
    desc: "สายอลูมิเนียมล้วนขนาด 185 ตร.มม."
  },

  // ACSR (Aluminium Conductor Steel Reinforced)
  {
    id: "acsr-400",
    name: "ACSR 400 sq.mm. (380/50) (สายอลูมิเนียมแกนเหล็ก)",
    category: "ACSR",
    categoryName: "สายอลูมิเนียมแกนเหล็ก (ACSR)",
    weight: 1.485,
    rts: 12500,
    maxWorkingPercent: 40,
    everydayPercent: 20,
    desc: "สายอลูมิเนียมแกนเหล็กรับแรงดึงสูงมาก สำหรับช่วงเสายาว ข้ามแม่น้ำ หุบเขา หรือทางหลวงกว้าง"
  },
  {
    id: "acsr-795",
    name: "ACSR 795 MCM (Drake) (สายอลูมิเนียมแกนเหล็ก)",
    category: "ACSR",
    categoryName: "สายอลูมิเนียมแกนเหล็ก (ACSR)",
    weight: 1.628,
    rts: 14300,
    maxWorkingPercent: 40,
    everydayPercent: 20,
    desc: "ACSR 795 MCM รับกระแสและแรงดึงสูงพิเศษ นิยมใช้ในสายส่งหลัก"
  },
  {
    id: "acsr-477",
    name: "ACSR 477 MCM (Hawk) (สายอลูมิเนียมแกนเหล็ก)",
    category: "ACSR",
    categoryName: "สายอลูมิเนียมแกนเหล็ก (ACSR)",
    weight: 0.976,
    rts: 8850,
    maxWorkingPercent: 40,
    everydayPercent: 20,
    desc: "ACSR 477 MCM มาตรฐานสายส่งแรงดึงสูง"
  },
  {
    id: "acsr-240",
    name: "ACSR 240/40 sq.mm. (สายอลูมิเนียมแกนเหล็ก)",
    category: "ACSR",
    categoryName: "สายอลูมิเนียมแกนเหล็ก (ACSR)",
    weight: 0.969,
    rts: 8600,
    maxWorkingPercent: 40,
    everydayPercent: 20,
    desc: "สายอลูมิเนียมแกนเหล็กขนาด 240/40 ตร.มม."
  },

  // AAAC (All Aluminium Alloy Conductor)
  {
    id: "aaac-400",
    name: "AAAC 400 sq.mm. (สายอลูมิเนียมผสมอัลลอยด์)",
    category: "AAAC",
    categoryName: "สายอลูมิเนียมผสม (AAAC)",
    weight: 1.105,
    rts: 12200,
    maxWorkingPercent: 40,
    everydayPercent: 20,
    desc: "ทนแรงดึงสูงเทียบเท่า ACSR แต่น้ำหนักเบากว่า ทนทานการกัดกร่อนจากไอเกลือชายทะเลได้ดีเยี่ยม"
  },

  // Custom
  {
    id: "custom",
    name: "กำหนดเอง (Custom Conductor)",
    category: "CUSTOM",
    categoryName: "กำหนดค่าตัวแปรเอง",
    weight: 1.10,
    rts: 6500,
    maxWorkingPercent: 40,
    everydayPercent: 20,
    desc: "ระบุน้ำหนักสายและแรงดึงประลัยสูงสุด (RTS) ตามสเปกที่ต้องการ"
  }
];

export default function SagTension() {
  const [selectedConductorId, setSelectedConductorId] = useState<string>("aac-400");
  const [calcMode, setCalcMode] = useState<"sag_from_tension" | "tension_from_sag">("sag_from_tension");

  const [weight, setWeight] = useState<number>(1.102);
  const [rts, setRts] = useState<number>(6440);
  const [spanLength, setSpanLength] = useState<number>(80); // meters
  const [tension, setTension] = useState<number>(1400); // kgf
  const [targetSag, setTargetSag] = useState<number>(0.63); // meters

  // Output results
  const [calculatedSag, setCalculatedSag] = useState<number>(0);
  const [calculatedTension, setCalculatedTension] = useState<number>(0);

  // When conductor preset changes, update weight and rts
  const handleConductorChange = (id: string) => {
    setSelectedConductorId(id);
    const cond = CONDUCTOR_PRESETS.find((c) => c.id === id);
    if (cond && cond.id !== "custom") {
      setWeight(cond.weight);
      setRts(cond.rts);
      // Auto set a reasonable default tension (approx 20% RTS)
      if (calcMode === "sag_from_tension") {
        setTension(Math.round((cond.rts * 0.22)));
      }
    }
  };

  // Recalculate on any input change
  useEffect(() => {
    if (weight > 0 && spanLength > 0) {
      if (calcMode === "sag_from_tension") {
        if (tension > 0) {
          // Y = (W * L^2) / (8 * T0)
          const sag = (weight * Math.pow(spanLength, 2)) / (8 * tension);
          setCalculatedSag(sag);
          setCalculatedTension(tension);
        }
      } else {
        if (targetSag > 0) {
          // T0 = (W * L^2) / (8 * Y)
          const t0 = (weight * Math.pow(spanLength, 2)) / (8 * targetSag);
          setCalculatedTension(t0);
          setCalculatedSag(targetSag);
        }
      }
    }
  }, [weight, spanLength, tension, targetSag, calcMode, rts]);

  const activeConductor = CONDUCTOR_PRESETS.find((c) => c.id === selectedConductorId) || CONDUCTOR_PRESETS[0];

  // Tension vs RTS analysis
  const maxWorkingTension = rts * 0.40; // 40% RTS (Standard Maximum Working Tension under loaded condition)
  const everydayTension = rts * 0.20; // 20% RTS (Standard Initial/Final Everyday Tension at 30-40°C)
  const tensionPercentRTS = rts > 0 ? (calculatedTension / rts) * 100 : 0;
  
  // Status check
  let safetyStatus: "safe" | "warning" | "danger" = "safe";
  let statusMessage = "แรงดึงอยู่ในเกณฑ์ปลอดภัยมาตรฐาน (ปกติ)";
  let statusColor = "#10b981"; // green

  if (tensionPercentRTS > 50) {
    safetyStatus = "danger";
    statusMessage = "อันตราย! แรงดึงเกิน 50% ของแรงดึงประลัย (เสี่ยงต่อสายขาด)";
    statusColor = "#ef4444"; // red
  } else if (tensionPercentRTS > 40) {
    safetyStatus = "warning";
    statusMessage = "เกินเกณฑ์แรงดึงใช้งานสูงสุด (Max Working Tension 40% RTS)";
    statusColor = "#f59e0b"; // orange/amber
  } else if (tensionPercentRTS < 10) {
    safetyStatus = "warning";
    statusMessage = "แรงดึงน้อยเกินไป ท้องสายหย่อนมาก เสี่ยงต่อระยะ Clearance ไม่ผ่าน";
    statusColor = "#3b82f6"; // blue
  }

  // Pre-generate comparison spans (e.g. 40m, 60m, 80m, 100m, 120m, 150m, 200m)
  const sampleSpans = [40, 60, 80, 100, 120, 150, 200];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" }}>
            <Activity size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>โปรแกรมวิเคราะห์และคำนวณแรงดึง/ระยะหย่อนยาน (Sag & Tension)</h2>
            <p style={{ color: "#dbeafe", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              เปรียบเทียบคุณสมบัติสายอลูมิเนียมเปลือย (AAC), สายอลูมิเนียมแกนเหล็ก (ACSR) กับค่าแรงดึงสูงสุด (Max Tension / RTS)
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs + Results */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        
        {/* Left Column: Form Controls */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", color: "#1e293b", fontSize: "1.05rem" }}>
              <Sliders size={20} className="text-blue-600" />
              กำหนดพารามิเตอร์สายและระยะช่วงเสา
            </div>
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* 1. Conductor Selection */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#334155", fontSize: "0.95rem" }}>
                1. เลือกประเภทสายไฟฟ้า (Conductor Type)
              </label>
              <select
                value={selectedConductorId}
                onChange={(e) => handleConductorChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "2px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <optgroup label="── สายอลูมิเนียมล้วน (AAC - All Aluminium Conductor) ──">
                  <option value="aac-400">AAC 400 sq.mm. (ยอดนิยมระบบ 115 kV กฟภ.)</option>
                  <option value="aac-240">AAC 240 sq.mm.</option>
                  <option value="aac-185">AAC 185 sq.mm.</option>
                </optgroup>
                <optgroup label="── สายอลูมิเนียมแกนเหล็ก (ACSR - Steel Reinforced) ──">
                  <option value="acsr-400">ACSR 400 sq.mm. (380/50 - ทนแรงดึงสูง 12,500 kgf)</option>
                  <option value="acsr-795">ACSR 795 MCM (Drake - ทนแรงดึงสูงพิเศษ 14,300 kgf)</option>
                  <option value="acsr-477">ACSR 477 MCM (Hawk - 8,850 kgf)</option>
                  <option value="acsr-240">ACSR 240/40 sq.mm. (8,600 kgf)</option>
                </optgroup>
                <optgroup label="── สายอลูมิเนียมผสม (AAAC - Alloy) ──">
                  <option value="aaac-400">AAAC 400 sq.mm. (ทนไอเกลือชายทะเล 12,200 kgf)</option>
                </optgroup>
                <optgroup label="── กำหนดสเปกเอง ──">
                  <option value="custom">⚙️ กำหนดค่าน้ำหนักและแรงดึงเอง (Custom)</option>
                </optgroup>
              </select>
              <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                {activeConductor.desc}
              </p>
            </div>

            {/* Conductor Property Badges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", backgroundColor: "#f1f5f9", padding: "14px", borderRadius: "10px" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>น้ำหนักสาย (W)</span>
                {selectedConductorId === "custom" ? (
                  <input
                    type="number"
                    step="0.001"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: "bold" }}
                  />
                ) : (
                  <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1e293b" }}>{weight.toFixed(3)} <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>kg/m</span></span>
                )}
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>แรงดึงประลัย (Max RTS)</span>
                {selectedConductorId === "custom" ? (
                  <input
                    type="number"
                    step="10"
                    value={rts}
                    onChange={(e) => setRts(parseFloat(e.target.value) || 0)}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: "bold" }}
                  />
                ) : (
                  <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#dc2626" }}>{rts.toLocaleString()} <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>kgf</span></span>
                )}
              </div>
            </div>

            {/* 2. Calculation Mode Toggle */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#334155", fontSize: "0.95rem" }}>
                2. เลือกโหมดการคำนวณ
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setCalcMode("sag_from_tension")}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: calcMode === "sag_from_tension" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    backgroundColor: calcMode === "sag_from_tension" ? "#eff6ff" : "white",
                    color: calcMode === "sag_from_tension" ? "#1d4ed8" : "#475569",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <Calculator size={16} /> กำหนดแรงดึง ➔ หา Sag
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("tension_from_sag")}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: calcMode === "tension_from_sag" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    backgroundColor: calcMode === "tension_from_sag" ? "#eff6ff" : "white",
                    color: calcMode === "tension_from_sag" ? "#1d4ed8" : "#475569",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <ArrowRightLeft size={16} /> กำหนด Sag ➔ หาแรงดึง
                </button>
              </div>
            </div>

            {/* 3. Inputs: Span Length (L) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontWeight: "bold", color: "#334155", fontSize: "0.9rem" }}>
                  ระยะช่วงเสา (Span Length : L)
                </label>
                <span style={{ fontWeight: "bold", color: "#2563eb" }}>{spanLength} เมตร</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="5"
                value={spanLength}
                onChange={(e) => setSpanLength(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#2563eb", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                <span>20 ม. (เสาสั้น)</span>
                <span>80 ม. (มาตรฐาน)</span>
                <span>150 ม. (ข้ามถนน)</span>
                <span>300 ม. (ข้ามแม่น้ำ)</span>
              </div>
            </div>

            {/* 4. Conditional Input (Tension or Sag) */}
            {calcMode === "sag_from_tension" ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontWeight: "bold", color: "#334155", fontSize: "0.9rem" }}>
                    แรงดึงใช้งานในแนวราบ (Tension : T₀)
                  </label>
                  <span style={{ fontWeight: "bold", color: "#059669" }}>{tension.toLocaleString()} kgf</span>
                </div>
                <input
                  type="number"
                  step="50"
                  min="100"
                  max={rts}
                  value={tension}
                  onChange={(e) => setTension(parseFloat(e.target.value) || 0)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "1rem",
                    fontWeight: "600",
                    outline: "none"
                  }}
                  placeholder="เช่น 1400"
                />
                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setTension(Math.round(everydayTension))}
                    style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", cursor: "pointer", color: "#475569" }}
                  >
                    ตั้งค่า 20% RTS ({Math.round(everydayTension)} kgf)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTension(Math.round(maxWorkingTension))}
                    style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", backgroundColor: "#fef3c7", border: "1px solid #fde68a", cursor: "pointer", color: "#92400e" }}
                  >
                    ตั้งค่า Max 40% RTS ({Math.round(maxWorkingTension)} kgf)
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontWeight: "bold", color: "#334155", fontSize: "0.9rem" }}>
                    ระยะหย่อนยานท้องสายที่ต้องการ (Target Sag : Y)
                  </label>
                  <span style={{ fontWeight: "bold", color: "#7c3aed" }}>{targetSag.toFixed(2)} เมตร</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="20"
                  value={targetSag}
                  onChange={(e) => setTargetSag(parseFloat(e.target.value) || 0.1)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "1rem",
                    fontWeight: "600",
                    outline: "none"
                  }}
                  placeholder="เช่น 0.8"
                />
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Dynamic Results & Comparison Dashboard */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Main Calculation Output Card */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#334155" }}>
              📊 ผลการคำนวณและประเมินความปลอดภัย
            </div>
            
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Top Metric Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                
                {/* Sag Result */}
                <div style={{ backgroundColor: "#eff6ff", padding: "18px", borderRadius: "12px", border: "1px solid #bfdbfe", textAlign: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#1e40af", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                    ระยะหย่อนยานท้องสาย (Sag : Y)
                  </span>
                  <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#2563eb", lineHeight: "1.1" }}>
                    {calculatedSag.toFixed(3)}
                  </div>
                  <span style={{ fontSize: "0.85rem", color: "#3b82f6", fontWeight: "600" }}>เมตร</span>
                </div>

                {/* Tension Result */}
                <div style={{ backgroundColor: "#f0fdf4", padding: "18px", borderRadius: "12px", border: "1px solid #bbf7d0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                    แรงดึงในสาย (Tension : T₀)
                  </span>
                  <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#16a34a", lineHeight: "1.1" }}>
                    {Math.round(calculatedTension).toLocaleString()}
                  </div>
                  <span style={{ fontSize: "0.85rem", color: "#15803d", fontWeight: "600" }}>kgf</span>
                </div>

              </div>

              {/* Tension Ratio Progress Gauge */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#334155" }}>
                    อัตราส่วนแรงดึงต่อค่าพิกัดสูงสุด (% of Max RTS)
                  </span>
                  <span style={{ fontSize: "1rem", fontWeight: "bold", color: statusColor }}>
                    {tensionPercentRTS.toFixed(1)}% ของ {rts.toLocaleString()} kgf
                  </span>
                </div>

                {/* Multi-tier Bar */}
                <div style={{ height: "14px", backgroundColor: "#e2e8f0", borderRadius: "7px", overflow: "hidden", position: "relative" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(tensionPercentRTS, 100)}%`,
                      backgroundColor: statusColor,
                      transition: "width 0.3s ease, background-color 0.3s ease",
                      borderRadius: "7px"
                    }}
                  />
                </div>

                {/* Limit markers */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                  <span>0%</span>
                  <span style={{ color: "#059669", fontWeight: "bold" }}>20% (Everyday Std)</span>
                  <span style={{ color: "#d97706", fontWeight: "bold" }}>40% (Max Limit)</span>
                  <span style={{ color: "#dc2626", fontWeight: "bold" }}>100% (RTS Break)</span>
                </div>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  backgroundColor: safetyStatus === "safe" ? "#ecfdf5" : safetyStatus === "warning" ? "#fffbeb" : "#fef2f2",
                  border: `1px solid ${safetyStatus === "safe" ? "#a7f3d0" : safetyStatus === "warning" ? "#fde68a" : "#fecdd3"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
                {safetyStatus === "safe" ? (
                  <CheckCircle2 size={24} style={{ color: "#059669", flexShrink: 0 }} />
                ) : safetyStatus === "warning" ? (
                  <AlertTriangle size={24} style={{ color: "#d97706", flexShrink: 0 }} />
                ) : (
                  <XCircle size={24} style={{ color: "#dc2626", flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "0.95rem", color: safetyStatus === "safe" ? "#065f46" : safetyStatus === "warning" ? "#92400e" : "#991b1b" }}>
                    {statusMessage}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: safetyStatus === "safe" ? "#047857" : safetyStatus === "warning" ? "#b45309" : "#b91c1c", marginTop: "2px" }}>
                    {activeConductor.category === "AAC" ? (
                      "สายอลูมิเนียมล้วน (AAC) น้ำหนักเบาแต่รับแรงดึงได้น้อยกว่า แนะนำควบคุมแรงดึงไม่เกิน 20-35% RTS"
                    ) : activeConductor.category === "ACSR" ? (
                      "สายอลูมิเนียมแกนเหล็ก (ACSR) มีแกนเหล็กรับแรงดึงสูงมาก เหมาะสำหรับช่วงเสายาวหรือลมแรง"
                    ) : (
                      "สายอลูมิเนียมผสม (AAAC) มีความแข็งแรงสูงและทนทานการกัดกร่อน"
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Comparison between AAC vs ACSR for current span */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <h4 style={{ fontWeight: "bold", color: "#1e293b", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem" }}>
              <Layers size={18} className="text-purple-600" />
              เปรียบเทียบ AAC 400 vs ACSR 400 (ที่ช่วงเสา {spanLength} ม. และแรงดึงมาตรฐาน 20% RTS)
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.85rem" }}>
              
              {/* AAC 400 Spec */}
              <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: "bold", color: "#2563eb", marginBottom: "6px" }}>AAC 400 sq.mm. (เปลือย)</div>
                <div style={{ color: "#475569", lineHeight: "1.6" }}>
                  <div>• นน. สาย: 1.102 kg/m</div>
                  <div>• Max RTS: 6,440 kgf</div>
                  <div>• แรงดึง 20%: <b>1,288 kgf</b></div>
                  <div style={{ color: "#2563eb", fontWeight: "bold", marginTop: "4px" }}>
                    ➔ Sag ที่ได้: {((1.102 * Math.pow(spanLength, 2)) / (8 * 1288)).toFixed(3)} ม.
                  </div>
                </div>
              </div>

              {/* ACSR 400 Spec */}
              <div style={{ backgroundColor: "#fdf4ff", padding: "12px", borderRadius: "8px", border: "1px solid #f5d0fe" }}>
                <div style={{ fontWeight: "bold", color: "#9333ea", marginBottom: "6px" }}>ACSR 400 sq.mm. (แกนเหล็ก)</div>
                <div style={{ color: "#475569", lineHeight: "1.6" }}>
                  <div>• นน. สาย: 1.485 kg/m</div>
                  <div>• Max RTS: 12,500 kgf</div>
                  <div>• แรงดึง 20%: <b>2,500 kgf</b></div>
                  <div style={{ color: "#9333ea", fontWeight: "bold", marginTop: "4px" }}>
                    ➔ Sag ที่ได้: {((1.485 * Math.pow(spanLength, 2)) / (8 * 2500)).toFixed(3)} ม.
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Multi-Span Comparison Table */}
      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: "bold", color: "#1e293b", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={18} className="text-emerald-600" />
            ตารางเปรียบเทียบระยะหย่อนยาน (Sag) ที่ช่วงเสาต่างๆ ของสาย {activeConductor.name}
          </div>
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
            อิงแรงดึงคงที่ T₀ = {Math.round(calculatedTension).toLocaleString()} kgf
          </span>
        </div>

        <div style={{ padding: "16px 24px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", color: "#334155", borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "10px 14px", fontWeight: "bold" }}>ช่วงเสา (L)</th>
                <th style={{ padding: "10px 14px", fontWeight: "bold" }}>ระยะหย่อนยาน (Sag : Y)</th>
                <th style={{ padding: "10px 14px", fontWeight: "bold" }}>แรงดึง (T₀)</th>
                <th style={{ padding: "10px 14px", fontWeight: "bold" }}>% ต่อ Max RTS</th>
                <th style={{ padding: "10px 14px", fontWeight: "bold" }}>การประเมิน</th>
              </tr>
            </thead>
            <tbody>
              {sampleSpans.map((span) => {
                const sY = calculatedTension > 0 ? (weight * Math.pow(span, 2)) / (8 * calculatedTension) : 0;
                const isSelected = span === spanLength;
                return (
                  <tr
                    key={span}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      backgroundColor: isSelected ? "#eff6ff" : "transparent",
                      fontWeight: isSelected ? "bold" : "normal"
                    }}
                  >
                    <td style={{ padding: "10px 14px", color: isSelected ? "#1d4ed8" : "#1e293b" }}>
                      {span} เมตร {isSelected && <span style={{ fontSize: "0.75rem", backgroundColor: "#3b82f6", color: "white", padding: "2px 6px", borderRadius: "4px", marginLeft: "6px" }}>ที่เลือก</span>}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#2563eb", fontWeight: "bold" }}>
                      {sY.toFixed(3)} ม.
                    </td>
                    <td style={{ padding: "10px 14px", color: "#475569" }}>
                      {Math.round(calculatedTension).toLocaleString()} kgf
                    </td>
                    <td style={{ padding: "10px 14px", color: statusColor, fontWeight: "bold" }}>
                      {tensionPercentRTS.toFixed(1)}%
                    </td>
                    <td style={{ padding: "10px 14px", color: sY > 3.0 ? "#dc2626" : sY > 1.5 ? "#d97706" : "#059669" }}>
                      {sY > 3.0 ? "⚠️ ท้องสายหย่อนมาก (ตรวจ Clearance)" : sY > 1.5 ? "ระยะปานกลาง" : "✅ สภาพปกติ"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary of Equations & Engineering Rules */}
      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1e293b", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Info size={20} className="text-blue-600" />
          สรุปสูตรและข้อกำหนดมาตรฐานวิศวกรรมสายส่ง 115 kV กฟภ.
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ fontWeight: "bold", color: "#334155", marginBottom: "8px" }}>สูตรพาราโบลิก (Parabolic Method)</h4>
            <div style={{ fontFamily: "monospace", fontSize: "1.1rem", color: "#0f172a", backgroundColor: "white", padding: "8px 12px", borderRadius: "6px", border: "1px dashed #cbd5e1", textAlign: "center", marginBottom: "10px" }}>
              Y = (W × L²) / (8 × T₀)
            </div>
            <ul style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, paddingLeft: "18px", lineHeight: "1.5" }}>
              <li><b>Y</b> = ระยะหย่อนยานต่ำสุดของสาย (m)</li>
              <li><b>W</b> = น้ำหนักสายต่อหน่วยความยาว (kg/m)</li>
              <li><b>L</b> = ระยะช่วงเสา (Span Length) (m)</li>
              <li><b>T₀</b> = แรงดึงในแนวราบที่จุดต่ำสุด (Horizontal Tension) (kgf)</li>
            </ul>
          </div>

          <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ fontWeight: "bold", color: "#334155", marginBottom: "8px" }}>เกณฑ์แรงดึงมาตรฐาน (Tension Limits)</h4>
            <ul style={{ fontSize: "0.85rem", color: "#475569", margin: 0, paddingLeft: "18px", lineHeight: "1.6" }}>
              <li><b>Initial / Everyday Tension (สภาวะปกติ):</b> อยู่ที่ประมาณ <b>18% - 22% ของ RTS</b> เพื่อป้องกันการสั่นสะเทือน (Aeolian Vibration) ที่จะทำให้สายล้าขาด</li>
              <li><b>Maximum Working Tension (สภาวะวิกฤต/ลมแรงสุด):</b> ต้องไม่เกิน <b>40% - 50% ของ RTS</b></li>
              <li><b>ผลของอุณหภูมิ:</b> อุณหภูมิสายสูงขึ้น (เช่น 90°C) สายจะยืดตัว ทำให้ Sag เพิ่มขึ้นมากที่สุด ต้องตรวจสอบระยะห่างจากพื้น (Ground Clearance) เสมอ</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
