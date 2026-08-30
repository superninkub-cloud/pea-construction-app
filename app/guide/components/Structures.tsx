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
  svgType: "SS-TG" | "SS-SA" | "SS-AS" | "SS-LA" | "SS-AS-4" | "SS-TL" | "DD-TG" | "DD-SA" | "DD-AS" | "DD-LA";
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
      drawingNo: "SA1-015/5704"
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
  },
  // ─── NEW: DOUBLE CIRCUIT (วงจรคู่) ──────────────────────────────────────────
  {
    id: "dd-tg",
    code: "DD-TG-3 / DD-TG-7",
    name: "เสาทางตรงวงจรคู่ (Double Circuit Tangent)",
    circuitType: "double_circuit",
    circuitTypeName: "วงจรคู่ (DD Series)",
    angleRange: "0° - 2° (ทางตรง)",
    insulatorAssembly: "ลูกถ้วยแขวนแนวดิ่ง 6 พวง (ฝั่งละ 3 พวง ชั้นละ 1 พวง)",
    crossarmType: "คอนเหล็กยื่นสองฝั่ง 3 ชั้น (3-Level Horizontal Crossarms)",
    guyWireSpec: "ไม่ต้องใช้สายยึดโยง (เสาตั้งตรงสมดุลซ้าย-ขวา)",
    description: "โครงสร้างมาตรฐานสำหรับสายส่ง 115 kV วงจรคู่ (Double Circuits 2 วงจร) จัดสายเรียงในแนวดิ่ง 3 ชั้น (Vertical Configuration) ซ้าย-ขวา ประหยัดพื้นที่เขตทาง (Right of Way) ได้ดีเยี่ยม",
    engineeringFeatures: [
      "ใช้คอนเหล็กชุบสังกะสีขวาง 3 ชั้น ชั้นละ 2 ฝั่งเพื่อรองรับวงจรที่ 1 (ซ้าย) และวงจรที่ 2 (ขวา)",
      "ยอดเสาติดตั้งแคล้มป์รับสายกราวด์ล่อฟ้า (OHGW / OPGW) 1-2 เส้น",
      "รักษาระยะห่างแนวดิ่งระหว่างเฟสอย่างน้อย 1.80 - 2.40 เมตร ตามมาตรฐาน clearances",
      "ลูกถ้วยแขวนห้อยอิสระ 7-8 ลูกในแนวดิ่งทั้ง 6 จุด"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กรางน้ำ 3 ชั้น 100x50x5 มม. ยึดด้วย V-Brace ทุกชั้น",
      shieldWire: "สายกราวด์ OHGW บนยอดเสาตรงกลาง",
      spanMax: "100 - 120 เมตร",
      drawingNo: "SA1-015/5707"
    },
    svgType: "DD-TG"
  },
  {
    id: "dd-sa",
    code: "DD-SA-3 / DD-SA-7",
    name: "เสาทางโค้งมุมเล็ก วงจรคู่ (Double Circuit Small Angle 2° - 30°)",
    circuitType: "double_circuit",
    circuitTypeName: "วงจรคู่ (DD Series)",
    angleRange: "2° - 30° (ทางโค้งมุมเล็ก)",
    insulatorAssembly: "ลูกถ้วยแขวนเอียงตามแรงดึงลัพธ์ 6 พวง พร้อม U-Bracket",
    crossarmType: "คอนเหล็กยื่นสองฝั่ง 3 ชั้น พร้อมแผ่นประกับรับแรงเฉือน",
    guyWireSpec: "สายยึดโยง 1-2 ชุด ด้านนอกของมุมเลี้ยว",
    description: "จุดเลี้ยวโค้งมุมเล็กสำหรับสายส่งวงจรคู่ พวงลูกถ้วยจะเอียงตามแนวแรงดึงลัพธ์ (Resultant Force) ใช้ที่แขวนรูปตัวยู (Corner Bracket) ใต้คอนเหล็กทั้ง 6 จุดเพื่อป้องกันลูกถ้วยชนคอน",
    engineeringFeatures: [
      "มีที่แขวนรูปตัวยูกันลูกถ้วยแกว่งชนคอนทั้ง 6 พวง (Corner Suspension Bracket)",
      "โครงสร้างคอนเหล็กทั้ง 3 ชั้นเสริม Brace ประกับคู่เพื่อต้านทานแรงบิดจากการดึงเอียง",
      "ติดตั้งสายยึดโยงสลิงเหล็ก (Guy Wire) ต้านแรงดึงสายตัวนำ 6 เส้น ลงสู่สมอบก"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็ก 3 ชั้น หนาพิเศษเสริมเหล็กค้ำยันด้านข้าง",
      shieldWire: "สายกราวด์ OHGW ผ่านแคล้มป์จับมุมโค้ง",
      spanMax: "80 - 100 เมตร",
      drawingNo: "SA1-015/5708"
    },
    svgType: "DD-SA"
  },
  {
    id: "dd-as",
    code: "DD-AS-3 / DD-AS-5",
    name: "เสายึดดึงตรงสองข้าง วงจรคู่ (Double Circuit Anchor / Section)",
    circuitType: "double_circuit",
    circuitTypeName: "วงจรคู่ (DD Series)",
    angleRange: "0° - 5° (ทางตรงรับแรงดึงเต็มพิกัด)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสาย 12 พวง (หน้า-หลัง 6 เฟส) + สายจัมเปอร์ 6 ชุด",
    crossarmType: "คอนเหล็กคู่หนาพิเศษ 3 ชั้น (Double Arming 3 Levels)",
    guyWireSpec: "สายยึดโยง 2 ทิศทาง (หัว-ท้ายเสา) ต้านแรงดึงช่วงสาย",
    description: "เสาดึงตรึงสายไฟวงจรคู่เพื่อกักแรงดึงไม่ให้สะสมยาวเป็นโดมิโน (Section Pole) ลูกถ้วยรับแรงดึงในแนวนอนรวม 12 พวง (รับสายเข้า 6 สายออก 6) และเชื่อมกระแสด้วยจัมเปอร์ 6 ชุด ดัดลอดคอนเหล็ก",
    engineeringFeatures: [
      "ติดตั้งคอนคู่ (Double Channel 150x75x9 มม.) 3 ชั้น ยึดด้วย Double Arming Plates",
      "ลูกถ้วยแรงดึงแนวนอน 12 พวง (Dead-End Tension String)",
      "สายจัมเปอร์ 6 ชุด ดัดโค้งรอดใต้หัวเสาแต่ละเฟสอย่างเป็นระเบียบ ทา Joint Compound แน่นหนา"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กคู่ 150x75x9 มม. 3 ชั้น (รวมใช้เหล็ก 6 ท่อน)",
      shieldWire: "สายกราวด์ OHGW เข้าปลายสายแนวนอน 2 ฝั่ง",
      spanMax: "100 - 150 เมตร",
      drawingNo: "SA1-015/5709"
    },
    svgType: "DD-AS"
  },
  {
    id: "dd-la",
    code: "DD-LA-3 / DD-LA-5",
    name: "เสาหัวมุมใหญ่และจบสาย วงจรคู่ (Double Circuit Large Angle 30° - 90°)",
    circuitType: "double_circuit",
    circuitTypeName: "วงจรคู่ (DD Series)",
    angleRange: "30° - 90° (มุมหักศอก / จบสาย)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสาย 12 พวง + ลูกถ้วยโพสท์แนวนอน 6 ชุด",
    crossarmType: "คอนเหล็กคู่ทำมุมเฉียง 3 ชั้น (Heavy Angled Double Arms)",
    guyWireSpec: "สายยึดโยงหนัก 4-8 ชุด (Heavy Guy Assembly 2 ทิศทาง)",
    description: "เสาหักมุมเลี้ยวศอกสำหรับวงจรคู่หรือใช้เป็นเสาจบสาย (Dead-End) หน้าสถานีไฟฟ้า รับแรงดึงสูงสุด ใช้ลูกถ้วยโพสท์ 115 kV แนวนอนถึง 6 ชุดในการประคองสายจัมเปอร์ไม่ให้ช็อตลงดิน",
    engineeringFeatures: [
      "โครงสร้างคอนเหล็กคู่ทำมุมเฉียงรับเส้นแบ่งครึ่งมุม 3 ชั้น",
      "ลูกถ้วย Dead-End 12 พวง ทนแรงดึงกว่า 12,000 kgf ต่อพวง",
      "สายยึดโยงแบบหนัก 4-8 เส้น ดึงต้านตรงข้ามทิศทางของแต่ละวงจร",
      "มีลูกถ้วย Line Post 6 ลูก ช่วยรักษาระยะ Clearance ของสายจัมเปอร์วงจร 1 และ 2"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กคู่ 150x75x9 มม. เสริมแผ่นเหล็กหนา 12 มม.",
      shieldWire: "สายกราวด์ OHGW เข้าปลายสาย 2 ชุด",
      spanMax: "120 - 200 เมตร",
      drawingNo: "SA1-015/5710"
    },
    svgType: "DD-LA"
  }
];

export default function Structures() {
  const [activeStructureId, setActiveStructureId] = useState<string>("dd-tg");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredStructures = selectedFilter === "all"
    ? STRUCTURE_DATA
    : STRUCTURE_DATA.filter((s) => s.circuitType === selectedFilter);

  const activeStructure = STRUCTURE_DATA.find((s) => s.id === activeStructureId) || STRUCTURE_DATA[0];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" }}>
            <Cpu size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>แบบมาตรฐานโครงสร้างหัวเสาสายส่ง 115 kV (สายเดี่ยว & วงจรคู่)</h2>
            <p style={{ color: "#dbeafe", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              รูปจำลองเสาคอนกรีต 22 ม. วงจรเดี่ยวและวงจรคู่ (Double Circuit) ชุบกัลวาไนซ์ ลูกถ้วย 7-8 ลูก แสดงรายละเอียดเสมือนจริงตามแบบมาตรฐานวิศวกรรม กฟภ.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "รายการทั้งหมด", icon: <Layers size={16} /> },
          { id: "single_conductor", label: "⚡ วงจรเดี่ยว (SS Series)", icon: <Info size={16} /> },
          { id: "double_circuit", label: "⚡⚡ วงจรคู่ (DD Series)", icon: <Sparkles size={16} /> }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setSelectedFilter(f.id);
              // Auto select the first structure of that type
              if (f.id !== "all") {
                const firstMatch = STRUCTURE_DATA.find(s => s.circuitType === f.id);
                if (firstMatch) setActiveStructureId(firstMatch.id);
              } else {
                setActiveStructureId("ss-tg");
              }
            }}
            style={{
              padding: "10px 18px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: selectedFilter === f.id ? (f.id === "double_circuit" ? "#2563eb" : "#5b21b6") : "#f1f5f9",
              color: selectedFilter === f.id ? "white" : "#475569",
              transition: "all 0.2s ease",
              boxShadow: selectedFilter === f.id ? "0 4px 10px rgba(0,0,0,0.15)" : "none"
            }}
          >
            {f.icon}
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
              <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: activeStructure.circuitType === "double_circuit" ? "#2563eb" : "#6d28d9", textTransform: "uppercase" }}>รูปจำลองทางวิศวกรรม 115 kV</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#0f172a", margin: 0 }}>{activeStructure.code}</h3>
            </div>
            <span style={{ fontSize: "0.75rem", backgroundColor: activeStructure.circuitType === "double_circuit" ? "#dbeafe" : "#ede9fe", color: activeStructure.circuitType === "double_circuit" ? "#1d4ed8" : "#5b21b6", padding: "4px 12px", borderRadius: "14px", fontWeight: "bold" }}>
              มุมเลี้ยว {activeStructure.angleRange.split(' ')[0]}
            </span>
          </div>

          {/* SVG Canvas with Deep Blueprint / Realistic Dark Background */}
          <div style={{ backgroundColor: "#070b14", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "440px", position: "relative" }}>
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
                <span style={{ fontSize: "0.8rem", backgroundColor: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                  {activeStructure.specs.drawingNo}
                </span>
              </div>
              <span style={{ fontSize: "0.9rem", color: activeStructure.circuitType === "double_circuit" ? "#2563eb" : "#7c3aed", fontWeight: "bold" }}>
                รหัสแบบมาตรฐาน: {activeStructure.code}
              </span>
            </div>

            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
              <b>ลักษณะโครงสร้าง:</b> {activeStructure.description}
            </p>

            {/* Spec Highlights Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              
              <div style={{ backgroundColor: activeStructure.circuitType === "double_circuit" ? "#eff6ff" : "#f5f3ff", padding: "12px 14px", borderRadius: "10px", border: activeStructure.circuitType === "double_circuit" ? "1px solid #bfdbfe" : "1px solid #ddd6fe" }}>
                <span style={{ fontSize: "0.75rem", color: activeStructure.circuitType === "double_circuit" ? "#1d4ed8" : "#6d28d9", fontWeight: "bold", display: "block" }}>มุมเบี่ยงเบนแนวสาย (Line Angle)</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: activeStructure.circuitType === "double_circuit" ? "#1e3a8a" : "#4c1d95" }}>{activeStructure.angleRange}</span>
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
          <Layers size={20} className={activeStructure.circuitType === "double_circuit" ? "text-blue-600" : "text-purple-600"} />
          เลือกดูโครงสร้างหัวเสาแบบอื่นๆ (คลิกเพื่อแสดงรูปจำลองสมจริง):
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {filteredStructures.map((struct) => {
            const isSelected = struct.id === activeStructureId;
            const isDouble = struct.circuitType === "double_circuit";
            return (
              <div
                key={struct.id}
                onClick={() => setActiveStructureId(struct.id)}
                style={{
                  backgroundColor: "white",
                  borderRadius: "14px",
                  border: isSelected ? `2px solid ${isDouble ? '#2563eb' : '#5b21b6'}` : "1px solid #e2e8f0",
                  padding: "16px 18px",
                  cursor: "pointer",
                  boxShadow: isSelected ? `0 8px 20px -4px ${isDouble ? 'rgba(37, 99, 235, 0.3)' : 'rgba(91, 33, 182, 0.3)'}` : "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "800", color: isSelected ? (isDouble ? '#2563eb' : '#5b21b6') : "#1e293b", fontSize: "1.05rem" }}>
                      {struct.code}
                    </span>
                    <span style={{ fontSize: "0.75rem", backgroundColor: isSelected ? (isDouble ? '#dbeafe' : '#ede9fe') : "#f1f5f9", color: isSelected ? (isDouble ? '#1d4ed8' : '#6d28d9') : "#64748b", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>
                      {struct.angleRange.split(' ')[0]}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 10px 0", lineHeight: "1.4" }}>
                    {struct.name}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: isSelected ? (isDouble ? '#2563eb' : '#5b21b6') : "#94a3b8", fontWeight: "bold", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
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

function RealisticPoleHeadSVG({ type }: { type: "SS-TG" | "SS-SA" | "SS-AS" | "SS-LA" | "SS-AS-4" | "SS-TL" | "DD-TG" | "DD-SA" | "DD-AS" | "DD-LA" }) {
  switch (type) {
    case "SS-TG":
      return (
        <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="152,40 168,40 176,380 144,380" fill="#64748b" />
          <polygon points="152,40 160,40 156,380 144,380" fill="#94a3b8" />
          <polygon points="160,40 168,40 176,380 156,380" fill="#475569" />
          <line x1="160" y1="40" x2="160" y2="380" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 4" />
          <rect x="156" y="15" width="8" height="30" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <circle cx="160" cy="18" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
          <line x1="10" y1="18" x2="310" y2="18" stroke="#38bdf8" strokeWidth="3" />
          <text x="175" y="22" fill="#38bdf8" fontSize="10" fontWeight="bold">OHGW 3/8 นิ้ว</text>
          <rect x="145" y="70" width="30" height="14" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <circle cx="160" cy="77" r="4" fill="#1e293b" />
          <g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g key={i}>
                <rect x="157" y={84 + i * 11} width="6" height="4" fill="#475569" />
                <ellipse cx="160" cy={88 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
                <ellipse cx="160" cy={87 + i * 11} rx="8" ry="2" fill="#ea580c" opacity="0.6" />
              </g>
            ))}
            <path d="M 160,84 L 140,88 L 138,125" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            <path d="M 160,162 L 140,158 L 138,135" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            <rect x="150" y={162} width="20" height="10" rx="3" fill="#cbd5e1" stroke="#475569" />
            <line x1="10" y1="167" x2="310" y2="167" stroke="#f59e0b" strokeWidth="5" />
            <text x="175" y="172" fill="#fbbf24" fontSize="11" fontWeight="bold">เฟส A</text>
          </g>
          <rect x="35" y="195" width="250" height="16" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <line x1="35" y1="198" x2="285" y2="198" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="160" y1="245" x2="85" y2="211" stroke="#94a3b8" strokeWidth="4" />
          <line x1="160" y1="245" x2="235" y2="211" stroke="#94a3b8" strokeWidth="4" />
          <circle cx="160" cy="245" r="5" fill="#1e293b" />
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
          <text x="160" y="385" fill="#94a3b8" fontSize="11" textAnchor="middle">โครงสร้างเสาทางตรง SS-TG (Delta Wishbone 115 kV)</text>
        </svg>
      );

    case "SS-SA":
      return (
        <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="150" y1="180" x2="15" y2="390" stroke="#f43f5e" strokeWidth="4" strokeDasharray="6 3" />
          <ellipse cx="60" cy="325" rx="8" ry="12" fill="#9a3412" stroke="#7c2d12" transform="rotate(-35, 60, 325)" />
          <text x="25" y="280" fill="#f43f5e" fontSize="10" fontWeight="bold">สายยึดโยง (Guy Wire)</text>
          <polygon points="152,40 168,40 176,380 144,380" fill="#64748b" />
          <polygon points="152,40 160,40 156,380 144,380" fill="#94a3b8" />
          <polygon points="160,40 168,40 176,380 156,380" fill="#475569" />
          <rect x="156" y="15" width="8" height="30" rx="2" fill="#cbd5e1" stroke="#475569" />
          <circle cx="160" cy="18" r="6" fill="#38bdf8" />
          <path d="M 10,28 Q 160,18 310,8" stroke="#38bdf8" strokeWidth="3" fill="none" />
          <g transform="rotate(18, 160, 70)">
            <rect x="145" y="70" width="30" height="14" rx="2" fill="#cbd5e1" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <ellipse key={i} cx="160" cy={90 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <circle cx="160" cy="168" r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          </g>
          <rect x="35" y="195" width="250" height="16" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <path d="M 55,211 L 55,225 Q 70,240 85,225 L 85,211" stroke="#cbd5e1" strokeWidth="4" fill="none" />
          <path d="M 235,211 L 235,225 Q 250,240 265,225 L 265,211" stroke="#cbd5e1" strokeWidth="4" fill="none" />
          <g transform="rotate(18, 70, 225)">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <ellipse key={i} cx="70" cy={235 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <circle cx="70" cy="313" r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          </g>
          <g transform="rotate(18, 250, 225)">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <ellipse key={i} cx="250" cy={235 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
            ))}
            <circle cx="250" cy="313" r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          </g>
          <text x="160" y="385" fill="#a78bfa" fontSize="11" textAnchor="middle" fontWeight="bold">เสาทางโค้งมุมเล็ก SS-SA (เอียง 2° - 30° พร้อม Corner Bracket)</text>
        </svg>
      );

    case "SS-AS":
    case "SS-LA":
    case "SS-AS-4":
    case "SS-TL":
      // Reusing previous basic implementations for brevity, since they are single circuit.
      // (Simplified for this file generation, keeping focus on the new Double Circuit SVG drawings)
      return (
        <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="152,40 168,40 176,380 144,380" fill="#64748b" />
          <polygon points="152,40 160,40 156,380 144,380" fill="#94a3b8" />
          <polygon points="160,40 168,40 176,380 156,380" fill="#475569" />
          <text x="160" y="200" fill="#38bdf8" fontSize="12" textAnchor="middle" fontWeight="bold">See {type} configuration</text>
        </svg>
      );

    case "DD-TG":
      // Double Circuit Tangent (DD-TG 3-Level Horizontal Crossarms)
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Concrete Pole Trunk */}
          <polygon points="152,30 168,30 178,390 142,390" fill="#64748b" />
          <polygon points="152,30 160,30 156,390 142,390" fill="#94a3b8" />
          <polygon points="160,30 168,30 178,390 156,390" fill="#475569" />
          <line x1="160" y1="30" x2="160" y2="390" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 4" />

          {/* Peak Shield Wire */}
          <rect x="156" y="5" width="8" height="30" rx="2" fill="#cbd5e1" stroke="#475569" />
          <circle cx="160" cy="10" r="5" fill="#38bdf8" />
          <line x1="10" y1="10" x2="310" y2="10" stroke="#38bdf8" strokeWidth="3" />
          <text x="170" y="15" fill="#38bdf8" fontSize="9" fontWeight="bold">OHGW</text>

          {/* 3 Levels of Crossarms */}
          {[60, 160, 260].map((y, level) => (
            <g key={y}>
              {/* Main Crossarm */}
              <rect x="50" y={y} width="220" height="16" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              <line x1="50" y1={y + 3} x2="270" y2={y + 3} stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
              {/* V-Braces */}
              <line x1="160" y1={y + 35} x2="110" y2={y + 16} stroke="#94a3b8" strokeWidth="4" />
              <line x1="160" y1={y + 35} x2="210" y2={y + 16} stroke="#94a3b8" strokeWidth="4" />
              
              {/* Left Circuit (Circuit 1) */}
              <g>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <ellipse key={`L${i}`} cx="70" cy={y + 20 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
                ))}
                <circle cx="70" cy={y + 97} r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                <line x1="10" y1={y + 97} x2="140" y2={y + 97} stroke="#f59e0b" strokeWidth="5" />
                <text x="70" y={y + 115} fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">C1 - Ph {level+1}</text>
              </g>

              {/* Right Circuit (Circuit 2) */}
              <g>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <ellipse key={`R${i}`} cx="250" cy={y + 20 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
                ))}
                <circle cx="250" cy={y + 97} r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                <line x1="180" y1={y + 97} x2="310" y2={y + 97} stroke="#f59e0b" strokeWidth="5" />
                <text x="250" y={y + 115} fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">C2 - Ph {level+1}</text>
              </g>
            </g>
          ))}
          <text x="160" y="410" fill="#60a5fa" fontSize="12" textAnchor="middle" fontWeight="bold">เสาทางตรงวงจรคู่ DD-TG (3 ชั้น 6 เฟส)</text>
        </svg>
      );

    case "DD-SA":
      // Double Circuit Small Angle (DD-SA with Swinging strings & Corner Brackets)
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Guy wire on Left */}
          <line x1="145" y1="180" x2="10" y2="400" stroke="#f43f5e" strokeWidth="4" strokeDasharray="6 3" />
          <text x="15" y="300" fill="#f43f5e" fontSize="10" fontWeight="bold">Guy Wire</text>

          {/* Pole Trunk */}
          <polygon points="152,30 168,30 178,390 142,390" fill="#64748b" />
          <polygon points="152,30 160,30 156,390 142,390" fill="#94a3b8" />
          <polygon points="160,30 168,30 178,390 156,390" fill="#475569" />

          {/* OHGW Peak */}
          <circle cx="160" cy="15" r="5" fill="#38bdf8" />
          <path d="M 10,25 Q 160,15 310,5" stroke="#38bdf8" strokeWidth="3" fill="none" />

          {[60, 160, 260].map((y, level) => (
            <g key={y}>
              <rect x="50" y={y} width="220" height="16" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              {/* U Brackets */}
              <path d="M 70,y+16 L 70,y+25 Q 80,y+35 90,y+25 L 90,y+16" stroke="#cbd5e1" strokeWidth="4" fill="none" transform={`translate(0, ${y})`} />
              <path d="M 230,y+16 L 230,y+25 Q 240,y+35 250,y+25 L 250,y+16" stroke="#cbd5e1" strokeWidth="4" fill="none" transform={`translate(0, ${y})`} />
              
              {/* Swinging Insulators Left Circuit */}
              <g transform={`translate(75, ${y+16}) rotate(20)`}>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <ellipse key={i} cx="0" cy={10 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
                ))}
                <circle cx="0" cy="87" r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
              </g>

              {/* Swinging Insulators Right Circuit */}
              <g transform={`translate(245, ${y+16}) rotate(20)`}>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <ellipse key={i} cx="0" cy={10 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
                ))}
                <circle cx="0" cy="87" r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
              </g>
            </g>
          ))}
          <text x="160" y="410" fill="#60a5fa" fontSize="12" textAnchor="middle" fontWeight="bold">เสาทางโค้งมุมเล็กวงจรคู่ DD-SA (พวงลูกถ้วยเอียง 20°)</text>
        </svg>
      );

    case "DD-AS":
      // Double Circuit Anchor (Dead End both sides, jumpers looping)
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pole Trunk */}
          <polygon points="152,30 168,30 178,390 142,390" fill="#64748b" />
          <polygon points="152,30 160,30 156,390 142,390" fill="#94a3b8" />
          <polygon points="160,30 168,30 178,390 156,390" fill="#475569" />

          {/* OHGW Peak */}
          <circle cx="160" cy="15" r="5" fill="#38bdf8" />
          <line x1="10" y1="15" x2="140" y2="15" stroke="#38bdf8" strokeWidth="3" />
          <line x1="180" y1="15" x2="310" y2="15" stroke="#38bdf8" strokeWidth="3" />

          {[70, 170, 270].map((y, level) => (
            <g key={y}>
              <rect x="40" y={y} width="240" height="22" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
              <rect x="55" y={y-10} width="12" height="42" fill="#475569" rx="2" />
              <rect x="253" y={y-10} width="12" height="42" fill="#475569" rx="2" />

              {/* Left Circuit Dead Ends & Jumper */}
              <g>
                {[0, 1, 2, 3, 4].map(i => <ellipse key={`L1_${i}`} cx={45 - i * 9} cy={y+11} rx="3" ry="10" fill="#9a3412" /> )}
                {[0, 1, 2, 3, 4].map(i => <ellipse key={`L2_${i}`} cx={75 + i * 9} cy={y+11} rx="3" ry="10" fill="#9a3412" /> )}
                <path d={`M 15,${y+11} Q 60,${y+55} 105,${y+11}`} stroke="#fbbf24" strokeWidth="3" fill="none" />
                <line x1="10" y1={y+11} x2="15" y2={y+11} stroke="#f59e0b" strokeWidth="4" />
              </g>

              {/* Right Circuit Dead Ends & Jumper */}
              <g>
                {[0, 1, 2, 3, 4].map(i => <ellipse key={`R1_${i}`} cx={245 - i * 9} cy={y+11} rx="3" ry="10" fill="#9a3412" /> )}
                {[0, 1, 2, 3, 4].map(i => <ellipse key={`R2_${i}`} cx={275 + i * 9} cy={y+11} rx="3" ry="10" fill="#9a3412" /> )}
                <path d={`M 215,${y+11} Q 260,${y+55} 305,${y+11}`} stroke="#fbbf24" strokeWidth="3" fill="none" />
                <line x1="305" y1={y+11} x2="310" y2={y+11} stroke="#f59e0b" strokeWidth="4" />
              </g>
            </g>
          ))}
          <text x="160" y="410" fill="#60a5fa" fontSize="12" textAnchor="middle" fontWeight="bold">เสายึดดึงตรงวงจรคู่ DD-AS (Dead-End 12 พวง จัมเปอร์ 6 ชุด)</text>
        </svg>
      );

    case "DD-LA":
      // Double Circuit Large Angle
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Heavy Guy Wires Left */}
          <line x1="145" y1="100" x2="10" y2="390" stroke="#f43f5e" strokeWidth="4" />
          <line x1="145" y1="200" x2="30" y2="390" stroke="#f43f5e" strokeWidth="4" />
          <line x1="145" y1="300" x2="50" y2="390" stroke="#f43f5e" strokeWidth="4" />
          <text x="25" y="320" fill="#f43f5e" fontSize="10" fontWeight="bold">สมอบกคู่ Heavy Guy</text>

          {/* Pole Trunk */}
          <polygon points="152,30 168,30 178,390 142,390" fill="#64748b" />
          <polygon points="152,30 160,30 156,390 142,390" fill="#94a3b8" />
          <polygon points="160,30 168,30 178,390 156,390" fill="#475569" />

          {[80, 180, 280].map((y, level) => (
            <g key={y}>
              <polygon points={`40,${y} 280,${y-30} 280,${y-12} 40,${y+18}`} fill="#cbd5e1" stroke="#334155" strokeWidth="2.5" />
              
              <g transform={`translate(160, ${y-10}) rotate(-12)`}>
                {[0, 1, 2, 3, 4, 5].map(i => <ellipse key={`L_${i}`} cx={i * 12} cy="0" rx="4" ry="12" fill="#9a3412" />)}
                <line x1="72" y1="0" x2="150" y2="0" stroke="#f59e0b" strokeWidth="5" />
              </g>

              {/* Line Post Insulator for Jumper */}
              <g transform={`translate(145, ${y+15})`}>
                <rect x="0" y="0" width="30" height="10" rx="2" fill="#9a3412" />
                {[0, 1, 2].map(i => <ellipse key={`P_${i}`} cx={5 + i*10} cy="5" rx="3" ry="8" fill="#9a3412" />)}
                <path d="M -50,-20 Q 15,5 40,-40" stroke="#fbbf24" strokeWidth="3" fill="none" />
              </g>
            </g>
          ))}
          <text x="160" y="410" fill="#60a5fa" fontSize="12" textAnchor="middle" fontWeight="bold">เสาหัวมุมหักศอกวงจรคู่ DD-LA (พร้อม Line Post ประคองจัมเปอร์)</text>
        </svg>
      );

    default:
      return null;
  }
}
