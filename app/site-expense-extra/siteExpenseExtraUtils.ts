// app/site-expense-extra/siteExpenseExtraUtils.ts
/**
 * Data structures, default presets, calculations, Thai numeral converters,
 * and Word export generators for Additional On-Site Expenses Request Program
 * (โปรแกรมขอค่าใช้จ่ายหน้างานเพิ่มเติม)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export interface SiteExpenseJobItem {
  id: string;
  itemNo?: number;
  jobName: string;              // เช่น งานปรับปรุงระบบจำหน่าย 22 เควี หลังสนามกอล์ฟ ถึง ซอยดาวทอง (จุดที่ 1)
  wbsNumber: string;            // เช่น P-TDD02.3-I-PMNIA.0019
  initialPercent: number;       // เช่น 80
  initialAmount: number;        // เช่น 636788
  targetPercent: number;        // เช่น 100
  additionalAmount: number;     // เช่น 159197
  totalAmount: number;          // เช่น 795985 (636788 + 159197)
  remarks?: string;
}

export interface SiteExpenseExtraFormData {
  // บันทึกข้อความส่วนหัว
  docFrom: string;              // กรย.(ก3)
  docTo: string;                // กวว.(ก3)
  docNo: string;                // เช่น ก.3 กรย.(กร)- 2327/2569
  docDate: string;              // เช่น 8 ต.ค. 2569
  subject: string;              // ขอให้จัดสรรงบประมาณค่าใช้จ่ายหน้างานเพิ่มเติม
  salutation: string;           // อก.วว.(ก3)

  // หนังสืออ้างถึงเดิม (วรรคที่ 1)
  refDocNo: string;             // ก.3 กวว.(วร) 826/2568
  refDocDate: string;           // 2 พฤษภาคม 2568
  projectName: string;          // งานปรับปรุงระบบจำหน่าย 22 เควี หลังสนามกอล์ฟ ถึง ซอยดาวทอง (จุดที่ 1, 2)
  programName: string;          // โครงการ คพจ.2

  // รายการโครงการและงบประมาณเดิม
  jobItems: SiteExpenseJobItem[];

  // รายละเอียดการดำเนินงานและเหตุผลความจำเป็น (วรรคที่ 2)
  supervisorName: string;       // นายวีรพัฒน์ นาลดมัย
  supervisorPosition: string;   // พชง.6 ผกร.กรย.(ก3)
  progressPercent: number;      // 80
  justificationReason: string;  // แต่เนื่องจากงานก่อสร้างดังกล่าวเป็นงานก่อสร้างปรับปรุงระบบจำหน่าย มีความจำเป็นต้องระดมชุดปฏิบัติงานก่อสร้างจาก กรย.(ก3) และ กฟฟ. ใกล้เคียงเข้าร่วมปฏิบัติงานในช่วงวันหยุดราชการทำให้สิ้นเปลืองค่าใช้จ่าย ทำให้งบประมาณได้รับจัดสรรไม่เพียงพอต่อการดำเนินการก่อสร้าง

  // คำขออนุมัติจัดสรรงบประมาณ (วรรคที่ 3)
  requestObjective: string;     // ดังนั้นเพื่อให้ดำเนินการก่อสร้างได้แล้วเสร็จ และมีงบประมาณเพียงพอต่อการดำเนินงาน จึงขอให้ กวว.(ก3) พิจารณาจัดสรรงบประมาณค่าใช้จ่ายหน้างานเพิ่มเติมเป็น 100 % จำนวน 2 งานดังนี้

  // ผู้ลงนามหลัก
  signerName: string;           // นายอนันต์ กาญจนอุปถัมภ์
  signerPosition: string;       // รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
  signerDate: string;           // 8 ต.ค. 69

  // เกษียนหนังสือ (ขวาล่าง)
  hasRoutingStamps: boolean;    // true
  stampHpKrDate: string;        // หผ.กร.(ก3) วันที่ เช่น 7 ต.ค. 69
  stampCpKrDate: string;        // ชผ.กร.(ก3) วันที่

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
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
  };
  return str.toString().replace(/[๐-๙]/g, (match) => thaiToEng[match] || match);
}

/**
 * ฟอร์แมตตัวเลขการเงิน (มี comma)
 */
export function formatNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '0';
  const val = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(val)) return '0';
  return val.toLocaleString('th-TH');
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
 * คำนวณยอดเงินรวมทั้งหมด
 */
export function calculateTotals(items: SiteExpenseJobItem[]) {
  const totalInitial = items.reduce((sum, item) => sum + (Number(item.initialAmount) || 0), 0);
  const totalAdditional = items.reduce((sum, item) => sum + (Number(item.additionalAmount) || 0), 0);
  const grandTotal = items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  return { totalInitial, totalAdditional, grandTotal };
}

/**
 * แม่แบบที่ 1: ตามเอกสารตัวอย่างจริง (หลังสนามกอล์ฟ ถึง ซอยดาวทอง จุดที่ 1 และ 2)
 */
export const SAMPLE_PRESET_GOLF_COURSE: SiteExpenseExtraFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กวว.(ก3)',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขอให้จัดสรรงบประมาณค่าใช้จ่ายหน้างานเพิ่มเติม',
  salutation: 'อก.วว.(ก3)',

  refDocNo: 'ก.3 กวว.(วร) 826/2568',
  refDocDate: '2 พฤษภาคม 2568',
  projectName: 'งานปรับปรุงระบบจำหน่าย 22 เควี หลังสนามกอล์ฟ ถึง ซอยดาวทอง (จุดที่ 1, 2)',
  programName: 'โครงการ คพจ.2',

  jobItems: [
    {
      id: 'job-1',
      jobName: 'งานปรับปรุงระบบจำหน่าย 22 เควี หลังสนามกอล์ฟ ถึง ซอยดาวทอง (จุดที่ 1)',
      wbsNumber: 'P-TDD02.3-I-PMNIA.0019',
      initialPercent: 80,
      initialAmount: 636788,
      targetPercent: 100,
      additionalAmount: 159197,
      totalAmount: 795985,
    },
    {
      id: 'job-2',
      jobName: 'งานปรับปรุงระบบจำหน่าย 22 เควี หลังสนามกอล์ฟ ถึง ซอยดาวทอง (จุดที่ 2)',
      wbsNumber: 'P-TDD02.3-I-PMNIA.0020',
      initialPercent: 80,
      initialAmount: 839645,
      targetPercent: 100,
      additionalAmount: 209912,
      totalAmount: 1049557,
    }
  ],

  supervisorName: 'นายวีรพัฒน์ นาลดมัย',
  supervisorPosition: 'พชง.6 ผกร.กรย.(ก3)',
  progressPercent: 80,
  justificationReason: 'แต่เนื่องจากงานก่อสร้างดังกล่าวเป็นงานก่อสร้างปรับปรุงระบบจำหน่าย มีความจำเป็นต้องระดมชุดปฏิบัติงานก่อสร้างจาก กรย.(ก3) และ กฟฟ. ใกล้เคียงเข้าร่วมปฏิบัติงานในช่วงวันหยุดราชการทำให้สิ้นเปลืองค่าใช้จ่าย ทำให้งบประมาณได้รับจัดสรรไม่เพียงพอต่อการดำเนินการก่อสร้าง',

  requestObjective: 'ดังนั้นเพื่อให้ดำเนินการก่อสร้างได้แล้วเสร็จ และมีงบประมาณเพียงพอต่อการดำเนินงาน จึงขอให้ กวว.(ก3) พิจารณาจัดสรรงบประมาณค่าใช้จ่ายหน้างานเพิ่มเติมเป็น 100 % จำนวน 2 งานดังนี้',

  signerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  signerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  signerDate: '',

  hasRoutingStamps: true,
  stampHpKrDate: '',
  stampCpKrDate: '',

  isThaiNumerals: false,
};

/**
 * แม่แบบที่ 2: งานก่อสร้างเดี่ยว 1 จุด (ขยายกรอบงบหน้างานเร่งด่วน)
 */
export const SAMPLE_PRESET_SINGLE_PROJECT: SiteExpenseExtraFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กวว.(ก3)',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขอให้จัดสรรงบประมาณค่าใช้จ่ายหน้างานเพิ่มเติม',
  salutation: 'อก.วว.(ก3)',

  refDocNo: 'ก.3 กวว.(วร) 915/2568',
  refDocDate: '10 มิถุนายน 2568',
  projectName: 'งานก่อสร้างย้ายแนวระบบสายส่ง 115 เควี บริเวณแยกทางหลวงหมายเลข 3318 สุพรรณบุรี',
  programName: 'โครงการพัฒนาระบบสายส่งและสถานีไฟฟ้า',

  jobItems: [
    {
      id: 'job-single',
      jobName: 'งานก่อสร้างย้ายแนวระบบสายส่ง 115 เควี บริเวณแยกทางหลวงหมายเลข 3318 - สฟ.สุพรรณบุรี 2',
      wbsNumber: 'P-TD02.3-I-SPINA.0007',
      initialPercent: 80,
      initialAmount: 485000,
      targetPercent: 100,
      additionalAmount: 121250,
      totalAmount: 606250,
    }
  ],

  supervisorName: 'นายศราวุฒิ เกิดสีเล็ก',
  supervisorPosition: 'พชง.6 ผกร.กรย.(ก3)',
  progressPercent: 75,
  justificationReason: 'เนื่องจากพื้นที่ก่อสร้างมีอุปสรรคทางกายภาพแนวท่อก๊าซและลำคลองสาธารณะ ต้องใช้เครื่องจักรกลพิเศษและชุดปฏิบัติงานเข้าดำเนินงานในเวลากลางคืนเพื่อหลีกเลี่ยงผลกระทบด้านการจราจร ทำให้มีค่าใช้จ่ายหน้างานสูงกว่ากรอบประมาณการเดิม 80%',

  requestObjective: 'ดังนั้นเพื่อให้ดำเนินการก่อสร้างได้แล้วเสร็จตามแผนงาน และมีงบประมาณเพียงพอต่อการดำเนินงาน จึงขอให้ กวว.(ก3) พิจารณาจัดสรรงบประมาณค่าใช้จ่ายหน้างานเพิ่มเติมเป็น 100 % จำนวน 1 งานดังนี้',

  signerName: 'นายกำพล ตุ้ยเต็มวงค์',
  signerPosition: 'อก.รย.(ก3)',
  signerDate: '',

  hasRoutingStamps: true,
  stampHpKrDate: '',
  stampCpKrDate: '',

  isThaiNumerals: false,
};

/**
 * สร้าง HTML สำหรับเปิดใน Microsoft Word (.doc) หรือ Copy Clipboard
 */
export function generateSiteExpenseWordHtml(data: SiteExpenseExtraFormData): string {
  const isThai = data.isThaiNumerals;
  const tn = (val: string | number | undefined | null) => isThai ? toThaiNumerals(val) : (val?.toString() || '');
  const fmt = (num: number) => isThai ? toThaiNumerals(formatNumber(num)) : formatNumber(num);

  const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>บันทึกข้อความขอให้จัดสรรงบประมาณค่าใช้จ่ายหน้างานเพิ่มเติม</title>
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
    .bold { font-weight: bold; }
    .indent { text-indent: 2.5cm; }
    .list-item { margin-left: 2cm; margin-bottom: 4pt; }
  </style>
</head>
<body>
  <!-- ส่วนหัวบันทึกข้อความ -->
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

  <!-- วรรคที่ 1: อ้างถึงหนังสือเดิมและแสดงรายการ 80% -->
  <p class="indent">
    ตามหนังสือเลขที่ ${tn(data.refDocNo)} ลงวันที่ ${tn(data.refDocDate)} ตามอนุมัติหลักการประมาณการ${data.projectName} ตาม${data.programName} ดังนี้
  </p>

  ${data.jobItems.map((item) => `
  <p class="list-item">
    - ${item.jobName} (WBS): ${tn(item.wbsNumber)} โดยมีค่าใช้จ่ายหน้างานที่ ${tn(item.initialPercent)} % เป็นเงิน ${fmt(item.initialAmount)} บาท (รายละเอียดตามเอกสารแนบ)
  </p>
  `).join('')}

  <!-- วรรคที่ 2: สถานะการดำเนินงานและเหตุผลความจำเป็น -->
  <p class="indent" style="margin-top: 8pt;">
    ${data.projectName} ดำเนินการก่อสร้างโดยชุดงาน${data.supervisorName} ${data.supervisorPosition} ปัจจุบันดำเนินการไปประมาณ ${tn(data.progressPercent)}% ${data.justificationReason}
  </p>

  <!-- วรรคที่ 3: คำขออนุมัติจัดสรรเพิ่มเติมเป็น 100% -->
  <p class="indent" style="margin-top: 8pt;">
    ${data.requestObjective}
  </p>

  ${data.jobItems.map((item, idx) => `
  <p class="list-item">
    ${tn(idx + 1)}. ${item.jobName} (WBS): ${tn(item.wbsNumber)} วงเงินงบประมาณที่เพิ่มเติมเป็นเงิน ${fmt(item.additionalAmount)} รวมเป็นเงินงบประมาณทั้งสิ้น ${fmt(item.initialAmount)} + ${fmt(item.additionalAmount)} = ${fmt(item.totalAmount)} บาท
  </p>
  `).join('')}

  <p class="indent" style="margin-top: 8pt;">
    จึงเรียนมาเพื่อโปรดพิจารณาและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
  </p>

  <!-- ผู้ลงนาม -->
  <table style="width: 100%; margin-top: 35pt;">
    <tr>
      <td style="width: 45%;"></td>
      <td style="width: 55%; text-align: center;">
        <br><br>
        (${data.signerName})<br>
        ${data.signerPosition}<br>
        ${tn(data.signerDate)}
      </td>
    </tr>
  </table>

  <!-- ตารางเกษียนเดินเรื่อง -->
  ${data.hasRoutingStamps ? `
  <table style="width: 100%; margin-top: 40pt;">
    <tr>
      <td style="width: 50%;"></td>
      <td style="width: 50%;">
        <table style="border: 1pt solid #000; border-collapse: collapse; width: 100%; font-size: 13pt;">
          <tr>
            <td style="border: 1pt solid #000; padding: 4pt 6pt; width: 35%;">หผ.กร.(ก3)</td>
            <td style="border: 1pt solid #000; padding: 4pt 6pt;">ลงชื่อ ............................... วันที่ ${tn(data.stampHpKrDate)}</td>
          </tr>
          ${data.stampCpKrDate ? `
          <tr>
            <td style="border: 1pt solid #000; padding: 4pt 6pt;">ชผ.กร.(ก3)</td>
            <td style="border: 1pt solid #000; padding: 4pt 6pt;">ลงชื่อ ............................... วันที่ ${tn(data.stampCpKrDate)}</td>
          </tr>
          ` : ''}
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
export function downloadSiteExpenseWordDocument(data: SiteExpenseExtraFormData): void {
  const htmlContent = generateSiteExpenseWordHtml(data);
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `บันทึกขอค่าใช้จ่ายหน้างานเพิ่มเติม_${Date.now()}.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * คัดลอกตารางและข้อความแบบ Rich HTML เพื่อนำไปวางลงใน Microsoft Word โดยตรง
 */
export async function copyFormattedSiteExpenseWord(data: SiteExpenseExtraFormData): Promise<boolean> {
  const htmlContent = generateSiteExpenseWordHtml(data);
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
      const textBlob = new Blob([generateSiteExpensePlainText(data)], { type: 'text/plain' });
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob,
        })
      ]);
      return true;
    } else {
      await navigator.clipboard.writeText(generateSiteExpensePlainText(data));
      return true;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    try {
      await navigator.clipboard.writeText(generateSiteExpensePlainText(data));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * สร้าง Plain Text สำหรับแชร์ใน LINE หรืออีเมล
 */
export function generateSiteExpensePlainText(data: SiteExpenseExtraFormData): string {
  let text = `📋 บันทึกข้อความ: ${data.subject}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `ที่: ${data.docNo}    วันที่: ${data.docDate}\n`;
  text += `จาก: ${data.docFrom}    ถึง: ${data.docTo} (${data.salutation})\n`;
  text += `เรื่อง: ${data.subject}\n\n`;

  text += `📌 หนังสืออ้างถึง:\n`;
  text += `ตามหนังสือเลขที่ ${data.refDocNo} ลงวันที่ ${data.refDocDate} ตามอนุมัติหลักการประมาณการ${data.projectName} ตาม${data.programName}\n\n`;

  text += `💰 รายการค่าใช้จ่ายหน้างานเดิม (${data.jobItems[0]?.initialPercent || 80}%):\n`;
  data.jobItems.forEach(item => {
    text += `  - ${item.jobName} (WBS: ${item.wbsNumber}): ${formatNumber(item.initialAmount)} บาท\n`;
  });
  text += `\n`;

  text += `⚡ เหตุผลความจำเป็น:\n`;
  text += `ชุดงาน${data.supervisorName} (${data.supervisorPosition}) ดำเนินการแล้ว ${data.progressPercent}% ${data.justificationReason}\n\n`;

  text += `💵 รายการที่ขอจัดสรรเพิ่มเติมเป็น 100%:\n`;
  data.jobItems.forEach((item, idx) => {
    text += `  ${idx + 1}. ${item.jobName}\n`;
    text += `     WBS: ${item.wbsNumber}\n`;
    text += `     วงเงินขอเพิ่ม: ${formatNumber(item.additionalAmount)} บาท\n`;
    text += `     รวมงบประมาณทั้งสิ้น (100%): ${formatNumber(item.initialAmount)} + ${formatNumber(item.additionalAmount)} = ${formatNumber(item.totalAmount)} บาท\n`;
  });
  text += `\n`;

  text += `ผู้ลงนาม: ${data.signerName} (${data.signerPosition})\n`;
  return text;
}
