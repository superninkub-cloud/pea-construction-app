// app/shortage-budget/shortageBudgetUtils.ts
/**
 * Utility functions, types, sample presets, and document generators
 * for Shortage Material Budget Request Program (โปรแกรมของบซื้อพัสดุขาดแคลน)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export interface ShortageMaterialItem {
  id: string;
  wbsNo: string;            // เช่น P-TDD02.3-I-BLNIA.0026
  networkNo: string;        // เช่น 6001397496
  materialCode: string;     // เช่น 1020050004
  materialName: string;     // เช่น เคเบิลอากาศ อลูมิเนียม 22 เควี 1x185 ต.มม.
  quantity: number;         // เช่น 1300
  unit: string;             // เช่น เมตร, ชุด, ต้น, ตัว
  unitPrice: number;        // เช่น 252.00
  lineTotal: number;        // quantity * unitPrice
}

export interface ShortageBudgetFormData {
  // ส่วนหัวหนังสือ (บันทึกข้อความ)
  docFrom: string;              // จาก เช่น ผกร.กรย.(ก3)
  docTo: string;                // ถึง เช่น กรย.(ก3)
  docNo: string;                // เลขที่หนังสือ เช่น ก.3 กรย.(กร) 2337/2569
  docDate: string;              // วันที่
  subject: string;              // เรื่อง เช่น ขออนุมัติจัดสรรงบประมาณจัดซื้อพัสดุขาดแคลนสำหรับงานก่อสร้าง ตามแผนงาน คพจ.2.3
  salutation: string;           // เรียน เช่น อก.รย.(ก3)
  planName: string;             // ชื่อแผนงาน เช่น คพจ.2.3

  // ข้อมูลโครงการและพัสดุที่ต้องการ (วรรคที่ 1)
  projectDescription: string;   // เช่น ก่อสร้างปรับปรุงระบบจำหน่าย 22 เควี บริเวณสถานีไฟฟ้าบางเลน 3 ถึง ศาลาหมอฉ่ำ อ.บางเลน จ.นครปฐม
  peaArea: string;              // เช่น กฟส.บางเลน
  materialCategory: string;     // เช่น สายไฟแรงสูง
  demandQuantity: string;       // เช่น 1,313
  demandUnit: string;           // เช่น เมตร
  wbsNo: string;                // เช่น P-TDD02.3-I-BLNIA.0026
  supervisorName: string;       // เช่น นายศราวุฒิ เกิดสีเล็ก
  supervisorPosition: string;   // เช่น พชง.6
  supervisorDept: string;       // เช่น ผกร.กรย.(ก3)

  // ข้อมูลการจัดสรรงบประมาณ (วรรคที่ 2)
  requestQuantity: string;      // เช่น 1,300
  requestUnit: string;          // เช่น เมตร
  targetDept: string;           // เช่น ผจร.กรย.(ก3)
  purchasingDept: string;       // เช่น กบพ.(ก3)

  // รายการพัสดุขาดแคลนในตารางแนบท้าย
  items: ShortageMaterialItem[];

  // ผู้ลงนามเสนอ (ขวากลาง)
  proposerName: string;         // นายพิสันต์ จิตต์ปลื้ม
  proposerPosition: string;     // หผ.กร.กรย.(ก3)
  proposerDate: string;         // 8 ต.ค. 69

  // ส่วนแทงเรื่องสั่งการ (ท้ายบันทึก - อก.รย.)
  hasCommanderOrder: boolean;   // true
  orderTo: string;              // ผจร.กรย.(ก3)
  orderText: string;            // แจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
  commanderName: string;        // นายอนันต์ กาญจนอุปถัมภ์
  commanderPosition: string;    // รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
  commanderDate: string;        // 9 ต.ค. 69

  // วันที่เกษียนหนังสือ (มุมขวาล่าง)
  hasRoutingStamps?: boolean;
  stampCpKrDate: string;        // ชผ.กร.(ก3)
  stampPcKrDate: string;        // พชง.กร.(ก3) เช่น 8/10/69
  stampHpKrDate?: string;       // หผ.กร.(ก3)
  contactDepartment?: string;
  contactPhone?: string;
  isThaiNumerals?: boolean;
}

/**
 * แปลงจำนวนเงินเป็นตัวอักษรภาษาไทย (บาทถ้วน)
 */
export function numberToThaiBahtText(num: number): string {
  if (isNaN(num) || num === 0) return 'ศูนย์บาทถ้วน';

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  function convertGroup(nStr: string): string {
    let result = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(nStr[i], 10);
      const pos = len - i - 1;
      if (digit !== 0) {
        if (pos === 1 && digit === 1) {
          result += 'สิบ';
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่สิบ';
        } else if (pos === 0 && digit === 1 && len > 1 && parseInt(nStr[len - 2], 10) !== 0) {
          result += 'เอ็ด';
        } else {
          result += numbers[digit] + units[pos];
        }
      }
    }
    return result;
  }

  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let result = '';
  if (integerPart.length > 6) {
    const millionPart = integerPart.slice(0, integerPart.length - 6);
    const restPart = integerPart.slice(integerPart.length - 6);
    result += convertGroup(millionPart) + 'ล้าน' + convertGroup(restPart) + 'บาท';
  } else {
    result += convertGroup(integerPart) + 'บาท';
  }

  if (decimalPart === '00' || !decimalPart) {
    result += 'ถ้วน';
  } else {
    result += convertGroup(decimalPart) + 'สตางค์';
  }

  return result;
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
 * รายการพัสดุยอดนิยมที่มีภาวะขาดแคลนในระบบ กฟภ.
 */
export const POPULAR_SHORTAGE_MATERIALS = [
  {
    code: '1020050004',
    name: 'เคเบิลอากาศ อลูมิเนียม 22 เควี 1x185 ต.มม.',
    unit: 'เมตร',
    price: 252.00,
    category: 'สายไฟแรงสูง'
  },
  {
    code: '1020050001',
    name: 'เคเบิลอากาศ อลูมิเนียม 22 เควี 1x50 ต.มม.',
    unit: 'เมตร',
    price: 115.00,
    category: 'สายไฟแรงสูง'
  },
  {
    code: '1020050002',
    name: 'เคเบิลอากาศ อลูมิเนียม 22 เควี 1x95 ต.มม.',
    unit: 'เมตร',
    price: 168.00,
    category: 'สายไฟแรงสูง'
  },
  {
    code: '1020050003',
    name: 'เคเบิลอากาศ อลูมิเนียม 22 เควี 1x120 ต.มม.',
    unit: 'เมตร',
    price: 195.00,
    category: 'สายไฟแรงสูง'
  },
  {
    code: '1020060005',
    name: 'สายเคเบิลใต้ดิน XLPE 22 เควี 1x240 ต.มม.',
    unit: 'เมตร',
    price: 580.00,
    category: 'สายเคเบิลใต้ดิน'
  },
  {
    code: '1020060008',
    name: 'สายเคเบิลใต้ดิน XLPE 22 เควี 1x400 ต.มม.',
    unit: 'เมตร',
    price: 890.00,
    category: 'สายเคเบิลใต้ดิน'
  },
  {
    code: '1030010001',
    name: 'ดรอปเอาท์ฟิวส์คัทเอาท์ 24 เควี',
    unit: 'ชุด',
    price: 2850.00,
    category: 'อุปกรณ์ตัดตอน'
  },
  {
    code: '1030020002',
    name: 'กับดักฟ้าผ่า Lightning Arrester 24 เควี',
    unit: 'ชุด',
    price: 1950.00,
    category: 'อุปกรณ์ป้องกัน'
  },
  {
    code: '1010010012',
    name: 'เสาคอนกรีตอัดแรง คอร. ขนาด 12.00 เมตร',
    unit: 'ต้น',
    price: 3200.00,
    category: 'คอนกรีตและอุปกรณ์'
  },
  {
    code: '1010010014',
    name: 'เสาคอนกรีตอัดแรง คอร. ขนาด 14.00 เมตร',
    unit: 'ต้น',
    price: 4600.00,
    category: 'คอนกรีตและอุปกรณ์'
  }
];

/**
 * แผนงานยอดนิยม
 */
export const POPULAR_PLANS = [
  'คพจ.2.3',
  'คพจ.2.1',
  'คพจ.1',
  'งานปรับปรุงระบบจำหน่าย',
  'งานขยายเขตระบบจำหน่าย',
  'งานย้ายแนวเสา-สายทางหลวง'
];

/**
 * ตัวอย่างข้อมูลเริ่มต้น (ตรงตามเอกสารสแกนหน้า 1 และหน้า 2)
 */
export const SAMPLE_SHORTAGE_BUDGET_DATA: ShortageBudgetFormData = {
  docFrom: 'ผกร.กรย.(ก3)',
  docTo: 'กรย.(ก3)',
  docNo: 'ก.3 กรย.(กร) 2337/2569',
  docDate: '',
  subject: 'ขออนุมัติจัดสรรงบประมาณจัดซื้อพัสดุขาดแคลนสำหรับงานก่อสร้าง ตามแผนงาน คพจ.2.3',
  salutation: 'อก.รย.(ก3)',
  planName: 'คพจ.2.3',

  projectDescription: 'ก่อสร้างปรับปรุงระบบจำหน่าย 22 เควี บริเวณสถานีไฟฟ้าบางเลน 3 ถึง ศาลาหมอฉ่ำ อ.บางเลน จ.นครปฐม',
  peaArea: 'กฟส.บางเลน',
  materialCategory: 'สายไฟแรงสูง',
  demandQuantity: '1,313',
  demandUnit: 'เมตร',
  wbsNo: 'P-TDD02.3-I-BLNIA.0026',
  supervisorName: 'นายศราวุฒิ เกิดสีเล็ก',
  supervisorPosition: 'พชง.6',
  supervisorDept: 'ผกร.กรย.(ก3)',

  requestQuantity: '1,300',
  requestUnit: 'เมตร',
  targetDept: 'ผจร.กรย.(ก3)',
  purchasingDept: 'กบพ.(ก3)',

  items: [
    {
      id: 'item-1',
      wbsNo: 'P-TDD02.3-I-BLNIA.0026',
      networkNo: '6001397496',
      materialCode: '1020050004',
      materialName: 'เคเบิลอากาศ อลูมิเนียม 22 เควี 1x185 ต.มม.',
      quantity: 1300,
      unit: 'เมตร',
      unitPrice: 252.00,
      lineTotal: 327600.00
    }
  ],

  proposerName: 'นายพิสันต์ จิตต์ปลื้ม',
  proposerPosition: 'หผ.กร.กรย.(ก3)',
  proposerDate: '8 ต.ค. 69',

  hasCommanderOrder: true,
  orderTo: 'หผ.จร.กรย.(ก3)',
  orderText: 'แจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',
  commanderName: 'นายอนันต์ กาญจนอุปถัมภ์',
  commanderPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  commanderDate: '9 ต.ค. 69',

  stampCpKrDate: '',
  stampPcKrDate: '8/10/69'
};

/**
 * คำนวณผลรวมเงินงบประมาณ
 */
export function calculateShortageTotal(items: ShortageMaterialItem[]): number {
  return items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
}

/**
 * สร้างข้อความตัวอย่าง Plain Text สำหรับคัดลอกลง LINE หรือแชท
 */
export function generateShortageBudgetMemoPlainText(data: ShortageBudgetFormData): string {
  const totalAmount = calculateShortageTotal(data.items);
  const totalFormatted = totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const thaiText = numberToThaiBahtText(totalAmount);

  let content = `บันทึกข้อความ\n`;
  content += `การไฟฟ้าส่วนภูมิภาค\n\n`;
  content += `จาก: ${data.docFrom}\t\tถึง: ${data.docTo}\n`;
  content += `เลขที่: ${data.docNo || '-'}\t\tวันที่: ${data.docDate || '-'}\n`;
  content += `เรื่อง: ${data.subject}\n`;
  content += `เรียน: ${data.salutation}\n\n`;

  // วรรคที่ 1
  content += `     ด้วย ${data.docFrom} ดำเนินการ${data.projectDescription} ในพื้นที่ ${data.peaArea} โดยปัจจุบันมีความต้องการพัสดุประเภท${data.materialCategory} จำนวน ${data.demandQuantity} ${data.demandUnit} สำหรับก่อสร้าง หมายเลขงาน WBS: ${data.wbsNo} โดย ${data.supervisorName} ${data.supervisorPosition} ${data.supervisorDept} เป็นผู้ควบคุมงานนั้น\n\n`;

  // วรรคที่ 2
  content += `     ${data.docFrom} ได้สรุปรายการข้อมูลพัสดุขาดแคลนประเภท${data.materialCategory} จำนวน ${data.requestQuantity} ${data.requestUnit} สำหรับใช้ในงานก่อสร้าง เรียบร้อยแล้ว จึงขอความอนุเคราะห์ ${data.targetDept} พิจารณาจัดสรรงบประมาณเพื่อจัดซื้อพัสดุขาดแคลน เป็นเงินงบประมาณจำนวน ${totalFormatted}.-บาท (${thaiText}) โดยให้ ${data.purchasingDept} เป็นผู้จัดซื้อต่อไป\n\n`;

  content += `\t\t\t\t\t(${data.proposerName})\n`;
  content += `\t\t\t\t\t${data.proposerPosition}\n`;
  if (data.proposerDate) content += `\t\t\t\t\t${data.proposerDate}\n\n`;

  if (data.hasCommanderOrder) {
    content += `----------------------------------------\n`;
    content += `- ${data.orderTo}\n`;
    content += `  ${data.orderText}\n\n`;
    content += `\t\t\t\t\t(${data.commanderName})\n`;
    content += `\t\t\t\t\t${data.commanderPosition}\n`;
    if (data.commanderDate) content += `\t\t\t\t\t${data.commanderDate}\n`;
  }

  content += `\n========================================\n`;
  content += `ตารางสรุปรายการพัสดุขาดแคลนแนบท้าย\n`;
  content += `========================================\n`;
  data.items.forEach((item, idx) => {
    content += `${idx + 1}. WBS: ${item.wbsNo} | โครงข่าย: ${item.networkNo} | รหัส: ${item.materialCode}\n`;
    content += `   ชื่อ: ${item.materialName}\n`;
    content += `   จำนวน: ${item.quantity.toLocaleString()} ${item.unit} x ${item.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท = ${item.lineTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท\n`;
  });
  content += `รวมเป็นเงินทั้งสิ้น: ${totalFormatted} บาท (${thaiText})\n`;

  return content;
}

/**
 * สร้างเอกสาร Word (.doc) สมบูรณ์แบบ 2 แผ่น (บันทึกข้อความ + ตารางแนบท้าย)
 */
export function generateShortageBudgetWordDocument(data: ShortageBudgetFormData): string {
  const totalAmount = calculateShortageTotal(data.items);
  const totalFormatted = totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const thaiText = numberToThaiBahtText(totalAmount);

  const tableRowsHtml = data.items.map((item, idx) => `
    <tr>
      <td style="text-align: center; border: 1px solid #000; padding: 4pt;">${idx + 1}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4pt;">${item.wbsNo}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4pt;">${item.networkNo}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4pt;">${item.materialCode}</td>
      <td style="text-align: left; border: 1px solid #000; padding: 4pt;">${item.materialName}</td>
      <td style="text-align: right; border: 1px solid #000; padding: 4pt;">${item.quantity.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
      <td style="text-align: right; border: 1px solid #000; padding: 4pt;">${item.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
      <td style="text-align: right; border: 1px solid #000; padding: 4pt;">${item.lineTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
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
          vertical-align: middle;
          font-size: 16pt;
        }
      </style>
    </head>
    <body>
      <!-- PAGE 1: MEMORANDUM -->
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
        ด้วย ${data.docFrom} ดำเนินการ${data.projectDescription} ในพื้นที่ ${data.peaArea} โดยปัจจุบันมีความต้องการพัสดุประเภท${data.materialCategory} จำนวน ${data.demandQuantity} ${data.demandUnit} สำหรับก่อสร้าง หมายเลขงาน WBS: ${data.wbsNo} โดย ${data.supervisorName} ${data.supervisorPosition} ${data.supervisorDept} เป็นผู้ควบคุมงานนั้น
      </p>

      <!-- Paragraph 2 -->
      <p style="text-indent: 2.5cm; margin-bottom: 24pt; text-align: justify; line-height: 1.6;">
        ${data.docFrom} ได้สรุปรายการข้อมูลพัสดุขาดแคลนประเภท${data.materialCategory} จำนวน ${data.requestQuantity} ${data.requestUnit} สำหรับใช้ในงานก่อสร้าง เรียบร้อยแล้ว จึงขอความอนุเคราะห์ ${data.targetDept} พิจารณาจัดสรรงบประมาณเพื่อจัดซื้อพัสดุขาดแคลน เป็นเงินงบประมาณจำนวน ${totalFormatted}.-บาท (${thaiText}) โดยให้ ${data.purchasingDept} เป็นผู้จัดซื้อต่อไป
      </p>

      <!-- Proposer Signer (Right) -->
      <div style="margin-left: 55%; text-align: center; margin-bottom: 24pt; line-height: 1.4;">
        <br/><br/>
        <div>(${data.proposerName})</div>
        <div>${data.proposerPosition}</div>
        ${data.proposerDate ? `<div style="margin-top: 4pt;">${data.proposerDate}</div>` : ''}
      </div>

      <!-- Commander Order Box (Bottom Left) -->
      ${data.hasCommanderOrder ? `
        <div style="margin-top: 20pt; padding-top: 10pt; width: 60%; line-height: 1.4;">
          <div style="font-weight: bold;">- ${data.orderTo}</div>
          <div style="text-indent: 1cm; margin-bottom: 14pt;">${data.orderText}</div>
          <div style="text-align: center; margin-left: 15%;">
            <br/>
            <div>(${data.commanderName})</div>
            <div>${data.commanderPosition}</div>
            ${data.commanderDate ? `<div>${data.commanderDate}</div>` : ''}
          </div>
        </div>
      ` : ''}

      <!-- PAGE BREAK FOR ATTACHMENT TABLE -->
      <br clear="all" style="page-break-before:always;" />

      <!-- PAGE 2: ATTACHMENT TABLE -->
      <div style="text-align: center; font-weight: bold; font-size: 18pt; margin-bottom: 14pt;">
        ตารางสรุปรายการพัสดุขาดแคลนสำหรับงานก่อสร้าง
      </div>

      <table style="width: 100%; border: 1px solid #000; font-size: 14pt;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #000; padding: 6pt; width: 5%;">ลำดับ</th>
            <th style="border: 1px solid #000; padding: 6pt; width: 22%;">หมายเลขงาน</th>
            <th style="border: 1px solid #000; padding: 6pt; width: 14%;">โครงข่าย</th>
            <th style="border: 1px solid #000; padding: 6pt; width: 14%;">รหัสพัสดุ</th>
            <th style="border: 1px solid #000; padding: 6pt; width: 25%;">ชื่อพัสดุ</th>
            <th style="border: 1px solid #000; padding: 6pt; width: 10%;">จำนวน (${data.items[0]?.unit || 'เมตร'})</th>
            <th style="border: 1px solid #000; padding: 6pt; width: 10%;">ราคากลาง</th>
            <th style="border: 1px solid #000; padding: 6pt; width: 12%;">รวมเป็นเงิน</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
          <tr style="font-weight: bold; background-color: #fafafa;">
            <td colspan="7" style="text-align: center; border: 1px solid #000; padding: 6pt;">รวมเป็นจำนวนเงินทั้งหมด</td>
            <td style="text-align: right; border: 1px solid #000; padding: 6pt;">${totalFormatted}</td>
          </tr>
          <tr>
            <td colspan="8" style="text-align: center; border: 1px solid #000; padding: 6pt; font-weight: bold;">
              (${thaiText})
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;
}
