// app/overnight-stay/overnightStayUtils.ts
/**
 * Utility functions, types, sample presets, and document generators
 * for Overnight Stay Approval Memo Application (โปรแกรมขออนุมัติพักแรมหน้างาน)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export interface StayPerson {
  id: string;
  name: string;        // เช่น นายศุภวิชญ์ เกาะลอย
  position: string;    // เช่น พชง.6
  department: string;  // เช่น ผกร.กรย.(ก3)
}

export interface OvernightStayFormData {
  // ข้อมูลส่วนหัวหนังสือ (บันทึกข้อความ)
  docFrom: string;              // จาก เช่น กรย.(ก3)
  docTo: string;                // ถึง เช่น กฟก.3
  docNo: string;                // เลขที่หนังสือ เช่น ก.3 กรย.(กร) 2360/2569
  docDate: string;              // วันที่
  subject: string;              // เรื่อง เช่น ขออนุมัติพักแรมหน้างาน
  salutation: string;           // เรียน เช่น ผชก.(ก3) ผ่าน อฝ.วบ.(ก3)

  // อ้างอิงอนุมัติเดินทางและงานก่อสร้าง (วรรคที่ 1)
  travelOrderNo: string;        // เช่น TI26234411 กรย.(ก3)
  workArea: string;             // พื้นที่ปฏิบัติงาน เช่น กฟจ.สมุทรสาคร และการไฟฟ้าในสังกัด กฟก.3
  constructionDescription: string; // รายละเอียดงานก่อสร้าง เช่น รื้อถอนสถานีไฟฟ้าสมุทรสาคร 10...
  workStartDate: string;        // 4 ตุลาคม 2569
  workEndDate: string;          // 31 ตุลาคม 2569
  roundTripDistanceKm: string;  // ระยะทางไป-กลับ เช่น 60 กม.

  // รายการขออนุมัติ (วรรคที่ 2)
  persons: StayPerson[];        // รายชื่อพนักงานที่ขออนุมัติพักแรม
  vehicles: string[];           // หมายเลขทะเบียนรถ กฟภ. เช่น ["90-2228 นฐ.", "90-1845 นฐ."]
  caretakerName: string;        // ผู้ดูแลรักษารถยนต์ เช่น นายศุภวิชญ์ เกาะลอย
  stayStartDate: string;        // 4 ตุลาคม 2569
  stayEndDate: string;          // 31 ตุลาคม 2569
  totalDays: string;            // 27 วัน

  // ผู้ลงนามเสนอ (ขวากลาง)
  proposerName: string;         // นายอนันต์ กาญจนอุปถัมภ์
  proposerPosition: string;     // รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
  proposerDate: string;         // 9 ต.ค. 69

  // ผู้อนุมัติ (ซ้ายล่าง)
  approvalCommand: string;      // อนุมัติ
  approverName: string;         // นายเมธี สุกก่ำ หรือ นายธานิน พ่วงบุญมาก
  approverPosition: string;     // อฝ.วบ.(ก3) ปฏิบัติงานแทน ผชก.(ก3)
  approverDate: string;         // 12 ต.ค. 2569

  // เกษียนหนังสือ (ขวาล่าง)
  hasRoutingStamps: boolean;    // แสดงตารางเกษียนหรือไม่
  stampRwWbDate: string;        // รฝ.วบ.(ก3) เช่น 12 ต.ค. 69
  stampRkRyDate: string;        // รก.รย.(ก3) เช่น 9 ต.ค. 69
  stampHpKrDate: string;        // หผ.กร.(ก3) เช่น 9 ต.ค. 69
  stampCpKrDate: string;        // ชผ.กร.(ก3) เช่น 9/10/2569

  // ท้ายกระดาษ (Footer)
  contactDepartment: string;    // แผนกก่อสร้างระบบไฟฟ้า
  contactPhone: string;         // 10171
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
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
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
 * ชุดตัวอย่างที่ 1: ชุดงานนายศุภวิชญ์ เกาะลอย (รื้อถอนและก่อสร้างสถานีไฟฟ้าสมุทรสาคร 10, 16, 18)
 */
export const SAMPLE_SUPAWIT_DATA: OvernightStayFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กฟก.3',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขออนุมัติพักแรมหน้างาน',
  salutation: 'ผชก.(ก3) ผ่าน อฝ.วบ.(ก3)',

  travelOrderNo: 'TI26234411 กรย.(ก3)',
  workArea: 'กฟจ.สมุทรสาคร และการไฟฟ้าในสังกัด กฟก.3',
  constructionDescription: 'รื้อถอนสถานีไฟฟ้าสมุทรสาคร 10 (ชั่วคราว), รื้อถอนสถานีไฟฟ้าสมุทรสาคร 16 (ชั่วคราว) และก่อสร้างสถานีไฟฟ้าสมุทรสาคร 18 (ชั่วคราว)',
  workStartDate: '',
  workEndDate: '',
  roundTripDistanceKm: '60',

  persons: [
    {
      id: 'p-1',
      name: 'นายศุภวิชญ์ เกาะลอย',
      position: 'พชง.6',
      department: 'ผกร.กรย.(ก3)'
    }
  ],
  vehicles: [
    '90-2228 นฐ.',
    '90-1845 นฐ.',
    '84-1643 นฐ.',
    '84-4715 นฐ.',
    '90-7312 นฐ.'
  ],
  caretakerName: 'นายศุภวิชญ์ เกาะลอย',
  stayStartDate: '',
  stayEndDate: '',
  totalDays: '27',

  proposerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  proposerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  proposerDate: '',

  approvalCommand: 'อนุมัติ',
  approverName: 'นายเมธี สุกก่ำ',
  approverPosition: 'อฝ.วบ.(ก3) ปฏิบัติงานแทน ผชก.(ก3)',
  approverDate: '',

  hasRoutingStamps: true,
  stampRwWbDate: '',
  stampRkRyDate: '',
  stampHpKrDate: '',
  stampCpKrDate: '',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า',
  contactPhone: '10171'
};

/**
 * ชุดตัวอย่างที่ 2: ชุดงานนายวีรพัฒน์ นาคลมัย (ปรับปรุงระบบจำหน่าย 22 เควี พระราม 2 ทล.35 ถึงคลองท่าแร้ง และศาลายา)
 */
export const SAMPLE_WEERAPAT_DATA: OvernightStayFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กฟก.3',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขออนุมัติพักแรมหน้างาน',
  salutation: 'ผชก.(ก3) ผ่าน อฝ.วบ.(ก3)',

  travelOrderNo: 'TI26234410 กรย.(ก3)',
  workArea: 'กฟส.พุทธมณฑล และ กฟส.สมุทรสาคร 2 (บ้านแพ้ว) และการไฟฟ้าในสังกัด กฟก.3',
  constructionDescription: 'งานปรับปรุงระบบจำหน่าย 22 เควี (ใต้ไลน์สายส่งระบบ 115 เควี) ตามแนวทางหลวงหมายเลข 35 ช่วงจุดแบ่งแดน กฟส.สมุทรสาคร ถึง คลองท่าแร้ง (ฝั่งสถานี) ต.ชัยมงคล อ.เมือง จ.สมุทรสาคร และงานปรับปรุงระบบจำหน่าย 22 เควี หลังสนามกอล์ฟ ถึง ซอยดาวทอง (จุดที่ 1-2) หมู่ 1 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม',
  workStartDate: '',
  workEndDate: '',
  roundTripDistanceKm: '60',

  persons: [
    {
      id: 'p-1',
      name: 'นายวีรพัฒน์ นาคลมัย',
      position: 'พชง.6',
      department: 'ผกร.กรย.(ก3)'
    }
  ],
  vehicles: [
    '90-2235 นฐ.',
    '89-5769 นฐ.',
    '90-3515 นฐ.',
    '90-7311 นฐ.'
  ],
  caretakerName: 'นายวีรพัฒน์ นาคลมัย',
  stayStartDate: '',
  stayEndDate: '',
  totalDays: '27',

  proposerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  proposerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  proposerDate: '',

  approvalCommand: 'อนุมัติ',
  approverName: 'นายเมธี สุกก่ำ',
  approverPosition: 'อฝ.วบ.(ก3) ปฏิบัติงานแทน ผชก.(ก3)',
  approverDate: '',

  hasRoutingStamps: true,
  stampRwWbDate: '',
  stampRkRyDate: '',
  stampHpKrDate: '',
  stampCpKrDate: '',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า',
  contactPhone: '10171'
};

/**
 * ชุดตัวอย่างที่ 3: ชุดงานนายศราวุฒิ เกิดสีเล็ก (ปรับปรุงระบบจำหน่าย 22 เควี ยงคอนกรีต ถึง คลองโต๊ะนุ้ย บางเลน)
 */
export const SAMPLE_SARAWUT_DATA: OvernightStayFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กฟก.3',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขออนุมัติพักแรมหน้างาน',
  salutation: 'ผชก.(ก3) ผ่าน อฝ.วบ.(ก3)',

  travelOrderNo: 'TI26237986 กรย.(ก3)',
  workArea: 'กฟส.บางเลน และการไฟฟ้าในสังกัด กฟก.3',
  constructionDescription: 'ปรับปรุงระบบจำหน่าย 22 เควี ช่วงบริเวณยงคอนกรีต ถึง คลองโต๊ะนุ้ย อ.บางเลน จ.นครปฐม',
  workStartDate: '',
  workEndDate: '',
  roundTripDistanceKm: '70',

  persons: [
    {
      id: 'p-1',
      name: 'นายศราวุฒิ เกิดสีเล็ก',
      position: 'พชง.6',
      department: 'ผกร.กรย.(ก3)'
    }
  ],
  vehicles: [
    '90-1844 นฐ.',
    '90-2230 นฐ.',
    '90-2952 นฐ.',
    '90-8896 นฐ.'
  ],
  caretakerName: 'นายศราวุฒิ เกิดสีเล็ก',
  stayStartDate: '',
  stayEndDate: '',
  totalDays: '28',

  proposerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  proposerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  proposerDate: '',

  approvalCommand: 'อนุมัติ',
  approverName: 'นายเมธี สุกก่ำ',
  approverPosition: 'อฝ.วบ.(ก3) ปฏิบัติงานแทน ผชก.(ก3)',
  approverDate: '',

  hasRoutingStamps: true,
  stampRwWbDate: '',
  stampRkRyDate: '',
  stampHpKrDate: '',
  stampCpKrDate: '',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า',
  contactPhone: '10171'
};

/**
 * ชุดตัวอย่างที่ 4: ชุดงานนายขวัญนคร ศรีจันทร์อินทร์ (ปรับปรุงระบบจำหน่ายคลอง D4 ช่วงแยกดอนราว)
 */
export const SAMPLE_KWANNAKORN_DATA: OvernightStayFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กฟก.3',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขออนุมัติพักแรมหน้างาน',
  salutation: 'ผชก.(ก3) ผ่าน อฝ.วบ.(ก3)',

  travelOrderNo: 'TI26238042 กรย.(ก3)',
  workArea: 'กฟส.สมุทรสาคร 2 (บ้านแพ้ว) และการไฟฟ้าในสังกัด กฟก.3',
  constructionDescription: 'ปรับปรุงระบบจำหน่ายคลอง D4 ช่วงแยกดอนราว',
  workStartDate: '',
  workEndDate: '',
  roundTripDistanceKm: '87',

  persons: [
    {
      id: 'p-1',
      name: 'นายขวัญนคร ศรีจันทร์อินทร์',
      position: 'พชง.5',
      department: 'ผกร.กรย.(ก3)'
    }
  ],
  vehicles: [
    '90-1843 นฐ.',
    '53-3735 นฐ.',
    '90-0423 นฐ.',
    '85-3090 นฐ.',
    '90-2951 นฐ.',
    '90-7310 นฐ.'
  ],
  caretakerName: 'นายขวัญนคร ศรีจันทร์อินทร์',
  stayStartDate: '',
  stayEndDate: '',
  totalDays: '28',

  proposerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  proposerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  proposerDate: '',

  approvalCommand: 'อนุมัติ',
  approverName: 'นายเมธี สุกก่ำ',
  approverPosition: 'อฝ.วบ.(ก3) ปฏิบัติงานแทน ผชก.(ก3)',
  approverDate: '',

  hasRoutingStamps: true,
  stampRwWbDate: '',
  stampRkRyDate: '',
  stampHpKrDate: '',
  stampCpKrDate: '',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า',
  contactPhone: '10171'
};

/**
 * สร้างข้อความตัวอย่าง Plain Text สำหรับคัดลอกลง LINE หรือแชท
 */
export function generateOvernightStayMemoPlainText(data: OvernightStayFormData): string {
  let content = `บันทึกข้อความ\n`;
  content += `การไฟฟ้าส่วนภูมิภาค\n\n`;
  content += `จาก: ${data.docFrom}\t\tถึง: ${data.docTo}\n`;
  content += `เลขที่: ${data.docNo || '-'}\t\tวันที่: ${data.docDate || '-'}\n`;
  content += `เรื่อง: ${data.subject}\n`;
  content += `เรียน: ${data.salutation}\n\n`;

  // วรรคที่ 1
  content += `     ตามอนุมัติเดินทางไปปฏิบัติงานต่างพื้นที่ เลขที่ ${data.travelOrderNo} ให้พนักงานในสังกัดเดินทางไปปฏิบัติงานในพื้นที่ ${data.workArea} โดยปฏิบัติงานก่อสร้างดังนี้ ${data.constructionDescription} ตั้งแต่วันที่ ${data.workStartDate} ถึงวันที่ ${data.workEndDate} เนื่องจากระยะทางไปกลับประมาณ ${data.roundTripDistanceKm} กม. การเคลื่อนย้ายชุดปฏิบัติงานซึ่งประกอบด้วย คนงานรายวัน, เครื่องมือ, และเครื่องจักร เป็นไปด้วยความลำบาก และเสียค่าใช้จ่ายมาก เพื่อให้เกิดประสิทธิภาพต่อการปฏิบัติงาน ลดค่าใช้จ่ายในการเดินทางและให้เป็นไปอย่างต่อเนื่อง\n\n`;

  // วรรคที่ 2
  content += `     ${data.docFrom} พิจารณาแล้วเห็นว่าเป็นการลดระยะเวลาและค่าใช้จ่ายในการเดินทาง, สามารถปฏิบัติงานในแต่ละวันเพิ่มขึ้น, ปฏิบัติงานนอกเวลาปกติได้ และเพื่อให้สถานที่พักแรมเป็นที่เก็บรักษาอุปกรณ์, เครื่องมือ และยานพาหนะ จึงเห็นควรให้พนักงานดังกล่าวพักแรมหน้างาน โดยมีสิทธิ์เบิกจ่าย ค่าเบี้ยเลี้ยงและค่าที่พักแรมได้ตามเสนอ ทั้งนี้ให้เบิกเฉพาะวันที่พักแรมหน้างานจริงเท่านั้น จึงขออนุมัติดำเนินการดังนี้\n`;

  // ข้อ 1
  if (data.persons.length === 1) {
    const p = data.persons[0];
    content += `     1. ขออนุมัติให้${p.name} ตำแหน่ง ${p.position} สังกัด ${p.department} พักแรมหน้างาน โดยขอเบิกจ่ายค่าเบี้ยเลี้ยง และค่าที่พักแรมจากงานที่ปฏิบัติ\n`;
  } else {
    content += `     1. ขออนุมัติให้พนักงานสังกัด ${data.persons[0]?.department || 'ผกร.กรย.(ก3)'} พักแรมหน้างาน โดยขอเบิกจ่ายค่าเบี้ยเลี้ยง และค่าที่พักแรมจากงานที่ปฏิบัติ ดังนี้\n`;
    data.persons.forEach((p, idx) => {
      content += `        1.${toThaiNumerals(idx + 1)} ${p.name} ตำแหน่ง ${p.position}\n`;
    });
  }

  // ข้อ 2
  const vehicleList = data.vehicles.join(', ');
  content += `     2. ขออนุมัตินำรถยนต์ กฟภ. หมายเลขทะเบียน ${vehicleList} จอดเก็บรักษาหลังจากเลิกปฏิบัติงาน โดยให้อยู่ในความดูแลรับผิดชอบของ ${data.caretakerName}\n\n`;

  // รวมวัน
  content += `     ทั้งนี้ตั้งแต่วันที่ ${data.stayStartDate} ถึงวันที่ ${data.stayEndDate} รวม ${data.totalDays} วัน\n\n`;
  content += `     จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติให้ต่อไป\n\n`;

  // ผู้เสนอ
  content += `\t\t\t\t\t(${data.proposerName})\n`;
  content += `\t\t\t\t\t${data.proposerPosition}\n\n`;

  // ผู้อนุมัติ
  content += `${data.approvalCommand}\n`;
  content += `(${data.approverName})\n`;
  content += `${data.approverPosition}\n`;
  if (data.approverDate) content += `${data.approverDate}\n`;

  return content;
}

/**
 * สร้างโครงสร้างเอกสาร Word (.doc) สมบูรณ์แบบ
 */
export function generateOvernightStayWordDocument(data: OvernightStayFormData): string {
  const vehicleList = data.vehicles.join(', ');

  let personSectionHtml = '';
  if (data.persons.length === 1) {
    const p = data.persons[0];
    personSectionHtml = `
      <div style="text-indent: 3cm; margin-bottom: 6pt; text-align: justify; line-height: 1.6;">
        1. ขออนุมัติให้${p.name} ตำแหน่ง ${p.position} สังกัด ${p.department} พักแรมหน้างาน โดยขอเบิกจ่ายค่าเบี้ยเลี้ยง และค่าที่พักแรมจากงานที่ปฏิบัติ
      </div>
    `;
  } else {
    personSectionHtml = `
      <div style="text-indent: 3cm; margin-bottom: 4pt; text-align: justify; line-height: 1.6;">
        1. ขออนุมัติให้พนักงานพักแรมหน้างาน โดยขอเบิกจ่ายค่าเบี้ยเลี้ยง และค่าที่พักแรมจากงานที่ปฏิบัติ ดังนี้
      </div>
      ${data.persons.map((p, idx) => `
        <div style="text-indent: 3.5cm; margin-bottom: 3pt; line-height: 1.5;">
          1.${toThaiNumerals(idx + 1)} ${p.name} ตำแหน่ง ${p.position} สังกัด ${p.department}
        </div>
      `).join('')}
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
          margin: 2cm 2cm 1.5cm 2.5cm;
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
          padding: 2.5pt 0;
          vertical-align: top;
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
      <p style="text-indent: 2.5cm; margin-bottom: 10pt; text-align: justify; line-height: 1.6;">
        ตามอนุมัติเดินทางไปปฏิบัติงานต่างพื้นที่ เลขที่ ${data.travelOrderNo} ให้พนักงานในสังกัดเดินทางไปปฏิบัติงานในพื้นที่ ${data.workArea} โดยปฏิบัติงานก่อสร้างดังนี้ ${data.constructionDescription} ตั้งแต่วันที่ ${data.workStartDate} ถึงวันที่ ${data.workEndDate} เนื่องจากระยะทางไปกลับประมาณ ${data.roundTripDistanceKm} กม. การเคลื่อนย้ายชุดปฏิบัติงานซึ่งประกอบด้วย คนงานรายวัน, เครื่องมือ, และเครื่องจักร เป็นไปด้วยความลำบาก และเสียค่าใช้จ่ายมาก เพื่อให้เกิดประสิทธิภาพต่อการปฏิบัติงาน ลดค่าใช้จ่ายในการเดินทางและให้เป็นไปอย่างต่อเนื่อง
      </p>

      <!-- Paragraph 2 -->
      <p style="text-indent: 2.5cm; margin-bottom: 8pt; text-align: justify; line-height: 1.6;">
        ${data.docFrom} พิจารณาแล้วเห็นว่าเป็นการลดระยะเวลาและค่าใช้จ่ายในการเดินทาง, สามารถปฏิบัติงานในแต่ละวันเพิ่มขึ้น, ปฏิบัติงานนอกเวลาปกติได้ และเพื่อให้สถานที่พักแรมเป็นที่เก็บรักษาอุปกรณ์, เครื่องมือ และยานพาหนะ จึงเห็นควรให้พนักงานดังกล่าวพักแรมหน้างาน โดยมีสิทธิ์เบิกจ่าย ค่าเบี้ยเลี้ยงและค่าที่พักแรมได้ตามเสนอ ทั้งนี้ให้เบิกเฉพาะวันที่พักแรมหน้างานจริงเท่านั้น จึงขออนุมัติดำเนินการดังนี้
      </p>

      <!-- Items 1 & 2 -->
      ${personSectionHtml}

      <div style="text-indent: 3cm; margin-bottom: 10pt; text-align: justify; line-height: 1.6;">
        2. ขออนุมัตินำรถยนต์ กฟภ. หมายเลขทะเบียน ${vehicleList} จอดเก็บรักษาหลังจากเลิกปฏิบัติงาน โดยให้อยู่ในความดูแลรับผิดชอบของ ${data.caretakerName}
      </div>

      <!-- Dates & Total Days -->
      <div style="text-indent: 2.5cm; margin-bottom: 10pt; line-height: 1.6;">
        ทั้งนี้ตั้งแต่วันที่ ${data.stayStartDate} ถึงวันที่ ${data.stayEndDate} รวม ${data.totalDays} วัน
      </div>

      <!-- Closing -->
      <p style="text-indent: 2.5cm; margin-bottom: 24pt; line-height: 1.6;">
        จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติให้ต่อไป
      </p>

      <!-- Proposer Signer (Right) -->
      <div style="margin-left: 55%; text-align: center; margin-bottom: 24pt; line-height: 1.4;">
        <br/><br/>
        <div>(${data.proposerName})</div>
        <div>${data.proposerPosition}</div>
        ${data.proposerDate ? `<div style="margin-top: 4pt;">${data.proposerDate}</div>` : ''}
      </div>

      <!-- Bottom Approver & Routing Table -->
      <table style="width: 100%; margin-top: 10pt;">
        <tr>
          <!-- Approver (Left) -->
          <td style="width: 48%; vertical-align: top;">
            <div style="font-weight: bold; margin-bottom: 20pt;">${data.approvalCommand}</div>
            <br/>
            <div>(${data.approverName})</div>
            <div>${data.approverPosition}</div>
            <div style="margin-top: 4pt;">${data.approverDate}</div>
          </td>

          <!-- Routing Stamps (Right) -->
          <td style="width: 52%; vertical-align: top;">
            ${data.hasRoutingStamps ? `
              <table style="width: 100%; border: 1px solid #333; font-size: 14pt;">
                <tr>
                  <td style="padding: 4pt 6pt; border-bottom: 1px solid #ddd; width: 40%;">รฝ.วบ.(ก3)</td>
                  <td style="padding: 4pt 6pt; border-bottom: 1px solid #ddd; width: 30%;">......................</td>
                  <td style="padding: 4pt 6pt; border-bottom: 1px solid #ddd; width: 30%;">วันที่ ${data.stampRwWbDate || '..............'}</td>
                </tr>
                <tr>
                  <td style="padding: 4pt 6pt; border-bottom: 1px solid #ddd;">หผ.กร.(ก3)</td>
                  <td style="padding: 4pt 6pt; border-bottom: 1px solid #ddd;">......................</td>
                  <td style="padding: 4pt 6pt; border-bottom: 1px solid #ddd;">วันที่ ${data.stampHpKrDate || '..............'}</td>
                </tr>
                <tr>
                  <td style="padding: 4pt 6pt;">ชผ.กร.(ก3)</td>
                  <td style="padding: 4pt 6pt;">......................</td>
                  <td style="padding: 4pt 6pt;">วันที่ ${data.stampCpKrDate || '..............'}</td>
                </tr>
              </table>
            ` : ''}
          </td>
        </tr>
      </table>

      <!-- Footer -->
      <div style="margin-top: 20pt; font-size: 12pt; color: #555;">
        ${data.contactDepartment} โทรศัพท์ ${data.contactPhone}
      </div>
    </body>
    </html>
  `;
}
