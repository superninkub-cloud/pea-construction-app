// app/procurement-principle/procurementUtils.ts
/**
 * Utility functions, types, and document generators for Procurement Principle Approval Program
 * (โปรแกรมอนุมัติหลักการจัดซื้อจัดจ้าง)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export type ProcurementType = 'buy' | 'hire';

export interface ProcurementFormData {
  procurementType: ProcurementType; // 'buy' (จัดซื้อ) หรือ 'hire' (จัดจ้าง)

  // ส่วนหัวบันทึกข้อความ
  docFrom: string;                  // จาก เช่น กรย.(ก3)
  docTo: string;                    // ถึง เช่น ฝวบ.(ก3)
  docNo: string;                    // เลขที่หนังสือ (เว้นว่างไว้ตามค่าเริ่มต้น)
  docDate: string;                  // วันที่ (เว้นว่างไว้ตามค่าเริ่มต้น)
  subject: string;                  // เรื่อง
  salutation: string;               // เรียน เช่น อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)

  // ข้อมูลโครงการ
  wbsNo: string;                    // หมายเลขงาน WBS เช่น I-69-I-PSCXX.19.3909 หรือ I-69-I-KCI69.M4.1114
  networkNo: string;                // โครงข่าย เช่น 7001210932 หรือ เว้นว่าง
  activityNo: string;               // กิจกรรม เช่น 0050 หรือ เว้นว่าง
  approvalDocRef: string;           // ตามอนุมัติเลขที่ เช่น ก.3 กวว.(วร) 332/2569 ลงวันที่ 29 มกราคม 2569
  projectName: string;              // ชื่องาน เช่น แผนงานพาดเพิ่ม 22 เควี รองรับสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม
  workOpenerName: string;           // ผู้เปิดงาน เช่น นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก3) หรือ นายอุดมศักดิ์ จันทร์กลิ่น พชง.7 ผกร.กรย.(ก3)

  // รายละเอียดสิ่งของหรือบริการที่จัดซื้อ/จัดจ้าง
  itemDescription: string;          // เช่น ดอกสว่าน BDS HKK-N 022 ดอกเจ็ทบอช 22 mm. เจาะลึก 30 mm. จำนวน 2 ดอก หรือ รถแบคโฮหัวกระแทก PC 55 จำนวน 1 คัน
  targetDateOrPeriod: string;       // วันเวลาดำเนินการ เช่น ในวันจันทร์ที่ 19 ตุลาคม 2569 หรือ ภายในกำหนดแผนงาน
  procurementMethod: string;        // วิธีจัดหา เช่น โดยวิธีเฉพาะเจาะจง

  // เนื้อหา 3 ตอน
  backgroundText: string;           // 1. เรื่องเดิม
  factsText: string;                // 2. ข้อเท็จจริง (เหตุผลความจำเป็น)
  proposalText: string;             // 3. ข้อเสนอเพื่อพิจารณา
  delegationOrderText: string;      // ข้อความคำสั่งมอบอำนาจ กฟภ.
  closingText: string;              // จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป

  // ผู้ลงนามหลัก
  signerName: string;               // นายกำพล ตุ้ยเต็มวงศ์ หรือ นายอนันต์ กาญจนอุปถัมภ์
  signerTitle: string;              // อก.รย.(ก3) หรือ รก.กรย.(ก3) ปฏิบัติงานแทน อก.กรย.(ก3)
  signerDate: string;               // วันที่กำกับลายเซ็น (เว้นว่างไว้)

  // เกษียน / ผู้อนุมัติ
  approverName: string;             // นายเมธี สุภาก่ำ
  approverTitle: string;            // อฝ.วบ.(ก3)
  approverEndorsementTo?: string;   // สั่งการถึง เช่น - อก.รย.(ก3)
  approverDivisionText: string;     // อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง
}

/**
 * Standard PEA Delegation of Authority text
 */
export const DEFAULT_DELEGATION_ORDER = 
  'ตามคำสั่งการไฟฟ้าส่วนภูมิภาคที่ พ.(ม) 28/2568 ลงวันที่ 17 พฤศจิกายน 2568 ซึ่งมอบอำนาจให้ ผู้อำนวยการกอง หรือ ผู้รักษาการแทนตำแหน่งดังกล่าว เป็นผู้มีอำนาจดำเนินการอนุมัติสั่งซื้อ/สั่งจ้าง/สั่งเช่า โดยวิธีเฉพาะเจาะจง ในวงเงินครั้งหนึ่งไม่เกิน 1,000,000.-บาท (หนึ่งล้านบาทถ้วน) ตามข้อ 5.3';

/**
 * Helper to compose standardized PEA "1. เรื่องเดิม" from variable parts
 */
export function composeProcurementBackground(params: {
  approvalDocRef?: string;
  projectName?: string;
  workOpenerName?: string;
  dept?: string;
}): string {
  const ref = params.approvalDocRef || 'ก.3 กวว.(วร) 332/2569 ลงวันที่ 29 มกราคม 2569';
  const proj = params.projectName || 'แผนงานพาดเพิ่ม 22 เควี รองรับสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม';
  const opener = params.workOpenerName || 'นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก3)';
  const dept = params.dept || 'กรย.(ก3)';

  const refPrefix = ref.startsWith('ตามอนุมัติ') || ref.startsWith('ตามหนังสือ') ? ref : `ตามอนุมัติเลขที่ ${ref}`;

  return `${refPrefix} ด้วย ${dept} มี${proj} โดยมี${opener} เป็นผู้เปิดงาน`;
}

/**
 * Helper to compose standardized PEA "3. ข้อเสนอเพื่อพิจารณา" from variable parts
 */
export function composeProcurementProposal(params: {
  procurementType?: 'buy' | 'hire';
  projectName?: string;
  itemDescription?: string;
  targetDateOrPeriod?: string;
  wbsNo?: string;
  networkNo?: string;
  activityNo?: string;
  dept?: string;
}): string {
  const isHire = params.procurementType === 'hire';
  const dept = params.dept || 'กรย.(ก3)';
  const proj = params.projectName || 'งานก่อสร้าง';
  const item = params.itemDescription || 'พัสดุ/บริการ';
  const targetDate = params.targetDateOrPeriod ? ` ${params.targetDateOrPeriod}` : '';
  const wbs = params.wbsNo ? `หมายเลขงาน WBS: ${params.wbsNo}` : '';
  const net = params.networkNo ? ` โครงข่าย ${params.networkNo}` : '';
  const act = params.activityNo ? ` กิจกรรม ${params.activityNo}` : '';
  const accountInfo = [wbs, net, act].filter(Boolean).join('');

  if (isHire) {
    return `${dept} พิจารณาแล้ว เพื่อให้งานก่อสร้างเป็นไปด้วยความเรียบร้อย และแล้วเสร็จทันตามกำหนดตามแผนงานที่กำหนดไว้ จึงขออนุมัติหลักการจ้าง${item}${targetDate} โดยเบิกค่าใช้จ่ายจาก${proj} ${accountInfo}`;
  } else {
    return `${dept} พิจารณาแล้ว เพื่อให้การก่อสร้างเป็นไปตามแผนงานและไม่กระทบงานก่อสร้าง${proj} เห็นควรให้อนุมัติจัดซื้อ${item}${targetDate} โดยให้เบิกจ่ายจาก${accountInfo}`;
  }
}

/**
 * Helper to compose standardized PEA subject line for procurement memo
 */
export function composeProcurementSubject(params: {
  procurementType?: 'buy' | 'hire';
  itemDescription?: string;
  procurementMethod?: string;
}): string {
  const isHire = params.procurementType === 'hire';
  const prefix = isHire ? 'ขออนุมัติหลักการจัดจ้าง' : 'ขออนุมัติหลักการจัดซื้อ';
  const rawItem = (params.itemDescription || '').trim();

  // Clean item description if it already has "จัดซื้อ" or "จัดจ้าง"
  const cleanItem = rawItem
    .replace(/^(ขออนุมัติหลักการจัดซื้อ|ขออนุมัติหลักการจัดจ้าง|จัดซื้อ|จัดจ้าง)\s*/, '')
    .trim();

  const method = (params.procurementMethod || 'โดยวิธีเฉพาะเจาะจง').trim();
  const methodSuffix = method ? ` ${method.startsWith('โดย') ? method : `โดย${method}`}` : '';

  if (!cleanItem) {
    return `${prefix}${isHire ? 'บริการ/เครื่องจักร' : 'พัสดุ/อุปกรณ์'}${methodSuffix}`;
  }

  return `${prefix}${cleanItem}${methodSuffix}`;
}

export interface SubjectPreset {
  key: string;
  badge: string;
  label: string;
  type: ProcurementType;
  subject: string;
  itemDescription: string;
  method: string;
}

export const COMMON_PROCUREMENT_SUBJECT_PRESETS: SubjectPreset[] = [
  {
    key: 'buy-drill',
    badge: '🛒 จัดซื้อดอกสว่าน/หัวเสา',
    label: 'จัดซื้อดอกสว่านสำหรับเจาะเหล็กดัดแปลงอุปกรณ์หัวเสา',
    type: 'buy',
    subject: 'ขออนุมัติหลักการจัดซื้อดอกสว่านสำหรับเจาะเหล็กดัดแปลงอุปกรณ์หัวเสา โดยวิธีเฉพาะเจาะจง',
    itemDescription: 'ดอกสว่าน BDS HKK-N 022 ดอกเจ็ทบอช 22 mm. เจาะลึก 30 mm. จำนวน 2 ดอก',
    method: 'โดยวิธีเฉพาะเจาะจง'
  },
  {
    key: 'buy-material',
    badge: '🛒 จัดซื้อวัสดุ/อุปกรณ์งานก่อสร้าง',
    label: 'จัดซื้อวัสดุอุปกรณ์สำหรับงานก่อสร้างระบบจำหน่าย',
    type: 'buy',
    subject: 'ขออนุมัติหลักการจัดซื้อวัสดุอุปกรณ์สำหรับงานก่อสร้างระบบจำหน่าย โดยวิธีเฉพาะเจาะจง',
    itemDescription: 'วัสดุอุปกรณ์สำหรับงานก่อสร้างระบบจำหน่าย',
    method: 'โดยวิธีเฉพาะเจาะจง'
  },
  {
    key: 'buy-safety',
    badge: '🛒 จัดซื้ออุปกรณ์ความปลอดภัย/เครื่องมือ',
    label: 'จัดซื้ออุปกรณ์ความปลอดภัยและเครื่องมือประจำชุดงานก่อสร้าง',
    type: 'buy',
    subject: 'ขออนุมัติหลักการจัดซื้ออุปกรณ์ความปลอดภัยและเครื่องมือประจำชุดงานก่อสร้าง โดยวิธีเฉพาะเจาะจง',
    itemDescription: 'อุปกรณ์ความปลอดภัยและเครื่องมือประจำชุดงานก่อสร้าง',
    method: 'โดยวิธีเฉพาะเจาะจง'
  },
  {
    key: 'hire-backhoe',
    badge: '🚜 จัดจ้างรถแบคโฮ/หัวกระแทก',
    label: 'จัดจ้างรถแบคโฮหัวกระแทกเพื่อเข้างานก่อสร้าง',
    type: 'hire',
    subject: 'ขออนุมัติหลักการจัดจ้างรถแบคโฮหัวกระแทกเพื่อเข้างานก่อสร้าง โดยวิธีเฉพาะเจาะจง',
    itemDescription: 'รถแบคโฮหัวกระแทก PC 55 จำนวน 1 คัน',
    method: 'โดยวิธีเฉพาะเจาะจง'
  },
  {
    key: 'hire-crane',
    badge: '🏗️ จัดจ้างรถเครนยกเสา/อุปกรณ์',
    label: 'จัดจ้างรถเครนพร้อมพนักงานขับรถปฏิบัติงานก่อสร้าง',
    type: 'hire',
    subject: 'ขออนุมัติหลักการจัดจ้างรถเครนพร้อมพนักงานขับรถปฏิบัติงานก่อสร้าง โดยวิธีเฉพาะเจาะจง',
    itemDescription: 'รถเครนขนาด 25 ตัน พร้อมพนักงานขับรถ จำนวน 1 คัน',
    method: 'โดยวิธีเฉพาะเจาะจง'
  },
  {
    key: 'hire-labor',
    badge: '👷 จัดจ้างเหมาบริการ/แรงงานภายนอก',
    label: 'จัดจ้างเหมาบริการปฏิบัติงานก่อสร้างระบบจำหน่าย',
    type: 'hire',
    subject: 'ขออนุมัติหลักการจัดจ้างเหมาบริการปฏิบัติงานก่อสร้างระบบจำหน่าย โดยวิธีเฉพาะเจาะจง',
    itemDescription: 'จ้างเหมาบริการปฏิบัติงานก่อสร้างระบบจำหน่ายไฟฟ้า',
    method: 'โดยวิธีเฉพาะเจาะจง'
  },
  {
    key: 'hire-truck',
    badge: '🚛 จัดจ้างรถบรรทุกขนส่งเสาและอุปกรณ์',
    label: 'จัดจ้างรถบรรทุกขนส่งเสาและอุปกรณ์เข้าสถานที่ก่อสร้าง',
    type: 'hire',
    subject: 'ขออนุมัติหลักการจัดจ้างรถบรรทุกขนส่งเสาและอุปกรณ์เข้าสถานที่ก่อสร้าง โดยวิธีเฉพาะเจาะจง',
    itemDescription: 'รถบรรทุก 10 ล้อ พร้อมพนักงานขับรถ',
    method: 'โดยวิธีเฉพาะเจาะจง'
  }
];

/**
 * Sample 1: ขออนุมัติหลักการจัดซื้อ (Purchasing Materials/Tools - matching Image 1)
 */
export const SAMPLE_BUY_DATA: ProcurementFormData = {
  procurementType: 'buy',

  docFrom: 'กรย.(ก3)',
  docTo: 'ฝวบ.(ก3)',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขออนุมัติหลักการจัดซื้อดอกสว่านสำหรับเจาะเหล็กดัดแปลงอุปกรณ์หัวเสา โดยวิธีเฉพาะเจาะจง',
  salutation: 'อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)',

  wbsNo: 'I-69-I-PSCXX.19.3909',
  networkNo: '7001210932',
  activityNo: '0050',
  approvalDocRef: 'ก.3 กวว.(วร) 332/2569 ลงวันที่ 29 มกราคม 2569',
  projectName: 'แผนงานพาดเพิ่ม 22 เควี รองรับสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม',
  workOpenerName: 'นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก3)',

  itemDescription: 'ดอกสว่าน BDS HKK-N 022 ดอกเจ็ทบอช 22 mm. เจาะลึก 30 mm. จำนวน 2 ดอก',
  targetDateOrPeriod: '',
  procurementMethod: 'โดยวิธีเฉพาะเจาะจง',

  backgroundText: 'ตามอนุมัติเลขที่ ก.3 กวว.(วร) 332/2569 ลงวันที่ 29 มกราคม 2569 ด้วย กรย.(ก3) มีแผนงานพาดเพิ่ม 22 เควี รองรับสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม โดยมีนายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก3) เป็นผู้เปิดงาน',

  factsText: `2.1 งานก่อสร้างดังกล่าวออกแบบให้ใช้เหล็กรางน้ำขนาด 4.50 เมตร ในการติดตั้งอุปกรณ์ประกอบหัวเสา ซึ่งการนำเหล็กรางน้ำไปใช้งานนั้น จำเป็นต้องเจาะรูเพื่อให้นำไปติดตั้งใช้งานได้\n2.2 ดอกสว่านที่ใช้งานร่วมกับสว่านไฟฟ้า ที่ ผกร.กรย.(ก3) มีใช้งานอยู่ปัจจุบันมีสภาพชำรุดไม่สามารถใช้งานได้ จึงจำเป็นต้องจัดหาทดแทน`,

  proposalText: 'กรย.(ก3) พิจารณาแล้ว เพื่อให้การก่อสร้างเป็นไปตามแผนงานและไม่กระทบงานก่อสร้างสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม เห็นควรให้อนุมัติจัดซื้อดอกสว่าน BDS HKK-N 022 ดอกเจ็ทบอช 22 mm. เจาะลึก 30 mm. จำนวน 2 ดอก โดยให้เบิกจ่ายจากหมายเลขงาน WBS: I-69-I-PSCXX.19.3909 โครงข่าย 7001210932 กิจกรรม 0050',

  delegationOrderText: DEFAULT_DELEGATION_ORDER,
  closingText: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',

  signerName: 'นายกำพล ตุ้ยเต็มวงศ์',
  signerTitle: 'อก.รย.(ก3)',
  signerDate: '',

  approverName: 'นายเมธี สุภาก่ำ',
  approverTitle: 'อฝ.วบ.(ก3)',
  approverEndorsementTo: '- อก.รย.(ก3)',
  approverDivisionText: 'อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง'
};

/**
 * Sample 2: ขออนุมัติหลักการจัดจ้าง (Hiring Machinery/Contractor - matching Image 2)
 */
export const SAMPLE_HIRE_DATA: ProcurementFormData = {
  procurementType: 'hire',

  docFrom: 'กรย.(ก3)',
  docTo: 'ฝวบ.(ก3)',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขออนุมัติหลักการจัดจ้างรถแบคโฮหัวกระแทก PC 55 จำนวน 1 คัน เพื่อเข้างานก่อสร้างงานย้ายแนวระบบสายส่ง 115 kV. บริเวณตรงข้ามวัดท่าน้ำตื้นถึงเมืองไทยสินเชื่อเงินด่วน ต.ท่ามะขาม อ.เมือง จ.กาญจนบุรี',
  salutation: 'อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)',

  wbsNo: 'I-69-I-KCI69.M4.1114',
  networkNo: '',
  activityNo: '',
  approvalDocRef: 'ก.3 กวว.(ปร) 614/2569 ลงวันที่ 28 เมษายน 2569',
  projectName: 'งานก่อสร้างย้ายแนวระบบสายส่ง 115 kV. บริเวณตรงข้ามวัดท่าน้ำตื้นถึงเมืองไทยสินเชื่อเงินด่วน ต.ท่ามะขาม อ.เมือง จ.กาญจนบุรี',
  workOpenerName: 'นายอุดมศักดิ์ จันทร์กลิ่น พชง.7 ผกร.กรย.(ก3)',

  itemDescription: 'รถแบคโฮหัวกระแทก PC 55 จำนวน 1 คัน',
  targetDateOrPeriod: 'ในวันจันทร์ที่ 19 ตุลาคม 2569',
  procurementMethod: 'โดยวิธีเฉพาะเจาะจง',

  backgroundText: 'ตามอนุมัติเลขที่ ก.3 กวว.(ปร) 614/2569 ลงวันที่ 28 เมษายน 2569 ด้วย กรย.(ก3) มีแผนงานก่อสร้างย้ายแนวระบบสายส่ง 115 kV. บริเวณตรงข้ามวัดท่าน้ำตื้นถึงเมืองไทยสินเชื่อเงินด่วน ต.ท่ามะขาม อ.เมือง จ.กาญจนบุรี โดยมีนายอุดมศักดิ์ จันทร์กลิ่น พชง.7 ผกร.กรย.(ก3) เป็นผู้เปิดงาน',

  factsText: 'ด้วย กรย.(ก3) ได้ดำเนินการย้ายแนวระบบสายส่ง 115 เควี บริเวณตรงข้ามวัดท่าน้ำตื้นถึง เมืองไทยสินเชื่อเงินด่วน แล้วเสร็จ ปัจจุบันยังคงเหลืองานรื้อถอนฐานรากชนิด F2 จำนวน 3 ฐาน และชนิด F1/1 จำนวน 1 ฐาน ในการปฏิบัติงาน กรย.(ก3) ไม่มีรถแบคโฮหัวกระแทก เพื่อให้งานรื้อถอนแล้วเสร็จตามแผนงานของกรมทางหลวง จำเป็นต้องดำเนินการโดยวิธีจ้างเหมาบุคคลภายนอกต่อไป เพื่อให้งานก่อสร้างย้ายแนวสายส่ง 115 เควี แล้วเสร็จทันตามแผนงานและวันเวลาที่กำหนด จึงจัดจ้างรถแบคโฮหัวกระแทก PC 55 จำนวน 1 คัน ในวันจันทร์ที่ 19 ตุลาคม 2569',

  proposalText: 'กรย.(ก3) พิจารณาแล้ว เพื่อให้งานก่อสร้างย้ายแนวสายส่ง 115 เควี เป็นไปด้วยความเรียบร้อย ในงานก่อสร้างย้ายแนวสายส่ง 115 เควี ทันตามกำหนดตามแผนงานที่กำหนดไว้ จึงขออนุมัติหลักการจ้างรถแบคโฮหัวกระแทก PC 55 จำนวน 1 คัน ในวันจันทร์ที่ 19 ตุลาคม 2569 โดยเบิกค่าใช้จ่ายจากงานก่อสร้างย้ายแนวระบบสายส่ง 115 kV. บริเวณตรงข้ามวัดท่าน้ำตื้นถึงเมืองไทยสินเชื่อเงินด่วน ต.ท่ามะขาม อ.เมือง จ.กาญจนบุรี หมายเลขงาน WBS: I-69-I-KCI69.M4.1114',

  delegationOrderText: DEFAULT_DELEGATION_ORDER,
  closingText: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',

  signerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  signerTitle: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  signerDate: '',

  approverName: 'นายเมธี สุภาก่ำ',
  approverTitle: 'อฝ.วบ.(ก3)',
  approverEndorsementTo: '- อก.รย.(ก3)',
  approverDivisionText: 'อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง'
};

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

// ============================================================================
// MICROSOFT WORD GENERATORS
// ============================================================================

/**
 * Generate plain text for memo (Formatted for clean pasting into Word)
 */
export function generateProcurementMemoPlainText(data: ProcurementFormData): string {
  const indentLines = (text: string = '', tab = '\t'): string => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => `${tab}${line}`)
      .join('\n');
  };

  const backgroundFormatted = indentLines(data.backgroundText);
  const factsFormatted = indentLines(data.factsText);
  const proposalFormatted = indentLines(data.proposalText);
  const delegationFormatted = data.delegationOrderText ? `\t${data.delegationOrderText}` : '';
  const closingFormatted = `\t${data.closingText || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป'}`;

  return `การไฟฟ้าส่วนภูมิภาค
PROVINCIAL ELECTRICITY AUTHORITY

จาก: ${data.docFrom || ''}\t\tถึง: ${data.docTo || ''}
เลขที่: ${data.docNo || ''}\t\tวันที่: ${data.docDate || ''}
เรื่อง: ${data.subject || ''}
เรียน: ${data.salutation || ''}

1. เรื่องเดิม
${backgroundFormatted}

2. ข้อเท็จจริง
${factsFormatted}

3. ข้อเสนอเพื่อพิจารณา
${proposalFormatted}

${delegationFormatted}

${closingFormatted}



                                        (${data.signerName || ''})
                             ${data.signerTitle || ''}
                             ${data.signerDate || ''}


- ${data.approverEndorsementTo || '- อก.รย.(ก3)'}
  ${data.approverDivisionText || 'อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง'}


                                        (${data.approverName || 'นายเมธี สุภาก่ำ'})
                             ${data.approverTitle || 'อฝ.วบ.(ก3)'}
`;
}

/**
 * Generate HTML Document for downloading as Microsoft Word (.doc)
 */
export function generateProcurementWordDocument(data: ProcurementFormData): string {
  const formatWordParagraphs = (text: string = ''): string => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => `<p class="indent">${line}</p>`)
      .join('\n');
  };

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${data.subject || 'บันทึกขออนุมัติหลักการจัดซื้อจัดจ้าง'}</title>
      <style>
        body { font-family: 'TH Sarabun PSK', 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; line-height: 1.35; margin: 2cm; }
        p { margin: 4pt 0; text-align: justify; }
        .indent { text-indent: 2.5cm; text-align: justify; margin: 4pt 0; line-height: 1.35; }
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

      <!-- Body 3 Paragraphs -->
      <p style="font-weight: bold; margin-top: 14pt;"><u>1. เรื่องเดิม</u></p>
      ${formatWordParagraphs(data.backgroundText)}

      <p style="font-weight: bold; margin-top: 14pt;"><u>2. ข้อเท็จจริง</u></p>
      ${formatWordParagraphs(data.factsText)}

      <p style="font-weight: bold; margin-top: 14pt;"><u>3. ข้อเสนอเพื่อพิจารณา</u></p>
      ${formatWordParagraphs(data.proposalText)}
      ${data.delegationOrderText ? `<p class="indent">${data.delegationOrderText}</p>` : ''}

      <p class="indent" style="margin-top: 14pt;">${data.closingText || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป'}</p>

      <!-- Signer Block -->
      <div style="margin-top: 40px; margin-left: 50%; text-align: center;">
        <p style="margin-bottom: 25px;"><br/></p>
        <p>(${data.signerName || ''})</p>
        <p>${data.signerTitle || ''}</p>
        ${data.signerDate ? `<p>${data.signerDate}</p>` : ''}
      </div>

      <!-- Approver Endorsement Block -->
      <table style="width: 100%; border: none; margin-top: 45px; font-size: 14pt;">
        <tr>
          <td style="width: 55%; vertical-align: top; border: none;">
            <p>${data.approverEndorsementTo || '- อก.รย.(ก3)'}</p>
            <p style="margin-top: 6px;">${data.approverDivisionText || 'อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง'}</p>
            <p style="margin-top: 35px;"><br/></p>
            <p>(${data.approverName || 'นายเมธี สุภาก่ำ'})</p>
            <p>${data.approverTitle || 'อฝ.วบ.(ก3)'}</p>
          </td>
          <td style="width: 45%; vertical-align: top; border: none; text-align: right;">
            <p>รฝ.วบ.(ก3) .............................. วันที่ ....../....../......</p>
            <p style="margin-top: 10px;">ผห.กร.(ก3) .............................. วันที่ ....../....../......</p>
            <p style="margin-top: 10px;">ชผ.กร.(ก3) .............................. วันที่ ....../....../......</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
