import React, { useState } from "react";
import { Cpu, Layers, Compass, Shield, ArrowRight, CheckCircle, Info, Sparkles, Filter } from "lucide-react";

interface PoleStructure {
  id: string;
  code: string;
  name: string;
  category: "single_circuit" | "double_circuit" | "tap_line" | "special";
  categoryName: string;
  angleRange: string;
  insulatorType: string;
  guyWire: string;
  description: string;
  usage: string[];
  specs: {
    crossarm: string;
    shieldWire: string;
    spanMax: string;
  };
  svgType: "SS-TG" | "SS-SA" | "SS-AS" | "SS-LA" | "DD-TG" | "SS-TL";
}

const STRUCTURE_DATA: PoleStructure[] = [
  {
    id: "ss-tg",
    code: "SS-TG-2 / SS-TG-6",
    name: "เสาทางตรงวงจรเดี่ยว (Single Circuit Tangent)",
    category: "single_circuit",
    categoryName: "วงจรเดี่ยว (Single Circuit)",
    angleRange: "0° - 2° (ทางตรง)",
    insulatorType: "ลูกถ้วยแขวนแนวดิ่ง (D-1, D-11)",
    guyWire: "ไม่ต้องใช้สายยึดโยง (ยกเว้นสภาพดินอ่อนผิดปกติ)",
    description: "โครงสร้างเสาเดี่ยวมาตรฐานที่พบมากที่สุด ใช้พาดสายในแนวเส้นตรงหรือมีมุมเลี้ยวไม่เกิน 2 องศา ลูกถ้วยจะแขวนห้อยลงมาในแนวดิ่ง",
    usage: [
      "แนวสายส่งทางตรงทั่วไป",
      "ช่วงเสาปกติ 60 - 100 เมตร",
      "พาดสายเฟสแบบ Delta หรือ Vertical คอนเหล็กชุบกัลวาไนซ์"
    ],
    specs: {
      crossarm: "คอนเหล็กขวางเดี่ยว (Steel Crossarm)",
      shieldWire: "สายกราวด์ล่อฟ้า (OHGW) 1 เส้นยอดเสา",
      spanMax: "100 - 120 เมตร"
    },
    svgType: "SS-TG"
  },
  {
    id: "ss-sa",
    code: "SS-SA-2",
    name: "เสาทางโค้งมุมเล็ก (Small Angle Structure)",
    category: "single_circuit",
    categoryName: "วงจรเดี่ยว (Single Circuit)",
    angleRange: "2° - 30° (ทางโค้งมุมเล็ก)",
    insulatorType: "ลูกถ้วยแขวนเอียงตามแรงดึง (D-2, D-12)",
    guyWire: "ติดตั้งสายยึดโยง 1 ชุด (ด้านตรงข้ามมุมเลี้ยว)",
    description: "ใช้สำหรับจุดที่แนวสายส่งเลี้ยวเป็นมุมโค้งเล็กน้อย ลูกถ้วยจะเอียงไปตามทิศทางแรงดึงลัพธ์ของสายไฟ",
    usage: [
      "ทางโค้งตามแนวถนนหรือขอบทาง",
      "มุมเลี้ยว 2 ถึง 30 องศา",
      "มีสายยึดโยง (Guy Wire) ช่วยรับแรงดึงในแนวระนาบ"
    ],
    specs: {
      crossarm: "คอนเหล็กเสริมค้ำยัน (Braced Crossarm)",
      shieldWire: "สายกราวด์ยอดเสาพร้อมแคล้มป์มุม",
      spanMax: "80 - 100 เมตร"
    },
    svgType: "SS-SA"
  },
  {
    id: "ss-as",
    code: "SS-AS-4",
    name: "เสายึดดึงตรงสองข้าง (Anchor / Strain Structure)",
    category: "single_circuit",
    categoryName: "วงจรเดี่ยว (Single Circuit)",
    angleRange: "0° - 2° (ทางตรงดึงตึง)",
    insulatorType: "ลูกถ้วยเข้าปลายสายแนวนอน 2 ฝั่ง (D-3, D-13)",
    guyWire: "ติดตั้งสายยึดโยง 2 ทิศทาง (หัว-ท้ายเสา)",
    description: "เสาดึงตรึงสายไฟเป็นระยะ (Section Pole) เพื่อแบ่งแรงดึงของสายไฟไม่ให้ถ่ายทอดสะสมยาวเกินไป และต่อเชื่อมสายด้วยสายจัมเปอร์ (Jumper Loop)",
    usage: [
      "จุดตัดแบ่งช่วงดึงสายทุกๆ 1.5 - 2.0 กม.",
      "ก่อนเข้าเสามุมใหญ่หรือเสาข้ามอุปสรรคสำคัญ",
      "ป้องกันการล้มเป็นโดมิโนกรณีสายไฟขาด"
    ],
    specs: {
      crossarm: "คอนเหล็กคู่รับแรงดึงสูง (Double Crossarm)",
      shieldWire: "สายกราวด์ล่อฟ้าเข้าปลายสายสองข้าง",
      spanMax: "100 - 150 เมตร"
    },
    svgType: "SS-AS"
  },
  {
    id: "ss-la",
    code: "SS-LA-1 / SS-LA-2",
    name: "เสาหัวมุมใหญ่และเสาเข้าปลายสาย (Large Angle / Dead-End)",
    category: "single_circuit",
    categoryName: "วงจรเดี่ยว (Single Circuit)",
    angleRange: "30° - 90° หรือ 45° - 135°",
    insulatorType: "ลูกถ้วยเข้าปลายสายพวงคู่ (D-3, D-13 / D-19)",
    guyWire: "ติดตั้งสายยึดโยงหนัก 2-4 ชุด (Heavy Guying)",
    description: "เสาสำหรับเลี้ยวมุมหักศอก หัวมุมถนน หรือข้ามทางแยกใหญ่ รับแรงดึงมหาศาลจากทั้งสองทิศทาง มีสายจัมเปอร์โค้งอ้อมผ่านลูกถ้วยตั้ง (Post Insulator)",
    usage: [
      "จุดหักมุมสายส่ง 90 องศา หรือข้ามสี่แยก",
      "เสาต้นสุดท้ายก่อนเข้าสถานีไฟฟ้า (Substation Terminal)",
      "เสาข้ามแม่น้ำกว้าง (River Crossing Anchor)"
    ],
    specs: {
      crossarm: "คอนเหล็กคู่หนาพิเศษพร้อมแผ่นประกับ",
      shieldWire: "สายกราวด์เข้าปลายสายพวงคู่",
      spanMax: "120 - 200 เมตร"
    },
    svgType: "SS-LA"
  },
  {
    id: "dd-tg",
    code: "SD-TG / DD-TG",
    name: "เสาทางตรงวงจรคู่ (Double Circuit Tangent)",
    category: "double_circuit",
    categoryName: "วงจรคู่ (Double Circuit)",
    angleRange: "0° - 2° (ทางตรง 2 วงจร)",
    insulatorType: "ลูกถ้วยแขวน 6 ชุด (D-1, D-11)",
    guyWire: "ไม่จำเป็นต้องใช้สายยึดโยงในสภาพปกติ",
    description: "เสาโครงสร้างคอน 3 ชั้น รองรับสายไฟฟ้า 6 เฟส (วงจรที่ 1 ทางซ้าย และวงจรที่ 2 ทางขวา) นิยมใช้ในเขตเมืองหรือพื้นที่เขตทางจำกัด",
    usage: [
      "สายส่ง 2 วงจรบนแนวเสาเดียวกันเพื่อประหยัดพื้นที่",
      "ส่งไฟฟ้าคู่ขนานเพิ่มเสถียรภาพระบบ",
      "ระยะห่างระหว่างเฟสเป็นไปตามมาตรฐาน NESC"
    ],
    specs: {
      crossarm: "คอน 3 ชั้น (3-Tier Steel Crossarms)",
      shieldWire: "สายกราวด์ 1-2 เส้นบนยอดเสา",
      spanMax: "80 - 100 เมตร"
    },
    svgType: "DD-TG"
  },
  {
    id: "ss-tl",
    code: "SS-TL-1 / SD-TL-1",
    name: "เสาแยกสาย 3 ทาง (Tap-Line Structure)",
    category: "tap_line",
    categoryName: "เสาแยกสาย (Tap-Line)",
    angleRange: "แยกสาย 90° ข้ามทางสัญจร",
    insulatorType: "ลูกถ้วยผสม (แขวนทางตรง + เข้าปลายสายแทป)",
    guyWire: "ติดตั้งสายยึดโยงด้านตรงข้ามแนวแยกสาย",
    description: "โครงสร้างเสาสำหรับแยกสายส่ง (T-Branch) ไปยังสถานีไฟฟ้าย่อย โรงงานอุตสาหกรรม หรือระบบข้างเคียง พร้อมชุดตัดตอน (Air Break Switch)",
    usage: [
      "จุดแยกสายส่งไปยังผู้ใช้ไฟฟ้ารายใหญ่",
      "จุดแยกวงจรไปสถานีย่อยแห่งใหม่",
      "มีชุดจัมเปอร์และอุปกรณ์ดึงสาย 3 ทิศทาง"
    ],
    specs: {
      crossarm: "คอนทางตรง + คอนเสริมดึงแยกแนวฉาก",
      shieldWire: "แยกสายกราวด์ตามแนวสายส่งใหม่",
      spanMax: "60 - 80 เมตร (แนวแทป)"
    },
    svgType: "SS-TL"
  }
];

export default function Structures() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [activeStructureId, setActiveStructureId] = useState<string>("ss-tg");

  const filteredStructures = selectedFilter === "all"
    ? STRUCTURE_DATA
    : STRUCTURE_DATA.filter((s) => s.category === selectedFilter);

  const activeStructure = STRUCTURE_DATA.find((s) => s.id === activeStructureId) || STRUCTURE_DATA[0];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" }}>
            <Cpu size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>แบบมาตรฐานโครงสร้างหัวเสาสายส่ง 115 kV</h2>
            <p style={{ color: "#ede9fe", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              รูปจำลองลักษณะหัวเสา คอนเหล็ก ลูกถ้วย และลักษณะการใช้งานตามมุมเลี้ยวและประเภทวงจร กฟภ.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "0.9rem", fontWeight: "bold", marginRight: "6px" }}>
          <Filter size={16} /> ตัวกรอง:
        </div>
        {[
          { id: "all", label: "ทั้งหมด (All Types)" },
          { id: "single_circuit", label: "วงจรเดี่ยว (SS Series)" },
          { id: "double_circuit", label: "วงจรคู่ (DD/SD Series)" },
          { id: "tap_line", label: "เสาแยกสาย (TL Series)" }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "bold",
              backgroundColor: selectedFilter === f.id ? "#7c3aed" : "#f1f5f9",
              color: selectedFilter === f.id ? "white" : "#475569",
              transition: "all 0.2s"
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main Interactive Stage: Left Diagram + Right Details */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left: Interactive Simulated Diagram Card */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#7c3aed", textTransform: "uppercase" }}>รูปจำลองทางวิศวกรรม</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>{activeStructure.code}</h3>
            </div>
            <span style={{ fontSize: "0.8rem", backgroundColor: "#ede9fe", color: "#6d28d9", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold" }}>
              {activeStructure.categoryName}
            </span>
          </div>

          {/* SVG Canvas */}
          <div style={{ backgroundColor: "#0f172a", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "360px", position: "relative" }}>
            <PoleHeadSVG type={activeStructure.svgType} />
            
            {/* Compass / Angle Indicator Badge */}
            <div style={{ position: "absolute", bottom: "12px", right: "12px", backgroundColor: "rgba(15, 23, 42, 0.85)", border: "1px solid #334155", borderRadius: "8px", padding: "6px 12px", color: "#38bdf8", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px", backdropFilter: "blur(4px)" }}>
              <Compass size={14} />
              <span>มุมเลี้ยว: <b>{activeStructure.angleRange}</b></span>
            </div>
          </div>

          {/* Diagram Legend */}
          <div style={{ padding: "14px 18px", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.75rem", color: "#64748b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", backgroundColor: "#38bdf8", borderRadius: "50%" }}></span>
              <span>สายกราวด์ล่อฟ้า (OHGW)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", backgroundColor: "#f59e0b", borderRadius: "50%" }}></span>
              <span>สายไฟฟ้า 3 เฟส (Conductors)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", backgroundColor: "#cbd5e1", borderRadius: "2px" }}></span>
              <span>คอนเหล็กขวาง (Crossarm)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", backgroundColor: "#ec4899", borderRadius: "2px" }}></span>
              <span>พวงลูกถ้วย (Insulator String)</span>
            </div>
          </div>
        </div>

        {/* Right: Structure Detail Specifications */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* Main Info Card */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: "bold", color: "#1e293b", margin: "0 0 4px 0" }}>
                  {activeStructure.name}
                </h3>
                <span style={{ fontSize: "0.9rem", color: "#7c3aed", fontWeight: "bold" }}>
                  รหัสแบบมาตรฐาน: {activeStructure.code}
                </span>
              </div>
            </div>

            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 18px 0" }}>
              {activeStructure.description}
            </p>

            {/* Spec Highlights Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "18px" }}>
              
              <div style={{ backgroundColor: "#f5f3ff", padding: "12px 14px", borderRadius: "10px", border: "1px solid #ddd6fe" }}>
                <span style={{ fontSize: "0.75rem", color: "#6d28d9", fontWeight: "bold", display: "block" }}>มุมเบี่ยงเบนแนวสาย (Angle)</span>
                <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#4c1d95" }}>{activeStructure.angleRange}</span>
              </div>

              <div style={{ backgroundColor: "#fdf2f8", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fbcfe8" }}>
                <span style={{ fontSize: "0.75rem", color: "#be185d", fontWeight: "bold", display: "block" }}>ชุดลูกถ้วยที่ใช้</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#9d174d" }}>{activeStructure.insulatorType}</span>
              </div>

              <div style={{ backgroundColor: "#fefce8", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fef08a" }}>
                <span style={{ fontSize: "0.75rem", color: "#a16207", fontWeight: "bold", display: "block" }}>สายยึดโยง (Guy Wire)</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#854d0e" }}>{activeStructure.guyWire}</span>
              </div>

              <div style={{ backgroundColor: "#f0fdf4", padding: "12px 14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: "bold", display: "block" }}>ช่วงเสาสูงสุด (Span Max)</span>
                <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#166534" }}>{activeStructure.specs.spanMax}</span>
              </div>

            </div>

            {/* Practical Usage Points */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#1e293b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle size={16} className="text-emerald-600" />
                ลักษณะและการนำไปใช้งานในไซต์ก่อสร้าง:
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.9rem", color: "#475569", lineHeight: "1.6" }}>
                {activeStructure.usage.map((u, idx) => (
                  <li key={idx}>{u}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* Grid of Structure Cards to Select From */}
      <div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#1e293b", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Layers size={20} className="text-purple-600" />
          เลือกดูโครงสร้างหัวเสาแบบอื่นๆ (คลิกเพื่อแสดงรูปจำลอง):
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {filteredStructures.map((struct) => {
            const isSelected = struct.id === activeStructureId;
            return (
              <div
                key={struct.id}
                onClick={() => setActiveStructureId(struct.id)}
                style={{
                  backgroundColor: "white",
                  borderRadius: "14px",
                  border: isSelected ? "2px solid #7c3aed" : "1px solid #e2e8f0",
                  padding: "16px 18px",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 8px 20px -4px rgba(124, 58, 237, 0.25)" : "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "800", color: isSelected ? "#7c3aed" : "#1e293b", fontSize: "1.05rem" }}>
                      {struct.code}
                    </span>
                    <span style={{ fontSize: "0.75rem", backgroundColor: isSelected ? "#ede9fe" : "#f1f5f9", color: isSelected ? "#6d28d9" : "#64748b", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>
                      {struct.angleRange}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 10px 0", lineHeight: "1.4" }}>
                    {struct.name}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: isSelected ? "#7c3aed" : "#94a3b8", fontWeight: "bold", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
                  <span>{struct.specs.crossarm}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    ดูรูปจำลอง <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ─── SVG Vector Diagrams of Pole Heads ───────────────────────────────────────

function PoleHeadSVG({ type }: { type: "SS-TG" | "SS-SA" | "SS-AS" | "SS-LA" | "DD-TG" | "SS-TL" }) {
  switch (type) {
    case "SS-TG":
      // Single Circuit Tangent (Delta / Wishbone configuration with suspension insulators)
      return (
        <svg width="280" height="340" viewBox="0 0 280 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sky background lines */}
          <line x1="20" y1="30" x2="260" y2="30" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="20" y1="140" x2="260" y2="140" stroke="#1e293b" strokeDasharray="4 4" />

          {/* Concrete Pole Trunk (Tapered) */}
          <polygon points="132,40 148,40 156,330 124,330" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
          <line x1="140" y1="40" x2="140" y2="330" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 6" />

          {/* Overhead Ground Wire Peak (OHGW Pin) */}
          <line x1="140" y1="40" x2="140" y2="15" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="140" cy="15" r="4" fill="#38bdf8" />
          <line x1="10" y1="15" x2="270" y2="15" stroke="#38bdf8" strokeWidth="2" />
          <text x="148" y="18" fill="#38bdf8" fontSize="10" fontWeight="bold">OHGW (กราวด์)</text>

          {/* Top Conductor (Phase A - Center/Top Wishbone) */}
          <polygon points="120,70 160,70 155,78 125,78" fill="#64748b" />
          {/* Top Insulator string */}
          <g>
            <rect x="136" y="78" width="8" height="6" rx="2" fill="#ec4899" />
            <rect x="135" y="86" width="10" height="6" rx="2" fill="#ec4899" />
            <rect x="135" y="94" width="10" height="6" rx="2" fill="#ec4899" />
            <rect x="136" y="102" width="8" height="6" rx="2" fill="#ec4899" />
            {/* Conductor Line Phase A */}
            <circle cx="140" cy="114" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
            <line x1="10" y1="114" x2="270" y2="114" stroke="#f59e0b" strokeWidth="3" />
            <text x="150" y="118" fill="#fbbf24" fontSize="10" fontWeight="bold">เฟส A</text>
          </g>

          {/* Main Lower Crossarm (Steel Crossarm) */}
          <polygon points="40,140 240,140 240,150 40,150" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="140" y1="170" x2="80" y2="150" stroke="#94a3b8" strokeWidth="3" />
          <line x1="140" y1="170" x2="200" y2="150" stroke="#94a3b8" strokeWidth="3" />

          {/* Left Insulator String (Phase B) */}
          <g>
            <rect x="56" y="150" width="8" height="6" rx="2" fill="#ec4899" />
            <rect x="55" y="158" width="10" height="6" rx="2" fill="#ec4899" />
            <rect x="55" y="166" width="10" height="6" rx="2" fill="#ec4899" />
            <rect x="56" y="174" width="8" height="6" rx="2" fill="#ec4899" />
            {/* Conductor */}
            <circle cx="60" cy="186" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
            <line x1="10" y1="186" x2="270" y2="186" stroke="#f59e0b" strokeWidth="3" />
            <text x="70" y="190" fill="#fbbf24" fontSize="10" fontWeight="bold">เฟส B</text>
          </g>

          {/* Right Insulator String (Phase C) */}
          <g>
            <rect x="216" y="150" width="8" height="6" rx="2" fill="#ec4899" />
            <rect x="215" y="158" width="10" height="6" rx="2" fill="#ec4899" />
            <rect x="215" y="166" width="10" height="6" rx="2" fill="#ec4899" />
            <rect x="216" y="174" width="8" height="6" rx="2" fill="#ec4899" />
            {/* Conductor */}
            <circle cx="220" cy="186" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
            <line x1="10" y1="186" x2="270" y2="186" stroke="#f59e0b" strokeWidth="3" />
            <text x="230" y="190" fill="#fbbf24" fontSize="10" fontWeight="bold">เฟส C</text>
          </g>

          {/* Ground Level Info */}
          <text x="140" y="315" fill="#94a3b8" fontSize="11" textAnchor="middle">เสาคอนกรีตอัดแรง 22 ม.</text>
        </svg>
      );

    case "SS-SA":
      // Small Angle (Insulators swinging at an angle)
      return (
        <svg width="280" height="340" viewBox="0 0 280 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Guy wire on the left */}
          <line x1="140" y1="140" x2="15" y2="330" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 3" />
          <text x="25" y="270" fill="#f43f5e" fontSize="9" fontWeight="bold">สายยึดโยง (Guy Wire)</text>

          {/* Pole Trunk */}
          <polygon points="132,40 148,40 156,330 124,330" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />

          {/* Shield Wire Peak */}
          <line x1="140" y1="40" x2="140" y2="15" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="140" cy="15" r="4" fill="#38bdf8" />
          <path d="M 10,25 Q 140,15 270,5" stroke="#38bdf8" strokeWidth="2" fill="none" />

          {/* Top Crossarm */}
          <polygon points="120,70 160,70 155,78 125,78" fill="#64748b" />
          {/* Angled Top Insulator */}
          <g transform="rotate(18, 140, 78)">
            <rect x="136" y="78" width="8" height="6" rx="2" fill="#ec4899" />
            <rect x="135" y="86" width="10" height="6" rx="2" fill="#ec4899" />
            <rect x="135" y="94" width="10" height="6" rx="2" fill="#ec4899" />
            <circle cx="140" cy="106" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          </g>

          {/* Main Crossarm */}
          <polygon points="40,140 240,140 240,150 40,150" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Left Angled Insulator */}
          <g transform="rotate(18, 60, 150)">
            <rect x="56" y="150" width="8" height="6" rx="2" fill="#ec4899" />
            <rect x="55" y="158" width="10" height="6" rx="2" fill="#ec4899" />
            <rect x="55" y="166" width="10" height="6" rx="2" fill="#ec4899" />
            <circle cx="60" cy="178" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          </g>

          {/* Right Angled Insulator */}
          <g transform="rotate(18, 220, 150)">
            <rect x="216" y="150" width="8" height="6" rx="2" fill="#ec4899" />
            <rect x="215" y="158" width="10" height="6" rx="2" fill="#ec4899" />
            <rect x="215" y="166" width="10" height="6" rx="2" fill="#ec4899" />
            <circle cx="220" cy="178" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          </g>

          <text x="140" y="315" fill="#a78bfa" fontSize="11" textAnchor="middle" fontWeight="bold">มุมเลี้ยว 2° ถึง 30° (สายเอียงตามแรงดึง)</text>
        </svg>
      );

    case "SS-AS":
      // Anchor / Double Dead-end (Horizontal Strain Insulators + Jumper)
      return (
        <svg width="280" height="340" viewBox="0 0 280 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pole Trunk */}
          <polygon points="132,40 148,40 156,330 124,330" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />

          {/* Shield Wire Dead-Ends at Top */}
          <line x1="140" y1="40" x2="140" y2="15" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="140" cy="15" r="4" fill="#38bdf8" />
          <line x1="10" y1="15" x2="135" y2="15" stroke="#38bdf8" strokeWidth="2" />
          <line x1="145" y1="15" x2="270" y2="15" stroke="#38bdf8" strokeWidth="2" />

          {/* Double Crossarm Heavy Plate */}
          <rect x="110" y="80" width="60" height="16" fill="#475569" rx="2" />
          {/* Horizontal Dead-End Insulators Phase A (Top) */}
          <g>
            <rect x="65" y="84" width="45" height="8" rx="2" fill="#ec4899" />
            <rect x="170" y="84" width="45" height="8" rx="2" fill="#ec4899" />
            {/* Conductors */}
            <line x1="10" y1="88" x2="65" y2="88" stroke="#f59e0b" strokeWidth="3" />
            <line x1="215" y1="88" x2="270" y2="88" stroke="#f59e0b" strokeWidth="3" />
            {/* Jumper Loop */}
            <path d="M 65,88 Q 140,115 215,88" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
            <text x="140" y="118" fill="#fbbf24" fontSize="9" textAnchor="middle">สายจัมเปอร์ (Jumper)</text>
          </g>

          {/* Main Lower Heavy Double Crossarms */}
          <polygon points="30,170 250,170 250,182 30,182" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />

          {/* Left Dead-Ends (Phase B) */}
          <g>
            <rect x="15" y="173" width="30" height="8" rx="2" fill="#ec4899" />
            <rect x="55" y="173" width="30" height="8" rx="2" fill="#ec4899" />
            <path d="M 15,177 Q 50,205 85,177" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
          </g>

          {/* Right Dead-Ends (Phase C) */}
          <g>
            <rect x="195" y="173" width="30" height="8" rx="2" fill="#ec4899" />
            <rect x="235" y="173" width="30" height="8" rx="2" fill="#ec4899" />
            <path d="M 195,177 Q 230,205 265,177" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
          </g>

          <text x="140" y="315" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">เสายึดดึงตรงสองข้าง (เข้าปลายสาย + Jumper)</text>
        </svg>
      );

    case "SS-LA":
      // Large Angle 90-degree Dead-end with Heavy Guy Wires
      return (
        <svg width="280" height="340" viewBox="0 0 280 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Heavy Guy Wires */}
          <line x1="140" y1="100" x2="10" y2="330" stroke="#f43f5e" strokeWidth="2.5" />
          <line x1="140" y1="160" x2="30" y2="330" stroke="#f43f5e" strokeWidth="2.5" />
          <text x="25" y="240" fill="#f43f5e" fontSize="9" fontWeight="bold">สายยึดโยงคู่ (Heavy Guy)</text>

          {/* Pole Trunk */}
          <polygon points="130,40 150,40 160,330 120,330" fill="#94a3b8" stroke="#475569" strokeWidth="2.5" />

          {/* Heavy Crossarms angled */}
          <polygon points="40,110 240,90 240,102 40,122" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <polygon points="40,170 240,150 240,162 40,182" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />

          {/* Dead-End Insulators */}
          <rect x="180" y="85" width="45" height="10" rx="2" fill="#ec4899" transform="rotate(-5, 180, 85)" />
          <rect x="180" y="145" width="45" height="10" rx="2" fill="#ec4899" transform="rotate(-5, 180, 145)" />

          {/* Post Insulator for Jumper guide */}
          <circle cx="140" cy="135" r="7" fill="#ec4899" />
          <path d="M 80,115 Q 140,135 230,95" stroke="#fbbf24" strokeWidth="3" fill="none" />

          <text x="140" y="315" fill="#f43f5e" fontSize="11" textAnchor="middle" fontWeight="bold">เสาหัวมุมหักศอก 45° - 90° (รับแรงดึงหนักมาก)</text>
        </svg>
      );

    case "DD-TG":
      // Double Circuit 3-Tier Crossarms
      return (
        <svg width="280" height="340" viewBox="0 0 280 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pole Trunk */}
          <polygon points="133,30 147,30 156,330 124,330" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />

          {/* Peak Shield Wire */}
          <line x1="140" y1="30" x2="140" y2="10" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="140" cy="10" r="4" fill="#38bdf8" />
          <line x1="10" y1="10" x2="270" y2="10" stroke="#38bdf8" strokeWidth="2" />

          {/* Tier 1 Crossarm (Top Phase 1 & 4) */}
          <rect x="70" y="60" width="140" height="8" fill="#cbd5e1" rx="2" />
          <g>
            <rect x="82" y="68" width="6" height="18" rx="2" fill="#ec4899" />
            <circle cx="85" cy="92" r="4" fill="#f59e0b" />
            <rect x="192" y="68" width="6" height="18" rx="2" fill="#ec4899" />
            <circle cx="195" cy="92" r="4" fill="#f59e0b" />
            <text x="45" y="94" fill="#fbbf24" fontSize="8">วงจร 1</text>
            <text x="210" y="94" fill="#fbbf24" fontSize="8">วงจร 2</text>
          </g>

          {/* Tier 2 Crossarm (Middle Phase 2 & 5) */}
          <rect x="50" y="125" width="180" height="8" fill="#cbd5e1" rx="2" />
          <g>
            <rect x="67" y="133" width="6" height="18" rx="2" fill="#ec4899" />
            <circle cx="70" cy="157" r="4" fill="#f59e0b" />
            <rect x="207" y="133" width="6" height="18" rx="2" fill="#ec4899" />
            <circle cx="210" cy="157" r="4" fill="#f59e0b" />
          </g>

          {/* Tier 3 Crossarm (Bottom Phase 3 & 6) */}
          <rect x="60" y="190" width="160" height="8" fill="#cbd5e1" rx="2" />
          <g>
            <rect x="77" y="198" width="6" height="18" rx="2" fill="#ec4899" />
            <circle cx="80" cy="222" r="4" fill="#f59e0b" />
            <rect x="197" y="198" width="6" height="18" rx="2" fill="#ec4899" />
            <circle cx="200" cy="222" r="4" fill="#f59e0b" />
          </g>

          <text x="140" y="315" fill="#a78bfa" fontSize="11" textAnchor="middle" fontWeight="bold">เสาวงจรคู่ 6 เฟส (คอน 3 ชั้น)</text>
        </svg>
      );

    case "SS-TL":
      // Tap Line (Branch line turning 90 degrees)
      return (
        <svg width="280" height="340" viewBox="0 0 280 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pole Trunk */}
          <polygon points="132,40 148,40 156,330 124,330" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />

          {/* Main Through-line Crossarm */}
          <rect x="40" y="100" width="200" height="10" fill="#cbd5e1" rx="2" />

          {/* Branch/Tap Crossarm (Perspective forward) */}
          <polygon points="140,110 190,170 180,175 135,115" fill="#94a3b8" />
          <rect x="180" y="165" width="30" height="8" rx="2" fill="#ec4899" />

          {/* Through Conductors */}
          <line x1="10" y1="125" x2="270" y2="125" stroke="#f59e0b" strokeWidth="3" />
          <text x="210" y="120" fill="#fbbf24" fontSize="9">สายเมนหลัก ➔</text>

          {/* Tapped Branch Conductor */}
          <path d="M 140,125 Q 185,140 250,220" stroke="#38bdf8" strokeWidth="3" fill="none" strokeDasharray="4 2" />
          <text x="190" y="240" fill="#38bdf8" fontSize="10" fontWeight="bold">สายแยก Tap-Line 90° ➔</text>

          <text x="140" y="315" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">เสาแยกสาย 3 ทาง (T-Branch)</text>
        </svg>
      );

    default:
      return null;
  }
}
