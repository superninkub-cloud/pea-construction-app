/**
 * Utility functions for PEA Account Adjustment Module
 * Optimized for easy copying & pasting into Microsoft Word and Excel
 */

export interface AdjustmentItem {
  id: string;
  debtDocNo: string;        // 1. เลขที่เอกสารตั้งหนี้ (e.g. 1093485692)
  postingDate: string;      // 2. วันที่ผ่านรายการ (e.g. 26/08/2024)
  oldAccountCode: string;   // 3. รหัสบัญชีเดิม (e.g. 21920010)
  oldType: 'cost_center' | 'wbs' | 'network'; // 4. ประเภทเดิม
  oldValue: string;         // 4. รหัสเดิม (e.g. P-TDD02.3-I-TARNA.0011)
  oldAmount: number;        // 5. จำนวนเงินเดิม (e.g. 12400.00)
  newAccountCode: string;   // 6. รหัสบัญชีใหม่ (e.g. 53051050)
  newType: 'cost_center' | 'wbs' | 'network'; // 7. ประเภทใหม่
  newValue: string;         // 7. รหัสใหม่ (e.g. I301013050)
  newAmount: number;        // 8. จำนวนเงินใหม่ (e.g. 12400.00)
  deptDocNo?: string;       // 9. เลขที่เอกสาร (หน่วยงานปรับปรุง)
  deptPostingDate?: string; // 10. วันที่ผ่านรายการ (หน่วยงานปรับปรุง)
}

export type ReasonCategory =
  | 'labor'
  | 'wbs_mismatch'
  | 'vehicle'
  | 'cost_center'
  | 'material'
  | 'fuel'
  | 'custom';

export interface AccountAdjustFormData {
  // Memo Fields (หน้า 1: บันทึกข้อความ)
  docFrom: string;          // จาก เช่น "กรย.(ก๓)"
  docTo: string;            // ถึง เช่น "กบฟ.(ก๓)"
  docNo: string;            // เลขที่ เช่น "ก.๓ กรย.(กร.) ๒๘๑๓/๒๕๖๘"
  docDate: string;          // วันที่ เช่น "๑๙ ต.ค. ๖๗"
  subject: string;          // เรื่อง เช่น "ขอให้ปรับปรุงรายการทางบัญชี"
  salutation: string;       // คำขึ้นต้น เช่น "เรียน อก.บฟ.(ก๓)"
  memoReason: string;       // ข้อความเหตุผลฉบับเต็ม
  memoClosing: string;      // ข้อความปิดท้าย เช่น "จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการต่อไป"
  signerName: string;       // ชื่อผู้ลงนาม เช่น "นายอนันต์ กาญจนอุปถัมภ์"
  signerTitle: string;      // ตำแหน่งผู้ลงนาม เช่น "รก.กรย.(ก๓) ปฏิบัติงานแทน อก.กรย.(ก๓)"
  signerDate: string;       // วันที่กำกับลายเซ็น เช่น "19 ต.ค. 67"
  showDigitalSign: boolean; // แสดงลายเซ็นดิจิทัลหรือไม่

  // จุดตัวแปรเหตุผลในการขอปรับปรุงบัญชี (Dynamic Variable Spots)
  reasonCategory?: ReasonCategory; // หมวดหมู่สาเหตุ
  causeItem?: string;              // จุดที่ 1: สิ่งที่เบิกผิด (เช่น ค่าจ้างเหมาบริการและแรงงาน / ค่าซ่อมยานพาหนะ)
  errorType?: string;              // จุดที่ 2: ลักษณะความผิดพลาด (เช่น มีการบันทึกรายการทางบัญชีผิดพลาด / บันทึกผิดหมายเลขงาน WBS)
  detailNote?: string;             // จุดที่ 3: ระบุเจาะจง (ถ้ามี เช่น เลข WBS หรือเลขศูนย์ต้นทุน)
  purpose?: string;                // จุดที่ 4: วัตถุประสงค์ (เช่น เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้)

  // Table Form Header Fields (หน้า 2: แบบฟอร์มขอปรับปรุงฯ)
  peaBranch: string;        // การไฟฟ้า เช่น "ผกร.กรย.(ก๓)"
  businessType: string;     // ประเภทธุรกิจ เช่น "ก่อสร้างและบูรณะระบบจำหน่าย"
  expenseMonth: string;     // เดือนที่ต้องการปรับปรุง เช่น "ตุลาคม"
  expenseYear: string;      // ปี พ.ศ. เช่น "2567"
  routingType: 'wbs' | 'cost_center'; // การส่ง: wbs (ส่ง ผบส.) หรือ cost_center (ส่ง ผบต.)
  adjustingDept: string;    // หน่วยงานที่ปรับปรุงบัญชี เช่น "กบฟ.(ก๓)"
  
  // Header-level checkboxes for columns 4 & 7
  col4HeaderChoice: 'cost_center' | 'wbs' | 'network';
  col7HeaderChoice: 'cost_center' | 'wbs' | 'network';

  // Table Rows
  items: AdjustmentItem[];
}

/**
 * Default sample data exactly matching the user's images
 */
export const SAMPLE_ACCOUNT_ADJUST_DATA: AccountAdjustFormData = {
  docFrom: "กรย.(ก๓)",
  docTo: "กบฟ.(ก๓)",
  docNo: "",
  docDate: "",
  subject: "ขอให้ปรับปรุงรายการทางบัญชี",
  salutation: "อก.บฟ.(ก๓)",
  memoReason: "กรย.(ก๓) ได้ตรวจสอบพบว่ามีการเบิกจ่ายค่าซ่อมยานพาหนะ มีการบันทึกรายการทางบัญชีผิดพลาด จึงจำเป็นต้องปรับปรุงรายการดังกล่าวให้ถูกต้อง ดังนั้นเพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้ จึงขอให้ กบฟ.(ก๓) ปรับปรุงรายการทางบัญชีโดยมีรายละเอียดตามเอกสารแนบที่ส่งมาด้วยนี้",
  memoClosing: "จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการต่อไป",
  signerName: "นายอนันต์ กาญจนอุปถัมภ์",
  signerTitle: "รก.กรย.(ก๓) ปฏิบัติงานแทน อก.กรย.(ก๓)",
  signerDate: "",
  showDigitalSign: true,

  reasonCategory: "vehicle",
  causeItem: "ค่าซ่อมยานพาหนะ",
  errorType: "มีการบันทึกรายการทางบัญชีผิดพลาด",
  detailNote: "",
  purpose: "เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้",

  peaBranch: "ผกร.กรย.(ก๓)",
  businessType: "",
  expenseMonth: "ตุลาคม",
  expenseYear: "๒๕๖๗",
  routingType: "wbs",
  adjustingDept: "กบฟ.(ก๓)",

  col4HeaderChoice: "wbs",
  col7HeaderChoice: "cost_center",

  items: [
    {
      id: "item-1",
      debtDocNo: "",
      postingDate: "",
      oldAccountCode: "",
      oldType: "wbs",
      oldValue: "",
      oldAmount: 0,
      newAccountCode: "",
      newType: "cost_center",
      newValue: "",
      newAmount: 0,
      deptDocNo: "",
      deptPostingDate: "",
    }
  ]
};

/**
 * Format currency with 2 decimal places and commas
 */
export function formatMoney(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Convert number to Thai Baht Text
 */
export function thaiBahtText(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'ศูนย์บาทถ้วน';

  const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  // Split integer and satang parts
  const absAmount = Math.abs(amount);
  const fixed = absAmount.toFixed(2);
  const [intPartStr, satangPartStr] = fixed.split('.');

  const convertGroup = (numStr: string): string => {
    let result = '';
    const len = numStr.length;
    for (let i = 0; i < len; i++) {
      const d = parseInt(numStr[i], 10);
      const pos = len - i - 1;
      if (d === 0) continue;
      if (pos === 0 && d === 1 && len > 1) {
        result += 'เอ็ด';
      } else if (pos === 1 && d === 1) {
        result += 'สิบ';
      } else if (pos === 1 && d === 2) {
        result += 'ยี่สิบ';
      } else {
        result += digits[d] + positions[pos];
      }
    }
    return result;
  };

  let intResult = '';
  const intVal = parseInt(intPartStr, 10);
  if (intVal === 0) {
    intResult = 'ศูนย์';
  } else {
    // Handle millions recursion
    let remaining = intPartStr;
    const chunks: string[] = [];
    while (remaining.length > 6) {
      chunks.unshift(remaining.slice(-6));
      remaining = remaining.slice(0, -6);
    }
    chunks.unshift(remaining);

    for (let i = 0; i < chunks.length; i++) {
      const groupText = convertGroup(chunks[i]);
      intResult += groupText;
      if (i < chunks.length - 1 && groupText !== '') {
        intResult += 'ล้าน';
      }
    }
  }

  const satangVal = parseInt(satangPartStr, 10);
  let satangResult = '';
  if (satangVal > 0) {
    satangResult = convertGroup(satangPartStr) + 'สตางค์';
  } else {
    satangResult = 'ถ้วน';
  }

  return (amount < 0 ? 'ลบ' : '') + intResult + 'บาท' + satangResult;
}

/**
 * Get current date formatted in Thai style
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

  const toThaiNum = (num: number | string) =>
    num.toString().replace(/\d/g, (d) => '๐๑๒๓๔๕๖๗๘๙'[parseInt(d, 10)]);

  if (type === 'thai_num') {
    return `${toThaiNum(day)} ${monthNamesShort[now.getMonth()]} ${toThaiNum(shortYear)}`;
  }

  if (type === 'full') {
    return `${day} ${monthNamesFull[now.getMonth()]} ${yearBE}`;
  }

  return `${day} ${monthNamesShort[now.getMonth()]} ${shortYear}`;
}

/**
 * Common SAP Account codes and descriptions in PEA
 */
export const POPULAR_SAP_ACCOUNTS = [
  { code: '53051050', name: 'ค่าใช้จ่ายซ่อมแซมและบำรุงรักษายานพาหนะ', group: 'ยานพาหนะ' },
  { code: '21920010', name: 'บัญชีพักการตั้งหนี้/เจ้าหนี้การค้า', group: 'บัญชีพัก' },
  { code: '53040110', name: 'ค่าจ้างเหมาบริการและแรงงานภายนอก', group: 'ค่าจ้างเหมา' },
  { code: '53010110', name: 'ค่าพัสดุและอุปกรณ์ระบบจำหน่ายไฟฟ้า', group: 'พัสดุ' },
  { code: '53020110', name: 'ค่าน้ำมันเชื้อเพลิงและหล่อลื่น', group: 'เชื้อเพลิง' },
  { code: '53080110', name: 'ค่าใช้จ่ายเบ็ดเตล็ดหน้างานก่อสร้าง', group: 'เบ็ดเตล็ด' },
];

/**
 * Helper to compose standardized PEA memorandum reason text from dynamic variable parts
 */
export function composeReasonText(params: {
  docFrom?: string;
  docTo?: string;
  causeItem?: string;
  errorType?: string;
  detailNote?: string;
  purpose?: string;
}): string {
  const from = params.docFrom || 'กรย.(ก๓)';
  const to = params.docTo || 'กบฟ.(ก๓)';
  const cause = params.causeItem || 'ค่าใช้จ่ายดำเนินงาน';
  const err = params.errorType || 'มีการบันทึกรายการทางบัญชีผิดพลาด';
  const note = params.detailNote && params.detailNote.trim() ? ` (${params.detailNote.trim()})` : '';
  const purp = params.purpose || 'เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้';

  return `${from} ได้ตรวจสอบพบว่ามีการเบิกจ่าย${cause} ${err}${note} จึงจำเป็นต้องปรับปรุงรายการดังกล่าวให้ถูกต้อง ดังนั้น${purp} จึงขอให้ ${to} ปรับปรุงรายการทางบัญชีโดยมีรายละเอียดตามเอกสารแนบที่ส่งมาด้วยนี้`;
}

/**
 * Preset Reason Templates for Account Adjustment
 * Fully covers Labor/Contractor mismatch, WBS project mismatch, Vehicle repair, Cost center, Materials, Fuel
 */
export const PRESET_REASON_TEMPLATES = [
  {
    category: 'labor' as ReasonCategory,
    badge: '👷 เบิกค่าแรงผิด',
    title: 'เบิกจ่ายค่าแรงงาน / ค่าจ้างเหมาผิดพลาด',
    causeItem: 'ค่าจ้างเหมาบริการและแรงงานภายนอก',
    errorType: 'มีการบันทึกรายการทางบัญชีผิดพลาด',
    detailNote: '',
    purpose: 'เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้',
    reason: 'กรย.(ก๓) ได้ตรวจสอบพบว่ามีการเบิกจ่ายค่าจ้างเหมาบริการและแรงงานภายนอก มีการบันทึกรายการทางบัญชีผิดพลาด จึงจำเป็นต้องปรับปรุงรายการดังกล่าวให้ถูกต้อง ดังนั้นเพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้ จึงขอให้ กบฟ.(ก๓) ปรับปรุงรายการทางบัญชีโดยมีรายละเอียดตามเอกสารแนบที่ส่งมาด้วยนี้',
    col4Header: 'wbs' as const,
    col7Header: 'cost_center' as const,
    routingType: 'wbs' as const,
    suggestedAccountCode: '53040110',
  },
  {
    category: 'wbs_mismatch' as ReasonCategory,
    badge: '🏗️ ผิดหมายเลขงาน WBS',
    title: 'เบิกจ่ายผิดหมายเลขงาน WBS (สลับโครงการ/ข้ามงาน)',
    causeItem: 'ค่าใช้จ่ายโครงการก่อสร้าง',
    errorType: 'บันทึกผิดหมายเลขงาน WBS ข้ามโครงการ',
    detailNote: 'บันทึกเข้า WBS ผิดโครงการ',
    purpose: 'เพื่อให้การสรุปค่าใช้จ่ายโครงการมีความถูกต้องและปิด กส.๓ ได้ตามกำหนด',
    reason: 'กรย.(ก๓) ได้ตรวจสอบพบว่ามีการเบิกจ่ายค่าใช้จ่ายโครงการก่อสร้าง บันทึกผิดหมายเลขงาน WBS ข้ามโครงการ จึงจำเป็นต้องปรับปรุงโอนรายการเข้าหมายเลขงาน WBS ที่ถูกต้อง เพื่อให้การสรุปค่าใช้จ่ายโครงการมีความถูกต้องและปิด กส.๓ ได้ตามกำหนด จึงขอให้ กบฟ.(ก๓) ปรับปรุงรายการทางบัญชีโดยมีรายละเอียดตามเอกสารแนบที่ส่งมาด้วยนี้',
    col4Header: 'wbs' as const,
    col7Header: 'wbs' as const,
    routingType: 'wbs' as const,
    suggestedAccountCode: '',
  },
  {
    category: 'vehicle' as ReasonCategory,
    badge: '🚗 ค่าซ่อมยานพาหนะ',
    title: 'เบิกจ่ายค่าซ่อมแซมยานพาหนะผิดพลาด',
    causeItem: 'ค่าซ่อมยานพาหนะ',
    errorType: 'มีการบันทึกรายการทางบัญชีผิดพลาด',
    detailNote: '',
    purpose: 'เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้',
    reason: 'กรย.(ก๓) ได้ตรวจสอบพบว่ามีการเบิกจ่ายค่าซ่อมยานพาหนะ มีการบันทึกรายการทางบัญชีผิดพลาด จึงจำเป็นต้องปรับปรุงรายการดังกล่าวให้ถูกต้อง ดังนั้นเพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้ จึงขอให้ กบฟ.(ก๓) ปรับปรุงรายการทางบัญชีโดยมีรายละเอียดตามเอกสารแนบที่ส่งมาด้วยนี้',
    col4Header: 'wbs' as const,
    col7Header: 'cost_center' as const,
    routingType: 'wbs' as const,
    suggestedAccountCode: '53051050',
  },
  {
    category: 'cost_center' as ReasonCategory,
    badge: '🏢 ผิดศูนย์ต้นทุน',
    title: 'บันทึกผิดศูนย์ต้นทุน (จัดส่ง ผบต.)',
    causeItem: 'ค่าใช้จ่ายดำเนินงาน',
    errorType: 'มีการบันทึกบัญชีผิดศูนย์ต้นทุน',
    detailNote: '',
    purpose: 'เพื่อให้การจัดทำบัญชีต้นทุนถูกต้องครบถ้วน',
    reason: 'กรย.(ก๓) ได้ตรวจสอบพบว่ามีการบันทึกบัญชีค่าใช้จ่ายผิดศูนย์ต้นทุน จึงขอส่งเรื่องปรับปรุงรายการทางบัญชีระหว่างศูนย์ต้นทุนให้ถูกต้อง เพื่อให้การจัดทำบัญชีต้นทุนถูกต้องครบถ้วน จึงขอให้ กบฟ.(ก๓) ปรับปรุงรายการทางบัญชีโดยมีรายละเอียดตามเอกสารแนบที่ส่งมาด้วยนี้',
    col4Header: 'cost_center' as const,
    col7Header: 'cost_center' as const,
    routingType: 'cost_center' as const,
    suggestedAccountCode: '',
  },
  {
    category: 'material' as ReasonCategory,
    badge: '📦 ค่าพัสดุและอุปกรณ์',
    title: 'เบิกจ่ายค่าพัสดุและอุปกรณ์ระบบไฟฟ้าผิดพลาด',
    causeItem: 'ค่าพัสดุและอุปกรณ์ระบบจำหน่ายไฟฟ้า',
    errorType: 'มีการบันทึกรายการทางบัญชีผิดพลาด',
    detailNote: '',
    purpose: 'เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้',
    reason: 'กรย.(ก๓) ได้ตรวจสอบพบว่ามีการเบิกจ่ายค่าพัสดุและอุปกรณ์ระบบจำหน่ายไฟฟ้า มีการบันทึกรายการทางบัญชีผิดพลาด จึงจำเป็นต้องปรับปรุงรายการดังกล่าวให้ถูกต้อง ดังนั้นเพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้ จึงขอให้ กบฟ.(ก๓) ปรับปรุงรายการทางบัญชีโดยมีรายละเอียดตามเอกสารแนบที่ส่งมาด้วยนี้',
    col4Header: 'wbs' as const,
    col7Header: 'cost_center' as const,
    routingType: 'wbs' as const,
    suggestedAccountCode: '53010110',
  },
  {
    category: 'fuel' as ReasonCategory,
    badge: '⛽ ค่าน้ำมันเชื้อเพลิง',
    title: 'เบิกจ่ายค่าน้ำมันเชื้อเพลิงและหล่อลื่นผิดพลาด',
    causeItem: 'ค่าน้ำมันเชื้อเพลิงและหล่อลื่น',
    errorType: 'มีการบันทึกรายการทางบัญชีผิดพลาด',
    detailNote: '',
    purpose: 'เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้',
    reason: 'กรย.(ก๓) ได้ตรวจสอบพบว่ามีการเบิกจ่ายค่าน้ำมันเชื้อเพลิงและหล่อลื่น มีการบันทึกรายการทางบัญชีผิดพลาด จึงจำเป็นต้องปรับปรุงรายการดังกล่าวให้ถูกต้อง ดังนั้นเพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้ จึงขอให้ กบฟ.(ก๓) ปรับปรุงรายการทางบัญชีโดยมีรายละเอียดตามเอกสารแนบที่ส่งมาด้วยนี้',
    col4Header: 'wbs' as const,
    col7Header: 'cost_center' as const,
    routingType: 'wbs' as const,
    suggestedAccountCode: '53020110',
  }
];


// ============================================================================
// MICROSOFT WORD & EXCEL EXPORT / COPY GENERATORS
// ============================================================================

/**
 * Generate plain text for copying memo into Word
 */
export function generateMemoPlainText(data: AccountAdjustFormData): string {
  return `การไฟฟ้าส่วนภูมิภาค
PROVINCIAL ELECTRICITY AUTHORITY

จาก: ${data.docFrom || ''}\t\tถึง: ${data.docTo || ''}
เลขที่: ${data.docNo || ''}\t\tวันที่: ${data.docDate || ''}
เรื่อง: ${data.subject || 'ขอให้ปรับปรุงรายการทางบัญชี'}
เรียน: ${data.salutation || 'อก.บฟ.(ก๓)'}

    ${data.memoReason || ''}

    ${data.memoClosing || 'จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการต่อไป'}



                                        (${data.signerName || ''})
                             ${data.signerTitle || ''}
`;
}

/**
 * Generate HTML table specifically optimized for pasting into Microsoft Word
 */
export function generateTableHtmlForWord(data: AccountAdjustFormData): string {
  const totalOld = data.items.reduce((s, i) => s + (Number(i.oldAmount) || 0), 0);
  const totalNew = data.items.reduce((s, i) => s + (Number(i.newAmount) || 0), 0);

  const col4Text = data.col4HeaderChoice === 'wbs' ? '[✓] WBS' : data.col4HeaderChoice === 'cost_center' ? '[✓] ศูนย์ต้นทุน' : '[✓] โครงข่าย';
  const col7Text = data.col7HeaderChoice === 'cost_center' ? '[✓] ศูนย์ต้นทุน' : data.col7HeaderChoice === 'wbs' ? '[✓] WBS' : '[✓] โครงข่าย';

  const rowsHtml = data.items.map((item, idx) => `
    <tr>
      <td style="text-align:center; padding: 4px;">${item.debtDocNo || ''}</td>
      <td style="text-align:center; padding: 4px;">${item.postingDate || ''}</td>
      <td style="text-align:center; padding: 4px;">${item.oldAccountCode || ''}</td>
      <td style="text-align:center; padding: 4px;">${item.oldValue || ''}</td>
      <td style="text-align:right; padding: 4px;">${formatMoney(item.oldAmount)}</td>
      <td style="text-align:center; padding: 4px;">${item.newAccountCode || ''}</td>
      <td style="text-align:center; padding: 4px;">${item.newValue || ''}</td>
      <td style="text-align:right; padding: 4px;">${formatMoney(item.newAmount)}</td>
      <td style="text-align:center; padding: 4px;">${item.deptDocNo || ''}</td>
      <td style="text-align:center; padding: 4px;">${item.deptPostingDate || ''}</td>
    </tr>
  `).join('');

  return `
    <table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: 'TH Sarabun New', 'Sarabun', 'Cordia New', sans-serif; font-size: 14pt;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th colspan="5" style="border: 1px solid black; text-align: center; font-weight: bold;">รายการที่บันทึกบัญชี (เดิม)</th>
          <th colspan="3" style="border: 1px solid black; text-align: center; font-weight: bold;">รายการที่ต้องการแก้ไขปรับปรุงบัญชี</th>
          <th colspan="2" style="border: 1px solid black; text-align: center; font-weight: bold;">หน่วยงานที่ปรับปรุงบัญชี</th>
        </tr>
        <tr style="background-color: #fafafa; font-size: 12pt;">
          <th style="border: 1px solid black; text-align: center;">1<br/>เลขที่เอกสารตั้งหนี้</th>
          <th style="border: 1px solid black; text-align: center;">2<br/>วันที่ผ่านรายการ</th>
          <th style="border: 1px solid black; text-align: center;">3<br/>รหัสบัญชี</th>
          <th style="border: 1px solid black; text-align: center;">4<br/>${col4Text}</th>
          <th style="border: 1px solid black; text-align: center;">5<br/>จำนวนเงิน</th>
          <th style="border: 1px solid black; text-align: center;">6<br/>รหัสบัญชี</th>
          <th style="border: 1px solid black; text-align: center;">7<br/>${col7Text}</th>
          <th style="border: 1px solid black; text-align: center;">8<br/>จำนวนเงิน</th>
          <th style="border: 1px solid black; text-align: center;">เลขที่เอกสาร</th>
          <th style="border: 1px solid black; text-align: center;">วันที่ผ่านรายการ</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr style="font-weight: bold; background-color: #f9f9f9;">
          <td colspan="4" style="border: 1px solid black; text-align: center;">รวม (${thaiBahtText(totalOld)})</td>
          <td style="border: 1px solid black; text-align: right;">${formatMoney(totalOld)}</td>
          <td colspan="2" style="border: 1px solid black; text-align: center;">รวม</td>
          <td style="border: 1px solid black; text-align: right;">${formatMoney(totalNew)}</td>
          <td style="border: 1px solid black;"></td>
          <td style="border: 1px solid black;"></td>
        </tr>
      </tbody>
    </table>
  `;
}

/**
 * Generate full HTML document for downloading as a .doc file (opens directly in Microsoft Word)
 */
export function generateWordDocumentContent(data: AccountAdjustFormData): string {
  const tableHtml = generateTableHtmlForWord(data);
  const totalOld = data.items.reduce((s, i) => s + (Number(i.oldAmount) || 0), 0);

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>เอกสารขอปรับปรุงรายการทางบัญชี</title>
      <style>
        body { font-family: 'TH Sarabun New', 'Cordia New', sans-serif; font-size: 16pt; line-height: 1.25; margin: 2cm; }
        p { margin: 6pt 0; text-align: justify; }
        .indent { text-indent: 2.5cm; }
        table.meta { width: 100%; border: none; margin-bottom: 20px; font-size: 16pt; }
        table.meta td { border: none; padding: 3px 0; vertical-align: top; }
        .signer { margin-top: 40px; margin-left: 50%; text-align: center; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <!-- Page 1: Memo -->
      <table style="width: 100%; border: none; margin-bottom: 15px;">
        <tr>
          <td style="border: none; width: 60px; vertical-align: middle;">
            <img src="https://upload.wikimedia.org/wikipedia/th/f/f9/Provincial_Electricity_Authority_Logo.svg" width="60" height="60" alt="PEA" />
          </td>
          <td style="border: none; vertical-align: middle; padding-left: 10px;">
            <div style="font-size: 16pt; font-weight: bold;">การไฟฟ้าส่วนภูมิภาค</div>
            <div style="font-size: 9pt; font-weight: bold;">PROVINCIAL ELECTRICITY AUTHORITY</div>
          </td>
        </tr>
      </table>

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
          <td colspan="3"><b>${data.subject || 'ขอให้ปรับปรุงรายการทางบัญชี'}</b></td>
        </tr>
        <tr>
          <td><b>เรียน</b></td>
          <td colspan="3">${data.salutation || 'อก.บฟ.(ก๓)'}</td>
        </tr>
      </table>

      <p class="indent">${data.memoReason || ''}</p>
      <p class="indent">${data.memoClosing || 'จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการต่อไป'}</p>

      <div class="signer">
        <p style="margin-bottom: 35px;"><br/></p>
        <p>(${data.signerName || ''})</p>
        <p>${data.signerTitle || ''}</p>
        ${data.signerDate ? `<p style="font-size: 14pt;">${data.signerDate}</p>` : ''}
      </div>

      <!-- Page Break to Page 2 -->
      <br clear="all" style="page-break-before: always;" />

      <!-- Page 2: Table Form -->
      <div style="text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 15px;">
        แบบฟอร์มขอปรับปรุงรายการทางบัญชี
      </div>

      <table style="width: 100%; border: none; font-size: 14pt; margin-bottom: 12px;">
        <tr>
          <td style="border: none;">
            การไฟฟ้า: <b>${data.peaBranch || ''}</b>&nbsp;&nbsp;&nbsp;&nbsp;ประเภทธุรกิจ: ${data.businessType || '........................'}
          </td>
          <td style="border: 1px solid black; text-align: left; padding: 4px 8px; width: 220px;" rowspan="2">
            <div>${data.routingType === 'cost_center' ? '[✓]' : '[ ]'} ศูนย์ต้นทุน</div>
            <div>${data.routingType === 'wbs' ? '[✓]' : '[ ]'} WBS / โครงข่าย - กิจกรรม ส่ง ผบส.</div>
          </td>
        </tr>
        <tr>
          <td style="border: none;">
            รายละเอียดค่าใช้จ่ายที่ต้องการปรับปรุงบัญชี เดือน: <b>${data.expenseMonth || ''} ${data.expenseYear || ''}</b>
          </td>
        </tr>
        <tr>
          <td style="border: none;" colspan="2" style="text-align: right;">
            หน่วยงานที่ปรับปรุงบัญชี: <b>${data.adjustingDept || 'กบฟ.(ก๓)'}</b>
          </td>
        </tr>
      </table>

      ${tableHtml}

      <div style="font-size: 12pt; margin-top: 15px; line-height: 1.4;">
        <b>หมายเหตุ</b><br/>
        ๑. กรณีปรับปรุงศูนย์ต้นทุนกับศูนย์ต้นทุนให้ทำเครื่องหมาย / ในช่องศูนย์ต้นทุนมุมบนขวา และจัดส่ง ผบต. นอกเหนือจากนี้ให้ส่ง ผบส.<br/>
        ๒. ช่องที่ ๔ ให้ทำเครื่องหมาย / หน้าข้อความที่บันทึกบัญชีไว้ผิด เช่น ผิดศูนย์ต้นทุนให้ทำเครื่องหมาย [/] ศูนย์ต้นทุน และกรอกรหัสศูนย์ต้นทุนในช่องที่ ๔<br/>
        ๓. ช่องที่ ๗ ให้ทำเครื่องหมาย / หน้าข้อความที่ต้องการให้ปรับปรุงบัญชี เช่น ขอปรับปรุงเข้า โครงข่าย-กิจกรรม ให้ทำเครื่องหมาย [/] โครงข่าย-กิจกรรม และกรอกหมายเลขโครงข่าย-กิจกรรม<br/>
        ๔. ให้แนบสำเนาใบสำคัญจ่ายที่บันทึกไว้ผิดบัญชีมาด้วยทุกครั้ง
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Tab-Separated Values (TSV) for pasting table directly into Excel
 */
export function generateTableTsvForExcel(data: AccountAdjustFormData): string {
  const col4Text = data.col4HeaderChoice === 'wbs' ? 'WBS' : data.col4HeaderChoice === 'cost_center' ? 'ศูนย์ต้นทุน' : 'โครงข่าย';
  const col7Text = data.col7HeaderChoice === 'cost_center' ? 'ศูนย์ต้นทุน' : data.col7HeaderChoice === 'wbs' ? 'WBS' : 'โครงข่าย';

  const header = [
    'เลขที่เอกสารตั้งหนี้',
    'วันที่ผ่านรายการ',
    'รหัสบัญชีเดิม',
    `ประเภทเดิม (${col4Text})`,
    'จำนวนเงินเดิม',
    'รหัสบัญชีใหม่',
    `ประเภทใหม่ (${col7Text})`,
    'จำนวนเงินใหม่',
    'เลขที่เอกสาร(กบฟ)',
    'วันที่ผ่าน(กบฟ)'
  ].join('\t');

  const rows = data.items.map(item => [
    item.debtDocNo,
    item.postingDate,
    item.oldAccountCode,
    item.oldValue,
    item.oldAmount,
    item.newAccountCode,
    item.newValue,
    item.newAmount,
    item.deptDocNo || '',
    item.deptPostingDate || ''
  ].join('\t')).join('\n');

  const totalOld = data.items.reduce((s, i) => s + (Number(i.oldAmount) || 0), 0);
  const totalNew = data.items.reduce((s, i) => s + (Number(i.newAmount) || 0), 0);

  const totalRow = [
    'รวม',
    '',
    '',
    thaiBahtText(totalOld),
    totalOld,
    'รวม',
    '',
    totalNew,
    '',
    ''
  ].join('\t');

  return `${header}\n${rows}\n${totalRow}`;
}
