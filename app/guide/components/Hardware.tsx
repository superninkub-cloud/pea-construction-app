import React, { useState } from "react";
import { Wrench, Settings, Shield, AlertTriangle, CheckCircle2, Eye, Layers, ArrowRight, Zap, Radio, Anchor, Disc, Link as LinkIcon, Cpu } from "lucide-react";

interface PEAHardwareItem {
  id: string;
  name: string;
  englishName: string;
  peaCode: string; // 10-digit PEA Material Number
  standardNo: string;
  category: "crossarm_parts" | "guying" | "shield_ground" | "insulator_fittings" | "conductor_acc" | "switches" | "opgw";
  categoryName: string;
  functionDesc: string;
  installationGuide: string[];
  specs: string;
  toolsRequired: string;
  storageType: "ลานกลางแจ้ง" | "คลังในร่ม (โปร่ง/ทึบ)";
  caution: string;
  svgType: string;
}

const PEA_HARDWARE_DATA: PEAHardwareItem[] = [
  // 1. หมวดคอนสายและอุปกรณ์ยึดคอน
  {
    id: "alley_arm",
    name: "คอนเหล็กท้าวแขน 150x75x9 มม. ยาว 3.00 ม.",
    englishName: "Steel Channel, Alley Arm 150x75x9 mm, 3,000 mm Long",
    peaCode: "1000120004",
    standardNo: "มอก. 1227 / PEA Standard",
    category: "crossarm_parts",
    categoryName: "1. หมวดคอนสายและอุปกรณ์ยึดคอน",
    functionDesc: "คอนเหล็กรูปรางน้ำแบบท้าวแขน ใช้รับชุดพวงลูกถ้วยและสายไฟฟ้า สำหรับโครงสร้างเสาแบบ SS-AS-4 และ SD-AS-3 ที่ต้องการความแข็งแรงรับแรงดึงสูงด้านเดียว",
    installationGuide: [
      "ยกคอนขึ้นติดตั้งบนเสา คอร. 22 ม. ที่ตำแหน่งรูเจาะระดับบน/กลาง",
      "ยึดด้วยเหล็กประกับคอนท้าวแขน (Alley Arm Brace 50x50x6 มม.) และสลักเกลียวทะลุเสา M16/M20",
      "ขันน็อตให้แน่นหนาพร้อมใส่แหวนสี่เหลี่ยมแบนและแหวนสปริงกันคลาย"
    ],
    specs: "เหล็กรูปรางน้ำชุบสังกะสีแบบจุ่มร้อน (Hot-Dip Galvanized) ขนาด 150x75x9 มม. ยาว 3,000 มม.",
    toolsRequired: "ประแจแหวน/บล็อก เบอร์ 24, 30 มม., รอกสลิงยกของ (Gin Pole / Winch)",
    storageType: "ลานกลางแจ้ง",
    caution: "ต้องตรวจสอบความตรงของแนวคอนก่อนขันแน่น และระวังการกระแทกที่จะทำให้กัลวาไนซ์กะเทาะ",
    svgType: "alley_arm"
  },
  {
    id: "double_arming_plate",
    name: "แผ่นเหล็กยื่นสองปลาย (Double Arming Plate)",
    englishName: "Plate, Steel, Double Arming 12x100x650 / 760 mm",
    peaCode: "1010030100",
    standardNo: "PEA Standard 115 kV",
    category: "crossarm_parts",
    categoryName: "1. หมวดคอนสายและอุปกรณ์ยึดคอน",
    functionDesc: "ใช้ประกบปลายคอนเหล็กรางน้ำและเหล็กฉาก เพื่อติดตั้งลูกถ้วยแขวนลักษณะเข้าปลายสาย (Dead-End) หรือลูกถ้วยแนวนอนแบบ D-3",
    installationGuide: [
      "สอดแผ่นเหล็กประกบเข้าที่ปลายคอนเหล็กคู่ทั้งสองฝั่ง",
      "ร้อยสลักเกลียวตลอด (Double Arming Bolt M16) ผ่านรูแผ่นเหล็กและคอนสาย",
      "ขันล็อกน็อตคู่ทั้งสองด้านเพื่อรัดคอนคู่ให้ขนานกันอย่างมั่นคง"
    ],
    specs: "แผ่นเหล็กเหนียวชุบสังกะสี หนา 12 มม. กว้าง 100 มม. ยาว 650 หรือ 760 มม. เจาะรูสลัก 4 รู",
    toolsRequired: "ประแจขันสลักเกลียว M16",
    storageType: "ลานกลางแจ้ง",
    caution: "ต้องปรับระยะช่องว่างระหว่างคอนคู่ให้ขนานกันเท่ากันตลอดแนว",
    svgType: "double_arming_plate"
  },

  // 2. หมวดเสาเข็ม และชุดยึดโยง
  {
    id: "preformed_guy_grip",
    name: "ปรีฟอร์มกายกริ๊พ เข้าปลายสายยึดโยง (Guy Grip Dead-End)",
    englishName: "Dead-End, Preformed, Guy Grip for Steel Wire 50-95 mm²",
    peaCode: "1010210404",
    standardNo: "PEA Spec / ASTM A475",
    category: "guying",
    categoryName: "2. หมวดเสาเข็มและชุดยึดโยง",
    functionDesc: "ลวดเหล็กสปริงชุบสังกะสีดัดเกลียวสำเร็จรูป ใช้พันเข้าปลายสายลวดเหล็กตีเกลียวตรึงเสา (Guy Wire) โดยไม่ต้องใช้แคล้มป์ขันน็อต รับแรงดึงได้ 100% ของพิกัดสาย",
    installationGuide: [
      "สอดห่วงกายกริ๊พผ่านร่องห่วงกายทิมเบิล (Guy Thimble) หรือทิมเบิ้ลอายนัท",
      "พันขาเกลียวข้างที่ 1 แนบไปตามแนวสายสลิงเหล็กจนสุดความยาว",
      "พันขาเกลียวข้างที่ 2 ทับไขว้ประสานกันจนสนิทครบทั้งเส้น ไม่ให้ปลายลวดกระดก"
    ],
    specs: "ลวดเหล็กกล้ากัลวาไนซ์แรงดึงสูง เคลือบสารทรายกันลื่น (Grit Compound) ด้านใน รองรับสาย 50 และ 95 ตร.มม.",
    toolsRequired: "ถุงมือหนังสำหรับพันสาย (Hand Application)",
    storageType: "คลังในร่ม (โปร่ง/ทึบ)",
    caution: "ห้ามนำกายกริ๊พที่เคยผ่านการใช้งานหรือแกะออกมาแล้วมาใช้ซ้ำเด็ดขาด เพราะแรงจับยึดจะลดลง",
    svgType: "preformed_guy_grip"
  },
  {
    id: "anchor_rod_double_eye",
    name: "ก้านสมอบกแบบห่วงสองร่อง M24 ยาว 2,500 มม.",
    englishName: "Rod, Anchor, Double Stranded Eye M24, 2,500 mm Long",
    peaCode: "1010210004",
    standardNo: "PEA Standard D-9",
    category: "guying",
    categoryName: "2. หมวดเสาเข็มและชุดยึดโยง",
    functionDesc: "ก้านเหล็กสมอบกหัวห่วงคู่ 2 ร่อง ใช้ฝังยึดในคอนกรีตฐานรากสมอบกใต้ดิน สำหรับผูกยึดสายสลิงโยงเสาขนาด 95 ตร.มม. จำนวน 2 เส้นพร้อมกัน",
    installationGuide: [
      "ฝังท่อนล่างของก้านสมอบกพร้อมแผ่นสมอลงในหลุมคอนกรีตลึก 2.00 - 2.50 ม.",
      "จัดทิศทางก้านสมอบกให้เอียง 45 องศา ชี้ตรงไปยังรูสลักยึดโยงบนเสาไฟฟ้า",
      "เทคอนกรีตหล่อหุ้มฐานรากสมอบกและกลบดินบดอัดแน่นเป็นชั้นๆ"
    ],
    specs: "เหล็กกล้าชุบสังกะสี M24 ยาว 2.50 ม. หัวห่วงหล่อ 2 ร่อง (Double Strand Eye) ทนแรงดึง > 16,000 kgf",
    toolsRequired: "อุปกรณ์ขุดหลุม, ประแจขันปรับเกลียวเร่ง",
    storageType: "ลานกลางแจ้ง",
    caution: "ต้องให้ก้านสมอบกอยู่ในแนวเส้นตรงเดียวกับแนวสายยึดโยง ห้ามให้ก้านงอหรือหักมุม",
    svgType: "anchor_rod"
  },

  // 3. หมวดชุดต่อสายล่อฟ้า และการต่อลงดิน
  {
    id: "exothermic_welding",
    name: "ชุดต่อสายดินแบบเชื่อมหลอมด้วยความร้อน (Exothermic Cadweld)",
    englishName: "Exothermic Welding Kit (Powder, Mold, Handle Clamp, Flint Ignitor)",
    peaCode: "1010220123",
    standardNo: "IEEE 837 / PEA Standard",
    category: "shield_ground",
    categoryName: "3. หมวดชุดต่อสายล่อฟ้าและการต่อลงดิน",
    functionDesc: "กระบวนการหลอมเชื่อมโมเลกุลโลหะทองแดงเข้ากับเหล็กกราวด์เพลทหรือแท่งกราวด์ร็อดอย่างถาวร (Molecular Bonding) ทำให้จุดต่อไม่เกิดออกไซด์และมีความต้านทาน 0 โอห์มตลอดอายุการใช้งาน",
    installationGuide: [
      "ทำความสะอาดผิวโลหะและเป่าไล่ความชื้นด้วยหัวพ่นไฟ",
      "ประกบแม่พิมพ์กราไฟต์ (Graphite Mold) เข้ากับสายไฟและหลักดิน ล็อกด้วยคีมจับ",
      "ใส่แผ่นดิสก์เหล็ก เทผงเชื่อม (Weld Metal) และโรยผงจุดชนวนด้านบน",
      "ใช้ปืนจุดประกายไฟ (Flint Ignitor) จุดชนวน เกิดปฏิกิริยาคายความร้อนหลอมทองแดงเหลวเชื่อมจุดต่อ",
      "รอ 30 วินาที เปิดแม่พิมพ์และทำความสะอาดด้วยแปรงขูด"
    ],
    specs: "ผงเชื่อมทองแดง-อะลูมิเนียมออกไซด์, แม่พิมพ์ทนความร้อนสูง > 2,000°C",
    toolsRequired: "คีมจับแม่พิมพ์ (Handle Clamp), ปืนจุดประกายไฟ, แปรงทำความสะอาด",
    storageType: "คลังในร่ม (โปร่ง/ทึบ)",
    caution: "ผงเชื่อมและแม่พิมพ์ต้องแห้งสนิท ห้ามมีความชื้นเด็ดขาด และผู้ปฏิบัติงานต้องสวมถุงมือและแว่นตากันสะเก็ดไฟ",
    svgType: "exothermic_welding"
  },
  {
    id: "ground_flat_steel",
    name: "สายดินแผ่นเหล็กชุบสังกะสี 30x3.5 มม. ยาว 10 ม. (Ground Strip : GS)",
    englishName: "Ground Conductor, Flat Steel 30x3.5x10,000 mm (GS)",
    peaCode: "1010220010",
    standardNo: "PEA Grounding Spec",
    category: "shield_ground",
    categoryName: "3. หมวดชุดต่อสายล่อฟ้าและการต่อลงดิน",
    functionDesc: "แผ่นเหล็กแบนชุบสังกะสีสำหรับทำระบบต่อลงดินแบบฝังตามแนวนอน (Ground Strip) ขนานแนวสายส่ง สำหรับพื้นที่ดินแข็ง หินปนทราย ที่ตอกกราวด์ร็อดแนวดิ่งไม่ลง",
    installationGuide: [
      "ขุดร่องดินลึก 0.50 - 0.80 ม. ขนานไปตามแนวสายส่งยาว 10 - 20 เมตร",
      "คลี่แผ่นเหล็กแบนวางราบลงในก้นร่อง เชื่อมต่อเข้ากับ Ground Plate จุดที่ 7 ใต้โคนเสา",
      "เชื่อมต่อปลายแผ่นเหล็กด้วยคอนเนคเตอร์ 30 มม. หรือเชื่อม Exothermic",
      "กลบดินและบดอัดให้แน่น วัดค่าความต้านทานดินให้ได้ ≤ 10 โอห์ม"
    ],
    specs: "เหล็กแบนชุบสังกะสีขนาด 30 x 3.5 มม. ยาว 10,000 มม. (10 ม.)",
    toolsRequired: "คอนเนคเตอร์จับแผ่นเหล็ก 30 มม., ประแจขันน็อต",
    storageType: "คลังในร่ม (โปร่ง/ทึบ)",
    caution: "ต้องฝังลึกไม่น้อยกว่า 50 ซม. เพื่อป้องกันการถูกไถทำลายจากการเกษตรหรือเครื่องจักรกล",
    svgType: "ground_flat_steel"
  },

  // 4. หมวดลูกถ้วย และอุปกรณ์ประกอบ
  {
    id: "compression_dead_end_pad",
    name: "แคล้มป์เข้าปลายสายแบบบีบ พร้อมแป้นต่อหางปลา 15° (400 ตร.มม.)",
    englishName: "Dead-End Compression Clamp with 15° NEMA Pad for 400 mm²",
    peaCode: "1020430001",
    standardNo: "มอก. / PEA Spec 115 kV",
    category: "insulator_fittings",
    categoryName: "4. หมวดลูกถ้วยฉนวนและอุปกรณ์ประกอบ",
    functionDesc: "แคล้มป์รับแรงดึงสูงสุดสำหรับสาย AAC 400 และ ACSR 400 ที่เสาเข้าปลายสาย (SS-AS, SS-LA) พร้อมแป้นต่อหางปลาทำมุม 15 องศา สำหรับเชื่อมต่อสายจัมเปอร์ (Jumper)",
    installationGuide: [
      "ปอกฉนวน/รูดสายไฟ ทาจาระบีนำไฟฟ้า (Joint Compound) ด้านในปลอกย้ำ",
      "สอดสายตัวนำเข้าปลอกบีบจนสุดชนสลักระบุระยะ",
      "ใช้หัวย้ำไฮดรอลิกรูป 6 เหลี่ยม (Hexagonal Die) ย้ำเรียงจากด้านในออกด้านนอกตามขีดบอกตำแหน่ง",
      "ขันยึดหางปลาสายจัมเปอร์ 15° เข้ากับแป้น NEMA Pad ด้วยสลัก 4 ตัว"
    ],
    specs: "อลูมิเนียมเกรดเหนียวพิเศษ 99.5% ทนแรงดึงประลัย > 95% RTS (12,000 kgf)",
    toolsRequired: "เครื่องย้ำไฮดรอลิก 60-100 ตัน, ไดส์ย้ำขนาดสาย 400 ตร.มม., แปรงลวดขัดสาย",
    storageType: "คลังในร่ม (โปร่ง/ทึบ)",
    caution: "ห้ามลืมทา Joint Compound เด็ดขาด และต้องวัดขนาดรอยย้ำด้วย Caliper ให้ได้ตามเกณฑ์มาตรฐาน",
    svgType: "compression_dead_end"
  },
  {
    id: "corner_suspension_bracket",
    name: "ที่แขวนลูกถ้วยทางโค้งรูปตัวยู (Corner Suspension Bracket)",
    englishName: "Bracket, Corner Suspension for Angle Line",
    peaCode: "1030140012",
    standardNo: "PEA Standard 115 kV",
    category: "insulator_fittings",
    categoryName: "4. หมวดลูกถ้วยฉนวนและอุปกรณ์ประกอบ",
    functionDesc: "โครงเหล็กรูปตัวยู (U-Bracket) ยึดใต้คอนเหล็ก เพื่อแขวนลูกถ้วยในแนวดิ่งและเพิ่มระยะห่างจากคอนสาย ป้องกันลูกถ้วยแกว่งชนคอนเหล็กในสภาวะสายเลี้ยวโค้ง",
    installationGuide: [
      "ยึดโครงตัวยูด้านบนเข้ากับปีกคอนเหล็กด้วยสลักเกลียว M16",
      "ร้อยสลักห่วงคล้องพวงลูกถ้วยแขวนเข้าที่ส่วนโค้งล่างของตัวยู",
      "ตรวจสอบให้พวงลูกถ้วยสามารถแกว่งตัวได้อย่างอิสระโดยไม่ติดขัดโครงสร้าง"
    ],
    specs: "เหล็กเหนียวดัดขึ้นรูปชุบสังกะสีหนาพิเศษ ทนแรงดึงแนวดิ่งและแนวระนาบ",
    toolsRequired: "ประแจแหวนเบอร์ 24 มม.",
    storageType: "คลังในร่ม (โปร่ง/ทึบ)",
    caution: "ใช้สำหรับเสาที่มีมุมเลี้ยวเล็กน้อยเพื่อรักษาระยะ Clearance จากโครงสร้างเสา",
    svgType: "corner_suspension_bracket"
  },

  // 5. หมวดสายไฟฟ้า และอุปกรณ์ประกอบ
  {
    id: "stockbridge_damper_pea",
    name: "สต็อกบริดจ์แดมเปอร์ แบบดัมเบล สำหรับสาย 400 ตร.มม.",
    englishName: "Vibration Damper, Stockbridge Type for 400 mm² Conductor",
    peaCode: "1020200104",
    standardNo: "IEC 61897 / PEA Standard",
    category: "conductor_acc",
    categoryName: "5. หมวดสายไฟฟ้าและอุปกรณ์ประกอบ",
    functionDesc: "ตุ้มถ่วงซับแรงสั่นสะเทือนความถี่สูง (Aeolian Vibration) ที่เกิดจากลมพัดผ่านสายไฟ ช่วยป้องกันสายไฟล้าและขาดชำรุดตรงจุดจับยึดแคล้มป์",
    installationGuide: [
      "ติดตั้งบนสายไฟฟ้าห่างจากปากแคล้มป์แขวนตามระยะตารางมาตรฐาน (0.80 - 1.20 ม.)",
      "วางแคล้มป์อลูมิเนียมประกบสายไฟ ขันสลักเกลียวด้วยประแจปอนด์แรงบิด 25 N.m",
      "ตรวจสอบให้ตุ้มถ่วงทั้ง 2 ข้างขนานกับแนวสายไฟในแนวดิ่งอย่างสมดุล"
    ],
    specs: "ลูกตุ้มเหล็กหล่อกัลวาไนซ์ 2 ขนาดต่างกันเล็กน้อยเพื่อซับหลายย่านความถี่, สลิงสแตนเลส 19 เส้น",
    toolsRequired: "ตลับเมตรวัดระยะ, ประแจปอนด์ (Torque Wrench)",
    storageType: "คลังในร่ม (โปร่ง/ทึบ)",
    caution: "ระยะติดตั้งจากขอบแคล้มป์มีความสำคัญมาก หากติดผิดระยะจะทำให้การซับแรงสั่นสะเทือนไม่ได้ผล",
    svgType: "stockbridge_damper"
  },
  {
    id: "preformed_armor_grip_suspension",
    name: "ชุดปรีฟอร์มอาร์เมอร์กริพ (AGS Armor-Grip Suspension 400 ตร.มม.)",
    englishName: "Suspension, Armor-Grip Preformed (AGS) for 400 mm² Al Conductor",
    peaCode: "1020230001",
    standardNo: "PEA Standard D-2(AGS), D-12(AGS)",
    category: "conductor_acc",
    categoryName: "5. หมวดสายไฟฟ้าและอุปกรณ์ประกอบ",
    functionDesc: "ชุดแขวนสายไฟฟ้ารุ่นใหม่ที่ใช้ปลอกยางนีโอพรีน (Neoprene Cushion Insert) รองรับสายไฟ ร่วมกับลวดปรีฟอร์ม ช่วยลดความเค้นดัด (Bending Stress) ได้ดีกว่าแคล้มป์โลหะแบบเดิม 50%",
    installationGuide: [
      "ประกบปลอกยางนีโอพรีนรอบสายไฟตรงจุดกึ่งกลางการแขวน",
      "พันลวดปรีฟอร์มอะลูมิเนียมรอบปลอกยางและสายไฟจนแน่นสนิท",
      "สวมโครงเสื้ออลูมิเนียมหล่อ (Aluminium Housing) ครอบกึ่งกลางลวดปรีฟอร์มและร้อยสลักยึดกับลูกถ้วย"
    ],
    specs: "ยางสังเคราะห์ทนโอโซน + ลวดอลูมิเนียมอัลลอยด์ดัดเกลียวสำเร็จรูป + โครงเสื้ออลูมิเนียมหล่อ",
    toolsRequired: "ประแจขันสลักเกลียวแขวน",
    storageType: "คลังในร่ม (โปร่ง/ทึบ)",
    caution: "ใช้สำหรับงานก่อสร้างสายส่ง 115 kV มาตรฐานใหม่ และงานปรับปรุงแทนแคล้มป์แขวนเดิม",
    svgType: "armor_grip_suspension"
  },

  // 6. หมวดอุปกรณ์ป้องกัน และสวิตช์ 115 kV
  {
    id: "air_break_switch_115kv",
    name: "แอร์เบรกสวิตช์ 3 ขา 115 kV เปิดแนวนอน (1,200 A / 61 kA)",
    englishName: "Switch, Air Break, Triple Pole, 115 kV, Horizontal Opening with Mounting",
    peaCode: "1040060200",
    standardNo: "IEC 62271-102 / PEA Spec",
    category: "switches",
    categoryName: "6. หมวดอุปกรณ์ป้องกันและสวิตช์ 115 kV",
    functionDesc: "สวิตช์ตัดตอนใบมีด 3 เฟส สำหรับตัด-ต่อวงจรสายส่ง 115 kV ในสภาวะไม่มีโหลด (No-Load Disconnecting Switch) เพื่อแบ่งตอนบำรุงรักษาหรือสลับวงจรจ่ายไฟอย่างปลอดภัย",
    installationGuide: [
      "ยกโครงสร้างฐานเหล็กรองรับสวิตช์ขึ้นติดตั้งบนเสา คอร. 22 ม. คู่ หรือเสาโครงเหล็ก",
      "ติดตั้งใบมีด ขั้วสัมผัส และลูกถ้วยโพสท์ 3 เสาต่อเฟส ให้ได้ระนาบแนวระดับ",
      "ต่อก้านคันโยกควบคุมกลไกสั่งการลงสู่ระดับพื้นดิน พร้อมระบบล็อกกุญแจ (Padlock)",
      "ต่อสายกราวด์โครงสร้างและด้ามจับคันโยกเข้ากับ Ground Grid อย่างหนาแน่น"
    ],
    specs: "แรงดันพิกัด 115 kV, กระแสต่อเนื่อง 1,200 A, ทนกระแสลัดวงจร 61 kA Peak / 25 kA 3 sec",
    toolsRequired: "รอกเครนยกโครงสร้าง, เครื่องวัดความต้านทานหน้าสัมผัส (Micro-ohmmeter / Contact Resistance)",
    storageType: "ลานกลางแจ้ง",
    caution: "ห้ามปลด-สับสวิตช์ขณะมีกระแสโหลดไหลเด็ดขาด (เว้นแต่ติดตั้งชุดตัดโหลด Load Break Attachment)",
    svgType: "air_break_switch"
  },

  // 7. หมวดสาย OPGW และอุปกรณ์ประกอบ
  {
    id: "opgw_joint_box",
    name: "กล่องต่อสายใยแก้ว OPGW Joint Box (แบบ 2 ทาง และ 3 ทาง)",
    englishName: "OPGW Joint Box / Dome Enclosure (2-Way & 3-Way) with Mounting Bracket",
    peaCode: "1010060026",
    standardNo: "PEA Telecommunication Spec",
    category: "opgw",
    categoryName: "7. หมวดสาย OPGW และอุปกรณ์ประกอบ",
    functionDesc: "กล่องต่อเชื่อมคู่สายใยแก้วนำแสง (Fusion Splice) ชนิดกันน้ำและทนทานสภาพอากาศ ติดตั้งบนเสาไฟฟ้าที่ระดับความสูง 4.00 - 6.00 ม. จากพื้นดิน",
    installationGuide: [
      "ติดตั้งชุดรองรับกล่อง (Support Bracket) และชุดม้วนสาย (Coil Bracket) บนลำต้นเสา",
      "นำปลายสาย OPGW จากยอดเสาเดินท่อร้อยสายลงมาขดพักบนโครงม้วนสายอย่างน้อย 15-20 เมตร",
      "ทำการสไปลซ์เชื่อมต่อสายใยแก้ว (Fusion Splice) 24 Cores ภายในถาดพักสายในกล่อง",
      "ปิดฝาครอบโดม ขันแหวนซีลกันน้ำกันความชื้น IP68 ให้แน่นหนา"
    ],
    specs: "โลหะอลูมิเนียมอัลลอยด์หล่อ หรือสแตนเลสกันสนิม ทนแรงกระแทก IK10 ป้องกันน้ำระดับ IP68",
    toolsRequired: "เครื่องสไปลซ์สายใยแก้ว (Fiber Fusion Splicer), เครื่องตรวจวัด OTDR, ชุดประแจยึดแร็ค",
    storageType: "คลังในร่ม (โปร่ง/ทึบ)",
    caution: "ระวังรัศมีการดัดโค้งของสายไฟเบอร์ออปติก (Bending Radius) ต้องไม่น้อยกว่า 20 เท่าของเส้นผ่านศูนย์กลางสาย",
    svgType: "opgw_joint_box"
  },
  {
    id: "insulator_d1",
    name: "ชุดลูกถ้วยแขวนแนวดิ่ง 115 kV (พวง D-1 / D-11)",
    englishName: "Vertical Suspension Insulator Assembly (D-1/D-11)",
    peaCode: "1030010001",
    standardNo: "PEA Standard 115 kV",
    category: "insulator_fittings",
    categoryName: "4. หมวดลูกถ้วยฉนวนและอุปกรณ์ประกอบ",
    functionDesc: "ชุดพวงลูกถ้วยแขวน (Suspension String) จำนวน 7-8 ลูก ห้อยในแนวดิ่งอิสระ สำหรับเสาทางตรง (Tangent Pole 0°-2°) หรือคอนท้าวแขน (Alley Arm) เพื่อรองรับน้ำหนักและเป็นฉนวนสาย 115 kV",
    installationGuide: [
      "ประกอบ Ball-Eye หรือ Socket-Clevis เข้าที่ก้านลูกถ้วยลูกแรกเพื่อยึดกับคอนเหล็ก",
      "ประกอบลูกถ้วยแบบ Socket & Ball เรียงต่อกัน 7-8 ลูก พร้อมใส่ Cotter Pin ล็อกกันหลุด",
      "ปลายพวงลูกถ้วยประกอบ Socket-Eye และ Suspension Clamp หรือ AGS สำหรับจับสายตัวนำ"
    ],
    specs: "ลูกถ้วยพอร์ซเลนเคลือบสีน้ำตาล (Brown Glaze) ขนาด 254x146 มม. (10 นิ้ว) พิกัดแรงดึง (M&E) > 120 kN / 27,000 lbs",
    toolsRequired: "รอกสลิงยกพวงลูกถ้วย (Hand Winch), คีมบีบ Cotter Pin",
    storageType: "ลานกลางแจ้ง",
    caution: "ห้ามโยนหรือกระแทกลูกถ้วยขณะขนย้าย และต้องตรวจสอบรอยบิ่น/ร้าว ก่อนนำขึ้นติดตั้งบนยอดเสา",
    svgType: "insulator_d1"
  },
  {
    id: "insulator_d3",
    name: "ชุดลูกถ้วยเข้าปลายสาย 115 kV (พวง D-3 / D-13)",
    englishName: "Dead-End Tension Insulator Assembly (D-3/D-13)",
    peaCode: "1030010003",
    standardNo: "PEA Standard 115 kV",
    category: "insulator_fittings",
    categoryName: "4. หมวดลูกถ้วยฉนวนและอุปกรณ์ประกอบ",
    functionDesc: "ชุดพวงลูกถ้วยรับแรงดึงแนวนอน (Tension String) จำนวน 7-8 ลูก สำหรับเสาดึงตรึงสาย (Anchor/Section) หรือเสาหัวมุม (Large Angle) รับแรงดึงสูงมาก",
    installationGuide: [
      "ใช้เหล็กยื่นสองปลาย (Double Arming Plate) ยึดก้าน Strain Clevis เข้ากับคอนเหล็กคู่",
      "ประกอบลูกถ้วยแรงดึงสูงต่อเรียงกันในแนวนอน",
      "ประกอบเข้ากับแคล้มป์เข้าปลายสายแบบบีบ (Compression Dead-End Clamp) ย้ำติดสายตัวนำ"
    ],
    specs: "ลูกถ้วยพอร์ซเลน ทนแรงดึงประลัย (M&E) > 160 kN / 36,000 lbs (ขนาดสาย 400 ตร.มม.)",
    toolsRequired: "รอกดึงสาย (Come-along), เครื่องบีบไฮดรอลิกย้ำปลายสาย",
    storageType: "ลานกลางแจ้ง",
    caution: "ห้ามใช้ลูกถ้วยแบบแขวนแนวดิ่ง (D-1) มาประกอบเป็นพวงแนวนอนรับแรงดึง (D-3) เด็ดขาด เนื่องจากพิกัดรับแรงกลต่างกัน",
    svgType: "insulator_d3"
  },
  {
    id: "line_post_insulator",
    name: "ลูกถ้วยโพสท์ 115 kV แนวนอน (Horizontal Line Post)",
    englishName: "Line Post Insulator, Horizontal Mounting 115 kV",
    peaCode: "1030040012",
    standardNo: "ANSI C29.7 / PEA Standard",
    category: "insulator_fittings",
    categoryName: "4. หมวดลูกถ้วยฉนวนและอุปกรณ์ประกอบ",
    functionDesc: "ลูกถ้วยฉนวนชนิดก้านทึบ (Solid Core) ติดตั้งยื่นแนวนอนออกจากต้นเสา ใช้สำหรับประคองสายจัมเปอร์ (Jumper) ที่เสาเข้าปลายสายและเสาหัวมุม (SS-LA, DD-LA) เพื่อรักษาระยะ Clearance",
    installationGuide: [
      "ยึดฐานหน้าแปลนของลูกถ้วย (Gain Base) เข้ากับรูน็อตที่เจาะบนเสา คอร. 22 ม.",
      "ปลายลูกถ้วยมีหัวจับสาย (Trunnion Clamp) สำหรับล็อกสายจัมเปอร์",
      "ตรวจสอบการดัดสายจัมเปอร์ไม่ให้ตึงหรือรั้งหัวลูกถ้วยเกินไป"
    ],
    specs: "แกนไฟเบอร์กลาสหุ้มซิลิโคน (Polymer) หรือแกนพอร์ซเลนเคลือบ ทนแรงดัดโค้ง (Cantilever Load) > 6 kN",
    toolsRequired: "ประแจขันสลักเกลียวยึดหน้าแปลนลูกถ้วย",
    storageType: "คลังในร่ม (โปร่ง/ทึบ)",
    caution: "รับน้ำหนักแรงดัดโค้งได้จำกัด ห้ามนำไปใช้รับแรงดึงหรือแขวนสายไฟโดยตรงเด็ดขาด",
    svgType: "line_post"
  },
  {
    id: "pg_clamp",
    name: "แคล้มป์จับสายขนาน (Parallel Groove Clamp / PG Clamp)",
    englishName: "Connector, Parallel Groove Clamp (PG) / T-Clamp",
    peaCode: "1020460010",
    standardNo: "PEA Connector Spec",
    category: "conductor_acc",
    categoryName: "5. หมวดสายไฟฟ้าและอุปกรณ์ประกอบ",
    functionDesc: "แคล้มป์จับสายอะลูมิเนียมประกบกัน 2 เส้นแบบขนาน (ร่องคู่) ใช้สำหรับรวบสายจัมเปอร์ลูป (Jumper Loop) หรือแยกแทปสายไฟ โดยไม่ต้องตัดสายเมน",
    installationGuide: [
      "ขัดผิวสายตัวนำด้วยแปรงลวดสแตนเลส (Wire Brush) ให้สะอาด",
      "ทาครีมกันออกไซด์ (Oxide Inhibitor Compound) ทั้งสายไฟและร่องแคล้มป์",
      "ประกบแคล้มป์รัดสายไฟทั้ง 2 เส้น และขันสลักเกลียวด้วยประแจปอนด์ (Torque Wrench) จนแน่นตามพิกัด"
    ],
    specs: "อลูมิเนียมอัลลอยด์ชนิดแข็ง ทนกระแสสูง สลักเกลียวชุบกัลวาไนซ์พร้อมแหวนสปริง Belleville",
    toolsRequired: "ประแจปอนด์, แปรงขัดลวดสแตนเลส",
    storageType: "คลังในร่ม (โปร่ง/ทึบ)",
    caution: "สลักเกลียวต้องขันให้แน่นตามพิกัด Torque หากหลวมจะเกิดความร้อนสะสมจนสายไหม้ขาด (Hot Spot)",
    svgType: "pg_clamp"
  }
];

export default function Hardware() {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>("compression_dead_end_pad");

  const filteredHardware = selectedFilter === "ALL"
    ? PEA_HARDWARE_DATA
    : PEA_HARDWARE_DATA.filter((h) => h.category === selectedFilter);

  const activeItem = PEA_HARDWARE_DATA.find((h) => h.id === selectedHardwareId) || PEA_HARDWARE_DATA[0];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(30, 41, 59, 0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.15)", padding: "10px", borderRadius: "12px" }}>
            <Wrench size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>คู่มืออุปกรณ์และฮาร์ดแวร์ก่อสร้างสายส่ง 115 kV (ฉบับปรับปรุง 2562)</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              รูปจำลองอุปกรณ์ รหัสพัสดุ กฟภ. 10 หลัก ขั้นตอนการประกอบใช้งาน และการจัดเก็บพัสดุคลัง
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {[
          { id: "ALL", label: "ทั้งหมด" },
          { id: "crossarm_parts", label: "1. คอนสายและยึดคอน" },
          { id: "guying", label: "2. เสาเข็มและยึดโยง" },
          { id: "shield_ground", label: "3. สายล่อฟ้าและกราวด์" },
          { id: "insulator_fittings", label: "4. ลูกถ้วยและข้อต่อ" },
          { id: "conductor_acc", label: "5. สายไฟและอุปกรณ์" },
          { id: "switches", label: "6. สวิตช์ 115 kV" },
          { id: "opgw", label: "7. สาย OPGW" }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "bold",
              backgroundColor: selectedFilter === f.id ? "#0f172a" : "#f1f5f9",
              color: selectedFilter === f.id ? "white" : "#475569",
              transition: "all 0.2s"
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Interactive Detail Stage */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "24px", alignItems: "start" }}>
        
        {/* Left: Realistic Vector Diagram Card */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #cbd5e1", boxShadow: "0 6px 18px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>รูปจำลองทางวิศวกรรม</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#0f172a", margin: 0 }}>{activeItem.name}</h3>
            </div>
            <span style={{ fontSize: "0.8rem", backgroundColor: "#e2e8f0", color: "#334155", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold" }}>
              {activeItem.categoryName.split(".")[0]}
            </span>
          </div>

          {/* SVG Canvas */}
          <div style={{ backgroundColor: "#090d16", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "380px" }}>
            <RealisticHardwareSVG type={activeItem.svgType} />
          </div>

          {/* Material Code Footer */}
          <div style={{ padding: "12px 18px", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
            <span style={{ color: "#64748b" }}>รหัสพัสดุ กฟภ. (Material No.):</span>
            <span style={{ fontWeight: "800", color: "#dc2626", fontSize: "1rem", letterSpacing: "0.5px" }}>{activeItem.peaCode}</span>
          </div>
        </div>

        {/* Right: Detailed Specification & Assembly Guide */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ fontSize: "1.35rem", fontWeight: "bold", color: "#0f172a", margin: "0 0 4px 0" }}>
                  {activeItem.name}
                </h3>
                <span style={{ fontSize: "0.8rem", backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                  {activeItem.standardNo}
                </span>
              </div>
              <span style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: "bold" }}>
                {activeItem.englishName}
              </span>
            </div>

            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
              <b>ลักษณะการใช้งาน:</b> {activeItem.functionDesc}
            </p>

            {/* Installation Steps */}
            <div style={{ backgroundColor: "#f8fafc", padding: "16px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} className="text-emerald-600" />
                การประกอบใช้งานในไซต์งาน:
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.9rem", color: "#334155", lineHeight: "1.6" }}>
                {activeItem.installationGuide.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: "4px" }}>{step}</li>
                ))}
              </ul>
            </div>

            {/* Spec & Storage Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <div style={{ backgroundColor: "#f1f5f9", padding: "12px 14px", borderRadius: "10px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", display: "block" }}>สเปกและมิติทางวิศวกรรม</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#0f172a" }}>{activeItem.specs}</span>
              </div>

              <div style={{ backgroundColor: "#f0fdf4", padding: "12px 14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: "bold", display: "block" }}>เครื่องมือช่างที่ใช้ติดตั้ง</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#166534" }}>{activeItem.toolsRequired}</span>
              </div>

              <div style={{ backgroundColor: "#fef3c7", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fde68a" }}>
                <span style={{ fontSize: "0.75rem", color: "#92400e", fontWeight: "bold", display: "block" }}>การจัดเก็บพัสดุในคลัง (Storage)</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#b45309" }}>{activeItem.storageType}</span>
              </div>
            </div>

            {/* Caution Alert */}
            <div style={{ padding: "12px 14px", backgroundColor: "#fffbeb", borderRadius: "10px", border: "1px solid #fde68a", fontSize: "0.85rem", color: "#92400e", display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <AlertTriangle size={18} className="flex-shrink-0 text-amber-600" />
              <div>
                <b>ข้อควรระวังสำคัญ:</b> {activeItem.caution}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Bottom Grid of Hardware Cards to Click */}
      <div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#0f172a", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Layers size={20} className="text-slate-600" />
          รายการอุปกรณ์มาตรฐาน กฟภ. (คลิกเพื่อดูรูปจำลองและรหัสพัสดุ):
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "16px" }}>
          {filteredHardware.map((item) => {
            const isSelected = item.id === selectedHardwareId;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedHardwareId(item.id)}
                style={{
                  backgroundColor: "white",
                  borderRadius: "14px",
                  border: isSelected ? "2px solid #0f172a" : "1px solid #e2e8f0",
                  padding: "16px 18px",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 8px 20px -4px rgba(15, 23, 42, 0.3)" : "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "800", color: isSelected ? "#0f172a" : "#1e293b", fontSize: "0.95rem" }}>
                      {item.name}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#dc2626", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                    รหัสพัสดุ: {item.peaCode}
                  </span>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
                    {item.functionDesc.substring(0, 80)}...
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: isSelected ? "#0f172a" : "#94a3b8", fontWeight: "bold", borderTop: "1px dashed #e2e8f0", paddingTop: "10px", marginTop: "12px" }}>
                  <span>{item.categoryName.split(".")[1]}</span>
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

// ─── High-Realism Vector SVG Illustrations ─────────────────────────────────

function RealisticHardwareSVG({ type }: { type: string }) {
  switch (type) {
    case "alley_arm":
      // Alley Arm Crossarm 3m with Brace & Insulator assembly
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Concrete Pole on Left */}
          <polygon points="40,20 80,20 90,320 30,320" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <line x1="60" y1="20" x2="60" y2="320" stroke="#cbd5e1" strokeDasharray="6 4" />

          {/* Main Alley Arm Channel (150x75x9 mm) sticking out to the right */}
          <rect x="75" y="100" width="220" height="24" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
          <line x1="75" y1="104" x2="295" y2="104" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="75" y1="120" x2="295" y2="120" stroke="#475569" strokeWidth="2" />

          {/* Through Bolts at Pole */}
          <circle cx="65" cy="112" r="6" fill="#334155" />
          <circle cx="65" cy="200" r="6" fill="#334155" />

          {/* Diagonal Brace (Angle Steel 50x50x6 mm) */}
          <polygon points="75,200 240,124 245,124 80,206" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <circle cx="235" cy="120" r="4" fill="#334155" />

          {/* Vertical Suspension Insulator String hanging at end */}
          <g>
            <rect x="250" y="124" width="12" height="18" fill="#94a3b8" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x="252" y={142 + i * 22} width="8" height="6" fill="#475569" />
                <path d={`M 230,${150 + i * 22} Q 256,${144 + i * 22} 282,${150 + i * 22} L 278,${156 + i * 22} Q 256,${150 + i * 22} 234,${156 + i * 22} Z`} fill="#9a3412" stroke="#7c2d12" />
              </g>
            ))}
            {/* Clamp & Conductor */}
            <rect x="245" y="258" width="22" height="12" rx="2" fill="#cbd5e1" />
            <line x1="180" y1="264" x2="315" y2="264" stroke="#f59e0b" strokeWidth="4" />
          </g>

          <text x="180" y="90" fill="#38bdf8" fontSize="10" fontWeight="bold">คอนเหล็กท้าวแขน 150x75x9 มม. (ยาว 3 ม.)</text>
          <text x="160" y="320" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">โครงสร้างคอนท้าวแขน SS-AS-4 / SD-AS-3</text>
        </svg>
      );

    case "double_arming_plate":
      // Double Arming Plate 12x100x650 mm with bolts
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Crossarms (Twin Channels) */}
          <rect x="60" y="80" width="200" height="40" rx="3" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <rect x="60" y="160" width="200" height="40" rx="3" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <text x="160" y="105" fill="#cbd5e1" fontSize="10" textAnchor="middle">คอนเหล็กรางน้ำ ตัวที่ 1</text>
          <text x="160" y="185" fill="#cbd5e1" fontSize="10" textAnchor="middle">คอนเหล็กรางน้ำ ตัวที่ 2</text>

          {/* Double Arming Plate (Metallic Gradient) */}
          <rect x="135" y="40" width="50" height="200" rx="8" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <line x1="140" y1="45" x2="140" y2="235" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
          
          {/* Bolt Holes & Double Arming Bolts */}
          <g>
            <circle cx="160" cy="65" r="10" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="160" cy="100" r="10" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="160" cy="180" r="10" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="160" cy="215" r="10" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
          </g>

          {/* Horizontal Dead-End Eye attached */}
          <circle cx="160" cy="255" r="16" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
          <circle cx="160" cy="255" r="7" fill="#090d16" />
          <line x1="160" y1="235" x2="160" y2="245" stroke="#475569" strokeWidth="6" />

          <text x="160" y="30" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">แผ่นเหล็กหนา 12 มม. กว้าง 100 มม.</text>
          <text x="160" y="305" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">แผ่นเหล็กยื่นสองปลาย (Double Arming Plate 1010030100)</text>
        </svg>
      );

    case "preformed_guy_grip":
      // Preformed Guy Grip Dead-End helically looped through Thimble
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Thimble Eye Metal Spool */}
          <ellipse cx="80" cy="150" rx="25" ry="38" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
          <ellipse cx="80" cy="150" rx="14" ry="22" fill="#090d16" />

          {/* Loop of Guy Grip looping around thimble */}
          <path d="M 80,112 Q 130,115 160,135 L 300,135" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 80,188 Q 130,185 160,165 L 300,165" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Core Steel Stranded Wire in Center */}
          <line x1="130" y1="150" x2="310" y2="150" stroke="#f43f5e" strokeWidth="8" />

          {/* Helical wrapping pattern of Guy Grip over the core wire */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const x = 160 + i * 20;
            return (
              <g key={i}>
                <path d={`M ${x},138 L ${x + 14},162`} stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                <path d={`M ${x + 7},162 L ${x + 21},138`} stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
              </g>
            );
          })}

          {/* Color Code Identification Mark */}
          <rect x="150" y="142" width="10" height="16" fill="#f59e0b" rx="2" />
          <text x="155" y="125" fill="#f59e0b" fontSize="9" textAnchor="middle">แถบสีระบุขนาด</text>

          <text x="80" y="70" fill="#cbd5e1" fontSize="10" textAnchor="middle">ห่วงกายทิมเบิล</text>
          <text x="240" y="125" fill="#38bdf8" fontSize="10">ลวดพันเกลียวกายกริ๊พ</text>
          <text x="240" y="185" fill="#f43f5e" fontSize="10">ลวดสลิงเหล็ก 95 mm²</text>

          <text x="160" y="305" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">ปรีฟอร์มกายกริ๊พ (Preformed Guy Grip 1010210404)</text>
        </svg>
      );

    case "anchor_rod":
      // Anchor Rod Double Eye M24 x 2500 mm with buried concrete
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ground Line */}
          <line x1="20" y1="110" x2="300" y2="110" stroke="#10b981" strokeWidth="2" strokeDasharray="6 3" />
          <text x="40" y="100" fill="#10b981" fontSize="10" fontWeight="bold">ระดับผิวดิน (Ground Level)</text>

          {/* Concrete Anchor Block Underground */}
          <polygon points="120,220 260,220 240,280 100,280" fill="#475569" stroke="#334155" strokeWidth="2" />
          <text x="175" y="255" fill="#cbd5e1" fontSize="10" textAnchor="middle">คอนกรีตฐานสมอบก</text>

          {/* Heavy M24 Steel Rod running diagonally 45 deg */}
          <line x1="60" y1="50" x2="175" y2="250" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" />
          <line x1="60" y1="50" x2="175" y2="250" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />

          {/* Double Stranded Eye Head at top */}
          <g transform="rotate(-45, 60, 50)">
            <ellipse cx="60" cy="50" rx="22" ry="32" fill="#94a3b8" stroke="#475569" strokeWidth="4" />
            <circle cx="53" cy="50" r="8" fill="#090d16" />
            <circle cx="67" cy="50" r="8" fill="#090d16" />
          </g>

          {/* Guy wires hooking into the 2 eye loops */}
          <line x1="45" y1="35" x2="10" y2="0" stroke="#f43f5e" strokeWidth="4" />
          <line x1="65" y1="20" x2="30" y2="-15" stroke="#f43f5e" strokeWidth="4" />
          <text x="95" y="30" fill="#f43f5e" fontSize="9" fontWeight="bold">สลิงยึดโยง 2 เส้น</text>

          {/* Bottom Anchor Plate & Nut inside concrete */}
          <rect x="155" y="240" width="40" height="14" fill="#334155" rx="2" />

          <text x="160" y="315" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">ก้านสมอบกหัวห่วง 2 ร่อง M24 x 2.50 ม. (1010210004)</text>
        </svg>
      );

    case "exothermic_welding":
      // Exothermic Welding Graphite Mold & Spark Reaction
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Steel Ground Plate Base */}
          <rect x="40" y="230" width="240" height="24" rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <text x="160" y="246" fill="#1e293b" fontSize="10" textAnchor="middle" fontWeight="bold">แผ่นกราวด์เพลท (Ground Plate โคนเสา)</text>

          {/* Bare Copper Cable coming in */}
          <line x1="20" y1="210" x2="160" y2="230" stroke="#ea580c" strokeWidth="10" strokeLinecap="round" />
          <text x="60" y="195" fill="#ea580c" fontSize="10" fontWeight="bold">สายทองแดง 70 mm²</text>

          {/* Graphite Mold Block */}
          <rect x="110" y="60" width="100" height="170" rx="8" fill="#334155" stroke="#1e293b" strokeWidth="3" />
          <line x1="160" y1="60" x2="160" y2="230" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />

          {/* Crucible Chamber (โพรงเบ้าหลอม) inside mold */}
          <path d="M 125,80 Q 160,70 195,80 L 185,150 Q 160,165 135,150 Z" fill="#b45309" fillOpacity="0.4" />
          
          {/* Molten Copper Weld Metal Glow */}
          <circle cx="160" cy="190" r="16" fill="#f59e0b" />
          <circle cx="160" cy="190" r="8" fill="#fef08a" />

          {/* Reaction Sparks & Smoke */}
          <g>
            <path d="M 160,60 L 155,30 M 160,60 L 175,25 M 160,60 L 165,40" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <circle cx="155" cy="28" r="2" fill="#ef4444" />
            <circle cx="175" cy="22" r="2" fill="#ef4444" />
          </g>

          {/* Mold Handle Clamp */}
          <rect x="85" y="120" width="25" height="40" rx="3" fill="#64748b" />
          <rect x="210" y="120" width="25" height="40" rx="3" fill="#64748b" />

          <text x="160" y="315" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">ชุดเชื่อมหลอมด้วยความร้อน Exothermic Cadweld (1010220123)</text>
        </svg>
      );

    case "ground_flat_steel":
      // Ground Strip Flat Steel 30x3.5 mm in trench
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ground Line */}
          <line x1="20" y1="80" x2="300" y2="80" stroke="#10b981" strokeWidth="2" strokeDasharray="6 3" />
          <text x="40" y="70" fill="#10b981" fontSize="10" fontWeight="bold">ผิวดิน (Ground Line)</text>

          {/* Excavated Trench (ร่องขุดลึก 0.5-0.8 ม.) */}
          <polygon points="50,80 70,220 250,220 270,80" fill="#1e293b" fillOpacity="0.6" stroke="#475569" strokeWidth="2" />
          <line x1="35" y1="80" x2="35" y2="220" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="40" y="155" fill="#38bdf8" fontSize="9">ลึก 0.50-0.80 ม.</text>

          {/* Flat Galvanized Steel Tape 30x3.5 mm */}
          <rect x="60" y="210" width="200" height="12" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
          <line x1="60" y1="214" x2="260" y2="214" stroke="#ffffff" strokeWidth="1.5" />

          {/* Heavy 30mm 2-Bolt Clamp */}
          <rect x="140" y="195" width="40" height="40" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="2" />
          <circle cx="150" cy="205" r="4" fill="#fef08a" />
          <circle cx="170" cy="205" r="4" fill="#fef08a" />
          <circle cx="150" cy="225" r="4" fill="#fef08a" />
          <circle cx="170" cy="225" r="4" fill="#fef08a" />
          <text x="160" y="185" fill="#fed7aa" fontSize="9" textAnchor="middle">คอนเนคเตอร์ 30 มม.</text>

          <text x="160" y="270" fill="#cbd5e1" fontSize="10" textAnchor="middle">แผ่นเหล็กชุบสังกะสี 30x3.5 มม. ยาว 10 ม. (GS)</text>
          <text x="160" y="315" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">สายดินแผ่นเหล็กต่อลงดิน Ground Strip (1010220010)</text>
        </svg>
      );

    case "compression_dead_end":
      // Compression Dead End with 15-degree NEMA Pad
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Eye Fitting on Left for Insulator Link */}
          <circle cx="45" cy="160" r="22" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
          <circle cx="45" cy="160" r="10" fill="#090d16" />

          {/* Aluminium Compression Body */}
          <rect x="65" y="145" width="140" height="30" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
          <line x1="65" y1="150" x2="205" y2="150" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />

          {/* Hexagonal Crimp Marks */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={85 + i * 24} y1="143" x2={85 + i * 24} y2="177" stroke="#334155" strokeWidth="3" />
          ))}

          {/* 15-degree Angled NEMA Terminal Pad for Jumper */}
          <polygon points="120,145 155,75 205,75 170,145" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          {/* 4 NEMA Holes */}
          <circle cx="170" cy="90" r="4" fill="#090d16" />
          <circle cx="190" cy="90" r="4" fill="#090d16" />
          <circle cx="160" cy="110" r="4" fill="#090d16" />
          <circle cx="180" cy="110" r="4" fill="#090d16" />
          <text x="210" y="85" fill="#fbbf24" fontSize="9" fontWeight="bold">แป้นหางปลา 15°</text>

          {/* Conductor Line 400 mm² Outgoing */}
          <line x1="205" y1="160" x2="310" y2="160" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
          
          <text x="135" y="210" fill="#38bdf8" fontSize="10" textAnchor="middle">รอยย้ำไฮดรอลิก 6 เหลี่ยม (Hex Crimp)</text>
          <text x="160" y="315" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">แคล้มป์เข้าปลายสายแบบบีบ 400 mm² (1020430001)</text>
        </svg>
      );

    case "stockbridge_damper":
      // Stockbridge Damper
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Conductor */}
          <line x1="20" y1="90" x2="300" y2="90" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
          <text x="160" y="70" fill="#fbbf24" fontSize="10" textAnchor="middle">สายตัวนำ 115 kV (AAC/ACSR 400)</text>

          {/* Central Aluminium Clamp */}
          <rect x="135" y="78" width="50" height="40" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <circle cx="160" cy="105" r="5" fill="#1e293b" />

          {/* Messenger Wire (Curved steel strand) */}
          <path d="M 45,170 Q 160,120 275,170" stroke="#94a3b8" strokeWidth="7" fill="none" strokeDasharray="8 2" />

          {/* Left Asymmetric Cast Iron Bell Weight */}
          <g>
            <rect x="25" y="145" width="45" height="55" rx="8" fill="#475569" stroke="#1e293b" strokeWidth="2" />
            <rect x="20" y="158" width="12" height="30" rx="3" fill="#64748b" />
            <text x="47" y="225" fill="#cbd5e1" fontSize="9" textAnchor="middle">ตุ้มใหญ่ 1.8 กก.</text>
          </g>

          {/* Right Asymmetric Cast Iron Bell Weight */}
          <g>
            <rect x="250" y="150" width="40" height="50" rx="8" fill="#475569" stroke="#1e293b" strokeWidth="2" />
            <rect x="282" y="160" width="12" height="28" rx="3" fill="#64748b" />
            <text x="270" y="225" fill="#cbd5e1" fontSize="9" textAnchor="middle">ตุ้มเล็ก 1.4 กก.</text>
          </g>

          <text x="160" y="260" fill="#38bdf8" fontSize="10" textAnchor="middle">สลิงอ่อนซับแรงสั่นสะเทือนลม (Aeolian Vibration)</text>
          <text x="160" y="315" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">สต็อกบริดจ์แดมเปอร์ 400 mm² (1020200104)</text>
        </svg>
      );

    case "air_break_switch":
      // Air Break Switch 115 kV 3-Pole
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Steel Support Base Frame */}
          <rect x="30" y="220" width="260" height="18" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <rect x="150" y="238" width="20" height="60" fill="#475569" />
          <text x="160" y="280" fill="#cbd5e1" fontSize="9" textAnchor="middle">ก้านโยกสั่งการ</text>

          {/* 3 Post Insulators for Center Phase */}
          <g>
            {/* Left Post */}
            <rect x="60" y="110" width="20" height="110" rx="3" fill="#9a3412" stroke="#7c2d12" />
            {[0, 1, 2, 3].map(i => (
              <ellipse key={i} cx="70" cy={125 + i * 24} rx="18" ry="5" fill="#9a3412" stroke="#7c2d12" />
            ))}
            {/* Center Rotating Post */}
            <rect x="150" y="110" width="20" height="110" rx="3" fill="#9a3412" stroke="#7c2d12" />
            {[0, 1, 2, 3].map(i => (
              <ellipse key={i} cx="160" cy={125 + i * 24} rx="18" ry="5" fill="#9a3412" stroke="#7c2d12" />
            ))}
            {/* Right Post */}
            <rect x="240" y="110" width="20" height="110" rx="3" fill="#9a3412" stroke="#7c2d12" />
            {[0, 1, 2, 3].map(i => (
              <ellipse key={i} cx="250" cy={125 + i * 24} rx="18" ry="5" fill="#9a3412" stroke="#7c2d12" />
            ))}
          </g>

          {/* Main Horizontal Opening Switch Blade (Open state) */}
          <g>
            {/* Left Fixed Contact */}
            <rect x="58" y="95" width="24" height="15" fill="#f59e0b" rx="2" />
            <line x1="20" y1="102" x2="60" y2="102" stroke="#f59e0b" strokeWidth="4" />

            {/* Rotating Blade arm pivoting */}
            <line x1="160" y1="100" x2="90" y2="50" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
            <circle cx="160" cy="100" r="8" fill="#f59e0b" />
            <path d="M 90,50 L 105,45" stroke="#f59e0b" strokeWidth="3" />

            {/* Right Fixed Contact */}
            <rect x="238" y="95" width="24" height="15" fill="#f59e0b" rx="2" />
            <line x1="260" y1="102" x2="300" y2="102" stroke="#f59e0b" strokeWidth="4" />
          </g>

          <text x="160" y="35" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">ใบมีดเปิดตัดตอนขณะไม่มีโหลด (115 kV 1,200 A)</text>
          <text x="160" y="325" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">แอร์เบรกสวิตช์ 115 kV (Air Break Switch 1040060200)</text>
        </svg>
      );

    case "opgw_joint_box":
      // OPGW Joint Box & Fiber Splice Tray Dome
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Concrete Pole Behind */}
          <polygon points="120,20 160,20 165,330 115,330" fill="#334155" />

          {/* Stainless Steel Pole Mounting Bracket & Coil Rack */}
          <rect x="100" y="100" width="120" height="160" rx="4" fill="none" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="160" cy="180" r="50" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 3" />
          <text x="160" y="185" fill="#cbd5e1" fontSize="9" textAnchor="middle">ที่ม้วนสายพัก 20 ม.</text>

          {/* OPGW Joint Box Dome Enclosure */}
          <g>
            <rect x="180" y="80" width="50" height="80" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <path d="M 180,95 Q 205,65 230,95 Z" fill="#38bdf8" />
            {/* Cable gland entry */}
            <rect x="195" y="160" width="20" height="15" fill="#475569" />
          </g>

          {/* Black OPGW Cable routed into dome */}
          <path d="M 140,20 Q 140,100 160,180 Q 200,230 205,175" stroke="#f59e0b" strokeWidth="4" fill="none" />

          <text x="205" y="60" fill="#38bdf8" fontSize="10" fontWeight="bold">กล่องต่อสายโดม IP68</text>
          <text x="160" y="320" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">กล่องต่อสายใยแก้ว OPGW Joint Box (1010060026)</text>
        </svg>
      );

    case "armor_grip_suspension":
      // AGS Armor-Grip Suspension with Neoprene insert
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Hanging Eye Clevis */}
          <circle cx="160" cy="40" r="16" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
          <circle cx="160" cy="40" r="8" fill="#090d16" />
          <line x1="160" y1="56" x2="160" y2="100" stroke="#475569" strokeWidth="8" />

          {/* Neoprene Cushion Insert (ยางสังเคราะห์รองรับสาย) */}
          <rect x="130" y="145" width="60" height="30" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <text x="160" y="164" fill="#38bdf8" fontSize="8" textAnchor="middle">ยาง Neoprene</text>

          {/* Conductor passing horizontally */}
          <line x1="20" y1="160" x2="300" y2="160" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />

          {/* Preformed Aluminium Rods wrapped around cushion */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const x = 50 + i * 24;
            return (
              <path key={i} d={`M ${x},145 Q ${x + 12},160 ${x + 24},175`} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            );
          })}

          {/* Cast Aluminium Clamping Housing Collar */}
          <polygon points="120,100 200,100 185,185 135,185" fill="#94a3b8" fillOpacity="0.8" stroke="#475569" strokeWidth="2" />
          <circle cx="160" cy="120" r="6" fill="#1e293b" />

          <text x="160" y="240" fill="#38bdf8" fontSize="10" textAnchor="middle">ลดความเค้นดัด (Bending Stress) ได้ดีกว่าเดิม 50%</text>
          <text x="160" y="315" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">ชุดปรีฟอร์มอาร์เมอร์กริพ AGS 400 mm² (1020230001)</text>
        </svg>
      );

    case "corner_suspension_bracket":
      // Corner Suspension Bracket
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Steel Crossarm Beam */}
          <rect x="40" y="40" width="240" height="24" rx="3" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <text x="160" y="56" fill="#cbd5e1" fontSize="10" textAnchor="middle">คอนเหล็กรางน้ำ</text>

          {/* Inverted U-shaped Bracket bolted under crossarm */}
          <path d="M 90,64 L 90,110 Q 160,180 230,110 L 230,64" stroke="#cbd5e1" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M 90,64 L 90,110 Q 160,180 230,110 L 230,64" stroke="#94a3b8" strokeWidth="8" fill="none" strokeLinecap="round" />

          {/* Top Flange Mounting Bolts */}
          <circle cx="90" cy="64" r="5" fill="#f59e0b" />
          <circle cx="230" cy="64" r="5" fill="#f59e0b" />

          {/* Center Spool & Shackle for Insulator String */}
          <g>
            <circle cx="160" cy="155" r="12" fill="#334155" stroke="#f59e0b" strokeWidth="2" />
            <rect x="154" y="167" width="12" height="20" fill="#94a3b8" />
            {/* Porcelain Insulator Discs below */}
            {[0, 1, 2].map(i => (
              <path key={i} d={`M 130,${195 + i * 22} Q 160,${188 + i * 22} 190,${195 + i * 22} L 185,${202 + i * 22} Q 160,${195 + i * 22} 135,${202 + i * 22} Z`} fill="#9a3412" stroke="#7c2d12" />
            ))}
          </g>

          <text x="160" y="280" fill="#38bdf8" fontSize="10" textAnchor="middle">เพิ่มระยะห่างจากคอน ป้องกันลูกถ้วยแกว่งชน</text>
          <text x="160" y="315" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">ที่แขวนลูกถ้วยทางโค้งรูปตัวยู (1030140012)</text>
        </svg>
      );

    case "insulator_d1":
      // Vertical Suspension Insulator D-1 String (7 Discs + Suspension Clamp)
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Crossarm Channel Bracket */}
          <rect x="120" y="20" width="80" height="20" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <circle cx="160" cy="30" r="4" fill="#090d16" />

          {/* U-Shackle & Ball Eye connecting to Crossarm */}
          <path d="M 152,40 L 152,55 Q 160,65 168,55 L 168,40" stroke="#cbd5e1" strokeWidth="4" fill="none" />
          <circle cx="160" cy="62" r="5" fill="#94a3b8" />
          
          {/* Suspension String 7-Disc Sequence */}
          <g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const yBase = 70 + i * 26;
              return (
                <g key={i}>
                  {/* Socket Cap (Galvanized Iron) */}
                  <rect x="153" y={yBase} width="14" height="12" rx="2" fill="#94a3b8" />
                  {/* Porcelain Disc (Brown Glaze) */}
                  <path d={`M 115,${yBase+12} Q 160,${yBase+5} 205,${yBase+12} L 195,${yBase+20} Q 160,${yBase+14} 125,${yBase+20} Z`} fill="#9a3412" stroke="#7c2d12" strokeWidth="1.5" />
                  {/* Ball Pin (Galvanized Steel sticking down) */}
                  <rect x="156" y={yBase+20} width="8" height="6" fill="#cbd5e1" />
                </g>
              );
            })}
          </g>

          {/* Socket Clevis at Bottom */}
          <rect x="152" y="252" width="16" height="14" rx="2" fill="#94a3b8" />
          <path d="M 154,266 L 154,280 M 166,266 L 166,280" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="160" cy="278" r="3" fill="#090d16" />

          {/* Suspension Clamp (Aluminum) & Conductor */}
          <rect x="135" y="275" width="50" height="20" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
          <line x1="20" y1="285" x2="300" y2="285" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
          
          <text x="160" y="325" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">พวงลูกถ้วยแขวนแนวดิ่ง 115 kV (D-1 / D-11)</text>
          <text x="240" y="160" fill="#38bdf8" fontSize="10">ลูกถ้วยพอร์ซเลน 7 ลูก</text>
          <text x="235" y="290" fill="#f59e0b" fontSize="10">ACSR 400 mm²</text>
        </svg>
      );

    case "insulator_d3":
      // Dead-End Tension Insulator D-3 String (Horizontal)
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pole & Double Arming Plates */}
          <rect x="10" y="140" width="30" height="60" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <rect x="30" y="150" width="20" height="40" fill="#94a3b8" />
          <circle cx="40" cy="170" r="4" fill="#090d16" />

          {/* Tension String Horizontal Sequence */}
          <g>
            <path d="M 50,165 L 70,165 Q 75,170 70,175 L 50,175" stroke="#cbd5e1" strokeWidth="3" fill="none" />
            <circle cx="75" cy="170" r="5" fill="#94a3b8" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const xBase = 85 + i * 22;
              return (
                <g key={i} transform={`translate(${xBase}, 170) rotate(-90)`}>
                  <rect x="-7" y="0" width="14" height="12" rx="2" fill="#94a3b8" />
                  <path d="M -45,12 Q 0,5 45,12 L 35,20 Q 0,14 -35,20 Z" fill="#9a3412" stroke="#7c2d12" strokeWidth="1.5" />
                  <rect x="-4" y="20" width="8" height="6" fill="#cbd5e1" />
                </g>
              );
            })}
          </g>

          {/* Socket-Eye and Compression Dead-End Clamp */}
          <rect x="238" y="163" width="14" height="14" rx="2" fill="#94a3b8" />
          <path d="M 252,168 L 265,168 M 252,172 L 265,172" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="265" cy="170" r="3" fill="#090d16" />

          {/* Hex Crimp Body of Dead End */}
          <rect x="270" y="162" width="50" height="16" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
          <polygon points="275,162 275,140 295,140 295,162" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <circle cx="285" cy="150" r="4" fill="#090d16" />

          <text x="160" y="230" fill="#38bdf8" fontSize="10" textAnchor="middle">พวงลูกถ้วยแรงดึงแนวนอน 7-8 ลูก (Dead-End Tension)</text>
          <text x="160" y="325" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">ลูกถ้วยเข้าปลายสาย 115 kV (พวง D-3 / D-13)</text>
        </svg>
      );

    case "line_post":
      // Horizontal Line Post Insulator
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Concrete Pole Trunk */}
          <rect x="20" y="60" width="60" height="240" fill="#64748b" stroke="#475569" strokeWidth="2" />
          <line x1="50" y1="60" x2="50" y2="300" stroke="#cbd5e1" strokeDasharray="6 4" />

          {/* Line Post Base & Insulator Body */}
          <rect x="80" y="150" width="15" height="60" rx="3" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
          <circle cx="85" cy="160" r="4" fill="#090d16" />
          <circle cx="85" cy="200" r="4" fill="#090d16" />

          {/* Solid Core Polymer/Porcelain Sheds */}
          <rect x="95" y="172" width="160" height="16" fill="#9a3412" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <ellipse key={i} cx={105 + i * 18} cy="180" rx="6" ry="30" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
          ))}

          {/* Trunnion Clamp at End holding Jumper loop */}
          <rect x="255" y="165" width="25" height="30" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <path d="M 280,180 Q 295,210 260,250 L 230,250" stroke="#f59e0b" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M 280,180 Q 295,150 260,110 L 230,110" stroke="#f59e0b" strokeWidth="8" fill="none" strokeLinecap="round" />

          <text x="175" y="240" fill="#38bdf8" fontSize="10" textAnchor="middle">ป้องกันสายจัมเปอร์แกว่งช็อตเสา</text>
          <text x="160" y="325" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">ลูกถ้วยโพสท์แนวนอน (Line Post Insulator)</text>
        </svg>
      );

    case "pg_clamp":
      // Parallel Groove Clamp joining 2 thick conductors
      return (
        <svg viewBox="0 0 320 340" style={{ width: "100%", height: "auto", maxWidth: "320px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Conductor & Jumper Branching */}
          <line x1="20" y1="120" x2="300" y2="120" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" />
          <path d="M 160,135 Q 160,240 250,260" stroke="#f59e0b" strokeWidth="14" fill="none" strokeLinecap="round" />

          {/* 3-Bolt PG Clamp Body (Aluminum Extruded) */}
          <rect x="110" y="105" width="100" height="45" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <line x1="110" y1="128" x2="210" y2="128" stroke="#64748b" strokeWidth="4" />

          {/* Bolts & Washers */}
          {[0, 1, 2].map(i => (
            <g key={i}>
              <rect x={125 + i * 30} y="95" width="12" height="10" rx="2" fill="#94a3b8" />
              <rect x={123 + i * 30} y="150" width="16" height="5" fill="#64748b" />
              <rect x={126 + i * 30} y="155" width="10" height="8" rx="1" fill="#334155" />
            </g>
          ))}

          {/* Sparkle Clean connection indicator */}
          <circle cx="160" cy="120" r="15" fill="#ffffff" fillOpacity="0.4" />
          <path d="M 160,95 L 160,105 M 160,135 L 160,145 M 140,120 L 150,120 M 170,120 L 180,120" stroke="#fbbf24" strokeWidth="2" />

          <text x="160" y="80" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">สายเมน 115 kV</text>
          <text x="250" y="245" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">สายแยก / จัมเปอร์ลูป</text>
          
          <text x="160" y="195" fill="#38bdf8" fontSize="10" textAnchor="middle">ขันสลักเกลียวด้วยประแจปอนด์</text>
          <text x="160" y="325" fill="#fed7aa" fontSize="11" textAnchor="middle" fontWeight="bold">แคล้มป์จับสายขนาน (PG Clamp / T-Clamp)</text>
        </svg>
      );

    default:
      return null;
  }
}
