import React, { useState } from "react";
import Image from "next/image";
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

          {/* Image Canvas */}
          <div style={{ backgroundColor: "#f8fafc", padding: "0", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", position: "relative" }}>
            <Image 
              src={`/images/guide/${activeItem.svgType}.jpg`} 
              alt={activeItem.name}
              fill
              style={{ objectFit: "cover" }}
            />
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

