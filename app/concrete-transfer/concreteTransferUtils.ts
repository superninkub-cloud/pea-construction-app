// app/concrete-transfer/concreteTransferUtils.ts
/**
 * Utility functions, types, sample presets, and document generators
 * for Concrete Products Transfer Request Program (โปรแกรมขอโอนคอนกรีตจาก กผภ.)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export interface ConcreteProductItem {
  id: string;
  itemNo?: number;
  materialCode: string;     // เช่น 1-00-001-0016
  description: string;      // เช่น POLE 22 M WITH GROUND PLATE 2 SIDES
  quantity: string | number;// เช่น 10
  remarks?: string;
}

export interface ConcreteTransferFormData {
  // ส่วนหัวบันทึกข้อความ
  docFrom: string;              // จาก เช่น กรย.(ก3)
  docTo: string;                // ถึง เช่น กผภ.
  docNo: string;                // เลขที่หนังสือ เช่น ก.3 กรย.(กร.) - ๒๒๓๘/๒๕๖๙
  docDate: string;              // วันที่ เช่น ๕ ต.ค. ๒๕๖๙
  subject: string;              // เรื่อง เช่น ขอโอนผลิตภัณฑ์คอนกรีต จาก ผรค.กจ., รบ. มาใช้งานพื้นที่ กฟก.3
  salutation: string;           // เรียน เช่น อก.ผภ.

  // แหล่งที่มาและงานโครงการ (วรรคที่ ๑)
  sourceUnits: string;          // เช่น ผรค.รบ.,กจ. หรือ ผรค.กจ. หรือ ผรค.รบ.
  planDescription: string;      // เช่น กฟก.3 มีแผนงานก่อสร้างย้ายแนว 115 เควี คลองท่าแร้ง ฝั่งขาออก กทม. จ.สมุทรสาคร
  wbsNo: string;                // เช่น I-69-I-SM269.M4.1105
  objectivePurpose: string;     // เช่น เพื่อใช้ในภารกิจงานย้ายแนวระบบจำหน่าย หรือ เพื่อใช้งานก่อสร้างระบบสายส่ง 115 เควี
  workCategory: string;         // เช่น ระบบจำหน่าย หรือ ระบบสายส่ง

  // รายการผลิตภัณฑ์คอนกรีตในตาราง
  items: ConcreteProductItem[];

  // การประสานงาน (วรรคท้าย)
  contactPerson: string;        // เช่น นายชานินทร์ ศรีสวัสดิ์
  contactPosition: string;      // เช่น ตำแหน่ง ชผ.กร.กรย.(ก3)
  contactPhone: string;         // เช่น 099-1326977

  // ผู้ลงนามหลัก (ขวากลาง)
  signerName: string;           // นายอนันต์ กาญจนอุปถัมภ์
  signerPosition: string;       // รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
  signerDate: string;           // ๕ ต.ค. ๖๙

  // ส่วนส่งต่อเพื่อโปรดทราบ (ซ้ายล่าง)
  hasInformSection: boolean;    // true
  informDocNo: string;          // ที่ ก.3 กรย.(กร.) ๒๒๓๘/๒๕๖๙
  informReceivers: string;      // เช่น ผจก.กฟจ.สมุทรสาคร, ผจก.กฟส.สมุทรสาคร 2
  informActionText: string;     // เพื่อโปรดทราบ และแจ้ง ผคพ. พร้อมส่วนเกี่ยวข้องต่อไป
  informSignerName: string;     // นายอนันต์ กาญจนอุปถัมภ์
  informSignerPosition: string; // รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
  informDate: string;           // ๕ ต.ค. ๖๙

  // เกษียนหนังสือ (ขวาล่าง)
  hasRoutingStamps: boolean;    // true
  stampHpKrDate: string;        // หผ. เช่น ๕ ต.ค. ๖๙
  stampCpKrDate: string;        // ชผ. เช่น ๕ ต.ค. ๖๙

  // ท้ายกระดาษ
  contactDepartment: string;    // แผนกก่อสร้างระบบไฟฟ้า
}

/**
 * แปลงเลขอารบิกเป็นเลขไทย
 */
export function toThaiNumerals(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return str.toString().replace(/[0-9]/g, (match) => thaiDigits[parseInt(match, 10)]);
}

/**
 * แปลงเลขไทยเป็นเลขอารบิก
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
 * ดึงวันที่ปัจจุบันแบบไทย
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
 * รายการผลิตภัณฑ์คอนกรีตยอดนิยม
 */
export const POPULAR_CONCRETE_PRODUCTS = [
  { code: '1-00-001-0016', name: 'POLE 22 M WITH GROUND PLATE 2 SIDES' },
  { code: '1-00-001-0014', name: 'POLE 14 M (เสา คอร. 14.00 ม.)' },
  { code: '1-00-001-0012', name: 'POLE 12 M (เสา คอร. 12.00 ม.)' },
  { code: '1-00-003-0000', name: 'PILE 0.44X0.44X8.5 M. 10 T-M. (T1)' },
  { code: '1-00-003-0001', name: 'PILE 0.44X0.44X8.5 M. 10 T-M. (T2)' },
  { code: '1-00-003-0002', name: 'PILE 0.44X0.44X8.5 M. 10 T-M. (T3)' },
  { code: '1-00-003-0003', name: 'PILE 0.44X0.44X8.5 M. 10 T-M. (T4)' },
  { code: '1-00-005-0013', name: 'CONC. FOOTING 0.90X2.20X2.30 M.' },
  { code: '1-00-005-0010', name: 'CONC. CROSSARM 2.50 M (คาน คอร. 2.50 ม.)' },
  { code: '1-00-005-0012', name: 'CONC. CROSSARM 3.00 M (คาน คอร. 3.00 ม.)' }
];

/**
 * ตัวอย่างที่ 1: เสา 22 ม. + เสาเข็ม T1-T4 คลองท่าแร้ง สมุทรสาคร (ตรงตาม PDF 1)
 */
export const SAMPLE_CONCRETE_TRANSFER_1: ConcreteTransferFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กผภ.',
  docNo: 'ก.3 กรย.(กร.) - ๒๒๓๘/๒๕๖๙',
  docDate: '๕ ต.ค. ๒๕๖๙',
  subject: 'ขอโอนผลิตภัณฑ์คอนกรีต จาก ผรค.กจ., รบ. มาใช้งานพื้นที่ กฟก.3',
  salutation: 'อก.ผภ.',

  sourceUnits: 'ผรค.รบ.,กจ.',
  planDescription: 'เนื่องด้วย กฟก.3 มีแผนงานก่อสร้างย้ายแนว 115 เควี คลองท่าแร้ง ฝั่งขาออก กทม. จ.สมุทรสาคร หมายเลขงาน WBS : I-69-I-SM269.M4.1105',
  wbsNo: 'I-69-I-SM269.M4.1105',
  objectivePurpose: 'ซึ่งมีความต้องการผลิตภัณฑ์คอนกรีต เพื่อใช้ในภารกิจงานย้ายแนวระบบจำหน่าย จึงมีความจำเป็นต้องขอโอนจาก ผรค.รบ.,กจ. ดังรายการต่อไปนี้',
  workCategory: 'ระบบจำหน่าย',

  items: [
    { id: 'item-1', materialCode: '1-00-001-0016', description: 'POLE 22 M WITH GROUND PLATE 2 SIDES', quantity: '10' },
    { id: 'item-2', materialCode: '1-00-003-0000', description: 'PILE 0.44X0.44X8.5 M. 10 T-M. (T1)', quantity: '8' },
    { id: 'item-3', materialCode: '1-00-003-0001', description: 'PILE 0.44X0.44X8.5 M. 10 T-M. (T2)', quantity: '10' },
    { id: 'item-4', materialCode: '1-00-003-0002', description: 'PILE 0.44X0.44X8.5 M. 10 T-M. (T3)', quantity: '8' },
    { id: 'item-5', materialCode: '1-00-003-0003', description: 'PILE 0.44X0.44X8.5 M. 10 T-M. (T4)', quantity: '2' }
  ],

  contactPerson: 'นายชานินทร์ ศรีสวัสดิ์',
  contactPosition: 'ตำแหน่ง ชผ.กร.กรย.(ก3)',
  contactPhone: '099-1326977',

  signerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  signerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  signerDate: '๕ ต.ค. ๖๙',

  hasInformSection: true,
  informDocNo: 'ก.3 กรย.(กร.) ๒๒๓๘/๒๕๖๙',
  informReceivers: 'ผจก.กฟจ.สมุทรสาคร, ผจก.กฟส.สมุทรสาคร 2',
  informActionText: 'เพื่อโปรดทราบ และแจ้ง ผคพ. พร้อมส่วนเกี่ยวข้องต่อไป',
  informSignerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  informSignerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  informDate: '๕ ต.ค. ๖๙',

  hasRoutingStamps: true,
  stampHpKrDate: '๕ ต.ค. ๖๙',
  stampCpKrDate: '๕ ต.ค. ๖๙',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า'
};

/**
 * ตัวอย่างที่ 2: เสา 22 ม. สถานีไฟฟ้ากาญจนบุรี 5 ชั่วคราว (ตรงตาม PDF 2)
 */
export const SAMPLE_CONCRETE_TRANSFER_2: ConcreteTransferFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กผภ.',
  docNo: 'ก.3 กรย.(กร) ๒๔๒๑/๒๕๖๙',
  docDate: '๑๔ ต.ค. ๒๕๖๙',
  subject: 'ขอโอนผลิตภัณฑ์คอนกรีต จาก ผรค.กจ. มาใช้งานพื้นที่ กฟก.3',
  salutation: 'อก.ผภ.',

  sourceUnits: 'ผรค.กจ.',
  planDescription: 'เนื่องด้วย กฟก.3 มีแผนดำเนินการก่อสร้างระบบสายส่งรองรับการจ่ายไฟให้กับสถานีไฟฟ้ากาญจนบุรี 5 (ชั่วคราว) ตามหมายเลขงาน (WBS): I-69-I-KCI02.19.3907 ซึ่งมีแผนก่อสร้างแล้วเสร็จและจ่ายไฟภายในต้นปี 2570',
  wbsNo: 'I-69-I-KCI02.19.3907',
  objectivePurpose: 'ทั้งนี้มีความต้องการผลิตภัณฑ์คอนกรีต เพื่อใช้งานก่อสร้างระบบสายส่ง 115 เควี จึงมีความจำเป็นต้องขอโอน จาก ผรค.กจ. ดังรายการต่อไป',
  workCategory: 'ระบบสายส่ง',

  items: [
    { id: 'item-1', materialCode: '1-00-001-0016', description: 'POLE 22 M WITH GROUND PLATE 2 SIDES', quantity: '7' }
  ],

  contactPerson: 'นายชานินทร์ ศรีสวัสดิ์',
  contactPosition: 'ชผ.กร.กรย.(ก3)',
  contactPhone: '099-1326977',

  signerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  signerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  signerDate: '๑๔ ต.ค. ๖๙',

  hasInformSection: true,
  informDocNo: 'ก.3 กรย.(กร) ๒๔๒๑/๒๕๖๙',
  informReceivers: 'ผจก.กฟจ.กาญจนบุรี',
  informActionText: 'เพื่อโปรดทราบ และแจ้ง ผคพ.ดำเนินการในส่วนเกี่ยวข้องต่อไป',
  informSignerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  informSignerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  informDate: '๑๔ ต.ค. ๖๙',

  hasRoutingStamps: true,
  stampHpKrDate: '๑๔/๑๐/๖๙',
  stampCpKrDate: '๑๖/๑๐/๒๕๖๙',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า'
};

/**
 * ตัวอย่างที่ 3: ตอม่อ CONC. FOOTING คลองท่าแร้ง สมุทรสาคร (ตรงตาม PDF 3)
 */
export const SAMPLE_CONCRETE_TRANSFER_3: ConcreteTransferFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กผภ.',
  docNo: 'ก.3 กรย.(กร.) - ๒๔๒๑/๒๕๖๙',
  docDate: '๑๔ ต.ค. ๒๕๖๙',
  subject: 'ขอโอนผลิตภัณฑ์คอนกรีต จาก ผรค.รบ. มาใช้งานพื้นที่ กฟก.3',
  salutation: 'อก.ผภ.',

  sourceUnits: 'ผรค.รบ.',
  planDescription: 'เนื่องด้วย กฟก.3 มีแผนงานก่อสร้างย้ายแนวระบบสายส่ง 115 เควี บริเวณ คลองท่าแร้ง ฝั่งขาออก กทม. จ.สมุทรสาคร WBS: I-69-I-SM269.M4.1105',
  wbsNo: 'I-69-I-SM269.M4.1105',
  objectivePurpose: 'ซึ่งมีความต้องการผลิตภัณฑ์คอนกรีต เพื่อใช้ในภารกิจงานย้ายแนวระบบสายส่ง 115 เควี จึงมีความจำเป็นต้องขอโอนจาก ผรค.รบ. ดังรายการต่อไปนี้',
  workCategory: 'ย้ายแนวสายส่ง',

  items: [
    { id: 'item-1', materialCode: '1-00-005-0013', description: 'CONC. FOOTING 0.90X2.20X2.30 M.', quantity: '8.00' }
  ],

  contactPerson: 'นายชานินทร์ ศรีสวัสดิ์',
  contactPosition: 'ตำแหน่ง ชผ.กร.กรย.(ก3)',
  contactPhone: '099-1326977',

  signerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  signerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  signerDate: '๑๔ ต.ค. ๖๙',

  hasInformSection: true,
  informDocNo: 'ก.3 กรย.(กร) ๒๔๒๑/๒๕๖๙',
  informReceivers: 'ผจก.กฟจ.สมุทรสาคร, ผจก.กฟส.สมุทรสาคร 2',
  informActionText: 'เพื่อโปรดทราบ และแจ้ง ผคพ. พร้อมส่วนเกี่ยวข้องต่อไป',
  informSignerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  informSignerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  informDate: '๑๔ ต.ค. ๖๙',

  hasRoutingStamps: true,
  stampHpKrDate: '๑๔/๑๐/๖๙',
  stampCpKrDate: '๑๖/๑๐/๒๕๖๙',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า'
};

/**
 * สร้างข้อความตัวอย่าง Plain Text สำหรับคัดลอกลง LINE หรือแชท
 */
export function generateConcreteTransferMemoPlainText(data: ConcreteTransferFormData): string {
  let content = `บันทึกข้อความ\n`;
  content += `การไฟฟ้าส่วนภูมิภาค\n\n`;
  content += `จาก: ${data.docFrom}\t\tถึง: ${data.docTo}\n`;
  content += `เลขที่: ${data.docNo || '-'}\t\tวันที่: ${data.docDate || '-'}\n`;
  content += `เรื่อง: ${data.subject}\n`;
  content += `เรียน: ${data.salutation}\n\n`;

  // วรรคที่ 1
  content += `     ${data.planDescription}\n`;
  content += `     ${data.objectivePurpose}\n\n`;

  // ตารางรายการ
  content += `รายการผลิตภัณฑ์คอนกรีต:\n`;
  data.items.forEach((item, idx) => {
    content += `${idx + 1}. รหัส: ${item.materialCode} | ${item.description} | จำนวน ${item.quantity}\n`;
  });
  content += `\n`;

  // วรรคปิดท้าย
  content += `     ดังนั้น เพื่อให้งานก่อสร้าง${data.workCategory}แล้วเสร็จตามแผนงาน จึงขอให้ กผภ. พิจารณาดำเนินการโอนผลิตภัณฑ์คอนกรีตตามรายการดังกล่าวข้างต้นให้กับ กฟก.3 เสนอให้ต่อไปด้วย ทั้งนี้ได้ประสานงานกับ แผนกวางแผนการผลิต กองผลิตคอนกรีตและอุปกรณ์ แล้วไม่ขัดข้อง สามารถประสานงานกับ ${data.contactPerson} ${data.contactPosition} เบอร์โทรศัพท์ ${data.contactPhone}\n\n`;
  content += `     จึงเรียนมาเพื่อโปรดพิจารณา และแจ้งส่วนเกี่ยวข้องดำเนินการให้ต่อไปด้วย\n\n`;

  // ผู้ลงนาม
  content += `\t\t\t\t\t(${data.signerName})\n`;
  content += `\t\t\t\t\t${data.signerPosition}\n`;
  if (data.signerDate) content += `\t\t\t\t\t${data.signerDate}\n\n`;

  // ส่วนส่งต่อ
  if (data.hasInformSection) {
    content += `----------------------------------------\n`;
    content += `ที่ ${data.informDocNo}\n`;
    content += `เรียน ${data.informReceivers}\n`;
    content += `     ${data.informActionText}\n\n`;
    content += `\t\t\t\t\t(${data.informSignerName})\n`;
    content += `\t\t\t\t\t${data.informSignerPosition}\n`;
    if (data.informDate) content += `\t\t\t\t\t${data.informDate}\n`;
  }

  return content;
}

/**
 * สร้างเอกสาร Word (.doc) สมบูรณ์แบบ
 */
export function generateConcreteTransferWordDocument(data: ConcreteTransferFormData): string {
  const tableRowsHtml = data.items.map((item, idx) => `
    <tr>
      <td style="text-align: center; border: 1px solid #000; padding: 4pt; width: 6%;">${idx + 1}.</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4pt; width: 22%;">${item.materialCode}</td>
      <td style="text-align: left; border: 1px solid #000; padding: 4pt; width: 58%;">${item.description}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4pt; width: 14%;">${item.quantity}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${data.subject}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 2.2cm 2cm 1.5cm 2.5cm;
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
        td, th {
          vertical-align: middle;
          font-size: 16pt;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <table style="width: 100%; margin-bottom: 8pt;">
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
      <table style="width: 100%; margin-bottom: 12pt; border-bottom: 1.5pt solid #000; padding-bottom: 4pt;">
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

      <!-- Paragraph 1 -->
      <p style="text-indent: 2.5cm; margin-bottom: 8pt; text-align: justify; line-height: 1.6;">
        ${data.planDescription}
      </p>

      <!-- Paragraph 2 -->
      <p style="text-indent: 2.5cm; margin-bottom: 12pt; text-align: justify; line-height: 1.6;">
        ${data.objectivePurpose}
      </p>

      <!-- Items Table -->
      <table style="width: 100%; border: 1px solid #000; margin-bottom: 14pt; font-size: 15pt;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #000; padding: 4pt; text-align: center; width: 6%;">ที่</th>
            <th style="border: 1px solid #000; padding: 4pt; text-align: center; width: 22%;">รหัสพัสดุ</th>
            <th style="border: 1px solid #000; padding: 4pt; text-align: center; width: 58%;">รายการ</th>
            <th style="border: 1px solid #000; padding: 4pt; text-align: center; width: 14%;">จำนวน</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <!-- Closing Paragraph -->
      <p style="text-indent: 2.5cm; margin-bottom: 8pt; text-align: justify; line-height: 1.6;">
        ดังนั้น เพื่อให้งานก่อสร้าง${data.workCategory}แล้วเสร็จตามแผนงาน จึงขอให้ กผภ. พิจารณาดำเนินการโอนผลิตภัณฑ์คอนกรีตตามรายการดังกล่าวข้างต้นให้กับ กฟก.3 เสนอให้ต่อไปด้วย ทั้งนี้ได้ประสานงานกับ แผนกวางแผนการผลิต กองผลิตคอนกรีตและอุปกรณ์ แล้วไม่ขัดข้อง สามารถประสานงานกับ ${data.contactPerson} ${data.contactPosition} เบอร์โทรศัพท์ ${data.contactPhone}
      </p>

      <p style="text-indent: 2.5cm; margin-bottom: 20pt; line-height: 1.6;">
        จึงเรียนมาเพื่อโปรดพิจารณา และแจ้งส่วนเกี่ยวข้องดำเนินการให้ต่อไปด้วย
      </p>

      <!-- Signer Block (Right) -->
      <div style="margin-left: 55%; text-align: center; margin-bottom: 20pt; line-height: 1.4;">
        <br/><br/>
        <div>(${data.signerName})</div>
        <div>${data.signerPosition}</div>
        ${data.signerDate ? `<div style="margin-top: 3pt;">${data.signerDate}</div>` : ''}
      </div>

      <!-- Inform Section (Bottom Left) -->
      ${data.hasInformSection ? `
        <div style="width: 58%; line-height: 1.4; margin-top: 10pt;">
          <div style="font-weight: bold;">ที่ ${data.informDocNo}</div>
          <div style="font-weight: bold; margin-top: 2pt;">เรียน ${data.informReceivers}</div>
          <div style="text-indent: 1cm; margin-top: 4pt; margin-bottom: 12pt;">${data.informActionText}</div>
          <div style="text-align: center; margin-left: 15%;">
            <br/>
            <div>(${data.informSignerName})</div>
            <div>${data.informSignerPosition}</div>
            ${data.informDate ? `<div style="margin-top: 2pt;">${data.informDate}</div>` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 20pt; font-size: 11pt; color: #555;">
        ${data.contactDepartment}
      </div>
    </body>
    </html>
  `;
}
