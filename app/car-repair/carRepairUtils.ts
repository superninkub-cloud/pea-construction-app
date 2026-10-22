// app/car-repair/carRepairUtils.ts
/**
 * Utility functions, sample datasets, and document export generators
 * for Vehicle Repair Memo Application (โปรแกรมแจ้งซ่อมรถยนต์)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export type RepairCaseType = 'vehicle_dept' | 'pea_area';

export interface CarRepairFormData {
  // Case selection
  repairCase: RepairCaseType; // 'vehicle_dept' = กรณีที่ 1 (ผยค.(ก3) ซ่อม) | 'pea_area' = กรณีที่ 2 (การไฟฟ้าพื้นที่ซ่อม)

  // Memo Header
  docFrom: string;              // จาก เช่น ผกร. หรือ กรย.(ก3)
  docTo: string;                // ถึง เช่น กรย.(ก3) หรือ กฟส.สค.2(บพว.)
  docNo: string;                // เลขที่หนังสือ เช่น ก.3 กรย.(กร)- หรือ ก.3 กรย.(กร)
  docDate: string;              // วันที่ เช่น ๒๐ ต.ค. ๒๕๖๗
  subject: string;              // เรื่อง
  salutation: string;           // เรียน เช่น อก.รย.(ก3) ผ่าน รก.รย.(ก3) หรือ ผจก.กฟส.สค.2(บพว.)

  // Vehicle Information
  vehicleType: string;          // ชนิดรถ เช่น รถเครน TADANO ขนาดพิกัด ๓๐ ตัน/เมตร, รถยนต์เทรลเลอร์
  licensePlate: string;         // ทะเบียนรถ เช่น ๙๐-๗๓๓๒ นฐ., ๘๕-๓๐๙๐ นฐ.
  assignedUnit: string;         // สังกัด/ใช้งานประจำ เช่น ผกร. หรือ กรย.(ก3)
  driverName: string;           // ชื่อพนักงานขับรถ เช่น นายขวัญเรือน มีถาวร, นายธวัชชัย โต๊ะศรีสุข
  driverPosition: string;       // ตำแหน่ง เช่น พขร.(บ)
  
  // Meter & Usage (กรณีที่ 1 พบบ่อย)
  mileage: string;              // เลขไมล์ เช่น ๕๔,๒๖๘
  craneHours: string;           // ชั่วโมงเครน เช่น ๑,๘๙๙
  engineHours: string;          // ชั่วโมงเครื่อง เช่น ๓,๘๓๕.๕

  // Work & Site Details (กรณีที่ 2 พบบ่อย)
  peaAreaName: string;          // การไฟฟ้าพื้นที่ เช่น กฟส.สค.2(บพว.)
  workDetails: string;          // รายละเอียดงาน เช่น ก่อสร้างปรับปรุงระบบจำหน่าย (บริเวณช่วงแยกดอนราวถึงวัดหลักสี่) ต.ยกกระบัตร อ.บ้านแพ้ว จ.สมุทรสาคร
  wbsNo: string;                // หมายเลขงาน WBS เช่น I-68-I-SM2'A.IQ.2001
  networkNo: string;            // โครงข่าย เช่น ๗๐๐๑๑๑๗๓๖๙
  activityNo: string;           // กิจกรรม เช่น ๐๐๕๐

  // Breakdown & Repair items
  defectItems: string[];        // รายการชำรุด เช่น ["สายวัดความยาวบูมชำรุด", "ข้อต่อท่อไอเสียชำรุด"]
  customBodyText?: string;      // ข้อความเพิ่มเติมหรือแทนที่ (ถ้ามี)

  // Budget & Remarks
  budgetSource: string;         // แหล่งงบประมาณ เช่น งบทำการของ ผยค.(ก3) หรือ หมายเลขงาน (WBS)
  closingStatement: string;     // ข้อความปิดท้าย

  // Proposer Signature (ผู้เสนอ / ผู้แจ้ง)
  proposerName: string;         // เช่น นายพิสันติ์ จิตต์ปลื้ม หรือ นายอนันต์ กาญจนอุปถัมภ์
  proposerPosition: string;     // เช่น หผ.กร.(ก3) หรือ รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
  proposerDate: string;         // วันที่ลงนาม

  // Commander / Director Order (กรณีที่ 1: ส่วนแทงเรื่องสั่งการด้านล่าง)
  hasCommanderOrder: boolean;   // แสดงส่วนแทงเรื่องสั่งการหรือไม่
  commanderTarget: string;      // ถึงหน่วยงานปลายทาง เช่น ผยค.(ก3)
  commandText: string;          // ข้อความสั่งการ เช่น ดำเนินการต่อไป
  commanderName: string;        // เช่น นายอนันต์ กาญจนอุปถัมภ์
  commanderPosition: string;    // เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
  commanderDate: string;        // เช่น ๑๙ ต.ค. ๖๗

  // Visual Digital Signature Flags
  showProposerDigitalSign: boolean;
  showCommanderDigitalSign: boolean;
}

/**
 * Thai Numerals Converter
 */
export function toThaiNumerals(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return str.toString().replace(/[0-9]/g, (match) => thaiDigits[parseInt(match, 10)]);
}

/**
 * Arabic Numerals Converter
 */
export function toArabicNumerals(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  const thaiToEng: Record<string, string> = {
    '๐': '0', '๑': '1', '๒': '2', '๓': '3', '๔': '4',
    '๕': '5', '๖': '6', '๗': '7', '๘': '8', '๙': '9'
  };
  return str.toString().replace(/[๐-๙]/g, (match) => thaiToEng[match] || match);
}

/**
 * Thai Date Helper
 */
export function getTodayThaiDate(format: 'short' | 'full' | 'thai_num' = 'short'): string {
  const date = new Date();
  const day = date.getDate();
  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const monthShort = thaiMonthsShort[date.getMonth()];
  const monthFull = thaiMonthsFull[date.getMonth()];
  const yearThai = date.getFullYear() + 543;
  const yearShort = yearThai.toString().slice(-2);

  if (format === 'short') {
    return `${day} ${monthShort} ${yearShort}`;
  } else if (format === 'thai_num') {
    return `${toThaiNumerals(day)} ${monthShort} ${toThaiNumerals(yearThai)}`;
  } else {
    return `${day} ${monthFull} ${yearThai}`;
  }
}

/**
 * Popular PEA Vehicle Types
 */
export const POPULAR_VEHICLE_TYPES = [
  'รถเครน TADANO ขนาดพิกัด ๓๐ ตัน/เมตร',
  'รถเครน ขนาดพิกัด ๒๕ ตัน',
  'รถยนต์เทรลเลอร์',
  'รถบรรทุก ๖ ล้อ ติดเครน ๕ ตัน',
  'รถบรรทุก ๖ ล้อ เทท้าย',
  'รถบรรทุก ๑๐ ล้อ หัวลาก',
  'รถขุดตีนตะขาบ (Excavator)',
  'รถขุดล้อยาง (Backhoe)',
  'รถยนต์บรรทุกดีเซล ๔ ประตู (Double Cab)',
  'รถยนต์บรรทุกดีเซล ตอนเดียว',
  'รถเจาะหลุมติดตั้งเสาไฟฟ้า',
  'รถกระเช้าซ่อมแซมระบบไฟฟ้า'
];

/**
 * Popular Breakdown / Defect Symptoms
 */
export const POPULAR_DEFECT_ITEMS = [
  'วาล์วลมเบรกชำรุด',
  'สายวัดความยาวบูมชำรุด',
  'ข้อต่อท่อไอเสียชำรุด',
  'ระบบเบรกชำรุด / ผ้าเบรกหมด',
  'ซีลกระบอกไฮดรอลิกชำรุด / รั่วซึม',
  'สายไฮดรอลิกแตก / รั่วซึม',
  'เปลี่ยนถ่ายน้ำมันเครื่อง ไส้กรองเครื่อง ไส้กรองโซล่า',
  'ยางรถยนต์เสื่อมสภาพ / ยางระเบิด / เปลี่ยนยางใหม่',
  'แบตเตอรี่เสื่อมสภาพ สตาร์ทไม่ติด',
  'ระบบแอร์ไม่เย็น / คอมเพรสเซอร์แอร์ชำรุด',
  'ไดสตาร์ท / ไดชาร์จชำรุด',
  'ระบบไฟส่องสว่าง / ไฟสัญญาณชำรุด',
  'ระบบคลัตช์ลื่น / ชุดคลัตช์หมดสภาพ',
  'ระบบช่วงล่าง / ลูกหมากคันชักชำรุด',
  'หม้อน้ำรั่ว / พัดลมหม้อน้ำไม่ทำงาน'
];

/**
 * Helper to compose standardized PEA vehicle repair subject
 */
export function composeCarRepairSubject(params: {
  vehicleType?: string;
  licensePlate?: string;
  prefix?: string;
}): string {
  const prefix = params.prefix || 'ขอแจ้งซ่อม';
  const vType = (params.vehicleType || 'รถยนต์').trim();
  const plate = (params.licensePlate || '').trim();
  if (plate) {
    return `${prefix}${vType} หมายเลขทะเบียน ${plate}`;
  }
  return `${prefix}${vType}`;
}

export interface VehiclePreset {
  key: string;
  badge: string;
  vehicleType: string;
  licensePlate: string;
  driverName: string;
  driverPosition: string;
  mileage: string;
  craneHours?: string;
  engineHours?: string;
  subject: string;
}

export const COMMON_VEHICLE_PRESETS: VehiclePreset[] = [
  {
    key: 'tadano-crane',
    badge: '🏗️ รถเครน TADANO ๓๐ ตัน/เมตร (๙๐-๗๓๓๒ นฐ.)',
    vehicleType: 'รถเครน TADANO ขนาดพิกัด ๓๐ ตัน/เมตร',
    licensePlate: '๙๐-๗๓๓๒ นฐ.',
    driverName: 'นายขวัญเรือน มีถาวร',
    driverPosition: 'พขร.(บ)',
    mileage: '๕๔,๒๖๘',
    craneHours: '๑,๘๘๗',
    engineHours: '๓,๘๓๕.๕',
    subject: 'ขอแจ้งซ่อมรถเครน TADANO ขนาดพิกัด ๓๐ ตัน/เมตร หมายเลขทะเบียน ๙๐-๗๓๓๒ นฐ.'
  },
  {
    key: 'kato-crane',
    badge: '🏗️ รถเครน KATO ๒๕ ตัน (๘๑-๔๕๒๐ นฐ.)',
    vehicleType: 'รถเครน KATO ขนาดพิกัด ๒๕ ตัน',
    licensePlate: '๘๑-๔๕๒๐ นฐ.',
    driverName: 'นายสมบัติ ศรีสุข',
    driverPosition: 'พขร.(บ)',
    mileage: '๗๘,๔๐๐',
    craneHours: '๒,๑๕๐',
    engineHours: '๔,๒๐๐',
    subject: 'ขอแจ้งซ่อมรถเครน KATO ขนาดพิกัด ๒๕ ตัน หมายเลขทะเบียน ๘๑-๔๕๒๐ นฐ.'
  },
  {
    key: 'trailer-truck',
    badge: '🚛 รถยนต์เทรลเลอร์ (๘๕-๓๐๙๐ นฐ.)',
    vehicleType: 'รถยนต์เทรลเลอร์',
    licensePlate: '๘๕-๓๐๙๐ นฐ.',
    driverName: 'นายธวัชชัย โต๊ะศรีสุข',
    driverPosition: 'พขร.(บ)',
    mileage: '๑๒๔,๕๕๐',
    engineHours: '๕,๑๒๐',
    subject: 'ขอแจ้งซ่อมรถยนต์เทรลเลอร์ หมายเลขทะเบียน ๘๕-๓๐๙๐ นฐ.'
  },
  {
    key: 'six-wheel-crane',
    badge: '🚚 รถบรรทุก ๖ ล้อ ติดเครน ๕ ตัน (๘๒-๑๑๔๕ นฐ.)',
    vehicleType: 'รถบรรทุก ๖ ล้อ ติดเครน ๕ ตัน',
    licensePlate: '๘๒-๑๑๔๕ นฐ.',
    driverName: 'นายวันชัย พึ่งสุข',
    driverPosition: 'พขร.(บ)',
    mileage: '๙๒,๑๐๐',
    craneHours: '๙๕๐',
    engineHours: '๒,๘๐๐',
    subject: 'ขอแจ้งซ่อมรถบรรทุก ๖ ล้อ ติดเครน ๕ ตัน หมายเลขทะเบียน ๘๒-๑๑๔๕ นฐ.'
  },
  {
    key: 'pickup-4door',
    badge: '🛻 รถกระบะ ๔ ประตู (Double Cab)',
    vehicleType: 'รถยนต์บรรทุกดีเซล ๔ ประตู (Double Cab)',
    licensePlate: 'กค ๕๖๗๘ นฐ.',
    driverName: 'นายศักดิ์ดา ทองดี',
    driverPosition: 'พขร.(บ)',
    mileage: '๑๔๕,๘๐๐',
    subject: 'ขอแจ้งซ่อมรถยนต์บรรทุกดีเซล ๔ ประตู (Double Cab) หมายเลขทะเบียน กค ๕๖๗๘ นฐ.'
  },
  {
    key: 'aerial-bucket',
    badge: '🪜 รถกระเช้าซ่อมแซมระบบไฟฟ้า (๘๔-๗๗๘๙ นฐ.)',
    vehicleType: 'รถกระเช้าซ่อมแซมระบบไฟฟ้า',
    licensePlate: '๘๔-๗๗๘๙ นฐ.',
    driverName: 'นายบุญเลิศ มีชัย',
    driverPosition: 'พขร.(บ)',
    mileage: '๖๘,๓๐๐',
    engineHours: '๑,๙๕๐',
    subject: 'ขอแจ้งซ่อมรถกระเช้าซ่อมแซมระบบไฟฟ้า หมายเลขทะเบียน ๘๔-๗๗๘๙ นฐ.'
  }
];

/**
 * Sample Data for Case 1 (ตรงตามรูปต้นฉบับ กฟภ.):
 * แจ้งให้แผนกยานพาหนะซ่อมให้ (ผยค.(ก3) / งบทำการ ผยค.(ก3))
 */
export const SAMPLE_CASE1_VEHICLE_DEPT_DATA: CarRepairFormData = {
  repairCase: 'vehicle_dept',
  docFrom: 'ผกร.',
  docTo: 'กรย.(ก3)',
  docNo: 'ก.๓ กรย.(กร)- ๒๔๓๗/๒๕๖๓',
  docDate: '๑๗ ต.ค. ๖๓',
  subject: 'ขอแจ้งซ่อมรถเครน TADANO ขนาดพิกัด ๓๐ ตัน/เมตร หมายเลขทะเบียน ๙๐-๗๓๓๒ นฐ.',
  salutation: 'อก.รย.(ก3) ผ่าน รก.รย.(ก3)',

  vehicleType: 'รถเครน TADANO ขนาดพิกัด ๓๐ ตัน/เมตร',
  licensePlate: '๙๐-๗๓๓๒ นฐ.',
  assignedUnit: 'ผกร.',
  driverName: 'นายขวัญเรือน มีถาวร',
  driverPosition: 'พขร.(บ)',

  mileage: '๕๔,๒๖๘',
  craneHours: '๑,๘๘๗',
  engineHours: '๓,๘๓๕.๕',

  peaAreaName: '',
  workDetails: '',
  wbsNo: '',
  networkNo: '',
  activityNo: '',

  defectItems: [
    'สายวัดความยาวบูมชำรุด',
    'ข้อต่อท่อไอเสียชำรุด'
  ],

  budgetSource: 'งบทำการของ ผยค.(ก3)',
  closingStatement: 'จึงเรียนมาเพื่อโปรดพิจารณาส่งซ่อม โดยขอเบิกจ่ายค่าใช้จ่ายจาก งบทำการของ ผยค.(ก3) ต่อไป',

  proposerName: 'นายพิสันติ์ จิตต์ปลื้ม',
  proposerPosition: 'หผ.กร.(ก3)',
  proposerDate: '',

  hasCommanderOrder: true,
  commanderTarget: '- หผ.ยค.(ก3)',
  commandText: 'ดำเนินการต่อไป',
  commanderName: 'นายอนันต์ กาญจนอุปถัมภ์',
  commanderPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  commanderDate: '๑๙ ต.ค. ๖๓',

  showProposerDigitalSign: true,
  showCommanderDigitalSign: true
};

/**
 * Sample Data for Case 2 (ตรงตาม Image 1):
 * ให้การไฟฟ้าที่ กรย. เข้าดำเนินงานซ่อมให้ (เบิกจ่าย WBS ของงานก่อสร้าง)
 */
export const SAMPLE_CASE2_PEA_AREA_DATA: CarRepairFormData = {
  repairCase: 'pea_area',
  docFrom: 'กรย.(ก3)',
  docTo: 'กฟส.สค.2(บพว.)',
  docNo: 'ก.3 กรย.(กร) ๒๔๔๓/๒๕๖๑',
  docDate: '๒๐ ต.ค. ๖๑',
  subject: 'ขอความอนุเคราะห์จัดซ่อมรถยนต์เทรลเลอร์ หมายเลขทะเบียน ๘๕-๓๐๙๐ นฐ.',
  salutation: 'ผจก.กฟส.สค.2(บพว.)',

  vehicleType: 'รถยนต์เทรลเลอร์',
  licensePlate: '๘๕-๓๐๙๐ นฐ.',
  assignedUnit: 'กรย.(ก3)',
  driverName: 'นายธวัชชัย โต๊ะศรีสุข',
  driverPosition: 'พขร.(บ)',

  mileage: '',
  craneHours: '',
  engineHours: '',

  peaAreaName: 'กฟส.สค.2(บพว.)',
  workDetails: 'ก่อสร้างปรับปรุงระบบจำหน่าย (บริเวณช่วงแยกดอนราวถึงวัดหลักสี่) ต.ยกกระบัตร อ.บ้านแพ้ว จ.สมุทรสาคร',
  wbsNo: 'I-68-I-SM2\'A.IQ.2001',
  networkNo: '๗๐๐๑๑๑๗๓๖๙',
  activityNo: '๐๐๕๐',

  defectItems: [
    'วาล์วลมเบรก'
  ],

  budgetSource: 'หมายเลขงาน (WBS): I-68-I-SM2\'A.IQ.2001 โครงข่าย ๗๐๐๑๑๑๗๓๖๙ กิจกรรม ๐๐๕๐',
  closingStatement: 'จึงเรียนมาเพื่อโปรดพิจารณา และดำเนินการให้ต่อไปด้วย',

  proposerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  proposerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  proposerDate: '๒๐ ต.ค. ๖๑',

  hasCommanderOrder: false,
  commanderTarget: '',
  commandText: '',
  commanderName: '',
  commanderPosition: '',
  commanderDate: '',

  showProposerDigitalSign: true,
  showCommanderDigitalSign: false
};

/**
 * Generate Main Paragraph Text for Case 1 (ตรงตามบันทึกข้อความ กฟภ.)
 */
export function generateCase1BodyText(data: CarRepairFormData): string {
  let text = `ด้วย แผนกก่อสร้างระบบไฟฟ้า (${data.assignedUnit || 'ผกร.'}) มีรถยนต์ ${data.vehicleType} หมายเลขทะเบียน ${data.licensePlate} ใช้งานประจำที่ ${data.assignedUnit || 'ผกร.'} โดยมี ${data.driverName} ตำแหน่ง ${data.driverPosition} เป็นพนักงานขับรถยนต์คันดังกล่าว ซึ่งปัจจุบันเลขไมล์ ${data.mileage} กิโลเมตร`;
  
  if (data.craneHours) {
    text += ` ชั่วโมงเครน ${data.craneHours} ชั่วโมง`;
  }
  if (data.engineHours) {
    text += ` ชั่วโมงเครื่องยนต์ ${data.engineHours} ชั่วโมง`;
  }
  text += ` เกิดการชำรุดดังนี้`;

  return text;
}

/**
 * Generate Paragraphs Text for Case 2
 */
export function generateCase2BodyParts(data: CarRepairFormData): {
  intro: string;
  items: string[];
  request: string;
} {
  const intro = `ด้วย ${data.vehicleType} หมายเลขทะเบียน ${data.licensePlate} ประจำ ${data.assignedUnit} ได้นำมาใช้ปฏิบัติงานให้กับ ${data.peaAreaName} โดย${data.workDetails} หมายเลขงาน ${data.wbsNo} ซึ่งมี ${data.driverName} ${data.driverPosition} เป็นผู้ขับขี่ พบว่าเกิดการชำรุด ดำเนินการซ่อมดังนี้`;

  const request = `จึงขอความอนุเคราะห์ให้ ${data.peaAreaName} ดำเนินการจัดซ่อมรถยนต์ดังกล่าว โดยให้เบิกจ่ายจากหมายเลขงาน (WBS): ${data.wbsNo} โครงข่าย ${data.networkNo} กิจกรรม ${data.activityNo} เพื่อให้สามารถนำมาใช้ปฏิบัติงานก่อสร้าง และสนับสนุนภารกิจต่างๆ ให้กับ ${data.peaAreaName} ต่อไป`;

  return {
    intro,
    items: data.defectItems,
    request
  };
}

/**
 * Generate Plain Text for Copying / Messaging
 */
export function generateCarRepairMemoPlainText(data: CarRepairFormData): string {
  const isCase1 = data.repairCase === 'vehicle_dept';
  let content = `บันทึกข้อความ\n`;
  content += `การไฟฟ้าส่วนภูมิภาค\n\n`;
  content += `หน่วยงาน: ${data.docFrom}\t\tถึง: ${data.docTo || 'กรย.(ก3)'}\n`;
  content += `ที่: ${data.docNo || '-'}\t\tวันที่: ${data.docDate || '-'}\n`;
  content += `เรื่อง: ${data.subject}\n`;
  content += `เรียน: ${data.salutation}\n\n`;

  if (isCase1) {
    content += `     ${generateCase1BodyText(data)}\n\n`;
    if (data.defectItems && data.defectItems.length > 0) {
      data.defectItems.forEach((defect, idx) => {
        content += `     ${toThaiNumerals(idx + 1)}. ${defect}\n`;
      });
    }
    content += `\n     ${data.closingStatement}\n\n`;
    content += `\t\t\t\t\t(${data.proposerName})\n`;
    content += `\t\t\t\t\t${data.proposerPosition}\n\n`;

    if (data.hasCommanderOrder) {
      content += `----------------------------------------\n`;
      content += `${data.commanderTarget || '- หผ.ยค.(ก3)'}\n`;
      content += `     ${data.commandText || 'ดำเนินการต่อไป'}\n\n`;
      content += `\t\t\t\t\t(${data.commanderName})\n`;
      content += `\t\t\t\t\t${data.commanderPosition}\n`;
      if (data.commanderDate) {
        content += `\t\t\t\t\t${data.commanderDate}\n`;
      }
    }
  } else {
    const parts = generateCase2BodyParts(data);
    content += `     ${parts.intro}\n`;
    parts.items.forEach((item, index) => {
      content += `     ${toThaiNumerals(index + 1)}. ${item}\n`;
    });
    content += `\n     ${parts.request}\n\n`;
    content += `     ${data.closingStatement}\n\n`;
    content += `\t\t\t\t\t${data.proposerDate}\n`;
    content += `\t\t\t\t\t(${data.proposerName})\n`;
    content += `\t\t\t\t\t${data.proposerPosition}\n`;
  }

  return content;
}

/**
 * Generate Word (.doc) HTML Export Document
 */
export function generateCarRepairWordDocument(data: CarRepairFormData): string {
  const isCase1 = data.repairCase === 'vehicle_dept';
  
  let bodyHtml = '';
  if (isCase1) {
    const defectsListHtml = data.defectItems && data.defectItems.length > 0 
      ? `<div style="margin: 8pt 0 8pt 3cm; line-height: 1.6;">
          ${data.defectItems.map((item, idx) => `<div>${toThaiNumerals(idx + 1)}. <b>${item}</b></div>`).join('')}
         </div>`
      : '';

    bodyHtml = `
      <p style="text-indent: 2.5cm; margin-bottom: 12pt; text-align: justify; line-height: 1.6;">
        ${generateCase1BodyText(data)}
      </p>
      ${defectsListHtml}
      <p style="text-indent: 2.5cm; margin-bottom: 24pt; line-height: 1.6;">
        ${data.closingStatement}
      </p>
      <div style="margin-left: 55%; text-align: center; margin-bottom: 30pt; line-height: 1.4;">
        <br/><br/>
        <div>(${data.proposerName})</div>
        <div>${data.proposerPosition}</div>
        ${data.proposerDate ? `<div>${data.proposerDate}</div>` : ''}
      </div>
      ${data.hasCommanderOrder ? `
        <div style="margin-top: 24pt; padding-top: 12pt; border-top: 1px dashed #666; width: 60%; line-height: 1.4;">
          <div style="font-weight: bold; margin-bottom: 3pt;">${data.commanderTarget || '- หผ.ยค.(ก3)'}</div>
          <div style="text-indent: 1cm; margin-bottom: 12pt;">${data.commandText || 'ดำเนินการต่อไป'}</div>
          <div style="text-align: center; margin-left: 15%;">
            <br/>
            <div>(${data.commanderName})</div>
            <div>${data.commanderPosition}</div>
            ${data.commanderDate ? `<div>${data.commanderDate}</div>` : ''}
          </div>
        </div>
      ` : ''}
    `;
  } else {
    const parts = generateCase2BodyParts(data);
    const itemsHtml = parts.items.map((item, idx) => `
      <div style="text-indent: 3cm; margin-bottom: 4pt;">
        ${toThaiNumerals(idx + 1)}. ${item}
      </div>
    `).join('');

    bodyHtml = `
      <p style="text-indent: 2.5cm; margin-bottom: 10pt; text-align: justify; line-height: 1.6;">
        ${parts.intro}
      </p>
      <div style="margin-bottom: 10pt; line-height: 1.5;">
        ${itemsHtml}
      </div>
      <p style="text-indent: 2.5cm; margin-bottom: 12pt; text-align: justify; line-height: 1.6;">
        ${parts.request}
      </p>
      <p style="text-indent: 2.5cm; margin-bottom: 24pt; line-height: 1.6;">
        ${data.closingStatement}
      </p>
      <div style="margin-left: 55%; text-align: center; margin-bottom: 30pt; line-height: 1.4;">
        <br/><br/>
        ${data.proposerDate ? `<div>${data.proposerDate}</div>` : ''}
        <div>(${data.proposerName})</div>
        <div>${data.proposerPosition}</div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${data.subject}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 2.5cm 2cm 2cm 2.5cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'TH Sarabun PSK', 'TH Sarabun New', 'Sarabun', sans-serif;
          font-size: 16pt;
          line-height: 1.35;
          color: #000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        td {
          padding: 2pt 0;
          vertical-align: top;
          font-size: 16pt;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <table style="width: 100%; margin-bottom: 10pt;">
        <tr>
          <td style="width: 60px; vertical-align: middle;">
            <div style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #552277; text-align: center; line-height: 46px; font-weight: bold; color: #552277; font-size: 12pt;">PEA</div>
          </td>
          <td style="vertical-align: middle;">
            <div style="font-size: 20pt; font-weight: bold; line-height: 1.1;">การไฟฟ้าส่วนภูมิภาค</div>
            <div style="font-size: 10pt; font-weight: bold; color: #333;">PROVINCIAL ELECTRICITY AUTHORITY</div>
          </td>
        </tr>
      </table>

      <!-- Meta Table -->
      <table style="width: 100%; margin-bottom: 14pt; border-bottom: 1.5pt solid #000; padding-bottom: 6pt;">
        <tr>
          <td style="width: 10%; font-weight: bold;">จาก</td>
          <td style="width: 40%;">${data.docFrom}</td>
          <td style="width: 10%; font-weight: bold;">ถึง</td>
          <td style="width: 40%;">${data.docTo}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">เลขที่</td>
          <td>${data.docNo || '...........................................'}</td>
          <td style="font-weight: bold;">วันที่</td>
          <td>${data.docDate || '...........................................'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">เรื่อง</td>
          <td colspan="3" style="font-weight: bold;">${data.subject}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">เรียน</td>
          <td colspan="3">${data.salutation}</td>
        </tr>
      </table>

      <!-- Content -->
      ${bodyHtml}
    </body>
    </html>
  `;
}
