import React, { useState } from "react";
import { MapPin, ArrowDown, Activity, Info, Shield, CheckCircle2, Layers, Crosshair, Wrench, AlertTriangle } from "lucide-react";

interface PoleHoleItem {
  id: number;
  distanceFromTop: string;
  distanceFromGround: string;
  holeDiameter: string;
  title: string;
  category: "peak" | "crossarm" | "guy" | "underbuild" | "comm" | "ground_test" | "buried";
  installedItems: string[];
  description: string;
  hardware: string;
  groundPlatePoint?: number;
}

const POLE_HOLES_DATA: PoleHoleItem[] = [
  {
    id: 1,
    distanceFromTop: "0.15 ม.",
    distanceFromGround: "+18.55 ม.",
    holeDiameter: "22 มม. (7/8\")",
    title: "รูยึดเข็มล่อฟ้า / สายดินยอดเสา (OHGW Peak Bayonet)",
    category: "peak",
    installedItems: [
      "เสาเข็มล่อฟ้า (Shield Wire Bayonet)",
      "แคล้มป์จับสายกราวด์ล่อฟ้า (OHGW / OPGW Suspension)",
      "แผ่นกราวด์เพลท (Ground Plate จุดที่ 1)"
    ],
    description: "รูบนสุดของยอดเสา ใช้ร้อยสลักยึดแกนเสาล่อฟ้า (OHGW Pin) และเชื่อมต่อสายดินยอดเสาเข้ากับเหล็กกราวด์ภายในเสาคอนกรีต",
    hardware: "Through Bolt 5/8\" x 12\" + Square Washer + Lock Nut",
    groundPlatePoint: 1
  },
  {
    id: 2,
    distanceFromTop: "0.45 ม.",
    distanceFromGround: "+18.25 ม.",
    holeDiameter: "22 มม. (7/8\")",
    title: "รูยึดคอนบน / รับสายเฟส A (Top Wishbone Crossarm)",
    category: "crossarm",
    installedItems: [
      "คอนเหล็กบน (Top Crossarm / Phase A Bracket)",
      "ชุดลูกถ้วยแขวนเฟสบน (Top Phase Insulator String)"
    ],
    description: "ใช้ยึดคอนเหล็กบนสำหรับรองรับสายตัวนำเฟสที่ 1 (เฟส A) ในการจัดสายแบบ Delta / Vertical",
    hardware: "Through Bolt 5/8\" x 14\" + Curve Washer"
  },
  {
    id: 3,
    distanceFromTop: "1.10 ม.",
    distanceFromGround: "+17.60 ม.",
    holeDiameter: "22 มม. (7/8\")",
    title: "รูยึดเหล็กค้ำคอนบน & กราวด์เพลท (Top Crossarm Brace & Ground Plate 2)",
    category: "crossarm",
    installedItems: [
      "เหล็กค้ำยันคอนบน (Top Flat/Angle Brace)",
      "แผ่นกราวด์เพลท (Ground Plate จุดที่ 2)"
    ],
    description: "จุดยึดเหล็กค้ำเพื่อเพิ่มความแข็งแรงรับแรงลมของคอนบน และเป็นจุดเชื่อมต่อกราวด์เพลทจุดที่ 2",
    hardware: "Through Bolt 5/8\" x 14\" + Ground Lug",
    groundPlatePoint: 2
  },
  {
    id: 4,
    distanceFromTop: "2.50 ม.",
    distanceFromGround: "+16.20 ม.",
    holeDiameter: "26 มม. (1\")",
    title: "รูยึดคอนเหล็กหลักคู่ล่าง (Main Lower Crossarm Bolt)",
    category: "crossarm",
    installedItems: [
      "คอนเหล็กหลักยาว 4.5 - 6.0 ม. (Main Double Crossarm)",
      "ชุดลูกถ้วยเฟส B และเฟส C (Left & Right Phase Assemblies)",
      "แคล้มป์แขวนสาย / เข้าปลายสาย"
    ],
    description: "รูขนาดใหญ่พิเศษรับแรงดัดสูงสุด ใช้ร้อยสลักเกลียวเหล็กกล้าเพื่อยึดคอนเหล็กคู่ล่างที่รองรับสายไฟ 2 เฟส",
    hardware: "High-Strength Through Bolt 3/4\" x 16\"-18\" + Heavy Square Washer"
  },
  {
    id: 5,
    distanceFromTop: "3.20 ม.",
    distanceFromGround: "+15.50 ม.",
    holeDiameter: "22 มม. (7/8\")",
    title: "รูยึดเหล็กค้ำคอนล่าง & กราวด์เพลท (Main Brace & Ground Plate 3)",
    category: "crossarm",
    installedItems: [
      "เหล็กค้ำยันคอนล่างรูปตัววี (V-Braces / Angle Braces)",
      "แผ่นกราวด์เพลท (Ground Plate จุดที่ 3)"
    ],
    description: "ยึดเหล็กฉากค้ำยันคอนล่าง ถ่ายแรงลมและน้ำหนักสายไฟลงสู่ลำต้นเสา",
    hardware: "Through Bolt 5/8\" x 16\" + Ground Connector",
    groundPlatePoint: 3
  },
  {
    id: 6,
    distanceFromTop: "3.80 - 4.20 ม.",
    distanceFromGround: "+14.50 ม.",
    holeDiameter: "22 มม. (7/8\")",
    title: "รูร้อยสลักห่วงยึดโยง (Guy Wire Attachment / Thimble Eye)",
    category: "guy",
    installedItems: [
      "สลักห่วงยึดโยง (Thimble Eye Bolt / Guy Attachment)",
      "สายลวดเหล็กตีเกลียวตรึงเสา (Guy Wire Strands 3/8\" หรือ 1/2\")",
      "ลูกถ้วยกันไฟย้อนสายยึดโยง (Guy Strain Insulator)"
    ],
    description: "ใช้สำหรับเสาทางโค้ง (SS-SA) เสาหัวมุม (SS-LA) หรือเสาจบสาย เพื่อยึดโยงสายลวดเหล็กลงสู่สมอบก (Anchor) ถ่ายแรงดึง",
    hardware: "Thimble Eye Bolt 5/8\" x 16\"-18\" + Guy Clip Grip"
  },
  {
    id: 7,
    distanceFromTop: "5.50 - 7.50 ม.",
    distanceFromGround: "+11.20 - 13.20 ม.",
    holeDiameter: "22 มม. (7/8\")",
    title: "รูติดตั้งสายส่งวงจรที่ 2 หรือระบบจำหน่ายร่วมทาง (Underbuild 22/33 kV)",
    category: "underbuild",
    installedItems: [
      "คอนระบบจำหน่ายแรงสูง 22 kV หรือ 33 kV ร่วมทาง",
      "โครงสร้างสวิตช์ตัดตอนใบมีด (Air Break Switch Support)",
      "แผ่นกราวด์เพลท (Ground Plate จุดที่ 4)"
    ],
    description: "ใช้ในกรณีสายส่ง 115 kV มีระบบจำหน่ายแรงสูง 22/33 kV ร่วมทางบนเสาเดียวกัน หรือติดตั้งสวิตช์แยกสาย",
    hardware: "Through Bolt 5/8\" x 18\" + Mounting Bracket",
    groundPlatePoint: 4
  },
  {
    id: 8,
    distanceFromTop: "10.00 - 12.00 ม.",
    distanceFromGround: "+6.70 - 8.70 ม.",
    holeDiameter: "18 มม. (3/4\")",
    title: "รูยึดสายเคเบิลสื่อสาร / ใยแก้วนำแสง (Fiber Optic / ADSS Bracket)",
    category: "comm",
    installedItems: [
      "ชุดแร็คแขวนสายไฟเบอร์ออปติก (ADSS / OFC Suspension Clamp)",
      "แคล้มป์รัดท่อร้อยสายดิน (Conduit Pipe Clamp)",
      "แผ่นกราวด์เพลท (Ground Plate จุดที่ 5)"
    ],
    description: "ใช้พาดสายใยแก้วนำแสงสื่อสารควบคุมระบบ SCADA และกล้องวงจรปิดของการไฟฟ้า",
    hardware: "Through Bolt 1/2\" หรือ 5/8\" x 18\" + ADSS Bracket",
    groundPlatePoint: 5
  },
  {
    id: 9,
    distanceFromTop: "17.20 ม.",
    distanceFromGround: "+1.50 ม. (ระดับสายตา)",
    holeDiameter: "18 มม. (3/4\")",
    title: "จุดทดสอบระบบกราวด์ & ป้ายเตือนภัยอันตราย (Ground Test Box & Danger Sign)",
    category: "ground_test",
    installedItems: [
      "กล่องจุดตัดต่อทดสอบค่าความต้านทานดิน (Ground Test Box / Disconnect Link)",
      "แผ่นกราวด์เพลท (Ground Plate จุดที่ 6)",
      "ป้ายเตือนอันตรายไฟฟ้าแรงสูง (Danger High Voltage Sign)"
    ],
    description: "จุดสำคัญสำหรับการบำรุงรักษา อยู่เหนือระดับดิน 1.50 เมตร เพื่อให้เจ้าหน้าที่เปิดกล่องทดสอบวัดค่าความต้านทานดิน (Ground Resistance) ได้สะดวก",
    hardware: "Ground Test Link + Brass Terminal + Danger Sign Plate",
    groundPlatePoint: 6
  },
  {
    id: 10,
    distanceFromTop: "19.50 ม.",
    distanceFromGround: "-0.80 ม. (ใต้ระดับดิน)",
    holeDiameter: "22 มม. (7/8\")",
    title: "จุดต่อสายกราวด์ลงดินใต้ผิวดิน (Sub-surface Ground Connection)",
    category: "buried",
    installedItems: [
      "แผ่นกราวด์เพลทใต้ดิน (Ground Plate จุดที่ 7)",
      "สายตัวนำทองแดงเปลือย (Bare Copper 50-70 sq.mm.) หรือเหล็กชุบสังกะสี",
      "จุดต่อเชื่อมไปยังแท่งกราวด์ร็อด (Ground Rod) หรือแผ่นกราวด์สตริป (Ground Strip)"
    ],
    description: "จุดต่อลงดินหลักใต้ผิวดิน 80 ซม. เชื่อมต่อสายดินจากในเสาเข้าสู่ระบบแท่งกราวด์ร็อด (GR) ตอกลึก 2.50 ม. หรือฝังแผ่นกราวด์สตริป (GS)",
    hardware: "Compression Ground Connector / Exothermic Welding + Ground Plate 7",
    groundPlatePoint: 7
  }
];

export default function PolesGrounding() {
  const [selectedHoleId, setSelectedHoleId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"diagram" | "grounding_system" | "table">("diagram");

  const activeHole = POLE_HOLES_DATA.find((h) => h.id === selectedHoleId) || POLE_HOLES_DATA[0];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(13, 148, 136, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" }}>
            <MapPin size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>รูปจำลองเสาคอนกรีต 22 ม. ระยะรูเสา และระบบต่อลงดิน</h2>
            <p style={{ color: "#ccfbf1", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              ระยะเจาะรูเสามาตรฐาน (Hole Schedule), การติดตั้งอุปกรณ์ในแต่ละรู, จุดกราวด์เพลท 7 จุด, และระบบ Grounding 115 kV กฟภ.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("diagram")}
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
            backgroundColor: activeTab === "diagram" ? "#0d9488" : "#f1f5f9",
            color: activeTab === "diagram" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Crosshair size={18} /> 1. รูปจำลองเสา 22 ม. &amp; รูเจาะเสา (Interactive Diagram)
        </button>
        <button
          onClick={() => setActiveTab("grounding_system")}
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
            backgroundColor: activeTab === "grounding_system" ? "#0d9488" : "#f1f5f9",
            color: activeTab === "grounding_system" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <ArrowDown size={18} /> 2. ระบบกราวด์ GR / GS / GC / GW
        </button>
        <button
          onClick={() => setActiveTab("table")}
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
            backgroundColor: activeTab === "table" ? "#0d9488" : "#f1f5f9",
            color: activeTab === "table" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Layers size={18} /> 3. ตารางสรุประยะรูเสาทั้งหมด (Hole Schedule)
        </button>
      </div>

      {/* TAB 1: INTERACTIVE POLE DIAGRAM */}
      {activeTab === "diagram" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 400px) 1fr", gap: "24px", alignItems: "start" }}>
          
          {/* Left: Interactive SVG Pole Vector */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #99f6e4", boxShadow: "0 4px 16px rgba(13, 148, 136, 0.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", backgroundColor: "#f0fdfa", borderBottom: "1px solid #ccfbf1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#0f766e" }}>คลิกที่ตำแหน่งรูเสา (1 - 10)</span>
              <span style={{ fontSize: "0.75rem", backgroundColor: "#ccfbf1", color: "#0f766e", padding: "3px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                เสา คอร. 22.00 ม.
              </span>
            </div>

            {/* SVG Canvas */}
            <div style={{ backgroundColor: "#0f172a", padding: "16px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "520px" }}>
              <Pole22mSVG selectedId={selectedHoleId} onSelectHole={(id) => setSelectedHoleId(id)} />
            </div>

            <div style={{ padding: "10px 16px", backgroundColor: "#f0fdfa", borderTop: "1px solid #ccfbf1", fontSize: "0.75rem", color: "#0f766e", textAlign: "center" }}>
              ความยาวรวม 22.00 ม. | เหนือดิน 18.70 ม. | ฝังดิน 3.30 ม. | ยอดเสา 25x25 ซม. / โคนเสา 44x44 ซม.
            </div>
          </div>

          {/* Right: Selected Hole Details & Hardware */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#0d9488", backgroundColor: "#ccfbf1", padding: "3px 10px", borderRadius: "12px" }}>
                    ตำแหน่งรูเสาที่ {activeHole.id} จาก 10 จุด
                  </span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1e293b", margin: "8px 0 2px 0" }}>
                    {activeHole.title}
                  </h3>
                </div>
              </div>

              {/* Distance Metrics Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                <div style={{ backgroundColor: "#f0fdfa", padding: "12px", borderRadius: "10px", border: "1px solid #ccfbf1" }}>
                  <span style={{ fontSize: "0.75rem", color: "#0f766e", fontWeight: "bold", display: "block" }}>ระยะวัดจากยอดเสา (Top)</span>
                  <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f766e" }}>{activeHole.distanceFromTop}</span>
                </div>

                <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", display: "block" }}>ระดับความสูงจากผิวดิน</span>
                  <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b" }}>{activeHole.distanceFromGround}</span>
                </div>

                <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", display: "block" }}>ขนาดรูเจาะเสา (Hole Dia)</span>
                  <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#2563eb" }}>{activeHole.holeDiameter}</span>
                </div>

                {activeHole.groundPlatePoint && (
                  <div style={{ backgroundColor: "#fef3c7", padding: "12px", borderRadius: "10px", border: "1px solid #fde68a" }}>
                    <span style={{ fontSize: "0.75rem", color: "#92400e", fontWeight: "bold", display: "block" }}>จุดต่อสายดิน (Grounding)</span>
                    <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#b45309" }}>Ground Plate จุดที่ {activeHole.groundPlatePoint}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                {activeHole.description}
              </p>

              {/* Items Installed */}
              <div style={{ backgroundColor: "#f8fafc", padding: "16px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#1e293b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={16} className="text-teal-600" />
                  อุปกรณ์ที่ติดตั้งในตำแหน่งนี้:
                </h4>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.9rem", color: "#334155", lineHeight: "1.6" }}>
                  {activeHole.installedItems.map((item, idx) => (
                    <li key={idx}><b>{item}</b></li>
                  ))}
                </ul>
              </div>

              {/* Hardware & Fasteners */}
              <div style={{ padding: "12px 14px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "0.85rem", color: "#166534", display: "flex", alignItems: "center", gap: "8px" }}>
                <Wrench size={18} className="flex-shrink-0 text-emerald-600" />
                <span><b>สลักเกลียวและอุปกรณ์ยึด:</b> {activeHole.hardware}</span>
              </div>

            </div>

            {/* Quick selector buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
              {POLE_HOLES_DATA.map((h) => {
                const isSelected = h.id === selectedHoleId;
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHoleId(h.id)}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: isSelected ? "2px solid #0d9488" : "1px solid #e2e8f0",
                      backgroundColor: isSelected ? "#ccfbf1" : "white",
                      color: isSelected ? "#0f766e" : "#475569",
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      textAlign: "center"
                    }}
                  >
                    จุดที่ {h.id} ({h.distanceFromTop})
                  </button>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: GROUNDING SYSTEM (GR / GS / GC / GW) */}
      {activeTab === "grounding_system" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ backgroundColor: "#f0fdfa", padding: "18px 22px", borderRadius: "14px", border: "1px solid #ccfbf1", color: "#0f766e" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={20} /> ระบบสายดินและกราวด์เพลท 7 จุดในเสาคอนกรีต 22 ม. (115 kV)
            </h3>
            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}>
              ภายในเสาคอนกรีต 22 ม. มีเหล็กเส้นกลมขนาด 12 มม. ฝังหล่อเป็นสายดินต่อเนื่องจากยอดเสาลงสู่โคนเสา และเชื่อมต่อกับ **แผ่นกราวด์เพลททองเหลือง/กัลวาไนซ์ 7 จุด** เพื่อให้ค่าความต้านทานดินรวมของเสาไม่เกิน **10 โอห์ม (Standard Ground Resistance ≤ 10 Ω)**
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            
            {/* Ground Rod (GR) */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #99f6e4", padding: "22px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ backgroundColor: "#ccfbf1", color: "#0f766e", padding: "10px", borderRadius: "10px", fontWeight: "bold" }}>
                  GR
                </div>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>Ground Rod (GR)</h4>
                  <span style={{ fontSize: "0.8rem", color: "#0d9488" }}>แท่งกราวด์ร็อดตอกแนวดิ่ง</span>
                </div>
              </div>
              <ul style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.6", margin: 0, paddingLeft: "18px" }}>
                <li><b>ขนาด:</b> แท่งเหล็กกล้าหุ้มทองแดง/กัลวาไนซ์ 5/8 นิ้ว ยาว 2.40 - 3.00 ม.</li>
                <li><b>ความลึก:</b> ตอกจมใต้ดินอย่างน้อย 0.50 - 0.80 ม.</li>
                <li><b>สภาพดินที่เหมาะสม:</b> ดินอ่อน ดินเหนียว ดินร่วน (ความต้านทาน 1 - 174 Ω-m)</li>
                <li><b>จำนวน:</b> ใช้ 1 ถึง 5 แท่ง ต่อขนานกันห่างกันอย่างน้อย 3-6 เมตร</li>
              </ul>
            </div>

            {/* Ground Strip (GS) */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #fed7aa", padding: "22px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ backgroundColor: "#ffedd5", color: "#c2410c", padding: "10px", borderRadius: "10px", fontWeight: "bold" }}>
                  GS
                </div>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>Ground Strip (GS)</h4>
                  <span style={{ fontSize: "0.8rem", color: "#ea580c" }}>แผ่นเหล็ก/สายกราวด์ฝังแนวราบ</span>
                </div>
              </div>
              <ul style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.6", margin: 0, paddingLeft: "18px" }}>
                <li><b>ขนาด:</b> แผ่นเหล็กชุบกัลวาไนซ์ 30x3.5 มม. หรือสายทองแดงเปลือย 70 ตร.มม. ยาว 10 - 20 ม.</li>
                <li><b>ความลึก:</b> ขุดร่องฝังลึก 0.50 - 0.80 ม. ขนานไปตามแนวสายส่ง</li>
                <li><b>สภาพดินที่เหมาะสม:</b> ดินแข็ง หินปนทราย (ความต้านทาน 175 - 262 Ω-m) ที่ตอกกราวด์ร็อดไม่ลง</li>
              </ul>
            </div>

            {/* Ground Concrete (GC) */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #ddd6fe", padding: "22px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ backgroundColor: "#ede9fe", color: "#6d28d9", padding: "10px", borderRadius: "10px", fontWeight: "bold" }}>
                  GC
                </div>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>Ground Concrete (GC)</h4>
                  <span style={{ fontSize: "0.8rem", color: "#7c3aed" }}>การต่อกราวด์เข้ากับฐานรากเสา</span>
                </div>
              </div>
              <ul style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.6", margin: 0, paddingLeft: "18px" }}>
                <li><b>วิธีปฏิบัติ:</b> เชื่อมต่อสายกราวด์เข้ากับเหล็กเสริมโครงสร้างฐานรากคอนกรีต (Ufer Ground)</li>
                <li><b>จุดเด่น:</b> ช่วยลดค่าความต้านทานดินได้อย่างถาวร โดยอาศัยความชื้นรอบฐานรากคอนกรีตขนาดใหญ่</li>
              </ul>
            </div>

            {/* Ground Well (GW) */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #bfdbfe", padding: "22px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "10px", borderRadius: "10px", fontWeight: "bold" }}>
                  GW
                </div>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>Ground Well (GW)</h4>
                  <span style={{ fontSize: "0.8rem", color: "#2563eb" }}>บ่อกราวด์ลึกพิเศษ</span>
                </div>
              </div>
              <ul style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.6", margin: 0, paddingLeft: "18px" }}>
                <li><b>วิธีปฏิบัติ:</b> เจาะหลุมลึก 6 - 15 เมตร ลงสู่ชั้นน้ำใต้ดิน และใส่สารเคมีปรับปรุงดิน (Bentonite / Ground Enhancing Material)</li>
                <li><b>สภาพพื้นที่:</b> ภูเขาหิน ยอดดอย หรือพื้นที่ดินแห้งแล้งสูงมาก</li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: FULL HOLE SCHEDULE TABLE */}
      {activeTab === "table" && (
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", backgroundColor: "#f0fdfa", borderBottom: "1px solid #ccfbf1", fontWeight: "bold", color: "#0f766e", fontSize: "1.05rem" }}>
            📐 ตารางระยะเจาะรูเสาคอนกรีตอัดแรง 22.00 ม. (PEA 115 kV Hole Schedule)
          </div>
          
          <div style={{ padding: "20px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", color: "#334155", borderBottom: "2px solid #cbd5e1" }}>
                  <th style={{ padding: "12px 14px", fontWeight: "bold" }}>จุดที่</th>
                  <th style={{ padding: "12px 14px", fontWeight: "bold" }}>ระยะจากยอดเสา</th>
                  <th style={{ padding: "12px 14px", fontWeight: "bold" }}>ระดับเหนือดิน</th>
                  <th style={{ padding: "12px 14px", fontWeight: "bold" }}>ขนาดรู</th>
                  <th style={{ padding: "12px 14px", fontWeight: "bold" }}>อุปกรณ์และวัตถุประสงค์การใช้งาน</th>
                  <th style={{ padding: "12px 14px", fontWeight: "bold" }}>สลักยึด (Fasteners)</th>
                </tr>
              </thead>
              <tbody>
                {POLE_HOLES_DATA.map((h) => (
                  <tr key={h.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#0f766e" }}>{h.id}</td>
                    <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#1e293b" }}>{h.distanceFromTop}</td>
                    <td style={{ padding: "12px 14px", color: "#64748b" }}>{h.distanceFromGround}</td>
                    <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#2563eb" }}>{h.holeDiameter}</td>
                    <td style={{ padding: "12px 14px", color: "#334155" }}>
                      <div style={{ fontWeight: "bold" }}>{h.title}</div>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{h.description}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.85rem", color: "#059669" }}>{h.hardware}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── SVG Interactive Vector of 22m Concrete Pole ───────────────────────────

function Pole22mSVG({ selectedId, onSelectHole }: { selectedId: number; onSelectHole: (id: number) => void }) {
  // SVG coordinates for the 10 holes along the 22m pole
  // Total SVG height = 480px (representing 22m)
  // Ground line @ 18.70m from top -> y = 390px
  const holePositions = [
    { id: 1, y: 35, label: "1. OHGW Peak (0.15 ม.)" },
    { id: 2, y: 65, label: "2. คอนบน (0.45 ม.)" },
    { id: 3, y: 95, label: "3. ค้ำคอนบน (1.10 ม.)" },
    { id: 4, y: 145, label: "4. คอนหลักล่าง (2.50 ม.)" },
    { id: 5, y: 175, label: "5. ค้ำคอนล่าง (3.20 ม.)" },
    { id: 6, y: 210, label: "6. สายยึดโยง Guy (4.00 ม.)" },
    { id: 7, y: 260, label: "7. คอนร่วมทาง 22kV (6.50 ม.)" },
    { id: 8, y: 310, label: "8. สายสื่อสาร FO (11.0 ม.)" },
    { id: 9, y: 365, label: "9. Test Box (+1.50 ม.)" },
    { id: 10, y: 420, label: "10. กราวด์ใต้ดิน (-0.80 ม.)" }
  ];

  return (
    <svg width="340" height="490" viewBox="0 0 340 490" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground Line representation */}
      <rect x="0" y="390" width="340" height="100" fill="#1e293b" fillOpacity="0.8" />
      <line x1="0" y1="390" x2="340" y2="390" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" />
      <text x="15" y="385" fill="#10b981" fontSize="10" fontWeight="bold">ระดับผิวดิน (Ground Line +0.00 ม.)</text>
      <text x="15" y="450" fill="#94a3b8" fontSize="9">หลุมฝังดินลึก 3.30 ม.</text>

      {/* Concrete Pole Trunk (Tapered) */}
      <polygon points="122,25 138,25 146,475 114,475" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
      
      {/* Internal Ground Wire (12mm steel inside pole) */}
      <line x1="130" y1="25" x2="130" y2="475" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />

      {/* Top Cap */}
      <rect x="120" y="20" width="20" height="6" rx="2" fill="#94a3b8" />
      <text x="130" y="14" fill="#94a3b8" fontSize="8" textAnchor="middle">ยอดเสา 25x25 ซม.</text>

      {/* Base dimension */}
      <text x="130" y="485" fill="#94a3b8" fontSize="8" textAnchor="middle">โคนเสา 44x44 ซม.</text>

      {/* Clickable Hole Indicators */}
      {holePositions.map((h) => {
        const isSelected = h.id === selectedId;
        return (
          <g key={h.id} onClick={() => onSelectHole(h.id)} style={{ cursor: "pointer" }}>
            {/* Horizontal pointer line */}
            <line
              x1="130"
              y1={h.y}
              x2="175"
              y2={h.y}
              stroke={isSelected ? "#0d9488" : "#475569"}
              strokeWidth={isSelected ? "2" : "1"}
            />
            {/* Hole dot on pole */}
            <circle
              cx="130"
              cy={h.y}
              r={isSelected ? "5" : "3.5"}
              fill={isSelected ? "#14b8a6" : "#334155"}
              stroke={isSelected ? "#ffffff" : "#cbd5e1"}
              strokeWidth={isSelected ? "2" : "1"}
            />
            {/* Button / Label Badge */}
            <rect
              x="175"
              y={h.y - 10}
              width="155"
              height="20"
              rx="4"
              fill={isSelected ? "#0d9488" : "#1e293b"}
              stroke={isSelected ? "#14b8a6" : "#334155"}
              strokeWidth="1"
            />
            <text
              x="182"
              y={h.y + 4}
              fill={isSelected ? "#ffffff" : "#cbd5e1"}
              fontSize="8.5"
              fontWeight={isSelected ? "bold" : "normal"}
            >
              {h.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
