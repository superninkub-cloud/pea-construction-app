// app/job-close-memo/jobCloseUtils.ts
/**
 * Utility functions, types, sample presets, and document generators
 * for Job Close Notification Memo Application (โปรแกรมบันทึกแจ้งปิดงาน กส.3)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export interface JobCloseItem {
  id: string;
  projectName: string;      // ชื่องาน เช่น งานก่อสร้างระบบสายส่ง 115 kV. CUT&TURN...
  wbsNo: string;            // หมายเลขงาน WBS เช่น P-TDD02.1-I-PMNT0.0002
  networkNo?: string;       // โครงข่าย (ถ้ามี)
  location?: string;        // พื้นที่ / จังหวัด (ถ้ามี)
  remarks?: string;         // หมายเหตุเพิ่มเติม
}

export interface JobCloseFormData {
  // ข้อมูลส่วนหัวหนังสือ (บันทึกข้อความ)
  docFrom: string;          // จาก เช่น กรย.(ก3) หรือ ผกร.กรย.(ก3)
  docTo: string;            // ถึง เช่น กบฟ.(ก3) หรือ กผง.(ก3)
  docNo: string;            // เลขที่หนังสือ เช่น ก.3 กรย.(กร) 2383/2568
  docDate: string;          // วันที่ เช่น 12 ก.ค. 2568
  subject: string;          // เรื่อง เช่น ขอนำส่งรายงานปิด กส.3 จำนวน 1 งาน
  salutation: string;       // เรียน เช่น อก.บฟ.(ก3) หรือ อก.ผง.(ก3)

  // เนื้อหาหลัก
  workCategory: string;     // ประเภทงาน เช่น งานก่อสร้างปรับปรุงระบบสายส่ง 115 kV. หรือ งานก่อสร้างปรับปรุงระบบจำหน่าย 22-33 kV.
  completionText: string;   // ข้อความความพร้อม เช่น แล้วเสร็จพร้อมจ่ายไฟแล้วนั้น จึงขอนำส่งเอกสารปิด กส.3 งานดังนี้
  closingStatement: string; // ข้อความปิดท้าย เช่น จึงเรียนมาเพื่อโปรดพิจารณาและดำเนินการต่อไป

  // รายการงานที่แจ้งปิด
  jobs: JobCloseItem[];

  // ข้อมูลผู้ลงนาม
  signerName: string;       // นายอนันต์ กาญจนอุปถัมภ์
  signerPosition: string;   // รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
  signerDate: string;       // 12 ก.ค. 2568
  showDigitalSign: boolean; // แสดงลายเซ็นจำลองหรือไม่
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
 * ประเภทงานก่อสร้างยอดนิยม
 */
export const POPULAR_WORK_CATEGORIES = [
  'งานก่อสร้างปรับปรุงระบบสายส่ง 115 kV.',
  'งานก่อสร้างปรับปรุงระบบจำหน่าย 22-33 kV.',
  'งานก่อสร้างสถานีไฟฟ้า (Substation)',
  'งานขยายเขตระบบจำหน่ายไฟฟ้าแรงสูง-แรงต่ำ',
  'งานย้ายแนวเสา-สายระบบจำหน่ายเพื่อหลบแนวทางหลวง',
  'งานติดตั้งอุปกรณ์ควบคุมและป้องกันระบบจำหน่าย (Recloser / Capacitor)'
];

/**
 * ปลายทางหน่วยงานส่งเอกสารปิดงานยอดนิยม
 */
export const POPULAR_DESTINATIONS = [
  {
    to: 'กบฟ.(ก3)',
    salutation: 'อก.บฟ.(ก3)',
    label: 'กองบัญชีและการเงิน (กบฟ.) เพื่อปิดบัญชีและรับมอบสินทรัพย์'
  },
  {
    to: 'กผง.(ก3)',
    salutation: 'อก.ผง.(ก3)',
    label: 'กองแผนงาน (กผง.) เพื่อตัดแผนงานและสรุปสถานะ'
  },
  {
    to: 'กบภ.(ก3)',
    salutation: 'อก.บภ.(ก3)',
    label: 'กองบริการลูกค้าและพัฒนาธุรกิจ (กบภ.)'
  }
];

/**
 * ข้อมูลตัวอย่างเริ่มต้น (ตรงตามภาพเอกสารจริงที่ผู้ใช้แนบมา)
 */
export const SAMPLE_JOB_CLOSE_DATA: JobCloseFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กบฟ.(ก3)',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขอนำส่งรายงานปิด กส.3 จำนวน 1 งาน',
  salutation: 'อก.บฟ.(ก3)',

  workCategory: 'งานก่อสร้างปรับปรุงระบบสายส่ง 115 kV.',
  completionText: 'แล้วเสร็จพร้อมจ่ายไฟแล้วนั้น จึงขอนำส่งเอกสารปิด กส.3 งานดังนี้',
  closingStatement: 'จึงเรียนมาเพื่อโปรดพิจารณาและดำเนินการต่อไป',

  jobs: [
    {
      id: 'job-1',
      projectName: 'งานก่อสร้างระบบสายส่ง 115 kV. CUT&TURN (สถานีไฟฟ้าบางเลน-สถานีไฟฟ้าศาลายา) - สถานีไฟฟ้าบางเลน 2 (พุทธมณฑล 3) จ.นครปฐม',
      wbsNo: 'P-TDD02.1-I-PMNT0.0002',
      location: 'จ.นครปฐม'
    }
  ],

  signerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  signerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  signerDate: '',
  showDigitalSign: true
};

/**
 * สร้างข้อความตัวอย่าง Plain Text สำหรับคัดลอกลง LINE หรือแชท
 */
export function generateJobCloseMemoPlainText(data: JobCloseFormData): string {
  let content = `บันทึกข้อความ\n`;
  content += `การไฟฟ้าส่วนภูมิภาค\n\n`;
  content += `หน่วยงาน: ${data.docFrom}\t\tถึง: ${data.docTo}\n`;
  content += `ที่: ${data.docNo || '-'}\t\tวันที่: ${data.docDate || '-'}\n`;
  content += `เรื่อง: ${data.subject}\n`;
  content += `เรียน: ${data.salutation}\n\n`;

  content += `     ด้วย ${data.docFrom} ได้ดำเนินการ${data.workCategory} ${data.completionText}\n`;

  if (data.jobs.length === 1) {
    const job = data.jobs[0];
    content += `     ${job.projectName} หมายเลขงาน (WBS) : ${job.wbsNo}\n\n`;
  } else {
    data.jobs.forEach((job, idx) => {
      content += `     ${toThaiNumerals(idx + 1)}. ${job.projectName} หมายเลขงาน (WBS) : ${job.wbsNo}\n`;
    });
    content += `\n`;
  }

  content += `     ${data.closingStatement}\n\n`;
  if (data.signerDate) content += `\t\t\t\t\t${data.signerDate}\n`;
  content += `\t\t\t\t\t(${data.signerName})\n`;
  content += `\t\t\t\t\t${data.signerPosition}\n`;

  return content;
}

/**
 * สร้างโครงสร้างเอกสาร Word (.doc) สมบูรณ์แบบ
 */
export function generateJobCloseWordDocument(data: JobCloseFormData): string {
  let jobsListHtml = '';
  if (data.jobs.length === 1) {
    const job = data.jobs[0];
    jobsListHtml = `
      <p style="text-indent: 2.5cm; margin-bottom: 12pt; text-align: justify; line-height: 1.6;">
        ${job.projectName} หมายเลขงาน (WBS) : ${job.wbsNo}
      </p>
    `;
  } else {
    jobsListHtml = data.jobs.map((job, idx) => `
      <div style="text-indent: 2.5cm; margin-bottom: 6pt; text-align: justify; line-height: 1.5;">
        ${toThaiNumerals(idx + 1)}. ${job.projectName} หมายเลขงาน (WBS) : ${job.wbsNo}
      </div>
    `).join('') + '<br/>';
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
          padding: 2.5pt 0;
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
          <td style="width: 10%; font-weight: bold;">หน่วยงาน</td>
          <td style="width: 40%;">${data.docFrom}</td>
          <td style="width: 10%; font-weight: bold;">ถึง</td>
          <td style="width: 40%;">${data.docTo}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ที่</td>
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
        ด้วย ${data.docFrom} ได้ดำเนินการ${data.workCategory} ${data.completionText}
      </p>

      <!-- Jobs List -->
      ${jobsListHtml}

      <!-- Closing -->
      <p style="text-indent: 2.5cm; margin-bottom: 24pt; line-height: 1.6;">
        ${data.closingStatement}
      </p>

      <!-- Signer Block -->
      <div style="margin-left: 55%; text-align: center; margin-bottom: 30pt; line-height: 1.4;">
        <br/><br/>
        <div>(${data.signerName})</div>
        <div>${data.signerPosition}</div>
        ${data.signerDate ? `<div style="margin-top: 4pt;">${data.signerDate}</div>` : ''}
      </div>
    </body>
    </html>
  `;
}
