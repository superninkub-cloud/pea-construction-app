import React, { useState } from "react";
import { Wrench, Settings, Shield, AlertTriangle, CheckCircle2, Eye, Layers, ArrowRight, Zap } from "lucide-react";

interface HardwareDetail {
  id: string;
  name: string;
  englishName: string;
  category: "protection" | "clamp" | "guying" | "warning";
  categoryName: string;
  functionDesc: string;
  installationGuide: string[];
  specStandards: string;
  toolsRequired: string;
  caution: string;
  svgType: "arcing_horn" | "suspension_clamp" | "strain_clamp" | "vibration_damper" | "warning_ball" | "armor_rod" | "guy_assembly" | "corona_ring";
}

const HARDWARE_DATA: HardwareDetail[] = [
  {
    id: "arcing_horn",
    name: "อาร์คซิ่งฮอร์น / เขาอาร์ค",
    englishName: "Arcing Horn / Spark Gap Electrodes",
    category: "protection",
    categoryName: "อุปกรณ์ป้องกันลูกถ้วย",
    functionDesc: "ป้องกันลูกถ้วยชำรุดเสียหายจากแรงดันเกินฟ้าผ่า (Surge / Flashover) โดยล่อให้ประกายไฟกระโดดข้ามอากาศระหว่างปลายเขาอาร์คแทนที่จะวิ่งผ่านผิวลูกถ้วย",
    installationGuide: [
      "ติดตั้ง 2 ชิ้นต่อ 1 พวงลูกถ้วย (ชิ้นบนยึดกับสลักหัวเสา, ชิ้นล่างยึดกับแคล้มป์จับสาย)",
      "ปรับตั้งระยะช่องว่างประกายไฟ (Spark Gap) ระหว่างปลายเขาอาร์คบนและล่างให้ได้ 80 - 90 ซม. (สำหรับระบบ 115 kV)",
      "ตรวจสอบให้ปลายเขาอาร์คชี้ในระนาบตรงกัน และขันน็อตล็อก (Lock Nut) ให้แน่นหนา"
    ],
    specStandards: "เหล็กกล้าชุบสังกะสีแบบจุ่มร้อน (Hot-Dip Galvanized Steel) ทนกระแสลัดวงจร 25 kA / 1 วินาที",
    toolsRequired: "ประแจแหวน/บล็อก เบอร์ 19, 24 มม., ตลับเมตรวัดระยะ Gap",
    caution: "ห้ามตั้งระยะ Gap ชิดเกินไป (<70 ซม.) เพราะจะทำให้เกิด Flashover ในสภาวะปกติ หรือห่างเกินไป (>100 ซม.) จนไม่ป้องกันลูกถ้วย",
    svgType: "arcing_horn"
  },
  {
    id: "suspension_clamp",
    name: "แคล้มป์แขวนสายไฟฟ้า",
    englishName: "Suspension Clamp & Trunnion",
    category: "clamp",
    categoryName: "แคล้มป์และจุดจับยึด",
    functionDesc: "จับยึดและรองรับน้ำหนักสายไฟฟ้า 115 kV ในแนวดิ่งบนเสาทางตรง (SS-TG) และเสาทางโค้งมุมเล็ก (SS-SA)",
    installationGuide: [
      "ต้องพันลวดปรีฟอร์ม (Armor Rods) ทับสายตัวนำก่อนวางสายลงในร่องแคล้มป์เสมอ",
      "วางสายให้อยู่กึ่งกลางร่องแคล้มป์รูปตัวเรือ (Boat-shaped Body)",
      "ใส่แผ่นประกับบนและขันสลักเกลียว U-Bolt ด้วยแรงบิด (Torque) ตามมาตรฐาน กฟภ. (ประมาณ 40-50 N.m)"
    ],
    specStandards: "อะลูมิเนียมอัลลอยด์หล่อแรงดึงสูง ทนแรงดึงแนวดิ่งไม่น้อยกว่า 8,200 kgf (80 kN)",
    toolsRequired: "ประแจปอนด์ (Torque Wrench), รอกยกสาย (Come-along clamp)",
    caution: "ห้ามขันสลักแน่นเกินไปจนสายไฟบี้เสียรูปทรง และห้ามลืมใส่แผ่น Armor Rods เด็ดขาด",
    svgType: "suspension_clamp"
  },
  {
    id: "strain_clamp",
    name: "สเตรนด์แคล้มป์ / แคล้มป์ดึงตึงเข้าปลายสาย",
    englishName: "Compression Dead-End & Bolted Strain Clamp",
    category: "clamp",
    categoryName: "แคล้มป์และจุดจับยึด",
    functionDesc: "จับยึดสายไฟฟ้า 115 kV ในแนวนอนเพื่อรับแรงดึงสูงสุด (Tension) ที่เสาดึงตรง (SS-AS), เสาหัวมุมใหญ่ (SS-LA) และเสาจบสาย",
    installationGuide: [
      "แบบอัดไฮดรอลิก (Compression): สอดแกนเหล็กเข้าปลอกเหล็กด้านใน ย้ำด้วยเครื่องย้ำไฮดรอลิก แล้วสวมปลอกอลูมิเนียมด้านนอกย้ำทับให้แน่น",
      "แบบขันโบลท์ (Bolted Type): วางสายในร่องแล้วขันสลักเกลียวเรียงตามลำดับจากด้านในออกด้านนอก",
      "ต่อเชื่อมสายจัมเปอร์ (Jumper) เข้ากับแป้นต่อ (Terminal Pad) พร้อมทา Joint Compound ป้องกันออกไซด์"
    ],
    specStandards: "ทนแรงดึงได้ไม่น้อยกว่า 95% ของแรงดึงประลัยสาย (UTS) เช่น 12,000 - 14,000 kgf",
    toolsRequired: "เครื่องย้ำไฮดรอลิก (Hydraulic Crimper 60-100 ตัน), ไดส์ย้ำ (Dies) ขนาดตรงกับสาย",
    caution: "ต้องทำความสะอาดผิวสายไฟด้วยแปรงลวดและทาจาระบีนำไฟฟ้า (Oxide Inhibitor) ก่อนย้ำเสมอ",
    svgType: "strain_clamp"
  },
  {
    id: "vibration_damper",
    name: "ไวเบรชั่นแดมเปอร์ / ลูกตุ้มซับแรงสั่นสะเทือน",
    englishName: "Stockbridge Vibration Damper",
    category: "protection",
    categoryName: "อุปกรณ์ป้องกันสาย",
    functionDesc: "ซับและสลายพลังงานการสั่นสะเทือนความถี่สูงของสายไฟที่เกิดจากลมพัดผ่าน (Aeolian Vibration) ป้องกันสายไฟล้าและขาดตรงขอบแคล้มป์",
    installationGuide: [
      "ติดตั้งบนสายไฟฟ้าห่างจากปากแคล้มป์แขวนตามระยะตารางมาตรฐาน (ประมาณ 0.80 - 1.50 ม. ขึ้นกับขนาดสายและแรงดึง)",
      "จัดให้ตุ้มน้ำหนักทั้ง 2 ข้างขนานกับแนวสายไฟในแนวดิ่ง",
      "ขันสลักเกลียวรัดสายด้วยแรงบิดประมาณ 25-30 N.m"
    ],
    specStandards: "ลูกตุ้มเหล็กหล่อกัลวาไนซ์ 2 ข้าง ยึดด้วยลวดสลิงอ่อนสแตนเลส (Messenger Cable) แคล้มป์อลูมิเนียม",
    toolsRequired: "ตลับเมตรวัดระยะติดตั้ง, ประแจปอนด์ (Torque Wrench)",
    caution: "ระยะติดตั้งจากขอบแคล้มป์มีความสำคัญมาก หากติดผิดระยะจะทำให้การซับแรงสั่นสะเทือนไม่ได้ผล",
    svgType: "vibration_damper"
  },
  {
    id: "warning_ball",
    name: "ลูกบอลเตือนแนวสายส่งอากาศยาน",
    englishName: "Spherical Aircraft Warning Markers",
    category: "warning",
    categoryName: "อุปกรณ์เตือนภัยและความปลอดภัย",
    functionDesc: "ลูกบอลสังเกตการณ์สีเด่นชัด ติดตั้งบนสายกราวด์ล่อฟ้า (OHGW/OPGW) เพื่อเป็นจุดสังเกตสำหรับนักบิน ป้องกันอากาศยานบินชนสายส่ง",
    installationGuide: [
      "ติดตั้งบนสายกราวด์ล่อฟ้าเส้นบนสุด (OHGW) ในบริเวณใกล้สนามบิน ทางขึ้น-ลงเครื่องบิน หรือจุดพาดข้ามแม่น้ำกว้าง",
      "ติดตั้งสลับสีส้ม-ขาว หรือ ขาว-แดง ทุกๆ ระยะ 30 - 45 เมตร",
      "ประกบฝาครึ่งวงกลม 2 ซีกเข้ากับสายกราวด์ แล้วขันน็อตล็อกพร้อมสายระบายประจุ (Drain Wire)"
    ],
    specStandards: "ไฟเบอร์กลาสเสริมแรง (FRP) ทนแสงแดด UV ขนาดเส้นผ่านศูนย์กลาง 50 - 60 ซม.",
    toolsRequired: "กระเช้าซ่อมสาย (Trolley / Aerial Lift), ประแจขันล็อก",
    caution: "ต้องตรวจสอบรูระบายน้ำที่ก้นลูกบอลไม่ให้อุดตัน เพื่อป้องกันน้ำขังถ่วงน้ำหนักสาย",
    svgType: "warning_ball"
  },
  {
    id: "armor_rod",
    name: "ลวดปรีฟอร์ม / อาร์เมอร์ร็อด",
    englishName: "Preformed Armor Rods",
    category: "protection",
    categoryName: "อุปกรณ์ป้องกันสาย",
    functionDesc: "ลวดอลูมิเนียมอัลลอยด์ดัดเกลียวสำเร็จรูป พันแนบสนิทรอบสายตัวนำตรงจุดจับยึด เพื่อเสริมความแข็งแรง ป้องกันการสึกหรอ และกระจายแรงกด",
    installationGuide: [
      "จัดกึ่งกลางมัดลวดปรีฟอร์มให้ตรงกับกึ่งกลางแคล้มป์แขวน",
      "พันลวดทีละชุด (มัดละ 2-3 เส้น) วนไปตามทิศทางการตีเกลียวของสายไฟจนแนบสนิทครบทั้งวง",
      "ตรวจสอบปลายลวดให้เรียบสนิท ไม่กระดกหรือมีเหลี่ยมคม"
    ],
    specStandards: "อลูมิเนียมอัลลอยด์เกรดรับแรงดึงสูง ความยาว 1.50 - 2.00 เมตร",
    toolsRequired: "ถุงมือหนังสำหรับพันสาย (Hand Application ไม่ต้องใช้เครื่องมือพิเศษ)",
    caution: "ต้องเลือกขนาดลวดปรีฟอร์มให้ตรงกับขนาดสายไฟ (เช่น สำหรับ AAC 400 หรือ ACSR 400)",
    svgType: "armor_rod"
  },
  {
    id: "guy_assembly",
    name: "ชุดสายยึดโยงและอุปกรณ์เข้าปลายสาย",
    englishName: "Guy Assembly, Thimble, Grip & Guy Insulator",
    category: "guying",
    categoryName: "ระบบยึดโยงและตรึงเสา",
    functionDesc: "อุปกรณ์ถ่ายแรงดึงแนวราบของเสาทางโค้งและเสาหัวมุมลงสู่สมอบกคอนกรีตใต้ดิน เพื่อรักษาเสาให้อยู่ในแนวดิ่งอย่างมั่นคง",
    installationGuide: [
      "ร้อยสลักห่วง (Thimble Eye Bolt) เข้ากับรูเสาที่ระดับ 4.00 ม.",
      "คล้องสายลวดเหล็กตีเกลียว (Steel Guy Wire) ผ่านร่องห่วงกายทิมเบิ้ล (Guy Thimble) เพื่อกันสายพับหัก",
      "ใส่ลูกถ้วยยึดโยงรูปไข่ (Guy Strain Insulator) ที่ระดับสูงกว่าพื้นดินไม่น้อยกว่า 2.50 ม. เพื่อป้องกันไฟรั่วลงดิน",
      "ล็อกปลายสายด้วยลวดเกลียวสำเร็จรูป (Preformed Guy Grip Dead-End) และปรับความตึงด้วยเกลียวเร่ง (Turnbuckle)"
    ],
    specStandards: "ลวดเหล็กตีเกลียวชุบสังกะสีขนาด 3/8\" หรือ 1/2\" ทนแรงดึง 5,000 - 9,000 kgf",
    toolsRequired: "รอกดึงสาย (Come-Along), กริ๊ปจับสายสลิง (Wire Grip), ประแจปรับเกลียวเร่ง",
    caution: "มุมเอียงของสายยึดโยงทำกับโคนเสาต้องไม่น้อยกว่า 45 องศา (หรือ 30 องศาในกรณีจำกัดเขตทาง)",
    svgType: "guy_assembly"
  },
  {
    id: "corona_ring",
    name: "แหวนโคโรนาริง",
    englishName: "Corona / Grading Ring",
    category: "protection",
    categoryName: "อุปกรณ์ป้องกันลูกถ้วย",
    functionDesc: "วงแหวนอลูมิเนียมผิวเรียบมัน ติดตั้งที่ขั้วแรงสูงของลูกถ้วยคอมโพสิต เพื่อเกลี่ยความหนาแน่นของสนามไฟฟ้า ป้องกันการเกิดโคโรนาดิสชาร์จ (Corona Discharge) และลดเสียงรบกวน",
    installationGuide: [
      "ติดตั้งครอบบริเวณข้อต่อโลหะ (Metal Fitting) ฝั่งที่ต่อกับสายไฟฟ้า 115 kV",
      "จัดตำแหน่งแหวนให้อยู่ในระนาบสมมาตรรอบแกนลูกถ้วย",
      "ขันสลักยึดขากราวด์ให้แน่นหนา ไม่ให้แหวนแกว่งตัว"
    ],
    specStandards: "ท่ออลูมิเนียมกลมดัดขึ้นรูปผิวเรียบพิเศษ ไม่มีรอยต่อหรือคมโลหะ",
    toolsRequired: "ประแจขันล็อกขนาด 14, 17 มม.",
    caution: "ผิวของแหวนต้องเรียบมันเสมอ หากมีรอยบุบหรือรอยขูดขีดอาจกลายเป็นจุดกำเนิดโคโรนาเสียเอง",
    svgType: "corona_ring"
  }
];

export default function Hardware() {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>("arcing_horn");

  const filteredHardware = selectedFilter === "ALL"
    ? HARDWARE_DATA
    : HARDWARE_DATA.filter((h) => h.category === selectedFilter);

  const activeHardware = HARDWARE_DATA.find((h) => h.id === selectedHardwareId) || HARDWARE_DATA[0];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #475569 0%, #334155 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(71, 85, 105, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" }}>
            <Wrench size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>อุปกรณ์ประกอบฮาร์ดแวร์สายส่ง 115 kV</h2>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              รูปจำลองอุปกรณ์ประกอบสายส่ง วิธีการติดตั้งในไซต์งาน เครื่องมือที่ใช้ และข้อกำหนดทางวิศวกรรม กฟภ.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {[
          { id: "ALL", label: "ทั้งหมด (8 ชนิด)" },
          { id: "protection", label: "🛡️ อุปกรณ์ป้องกันสายและลูกถ้วย" },
          { id: "clamp", label: "⚙️ แคล้มป์จับสายและเข้าปลายสาย" },
          { id: "guying", label: "⚓ ระบบยึดโยงเสา" },
          { id: "warning", label: "✈️ อุปกรณ์เตือนภัยอากาศยาน" }
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
              backgroundColor: selectedFilter === f.id ? "#334155" : "#f1f5f9",
              color: selectedFilter === f.id ? "white" : "#475569",
              transition: "all 0.2s"
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Interactive Detail Stage */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left: SVG Diagram Card */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #cbd5e1", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>รูปจำลองอุปกรณ์</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>{activeHardware.name}</h3>
            </div>
            <span style={{ fontSize: "0.75rem", backgroundColor: "#e2e8f0", color: "#334155", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
              {activeHardware.categoryName}
            </span>
          </div>

          {/* SVG Canvas */}
          <div style={{ backgroundColor: "#0f172a", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "360px" }}>
            <HardwareSVG type={activeHardware.svgType} />
          </div>

          <div style={{ padding: "12px 18px", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.85rem", color: "#475569", fontWeight: "bold" }}>
            {activeHardware.englishName}
          </div>
        </div>

        {/* Right: Detailed Guide & Installation Procedures */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "bold", color: "#1e293b", margin: "0 0 4px 0" }}>
                {activeHardware.name}
              </h3>
              <span style={{ fontSize: "0.9rem", color: "#3b82f6", fontWeight: "bold" }}>
                {activeHardware.englishName}
              </span>
            </div>

            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
              <b>หน้าที่การทำงาน:</b> {activeHardware.functionDesc}
            </p>

            {/* Installation Steps */}
            <div style={{ backgroundColor: "#f8fafc", padding: "16px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#1e293b", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} className="text-emerald-600" />
                ขั้นตอนและลักษณะการนำไปติดตั้งในไซต์งาน:
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.9rem", color: "#334155", lineHeight: "1.6" }}>
                {activeHardware.installationGuide.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: "4px" }}>{step}</li>
                ))}
              </ul>
            </div>

            {/* Specs & Tools Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <div style={{ backgroundColor: "#f1f5f9", padding: "12px 14px", borderRadius: "10px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", display: "block" }}>สเปกและวัสดุมาตรฐาน</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#1e293b" }}>{activeHardware.specStandards}</span>
              </div>

              <div style={{ backgroundColor: "#f0fdf4", padding: "12px 14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: "bold", display: "block" }}>เครื่องมือที่ใช้ติดตั้ง</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#166534" }}>{activeHardware.toolsRequired}</span>
              </div>
            </div>

            {/* Caution Alert */}
            <div style={{ padding: "12px 14px", backgroundColor: "#fffbeb", borderRadius: "10px", border: "1px solid #fde68a", fontSize: "0.85rem", color: "#92400e", display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <AlertTriangle size={18} className="flex-shrink-0 text-amber-600" />
              <div>
                <b>ข้อควรระวังสำคัญ:</b> {activeHardware.caution}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Bottom Grid of Hardware Cards to Click */}
      <div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#1e293b", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Layers size={20} className="text-slate-600" />
          เลือกดูอุปกรณ์ฮาร์ดแวร์ตัวอื่นๆ (คลิกเพื่อเปลี่ยนรูปจำลอง):
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "16px" }}>
          {filteredHardware.map((item) => {
            const isSelected = item.id === selectedHardwareId;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedHardwareId(item.id)}
                style={{
                  backgroundColor: "white",
                  borderRadius: "14px",
                  border: isSelected ? "2px solid #334155" : "1px solid #e2e8f0",
                  padding: "16px 18px",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 8px 20px -4px rgba(51, 65, 85, 0.25)" : "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "800", color: isSelected ? "#0f172a" : "#1e293b", fontSize: "1rem" }}>
                      {item.name}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#3b82f6", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                    {item.englishName}
                  </span>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
                    {item.functionDesc.substring(0, 75)}...
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: isSelected ? "#0f172a" : "#94a3b8", fontWeight: "bold", borderTop: "1px dashed #e2e8f0", paddingTop: "10px", marginTop: "12px" }}>
                  <span>{item.categoryName}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>ดูรูปจำลอง <ArrowRight size={12} /></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ─── SVG Vector Diagrams of Hardware Accessories ───────────────────────────

function HardwareSVG({ type }: { type: "arcing_horn" | "suspension_clamp" | "strain_clamp" | "vibration_damper" | "warning_ball" | "armor_rod" | "guy_assembly" | "corona_ring" }) {
  switch (type) {
    case "arcing_horn":
      // Arcing Horn pair with Spark Gap
      return (
        <svg width="280" height="320" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Fitting & Crossarm Mount */}
          <rect x="110" y="20" width="60" height="16" rx="3" fill="#cbd5e1" stroke="#94a3b8" />
          <circle cx="140" cy="28" r="4" fill="#475569" />

          {/* Top Horn Arm */}
          <path d="M 140,28 L 70,40 L 60,115" stroke="#38bdf8" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="115" r="5" fill="#38bdf8" />
          <text x="35" y="75" fill="#38bdf8" fontSize="10" fontWeight="bold">เขาอาร์คบน</text>

          {/* Center Insulator Dummy */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="125" y={45 + i * 36} width="30" height="24" rx="4" fill="#ec4899" fillOpacity="0.4" stroke="#ec4899" strokeDasharray="3 3" />
          ))}

          {/* Bottom Horn Arm */}
          <path d="M 140,240 L 70,225 L 60,185" stroke="#38bdf8" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="185" r="5" fill="#38bdf8" />
          <text x="35" y="220" fill="#38bdf8" fontSize="10" fontWeight="bold">เขาอาร์คล่าง</text>

          {/* Spark Gap Spark Effect */}
          <line x1="60" y1="120" x2="60" y2="180" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
          <path d="M 57,145 L 63,148 L 58,153 L 64,158" stroke="#ef4444" strokeWidth="2" fill="none" />
          <text x="75" y="153" fill="#f59e0b" fontSize="10" fontWeight="bold">ระยะ Gap 80-90 ซม.</text>

          {/* Bottom Clamp */}
          <rect x="115" y="240" width="50" height="20" rx="4" fill="#cbd5e1" stroke="#94a3b8" />
          <line x1="20" y1="250" x2="260" y2="250" stroke="#f59e0b" strokeWidth="4" />

          <text x="140" y="295" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">อาร์คซิ่งฮอร์น (ป้องกัน Flashover ทำลายลูกถ้วย)</text>
        </svg>
      );

    case "suspension_clamp":
      // Suspension Clamp with Armor Rods
      return (
        <svg width="280" height="320" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Socket Eye Link */}
          <rect x="130" y="20" width="20" height="35" rx="4" fill="#94a3b8" stroke="#64748b" />
          <circle cx="140" cy="35" r="5" fill="#334155" />
          <circle cx="140" cy="70" r="8" fill="#cbd5e1" stroke="#64748b" />

          {/* Boat-shaped Clamp Body */}
          <path d="M 70,120 Q 140,140 210,120 L 205,145 Q 140,165 75,145 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
          <rect x="120" y="90" width="40" height="35" rx="3" fill="#94a3b8" />
          
          {/* U-Bolts */}
          <path d="M 110,105 L 110,145 M 170,105 L 170,145" stroke="#475569" strokeWidth="4" />
          <rect x="105" y="145" width="10" height="6" fill="#334155" />
          <rect x="165" y="145" width="10" height="6" fill="#334155" />

          {/* Armor Rods wrapped around conductor */}
          <rect x="30" y="128" width="220" height="14" rx="7" fill="#94a3b8" stroke="#64748b" strokeDasharray="6 3" />
          {/* Conductor through the center */}
          <line x1="10" y1="135" x2="270" y2="135" stroke="#f59e0b" strokeWidth="5" />

          <text x="140" y="195" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">สายตัวนำ 115 kV หุ้มด้วยลวด Armor Rods</text>
          <text x="140" y="295" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">แคล้มป์แขวนสายแบบตัวเรือ (Trunnion Clamp)</text>
        </svg>
      );

    case "strain_clamp":
      // Compression Dead-End with Jumper Terminal Pad
      return (
        <svg width="280" height="320" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Eye / Clevis for Insulator Attachment */}
          <circle cx="45" cy="140" r="18" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
          <circle cx="45" cy="140" r="8" fill="#0f172a" />

          {/* Compression Body (Aluminium Barrel) */}
          <rect x="65" y="128" width="120" height="24" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
          
          {/* Crimping Indentations */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={80 + i * 22} y1="126" x2={80 + i * 22} y2="154" stroke="#475569" strokeWidth="3" />
          ))}

          {/* Jumper Pad (Angled upward/downward) */}
          <polygon points="120,128 150,80 185,80 155,128" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="165" cy="90" r="4" fill="#334155" />
          <circle cx="175" cy="90" r="4" fill="#334155" />
          <text x="195" y="85" fill="#fbbf24" fontSize="9" fontWeight="bold">แป้นต่อสายจัมเปอร์</text>

          {/* High Tension Conductor Outgoing */}
          <line x1="185" y1="140" x2="275" y2="140" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
          
          <text x="140" y="210" fill="#a78bfa" fontSize="10" textAnchor="middle" fontWeight="bold">รอยย้ำไฮดรอลิก (Hexagonal Crimp)</text>
          <text x="140" y="295" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">สเตรนด์แคล้มป์แบบอัดย้ำ (Compression Dead-End)</text>
        </svg>
      );

    case "vibration_damper":
      // Stockbridge Vibration Damper (Dumbbell)
      return (
        <svg width="280" height="320" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Conductor passing horizontally */}
          <line x1="10" y1="80" x2="270" y2="80" stroke="#f59e0b" strokeWidth="6" />
          <text x="140" y="65" fill="#fbbf24" fontSize="10" textAnchor="middle">สายตัวนำ 115 kV</text>

          {/* Damper Clamp attaching to conductor */}
          <rect x="120" y="70" width="40" height="35" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <circle cx="140" cy="95" r="4" fill="#334155" />

          {/* Flexible Messenger Cable */}
          <path d="M 40,150 Q 140,110 240,150" stroke="#94a3b8" strokeWidth="6" fill="none" strokeDasharray="6 2" />

          {/* Left Cast-Iron Weight */}
          <g>
            <rect x="25" y="130" width="35" height="45" rx="6" fill="#475569" stroke="#334155" strokeWidth="2" />
            <rect x="20" y="140" width="10" height="25" rx="3" fill="#64748b" />
            <text x="42" y="195" fill="#94a3b8" fontSize="9" textAnchor="middle">ตุ้มถ่วงซ้าย</text>
          </g>

          {/* Right Cast-Iron Weight */}
          <g>
            <rect x="220" y="130" width="35" height="45" rx="6" fill="#475569" stroke="#334155" strokeWidth="2" />
            <rect x="250" y="140" width="10" height="25" rx="3" fill="#64748b" />
            <text x="238" y="195" fill="#94a3b8" fontSize="9" textAnchor="middle">ตุ้มถ่วงขวา</text>
          </g>

          <text x="140" y="240" fill="#38bdf8" fontSize="10" textAnchor="middle">สลิงอ่อนซับคลื่นสั่นสะเทือน (Aeolian Vibration)</text>
          <text x="140" y="295" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">สต็อกบริดจ์แดมเปอร์ (Stockbridge Damper)</text>
        </svg>
      );

    case "warning_ball":
      // Spherical Warning Marker Ball on Shield Wire
      return (
        <svg width="280" height="320" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shield Wire / OHGW passing through center */}
          <line x1="10" y1="140" x2="270" y2="140" stroke="#38bdf8" strokeWidth="3" />
          <text x="140" y="45" fill="#38bdf8" fontSize="10" textAnchor="middle">สายกราวด์ล่อฟ้า (OHGW 3/8 นิ้ว)</text>

          {/* Spherical Marker 50cm diameter representation */}
          <circle cx="140" cy="140" r="70" fill="#ea580c" stroke="#c2410c" strokeWidth="3" />
          
          {/* White Alternating Stripe */}
          <path d="M 140,70 A 70,70 0 0,1 140,210 A 70,70 0 0,0 140,70" fill="#ffffff" />
          
          {/* Center Clamp Flange */}
          <rect x="135" y="70" width="10" height="140" fill="#475569" fillOpacity="0.4" />
          <circle cx="140" cy="140" r="12" fill="#334155" />
          <circle cx="140" cy="140" r="4" fill="#38bdf8" />

          {/* Drain Hole at bottom */}
          <circle cx="140" cy="205" r="3" fill="#1e293b" />
          <text x="140" y="225" fill="#cbd5e1" fontSize="8" textAnchor="middle">รูระบายน้ำขัง</text>

          <text x="140" y="270" fill="#fed7aa" fontSize="10" textAnchor="middle">เส้นผ่านศูนย์กลาง 50-60 ซม. (ส้ม-ขาว)</text>
          <text x="140" y="295" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">ลูกบอลเตือนแนวสายอากาศยาน (Warning Marker)</text>
        </svg>
      );

    case "armor_rod":
      // Preformed Armor Rods wrapping
      return (
        <svg width="280" height="320" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bare Conductor Core */}
          <line x1="10" y1="140" x2="270" y2="140" stroke="#f59e0b" strokeWidth="8" />

          {/* Armor Rods Helical Wrapping */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const x = 30 + i * 24;
            return (
              <g key={i}>
                <path d={`M ${x},125 Q ${x + 12},140 ${x + 24},155`} stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                <path d={`M ${x + 12},125 Q ${x + 24},140 ${x + 36},155`} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
              </g>
            );
          })}

          {/* Center Clamp Location Indicator */}
          <rect x="110" y="110" width="60" height="60" rx="4" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" />
          <text x="140" y="100" fill="#38bdf8" fontSize="9" textAnchor="middle" fontWeight="bold">ตำแหน่งแคล้มป์แขวน</text>

          <text x="140" y="220" fill="#cbd5e1" fontSize="10" textAnchor="middle">ลวดอลูมิเนียมอัลลอยด์ดัดเกลียวสำเร็จรูป (ยาว 1.5 - 2.0 ม.)</text>
          <text x="140" y="295" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">ลวดปรีฟอร์มพันทับสาย (Preformed Armor Rods)</text>
        </svg>
      );

    case "guy_assembly":
      // Guy Wire Assembly (Thimble, Grip, Egg Insulator, Anchor)
      return (
        <svg width="280" height="320" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pole attachment at top */}
          <rect x="210" y="20" width="30" height="20" rx="3" fill="#94a3b8" />
          <circle cx="225" cy="30" r="5" fill="#475569" />

          {/* Thimble Eye & Top Grip */}
          <ellipse cx="200" cy="50" rx="10" ry="15" fill="none" stroke="#cbd5e1" strokeWidth="3" transform="rotate(-30, 200, 50)" />
          <line x1="200" y1="50" x2="160" y2="100" stroke="#f43f5e" strokeWidth="4" />
          
          {/* Guy Strain Porcelain Insulator (Egg type) */}
          <g>
            <ellipse cx="145" cy="120" rx="16" ry="24" fill="#9a3412" stroke="#7c2d12" strokeWidth="2" transform="rotate(-35, 145, 120)" />
            <circle cx="140" cy="115" r="4" fill="#fed7aa" />
            <circle cx="150" cy="125" r="4" fill="#fed7aa" />
            <text x="180" y="125" fill="#fed7aa" fontSize="9" fontWeight="bold">ลูกถ้วยยึดโยง</text>
          </g>

          {/* Lower Guy Wire */}
          <line x1="130" y1="140" x2="80" y2="210" stroke="#f43f5e" strokeWidth="4" />

          {/* Turnbuckle (เกลียวเร่ง) */}
          <g>
            <rect x="65" y="210" width="30" height="12" rx="2" fill="#cbd5e1" stroke="#64748b" transform="rotate(-40, 80, 216)" />
            <line x1="60" y1="230" x2="40" y2="260" stroke="#475569" strokeWidth="5" />
          </g>

          {/* Ground Anchor Plate */}
          <line x1="10" y1="260" x2="90" y2="260" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
          <polygon points="25,275 55,275 40,290" fill="#64748b" />
          <text x="65" y="280" fill="#10b981" fontSize="9">สมอบกฝังดิน</text>

          <text x="140" y="295" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">ชุดสายยึดโยงและสมอบก (Guy Wire Assembly)</text>
        </svg>
      );

    case "corona_ring":
      // Corona Ring for Composite Insulator
      return (
        <svg width="280" height="320" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Composite Insulator Base */}
          <rect x="135" y="30" width="10" height="150" fill="#64748b" />
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx="140" cy={50 + i * 25} rx="25" ry="6" fill="#ec4899" />
          ))}

          {/* Corona Ring Ellipse */}
          <ellipse cx="140" cy="140" rx="70" ry="16" fill="none" stroke="#f8fafc" strokeWidth="7" />
          <ellipse cx="140" cy="140" rx="70" ry="16" fill="none" stroke="#cbd5e1" strokeWidth="5" />

          {/* Mounting Struts */}
          <line x1="70" y1="140" x2="135" y2="155" stroke="#94a3b8" strokeWidth="3" />
          <line x1="210" y1="140" x2="145" y2="155" stroke="#94a3b8" strokeWidth="3" />

          {/* Bottom Fitting */}
          <rect x="130" y="155" width="20" height="35" rx="3" fill="#94a3b8" stroke="#475569" />
          <line x1="20" y1="190" x2="260" y2="190" stroke="#f59e0b" strokeWidth="5" />

          {/* E-field gradient glow simulation */}
          <circle cx="140" cy="140" r="85" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

          <text x="140" y="240" fill="#cbd5e1" fontSize="10" textAnchor="middle">เกลี่ยความเข้มสนามไฟฟ้า ป้องกัน Corona Discharge</text>
          <text x="140" y="295" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">แหวนโคโรนา (Corona / Grading Ring)</text>
        </svg>
      );

    default:
      return null;
  }
}
