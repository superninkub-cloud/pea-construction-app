import React, { useState } from "react";
import { Cpu, Layers, Compass, Shield, ArrowRight, CheckCircle, Info, Sparkles, Filter, Eye, AlertCircle } from "lucide-react";

interface PoleStructure {
  id: string;
  code: string;
  name: string;
  circuitType: "single_conductor" | "double_circuit_single" | "double_circuit";
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
  svgType: "SS-TG" | "SS-SA" | "SS-AS" | "SS-LA" | "SS-AS-4" | "SS-TL" | "DS-TG" | "DS-SA" | "DS-AS" | "DS-LA" | "DD-SA-2" | "DD-AS-2" | "DD-DD-1" | "DD-DD-2" | "DD-LS-1";
}

const STRUCTURE_DATA: PoleStructure[] = [
  // ─── SINGLE CIRCUIT ───────────────────────────────────────────────────────
  {
    id: "ss-tg",
    code: "SS-TG-2 / SS-TG-6",
    name: "เสาทางตรงวงจรเดี่ยว สายเดี่ยว (Single Circuit Tangent Single Conductor)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว สายเดี่ยว (SS Series)",
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
      crossarmMaterial: "เหล็กรูปรางน้ำชุบสังกะสี มอก. 1227",
      shieldWire: "สายดินล่อฟ้า OHGW / OPGW 1 เส้นยอดเสา",
      spanMax: "100 - 120 เมตร",
      drawingNo: "SA1-015/5701"
    },
    svgType: "SS-TG"
  },
  {
    id: "ss-sa",
    code: "SS-SA-2",
    name: "เสาทางโค้งมุมเล็ก สายเดี่ยว (Single Circuit Small Angle 2° - 30°)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว สายเดี่ยว (SS Series)",
    angleRange: "2° - 30° (ทางโค้งมุมเล็ก)",
    insulatorAssembly: "ลูกถ้วยแขวนเอียงตามแรงดึงลัพธ์ (แบบ D-2 / D-12)",
    crossarmType: "คอนเหล็กขวางเสริมแผ่นประกับรับแรงเฉือนด้านข้าง",
    guyWireSpec: "สายยึดโยงสลิงเหล็ก 1 ชุด (ฝั่งตรงข้ามมุมดึง)",
    description: "ใช้สำหรับจุดเลี้ยวโค้งของแนวสายส่งมุมไม่เกิน 30 องศา พวงลูกถ้วยเอียงตามแนวแรงดึงลัพธ์ (Resultant Force Angle) มีการติดตั้ง Corner Bracket ใต้คอน",
    engineeringFeatures: [
      "ใช้ที่แขวนรูปตัวยู (Corner Suspension Bracket) กันลูกถ้วยชนคอน",
      "พวงลูกถ้วยเอียงทำมุมอย่างอิสระตามแรงดึง",
      "ติดตั้งสายยึดโยง รั้งเสาถ่ายแรงลงสมอบก"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็ก 100x50x5 มม. เสริม Brace",
      shieldWire: "สายกราวด์ OHGW พาดผ่านแคล้มป์มุม",
      spanMax: "80 - 100 เมตร",
      drawingNo: "SA1-015/5701"
    },
    svgType: "SS-SA"
  },
  {
    id: "ss-as",
    code: "SS-AS-2 / SS-AS-4",
    name: "เสายึดดึงตรงสองข้าง สายเดี่ยว (Anchor / Strain Section Structure)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว สายเดี่ยว (SS Series)",
    angleRange: "0° - 5° (ทางตรงรับแรงดึงเต็มพิกัด)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสายแนวนอน 2 ฝั่ง (D-3 รวม 6 พวง) + สายจัมเปอร์",
    crossarmType: "คอนเหล็กคู่หนาพิเศษ 150x75x9 มม. พร้อมแผ่นเหล็กยื่นสองปลาย",
    guyWireSpec: "สายยึดโยง 2 ทิศทาง (หัว-ท้ายเสา) กรณีเป็นจุดตัดช่วง",
    description: "เสาดึงตรึงสายไฟเป็นช่วงๆ (Section Pole ทุก 1.5 - 2.0 กม.) เพื่อกักแรงดึงไม่ให้ส่งต่อสะสมยาวเกินไป และป้องกันเสาล้มลามเป็นโดมิโน",
    engineeringFeatures: [
      "ลูกถ้วยรับแรงดึงแนวนอน 6 พวง",
      "แคล้มป์เข้าปลายสายแบบบีบ รับแรงดึงสูงสุด",
      "สายจัมเปอร์ (Jumper Loop) ดัดโค้งรอดใต้หัวเสา"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กคู่พร้อม Double Arming Plates",
      shieldWire: "สายกราวด์ OHGW เข้าปลายสายสองข้าง",
      spanMax: "100 - 150 เมตร",
      drawingNo: "SA1-015/5701"
    },
    svgType: "SS-AS"
  },
  {
    id: "ss-la",
    code: "SS-LA-1 / SS-LA-2",
    name: "เสาหัวมุมใหญ่และจบสาย (Large Angle 30° - 90° & Dead-End)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว สายเดี่ยว (SS Series)",
    angleRange: "30° - 90° (มุมหักศอก)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสายแรงดึงสูง + ลูกถ้วยโพสท์ประคองจัมเปอร์",
    crossarmType: "คอนเหล็กคู่ทำมุมเฉียง พร้อมแผ่นประกับหนาพิเศษ",
    guyWireSpec: "สายยึดโยงหนัก 2-4 ชุด (Heavy Guy Assembly)",
    description: "โครงสร้างหัวเสาสำหรับจุดหักมุมเลี้ยว 90 องศา หรือเสาจบสาย สายจัมเปอร์จะถูกประคองด้วยลูกถ้วยโพสท์แนวนอน (Line Post)",
    engineeringFeatures: [
      "คอนเหล็กคู่ติดตั้งทำมุมเฉียงตามแนวเส้นแบ่งครึ่งมุม",
      "ติดตั้งลูกถ้วยโพสท์แนวนอนช่วยรักษาระยะ Clearance",
      "สายยึดโยง 2-4 ชุด ดึงเฉียง 45 องศา"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กคู่หนาพิเศษ 150x75x9 มม.",
      shieldWire: "สายกราวด์ OHGW เข้าปลายสาย 2 ทิศทาง",
      spanMax: "120 - 200 เมตร",
      drawingNo: "SA1-015/5704"
    },
    svgType: "SS-LA"
  },
  {
    id: "ss-as-4",
    code: "SS-AS-4 / SD-AS-3",
    name: "เสาคอนท้าวแขนเรียงแนวดิ่ง (Single Circuit Alley Arm)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว สายเดี่ยว (SS Series)",
    angleRange: "0° - 5° (พื้นที่จำกัดเขตทาง)",
    insulatorAssembly: "ลูกถ้วยแขวนแนวดิ่ง 3 ชุด เรียงบนคอนท้าวแขนฝั่งเดียว",
    crossarmType: "คอนเหล็กท้าวแขน 150x75x9 มม. ยาว 3.00 ม. (Alley Arm)",
    guyWireSpec: "สายยึดโยงรั้งด้านตรงข้ามคอนท้าวแขน",
    description: "ออกแบบพิเศษสำหรับพื้นที่เขตทางแคบริมถนนชิดรั้ว คอนยื่นออกด้านเดียว จัดสาย 3 เฟสเรียงในแนวดิ่ง",
    engineeringFeatures: [
      "คอนท้าวแขนขนาดใหญ่ยาว 3.00 ม. ยื่นฝั่งเดียว",
      "ค้ำยันด้วยเหล็กประกับ Alley Arm Brace",
      "ประหยัดระยะปลอดภัยในแนวราบ"
    ],
    specs: {
      crossarmMaterial: "คอนท้าวแขน Alley Arm (1000120004)",
      shieldWire: "สายกราวด์ OHGW บนก้านฉากยอดเสา",
      spanMax: "80 - 100 เมตร",
      drawingNo: "SA1-015/58004"
    },
    svgType: "SS-AS-4"
  },
  {
    id: "ss-tl",
    code: "SS-TL-1 / SD-TL-1",
    name: "เสาแยกสาย 3 ทาง (Tap-Line Structure with Switch)",
    circuitType: "single_conductor",
    circuitTypeName: "วงจรเดี่ยว สายเดี่ยว (SS Series)",
    angleRange: "แยกสายฉาก 90°",
    insulatorAssembly: "ลูกถ้วยผสม (แขวน + ปลายสาย) + สวิตช์ 115 kV",
    crossarmType: "คอนทางตรงขวาง + คอนยื่นดึงแยกแนวฉาก 90 องศา",
    guyWireSpec: "สายยึดโยงรั้งต้านแรงดึงของสายแยก",
    description: "หัวเสาแยกวงจรสายส่ง (T-Branch) ไปสถานีไฟฟ้าย่อย พร้อมติดตั้งแอร์เบรกสวิตช์ 115 kV (Air Break Switch 1,200 A)",
    engineeringFeatures: [
      "แอร์เบรกสวิตช์ 115 kV ตัดตอนขณะไม่มีโหลด",
      "ก้านโยกควบคุมทอดลงสู่พื้นดิน พร้อมต่อกราวด์"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กผสม + ฐานสวิตช์",
      shieldWire: "สายกราวด์ OHGW แยก 3 ทาง",
      spanMax: "60 - 80 เมตร",
      drawingNo: "SA1-015/5705"
    },
    svgType: "SS-TL"
  },

  // ─── DS SERIES: DOUBLE CIRCUIT SINGLE CONDUCTOR (วงจรคู่ สายเดี่ยว) ───────
  {
    id: "ds-tg",
    code: "DS-TG-3 / DS-TG-7",
    name: "เสาทางตรงวงจรคู่ สายเดี่ยว (Double Circuit Tangent - Single Conductor)",
    circuitType: "double_circuit_single",
    circuitTypeName: "วงจรคู่ สายเดี่ยว (DS Series)",
    angleRange: "0° - 2° (ทางตรง)",
    insulatorAssembly: "ลูกถ้วยแขวนแนวดิ่ง 6 พวง (ฝั่งละ 3 พวง)",
    crossarmType: "คอนเหล็กยื่นสองฝั่ง 3 ชั้น (3-Level Horizontal Crossarms)",
    guyWireSpec: "ไม่ต้องใช้สายยึดโยง",
    description: "โครงสร้างมาตรฐานสำหรับสายส่ง 115 kV วงจรคู่ สายเดี่ยว (1 เส้น/เฟส รวม 6 เฟส) จัดสายเรียงแนวดิ่งซ้าย-ขวา เหมาะสำหรับพื้นที่เขตทางจำกัด ที่โหลดกระแสของแต่ละวงจรไม่เกินพิกัดสายเดี่ยว",
    engineeringFeatures: [
      "คอนเหล็กชุบสังกะสี 3 ชั้น รองรับวงจร 1 (ซ้าย) และวงจร 2 (ขวา)",
      "ใช้สายตัวนำเพียง 1 เส้นต่อเฟส ประหยัดโครงสร้าง",
      "มีแคล้มป์แขวน (Suspension Clamp) และลูกตุ้มซับแรงสั่นสะเทือนเฟสละ 1 ตัว"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กรางน้ำ 3 ชั้น ยึดด้วย V-Brace ทุกชั้น",
      shieldWire: "สายกราวด์ OHGW 1-2 เส้น บนยอดเสา",
      spanMax: "100 - 120 เมตร",
      drawingNo: "SA1-015/5707 (DS)"
    },
    svgType: "DS-TG"
  },
  {
    id: "ds-sa",
    code: "DS-SA-3 / DS-SA-7",
    name: "เสาทางโค้งมุมเล็ก วงจรคู่ สายเดี่ยว (Small Angle 2° - 30°)",
    circuitType: "double_circuit_single",
    circuitTypeName: "วงจรคู่ สายเดี่ยว (DS Series)",
    angleRange: "2° - 30° (ทางโค้งมุมเล็ก)",
    insulatorAssembly: "ลูกถ้วยแขวนเอียงตามแรงดึงลัพธ์ 6 พวง พร้อม U-Bracket",
    crossarmType: "คอนเหล็กยื่นสองฝั่ง 3 ชั้น พร้อมแผ่นประกับ",
    guyWireSpec: "สายยึดโยง 1-2 ชุด ด้านนอกของมุมเลี้ยว",
    description: "จุดเลี้ยวโค้งมุมเล็กสำหรับสายส่งวงจรคู่ชนิดสายเดี่ยว พวงลูกถ้วยจะเอียงตามแนวแรงดึง ใช้ที่แขวนรูปตัวยู (Corner Bracket) กันลูกถ้วยชนคอน",
    engineeringFeatures: [
      "ที่แขวนรูปตัวยู (U-Bracket) 6 จุด เพื่อระยะ Clearance จากคอน",
      "สายยึดโยงสลิงเหล็กต้านแรงดึงสายตัวนำ 6 เส้น"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็ก 3 ชั้น เสริมเหล็กประกับค้ำยันด้านข้าง",
      shieldWire: "สายกราวด์ OHGW ผ่านแคล้มป์มุม",
      spanMax: "80 - 100 เมตร",
      drawingNo: "SA1-015/5708 (DS)"
    },
    svgType: "DS-SA"
  },
  {
    id: "ds-as",
    code: "DS-AS-3 / DS-AS-5",
    name: "เสายึดดึงตรงสองข้าง วงจรคู่ สายเดี่ยว (Anchor / Section)",
    circuitType: "double_circuit_single",
    circuitTypeName: "วงจรคู่ สายเดี่ยว (DS Series)",
    angleRange: "0° - 5° (ทางตรงรับแรงดึงเต็มพิกัด)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสายแนวนอน 12 พวง + สายจัมเปอร์เดี่ยว 6 ชุด",
    crossarmType: "คอนเหล็กคู่หนาพิเศษ 3 ชั้น (Double Arming)",
    guyWireSpec: "สายยึดโยง 2 ทิศทาง (หัว-ท้ายเสา)",
    description: "เสาดึงตรึงสายไฟวงจรคู่ชนิดสายเดี่ยว ลูกถ้วยรับแรงดึงแนวนอนรวม 12 พวง (รับเข้า 6 ออก 6) พร้อมสายจัมเปอร์เดี่ยวดัดลอดใต้คอน 6 ชุด",
    engineeringFeatures: [
      "ใช้สายจัมเปอร์ 1 เส้นต่อ 1 เฟส ทา Joint compound",
      "คอนเหล็กคู่ 150x75x9 มม. 3 ชั้น ติดตั้ง Double Arming Plate"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กคู่ 3 ชั้น",
      shieldWire: "สายกราวด์ OHGW เข้าปลายสาย 2 ฝั่ง",
      spanMax: "100 - 150 เมตร",
      drawingNo: "SA1-015/5709 (DS)"
    },
    svgType: "DS-AS"
  },
  {
    id: "ds-la",
    code: "DS-LA-3 / DS-LA-5",
    name: "เสาหัวมุมใหญ่และจบสาย วงจรคู่ สายเดี่ยว (Large Angle 30° - 90°)",
    circuitType: "double_circuit_single",
    circuitTypeName: "วงจรคู่ สายเดี่ยว (DS Series)",
    angleRange: "30° - 90° (มุมหักศอก / จบสาย)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสาย 12 พวง + ลูกถ้วยโพสท์แนวนอน 6 ชุด",
    crossarmType: "คอนเหล็กคู่ทำมุมเฉียง 3 ชั้น",
    guyWireSpec: "สายยึดโยงหนัก 4-8 ชุด (Heavy Guy Assembly)",
    description: "เสาหักมุมเลี้ยวศอกวงจรคู่สายเดี่ยว ใช้ลูกถ้วยโพสท์ 115 kV แนวนอนถึง 6 ชุดในการประคองสายจัมเปอร์เดี่ยวไม่ให้ตกท้องช้างช็อตเสา",
    engineeringFeatures: [
      "ลูกถ้วย Dead-End 12 พวง รับพิกัดสายเดี่ยว",
      "มี Line Post Insulator ประคองจัมเปอร์ 6 เส้น",
      "สมอบกคู่รองรับ Heavy Guy"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็กคู่ทำมุมเฉียง 3 ชั้น",
      shieldWire: "สายกราวด์ OHGW เข้าปลายสาย 2 ชุด",
      spanMax: "120 - 200 เมตร",
      drawingNo: "SA1-015/5710 (DS)"
    },
    svgType: "DS-LA"
  },

  // ─── DD SERIES: DOUBLE CIRCUIT TWIN BUNDLE (วงจรคู่ สายคู่) ───────────────
  {
    id: "dd-sa-2",
    code: "DD-SA-2 (Twin Bundle)",
    name: "เสาทางโค้งมุมเล็ก วงจรคู่ สายคู่ (Small Angle Structure 2° - 30°)",
    circuitType: "double_circuit",
    circuitTypeName: "วงจรคู่ สายคู่ (DD Series)",
    angleRange: "2° - 30° (ทางโค้งมุมเล็ก)",
    insulatorAssembly: "ลูกถ้วยแขวนเอียง 6 พวงใหญ่ (พร้อม Yoke Plate) ยึดกับแคล้มป์รูปตัวยู",
    crossarmType: "คอนเหล็ก 3 ชั้น โครงสร้างหนักพิเศษ (Heavy Duty)",
    guyWireSpec: "สายยึดโยง 1-2 ชุด ด้านนอกของมุมเลี้ยว",
    description: "จุดเลี้ยวโค้งมุมเล็กสำหรับสายส่ง Twin Bundle พวงลูกถ้วยเอียงตามแนวแรงดึงลัพธ์สูงสุด 45° ใช้แคล้มป์แขวนรูปตัวยู (Corner Suspension Bracket) เพื่อรักษาระยะ Clearance ไม่ให้ลูกถ้วยชนคอนเหล็ก",
    engineeringFeatures: [
      "รองรับแรงดึงลัพธ์ของสาย Twin Bundle ทั้ง 12 เส้น (เฟสละ 2 เส้น)",
      "แผ่นเหล็ก Yoke Plate ช่วยรักษาระยะห่าง 2 สายตัวนำในเฟสเดียวกัน",
      "มีแคล้มป์แขวนรูปตัวยูยาวพิเศษกันลูกถ้วยกระแทกคอน"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็ก 3 ชั้น หนาพิเศษ",
      shieldWire: "สายกราวด์มุมโค้ง 1-2 เส้น",
      spanMax: "80 - 100 เมตร",
      drawingNo: "SA1-015/36005 (ประกอบ 5359)"
    },
    svgType: "DD-SA-2"
  },
  {
    id: "dd-as-2",
    code: "DD-AS-2 (Twin Bundle)",
    name: "เสายึดดึงตรงและลดระดับความตึง (Double Deadend Adjacent Pole to Angle)",
    circuitType: "double_circuit",
    circuitTypeName: "วงจรคู่ สายคู่ (DD Series)",
    angleRange: "0° - 5° (จุดเข้าปลายสายลดแรงดึง)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสาย 24 พวง (โยงเข้า 12 โยงออก 12) + จัมเปอร์ Slack Span",
    crossarmType: "คอนเหล็กคู่หนา 3 ชั้น รับน้ำหนักสูงสุด",
    guyWireSpec: "สายยึดโยง 2 ทิศทาง (ต้านแรงสแปนหลักและสแปนหย่อน)",
    description: "เสาดึงตรึงสาย Twin Bundle ที่ออกแบบมาเพื่อตั้งอยู่ใกล้เสาต้นมุม (Adjacent Pole) ฝั่งหนึ่งดึงตึงปกติ ส่วนอีกฝั่งทำมุมดึงหย่อน (Slack Span) เข้าสู่เสาต้นมุม",
    engineeringFeatures: [
      "พวงลูกถ้วย Dead-End 24 พวง ยึดกับ Yoke Plate สี่เหลี่ยม",
      "ฝั่งสแปนหย่อน (Slack Span) ไม่ต้องรับแรงดึงสูงมาก",
      "สายจัมเปอร์คู่ (Twin Jumpers) มี Spacer กั้นระยะ"
    ],
    specs: {
      crossarmMaterial: "คอนคู่ 3 ชั้น โครงสร้างแข็งแกร่ง",
      shieldWire: "สายกราวด์โยง Slack Span",
      spanMax: "100 - 150 เมตร",
      drawingNo: "SA1-015/35024 (ประกอบ 5356)"
    },
    svgType: "DD-AS-2"
  },
  {
    id: "dd-dd-1",
    code: "DD-DD-1 (H-Frame Twin Bundle)",
    name: "เสาคู่ดึงตรึงสายเข้าปลายสาย (Double Pole, Double Dead End Structure)",
    circuitType: "double_circuit",
    circuitTypeName: "วงจรคู่ สายคู่ (DD Series)",
    angleRange: "0° - 5° (ทางตรงรับแรงดึงเต็มพิกัด)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสาย Twin Bundle 24 พวงใหญ่",
    crossarmType: "คานขวางยาว 5.00 ม. เชื่อมเสา 2 ต้น (H-Frame 3 ระดับ)",
    guyWireSpec: "สายยึดโยง 4 ทิศทาง (ดึงหัว-ท้ายเสาทั้งสองต้น)",
    description: "โครงสร้างแบบเสาคู่ (H-Frame) ใช้เสาคอนกรีต 22 ม. ตั้งคู่กันระยะห่าง 3.00 ม. ใช้รับแรงดึงมหาศาลที่สุดของสาย Twin Bundle เป็นเสา Section/Dead-End ที่แข็งแกร่งที่สุด",
    engineeringFeatures: [
      "ตั้งเสาคู่ขนานระยะ 3.00 ม. เป็นรูปตัว H ทนแรงดึงมหาศาล",
      "ใช้คานเหล็ก (Crossarm) ขนาดยาว 5.00 ม. พาดเชื่อมเสาทั้งสองต้น",
      "ลูกถ้วยดึงแนวนอน 24 พวง พร้อม Twin Jumpers"
    ],
    specs: {
      crossarmMaterial: "เหล็กฉาก 150x100x12 มม. ยาว 5.00 ม.",
      shieldWire: "สายกราวด์ OHGW ดึงตึง 2 เส้น",
      spanMax: "150 - 200 เมตร",
      drawingNo: "SA1-015/25005 (ประกอบ 5354)"
    },
    svgType: "DD-DD-1"
  },
  {
    id: "dd-dd-2",
    code: "DD-DD-2 (Single Pole Twin Bundle)",
    name: "เสาต้นเดียวดึงตรึงสายเข้าปลายสาย (Single Pole, Double Dead End)",
    circuitType: "double_circuit",
    circuitTypeName: "วงจรคู่ สายคู่ (DD Series)",
    angleRange: "0° - 5° (ทางตรงรับแรงดึง)",
    insulatorAssembly: "ลูกถ้วยเข้าปลายสาย 24 พวง + สายจัมเปอร์คู่ดัดโค้งอิสระ",
    crossarmType: "คอนเหล็กคู่หนาพิเศษ 3 ชั้น",
    guyWireSpec: "สายยึดโยงหัว-ท้าย 2 ชุด",
    description: "เสาดึงตรึงสายแบบต้นเดียว (Single Pole) สำหรับสาย Twin Bundle ที่ช่วงสแปนไม่ยาวมาก ลูกถ้วยแรงดึงแนวนอน 24 พวง ยึดกับ Yoke Plate รูปสี่เหลี่ยมผืนผ้า",
    engineeringFeatures: [
      "ประหยัดพื้นที่กว่าเสา H-Frame แต่ต้องใช้สายยึดโยงดึงค้ำหนัก",
      "รักษาระยะ Clearance ของสายจัมเปอร์คู่ให้ปลอดภัย"
    ],
    specs: {
      crossarmMaterial: "เหล็กคู่ 150x100x12 มม. 3 ชั้น",
      shieldWire: "สายกราวด์ OHGW ดึงแนวนอน",
      spanMax: "100 - 150 เมตร",
      drawingNo: "SA1-015/25022 (ประกอบ 5355)"
    },
    svgType: "DD-DD-2"
  },
  {
    id: "dd-ls-1",
    code: "DD-LS-1 (Line Spacer)",
    name: "เสาช่วงระยะไม่เกิน 150 ม. ประคองสายคู่ (Span < 150m Structure)",
    circuitType: "double_circuit",
    circuitTypeName: "วงจรคู่ สายคู่ (DD Series)",
    angleRange: "0° - 2° (ประคองสายตรง)",
    insulatorAssembly: "ลูกถ้วยแขวน 6 พวง + ลูกถ้วยโพสท์แนวนอน (Line Post Insulator) 6 ชุด",
    crossarmType: "คอนเหล็ก 3 ชั้นปกติ",
    guyWireSpec: "สายยึดโยง 1 ชุด (เสริมความมั่นคง)",
    description: "โครงสร้างเสาทางตรง มีการติดตั้งลูกถ้วยโพสท์ยื่นออกจากเสาเพื่อประคองสาย Twin Bundle ไม่ให้ลมพัดแกว่งเข้าใกล้เสาในสแปนที่ยาว",
    engineeringFeatures: [
      "ใช้ลูกถ้วย Line Post 115 kV ยื่นในแนวนอนเพื่อรักษาระยะ Clearance",
      "ช่วยลดปัญหาการเกิด Flashover จากสายแกว่งข้ามเฟสเมื่อลมแรง"
    ],
    specs: {
      crossarmMaterial: "คอนเหล็ก 150x100x12 มม. 3 ชั้น",
      shieldWire: "สายกราวด์บนยอดเสา",
      spanMax: "ระยะสแปน < 150 เมตร",
      drawingNo: "SA1-015/44014 (ประกอบ 5360)"
    },
    svgType: "DD-LS-1"
  }
];

export default function Structures() {
  const [activeStructureId, setActiveStructureId] = useState<string>("ds-tg");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredStructures = selectedFilter === "all"
    ? STRUCTURE_DATA
    : STRUCTURE_DATA.filter((s) => s.circuitType === selectedFilter);

  const activeStructure = STRUCTURE_DATA.find((s) => s.id === activeStructureId) || STRUCTURE_DATA[0];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" }}>
            <Cpu size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>แบบมาตรฐานโครงสร้างหัวเสาสายส่ง 115 kV (สายเดี่ยว & สายคู่ Twin Bundle)</h2>
            <p style={{ color: "#bfdbfe", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              รูปจำลองเสาคอนกรีต 22 ม. วงจรเดี่ยวและวงจรคู่ ทั้งชนิดสายเดี่ยว (Single Conductor) และสายคู่แฝด (Twin Bundle) อ้างอิงแบบวิศวกรรม กฟภ.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "รายการทั้งหมด", icon: <Layers size={16} /> },
          { id: "single_conductor", label: "⚡ วงจรเดี่ยว สายเดี่ยว (SS Series)", icon: <Info size={16} /> },
          { id: "double_circuit_single", label: "⚡⚡ วงจรคู่ สายเดี่ยว (DS Series)", icon: <Shield size={16} /> },
          { id: "double_circuit", label: "⚡⚡ วงจรคู่ สายคู่ (DD Twin Bundle)", icon: <Sparkles size={16} /> }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setSelectedFilter(f.id);
              if (f.id !== "all") {
                const firstMatch = STRUCTURE_DATA.find(s => s.circuitType === f.id);
                if (firstMatch) setActiveStructureId(firstMatch.id);
              } else {
                setActiveStructureId("ds-tg");
              }
            }}
            style={{
              padding: "10px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: selectedFilter === f.id ? (f.id.includes("double_circuit") ? "#2563eb" : "#7c3aed") : "#f1f5f9",
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
              <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: activeStructure.circuitType.includes("double") ? "#2563eb" : "#7c3aed", textTransform: "uppercase" }}>รูปจำลองทางวิศวกรรม 115 kV</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#0f172a", margin: 0 }}>{activeStructure.code}</h3>
            </div>
            <span style={{ fontSize: "0.75rem", backgroundColor: activeStructure.circuitType.includes("double") ? "#dbeafe" : "#ede9fe", color: activeStructure.circuitType.includes("double") ? "#1d4ed8" : "#6d28d9", padding: "4px 12px", borderRadius: "14px", fontWeight: "bold" }}>
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
              <span>สายตัวนำ 115 kV (AAC/ACSR)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "8px", backgroundColor: "#cbd5e1", borderRadius: "2px", border: "1px solid #64748b" }}></span>
              <span>คอนเหล็กชุบกัลวาไนซ์ (Crossarm)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", backgroundColor: "#9a3412", borderRadius: "50%" }}></span>
              <span>พวงลูกถ้วยปอร์ซเลน / แผ่นโยค</span>
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
              <span style={{ fontSize: "0.9rem", color: activeStructure.circuitType.includes("double") ? "#2563eb" : "#7c3aed", fontWeight: "bold" }}>
                รหัสแบบมาตรฐาน: {activeStructure.code}
              </span>
            </div>

            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
              <b>ลักษณะโครงสร้าง:</b> {activeStructure.description}
            </p>

            {/* Spec Highlights Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              
              <div style={{ backgroundColor: activeStructure.circuitType.includes("double") ? "#eff6ff" : "#f5f3ff", padding: "12px 14px", borderRadius: "10px", border: activeStructure.circuitType.includes("double") ? "1px solid #bfdbfe" : "1px solid #ddd6fe" }}>
                <span style={{ fontSize: "0.75rem", color: activeStructure.circuitType.includes("double") ? "#1d4ed8" : "#6d28d9", fontWeight: "bold", display: "block" }}>มุมเบี่ยงเบนแนวสาย (Line Angle)</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: activeStructure.circuitType.includes("double") ? "#1e3a8a" : "#4c1d95" }}>{activeStructure.angleRange}</span>
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
          <Layers size={20} className={activeStructure.circuitType.includes("double") ? "text-blue-600" : "text-purple-600"} />
          เลือกดูโครงสร้างหัวเสาแบบอื่นๆ (คลิกเพื่อแสดงรูปจำลองสมจริง):
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {filteredStructures.map((struct) => {
            const isSelected = struct.id === activeStructureId;
            const isDouble = struct.circuitType.includes("double");
            return (
              <div
                key={struct.id}
                onClick={() => setActiveStructureId(struct.id)}
                style={{
                  backgroundColor: "white",
                  borderRadius: "14px",
                  border: isSelected ? `2px solid ${isDouble ? '#2563eb' : '#7c3aed'}` : "1px solid #e2e8f0",
                  padding: "16px 18px",
                  cursor: "pointer",
                  boxShadow: isSelected ? `0 8px 20px -4px ${isDouble ? 'rgba(37, 99, 235, 0.3)' : 'rgba(124, 58, 237, 0.3)'}` : "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "800", color: isSelected ? (isDouble ? '#2563eb' : '#7c3aed') : "#1e293b", fontSize: "1.05rem" }}>
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

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: isSelected ? (isDouble ? '#2563eb' : '#7c3aed') : "#94a3b8", fontWeight: "bold", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
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

function RealisticPoleHeadSVG({ type }: { type: string }) {
  switch (type) {
    // ---- SS SERIES (Single Circuit) ----
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
          <text x="175" y="22" fill="#38bdf8" fontSize="10" fontWeight="bold">OHGW</text>
          <rect x="145" y="70" width="30" height="14" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <circle cx="160" cy="77" r="4" fill="#1e293b" />
          <g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g key={i}>
                <rect x="157" y={84 + i * 11} width="6" height="4" fill="#475569" />
                <ellipse cx="160" cy={88 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
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
                <ellipse cx="65" cy={215 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
              </g>
            ))}
            <rect x="55" y={289} width="20" height="10" rx="3" fill="#cbd5e1" stroke="#475569" />
            <line x1="10" y1="294" x2="310" y2="294" stroke="#f59e0b" strokeWidth="5" />
            <text x="80" y="298" fill="#fbbf24" fontSize="11" fontWeight="bold">เฟส B</text>
          </g>
          <g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g key={i}>
                <ellipse cx="255" cy={215 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
              </g>
            ))}
            <rect x="245" y={289} width="20" height="10" rx="3" fill="#cbd5e1" stroke="#475569" />
            <line x1="10" y1="294" x2="310" y2="294" stroke="#f59e0b" strokeWidth="5" />
            <text x="270" y="298" fill="#fbbf24" fontSize="11" fontWeight="bold">เฟส C</text>
          </g>
          <text x="160" y="385" fill="#94a3b8" fontSize="11" textAnchor="middle">โครงสร้างวงจรเดี่ยว SS-TG (Delta Configuration)</text>
        </svg>
      );

    case "SS-SA":
    case "SS-AS":
    case "SS-LA":
    case "SS-AS-4":
    case "SS-TL":
      return (
        <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="152,40 168,40 176,380 144,380" fill="#64748b" />
          <polygon points="152,40 160,40 156,380 144,380" fill="#94a3b8" />
          <polygon points="160,40 168,40 176,380 156,380" fill="#475569" />
          <text x="160" y="200" fill="#38bdf8" fontSize="12" textAnchor="middle" fontWeight="bold">ดูรายละเอียด {type}</text>
        </svg>
      );

    // ---- DS SERIES (Double Circuit, Single Conductor) ----
    case "DS-TG":
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="152,30 168,30 178,390 142,390" fill="#64748b" />
          <polygon points="152,30 160,30 156,390 142,390" fill="#94a3b8" />
          <polygon points="160,30 168,30 178,390 156,390" fill="#475569" />
          
          <circle cx="160" cy="10" r="5" fill="#38bdf8" />
          <line x1="10" y1="10" x2="310" y2="10" stroke="#38bdf8" strokeWidth="3" />
          
          {[60, 160, 260].map((y, level) => (
            <g key={y}>
              <rect x="50" y={y} width="220" height="16" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              {/* Single Conductor Left */}
              <g>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <ellipse key={`L${i}`} cx="70" cy={y + 20 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
                ))}
                <circle cx="70" cy={y + 97} r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                <line x1="10" y1={y + 97} x2="140" y2={y + 97} stroke="#f59e0b" strokeWidth="5" />
                <text x="70" y={y + 115} fill="#fbbf24" fontSize="10" textAnchor="middle">สายเดี่ยว (1)</text>
              </g>
              {/* Single Conductor Right */}
              <g>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <ellipse key={`R${i}`} cx="250" cy={y + 20 + i * 11} rx="14" ry="4" fill="#9a3412" stroke="#7c2d12" />
                ))}
                <circle cx="250" cy={y + 97} r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                <line x1="180" y1={y + 97} x2="310" y2={y + 97} stroke="#f59e0b" strokeWidth="5" />
                <text x="250" y={y + 115} fill="#fbbf24" fontSize="10" textAnchor="middle">สายเดี่ยว (1)</text>
              </g>
            </g>
          ))}
          <text x="160" y="410" fill="#60a5fa" fontSize="12" textAnchor="middle" fontWeight="bold">เสาวงจรคู่ชนิดสายเดี่ยว DS-TG (1 เส้น/เฟส)</text>
        </svg>
      );

    case "DS-SA":
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="145" y1="180" x2="10" y2="400" stroke="#f43f5e" strokeWidth="4" strokeDasharray="6 3" />
          <polygon points="152,30 168,30 178,390 142,390" fill="#64748b" />
          <polygon points="152,30 160,30 156,390 142,390" fill="#94a3b8" />
          
          {[60, 160, 260].map((y, level) => (
            <g key={y}>
              <rect x="50" y={y} width="220" height="16" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              {/* Left Swing Single Conductor */}
              <g transform={`translate(75, ${y+16}) rotate(20)`}>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => <ellipse key={i} cx="0" cy={10 + i * 11} rx="14" ry="4" fill="#9a3412" />)}
                <circle cx="0" cy="87" r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
              </g>
              {/* Right Swing Single Conductor */}
              <g transform={`translate(245, ${y+16}) rotate(20)`}>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => <ellipse key={i} cx="0" cy={10 + i * 11} rx="14" ry="4" fill="#9a3412" />)}
                <circle cx="0" cy="87" r="6" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
              </g>
            </g>
          ))}
          <text x="160" y="410" fill="#60a5fa" fontSize="12" textAnchor="middle" fontWeight="bold">เสาวงจรคู่ชนิดสายเดี่ยว ทางโค้ง DS-SA</text>
        </svg>
      );
    
    case "DS-AS":
    case "DS-LA":
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="152,30 168,30 178,390 142,390" fill="#64748b" />
          <polygon points="152,30 160,30 156,390 142,390" fill="#94a3b8" />
          <text x="160" y="210" fill="#60a5fa" fontSize="12" textAnchor="middle" fontWeight="bold">รูปแบบ DS-AS / DS-LA (สายเดี่ยว)</text>
        </svg>
      );


    // ---- DD SERIES (Double Circuit, Double Conductor / Twin Bundle) ----
    case "DD-SA-2":
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="145" y1="180" x2="10" y2="400" stroke="#f43f5e" strokeWidth="6" strokeDasharray="8 4" />
          <polygon points="150,20 170,20 182,390 138,390" fill="#64748b" />
          
          {[60, 160, 260].map((y, level) => (
            <g key={y}>
              <rect x="40" y={y} width="240" height="20" rx="2" fill="#cbd5e1" stroke="#334155" strokeWidth="3" />
              {/* U-Bracket Left */}
              <path d={`M 75,${y+20} L 75,${y+35} L 85,${y+35} L 85,${y+20}`} stroke="#475569" strokeWidth="3" fill="none" />
              {/* Twin Bundle Swing Left (Max 45 deg) */}
              <g transform={`translate(80, ${y+35}) rotate(40)`}>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => <ellipse key={i} cx="0" cy={10 + i * 11} rx="16" ry="5" fill="#9a3412" />)}
                <polygon points="0,85 -15,95 15,95" fill="#94a3b8" />
                <line x1="-15" y1="95" x2="-15" y2="105" stroke="#f59e0b" strokeWidth="4" />
                <line x1="15" y1="95" x2="15" y2="105" stroke="#f59e0b" strokeWidth="4" />
              </g>

              {/* U-Bracket Right */}
              <path d={`M 235,${y+20} L 235,${y+35} L 245,${y+35} L 245,${y+20}`} stroke="#475569" strokeWidth="3" fill="none" />
              {/* Twin Bundle Swing Right */}
              <g transform={`translate(240, ${y+35}) rotate(40)`}>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => <ellipse key={i} cx="0" cy={10 + i * 11} rx="16" ry="5" fill="#9a3412" />)}
                <polygon points="0,85 -15,95 15,95" fill="#94a3b8" />
                <line x1="-15" y1="95" x2="-15" y2="105" stroke="#f59e0b" strokeWidth="4" />
                <line x1="15" y1="95" x2="15" y2="105" stroke="#f59e0b" strokeWidth="4" />
              </g>
            </g>
          ))}
          <text x="160" y="410" fill="#34d399" fontSize="12" textAnchor="middle" fontWeight="bold">เสาวงจรคู่ชนิดสายคู่แฝด ทางโค้ง DD-SA-2 (U-Bracket)</text>
        </svg>
      );
      
    case "DD-AS-2":
      // Twin bundle anchor with Slack Span
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,20 170,20 182,390 138,390" fill="#64748b" />
          
          {[70, 170, 270].map((y, level) => (
            <g key={y}>
              <rect x="30" y={y} width="260" height="26" rx="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="3" />
              
              {/* Left Circuit Dead Ends (Twin) - Tension Side */}
              <g>
                <polygon points="75,y+4 75,y+22 55,y+13" fill="#94a3b8" transform={`translate(0, ${y})`} />
                {[0, 1, 2, 3, 4].map(i => <ellipse key={`L1_${i}`} cx={45 - i * 8} cy={y+4} rx="3" ry="10" fill="#9a3412" /> )}
                {[0, 1, 2, 3, 4].map(i => <ellipse key={`L2_${i}`} cx={45 - i * 8} cy={y+22} rx="3" ry="10" fill="#9a3412" /> )}
                <path d={`M 10,${y+4} Q 60,${y+55} 110,${y+4}`} stroke="#f59e0b" strokeWidth="3" fill="none" />
                <path d={`M 10,${y+22} Q 60,${y+75} 110,${y+22}`} stroke="#f59e0b" strokeWidth="3" fill="none" />
              </g>

              {/* Right Circuit Dead Ends (Twin) - Slack Span Side */}
              <g>
                <polygon points="245,y+4 245,y+22 265,y+13" fill="#94a3b8" transform={`translate(0, ${y})`} />
                {/* Slack span drops downwards at a steeper angle */}
                <g transform={`translate(265, ${y+13}) rotate(30)`}>
                  {[0, 1, 2, 3].map(i => <ellipse key={`R1_${i}`} cx={10 + i * 8} cy="-9" rx="3" ry="10" fill="#9a3412" /> )}
                  {[0, 1, 2, 3].map(i => <ellipse key={`R2_${i}`} cx={10 + i * 8} cy="9" rx="3" ry="10" fill="#9a3412" /> )}
                  <line x1="45" y1="-9" x2="70" y2="-9" stroke="#f59e0b" strokeWidth="3" />
                  <line x1="45" y1="9" x2="70" y2="9" stroke="#f59e0b" strokeWidth="3" />
                </g>
                <path d={`M 210,${y+4} Q 260,${y+55} 280,${y+35}`} stroke="#f59e0b" strokeWidth="3" fill="none" />
                <path d={`M 210,${y+22} Q 260,${y+75} 290,${y+50}`} stroke="#f59e0b" strokeWidth="3" fill="none" />
                <text x="280" y={y-5} fill="#f87171" fontSize="9" fontWeight="bold">Slack Span</text>
              </g>
            </g>
          ))}
          <text x="160" y="410" fill="#34d399" fontSize="12" textAnchor="middle" fontWeight="bold">เสายึดดึงตรง Twin Bundle DD-AS-2 (Slack Span)</text>
        </svg>
      );

    case "DD-DD-1":
      // DOUBLE POLE (H-FRAME) Double Deadend
      return (
        <svg width="460" height="420" viewBox="0 0 460 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Pole */}
          <polygon points="120,30 140,30 152,400 108,400" fill="#64748b" />
          <polygon points="120,30 130,30 126,400 108,400" fill="#94a3b8" />
          
          {/* Right Pole */}
          <polygon points="320,30 340,30 352,400 308,400" fill="#64748b" />
          <polygon points="320,30 330,30 326,400 308,400" fill="#94a3b8" />

          {/* Long Crossarms across both poles */}
          {[80, 180, 280].map((y) => (
            <g key={y}>
              <rect x="60" y={y} width="340" height="26" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="3" />
              {/* X-Braces between poles for stability */}
              <line x1="130" y1={y+26} x2="330" y2={y+100} stroke="#475569" strokeWidth="4" />
              <line x1="330" y1={y+26} x2="130" y2={y+100} stroke="#475569" strokeWidth="4" />
              
              {/* Insulators and Twin Bundles Left */}
              <g>
                <polygon points="85,y+4 85,y+22 65,y+13" fill="#94a3b8" transform={`translate(0, ${y})`} />
                {[0, 1, 2, 3, 4, 5].map(i => <ellipse key={`L_${i}`} cx={55 - i * 8} cy={y+4} rx="4" ry="12" fill="#9a3412" /> )}
                {[0, 1, 2, 3, 4, 5].map(i => <ellipse key={`L2_${i}`} cx={55 - i * 8} cy={y+22} rx="4" ry="12" fill="#9a3412" /> )}
                <line x1="10" y1={y+4} x2="15" y2={y+4} stroke="#f59e0b" strokeWidth="4" />
                <line x1="10" y1={y+22} x2="15" y2={y+22} stroke="#f59e0b" strokeWidth="4" />
              </g>

              {/* Jumper across H-Frame */}
              <path d={`M 90,${y+26} Q 230,${y+120} 370,${y+26}`} stroke="#f59e0b" strokeWidth="3" fill="none" />
              <path d={`M 90,${y+10} Q 230,${y+100} 370,${y+10}`} stroke="#f59e0b" strokeWidth="3" fill="none" />

              {/* Insulators and Twin Bundles Right */}
              <g>
                <polygon points="375,y+4 375,y+22 395,y+13" fill="#94a3b8" transform={`translate(0, ${y})`} />
                {[0, 1, 2, 3, 4, 5].map(i => <ellipse key={`R_${i}`} cx={405 + i * 8} cy={y+4} rx="4" ry="12" fill="#9a3412" /> )}
                {[0, 1, 2, 3, 4, 5].map(i => <ellipse key={`R2_${i}`} cx={405 + i * 8} cy={y+22} rx="4" ry="12" fill="#9a3412" /> )}
                <line x1="445" y1={y+4} x2="450" y2={y+4} stroke="#f59e0b" strokeWidth="4" />
                <line x1="445" y1={y+22} x2="450" y2={y+22} stroke="#f59e0b" strokeWidth="4" />
              </g>
            </g>
          ))}
          <text x="230" y="415" fill="#facc15" fontSize="14" textAnchor="middle" fontWeight="bold">เสาคู่โครงสร้าง H-Frame DD-DD-1 (Double Pole Dead End)</text>
        </svg>
      );

    case "DD-DD-2":
      // Single Pole Double Deadend
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,20 170,20 182,390 138,390" fill="#64748b" />
          {[70, 170, 270].map((y, level) => (
            <g key={y}>
              <rect x="30" y={y} width="260" height="26" rx="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="3" />
              {/* Left Circuit Dead Ends (Twin) */}
              <g>
                <polygon points="75,y+4 75,y+22 55,y+13" fill="#94a3b8" transform={`translate(0, ${y})`} />
                {[0, 1, 2, 3, 4].map(i => <ellipse key={`L1_${i}`} cx={45 - i * 8} cy={y+4} rx="3" ry="10" fill="#9a3412" /> )}
                {[0, 1, 2, 3, 4].map(i => <ellipse key={`L2_${i}`} cx={45 - i * 8} cy={y+22} rx="3" ry="10" fill="#9a3412" /> )}
                <path d={`M 10,${y+4} Q 60,${y+55} 110,${y+4}`} stroke="#f59e0b" strokeWidth="3" fill="none" />
                <path d={`M 10,${y+22} Q 60,${y+75} 110,${y+22}`} stroke="#f59e0b" strokeWidth="3" fill="none" />
              </g>
              {/* Right Circuit Dead Ends (Twin) */}
              <g>
                <polygon points="245,y+4 245,y+22 265,y+13" fill="#94a3b8" transform={`translate(0, ${y})`} />
                {[0, 1, 2, 3, 4].map(i => <ellipse key={`R1_${i}`} cx={275 + i * 8} cy={y+4} rx="3" ry="10" fill="#9a3412" /> )}
                {[0, 1, 2, 3, 4].map(i => <ellipse key={`R2_${i}`} cx={275 + i * 8} cy={y+22} rx="3" ry="10" fill="#9a3412" /> )}
                <path d={`M 210,${y+4} Q 260,${y+55} 310,${y+4}`} stroke="#f59e0b" strokeWidth="3" fill="none" />
                <path d={`M 210,${y+22} Q 260,${y+75} 310,${y+22}`} stroke="#f59e0b" strokeWidth="3" fill="none" />
              </g>
            </g>
          ))}
          <text x="160" y="410" fill="#34d399" fontSize="12" textAnchor="middle" fontWeight="bold">เสายึดดึงตรงต้นเดียว Twin Bundle DD-DD-2</text>
        </svg>
      );

    case "DD-LS-1":
      // Line Spacer / Line Post 
      return (
        <svg width="320" height="420" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,20 170,20 182,390 138,390" fill="#64748b" />
          {[70, 170, 270].map((y, level) => (
            <g key={y}>
              <rect x="40" y={y} width="240" height="20" rx="2" fill="#cbd5e1" stroke="#334155" strokeWidth="3" />
              
              {/* TWIN BUNDLE LEFT */}
              <g>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <ellipse key={`L${i}`} cx="70" cy={y + 24 + i * 11} rx="16" ry="5" fill="#9a3412" stroke="#7c2d12" />
                ))}
                {/* Horizontal Line Post Insulator projecting from Pole to support jumper! */}
                <rect x="90" y={y + 105} width="60" height="8" rx="2" fill="#f87171" stroke="#b91c1c" />
                {[0,1,2,3,4].map(i => <ellipse key={`LP_${i}`} cx={100 + i*10} cy={y+109} rx="4" ry="12" fill="#9a3412" /> )}
                
                {/* Yoke Plate (Triangle) */}
                <polygon points="70,98 55,108 85,108" fill="#94a3b8" stroke="#475569" transform={`translate(0, ${y})`} />
                {/* Twin Wires Left */}
                <line x1="10" y1={y + 110} x2="140" y2={y + 110} stroke="#f59e0b" strokeWidth="4" />
                <line x1="10" y1={y + 118} x2="140" y2={y + 118} stroke="#f59e0b" strokeWidth="4" />
              </g>

              {/* TWIN BUNDLE RIGHT */}
              <g>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <ellipse key={`R${i}`} cx="250" cy={y + 24 + i * 11} rx="16" ry="5" fill="#9a3412" stroke="#7c2d12" />
                ))}
                {/* Horizontal Line Post Right */}
                <rect x="170" y={y + 105} width="60" height="8" rx="2" fill="#f87171" stroke="#b91c1c" />
                {[0,1,2,3,4].map(i => <ellipse key={`RP_${i}`} cx={180 + i*10} cy={y+109} rx="4" ry="12" fill="#9a3412" /> )}
                
                <polygon points="250,98 235,108 265,108" fill="#94a3b8" stroke="#475569" transform={`translate(0, ${y})`} />
                {/* Twin Wires Right */}
                <line x1="180" y1={y + 110} x2="310" y2={y + 110} stroke="#f59e0b" strokeWidth="4" />
                <line x1="180" y1={y + 118} x2="310" y2={y + 118} stroke="#f59e0b" strokeWidth="4" />
              </g>
            </g>
          ))}
          <text x="160" y="410" fill="#34d399" fontSize="12" textAnchor="middle" fontWeight="bold">เสาประคองสายมีลูกถ้วยแนวนอน DD-LS-1 (Line Post)</text>
        </svg>
      );

    default:
      return null;
  }
}
