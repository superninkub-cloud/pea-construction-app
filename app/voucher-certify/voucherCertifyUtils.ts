// app/voucher-certify/voucherCertifyUtils.ts
/**
 * Data structures, default presets, calculation utilities, Thai numeral converters,
 * and Word export generators for Payment Voucher Certification Program (โปรแกรมรับรองใบสำคัญจ่าย)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export interface VoucherLineItem {
  id: string;
  itemNo?: number;
  docDate: string;           // วันที่เอกสาร เช่น 05.08.2022
  docNumber: string;         // เลขที่เอกสาร SAP / FI Document เช่น 2001273190
  accountCode: string;       // รหัสบัญชี เช่น 6001070196 0050 หรือ 53039010
  amount: number;            // จำนวนเงิน เช่น 2236.45
  description: string;       // รายละเอียด เช่น FLEET กทค. ทะเบียน 90-1844 นฐ
  payeeOrRef?: string;       // ชื่อผู้รับเงิน / การไฟฟ้า / ทะเบียนรถ เช่น การไฟฟ้าส่วนภูมิภาค สาขา อ.บางเลน
}

export interface ExpenseCategory {
  id: string;
  code: string;              // รหัสหมวด เช่น FUEL, LABOUR, PER_DIEM, ACCOMMODATION, REPAIR
  name: string;              // ชื่อหมวด เช่น ค่าเชื้อเพลิงยานพาหนะ, ค่าแรง, ค่าเบี้ยเลี้ยงพนักงาน
  sapAccount: string;        // บัญชีต้นทุน เช่น 53039010, 53010060, 52022020, 52022030, 53051050
  amount: number;            // จำนวนเงินรวมของหมวดนี้
  items: VoucherLineItem[];  // รายการย่อยจาก SAP
}

export interface VoucherCertifyFormData {
  // บันทึกข้อความส่วนหัว
  docFrom: string;              // กรย.(ก3)
  docTo: string;                // กบฟ.(ก3)
  docNo: string;                // ก.3 กรย.(กร)- 2233 /2569
  docDate: string;              // 22 ก.ค. 2569
  subject: string;              // ขอรับรองสำเนาเอกสารใบสำคัญจ่าย
  salutation: string;           // อก.บฟ.(ก3)

  // ข้อมูลผู้ควบคุมงานและโครงการ
  supervisorName: string;       // นายศราวุฒิ เกิดสีเล็ก
  supervisorPosition: string;   // ผพง.6 ผกร.กรย.(ก3)
  projectName: string;          // งานปรับปรุงระบบจำหน่าย 22 เควี บริเวณตามแนวทางหลวงหมายเลข 357 แยกทางหลวงหมายเลข 3318 ถึง สถานีไฟฟ้าสุพรรณบุรี 2 ต.รั้วใหญ่ อ.เมือง จ.สุพรรณบุรี
  shortProjectName: string;     // ปป. แยกทางหลวงหมายเลข 3318 - สฟ.สุพรรณบุรี 2
  wbsNumber: string;            // P-TD02.3-I-SPINA.0007
  statusExplanation: string;    // ซึ่งปัจจุบันได้ดำเนินการก่อสร้างแล้วเสร็จ และเพื่อจัดส่งเอกสารปิดงานก่อสร้าง ซึ่งเอกสารใบสำคัญจ่ายบางรายการไม่ครบถ้วน
  purposeText: string;          // เพื่อให้การปิด กส. เป็นไปด้วยความเรียบร้อยทั้งนี้ กรย.(ก3) ได้ลงนามรับรองการเบิกค่าใช้จ่ายงานดังกล่าวแล้วตามเอกสารแนบ จึงขอให้ กบฟ.(ก3) ดำเนินการปิด กส. ให้ต่อไป โดยมีรายละเอียดดังนี้

  // หมวดหมู่ค่าใช้จ่าย
  categories: ExpenseCategory[];

  // ผู้ลงนามหลัก (ผู้ควบคุมงาน)
  signerName: string;           // นายศราวุฒิ เกิดสีเล็ก
  signerPosition: string;       // ผพง.6 ผกร.กรย.(ก3)
  signerDate: string;           // 22 ก.ค. 2569

  // เกษียนหนังสือ (ขวาล่าง)
  hasRoutingStamps: boolean;    // true
  stampHpKrDate: string;        // หผ.กร.(ก3) วันที่ เช่น 22 ก.ค. 69
  stampCpKrDate: string;        // ชผ.กร.(ก3) วันที่ เช่น 22 ก.ค. 69

  // ท้ายกระดาษ
  contactDepartment: string;    // แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3
  contactPhone: string;         // 10171

  // ตัวเลือกเลขไทย
  isThaiNumerals: boolean;
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
 * ฟอร์แมตตัวเลขการเงิน (มี comma และทศนิยม 2 ตำแหน่ง)
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '0.00';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * แปลงจำนวนเงินเป็นตัวหนังสือภาษาไทย (บาทถ้วน / สตางค์)
 */
export function thaiBahtText(num: number | string): string {
  const number = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(number) || number === 0) return 'ศูนย์บาทถ้วน';

  const isNegative = number < 0;
  const absNum = Math.abs(number);
  const parts = absNum.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const thaiUnits = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  function convertGroup(nStr: string): string {
    let result = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(nStr.charAt(i), 10);
      const pos = len - i - 1;
      if (digit !== 0) {
        if (pos === 0 && digit === 1 && len > 1) {
          result += 'เอ็ด';
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่สิบ';
        } else if (pos === 1 && digit === 1) {
          result += 'สิบ';
        } else {
          result += thaiNumbers[digit] + thaiUnits[pos];
        }
      }
    }
    return result;
  }

  let bahtStr = '';
  const len = integerPart.length;
  if (len > 6) {
    const millionPart = integerPart.substring(0, len - 6);
    const remainPart = integerPart.substring(len - 6);
    bahtStr = convertGroup(millionPart) + 'ล้าน' + convertGroup(remainPart);
  } else {
    bahtStr = convertGroup(integerPart);
  }

  if (bahtStr === '') bahtStr = 'ศูนย์';
  bahtStr += 'บาท';

  if (decimalPart === '00' || !decimalPart) {
    bahtStr += 'ถ้วน';
  } else {
    let satangStr = '';
    const d1 = parseInt(decimalPart.charAt(0), 10);
    const d2 = parseInt(decimalPart.charAt(1), 10);

    if (d1 === 1) satangStr += 'สิบ';
    else if (d1 === 2) satangStr += 'ยี่สิบ';
    else if (d1 > 2) satangStr += thaiNumbers[d1] + 'สิบ';

    if (d2 === 1 && d1 !== 0) satangStr += 'เอ็ด';
    else if (d2 > 0) satangStr += thaiNumbers[d2];

    bahtStr += satangStr + 'สตางค์';
  }

  return isNegative ? 'ลบ' + bahtStr : bahtStr;
}

/**
 * ดึงวันที่ปัจจุบันแบบไทย
 */
export function getTodayThaiDate(): string {
  const date = new Date();
  const day = date.getDate();
  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const month = thaiMonthsShort[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

/**
 * สร้างข้อความสรุปค่าใช้จ่ายภาษาไทย เช่น
 * "โดยเป็นค่าเชื้อเพลิงยานพาหนะ เป็นเงิน 78,302.00 บาท ค่าแรง เป็นเงิน 665,088.57 บาท..."
 */
export function generateExpenseSummarySentence(categories: ExpenseCategory[], useThaiDigits: boolean = false): string {
  const activeCats = categories.filter(c => Number(c.amount) > 0);
  if (activeCats.length === 0) return 'โดยยังไม่มีรายการค่าใช้จ่ายที่ระบุจำนวนเงิน';

  const parts = activeCats.map((cat, idx) => {
    const formattedAmt = formatCurrency(cat.amount);
    const amtStr = useThaiDigits ? toThaiNumerals(formattedAmt) : formattedAmt;
    const prefix = idx === 0 ? 'โดยเป็น' : idx === activeCats.length - 1 ? 'และ' : '';
    return `${prefix}${cat.name} เป็นเงิน ${amtStr} บาท`;
  });

  return parts.join(' ');
}

/**
 * คำนวณยอดรวมค่าใช้จ่ายทั้งหมด
 */
export function calculateGrandTotal(categories: ExpenseCategory[]): number {
  return categories.reduce((sum, cat) => sum + (Number(cat.amount) || 0), 0);
}

/**
 * หมวดหมู่เริ่มต้นตามมาตรฐาน กฟภ. (ตามหน้า 1-6 ของเอกสาร)
 */
export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'fuel',
    code: 'FUEL',
    name: 'ค่าเชื้อเพลิงยานพาหนะ',
    sapAccount: '53039010',
    amount: 73439.80,
    items: [
      { id: 'f-1', docDate: '03.08.2022', docNumber: '2001273190', accountCode: '6001070196 0050', amount: 2236.45, description: 'FLEET กทค. ทะเบียน 90-1844 นฐ', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค สาขา อ.บางเลน' },
      { id: 'f-2', docDate: '05.08.2022', docNumber: '2001273193', accountCode: '6001070196 0050', amount: 2252.34, description: 'FLEET กทค. ทะเบียน 90-1844 นฐ', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค สาขา อ.บางเลน' },
      { id: 'f-3', docDate: '13.08.2022', docNumber: '2001273209', accountCode: '6001070196 0050', amount: 2429.91, description: 'FLEET กทค. ทะเบียน 90-1844 นฐ', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค สาขา อ.บางเลน' },
      { id: 'f-4', docDate: '19.08.2022', docNumber: '2001273216', accountCode: '6001070196 0050', amount: 2236.45, description: 'FLEET กทค. ทะเบียน 90-1844 นฐ', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค สาขา อ.บางเลน' },
      { id: 'f-5', docDate: '23.08.2022', docNumber: '2001273221', accountCode: '6001070196 0050', amount: 2236.45, description: 'FLEET กทค. ทะเบียน 90-1844 นฐ', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค สาขา อ.บางเลน' },
      { id: 'f-6', docDate: '27.07.2022', docNumber: '2001089556', accountCode: '6001070196 0050', amount: 4790.85, description: 'FLEET กทค. ทะเบียน 90-2131 นฐ', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค จ.กาญจนบุรี' },
      { id: 'f-7', docDate: '27.07.2022', docNumber: '2001089582', accountCode: '6001070196 0050', amount: 2554.30, description: 'FLEET กทค. ทะเบียน 90-2230 นฐ', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค จ.กาญจนบุรี' },
      { id: 'f-8', docDate: '27.07.2022', docNumber: '2001089602', accountCode: '6001070196 0050', amount: 5149.53, description: 'FLEET กทค. ทะเบียน 90-2228 นฐ', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค จ.กาญจนบุรี' },
      { id: 'f-9', docDate: '01.08.2022', docNumber: '2001283615', accountCode: '6001070196 0050', amount: 4126.17, description: 'FLEET กทค. ทะเบียน 90-2235 นฐ', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค จ.กาญจนบุรี' },
      { id: 'f-10', docDate: '17.08.2022', docNumber: '2001254203', accountCode: '6001070196 0050', amount: 3012.80, description: 'FLEET CARD กฟฟ. 851936', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค อ.นครชัยศรี' },
      { id: 'f-11', docDate: '17.08.2022', docNumber: '2001254206', accountCode: '6001070196 0050', amount: 3471.21, description: 'FLEET CARD กฟฟ. 851836', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค อ.นครชัยศรี' },
      { id: 'f-12', docDate: '12.11.2025', docNumber: '2000196154', accountCode: '6001070196 0050', amount: 4184.30, description: 'ค่าเบี้ยเลี้ยงพนักงาน 1-30 พ.ย. 2568 (Fleet Card)', payeeOrRef: 'บมจ. ปตท.น้ำมันและการค้าปลีก' },
      { id: 'f-13', docDate: '18.02.2026', docNumber: '2000319108', accountCode: '6001070196 0050', amount: 7989.05, description: 'MBS Fleet Card 82-4558กท.', payeeOrRef: 'บมจ. ปตท.น้ำมันและการค้าปลีก' },
      { id: 'f-14', docDate: '07.04.2026', docNumber: '169948622', accountCode: '6001070196 0050', amount: 4194.30, description: 'MBS P-TD02.3-I-SPINA.0007', payeeOrRef: 'การไฟฟ้าส่วนภูมิภาค' },
    ]
  },
  {
    id: 'labour',
    code: 'LABOUR',
    name: 'ค่าแรง',
    sapAccount: '53010060',
    amount: 665088.57,
    items: [
      { id: 'l-1', docDate: '03.05.2022', docNumber: '2000552388', accountCode: '6001070196 0020', amount: 108477.00, description: 'ค่าจ้างเหมาแรงงาน เดือน มี.ค. 65', payeeOrRef: 'ห้างหุ้นส่วนจำกัด สยามสุนทรเทรดดิ้ง' },
      { id: 'l-2', docDate: '26.05.2022', docNumber: '2000672055', accountCode: '6001070196 0020', amount: 100095.00, description: 'ค่าจ้างเหมาแรงงาน เดือน เม.ย. 65', payeeOrRef: 'ห้างหุ้นส่วนจำกัด สยามสุนทรเทรดดิ้ง' },
      { id: 'l-3', docDate: '18.07.2022', docNumber: '2000941165', accountCode: '6001070196 0020', amount: 14262.00, description: 'ค่าจ้างเหมาแรงงาน (U) เดือน เม.ย. 65 (งวด 2)', payeeOrRef: 'บ.เกรียงศักดิ์ คอนสตรัคชั่น แอนด์ ซัพพลาย' },
      { id: 'l-4', docDate: '18.07.2022', docNumber: '2000959647', accountCode: '6001070196 0020', amount: 14262.00, description: 'ค่าจ้างเหมาแรงงาน (U) เดือน พ.ค. 65 (งวด 2)', payeeOrRef: 'บ.เกรียงศักดิ์ คอนสตรัคชั่น แอนด์ ซัพพลาย' },
      { id: 'l-5', docDate: '21.09.2022', docNumber: '2001358028', accountCode: '6001070196 0020', amount: 80000.00, description: 'ค่าจ้างเหมาแรงงาน เดือน ก.ค. 65', payeeOrRef: 'ห้างหุ้นส่วนจำกัด สยามสุนทรเทรดดิ้ง' },
      { id: 'l-6', docDate: '18.10.2022', docNumber: '2001502476', accountCode: '6001070196 0020', amount: 15416.00, description: 'ค่าจ้างเหมาแรงงาน เดือน ก.ย. 65 (กฟจ.สุพรรณบุรี)', payeeOrRef: 'ห้างหุ้นส่วนจำกัด สยามสุนทรเทรดดิ้ง' },
      { id: 'l-7', docDate: '06.10.2022', docNumber: '2001374906', accountCode: '6001070196 0020', amount: 9902.00, description: 'ค่าจ้างเหมาแรงงาน เดือน ส.ค. 65 (ช่วงสาขา)', payeeOrRef: 'ห้างหุ้นส่วนจำกัด สยามสุนทรเทรดดิ้ง' },
      { id: 'l-8', docDate: '22.01.2026', docNumber: '1200053108', accountCode: '6001070196 0020', amount: 107306.57, description: 'ค่าจ้างผู้ปฏิบัติงาน กฟภ. (U) เดือน ส.ค. 68', payeeOrRef: 'ค่าแรงงานผู้ปฏิบัติงานประจำไซต์งาน' },
      { id: 'l-9', docDate: '22.01.2026', docNumber: '1200053126', accountCode: '6001070196 0020', amount: 74693.00, description: 'ผู้ปฏิบัติงานระบบจำหน่ายไฟฟ้า เดือน ก.ย. 68', payeeOrRef: 'ค่าแรงงานผู้ปฏิบัติงานประจำไซต์งาน' },
      { id: 'l-10', docDate: '20.05.2026', docNumber: '2000586944', accountCode: '6001410999 0020', amount: 48580.00, description: '2 ค่าแรง WBS (U) เดือน มี.ค. 69', payeeOrRef: 'บ. เอ็กเซลเลนท์ คอนสตรัคชั่น' },
      { id: 'l-11', docDate: '07.06.2022', docNumber: '118739517', accountCode: '6001070196 0020', amount: 28524.00, description: 'ค่าแรงงาน WBS: P-TD02.3-I-SPINA.0007', payeeOrRef: 'กองก่อสร้างระบบไฟฟ้า กรย.(ก3)' },
      { id: 'l-12', docDate: '08.11.2022', docNumber: '124685298', accountCode: '6001070196 0020', amount: 89902.00, description: 'WBS P-TD02.3-I-SPINA.0007', payeeOrRef: 'กองก่อสร้างระบบไฟฟ้า กรย.(ก3)' },
    ]
  },
  {
    id: 'per_diem',
    code: 'PER_DIEM',
    name: 'ค่าเบี้ยเลี้ยงพนักงาน',
    sapAccount: '52022020',
    amount: 23835.00,
    items: [
      { id: 'p-1', docDate: '16.04.2026', docNumber: '2000432669', accountCode: '6001410999 0030', amount: 1020.00, description: 'ค่าเบี้ยเลี้ยงพนักงาน กฟ. (31 มี.ค. - 4 เม.ย.)', payeeOrRef: 'นายสมชาย ศรีจันทร์' },
      { id: 'p-2', docDate: '01.09.2022', docNumber: '2001164253', accountCode: '6001070196 0030', amount: 7905.00, description: 'เบี้ยเลี้ยงพนักงาน เดือน ส.ค. 65', payeeOrRef: 'นายเกียรติศักดิ์ สุภาผลผา' },
      { id: 'p-3', docDate: '11.05.2026', docNumber: '2000547348', accountCode: '6001070196 0030', amount: 6375.00, description: 'เบี้ยเลี้ยงพนักงาน กฟภ. (U) เดือน เม.ย. 69', payeeOrRef: 'นายศราวุฒิ เกิดสีเล็ก' },
      { id: 'p-4', docDate: '07.10.2022', docNumber: '123476782', accountCode: '6001070196 0030', amount: 15810.00, description: 'WBS P-TD02.3-I-SPINA.0007 ค่าเบี้ยเลี้ยง', payeeOrRef: 'พนักงานชุดปฏิบัติงาน กรย.(ก3)' },
      { id: 'p-5', docDate: '07.05.2026', docNumber: '170654109', accountCode: '6001070196 0030', amount: 315.00, description: 'ค่าเบี้ยเลี้ยงพนักงาน กฟภ.', payeeOrRef: 'นายศราวุฒิ เกิดสีเล็ก' },
    ]
  },
  {
    id: 'accommodation',
    code: 'ACCOMMODATION',
    name: 'ค่าที่พักพนักงาน',
    sapAccount: '52022030',
    amount: 48250.00,
    items: [
      { id: 'a-1', docDate: '16.04.2026', docNumber: '2000432669', accountCode: '6001410999 0030', amount: 2000.00, description: 'ค่าที่พักพนักงาน กฟ. (31 มี.ค. - 4 เม.ย.)', payeeOrRef: 'นายสมชาย ศรีจันทร์' },
      { id: 'a-2', docDate: '01.09.2022', docNumber: '2001164253', accountCode: '6001070196 0030', amount: 15500.00, description: 'ค่าที่พักพนักงาน เดือน ส.ค. 65', payeeOrRef: 'นายเกียรติศักดิ์ สุภาผลผา' },
      { id: 'a-3', docDate: '11.05.2026', docNumber: '2000547348', accountCode: '6001070196 0030', amount: 14500.00, description: 'ค่าที่พักพนักงาน กฟภ. (U) เดือน เม.ย. 69', payeeOrRef: 'นายศราวุฒิ เกิดสีเล็ก' },
      { id: 'a-4', docDate: '07.10.2022', docNumber: '123476782', accountCode: '6001070196 0030', amount: 31000.00, description: 'ค่าที่พักหน้างาน WBS P-TD02.3-I-SPINA.0007', payeeOrRef: 'พนักงานชุดปฏิบัติงาน กรย.(ก3)' },
      { id: 'a-5', docDate: '07.05.2026', docNumber: '170654109', accountCode: '6001070196 0030', amount: 750.00, description: 'ค่าที่พัก (750*1)', payeeOrRef: 'นายสมพร เกตุวิทย์' },
      { id: 'a-6', docDate: '08.06.2026', docNumber: '171357784', accountCode: '6001070196 0030', amount: 14500.00, description: 'WBS P-TD02.3-I-SPINA.0007', payeeOrRef: 'นายศราวุฒิ เกิดสีเล็ก' },
    ]
  },
  {
    id: 'vehicle_repair',
    code: 'VEHICLE_REPAIR',
    name: 'ค่าซ่อมบำรุงรักษายานพาหนะ',
    sapAccount: '53051050',
    amount: 38302.00,
    items: [
      { id: 'r-1', docDate: '17.10.2022', docNumber: '5003647480', accountCode: '6001070196 0050', amount: 8995.00, description: 'ค่าเปลี่ยนยางรถยนต์ ทะเบียน 90-2962 นฐ', payeeOrRef: 'อู่ช่างเล็ก ยานยนต์' },
      { id: 'r-2', docDate: '17.10.2022', docNumber: '5003647522', accountCode: '6001070196 0050', amount: 5890.00, description: 'ค่าซ่อมช่วงล่าง ทะเบียน 90-1844 นฐ', payeeOrRef: 'อู่ทรัพย์อนันต์การช่าง' },
      { id: 'r-3', docDate: '19.10.2022', docNumber: '5003650381', accountCode: '6001070196 0050', amount: 17120.00, description: 'ค่าซ่อมระบบเกียร์รถยนต์ ทะเบียน 82-8461 นฐ', payeeOrRef: 'อู่สุนทรการช่าง นครปฐม' },
      { id: 'r-4', docDate: '19.10.2022', docNumber: '5003650382', accountCode: '6001070196 0050', amount: 6314.00, description: 'ซ่อมระบบเบรกรถยนต์ ทะเบียน 90-2962 นฐ', payeeOrRef: 'อู่ทรัพย์อนันต์การช่าง' },
    ]
  }
];

/**
 * แม่แบบข้อมูลเริ่มต้นจำลองตามเอกสารตัวอย่างจริงหน้า 1-6
 */
export const SAMPLE_PRESET_SUPHAN: VoucherCertifyFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กบฟ.(ก3)',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขอรับรองสำเนาเอกสารใบสำคัญจ่าย',
  salutation: 'อก.บฟ.(ก3)',

  supervisorName: 'นายศราวุฒิ เกิดสีเล็ก',
  supervisorPosition: 'ผพง.6 ผกร.กรย.(ก3)',
  projectName: 'งานปรับปรุงระบบจำหน่าย 22 เควี บริเวณตามแนวทางหลวงหมายเลข 357 แยกทางหลวงหมายเลข 3318 ถึง สถานีไฟฟ้าสุพรรณบุรี 2 ต.รั้วใหญ่ อ.เมือง จ.สุพรรณบุรี',
  shortProjectName: 'ปป. แยกทางหลวงหมายเลข 3318 - สฟ.สุพรรณบุรี 2',
  wbsNumber: 'P-TD02.3-I-SPINA.0007',
  statusExplanation: 'ซึ่งปัจจุบันได้ดำเนินการก่อสร้างแล้วเสร็จ และเพื่อจัดส่งเอกสารปิดงานก่อสร้าง ซึ่งเอกสารใบสำคัญจ่ายบางรายการไม่ครบถ้วน',
  purposeText: 'เพื่อให้การปิด กส. เป็นไปด้วยความเรียบร้อยทั้งนี้ กรย.(ก3) ได้ลงนามรับรองการเบิกค่าใช้จ่ายงานดังกล่าวแล้วตามเอกสารแนบ จึงขอให้ กบฟ.(ก3) ดำเนินการปิด กส. ให้ต่อไป โดยมีรายละเอียดดังนี้',

  categories: JSON.parse(JSON.stringify(DEFAULT_EXPENSE_CATEGORIES)),

  signerName: 'นายศราวุฒิ เกิดสีเล็ก',
  signerPosition: 'ผพง.6 ผกร.กรย.(ก3)',
  signerDate: '',

  hasRoutingStamps: true,
  stampHpKrDate: '',
  stampCpKrDate: '',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3',
  contactPhone: '10171',

  isThaiNumerals: false,
};

/**
 * แม่แบบตัวอย่างที่ 2: งานก่อสร้าง สฟ.กาญจนบุรี (ค่าน้ำมัน + ค่าแรง + เบี้ยเลี้ยง)
 */
export const SAMPLE_PRESET_KAN: VoucherCertifyFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กบฟ.(ก3)',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขอรับรองสำเนาเอกสารใบสำคัญจ่าย',
  salutation: 'อก.บฟ.(ก3)',

  supervisorName: 'นายชานินทร์ ศรีสวัสดิ์',
  supervisorPosition: 'ชผ.กร.กรย.(ก3)',
  projectName: 'งานก่อสร้างระบบสายส่งรองรับการจ่ายไฟให้สถานีไฟฟ้ากาญจนบุรี 5 (ชั่วคราว) อ.เมือง จ.กาญจนบุรี',
  shortProjectName: 'ก่อสร้างระบบสายส่ง สฟ.กาญจนบุรี 5 (ชั่วคราว)',
  wbsNumber: 'I-69-I-KCI02.19.3907',
  statusExplanation: 'ซึ่งปัจจุบันได้ดำเนินการก่อสร้างแล้วเสร็จ และเพื่อจัดส่งเอกสารปิดงานก่อสร้าง (TECO) แต่เนื่องจากเอกสารใบสำคัญจ่ายบางรายการสูญหายหรือไม่ครบถ้วน',
  purposeText: 'เพื่อให้การปิด กส. เป็นไปด้วยความเรียบร้อย กรย.(ก3) จึงได้ตรวจสอบและลงนามรับรองการเบิกจ่ายตามรายงานต้นทุนงานก่อสร้างจากระบบ SAP แนบท้ายนี้',

  categories: [
    {
      id: 'fuel',
      code: 'FUEL',
      name: 'ค่าเชื้อเพลิงยานพาหนะ',
      sapAccount: '53039010',
      amount: 45200.00,
      items: [
        { id: 'kf-1', docDate: '10.05.2023', docNumber: '2001458901', accountCode: '6001070196 0050', amount: 15200.00, description: 'FLEET CARD รถปฏิบัติงานสายส่ง กจ.', payeeOrRef: 'บมจ. ปตท.' },
        { id: 'kf-2', docDate: '12.06.2023', docNumber: '2001490212', accountCode: '6001070196 0050', amount: 30000.00, description: 'ค่าน้ำมันดีเซลรถเครนยกเสา 22 ม.', payeeOrRef: 'ปตท. ท่าม่วง' }
      ]
    },
    {
      id: 'labour',
      code: 'LABOUR',
      name: 'ค่าแรง',
      sapAccount: '53010060',
      amount: 420000.00,
      items: [
        { id: 'kl-1', docDate: '20.06.2023', docNumber: '2001552300', accountCode: '6001070196 0020', amount: 420000.00, description: 'ค่าจ้างเหมาปักเสาและพาดสาย 115 kV', payeeOrRef: 'บจก. กาญจน์พาวเวอร์ คอนสตรัคชั่น' }
      ]
    },
    {
      id: 'per_diem',
      code: 'PER_DIEM',
      name: 'ค่าเบี้ยเลี้ยงพนักงาน',
      sapAccount: '52022020',
      amount: 18500.00,
      items: [
        { id: 'kp-1', docDate: '15.06.2023', docNumber: '2001511200', accountCode: '6001070196 0030', amount: 18500.00, description: 'เบี้ยเลี้ยงทีมก่อสร้างระบบสายส่ง', payeeOrRef: 'ทีมงานก่อสร้าง กรย.(ก3)' }
      ]
    }
  ],

  signerName: 'นายชานินทร์ ศรีสวัสดิ์',
  signerPosition: 'ชผ.กร.กรย.(ก3)',
  signerDate: '',

  hasRoutingStamps: true,
  stampHpKrDate: '',
  stampCpKrDate: '',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3',
  contactPhone: '099-1326977',

  isThaiNumerals: false,
};

/**
 * แม่แบบตัวอย่างที่ 3: งานย้ายแนว คลองท่าแร้ง สมุทรสาคร (ค่าแรง + ค่าที่พัก + ซ่อมรถ)
 */
export const SAMPLE_PRESET_SAMUT: VoucherCertifyFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กบฟ.(ก3)',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขอรับรองสำเนาเอกสารใบสำคัญจ่าย',
  salutation: 'อก.บฟ.(ก3)',

  supervisorName: 'นายสมพร เกตุวิทย์',
  supervisorPosition: 'ผพง.6 ผกร.กรย.(ก3)',
  projectName: 'งานก่อสร้างย้ายแนวระบบสายส่ง 115 เควี บริเวณ คลองท่าแร้ง ฝั่งขาออก กทม. จ.สมุทรสาคร',
  shortProjectName: 'ย้ายแนว 115 kV คลองท่าแร้ง สมุทรสาคร',
  wbsNumber: 'I-69-I-SM269.M4.1105',
  statusExplanation: 'ซึ่งปัจจุบันได้ดำเนินการก่อสร้างแล้วเสร็จ และเพื่อจัดส่งเอกสารปิดงานก่อสร้าง ซึ่งเอกสารใบสำคัญจ่ายบางรายการไม่ครบถ้วน',
  purposeText: 'เพื่อให้การปิด กส. เป็นไปด้วยความเรียบร้อยทั้งนี้ กรย.(ก3) ได้ลงนามรับรองการเบิกค่าใช้จ่ายงานดังกล่าวแล้วตามเอกสารแนบ จึงขอให้ กบฟ.(ก3) ดำเนินการปิด กส. ให้ต่อไป โดยมีรายละเอียดดังนี้',

  categories: [
    {
      id: 'fuel',
      code: 'FUEL',
      name: 'ค่าเชื้อเพลิงยานพาหนะ',
      sapAccount: '53039010',
      amount: 32450.00,
      items: [
        { id: 'sf-1', docDate: '05.09.2023', docNumber: '2001602311', accountCode: '6001070196 0050', amount: 32450.00, description: 'FLEET CARD รถตรวจการและรถบรรทุก 6 ล้อ', payeeOrRef: 'ปตท. สมุทรสาคร' }
      ]
    },
    {
      id: 'labour',
      code: 'LABOUR',
      name: 'ค่าแรง',
      sapAccount: '53010060',
      amount: 512000.00,
      items: [
        { id: 'sl-1', docDate: '25.09.2023', docNumber: '2001684320', accountCode: '6001070196 0020', amount: 512000.00, description: 'ค่าจ้างเหมาหล่อตอม่อและปักเสา 22 ม.', payeeOrRef: 'บจก. มหาชัยวิศวกรรม' }
      ]
    },
    {
      id: 'accommodation',
      code: 'ACCOMMODATION',
      name: 'ค่าที่พักพนักงาน',
      sapAccount: '52022030',
      amount: 36000.00,
      items: [
        { id: 'sa-1', docDate: '30.09.2023', docNumber: '2001710922', accountCode: '6001070196 0030', amount: 36000.00, description: 'ค่าที่พักพนักงานควบคุมงานก่อสร้างสมุทรสาคร', payeeOrRef: 'โรงแรมมหาชัย แกรนด์' }
      ]
    },
    {
      id: 'vehicle_repair',
      code: 'VEHICLE_REPAIR',
      name: 'ค่าซ่อมบำรุงรักษายานพาหนะ',
      sapAccount: '53051050',
      amount: 19800.00,
      items: [
        { id: 'sr-1', docDate: '12.09.2023', docNumber: '5003789123', accountCode: '6001070196 0050', amount: 19800.00, description: 'เปลี่ยนยางรถบรรทุกเครน ทะเบียน 82-4558', payeeOrRef: 'ร้านยางมหาชัยการยาง' }
      ]
    }
  ],

  signerName: 'นายสมพร เกตุวิทย์',
  signerPosition: 'ผพง.6 ผกร.กรย.(ก3)',
  signerDate: '',

  hasRoutingStamps: true,
  stampHpKrDate: '',
  stampCpKrDate: '',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3',
  contactPhone: '10171',

  isThaiNumerals: false,
};

/**
 * แยกข้อมูลที่ Paste มาจาก Excel หรือ SAP
 * รูปแบบทั่วไป: Date \t DocNo \t G/L \t Amount \t Text
 */
export function parsePastedSapTable(rawText: string): VoucherLineItem[] {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const items: VoucherLineItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // แยกตาม tab ก่อน ถ้าไม่มีลอง multiple spaces
    let tokens = line.split('\t');
    if (tokens.length <= 1) {
      tokens = line.split(/\s{2,}/);
    }
    if (tokens.length >= 2) {
      let amount = 0;
      let docDate = '';
      let docNumber = '';
      let accountCode = '';
      let description = '';
      let payeeOrRef = '';

      for (let j = 0; j < tokens.length; j++) {
        const t = tokens[j].trim();
        // เช็คว่าเป็นตัวเลขการเงินหรือไม่ เช่น 2,236.45 หรือ 2236.45
        if (/^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(t) || /^-?\d+(\.\d+)?$/.test(t)) {
          const val = parseFloat(t.replace(/,/g, ''));
          if (!isNaN(val) && val > 0 && amount === 0) {
            amount = val;
            continue;
          }
        }
        // เช็คว่าเป็นวันที่ เช่น 03.08.2022 หรือ 2022-08-03 หรือ 03/08/2022
        if (/^\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{2,4}$/.test(t) && !docDate) {
          docDate = t;
          continue;
        }
        // เช็คว่าเป็นเลขเอกสาร 8-12 หลัก เช่น 2001273190
        if (/^\d{8,12}$/.test(t) && !docNumber) {
          docNumber = t;
          continue;
        }
        // เช็คว่าเป็นรหัสบัญชี เช่น 6001070196 หรือ 53039010
        if (/^\d{8,10}(\s+\d+)?$/.test(t) && !accountCode) {
          accountCode = t;
          continue;
        }

        // ข้อความรายละเอียด
        if (!description) {
          description = t;
        } else if (!payeeOrRef) {
          payeeOrRef = t;
        } else {
          description += ' ' + t;
        }
      }

      if (amount > 0 || description || docNumber) {
        items.push({
          id: `item-${Date.now()}-${i}`,
          docDate: docDate || getTodayThaiDate(),
          docNumber: docNumber || '-',
          accountCode: accountCode || '-',
          amount: amount,
          description: description || 'ค่าใช้จ่ายตามใบสำคัญจ่าย',
          payeeOrRef: payeeOrRef || '-'
        });
      }
    }
  }

  return items;
}

/**
 * สร้าง HTML สำหรับเปิดใน Microsoft Word (.doc) หรือ Copy Clipboard
 */
export function generateWordHtml(data: VoucherCertifyFormData): string {
  const isThai = data.isThaiNumerals;
  const tn = (val: string | number | undefined | null) => isThai ? toThaiNumerals(val) : (val?.toString() || '');
  const fmt = (num: number) => isThai ? toThaiNumerals(formatCurrency(num)) : formatCurrency(num);
  const grandTotal = calculateGrandTotal(data.categories);
  const totalText = thaiBahtText(grandTotal);
  const summarySentence = generateExpenseSummarySentence(data.categories, isThai);

  const activeCats = data.categories.filter(c => Number(c.amount) > 0);

  const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>บันทึกข้อความขอรับรองสำเนาเอกสารใบสำคัญจ่าย</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 20mm 20mm 25mm;
    }
    body {
      font-family: 'TH Sarabun PSK', 'TH Sarabun New', 'Angsana New', sans-serif;
      font-size: 16pt;
      line-height: 1.25;
      color: #000;
      background: #fff;
    }
    p { margin: 0 0 6pt 0; text-align: justify; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
    .header-table td { font-size: 16pt; padding: 2pt 4pt; vertical-align: top; }
    .title { font-size: 29pt; font-weight: bold; text-align: center; margin: 4pt 0 14pt 0; }
    .bold { font-weight: bold; }
    .indent { text-indent: 2.5cm; }
    .memo-table { width: 100%; border-collapse: collapse; margin: 10pt 0 12pt 0; }
    .memo-table th, .memo-table td {
      border: 1pt solid #000;
      padding: 6pt 8pt;
      font-size: 15pt;
      vertical-align: middle;
    }
    .memo-table th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <!-- หน้า 1: บันทึกข้อความ -->
  <div style="text-align: center; margin-bottom: 4pt;">
    <div style="font-size: 20pt; font-weight: bold;">บันทึกข้อความ</div>
  </div>

  <table class="header-table">
    <tr>
      <td style="width: 50%;"><span class="bold">ส่วนราชการ</span> ${data.docFrom}</td>
      <td style="width: 50%;"><span class="bold">ถึง</span> ${data.docTo}</td>
    </tr>
    <tr>
      <td><span class="bold">ที่</span> ${tn(data.docNo)}</td>
      <td><span class="bold">วันที่</span> ${tn(data.docDate)}</td>
    </tr>
    <tr>
      <td colspan="2"><span class="bold">เรื่อง</span> ${data.subject}</td>
    </tr>
  </table>

  <p><span class="bold">เรียน</span> ${data.salutation}</p>

  <p class="indent">
    ตามที่ ${data.supervisorName} ตำแหน่ง ${data.supervisorPosition} ได้ดำเนินการก่อสร้าง${data.projectName} ${data.statusExplanation}
  </p>

  <p class="indent">
    ${data.purposeText}
  </p>

  <!-- ตารางสรุปโครงการ -->
  <table class="memo-table">
    <thead>
      <tr>
        <th style="width: 12%;">ที่</th>
        <th style="width: 58%;">ชื่องาน</th>
        <th style="width: 30%;">หมายเลขงาน (WBS)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">${tn(1)}</td>
        <td>${data.shortProjectName || data.projectName}</td>
        <td class="text-center bold">${tn(data.wbsNumber)}</td>
      </tr>
    </tbody>
  </table>

  <p class="indent">
    ${summarySentence} รวมเป็นเงินทั้งสิ้น ${fmt(grandTotal)} บาท (${totalText})
  </p>

  <p class="indent">
    จึงเรียนมาเพื่อโปรดทราบและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
  </p>

  <!-- ผู้ลงนาม -->
  <table style="width: 100%; margin-top: 30pt;">
    <tr>
      <td style="width: 50%;"></td>
      <td style="width: 50%; text-align: center;">
        <br><br>
        (${data.signerName})<br>
        ${data.signerPosition}<br>
        ${tn(data.signerDate)}
      </td>
    </tr>
  </table>

  <!-- ตารางเกษียนเดินเรื่อง -->
  ${data.hasRoutingStamps ? `
  <table style="width: 100%; margin-top: 35pt;">
    <tr>
      <td style="width: 50%; font-size: 13pt; vertical-align: bottom;">
        ${data.contactDepartment}<br>
        โทร. ${tn(data.contactPhone)}
      </td>
      <td style="width: 50%;">
        <table style="border: 1pt solid #000; border-collapse: collapse; width: 100%; font-size: 13pt;">
          <tr>
            <td style="border: 1pt solid #000; padding: 4pt 6pt; width: 40%;">หผ.กร.(ก3)</td>
            <td style="border: 1pt solid #000; padding: 4pt 6pt;">ลงชื่อ ............................... วันที่ ${tn(data.stampHpKrDate)}</td>
          </tr>
          <tr>
            <td style="border: 1pt solid #000; padding: 4pt 6pt;">ชผ.กร.(ก3)</td>
            <td style="border: 1pt solid #000; padding: 4pt 6pt;">ลงชื่อ ............................... วันที่ ${tn(data.stampCpKrDate)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  ` : ''}
</body>
</html>
  `;
  return html.trim();
}

/**
 * ดาวน์โหลดเอกสารเป็นไฟล์ Word (.doc)
 */
export function downloadWordDocument(data: VoucherCertifyFormData): void {
  const htmlContent = generateWordHtml(data);
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `บันทึกรับรองใบสำคัญจ่าย_${data.wbsNumber || 'โครงการ'}_${Date.now()}.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * คัดลอกตารางและข้อความแบบ Rich HTML เพื่อนำไปวางลงใน Microsoft Word โดยตรง
 */
export async function copyFormattedWordTable(data: VoucherCertifyFormData): Promise<boolean> {
  const htmlContent = generateWordHtml(data);
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
      const textBlob = new Blob([generatePlainTextSummary(data)], { type: 'text/plain' });
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob,
        })
      ]);
      return true;
    } else {
      await navigator.clipboard.writeText(generatePlainTextSummary(data));
      return true;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    try {
      await navigator.clipboard.writeText(generatePlainTextSummary(data));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * สร้าง Plain Text สำหรับแชร์ใน LINE หรืออีเมล
 */
export function generatePlainTextSummary(data: VoucherCertifyFormData): string {
  const grandTotal = calculateGrandTotal(data.categories);
  const totalText = thaiBahtText(grandTotal);
  const activeCats = data.categories.filter(c => Number(c.amount) > 0);

  let text = `📋 บันทึกข้อความ: ขอรับรองสำเนาเอกสารใบสำคัญจ่าย\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `ที่: ${data.docNo}    วันที่: ${data.docDate}\n`;
  text += `จาก: ${data.docFrom}    ถึง: ${data.docTo} (${data.salutation})\n`;
  text += `เรื่อง: ${data.subject}\n`;
  text += `ผู้ควบคุมงาน: ${data.supervisorName} (${data.supervisorPosition})\n`;
  text += `ชื่องาน: ${data.shortProjectName || data.projectName}\n`;
  text += `หมายเลข WBS: ${data.wbsNumber}\n\n`;

  text += `💰 สรุปรายการค่าใช้จ่ายที่ขอรับรอง:\n`;
  activeCats.forEach((cat, idx) => {
    text += `  ${idx + 1}. ${cat.name} (SAP: ${cat.sapAccount}): ${formatCurrency(cat.amount)} บาท (${cat.items.length} รายการ)\n`;
  });
  text += `──────────────────────────────────\n`;
  text += `💵 ยอดรวมทั้งสิ้น: ${formatCurrency(grandTotal)} บาท (${totalText})\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `ผู้ลงนาม: ${data.signerName} (${data.signerPosition})\n`;
  text += `${data.contactDepartment} โทร. ${data.contactPhone}`;

  return text;
}
