import React, { useState } from "react";
import { Shield, Layers, Eye, CheckCircle2, Info, ArrowRight, Settings, Sparkles, Filter } from "lucide-react";

interface InsulatorTypeItem {
  id: string;
  name: string;
  material: string;
  standard: string;
  tensileStrength: string;
  weightPerUnit: string;
  discsPerString115kV: string;
  features: string[];
  advantages: string;
  disadvantages: string;
  svgType: "porcelain" | "glass" | "composite" | "post";
}

interface AssemblyItem {
  code: string;
  name: string;
  type: "suspension" | "tension" | "composite";
  typeName: string;
  poleUsage: string;
  partsList: string[];
  description: string;
  svgType: "D1_suspension" | "D2_angle" | "D3_tension" | "D19_composite";
}

const INSULATOR_TYPES: InsulatorTypeItem[] = [
  {
    id: "porcelain",
    name: "ลูกถ้วยปอร์ซเลน / กระเบื้องเคลือบ (Porcelain Disc)",
    material: "กระเบื้องพอร์ซเลนเคลือบผิวแก้วมัน (Glazed Porcelain)",
    standard: "ANSI Class 52-3 / 52-8 (IEC Type U70B/U120B)",
    tensileStrength: "70 kN (7,140 kgf) - 120 kN (12,240 kgf)",
    weightPerUnit: "4.5 - 5.5 กก./ลูก",
    discsPerString115kV: "7 - 8 ลูก/พวง (ระยะ Creepage 2,800 - 3,200 มม.)",
    features: [
      "ทนต่อความเครียดทางไฟฟ้า (Dielectric Strength) สูงมาก",
      "ผิวมันลื่น ช่วยให้น้ำฝนชะล้างคราบฝุ่นได้ง่าย (Natural Washing)",
      "ทนต่อแสงแดด UV และสภาพอากาศร้อนชื้นของไทยได้ดีเยี่ยม"
    ],
    advantages: "อายุการใช้งานยาวนานกว่า 30-50 ปี เสถียรภาพสูง ราคาประหยัด",
    disadvantages: "น้ำหนักมาก และอาจเกิดรอยร้าวภายใน (Puncture) ที่มองด้วยตาเปล่าไม่เห็น",
    svgType: "porcelain"
  },
  {
    id: "glass",
    name: "ลูกถ้วยแก้วเหนียว (Toughened Glass Disc)",
    material: "แก้วอบเหนียวทนความร้อนสูง (Tempered Glass)",
    standard: "ANSI Class 52-3 / 52-8 (IEC Type U70BS/U120BS)",
    tensileStrength: "70 kN - 160 kN",
    weightPerUnit: "3.8 - 4.5 กก./ลูก",
    discsPerString115kV: "7 - 8 ลูก/พวง",
    features: [
      "โปร่งใส สังเกตความเสียหายด้วยตาเปล่าจากพื้นดินได้ทันที (Zero Puncture Inspection)",
      "หากเกิดความเสียหาย จานแก้วจะแตกหลุดออก (Shatter) แต่แกนเหล็กยังรับแรงดึงได้",
      "สัมประสิทธิ์การขยายตัวต่ำมาก ไม่เกิด Thermal Shock"
    ],
    advantages: "ตรวจสอบสภาพ (Patrol Inspection) ได้ง่ายจากระยะไกล ไม่ต้องใช้เครื่องมือวัดความต้านทาน",
    disadvantages: "เสี่ยงต่อการถูกยิงหรือขว้างปาจากบุคคลภายนอก",
    svgType: "glass"
  },
  {
    id: "composite",
    name: "ลูกถ้วยคอมโพสิต / โพลิเมอร์ (Composite Long Rod)",
    material: "แกนไฟเบอร์กลาส (FRP Rod) หุ้มด้วยยางซิลิโคน (Silicone Rubber)",
    standard: "IEC 61109 / PEA Spec 115 kV",
    tensileStrength: "100 kN - 160 kN (10,200 - 16,300 kgf)",
    weightPerUnit: "5.0 - 7.0 กก./ชุด (เบากว่าแบบจาน 70%)",
    discsPerString115kV: "1 ท่อนยาว (Long Rod แทนจาน 7-8 ลูก)",
    features: [
      "มีคุณสมบัติไม่ชอบน้ำ (Hydrophobic Surface) ป้องกันฟิล์มน้ำและมลพิษเกาะผิว",
      "ทนทานต่อไอเกลือชายทะเลและมลภาวะอุตสาหกรรม (High Pollution Area) สูงสุด",
      "น้ำหนักเบามาก ลดภาระน้ำหนักของคอนเหล็กและเสาโครงสร้าง"
    ],
    advantages: "น้ำหนักเบา ติดตั้งง่าย ทนไอเกลือและมลพิษสูงสุด ไม่ต้องล้างลูกถ้วยบ่อย",
    disadvantages: "อายุการใช้งานประมาณ 15-25 ปี สั้นกว่ากระเบื้อง และต้องระวังการขูดขีดของปลอกยาง",
    svgType: "composite"
  },
  {
    id: "post",
    name: "ลูกถ้วยตั้ง / ก้านตรง (Line Post Insulator)",
    material: "พอร์ซเลน หรือ ซิลิโคนโพลิเมอร์แบบแท่งตัน",
    standard: "ANSI Class 57-1 / 57-2 / 57-3",
    tensileStrength: "รับแรงดัด (Cantilever Strength) 10 - 12.5 kN",
    weightPerUnit: "18 - 25 กก./ชุด",
    discsPerString115kV: "1 ต้น/จุดรองรับ",
    features: [
      "ใช้ประคองสายจัมเปอร์ (Jumper Support) บนเสาเข้าปลายสาย (SS-AS, SS-LA)",
      "ใช้เป็นโครงสร้างแขวนสายแบบประหยัดเขตทาง (Narrow ROW / Compact Line)",
      "ป้องกันสายจัมเปอร์แกว่งตัวเข้าใกล้โครงสร้างเสาหรือคอนเหล็ก"
    ],
    advantages: "ทำให้การจัดระเบียบสายจัมเปอร์เรียบร้อยและรักษาระยะ Clearance ได้แม่นยำ",
    disadvantages: "รับแรงดึงในแนวราบได้น้อยกว่าแบบลูกถ้วยแขวน",
    svgType: "post"
  }
];

const ASSEMBLY_DATA: AssemblyItem[] = [
  {
    code: "แบบ D-1 / D-11",
    name: "ชุดลูกถ้วยแขวนเดี่ยวแนวดิ่ง (Single Suspension Assembly)",
    type: "suspension",
    typeName: "ชุดลูกถ้วยแขวน (Suspension)",
    poleUsage: "เสาทางตรง SS-TG-2 ถึง SS-TG-6 (มุมเลี้ยว 0° - 2°)",
    partsList: [
      "1. สลักหัวเสา (Ball Eye / U-Bolt) ยึดกับคอนเหล็ก",
      "2. อาร์คซิ่งฮอร์นตัวบน (Top Arcing Horn) ช่องว่าง Spark Gap 80-90 ซม.",
      "3. พวงลูกถ้วยแขวนปอร์ซเลน/แก้วเหนียว 7-8 ลูก (Disc Insulators)",
      "4. อาร์คซิ่งฮอร์นตัวล่าง (Bottom Arcing Horn)",
      "5. ซ็อกเก็ตอาย / คลีวิส (Socket Eye / Socket Clevis)",
      "6. แคล้มป์แขวนสายไฟฟ้า (Suspension Clamp) พร้อมปรีฟอร์มหุ้มสาย (Armor Rods)"
    ],
    description: "ชุดลูกถ้วยแขวนห้อยลงมาในแนวดิ่ง เพื่อรองรับน้ำหนักของสายไฟในแนวราบทางตรง มีอาร์คซิ่งฮอร์นป้องกันกระแสลัดวงจรวาบไฟตามผิว (Flashover)",
    svgType: "D1_suspension"
  },
  {
    code: "แบบ D-2 / D-12",
    name: "ชุดลูกถ้วยแขวนทางโค้ง (Angle Suspension Assembly)",
    type: "suspension",
    typeName: "ชุดลูกถ้วยแขวนทางโค้ง (Angle)",
    poleUsage: "เสาทางโค้งมุมเล็ก SS-SA-2 (มุมเลี้ยว 2° - 30°)",
    partsList: [
      "1. สลักยึดคอนเหล็กแบบปรับมุม (Shackle / Ball Eye)",
      "2. อาร์คซิ่งฮอร์นตัวบนและล่าง",
      "3. พวงลูกถ้วยแขวน 7-8 ลูก (เอียงตามแรงดึงแนวราบ)",
      "4. แคล้มป์แขวนสายแบบทางโค้ง (Angle Suspension Clamp)",
      "5. ปรีฟอร์มพันทับสายป้องกันสายหักงอจากแรงดึงด้านข้าง"
    ],
    description: "ชุดลูกถ้วยจะเอียงเป็นมุมตามแรงดึงลัพธ์ของสายไฟฟ้าที่เลี้ยวโค้ง แคล้มป์จับสายจะออกแบบให้กระจายแรงกดบนสายไฟอย่างสม่ำเสมอ",
    svgType: "D2_angle"
  },
  {
    code: "แบบ D-3 / D-13",
    name: "ชุดลูกถ้วยเข้าปลายสายแนวนอน (Single/Double Tension Assembly)",
    type: "tension",
    typeName: "ชุดลูกถ้วยดึงตึง (Tension / Dead-End)",
    poleUsage: "เสาดึงตรง SS-AS, เสาหัวมุมใหญ่ SS-LA, เสาจบสายหน้าสถานีย่อย",
    partsList: [
      "1. ห่วงยูยึดคอนเหล็ก (Anchor Shackle / U-Bolt Link)",
      "2. แผ่นต่อขยายระยะ (Extension Link)",
      "3. อาร์คซิ่งฮอร์นตัวหน้าและตัวหลัง",
      "4. พวงลูกถ้วยดึงตึงแนวนอน 8-9 ลูก (Tension Disc String)",
      "5. สเตรนด์แคล้มป์จับสายดึงตึง (Compression Dead-End / Bolted Strain Clamp)",
      "6. แป้นต่อสายจัมเปอร์ (Jumper Terminal Pad)"
    ],
    description: "ชุดลูกถ้วยวางตัวในแนวนอนเพื่อรับแรงดึงมหาศาลของสายส่ง 115 kV (ทนแรงดึงได้ถึง 12,000 - 16,000 kgf) พร้อมจุดต่อสายจัมเปอร์ข้ามหัวเสา",
    svgType: "D3_tension"
  },
  {
    code: "แบบ D-19A ถึง D-19J",
    name: "ชุดลูกถ้วยคอมโพสิตโพลิเมอร์ (Composite Long Rod Assembly)",
    type: "composite",
    typeName: "ชุดลูกถ้วยคอมโพสิต (Polymer Long Rod)",
    poleUsage: "สายส่งใกล้ชายทะเล, นิคมอุตสาหกรรม หรือพื้นที่มลพิษสูง",
    partsList: [
      "1. ข้อต่อหัวเสาแบบ Ball / Socket",
      "2. ลูกถ้วยคอมโพสิตโพลิเมอร์แท่งยาว (Silicone Rubber Long Rod)",
      "3. แหวนโคโรนาป้องกันสนามไฟฟ้าเข้มข้น (Corona Ring)",
      "4. อาร์คซิ่งฮอร์นโพลิเมอร์ (Arcing Horn)",
      "5. แคล้มป์จับสายระบบคอมโพสิต"
    ],
    description: "ใช้ลูกถ้วยซิลิโคนแท่งเดียวแทนพวงลูกถ้วยจาน พร้อมแหวนโคโรนาริง (Corona Ring) เพื่อเกลี่ยความหนาแน่นของสนามไฟฟ้า ป้องกันการกัดกร่อนจากไอเกลือ",
    svgType: "D19_composite"
  }
];

export default function Insulators() {
  const [activeMainTab, setActiveMainTab] = useState<"materials" | "assemblies">("materials");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("porcelain");
  const [selectedAssemblyCode, setSelectedAssemblyCode] = useState<string>("แบบ D-1 / D-11");

  const activeType = INSULATOR_TYPES.find((t) => t.id === selectedTypeId) || INSULATOR_TYPES[0];
  const activeAssembly = ASSEMBLY_DATA.find((a) => a.code === selectedAssemblyCode) || ASSEMBLY_DATA[0];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #be123c 0%, #f43f5e 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(244, 63, 94, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" }}>
            <Shield size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>ลูกถ้วยฉนวนไฟฟ้า และรูปจำลองการประกอบชุด (115 kV)</h2>
            <p style={{ color: "#ffe4e6", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              รูปจำลองลูกถ้วยปอร์ซเลน แก้วเหนียว คอมโพสิต และแบบการประกอบชุดลูกถ้วย D-1 ถึง D-19 กฟภ.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs: Materials vs Assemblies */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveMainTab("materials")}
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
            backgroundColor: activeMainTab === "materials" ? "#f43f5e" : "#f1f5f9",
            color: activeMainTab === "materials" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Shield size={18} /> 1. ประเภทลูกถ้วยตามชนิดวัสดุ (4 ชนิด)
        </button>
        <button
          onClick={() => setActiveMainTab("assemblies")}
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
            backgroundColor: activeMainTab === "assemblies" ? "#f43f5e" : "#f1f5f9",
            color: activeMainTab === "assemblies" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Layers size={18} /> 2. รูปแบบการประกอบชุดลูกถ้วย (D-1 ถึง D-19)
        </button>
      </div>

      {/* SECTION 1: MATERIALS & INDIVIDUAL INSULATORS */}
      {activeMainTab === "materials" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Top Interactive Stage */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: "24px", alignItems: "start" }}>
            
            {/* SVG Diagram Card */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #fecdd3", boxShadow: "0 4px 16px rgba(244, 63, 94, 0.08)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", backgroundColor: "#fff1f2", borderBottom: "1px solid #fecdd3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#e11d48", textTransform: "uppercase" }}>รูปจำลองลูกถ้วย</span>
                <span style={{ fontSize: "0.8rem", backgroundColor: "#ffe4e6", color: "#be123c", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                  115 kV Standard
                </span>
              </div>

              {/* Vector SVG Canvas */}
              <div style={{ backgroundColor: "#0f172a", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "340px" }}>
                <InsulatorSVG type={activeType.svgType} />
              </div>

              <div style={{ padding: "12px 18px", backgroundColor: "#fff1f2", borderTop: "1px solid #fecdd3", textAlign: "center", fontSize: "0.85rem", color: "#be123c", fontWeight: "bold" }}>
                {activeType.name}
              </div>
            </div>

            {/* Material Specs Details */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#1e293b", margin: "0 0 4px 0" }}>
                  {activeType.name}
                </h3>
                <span style={{ fontSize: "0.85rem", color: "#e11d48", fontWeight: "bold" }}>
                  มาตรฐาน: {activeType.standard}
                </span>
              </div>

              {/* Spec Highlights Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div style={{ backgroundColor: "#fff1f2", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fecdd3" }}>
                  <span style={{ fontSize: "0.75rem", color: "#be123c", fontWeight: "bold", display: "block" }}>พิกัดรับแรงดึง (M&amp;E Strength)</span>
                  <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#9f1239" }}>{activeType.tensileStrength}</span>
                </div>

                <div style={{ backgroundColor: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", display: "block" }}>จำนวนลูกต่อพวง (115 kV)</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#1e293b" }}>{activeType.discsPerString115kV}</span>
                </div>

                <div style={{ backgroundColor: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", display: "block" }}>น้ำหนักต่อหน่วย</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#1e293b" }}>{activeType.weightPerUnit}</span>
                </div>

                <div style={{ backgroundColor: "#f0fdf4", padding: "12px 14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: "bold", display: "block" }}>วัสดุหลัก</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#166534" }}>{activeType.material}</span>
                </div>
              </div>

              {/* Features List */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#1e293b", marginBottom: "8px" }}>
                  คุณสมบัติทางไฟฟ้าและกายภาพ:
                </h4>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.9rem", color: "#475569", lineHeight: "1.6" }}>
                  {activeType.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Pros & Cons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.85rem" }}>
                <div style={{ backgroundColor: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                  <span style={{ fontWeight: "bold", color: "#15803d", display: "block", marginBottom: "4px" }}>✅ จุดเด่น (Advantages)</span>
                  <p style={{ color: "#166534", margin: 0, lineHeight: "1.4" }}>{activeType.advantages}</p>
                </div>
                <div style={{ backgroundColor: "#fffbeb", padding: "12px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                  <span style={{ fontWeight: "bold", color: "#b45309", display: "block", marginBottom: "4px" }}>⚠️ ข้อจำกัด (Limitations)</span>
                  <p style={{ color: "#92400e", margin: 0, lineHeight: "1.4" }}>{activeType.disadvantages}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Cards to Select Types */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {INSULATOR_TYPES.map((t) => {
              const isSelected = t.id === selectedTypeId;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTypeId(t.id)}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    border: isSelected ? "2px solid #e11d48" : "1px solid #e2e8f0",
                    padding: "16px",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 8px 20px -4px rgba(225, 29, 72, 0.25)" : "0 2px 6px rgba(0,0,0,0.04)",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "bold", color: isSelected ? "#e11d48" : "#1e293b", fontSize: "1rem" }}>
                      {t.name.split("/")[0]}
                    </span>
                    <span style={{ fontSize: "0.75rem", backgroundColor: isSelected ? "#ffe4e6" : "#f1f5f9", color: isSelected ? "#be123c" : "#64748b", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                      {t.tensileStrength.split("(")[0]}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 8px 0", lineHeight: "1.4" }}>
                    {t.material}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: isSelected ? "#e11d48" : "#94a3b8", fontWeight: "bold", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
                    <span>{t.discsPerString115kV}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>ดูรูปจำลอง <ArrowRight size={12} /></span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SECTION 2: ASSEMBLIES D-1 TO D-19 */}
      {activeMainTab === "assemblies" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Top Interactive Stage for Assembly */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: "24px", alignItems: "start" }}>
            
            {/* SVG Diagram Card */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #cbd5e1", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#e11d48", textTransform: "uppercase" }}>รูปจำลองการประกอบชุดลูกถ้วย</span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>{activeAssembly.code}</h3>
                </div>
                <span style={{ fontSize: "0.8rem", backgroundColor: "#fce7f3", color: "#be185d", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold" }}>
                  {activeAssembly.typeName}
                </span>
              </div>

              {/* Vector SVG Canvas */}
              <div style={{ backgroundColor: "#0f172a", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "360px" }}>
                <AssemblySVG type={activeAssembly.svgType} />
              </div>

              {/* Legend */}
              <div style={{ padding: "12px 16px", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "0.75rem", color: "#64748b" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "10px", height: "10px", backgroundColor: "#ec4899", borderRadius: "2px" }}></span>
                  <span>พวงลูกถ้วย (Disc Insulators)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "10px", height: "10px", backgroundColor: "#38bdf8", borderRadius: "50%" }}></span>
                  <span>เขาอาร์ค (Arcing Horn)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "10px", height: "10px", backgroundColor: "#cbd5e1", borderRadius: "2px" }}></span>
                  <span>แคล้มป์จับสาย (Clamp)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "10px", height: "10px", backgroundColor: "#f59e0b", borderRadius: "50%" }}></span>
                  <span>สายไฟฟ้า 115 kV (Conductor)</span>
                </div>
              </div>
            </div>

            {/* Assembly Details & Parts List */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: "bold", color: "#1e293b", margin: "0 0 4px 0" }}>
                  {activeAssembly.name}
                </h3>
                <span style={{ fontSize: "0.9rem", color: "#e11d48", fontWeight: "bold" }}>
                  การใช้งานกับเสา: {activeAssembly.poleUsage}
                </span>
              </div>

              <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                {activeAssembly.description}
              </p>

              {/* Bill of Materials / Parts List */}
              <div style={{ backgroundColor: "#f8fafc", padding: "16px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#1e293b", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Settings size={16} className="text-blue-600" />
                  รายการอุปกรณ์ประกอบในชุด (Bill of Hardware):
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", color: "#334155" }}>
                  {activeAssembly.partsList.map((part, idx) => (
                    <div key={idx} style={{ padding: "4px 8px", backgroundColor: "white", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                      {part}
                    </div>
                  ))}
                </div>
              </div>

              {/* Spark Gap Notice */}
              <div style={{ padding: "12px 14px", backgroundColor: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a", fontSize: "0.85rem", color: "#92400e", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <Info size={18} className="flex-shrink-0 text-amber-600" />
                <span>
                  <b>ระยะห่างช่องว่างประกายไฟ (Arcing Horn Gap):</b> ปรับตั้งไว้ที่ประมาณ <b>80 - 90 ซม.</b> เพื่อให้เกิด Flashover ข้ามปลายเขาอาร์คแทนที่จะเกิดวาบไฟผ่านผิวลูกถ้วย ป้องกันลูกถ้วยแตกเสียหาย
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Assembly Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {ASSEMBLY_DATA.map((a) => {
              const isSelected = a.code === selectedAssemblyCode;
              return (
                <div
                  key={a.code}
                  onClick={() => setSelectedAssemblyCode(a.code)}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    border: isSelected ? "2px solid #e11d48" : "1px solid #e2e8f0",
                    padding: "16px",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 8px 20px -4px rgba(225, 29, 72, 0.25)" : "0 2px 6px rgba(0,0,0,0.04)",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "800", color: isSelected ? "#e11d48" : "#1e293b", fontSize: "1.05rem" }}>
                      {a.code}
                    </span>
                    <span style={{ fontSize: "0.75rem", backgroundColor: isSelected ? "#ffe4e6" : "#f1f5f9", color: isSelected ? "#be123c" : "#64748b", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                      {a.typeName.split(" ")[0]}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 10px 0", lineHeight: "1.4" }}>
                    {a.name}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: isSelected ? "#e11d48" : "#94a3b8", fontWeight: "bold", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
                    <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.poleUsage}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>ดูรูปจำลอง <ArrowRight size={12} /></span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}

// ─── SVG Vector Diagrams for Individual Insulators ─────────────────────────

function InsulatorSVG({ type }: { type: "porcelain" | "glass" | "composite" | "post" }) {
  switch (type) {
    case "porcelain":
      // Porcelain Disc String (Brown/Dark glazed discs stacked)
      return (
        <svg width="260" height="300" viewBox="0 0 260 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Pin Connection */}
          <rect x="122" y="15" width="16" height="18" rx="3" fill="#cbd5e1" stroke="#94a3b8" />
          <circle cx="130" cy="24" r="4" fill="#475569" />

          {/* 6 Discs Stack */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const y = 35 + i * 36;
            return (
              <g key={i}>
                {/* Metal Cap */}
                <rect x="123" y={y} width="14" height="10" rx="2" fill="#94a3b8" />
                {/* Porcelain Brown Flange/Shed */}
                <path d={`M 70,${y + 16} Q 130,${y + 8} 190,${y + 16} L 185,${y + 24} Q 130,${y + 16} 75,${y + 24} Z`} fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
                {/* Metal Pin Bottom */}
                <rect x="126" y={y + 24} width="8" height="12" fill="#cbd5e1" />
              </g>
            );
          })}

          {/* Bottom Socket / Eye */}
          <rect x="122" y="255" width="16" height="20" rx="3" fill="#cbd5e1" stroke="#94a3b8" />
          <circle cx="130" cy="265" r="4" fill="#475569" />

          <text x="130" y="290" fill="#fed7aa" fontSize="10" textAnchor="middle" fontWeight="bold">จานปอร์ซเลนเคลือบเงา (7-8 ลูก/พวง)</text>
        </svg>
      );

    case "glass":
      // Toughened Glass Discs (Emerald Green translucent glass)
      return (
        <svg width="260" height="300" viewBox="0 0 260 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Pin Connection */}
          <rect x="122" y="15" width="16" height="18" rx="3" fill="#cbd5e1" stroke="#94a3b8" />
          <circle cx="130" cy="24" r="4" fill="#475569" />

          {/* 6 Glass Discs */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const y = 35 + i * 36;
            return (
              <g key={i}>
                <rect x="123" y={y} width="14" height="10" rx="2" fill="#94a3b8" />
                {/* Translucent Emerald Glass Shed */}
                <path d={`M 70,${y + 16} Q 130,${y + 8} 190,${y + 16} L 185,${y + 24} Q 130,${y + 16} 75,${y + 24} Z`} fill="#10b981" fillOpacity="0.75" stroke="#34d399" strokeWidth="1.5" />
                {/* Highlights for glass look */}
                <line x1="85" y1={y + 16} x2="115" y2={y + 14} stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.7" />
                <rect x="126" y={y + 24} width="8" height="12" fill="#cbd5e1" />
              </g>
            );
          })}

          <rect x="122" y="255" width="16" height="20" rx="3" fill="#cbd5e1" stroke="#94a3b8" />
          <circle cx="130" cy="265" r="4" fill="#475569" />

          <text x="130" y="290" fill="#a7f3d0" fontSize="10" textAnchor="middle" fontWeight="bold">จานแก้วเหนียวอบโปร่งใส (เห็นรอยแตกง่าย)</text>
        </svg>
      );

    case "composite":
      // Composite Silicone Long Rod with Corona Ring
      return (
        <svg width="260" height="300" viewBox="0 0 260 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Metal Fitting */}
          <rect x="120" y="15" width="20" height="25" rx="3" fill="#94a3b8" stroke="#64748b" />
          <circle cx="130" cy="26" r="4" fill="#334155" />

          {/* Top Corona Ring */}
          <ellipse cx="130" cy="45" rx="38" ry="7" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <line x1="92" y1="45" x2="125" y2="40" stroke="#94a3b8" strokeWidth="2" />
          <line x1="168" y1="45" x2="135" y2="40" stroke="#94a3b8" strokeWidth="2" />

          {/* Core Fiberglass Rod */}
          <rect x="126" y="40" width="8" height="200" fill="#64748b" />

          {/* Silicone Rubber Sheds (Alternating big/small sheds) */}
          {[...Array(14)].map((_, idx) => {
            const y = 50 + idx * 13;
            const isBig = idx % 2 === 0;
            const width = isBig ? 64 : 48;
            const half = width / 2;
            return (
              <path
                key={idx}
                d={`M ${130 - half},${y + 4} Q 130,${y} ${130 + half},${y + 4} L ${130 + half - 4},${y + 8} Q 130,${y + 4} ${130 - half + 4},${y + 8} Z`}
                fill="#94a3b8"
                stroke="#64748b"
                strokeWidth="1"
              />
            );
          })}

          {/* Bottom Corona Ring */}
          <ellipse cx="130" cy="235" rx="38" ry="7" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <line x1="92" y1="235" x2="125" y2="240" stroke="#94a3b8" strokeWidth="2" />
          <line x1="168" y1="235" x2="135" y2="240" stroke="#94a3b8" strokeWidth="2" />

          {/* Bottom Metal Fitting */}
          <rect x="120" y="240" width="20" height="25" rx="3" fill="#94a3b8" stroke="#64748b" />
          <circle cx="130" cy="252" r="4" fill="#334155" />

          <text x="130" y="290" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="bold">ซิลิโคนคอมโพสิตแท่งเดี่ยว + Corona Ring</text>
        </svg>
      );

    case "post":
      // Line Post Insulator (Rigid upright cylinder)
      return (
        <svg width="260" height="300" viewBox="0 0 260 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base Flange Mounting */}
          <rect x="95" y="250" width="70" height="16" rx="3" fill="#64748b" />
          <circle cx="108" cy="258" r="3" fill="#cbd5e1" />
          <circle cx="152" cy="258" r="3" fill="#cbd5e1" />

          {/* Post Body with 10 sheds */}
          {[...Array(9)].map((_, i) => {
            const y = 60 + i * 20;
            return (
              <g key={i}>
                <rect x="120" y={y} width="20" height="12" fill="#78350f" />
                <path d={`M 75,${y + 12} Q 130,${y + 6} 185,${y + 12} L 180,${y + 18} Q 130,${y + 12} 80,${y + 18} Z`} fill="#9a3412" stroke="#7c2d12" />
              </g>
            );
          })}

          {/* Top Clamp for Jumper Conductor */}
          <rect x="110" y="35" width="40" height="20" rx="3" fill="#94a3b8" stroke="#64748b" />
          <path d="M 100,45 Q 130,35 160,45" stroke="#f59e0b" strokeWidth="4" fill="none" />
          <circle cx="130" cy="45" r="4" fill="#f59e0b" />

          <text x="130" y="290" fill="#fed7aa" fontSize="10" textAnchor="middle" fontWeight="bold">ลูกถ้วยตั้ง (Line Post) รับสายจัมเปอร์</text>
        </svg>
      );

    default:
      return null;
  }
}

// ─── SVG Vector Diagrams for Assembly Configurations ────────────────────────

function AssemblySVG({ type }: { type: "D1_suspension" | "D2_angle" | "D3_tension" | "D19_composite" }) {
  switch (type) {
    case "D1_suspension":
      // Single Suspension Assembly with Arcing Horns and Clamp
      return (
        <svg width="300" height="340" viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Steel Crossarm Top Beam */}
          <rect x="40" y="10" width="220" height="16" fill="#cbd5e1" stroke="#94a3b8" rx="2" />
          <circle cx="150" cy="18" r="4" fill="#475569" />

          {/* Top U-Bolt / Ball Eye */}
          <rect x="144" y="26" width="12" height="16" fill="#94a3b8" />
          
          {/* Top Arcing Horn */}
          <path d="M 144,36 L 90,45 L 85,110" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="85" cy="110" r="3" fill="#38bdf8" />
          <text x="40" y="75" fill="#38bdf8" fontSize="9" fontWeight="bold">เขาอาร์คบน</text>

          {/* 7 Disc Insulators */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const y = 44 + i * 26;
            return (
              <g key={i}>
                <rect x="146" y={y} width="8" height="6" fill="#64748b" />
                <path d={`M 110,${y + 10} Q 150,${y + 4} 190,${y + 10} L 185,${y + 16} Q 150,${y + 10} 115,${y + 16} Z`} fill="#ec4899" stroke="#db2777" strokeWidth="1" />
              </g>
            );
          })}

          {/* Bottom Socket Eye */}
          <rect x="144" y="230" width="12" height="16" fill="#94a3b8" />

          {/* Bottom Arcing Horn */}
          <path d="M 144,235 L 90,225 L 85,185" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="85" cy="185" r="3" fill="#38bdf8" />
          <text x="40" y="210" fill="#38bdf8" fontSize="9" fontWeight="bold">เขาอาร์คล่าง</text>

          {/* Spark Gap Distance Indicator */}
          <line x1="85" y1="115" x2="85" y2="180" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="75" y="150" fill="#f43f5e" fontSize="9" textAnchor="end" fontWeight="bold">Gap 80-90 ซม.</text>

          {/* Suspension Clamp */}
          <rect x="135" y="246" width="30" height="16" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
          
          {/* Armor Rod & Conductor */}
          <line x1="20" y1="254" x2="280" y2="254" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <rect x="110" y="251" width="80" height="6" fill="#94a3b8" fillOpacity="0.8" rx="2" />
          <text x="150" y="280" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">สายตัวนำ 115 kV (พาดทางตรง)</text>

          <text x="150" y="320" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">แบบ D-1: แขวนแนวดิ่ง 115 kV</text>
        </svg>
      );

    case "D2_angle":
      // Angle Suspension Assembly tilted by angle
      return (
        <svg width="300" height="340" viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Crossarm */}
          <rect x="40" y="10" width="220" height="16" fill="#cbd5e1" stroke="#94a3b8" rx="2" />

          {/* Angled group */}
          <g transform="rotate(20, 150, 26)">
            {/* Top link */}
            <rect x="144" y="26" width="12" height="16" fill="#94a3b8" />
            
            {/* Arcing Horns */}
            <path d="M 144,36 L 90,45 L 85,110" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 144,235 L 90,225 L 85,185" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* 7 Discs */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const y = 44 + i * 26;
              return (
                <g key={i}>
                  <rect x="146" y={y} width="8" height="6" fill="#64748b" />
                  <path d={`M 110,${y + 10} Q 150,${y + 4} 190,${y + 10} L 185,${y + 16} Q 150,${y + 10} 115,${y + 16} Z`} fill="#ec4899" stroke="#db2777" strokeWidth="1" />
                </g>
              );
            })}

            {/* Angle Clamp & Conductor */}
            <rect x="135" y="246" width="30" height="16" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
            <line x1="20" y1="254" x2="280" y2="254" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          </g>

          <text x="150" y="320" fill="#a78bfa" fontSize="11" textAnchor="middle" fontWeight="bold">แบบ D-2: แขวนทางโค้ง (เอียง 2°-30° ตามแรงดึง)</text>
        </svg>
      );

    case "D3_tension":
      // Horizontal Tension / Dead-End Assembly with Jumper
      return (
        <svg width="300" height="340" viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Vertical Pole Crossarm Post */}
          <rect x="142" y="30" width="16" height="260" fill="#94a3b8" rx="2" />
          <rect x="125" y="110" width="50" height="30" fill="#64748b" rx="3" />

          {/* Left Tension String (Incoming Line) */}
          <g>
            <rect x="110" y="120" width="16" height="10" fill="#cbd5e1" />
            {/* 6 Horizontal Discs */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const x = 95 - i * 14;
              return (
                <rect key={i} x={x} y="115" width="10" height="20" rx="2" fill="#ec4899" stroke="#db2777" />
              );
            })}
            <rect x="5" y="118" width="15" height="14" rx="2" fill="#cbd5e1" />
            {/* Strain Clamp Left */}
            <line x1="0" y1="125" x2="10" y2="125" stroke="#f59e0b" strokeWidth="4" />
          </g>

          {/* Right Tension String (Outgoing Line) */}
          <g>
            <rect x="174" y="120" width="16" height="10" fill="#cbd5e1" />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const x = 195 + i * 14;
              return (
                <rect key={i} x={x} y="115" width="10" height="20" rx="2" fill="#ec4899" stroke="#db2777" />
              );
            })}
            <rect x="280" y="118" width="15" height="14" rx="2" fill="#cbd5e1" />
            <line x1="290" y1="125" x2="300" y2="125" stroke="#f59e0b" strokeWidth="4" />
          </g>

          {/* Jumper Loop Connecting Left to Right Under Pole */}
          <path d="M 15,125 Q 150,220 285,125" stroke="#fbbf24" strokeWidth="3" fill="none" />
          <text x="150" y="235" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">สายจัมเปอร์ (Jumper Loop)</text>

          {/* Arcing Horns on horizontal strings */}
          <line x1="105" y1="105" x2="25" y2="105" stroke="#38bdf8" strokeWidth="2" />
          <line x1="195" y1="105" x2="275" y2="105" stroke="#38bdf8" strokeWidth="2" />

          <text x="150" y="320" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">แบบ D-3: ชุดเข้าปลายสายดึงตึงแนวนอน</text>
        </svg>
      );

    case "D19_composite":
      // Composite Long Rod with Corona Ring
      return (
        <svg width="300" height="340" viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Crossarm */}
          <rect x="40" y="10" width="220" height="16" fill="#cbd5e1" stroke="#94a3b8" rx="2" />

          {/* Top Fitting */}
          <rect x="144" y="26" width="12" height="18" fill="#94a3b8" />

          {/* Top Corona Ring */}
          <ellipse cx="150" cy="50" rx="36" ry="6" fill="none" stroke="#e2e8f0" strokeWidth="3" />

          {/* Top Arcing Horn */}
          <path d="M 144,36 L 90,45 L 85,115" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Composite Body with Silicone Sheds */}
          <rect x="147" y="44" width="6" height="190" fill="#64748b" />
          {[...Array(14)].map((_, idx) => {
            const y = 52 + idx * 13;
            const isBig = idx % 2 === 0;
            const width = isBig ? 56 : 42;
            const half = width / 2;
            return (
              <path
                key={idx}
                d={`M ${150 - half},${y + 4} Q 150,${y} ${150 + half},${y + 4} L ${150 + half - 4},${y + 8} Q 150,${y + 4} ${150 - half + 4},${y + 8} Z`}
                fill="#ec4899"
                stroke="#be185d"
                strokeWidth="1"
              />
            );
          })}

          {/* Bottom Corona Ring */}
          <ellipse cx="150" cy="225" rx="36" ry="6" fill="none" stroke="#e2e8f0" strokeWidth="3" />

          {/* Bottom Arcing Horn */}
          <path d="M 144,235 L 90,225 L 85,185" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Bottom Fitting & Clamp */}
          <rect x="144" y="235" width="12" height="14" fill="#94a3b8" />
          <rect x="135" y="248" width="30" height="16" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
          
          {/* Conductor */}
          <line x1="20" y1="256" x2="280" y2="256" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

          <text x="150" y="320" fill="#f43f5e" fontSize="11" textAnchor="middle" fontWeight="bold">แบบ D-19: ชุดลูกถ้วยคอมโพสิต + แหวนโคโรนา</text>
        </svg>
      );

    default:
      return null;
  }
}
