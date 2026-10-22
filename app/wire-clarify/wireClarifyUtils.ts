// app/wire-clarify/wireClarifyUtils.ts
/**
 * Utility functions, types, and document generators for Wire Return Clarification Program
 * (โปรแกรมชี้แจงส่งคืนเศษสายไม่ครบ 100%)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export interface WireItem {
  id: string;
  wireType: string;             // ชนิดสาย เช่น เศษสายอลูมิเนียมแกนเหล็ก, เศษสายเคเบิลอากาศ SAC
  estimatedKg: number;          // ประมาณการส่งคืน (KG)
  actualKg: number;             // จำนวนส่งคืน (KG)
  remarks?: string;             // หมายเหตุเพิ่มเติม (ถ้ามี)
}

export type DocLevelType = 'division_memo' | 'supervisor_report';

export interface WireClarifyFormData {
  // เอกสารระดับ: กอง กรย. ขออนุมัติ ผวบ. หรือ ผู้ควบคุมงาน รายงาน ผกร.
  docLevel: DocLevelType;

  // ข้อมูลทั่วไปของโครงการ
  wbsNo: string;                // หมายเลขงาน WBS เช่น P-TDD02.3-I-LYAIA.0016
  projectName: string;          // ชื่องาน เช่น ปรับปรุงระบบจำหน่าย 22 เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง 2 อ.ศรีสวัสดิ์ จ.กาญจนบุรี
  approvalDocRef: string;       // หนังสืออนุมัติงาน เช่น ก.3 กวว.(วร) 1847/2567 ลงวันที่ 16 สิงหาคม 2567
  networkNo: string;            // หมายเลขโครงข่าย เช่น โครงข่ายรื้อถอนแรงสูงภายนอก 6001381478
  
  // ข้อมูลส่วนหัวหนังสือ (บันทึกข้อความ)
  docFrom: string;              // จาก เช่น กรย.(ก3) หรือ พชง.ผู้ควบคุมงาน (อุดมศักดิ์)
  docTo: string;                // ถึง เช่น ผวบ.(ก3) หรือ ผกร.กรย.(ก3)
  docNo: string;                // เลขที่หนังสือ (เว้นว่างไว้ตามที่ผู้ใช้ร้องขอ)
  docDate: string;              // วันที่ (เว้นว่างไว้ตามที่ผู้ใช้ร้องขอ)
  subject: string;              // เรื่อง
  salutation: string;           // เรียน เช่น อผ.วบ.(ก3) ผ่าน รผ.วบ.(ก3) หรือ ผห.กร.กรย.(ก3) ผ่าน ชผ.กร.กรย.(ก3)

  // เนื้อหาบันทึกข้อความ 3 ตอน (แบบที่ 1: บันทึกกอง กรย.)
  memoBackground: string;       // 1. เรื่องเดิม
  memoFacts: string;            // 2. ข้อเท็จจริง
  memoConsideration: string;    // 3. ข้อพิจารณา
  memoClosing: string;          // ข้อความปิดท้าย

  // เนื้อหาบันทึกข้อความ (แบบที่ 2: บันทึกผู้ควบคุมงาน)
  supervisorBody: string;       // เนื้อความรายงานของผู้ควบคุมงาน
  supervisorClosing: string;    // ข้อความปิดท้ายของผู้ควบคุมงาน

  // ผู้ควบคุมงาน
  supervisorName: string;       // นายอุดมศักดิ์ จันทร์กลิ่น
  supervisorPosition: string;   // พชง.7 ผกร.กรย.(ก3)

  // ผู้ลงนามหลัก (ผกร. หรือ รก.กรย.)
  signerName: string;           // นายอนันต์ กาญจนอุปถัมภ์
  signerTitle: string;          // รก.กรย.(ก3) ปฏิบัติงานแทน อก.กรย.(ก3)
  signerDate: string;           // วันที่กำกับลายเซ็น (เว้นว่างไว้ตามค่าเริ่มต้น)

  // เกษียน / ผู้ตรวจทาน / ผู้อนุมัติ
  headOfSectionName: string;    // นายชานินทร์ ศรีสวัสดิ์
  headOfSectionTitle: string;   // ชผ.กร.กรย.(ก3) ปฏิบัติงานแทน ผห.กร.กรย.(ก3)
  approverName: string;         // นายเมธี สุภาก่ำ
  approverTitle: string;        // อฝ.วบ.(ก3)
  approverEndorsementTo?: string; // สั่งการถึง เช่น - อก.รย.(ก3)

  // ท้ายกระดาษ (Footer)
  contactDepartment: string;    // แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา
  contactPhone: string;         // 10391

  // รายการเศษสาย
  items: WireItem[];
}

/**
 * Common wire types used in PEA construction & dismantling
 */
/**
 * Common wire types used in PEA construction & dismantling
 */
export const POPULAR_WIRE_TYPES = [
  'เศษสายอลูมิเนียมแกนเหล็ก',
  'เศษสายอลูมิเนียมแกนเหล็กหุ้มฉนวน (PIC)',
  'เศษสายอลูมิเนียมตีเกลียวเปลือย (AAC)',
  'เศษสายเคเบิลอากาศ (Space Aerial Cable - SAC)',
  'เศษสายเคเบิลใต้ดิน (Underground XLPE Cable)',
  'เศษสายอลูมิเนียมหุ้มฉนวนแรงต่ำ (0.4 kV THW/ABC)',
  'เศษสายตัวนำทองแดงเปลือย (Bare Copper)',
  'เศษสายบริการ (Service Drop Cable)',
];

/**
 * Preset Wire Return Reasons (เหตุผลความจำเป็นที่ส่งคืนเศษสายไม่ครบ)
 */
export const PRESET_WIRE_REASONS = [
  {
    key: 'short_pieces',
    badge: '✂️ ตัดทิ้งเป็นเศษสั้น (Dead End/ต่อสาย)',
    title: 'ตัดทิ้งเป็นเศษสั้นๆ เช่น อุปกรณ์เข้าปลายสาย ช่วงต่อสาย และต่อแยกสาย',
    factsDetail: 'ทั้งนี้ปริมาณงานของงานก่อสร้าง มีปริมาณมากในการทำการรื้อถอนจะมีเศษสายบางส่วนที่จำเป็นต้องตัดทิ้งเป็นเศษสั้นๆ เช่น อุปกรณ์การเข้าปลายสาย อุปกรณ์ช่วงต่อสาย และอุปกรณ์ต่อแยกสาย เพื่อความสะดวกรวดเร็วในการรื้อถอน จึงทำให้ไม่สามารถส่งคืนพัสดุรื้อถอน ได้ครบตามประมาณการ',
  },
  {
    key: 'aged_damaged',
    badge: '🍂 สายเก่ากรอบแตกร้าว/เปื่อยยุ่ย',
    title: 'สายเดิมมีสภาพกรอบ แตกร้าว และเปื่อยยุ่ย แตกหักเป็นท่อนเล็กขณะรื้อถอน',
    factsDetail: 'เนื่องจากสายระบบจำหน่ายเดิมมีอายุการใช้งานมายาวนาน มีสภาพกรอบ แตกร้าว และเปื่อยยุ่ย เมื่อทำการรื้อถอนลงมาสายได้แตกหักเป็นท่อนเล็กท่อนน้อย ไม่สามารถเก็บรวบรวมเป็นม้วนยาวได้เต็มจำนวน จึงส่งผลให้ปริมาณน้ำหนักเศษสายที่ส่งคืนคลังไม่ครบตามประมาณการรื้อถอน',
  },
  {
    key: 'rush_power',
    badge: '⚡ เร่งรัดจ่ายไฟคืนประชาชน',
    title: 'ปฏิบัติงานในเวลาดับไฟจำกัด ต้องเร่งจ่ายไฟคืนผู้ใช้ไฟฟ้า',
    factsDetail: 'เนื่องจากการปฏิบัติงานก่อสร้างและรื้อถอนอยู่ภายใต้ระยะเวลาการดับกระแสไฟฟ้าที่จำกัด เพื่อเร่งรัดจ่ายไฟคืนให้แก่ประชาชนและผู้ใช้ไฟฟ้าในพื้นที่โดยเร็ว ทีมงานจึงจำเป็นต้องตัดทอนสายเป็นช่วงสั้นเพื่อความคล่องตัวและรวดเร็วในการปลดสายลงสู่พื้นดิน จึงทำให้ไม่สามารถส่งคืนพัสดุรื้อถอน ได้ครบตามประมาณการ',
  },
  {
    key: 'forest_terrain',
    badge: '🌲 แนวสายพาดผ่านป่าเขา/ลาดชัน',
    title: 'แนวสายพาดผ่านป่ารกทึบและภูมิประเทศลาดชันสูง',
    factsDetail: 'เนื่องจากสภาพพื้นที่แนวระบบจำหน่ายพาดผ่านภูมิประเทศที่เป็นป่าเขาและมีความลาดชันสูง การชักลากสายเดิมลงมามีอุปสรรคจากกิ่งไม้หนาแน่น ทำให้สายเกิดการฉีกขาดและติดค้างเป็นท่อนสั้นไม่สามารถเก็บกู้ได้ครบเต็มความยาวตามประมาณการ',
  }
];

/**
 * Standard pre-filled sample matching official scanned memo and correct abbreviations:
 * - ถึง: ฝวบ.(ก3)
 * - เรียน: อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)
 * - ตำแหน่งผู้ลงนาม: รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
 * - ตำแหน่งผู้อนุมัติ: อฝ.วบ.(ก3)
 */
export const SAMPLE_WIRE_CLARIFY_DATA: WireClarifyFormData = {
  docLevel: 'division_memo',

  wbsNo: 'P-TDD02.3-I-LYAIA.0016',
  projectName: 'ปรับปรุงระบบจำหน่าย 22 เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง 2 อ.ศรีสวัสดิ์ จ.กาญจนบุรี',
  approvalDocRef: 'ก.3 กวว.(ว) 1847/2567 ลงวันที่ 12 สิงหาคม 2567',
  networkNo: 'โครงข่ายรื้อถอนแรงสูงภายนอก 6001381478',

  docFrom: 'กรย.(ก3)',
  docTo: 'ฝวบ.(ก3)',
  docNo: '',                    // Blank by default as requested
  docDate: '',                  // Blank by default as requested
  subject: 'ขออนุมัตินำส่งคืนพัสดุชำรุดประเภทสายจากการรื้อถอนส่งคืนคลังไม่ครบตามประมาณการรื้อถอน',
  salutation: 'อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)',

  // 3 ตอนมาตรฐานตามเอกสารสแกนหน้า 1
  memoBackground: 'ตามหนังสือที่ ก.3 กวว.(ว) 1847/2567 ลงวันที่ 12 สิงหาคม 2567 อนุมัติให้ปรับปรุงระบบจำหน่าย 22 เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง 2 อ.ศรีสวัสดิ์ จ.กาญจนบุรี หมายเลขงาน (WBS) : P-TDD02.3-I-LYAIA.0016 โดยมีนายอุดมศักดิ์ จันทร์กลั่น หชง.4 ผกร.กรย.(ก3) เป็นผู้ควบคุมงาน นั้น',

  memoFacts: 'เนื่องจาก ผกร.กรย.(ก3) มีแผนงานก่อสร้างปรับปรุงระบบจำหน่าย 22 เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง 2 อ.ศรีสวัสดิ์ จ.กาญจนบุรี ให้แล้วเสร็จโดยเร็ว ตามแผนงานที่กำหนด ทั้งนี้ปริมาณงานของงานก่อสร้าง มีปริมาณมากในการทำการรื้อถอนจะมีเศษสายบางส่วนที่จำเป็นต้องตัดทิ้งเป็นเศษสั้นๆ เช่น อุปกรณ์การเข้าปลายสาย อุปกรณ์ช่วงต่อสาย และอุปกรณ์ต่อแยกสาย เพื่อความสะดวกรวดเร็วในการรื้อถอน จึงทำให้ไม่สามารถส่งคืนพัสดุรื้อถอน ได้ครบตามประมาณการ',

  memoConsideration: 'กรย.(ก3) พิจารณาแล้ว เนื่องจากต้องดำเนินการก่อสร้างภายใต้ระยะเวลาที่จำกัดเพื่อจ่ายไฟคืนให้กับผู้ใช้ไฟฟ้าภายในระยะเวลาที่กำหนด เพื่อสร้างความเชื่อมั่น สามารถปรับปรุงระบบจำหน่ายได้แล้วเสร็จตามที่แผนงานกำหนด และภาพลักษณ์ที่ดีของ กฟภ. โดย กรย.(ก3) จึงขออนุมัตินำส่งคืนพัสดุรื้อถอนเศษสายชำรุดไม่ครบถ้วนตามประมาณการ โดยส่งคืนเท่าจำนวนที่สามารถรื้อถอนได้จริงตามสภาพหน้างาน ทั้งนี้ ได้แนบเอกสารใบรับคืนและเอกสารส่งคืนของคณะกรรมการรื้อถอน มาด้วยแล้ว',

  memoClosing: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',

  // เนื้อหาสำหรับบันทึกผู้ควบคุมงาน (เอกสารสแกนหน้า 2)
  supervisorBody: 'ด้วยข้าพเจ้าได้ดำเนินการงานก่อสร้างปรับปรุงระบบจำหน่าย 22 เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง 2 อ.ศรีสวัสดิ์ จ.กาญจนบุรี ปัจจุบันดำเนินการก่อสร้างแล้วเสร็จ ตามแผนงานที่กำหนด ทั้งนี้ปริมาณงานของงานก่อสร้าง มีปริมาณมากในการทำการรื้อถอนจะมีเศษสายบางส่วนที่จำเป็นต้องตัดทิ้งเป็นเศษสั้นๆ เช่น อุปกรณ์การเข้าปลายสาย อุปกรณ์ช่วงต่อสาย และอุปกรณ์ต่อแยกสาย เพื่อความสะดวกรวดเร็วในการรื้อถอน โดยมีรายละเอียดการส่งคืนพัสดุรื้อถอนดังนี้',

  supervisorClosing: 'ทั้งนี้จึงขอรายงานผลการนำส่งคืนพัสดุชำรุดประเภทสายจากการรื้อถอนส่งคืนคลังไม่ครบตามประมาณการรื้อถอน เพื่อให้ส่วนเกี่ยวข้องช่วยพิจารณาดำเนินการต่อไป\n\nจึงเรียนมาเพื่อโปรดทราบและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',

  supervisorName: 'นายอุดมศักดิ์ จันทร์กลั่น',
  supervisorPosition: 'หชง.4 ผกร.กรย.(ก3)',

  signerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  signerTitle: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  signerDate: '',

  headOfSectionName: 'นายชานินทร์ ศรีสวัสดิ์',
  headOfSectionTitle: 'ชผ.กร.กรย.(ก3) ปฏิบัติงานแทน ผห.กร.กรย.(ก3)',
  approverName: 'นายเมธี สุภาก่ำ',
  approverTitle: 'อฝ.วบ.(ก3)',
  approverEndorsementTo: '- อก.รย.(ก3)',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา',
  contactPhone: '10391',

  items: [
    {
      id: 'wire-1',
      wireType: 'เศษสายอลูมิเนียมแกนเหล็ก',
      estimatedKg: 1121.13,
      actualKg: 1070.00,
      remarks: 'รื้อถอนตามสภาพหน้างานจริง'
    }
  ]
};

/**
 * Helper to compose standardized PEA "1. เรื่องเดิม" from variable parts
 */
export function composeWireBackground(params: {
  approvalDocRef?: string;
  projectName?: string;
  wbsNo?: string;
  supervisorName?: string;
  supervisorPosition?: string;
}): string {
  const ref = params.approvalDocRef || 'ก.3 กวว.(ว) 1847/2567 ลงวันที่ 12 สิงหาคม 2567';
  const proj = params.projectName || 'ปรับปรุงระบบจำหน่าย 22 เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง 2 อ.ศรีสวัสดิ์ จ.กาญจนบุรี';
  const wbs = params.wbsNo || 'P-TDD02.3-I-LYAIA.0016';
  const name = params.supervisorName || 'นายอุดมศักดิ์ จันทร์กลั่น';
  const pos = params.supervisorPosition || 'หชง.4 ผกร.กรย.(ก3)';

  const refPrefix = ref.startsWith('ตามหนังสือ') ? ref : `ตามหนังสือที่ ${ref}`;

  return `${refPrefix} อนุมัติให้${proj} หมายเลขงาน (WBS) : ${wbs} โดยมี${name} ${pos} เป็นผู้ควบคุมงาน นั้น`;
}

/**
 * Helper to compose standardized PEA "2. ข้อเท็จจริง" from variable parts
 */
export function composeWireFacts(params: {
  projectName?: string;
  dept?: string;
  factsDetail?: string;
}): string {
  const dept = params.dept || 'ผกร.กรย.(ก3)';
  const proj = params.projectName || 'ปรับปรุงระบบจำหน่าย 22 เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง 2 อ.ศรีสวัสดิ์ จ.กาญจนบุรี';
  const detail = params.factsDetail || 'ทั้งนี้ปริมาณงานของงานก่อสร้าง มีปริมาณมากในการทำการรื้อถอนจะมีเศษสายบางส่วนที่จำเป็นต้องตัดทิ้งเป็นเศษสั้นๆ เช่น อุปกรณ์การเข้าปลายสาย อุปกรณ์ช่วงต่อสาย และอุปกรณ์ต่อแยกสาย เพื่อความสะดวกรวดเร็วในการรื้อถอน จึงทำให้ไม่สามารถส่งคืนพัสดุรื้อถอน ได้ครบตามประมาณการ';

  return `เนื่องจาก ${dept} มีแผนงานก่อสร้าง${proj} ให้แล้วเสร็จโดยเร็ว ตามแผนงานที่กำหนด ${detail}`;
}


/**
 * Format currency or weights with commas and decimals
 */
export function formatKg(val: number | string | undefined | null, decimals: number = 2): string {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Calculate Percentage: (actual / estimated) * 100
 */
export function calculateWirePercent(actual: number, estimated: number): number {
  if (!estimated || estimated <= 0) return 0;
  return (actual / estimated) * 100;
}

/**
 * Format Percentage string (e.g. 95.44 %)
 */
export function formatPercent(val: number, decimals: number = 2): string {
  if (isNaN(val)) return '0.00 %';
  return `${val.toFixed(decimals)} %`;
}

/**
 * Convert Arabic digits to Thai digits (optional display)
 */
export function toThaiNum(str: string | number): string {
  if (str === undefined || str === null) return '';
  return str.toString().replace(/\d/g, (d) => '๐๑๒๓๔๕๖๗๘๙'[parseInt(d, 10)]);
}

/**
 * Get current date in Thai format
 */
export function getTodayThaiDate(type: 'short' | 'full' | 'thai_num' = 'short'): string {
  const now = new Date();
  const day = now.getDate();
  const monthNamesShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const monthNamesFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const yearBE = now.getFullYear() + 543;
  const shortYear = (yearBE % 100).toString().padStart(2, '0');

  if (type === 'thai_num') {
    return `${toThaiNum(day)} ${monthNamesShort[now.getMonth()]} ${toThaiNum(shortYear)}`;
  }

  if (type === 'full') {
    return `${day} ${monthNamesFull[now.getMonth()]} ${yearBE}`;
  }

  return `${day} ${monthNamesShort[now.getMonth()]} ${shortYear}`;
}

// ============================================================================
// MICROSOFT WORD & EXCEL EXPORT / COPY GENERATORS
// ============================================================================

/**
 * Generate Plain Text for Memo (Optimized for quick pasting into Word)
 */
export function generateWireClarifyMemoPlainText(data: WireClarifyFormData): string {
  const totalEst = data.items.reduce((s, i) => s + (Number(i.estimatedKg) || 0), 0);
  const totalAct = data.items.reduce((s, i) => s + (Number(i.actualKg) || 0), 0);
  const totalPct = calculateWirePercent(totalAct, totalEst);

  const isDiv = data.docLevel === 'division_memo';

  const indentLines = (text: string = '', tab = '\t'): string => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => `${tab}${line}`)
      .join('\n');
  };

  let bodyText = '';
  if (isDiv) {
    bodyText = `1. เรื่องเดิม
${indentLines(data.memoBackground)}

2. ข้อเท็จจริง
${indentLines(data.memoFacts)}

3. ข้อพิจารณา
${indentLines(data.memoConsideration)}

\t${data.memoClosing || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป'}`;
  } else {
    bodyText = `${indentLines(data.supervisorBody)}
${data.networkNo ? `\t${data.networkNo}\n` : ''}
\t${data.supervisorClosing || ''}`;
  }

  const signerBlock = isDiv 
    ? `\n\n                                        (${data.signerName || ''})\n                             ${data.signerTitle || ''}\n                             ${data.signerDate || ''}`
    : `\n\n                                        (${data.supervisorName || ''})\n                             ${data.supervisorPosition || ''}`;

  return `การไฟฟ้าส่วนภูมิภาค
PROVINCIAL ELECTRICITY AUTHORITY

จาก: ${data.docFrom || ''}\t\tถึง: ${data.docTo || ''}
เลขที่: ${data.docNo || ''}\t\tวันที่: ${data.docDate || ''}
เรื่อง: ${data.subject || ''}
เรียน: ${data.salutation || ''}

${bodyText}
${signerBlock}
`;
}

/**
 * Generate Native HTML Table for pasting into Microsoft Word
 * Creates a clean 5-column table with borders and right-aligned weights and percentage
 */
export function generateWireClarifyTableHtmlForWord(data: WireClarifyFormData): string {
  const totalEst = data.items.reduce((s, i) => s + (Number(i.estimatedKg) || 0), 0);
  const totalAct = data.items.reduce((s, i) => s + (Number(i.actualKg) || 0), 0);
  const totalPct = calculateWirePercent(totalAct, totalEst);

  const rowsHtml = data.items.map((item, idx) => {
    const pct = calculateWirePercent(Number(item.actualKg) || 0, Number(item.estimatedKg) || 0);
    return `
      <tr>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid black;">${idx + 1}</td>
        <td style="text-align: left; padding: 6px 10px; border: 1px solid black;">${item.wireType || ''}</td>
        <td style="text-align: right; padding: 6px 10px; border: 1px solid black;">${formatKg(item.estimatedKg)}</td>
        <td style="text-align: right; padding: 6px 10px; border: 1px solid black;">${formatKg(item.actualKg)}</td>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid black; font-weight: bold;">${formatPercent(pct)}</td>
      </tr>
    `;
  }).join('');

  return `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: 'TH Sarabun PSK', 'TH Sarabun New', sans-serif; font-size: 15pt; margin: 15px 0;">
      <thead>
        <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
          <th style="border: 1px solid black; width: 8%; text-align: center; padding: 6px;">ลำดับ</th>
          <th style="border: 1px solid black; width: 44%; text-align: center; padding: 6px;">ชนิดสาย</th>
          <th style="border: 1px solid black; width: 18%; text-align: center; padding: 6px;">ประมาณการส่งคืน (KG)</th>
          <th style="border: 1px solid black; width: 18%; text-align: center; padding: 6px;">จำนวนส่งคืน (KG)</th>
          <th style="border: 1px solid black; width: 12%; text-align: center; padding: 6px;">คิดเป็นเปอร์เซ็นต์</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr style="font-weight: bold; background-color: #f8fafc;">
          <td colspan="2" style="border: 1px solid black; text-align: center; padding: 6px;">รวม</td>
          <td style="border: 1px solid black; text-align: right; padding: 6px 10px;">${formatKg(totalEst)}</td>
          <td style="border: 1px solid black; text-align: right; padding: 6px 10px;">${formatKg(totalAct)}</td>
          <td style="border: 1px solid black; text-align: center; padding: 6px; color: #1e293b;">${formatPercent(totalPct)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

/**
 * Generate full HTML Document for downloading as Microsoft Word (.doc)
 */
export function generateWireClarifyWordDocument(data: WireClarifyFormData): string {
  const tableHtml = generateWireClarifyTableHtmlForWord(data);
  const isDiv = data.docLevel === 'division_memo';

  const formatWordLines = (text: string = ''): string => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => `<p style="text-indent: 2.5cm; text-align: justify; margin: 4pt 0;">${line}</p>`)
      .join('\n');
  };

  let bodyContent = '';
  if (isDiv) {
    bodyContent = `
      <p style="font-weight: bold; margin-top: 14pt;"><u>1. เรื่องเดิม</u></p>
      ${formatWordLines(data.memoBackground)}

      <p style="font-weight: bold; margin-top: 14pt;"><u>2. ข้อเท็จจริง</u></p>
      ${formatWordLines(data.memoFacts)}

      <p style="font-weight: bold; margin-top: 14pt;"><u>3. ข้อพิจารณา</u></p>
      ${formatWordLines(data.memoConsideration)}

      ${tableHtml}

      <p style="text-indent: 2.5cm; text-align: justify; margin-top: 12pt;">${data.memoClosing || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป'}</p>

      <div style="margin-top: 40px; margin-left: 50%; text-align: center;">
        <p style="margin-bottom: 25px;"><br/></p>
        <p>(${data.signerName || ''})</p>
        <p>${data.signerTitle || ''}</p>
        ${data.signerDate ? `<p>${data.signerDate}</p>` : ''}
      </div>

      <!-- Approver Endorsement Block -->
      <table style="width: 100%; border: none; margin-top: 50px; font-size: 14pt;">
        <tr>
          <td style="width: 50%; vertical-align: top; border: none;">
            <p><b>${data.approverEndorsementTo || '- อก.รย.(ก3)'}</b></p>
            <p style="margin-top: 8px;">อนุมัติ ดำเนินการตามเสนอ</p>
            <p style="margin-top: 35px;"><br/></p>
            <p>(${data.approverName || 'นายเมธี สุภาก่ำ'})</p>
            <p>${data.approverTitle || 'อฝ.วบ.(ก3)'}</p>
          </td>
          <td style="width: 50%; vertical-align: top; border: none; text-align: right;">
            <p>รฝ.วบ.(ก3) .............................. วันที่ ....../....../......</p>
            <p style="margin-top: 10px;">ผห.กร.(ก3) .............................. วันที่ ....../....../......</p>
            <p style="margin-top: 10px;">ชผ.กร.(ก3) .............................. วันที่ ....../....../......</p>
          </td>
        </tr>
      </table>
    `;
  } else {
    bodyContent = `
      ${formatWordLines(data.supervisorBody)}
      ${data.networkNo ? `<p style="text-align: center; font-weight: bold; margin: 10pt 0;">${data.networkNo}</p>` : ''}

      ${tableHtml}

      <p style="text-indent: 2.5cm; text-align: justify; margin-top: 12pt;">
        ทั้งนี้จึงขอรายงานผลการนำส่งคืนพัสดุชำรุดประเภทสายจากการรื้อถอนส่งคืนคลังไม่ครบตามประมาณการรื้อถอน เพื่อให้ส่วนเกี่ยวข้องช่วยพิจารณาดำเนินการต่อไป
      </p>
      <p style="text-indent: 2.5cm; text-align: justify; margin-top: 6pt;">
        จึงเรียนมาเพื่อโปรดทราบและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
      </p>

      <div style="margin-top: 40px; margin-left: 50%; text-align: center;">
        <p style="margin-bottom: 25px;"><br/></p>
        <p>(${data.supervisorName || ''})</p>
        <p>${data.supervisorPosition || ''}</p>
      </div>

      <div style="margin-top: 40px; margin-left: 50%; text-align: center;">
        <p>ทราบ ดำเนินการต่อไป</p>
        <p style="margin-bottom: 25px;"><br/></p>
        <p>(${data.headOfSectionName || 'นายชานินทร์ ศรีสวัสดิ์'})</p>
        <p>${data.headOfSectionTitle || 'ชผ.กร. ปฏิบัติงานแทน ผห.กร.(ก3)'}</p>
      </div>

      <div style="margin-top: 60px; font-size: 11pt; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 8px;">
        <p>${data.contactDepartment || 'แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา'}</p>
        <p>โทรศัพท์ ${data.contactPhone || '10391'}</p>
      </div>
    `;
  }

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>บันทึกชี้แจงส่งคืนเศษสายไม่ครบ</title>
      <style>
        body { font-family: 'TH Sarabun PSK', 'TH Sarabun New', sans-serif; font-size: 16pt; line-height: 1.35; margin: 2cm; }
        p { margin: 4pt 0; text-align: justify; }
        table.meta { width: 100%; border: none; margin-bottom: 16px; font-size: 16pt; }
        table.meta td { border: none; padding: 2px 0; vertical-align: top; }
      </style>
    </head>
    <body>
      <!-- PEA Logo Header -->
      <table style="width: 100%; border: none; margin-bottom: 12px;">
        <tr>
          <td style="border: none; width: 55px; vertical-align: middle;">
            <img src="https://upload.wikimedia.org/wikipedia/th/f/f9/Provincial_Electricity_Authority_Logo.svg" width="55" height="55" alt="PEA" />
          </td>
          <td style="border: none; vertical-align: middle; padding-left: 10px;">
            <div style="font-size: 16pt; font-weight: bold;">การไฟฟ้าส่วนภูมิภาค</div>
            <div style="font-size: 9pt; font-weight: bold;">PROVINCIAL ELECTRICITY AUTHORITY</div>
          </td>
        </tr>
      </table>

      <!-- Meta Table -->
      <table class="meta">
        <tr>
          <td style="width: 10%;"><b>จาก</b></td>
          <td style="width: 40%;">${data.docFrom || ''}</td>
          <td style="width: 10%;"><b>ถึง</b></td>
          <td style="width: 40%;">${data.docTo || ''}</td>
        </tr>
        <tr>
          <td><b>เลขที่</b></td>
          <td>${data.docNo || ''}</td>
          <td><b>วันที่</b></td>
          <td>${data.docDate || ''}</td>
        </tr>
        <tr>
          <td><b>เรื่อง</b></td>
          <td colspan="3"><b>${data.subject || ''}</b></td>
        </tr>
        <tr>
          <td><b>เรียน</b></td>
          <td colspan="3">${data.salutation || ''}</td>
        </tr>
      </table>

      ${bodyContent}
    </body>
    </html>
  `;
}

/**
 * Generate TSV for copying table into Microsoft Excel
 */
export function generateWireClarifyTsvForExcel(data: WireClarifyFormData): string {
  const header = ['ลำดับ', 'ชนิดสาย', 'ประมาณการส่งคืน (KG)', 'จำนวนส่งคืน (KG)', 'คิดเป็นเปอร์เซ็นต์ (%)'].join('\t');
  
  const rows = data.items.map((item, idx) => {
    const pct = calculateWirePercent(Number(item.actualKg) || 0, Number(item.estimatedKg) || 0);
    return [
      idx + 1,
      item.wireType,
      item.estimatedKg,
      item.actualKg,
      pct.toFixed(2)
    ].join('\t');
  }).join('\n');

  const totalEst = data.items.reduce((s, i) => s + (Number(i.estimatedKg) || 0), 0);
  const totalAct = data.items.reduce((s, i) => s + (Number(i.actualKg) || 0), 0);
  const totalPct = calculateWirePercent(totalAct, totalEst);

  const totalRow = ['รวม', '', totalEst, totalAct, totalPct.toFixed(2)].join('\t');

  return `${header}\n${rows}\n${totalRow}`;
}
