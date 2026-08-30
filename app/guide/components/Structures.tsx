import React, { useState } from "react";
import { Cpu, Layers, Compass, Shield, ArrowRight, CheckCircle, Info, Sparkles, Filter, Eye, AlertCircle } from "lucide-react";

interface PoleStructure {
  id: string;
  code: string;
  name: string;
  circuitType: "single_conductor" | "double_circuit" | "special";
  circuitTypeName: string;
  angleRange: string;
  insulatorAssembly: string;
  crossarmType: string;
  guyWireSpec: string;
  description: string;
  engineeringFeatures: string[];
  specs: {
    crossarmMaterial: string;
    shieldWire: string;
    spanMax: string;
    drawingNo: string;
  };
  svgType: "SS-TG" | "SS-SA" | "SS-AS" | "SS-LA" | "SS-AS-4" | "SS-TL" | "DD-TG";
}

const STRUCTURE_DATA: PoleStructure[] = [
  {
    id: "ss-tg",
    code: "SS-TG-2 / SS-TG-6",
    name: "เสาทางตรงวงจรเดี่ยว สายเดี่ยว (Single Circuit Tangent Single Conductor)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว ชนิดสายเดี่ยว (SS Series)",
    angleRange: "0° - 2° (ทางตรง)",
    insulatorAssembly: "ลูกถ้วยแขวนแนวดิ่ง 3 พวง (แบบ D-1 / D-11 พวงละ 7-8 ลูก)",
    crossarmType: "คอนเหล็กบนเดี่ยว + คอนเหล็กคู่ล่าง (Wishbone / Delta)",
    guyWireSpec: "ไม่ต้องใช้สายยึดโยง (เสาตั้งตรงสมดุล)",
    description: "แบบหัวเสามาตรฐานสายส่ง 115 kV วงจรเดี่ยวที่ใช้งานมากที่สุด จัดสายแบบสามเหลี่ยม (Delta Configuration) เฟส A อยู่บนยอดเสา เฟส B และ C อยู่ที่ปลายคอนคู่ล่าง ลูกถ้วยแขวนห้อยอิสระในแนวดิ่ง",
    engineeringFeatures: [
      "ยอดเสาติดตั้งเข็มล่อฟ้า (OHGW Pin) รับสายกราวด์ล่อฟ้า 3/8\" หรือ OPGW 24 Cores",
      "คอนบนรูปปีกนก (Top Bracket) รับสายเฟส A ห่างจากยอดเสา 0.45 ม.",
      "คอนเหล็กคู่ล่าง (100x50x5 มม. ยาว 4,200 มม.) รับสายเฟส B และ C พร้อมเหล็กค้ำยัน V-Brace",
      "ระยะห่างระหว่างเฟส (Phase Separation) มากกว่า 3.00 - 3.80 เมตร ป้องกันสายแกว่งแตะกัน"
    ],
    specs: {
      crossarmMaterial: "เหล็กรูปรางน้ำชุบสังกะสี มอก. 1227 (Hot-Dip Galvanized Steel)",
      shieldWire: "สายดินล่อฟ้า OHGW / OPGW 1 เส้นบนยอดเสา",
      spanMax: "100 - 120 เมตร",
      drawingNo: "SA1-015/5701 (ประกอบ 7101)"
    },
    svgType: "SS-TG"
  },
  {
    id: "ss-sa",
    code: "SS-SA-2",
    name: "เสาทางโค้งมุมเล็ก สายเดี่ยว (Single Circuit Small Angle 2° - 30°)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว ชนิดสายเดี่ยว (SS Series)",
    angleRange: "2° - 30° (ทางโค้งมุมเล็ก)",
    insulatorAssembly: "ลูกถ้วยแขวนเอียงตามแรงดึงลัพธ์ (แบบ D-2 / D-12 พร้อมที่แขวนรูปตัวยู)",
    crossarmType: "คอนเหล็กขวางเสริมแผ่นประกับรับแรงเฉือนด้านข้าง",
    guyWireSpec: "สายยึดโยงสลิงเหล็ก 1 ชุด (ติดตั้งฝั่งตรงข้ามมุมดึงของสายไฟ)",
    description: "ใช้สำหรับจุดเลี้ยวโค้งของแนวสายส่งมุมไม่เกิน 30 องศา พวงลูกถ้วยจะเอียงตามแนวแรงดึงลัพธ์ (Resultant Force Angle) โดยใช้ที่แขวนลูกถ้วยทางโค้งรูปตัวยู (Corner Bracket) เพื่อรักษาระยะห่างจากคอนเหล็ก",
    engineeringFeatures: [
      "ใช้ที่แขวนรูปตัวยู (Corner Suspension Bracket 1030140012) ใต้คอนเพื่อกันลูกถ้วยแกว่งชนคอน",
      "พวงลูกถ้วยเอียงทำมุมอย่างอิสระตามแรงดึงสายและแรงลมปะทะ",
      "ติดตั้งสายยึดโยง (Guy Wire 50-95 mm²) รั้งเสาที่ระดับความสูง 4.00 ม. ถ่ายแรงลงสมอบก",
      "มีแคล้มป์ประคองสายกราวด์ล่อฟ้ายอดเสาทำมุมตามแนวเลี้ยว"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กรางน้ำ 100x50x5 มม. เสริม Brace รับแรงเฉือน",
      shieldWire: "สายกราวด์ OHGW พาดผ่านแคล้มป์มุม",
      spanMax: "80 - 100 เมตร",
      drawingNo: "SA1-015/5701 (ประกอบ 7102)"
    },
    svgType: "SS-SA"
  },
  {
    id: "ss-as",
    code: "SS-AS-2 / SS-AS-4",
    name: "เสายึดดึงตรงสองข้าง สายเดี่ยว (Anchor / Strain Section Structure)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว ชนิดสายเดี่ยว (SS Series)",
    angleRange: "0° - 5° (ทางตรงรับแรงดึงเต็มพิกัด)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสายแนวนอน 2 ฝั่ง (แบบ D-3 / D-13 รวม 6 พวง) + สายจัมเปอร์",
    crossarmType: "คอนเหล็กคู่หนาพิเศษ 150x75x9 มม. พร้อมแผ่นเหล็กยื่นสองปลาย (Double Arming)",
    guyWireSpec: "สายยึดโยง 2 ทิศทาง (หัว-ท้ายเสา) กรณีเป็นจุดตัดช่วงดึงสาย",
    description: "เสาดึงตรึงสายไฟเป็นช่วงๆ (Section Pole ทุก 1.5 - 2.0 กม.) เพื่อกักแรงดึงไม่ให้ส่งต่อสะสมยาวเกินไป และป้องกันเสาล้มลามเป็นโดมิโนกรณีสายไฟขาด เชื่อมต่อวงจรด้วยสายจัมเปอร์ (Jumper Loop)",
    engineeringFeatures: [
      "ลูกถ้วยรับแรงดึงแนวนอน 6 พวง (2 พวงต่อเฟส หันหน้าชนกัน)",
      "แคล้มป์เข้าปลายสายแบบบีบ (Compression Dead-End) รับแรงดึงได้ถึง 12,000 - 14,000 kgf",
      "สายจัมเปอร์ (Jumper Loop) ดัดโค้งรอดใต้หัวเสา ทา Joint Compound แน่นหนา",
      "แผ่นเหล็กยื่นสองปลาย (Double Arming Plate 12x100x650 มม.) รัดคอนคู่ขนานกันอย่างมั่นคง"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กรางน้ำคู่ 150x75x9 มม. พร้อม Double Arming Plates",
      shieldWire: "สายกราวด์ OHGW เข้าปลายสายสองข้างพร้อมจัมเปอร์สายดิน",
      spanMax: "100 - 150 เมตร",
      drawingNo: "SA1-015/5701 (ประกอบ 7103)"
    },
    svgType: "SS-AS"
  },
  {
    id: "ss-la",
    code: "SS-LA-1 / SS-LA-2",
    name: "เสาหัวมุมใหญ่และจบสาย (Large Angle 30° - 90° & Dead-End)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว ชนิดสายเดี่ยว (SS Series)",
    angleRange: "30° - 90° (มุมหักศอก / ทางแยก)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสายแรงดึงสูง (D-3, D-13 / D-19) + ลูกถ้วยโพสท์ประคองจัมเปอร์",
    crossarmType: "คอนเหล็กคู่ทำมุมเฉียง พร้อมแผ่นประกับหนาพิเศษ",
    guyWireSpec: "สายยึดโยงหนัก 2-4 ชุด (Heavy Guy Assembly รั้งสมอบกคอนกรีต)",
    description: "โครงสร้างหัวเสาสำหรับจุดหักมุมเลี้ยว 90 องศา หัวมุมถนน หรือเสาจบสายหน้าสถานีไฟฟ้า รับแรงดึงสูงสุดในแนวระนาบ สายจัมเปอร์จะถูกประคองด้วยลูกถ้วยโพสท์แนวนอน (Horizontal Post Insulator) เพื่อรักษาระยะ Clearance",
    engineeringFeatures: [
      "คอนเหล็กคู่ติดตั้งทำมุมเฉียงตามแนวเส้นแบ่งครึ่งมุมเลี้ยว (Bisector)",
      "ติดตั้งลูกถ้วยโพสท์ 115 kV (Line Post) ประคองสายจัมเปอร์ไม่ให้แกว่งเข้าใกล้ลำต้นเสา",
      "แคล้มป์ย้ำไฮดรอลิกพร้อมแป้นหางปลา 15° NEMA Pad สำหรับยึดสายจัมเปอร์",
      "สายยึดโยงสลิงเหล็ก 95 mm² จำนวน 2-4 ชุด ดึงเฉียง 45 องศาลงสู่สมอบกคู่ใต้ดิน"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กคู่หนาพิเศษ 150x75x9 มม. ชุบกัลวาไนซ์หนา 85 ไมครอน",
      shieldWire: "สายกราวด์ OHGW เข้าปลายสาย 2 ทิศทาง",
      spanMax: "120 - 200 เมตร",
      drawingNo: "SA1-015/5701 (ประกอบ 7104)"
    },
    svgType: "SS-LA"
  },
  {
    id: "ss-as-4",
    code: "SS-AS-4 / SD-AS-3",
    name: "เสาคอนท้าวแขนเรียงแนวดิ่ง (Single Circuit Alley Arm Structure)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว ชนิดสายเดี่ยว (SS Series)",
    angleRange: "0° - 5° (พื้นที่จำกัดเขตทาง)",
    insulatorAssembly: "ลูกถ้วยแขวนแนวดิ่ง 3 ชุด เรียงลดหลั่นบนคอนท้าวแขนฝั่งเดียว",
    crossarmType: "คอนเหล็กท้าวแขน 150x75x9 มม. ยาว 3.00 ม. (Alley Arm 1000120004)",
    guyWireSpec: "สายยึดโยงรั้งด้านตรงข้ามคอนท้าวแขน",
    description: "ออกแบบพิเศษสำหรับพื้นที่เขตทางแคบ (Narrow Right-of-Way) ริมถนนชิดรั้ว หรือใกล้ตัวอาคาร โดยคอนเหล็กจะยื่นออกไปเพียงด้านเดียว และจัดสาย 3 เฟสเรียงในแนวดิ่ง (Vertical Arrangement)",
    engineeringFeatures: [
      "ใช้คอนเหล็กรางน้ำท้าวแขนขนาดใหญ่ 150x75x9 มม. ยาว 3.00 ม. ยื่นออกไปด้านเดียว",
      "ค้ำยันด้วยเหล็กประกับคอนท้าวแขน (Alley Arm Brace 50x50x6 มม.) มั่นคงสูง",
      "สายทั้ง 3 เฟส แขวนในแนวดิ่ง ช่วยประหยัดระยะปลอดภัยในแนวราบชิดอาคารได้ดีเยี่ยม",
      "ยอดเสายื่นก้านรับสายกราวด์ล่อฟ้าเอียงตามแนวคอน"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กท้าวแขน Alley Arm (รหัสพัสดุ 1000120004) มอก. 1227",
      shieldWire: "สายกราวด์ OHGW ยึดบนก้านฉากยอดเสา",
      spanMax: "80 - 100 เมตร",
      drawingNo: "SA1-015/58004 (ประกอบ 7108)"
    },
    svgType: "SS-AS-4"
  },
  {
    id: "ss-tl",
    code: "SS-TL-1 / SD-TL-1",
    name: "เสาแยกสาย 3 ทาง (Tap-Line Structure with Air Break Switch)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว ชนิดสายเดี่ยว (SS Series)",
    angleRange: "แยกสายฉาก 90° สู่สถานีย่อย/โรงงาน",
    insulatorAssembly: "ลูกถ้วยผสม (แขวนทางตรง + เข้าปลายสายแทป) + สวิตช์ 115 kV",
    crossarmType: "คอนทางตรงขวาง + คอนยื่นดึงแยกแนวฉาก 90 องศา",
    guyWireSpec: "สายยึดโยงรั้งต้านแรงดึงของสายแยก Tap-Line",
    description: "โครงสร้างหัวเสาสำหรับแยกวงจรสายส่ง (T-Branch) ไปจ่ายไฟให้แก่สถานีไฟฟ้าย่อยแห่งใหม่ หรือลูกค้ารายใหญ่ 115 kV พร้อมติดตั้งแอร์เบรกสวิตช์ 3 ขา (Air Break Switch 1,200 A) สำหรับตัดตอน",
    engineeringFeatures: [
      "คอนเหล็กเสริมยื่น 90 องศาสำหรับดึงสายแยก Tap Line",
      "มีแอร์เบรกสวิตช์ 115 kV 1,200 A สั่งการด้วยคันโยกตัดตอนขณะไม่มีโหลด",
      "สายจัมเปอร์เชื่อมต่อจากสายเมนหลักเข้าสู่ขั้วสวิตช์และสายแยก",
      "ระบบต่อลงดินโครงสร้างสวิตช์และคันโยกด้วยสายทองแดง 95 mm² เข้า Ground Grid"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กรางน้ำผสม + ฐานรองรับสวิตช์ 115 kV",
      shieldWire: "สายกราวด์ OHGW แยก 3 ทาง",
      spanMax: "60 - 80 เมตร (แนวแทป)",
      drawingNo: "SA1-015/5705 (ประกอบ 7109)"
    },
    svgType: "SS-TL"
  }
];

export default function Structures() {
  const [activeStructureId, setActiveStructureId] = useState<string>("ss-tg");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredStructures = selectedFilter === "all"
    ? STRUCTURE_DATA
    : STRUCTURE_DATA.filter((s) => s.circuitType === selectedFilter);

  const activeStructure = STRUCTURE_DATA.find((s) => s.id === activeStructureId) || STRUCTURE_DATA[0];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(109, 40, 217, 0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" }}>
            <Cpu size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>แบบมาตรฐานโครงสร้างหัวเสาสายส่ง 115 kV (ชนิดสายเดี่ยว)</h2>
            <p style={{ color: "#ede9fe", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              รูปจำลองเสาคอนกรีต 22 ม. คอนเหล็กชุบกัลวาไนซ์ พวงลูกถ้วย 7-8 ลูก และลักษณะการจัดสายเฟสตามแบบมาตรฐาน กฟภ.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "ทั้งหมด (6 แบบมาตรฐาน)" },
          { id: "single_conductor", label: "⚡ เสาสายเดี่ยว (SS-TG / SS-SA / SS-AS / SS-LA / SS-AS-4 / SS-TL)" }
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
              backgroundColor: selectedFilter === f.id ? "#5b21b6" : "#f1f5f9",
              color: selectedFilter === f.id ? "white" : "#475569",
              transition: "all 0.2s"
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main Interactive Stage: Left Diagram + Right Details */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 460px) 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left: Realistic Vector Diagram Card */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #cbd5e1", boxShadow: "0 6px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#6d28d9", textTransform: "uppercase" }}>รูปจำลองทางวิศวกรรม 115 kV</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#0f172a", margin: 0 }}>{activeStructure.code}</h3>
            </div>
            <span style={{ fontSize: "0.75rem", backgroundColor: "#ede9fe", color: "#5b21b6", padding: "4px 12px", borderRadius: "14px", fontWeight: "bold" }}>
              มุมเลี้ยว {activeStructure.angleRange}
            </span>
          </div>

          {/* SVG Canvas with Deep Blueprint / Realistic Dark Background */}
          <div style={{ backgroundColor: "#070b14", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "420px", position: "relative" }}>
            <RealisticPoleHeadSVG type={activeStructure.svgType} />
            
            {/* Drawing Number Badge */}
            <div style={{ position: "absolute", bottom: "12px", right: "12px", backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid #334155", borderRadius: "8px", padding: "6px 12px", color: "#38bdf8", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px", backdropFilter: "blur(6px)" }}>
              <Compass size={14} />
              <span>แบบเลขที่: <b>{activeStructure.specs.drawingNo}</b></span>
            </div>
          </div>

          {/* Diagram Legend */}
          <div style={{ padding: "14px 18px", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.75rem", color: "#475569" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", backgroundColor: "#38bdf8", borderRadius: "50%" }}></span>
              <span>สายกราวด์ล่อฟ้า (OHGW / OPGW)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", backgroundColor: "#f59e0b", borderRadius: "50%" }}></span>
              <span>สายตัวนำ 115 kV (AAC / ACSR 400)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "8px", backgroundColor: "#cbd5e1", borderRadius: "2px", border: "1px solid #64748b" }}></span>
              <span>คอนเหล็กชุบกัลวาไนซ์ (Crossarm)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", backgroundColor: "#9a3412", borderRadius: "50%" }}></span>
              <span>พวงลูกถ้วยปอร์ซเลน (7-8 ลูก)</span>
            </div>
          </div>
        </div>

        {/* Right: Structure Detail Specifications */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ fontSize: "1.35rem", fontWeight: "bold", color: "#0f172a", margin: "0 0 4px 0" }}>
                  {activeStructure.name}
                </h3>
                <span style={{ fontSize: "0.8rem", backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                  {activeStructure.specs.drawingNo}
                </span>
              </div>
              <span style={{ fontSize: "0.9rem", color: "#7c3aed", fontWeight: "bold" }}>
                รหัสแบบมาตรฐาน: {activeStructure.code}
              </span>
            </div>

            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
              <b>ลักษณะโครงสร้าง:</b> {activeStructure.description}
            </p>

            {/* Spec Highlights Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              
              <div style={{ backgroundColor: "#f5f3ff", padding: "12px 14px", borderRadius: "10px", border: "1px solid #ddd6fe" }}>
                <span style={{ fontSize: "0.75rem", color: "#6d28d9", fontWeight: "bold", display: "block" }}>มุมเบี่ยงเบนแนวสาย (Line Angle)</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#4c1d95" }}>{activeStructure.angleRange}</span>
              </div>

              <div style={{ backgroundColor: "#fdf2f8", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fbcfe8" }}>
                <span style={{ fontSize: "0.75rem", color: "#be185d", fontWeight: "bold", display: "block" }}>ชุดลูกถ้วยและพวงฉนวน</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#9d174d" }}>{activeStructure.insulatorAssembly}</span>
              </div>

              <div style={{ backgroundColor: "#fefce8", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fef08a" }}>
                <span style={{ fontSize: "0.75rem", color: "#a16207", fontWeight: "bold", display: "block" }}>สายยึดโยงตรึงเสา (Guy Wire)</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#854d0e" }}>{activeStructure.guyWireSpec}</span>
              </div>

              <div style={{ backgroundColor: "#f0fdf4", padding: "12px 14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: "bold", display: "block" }}>ช่วงเสาสูงสุด (Max Span)</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#166534" }}>{activeStructure.specs.spanMax}</span>
              </div>

            </div>

            {/* Engineering Features Points */}
            <div style={{ backgroundColor: "#f8fafc", padding: "16px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle size={16} className="text-emerald-600" />
                จุดเด่นและข้อกำหนดทางวิศวกรรมการก่อสร้าง:
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.9rem", color: "#334155", lineHeight: "1.6" }}>
                {activeStructure.engineeringFeatures.map((f, idx) => (
                  <li key={idx} style={{ marginBottom: "4px" }}>{f}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* Grid of Structure Cards to Select From */}
      <div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#0f172a", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Layers size={20} className="text-purple-600" />
          เลือกดูโครงสร้างหัวเสาแบบอื่นๆ (คลิกเพื่อแสดงรูปจำลองสมจริง):
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
                  border: isSelected ? "2px solid #5b21b6" : "1px solid #e2e8f0",
                  padding: "16px 18px",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 8px 20px -4px rgba(91, 33, 182, 0.3)" : "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "800", color: isSelected ? "#5b21b6" : "#1e293b", fontSize: "1.05rem" }}>
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

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: isSelected ? "#5b21b6" : "#94a3b8", fontWeight: "bold", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
                  <span>{struct.specs.drawingNo}</span>
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

// ─── High-Realism Vector SVG Illustrations of Pole Heads ───────────────────

function RealisticPoleHeadSVG({ type }: { type: "SS-TG" | "SS-SA" | "SS-AS" | "SS-LA" | "SS-AS-4" | "SS-TL" | "DD-TG" }) {
  switch (type) {
    case "SS-TG":
      // Single Circuit Tangent (SS-TG Wishbone Delta)
      return (
        <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Concrete Pole Trunk with 3D Chamfered Edges */}
          <polygon points="152,40 168,40 176,380 144,380" fill="#64748b" />
          <polygon points="152,40 160,40 156,380 144,380" fill="#94a3b8" />
          <polygon points="160,40 168,40 176,380 156,380" fill="#475569" />
          <line x1="160" y1="40" x2="160" y2="380" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 4" />

          {/* Peak Shield Wire Bayonet Pin (OHGW Pin) */}
          <rect x="156" y="15" width="8" height="30" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <circle cx="160" cy="18" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
          <line x1="10" y1="18" x2="310" y2="18" stroke="#38bdf8" strokeWidth="3" />
          <text x="175" y="22" fill="#38bdf8" fontSize="10" fontWeight="bold">OHGW 3/8 นิ้ว</text>

          {/* Top Wishbone Crossarm (Phase A Bracket) */}
          <rect x="145" y="70" width="30" height="14" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <circle cx="160" cy="77" r="4" fill="#1e293b" />
          {/* Top Insulator String (7-8 Porcelain Discs) */}
          <g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g key={i}>
                <rect x="157" y={84 + i * 11} width="6" height="4" fill="#475569" />
                <ellipse cx="160" cy={88 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
                <ellipse cx="160" cy={87 + i * 11} rx="8" ry="2" fill="#ea580c" opacity="0.6" />
              </g>
            ))}
            {/* Arcing Horn Top & Bottom */}
            <path d="M 160,84 L 140,88 L 138,125" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            <path d="M 160,162 L 140,158 L 138,135" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            {/* Suspension Clamp & Conductor Phase A */}
            <rect x="150" y={162} width="20" height="10" rx="3" fill="#cbd5e1" stroke="#475569" />
            <line x1="10" y1="167" x2="310" y2="167" stroke="#f59e0b" strokeWidth="5" />
            <text x="175" y="172" fill="#fbbf24" fontSize="11" fontWeight="bold">เฟส A (Top)</text>
          </g>

          {/* Lower Main Double Crossarm (Steel Channels 100x50x5 mm) */}
          <rect x="35" y="195" width="250" height="16" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <line x1="35" y1="198" x2="285" y2="198" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
          {/* V-Brace Angle Steels */}
          <line x1="160" y1="245" x2="85" y2="211" stroke="#94a3b8" strokeWidth="4" />
          <line x1="160" y1="245" x2="235" y2="211" stroke="#94a3b8" strokeWidth="4" />
          <circle cx="160" cy="245" r="5" fill="#1e293b" />

          {/* Left Phase B Insulator String */}
          <g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g key={i}>
                <rect x="62" y={211 + i * 11} width="6" height="4" fill="#475569" />
                <ellipse cx="65" cy={215 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
                <ellipse cx="65" cy={214 + i * 11} rx="8" ry="2" fill="#ea580c" opacity="0.6" />
              </g>
            ))}
            <rect x="55" y={289} width="20" height="10" rx="3" fill="#cbd5e1" stroke="#475569" />
            <line x1="10" y1="294" x2="310" y2="294" stroke="#f59e0b" strokeWidth="5" />
            <text x="80" y="298" fill="#fbbf24" fontSize="11" fontWeight="bold">เฟส B</text>
          </g>

          {/* Right Phase C Insulator String */}
          <g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g key={i}>
                <rect x="252" y={211 + i * 11} width="6" height="4" fill="#475569" />
                <ellipse cx="255" cy={215 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
                <ellipse cx="255" cy={214 + i * 11} rx="8" ry="2" fill="#ea580c" opacity="0.6" />
              </g>
            ))}
            <rect x="245" y={289} width="20" height="10" rx="3" fill="#cbd5e1" stroke="#475569" />
            <line x1="10" y1="294" x2="310" y2="294" stroke="#f59e0b" strokeWidth="5" />
            <text x="270" y="298" fill="#fbbf24" fontSize="11" fontWeight="bold">เฟส C</text>
          </g>

          <text x="160" y="365" fill="#94a3b8" fontSize="11" textAnchor="middle">โครงสร้างเสาทางตรง SS-TG (Delta Wishbone 115 kV)</text>
        </svg>
      );

    case "SS-SA":
      // Single Circuit Small Angle (2° - 30° with swinging insulators & guy wire)
      return (
        <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Guy wire on Left */}
          <line x1="150" y1="180" x2="15" y2="390" stroke="#f43f5e" strokeWidth="4" strokeDasharray="6 3" />
          <ellipse cx="60" cy="325" rx="8" ry="12" fill="#9a3412" stroke="#7c2d12" transform="rotate(-35, 60, 325)" />
          <text x="25" y="280" fill="#f43f5e" fontSize="10" fontWeight="bold">สายยึดโยง (Guy Wire)</text>

          {/* Pole Trunk */}
          <polygon points="152,40 168,40 176,380 144,380" fill="#64748b" />
          <polygon points="152,40 160,40 156,380 144,380" fill="#94a3b8" />
          <polygon points="160,40 168,40 176,380 156,380" fill="#475569" />

          {/* OHGW Peak with Angled Angle */}
          <rect x="156" y="15" width="8" height="30" rx="2" fill="#cbd5e1" stroke="#475569" />
          <circle cx="160" cy="18" r="6" fill="#38bdf8" />
          <path d="M 10,28 Q 160,18 310,8" stroke="#38bdf8" strokeWidth="3" fill="none" />

          {/* Top Angled Phase A Insulator (Swinging by 18 deg) */}
          <g transform="rotate(18, 160, 70)">
            <rect x="145" y="70" width="30" height="14" rx="2" fill="#cbd5e1" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <ellipse key={i} cx="160" cy={90 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <circle cx="160" cy="168" r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          </g>

          {/* Main Lower Crossarm */}
          <rect x="35" y="195" width="250" height="16" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          {/* U-Shaped Corner Suspension Brackets under crossarm */}
          <path d="M 55,211 L 55,225 Q 70,240 85,225 L 85,211" stroke="#cbd5e1" strokeWidth="4" fill="none" />
          <path d="M 235,211 L 235,225 Q 250,240 265,225 L 265,211" stroke="#cbd5e1" strokeWidth="4" fill="none" />

          {/* Left Angled Insulator (Phase B) */}
          <g transform="rotate(18, 70, 225)">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <ellipse key={i} cx="70" cy={235 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <circle cx="70" cy="313" r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          </g>

          {/* Right Angled Insulator (Phase C) */}
          <g transform="rotate(18, 250, 225)">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <ellipse key={i} cx="250" cy={235 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <circle cx="250" cy="313" r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          </g>

          <text x="160" y="375" fill="#a78bfa" fontSize="11" textAnchor="middle" fontWeight="bold">เสาทางโค้งมุมเล็ก SS-SA (เอียง 2° - 30° พร้อม Corner Bracket)</text>
        </svg>
      );

    case "SS-AS":
      // Single Circuit Anchor / Section Dead-End (SS-AS with Horizontal Tension Strings + Jumper)
      return (
        <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pole Trunk */}
          <polygon points="152,40 168,40 176,380 144,380" fill="#64748b" />
          <polygon points="152,40 160,40 156,380 144,380" fill="#94a3b8" />
          <polygon points="160,40 168,40 176,380 156,380" fill="#475569" />

          {/* OHGW Peak Dead-Ends */}
          <rect x="156" y="15" width="8" height="30" rx="2" fill="#cbd5e1" />
          <circle cx="160" cy="18" r="6" fill="#38bdf8" />
          <line x1="10" y1="18" x2="145" y2="18" stroke="#38bdf8" strokeWidth="3" />
          <line x1="175" y1="18" x2="310" y2="18" stroke="#38bdf8" strokeWidth="3" />

          {/* Top Phase A Heavy Double Arming & Horizontal Tension Strings */}
          <g>
            <rect x="135" y="70" width="50" height="20" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            {/* Left Dead-End String */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ellipse key={i} cx={125 - i * 11} cy="80" rx="4" ry="12" fill="#9a3412" stroke="#7c2d12" />
            ))}
            {/* Right Dead-End String */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ellipse key={i} cx={195 + i * 11} cy="80" rx="4" ry="12" fill="#9a3412" stroke="#7c2d12" />
            ))}
            {/* Conductors Incoming / Outgoing */}
            <line x1="10" y1="80" x2="65" y2="80" stroke="#f59e0b" strokeWidth="5" />
            <line x1="255" y1="80" x2="310" y2="80" stroke="#f59e0b" strokeWidth="5" />
            {/* Jumper Loop Phase A */}
            <path d="M 65,80 Q 160,135 255,80" stroke="#fbbf24" strokeWidth="4" fill="none" />
            <text x="160" y="142" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">สายจัมเปอร์ เฟส A</text>
          </g>

          {/* Lower Heavy Double Crossarm (150x75x9 mm) */}
          <rect x="25" y="190" width="270" height="22" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="2.5" />
          <line x1="25" y1="194" x2="295" y2="194" stroke="#ffffff" strokeWidth="2" />
          {/* Double Arming Plates at ends */}
          <rect x="50" y="180" width="12" height="42" fill="#475569" rx="2" />
          <rect x="258" y="180" width="12" height="42" fill="#475569" rx="2" />

          {/* Left Dead-Ends (Phase B) */}
          <g>
            {[0, 1, 2, 3].map((i) => (
              <ellipse key={i} cx={40 - i * 9} cy="201" rx="3" ry="10" fill="#9a3412" stroke="#7c2d12" />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <ellipse key={i} cx={72 + i * 9} cy="201" rx="3" ry="10" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <path d="M 10,201 Q 56,255 102,201" stroke="#fbbf24" strokeWidth="3.5" fill="none" />
            <text x="56" y="260" fill="#fbbf24" fontSize="9" textAnchor="middle">จัมเปอร์ B</text>
          </g>

          {/* Right Dead-Ends (Phase C) */}
          <g>
            {[0, 1, 2, 3].map((i) => (
              <ellipse key={i} cx={248 - i * 9} cy="201" rx="3" ry="10" fill="#9a3412" stroke="#7c2d12" />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <ellipse key={i} cx={280 + i * 9} cy="201" rx="3" ry="10" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <path d="M 218,201 Q 264,255 310,201" stroke="#fbbf24" strokeWidth="3.5" fill="none" />
            <text x="264" y="260" fill="#fbbf24" fontSize="9" textAnchor="middle">จัมเปอร์ C</text>
          </g>

          <text x="160" y="375" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">เสายึดดึงตรงสองข้าง SS-AS (Double Arming + 3 Jumper Loops)</text>
        </svg>
      );

    case "SS-LA":
      // Single Circuit Large Angle 90° Corner / Dead-End
      return (
        <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Heavy Guy Wires 2 Sets on the left */}
          <line x1="145" y1="120" x2="10" y2="390" stroke="#f43f5e" strokeWidth="4" />
          <line x1="145" y1="210" x2="40" y2="390" stroke="#f43f5e" strokeWidth="4" />
          <text x="25" y="260" fill="#f43f5e" fontSize="10" fontWeight="bold">สมอบกคู่ Heavy Guy</text>

          {/* Concrete Pole */}
          <polygon points="152,40 168,40 176,380 144,380" fill="#64748b" />
          <polygon points="152,40 160,40 156,380 144,380" fill="#94a3b8" />
          <polygon points="160,40 168,40 176,380 156,380" fill="#475569" />

          {/* Heavy Angled Crossarms 150x75x9 mm */}
          <polygon points="40,130 270,100 270,118 40,148" fill="#cbd5e1" stroke="#334155" strokeWidth="2.5" />
          <polygon points="40,220 270,190 270,208 40,238" fill="#cbd5e1" stroke="#334155" strokeWidth="2.5" />

          {/* Dead-End Insulator String Phase 1 */}
          <g transform="rotate(-7, 200, 110)">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <ellipse key={i} cx={160 + i * 12} cy="110" rx="4" ry="12" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <line x1="235" y1="110" x2="310" y2="110" stroke="#f59e0b" strokeWidth="6" />
          </g>

          {/* Dead-End Insulator String Phase 2 */}
          <g transform="rotate(-7, 200, 200)">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <ellipse key={i} cx={160 + i * 12} cy="200" rx="4" ry="12" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <line x1="235" y1="200" x2="310" y2="200" stroke="#f59e0b" strokeWidth="6" />
          </g>

          {/* Horizontal Line Post Insulator supporting the 90-degree Jumper */}
          <g>
            <rect x="165" y="150" width="35" height="12" rx="2" fill="#9a3412" stroke="#7c2d12" />
            {[0, 1, 2, 3].map(i => (
              <ellipse key={i} cx={170 + i * 8} cy="156" rx="3" ry="8" fill="#9a3412" stroke="#7c2d12" />
            ))}
            {/* Jumper Cable routed through Post Insulator */}
            <path d="M 80,140 Q 200,156 235,100" stroke="#fbbf24" strokeWidth="4" fill="none" />
            <text x="210" y="160" fill="#38bdf8" fontSize="9">ลูกถ้วยโพสท์ประคองจัมเปอร์</text>
          </g>

          <text x="160" y="375" fill="#f43f5e" fontSize="11" textAnchor="middle" fontWeight="bold">เสาหัวมุมหักศอก 30° - 90° SS-LA (รับแรงดึง Tension สูงสุด)</text>
        </svg>
      );

    case "SS-AS-4":
      // Single Circuit Alley Arm Structure (คอนท้าวแขน 3.00 ม. ยื่นข้างเดียว 3 เฟสแนวดิ่ง)
      return (
        <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Concrete Pole Trunk on Left side */}
          <polygon points="52,40 68,40 76,380 44,380" fill="#64748b" />
          <polygon points="52,40 60,40 56,380 44,380" fill="#94a3b8" />
          <polygon points="60,40 68,40 76,380 56,380" fill="#475569" />

          {/* Alley Arm Steel Channel 150x75x9 mm extending 3.00 m to the right */}
          <rect x="65" y="110" width="230" height="22" rx="2" fill="#cbd5e1" stroke="#334155" strokeWidth="2.5" />
          <line x1="65" y1="114" x2="295" y2="114" stroke="#ffffff" strokeWidth="2" />
          
          {/* Alley Arm Diagonal Brace (Angle Steel 50x50x6 mm) */}
          <line x1="60" y1="240" x2="245" y2="132" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
          <circle cx="60" cy="240" r="5" fill="#1e293b" />
          <circle cx="245" cy="132" r="5" fill="#1e293b" />
          <text x="130" y="200" fill="#38bdf8" fontSize="9">เหล็กค้ำคอนท้าวแขน (Alley Brace)</text>

          {/* 3 Phases Vertical Arrangement under the single Alley Arm */}
          {/* Phase A (Inner) */}
          <g>
            {[0, 1, 2, 3, 4].map(i => (
              <ellipse key={i} cx="115" cy={140 + i * 11} rx="12" ry="4" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <circle cx="115" cy="195" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
            <line x1="10" y1="195" x2="310" y2="195" stroke="#f59e0b" strokeWidth="4" />
            <text x="125" y="200" fill="#fbbf24" fontSize="9" fontWeight="bold">เฟส A</text>
          </g>

          {/* Phase B (Middle) */}
          <g>
            {[0, 1, 2, 3, 4].map(i => (
              <ellipse key={i} cx="195" cy={140 + i * 11} rx="12" ry="4" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <circle cx="195" cy="195" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
            <line x1="10" y1="195" x2="310" y2="195" stroke="#f59e0b" strokeWidth="4" />
            <text x="205" y="200" fill="#fbbf24" fontSize="9" fontWeight="bold">เฟส B</text>
          </g>

          {/* Phase C (Outer) */}
          <g>
            {[0, 1, 2, 3, 4].map(i => (
              <ellipse key={i} cx="275" cy={140 + i * 11} rx="12" ry="4" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <circle cx="275" cy="195" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
            <line x1="10" y1="195" x2="310" y2="195" stroke="#f59e0b" strokeWidth="4" />
            <text x="285" y="200" fill="#fbbf24" fontSize="9" fontWeight="bold">เฟส C</text>
          </g>

          <text x="160" y="375" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">เสาคอนท้าวแขน SS-AS-4 (Alley Arm 3.00 ม. ยื่นข้างเดียว)</text>
        </svg>
      );

    case "SS-TL":
      // Single Circuit Tap-Line 3-Way Structure with 115 kV Air Break Switch
      return (
        <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pole Trunk */}
          <polygon points="152,40 168,40 176,380 144,380" fill="#64748b" />
          <polygon points="152,40 160,40 156,380 144,380" fill="#94a3b8" />
          <polygon points="160,40 168,40 176,380 156,380" fill="#475569" />

          {/* Main Through Crossarm (Horizontal) */}
          <rect x="35" y="100" width="250" height="16" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <line x1="10" y1="108" x2="310" y2="108" stroke="#f59e0b" strokeWidth="5" />
          <text x="20" y="95" fill="#fbbf24" fontSize="9" fontWeight="bold">สายเมนหลัก 115 kV ➔</text>

          {/* 115 kV Air Break Switch Base Frame */}
          <rect x="100" y="160" width="120" height="20" rx="3" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <rect x="115" y="180" width="12" height="60" rx="2" fill="#94a3b8" />
          <text x="120" y="255" fill="#cbd5e1" fontSize="9" textAnchor="middle">ก้านคันโยกสวิตช์</text>

          {/* 3 Post Insulators of Air Break Switch */}
          <g>
            <rect x="110" y="130" width="14" height="30" fill="#9a3412" rx="2" />
            <rect x="153" y="130" width="14" height="30" fill="#9a3412" rx="2" />
            <rect x="196" y="130" width="14" height="30" fill="#9a3412" rx="2" />
            {/* Switch Blade in Open position */}
            <line x1="160" y1="125" x2="125" y2="95" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <circle cx="160" cy="125" r="5" fill="#f59e0b" />
          </g>

          {/* 90-degree Tap Line Outgoing Branch */}
          <path d="M 160,108 L 160,125 M 125,95 Q 220,180 290,290" stroke="#38bdf8" strokeWidth="4" fill="none" strokeDasharray="6 3" />
          <circle cx="290" cy="290" r="6" fill="#38bdf8" />
          <text x="210" y="305" fill="#38bdf8" fontSize="10" fontWeight="bold">แยกสาย Tap-Line 90° ➔</text>

          <text x="160" y="375" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">เสาแยกสาย 3 ทาง SS-TL (พร้อมสวิตช์ตัดตอน 115 kV 1,200 A)</text>
        </svg>
      );

    default:
      return null;
  }
}
