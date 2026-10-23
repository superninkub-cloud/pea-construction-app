// app/job-open-request/jobOpenUtils.ts
/**
 * Data structures, default presets, Thai numeral converters,
 * and Word export generators for Job Opening Request Program (โปรแกรมแจ้งขอเปิดงาน)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export interface JobOpenFormData {
  // บันทึกข้อความส่วนหัว
  docFrom: string;              // เช่น กรย.(ก3)
  docTo: string;                // เช่น กฟส.สามชุก หรือ กฟจ.กาญจนบุรี
  docNo: string;                // เช่น ก.3 กรย.(กร) 2249/2569
  docDate: string;              // เช่น 28 ก.ย. 2569
  subject: string;              // เช่น ขอแจ้งเข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง ช่วงงานก่อสร้างสะพานลอยหน้า ม.ราชมงคลสุวรรณภูมิศูนย์สุพรรณบุรี จ.สุพรรณบุรี
  salutation: string;           // เช่น ผจก.กฟส.สามชุก หรือ ผจก.กฟจ.กาญจนบุรี

  // หนังสืออ้างถึงเดิมของพื้นที่ (วรรคที่ 1)
  refDocNo: string;             // เช่น ก.3 สช.(ปร) 1040/2569
  refDocDate: string;           // เช่น 17 กันยายน 2569
  refJobDescription: string;    // เช่น ขอให้ กรย.(ก3) เข้าดำเนินการงานย้ายแนวระบบสายส่ง ช่วงงานก่อสร้างสะพานลอยหน้า ม.ราชมงคลสุวรรณภูมิศูนย์สุพรรณบุรี จ.สุพรรณบุรี โดยงานดังกล่าวให้ กรย.(ก3) เป็นผู้เปิดงานก่อสร้างฯ

  // ข้อมูลการเข้าดำเนินการของ กรย.(ก3) (วรรคที่ 2)
  actionDescription: string;    // เช่น กรย.(ก3) จึงขอแจ้งเข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง ช่วงงานก่อสร้างสะพานลอยหน้า ม.ราชมงคลสุวรรณภูมิศูนย์สุพรรณบุรี จ.สุพรรณบุรี
  wbsNumber: string;            // เช่น I-69-I-SMG69.M4.1116

  // ผู้ควบคุมงาน
  supervisorName: string;       // เช่น นายศราวุฒิ เกิดสีเล็ก
  supervisorPosition: string;   // เช่น ผพง.6 ผกร.กรย.(ก3)

  // คำลงท้ายคำขออนุมัติ
  requestClosingText: string;   // เช่น และให้ กฟส.สามชุก อนุมัติเปิดงาน และดำเนินการในส่วนที่เกี่ยวข้องให้ต่อไป

  // ผู้ลงนามหลัก
  signerName: string;           // นายกำพล ตุ้ยเต็มวงค์
  signerPosition: string;       // อก.รย.(ก3)
  signerDate: string;           // 28 ก.ย. 2569

  // เกษียนหนังสือ (ขวาล่าง)
  hasRoutingStamps: boolean;    // true
  stampHpKrDate: string;        // หผ.กร.(ก3) วันที่ เช่น 28 ก.ย. 69
  stampCpKrDate: string;        // ชผ.กร.(ก3) วันที่ เช่น 25 ก.ย. 69

  // ข้อมูลประกอบจาก SAP ZPSF004 (ทางเลือก)
  budgetAmount?: number;        // เช่น 188743.00
  budgetCostCenter?: string;    // เช่น 7001248605

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
 * แม่แบบที่ 1: กฟส.สามชุก (สะพานลอยหน้า ม.ราชมงคลสุวรรณภูมิ สุพรรณบุรี)
 * ตรงตาม PDF 1 หน้า 1 เป๊ะ!
 */
export const SAMPLE_PRESET_SAMCHUK: JobOpenFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กฟส.สามชุก',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขอแจ้งเข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง ช่วงงานก่อสร้างสะพานลอยหน้า ม.ราชมงคลสุวรรณภูมิศูนย์สุพรรณบุรี จ.สุพรรณบุรี',
  salutation: 'ผจก.กฟส.สามชุก',

  refDocNo: 'ก.3 สช.(ปร) 1040/2569',
  refDocDate: '17 กันยายน 2569',
  refJobDescription: 'ขอให้ กรย.(ก3) เข้าดำเนินการงานย้ายแนวระบบสายส่ง ช่วงงานก่อสร้างสะพานลอยหน้า ม.ราชมงคลสุวรรณภูมิศูนย์สุพรรณบุรี จ.สุพรรณบุรี โดยงานดังกล่าวให้ กรย.(ก3) เป็นผู้เปิดงานก่อสร้างฯ',

  actionDescription: 'กรย.(ก3) จึงขอแจ้งเข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง ช่วงงานก่อสร้างสะพานลอยหน้า ม.ราชมงคลสุวรรณภูมิศูนย์สุพรรณบุรี จ.สุพรรณบุรี',
  wbsNumber: 'I-69-I-SMG69.M4.1116',

  supervisorName: 'นายศราวุฒิ เกิดสีเล็ก',
  supervisorPosition: 'ผพง.6 ผกร.กรย.(ก3)',

  requestClosingText: 'และให้ กฟส.สามชุก อนุมัติเปิดงาน และดำเนินการในส่วนที่เกี่ยวข้องให้ต่อไป',

  signerName: 'นายกำพล ตุ้ยเต็มวงค์',
  signerPosition: 'อก.รย.(ก3)',
  signerDate: '',

  hasRoutingStamps: true,
  stampHpKrDate: '',
  stampCpKrDate: '',

  budgetAmount: 188743.00,
  budgetCostCenter: '7001248605',

  isThaiNumerals: false,
};

/**
 * แม่แบบที่ 2: กฟจ.กาญจนบุรี (สะพานลอยบ้านห้วยตลุง จ.กาญจนบุรี)
 * ตรงตาม PDF 2 หน้า 1 เป๊ะ!
 */
export const SAMPLE_PRESET_KANCHANABURI: JobOpenFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กฟจ.กาญจนบุรี',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขอแจ้งเข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง ช่วงงานก่อสร้างสะพานลอยบ้านห้วยตลุง จ.กาญจนบุรี',
  salutation: 'ผจก.กฟจ.กาญจนบุรี',

  refDocNo: 'ก.3 กฟจ.กจ.(ปบ) 2896/2569',
  refDocDate: '16 กันยายน 2569',
  refJobDescription: 'ขอให้ กรย.(ก3) เข้าดำเนินการงานย้ายแนวระบบสายส่ง ช่วงงานก่อสร้างสะพานลอยบ้านห้วยตลุง จ.กาญจนบุรี โดยงานดังกล่าวให้ กรย.(ก3) เป็นผู้เปิดงานก่อสร้างฯ',

  actionDescription: 'กรย.(ก3) จึงขอแจ้งเข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง ช่วงงานก่อสร้างสะพานลอยบ้านห้วยตลุง',
  wbsNumber: 'I-69-I-KCI69.M4.1125',

  supervisorName: 'นายอุดมศักดิ์ จันทร์กลิ่น',
  supervisorPosition: 'ผพง.7 ผกร.กรย.(ก3)',

  requestClosingText: 'และให้ กฟจ.กาญจนบุรี อนุมัติเปิดงาน และดำเนินการในส่วนที่เกี่ยวข้องให้ต่อไป',

  signerName: 'นายกำพล ตุ้ยเต็มวงค์',
  signerPosition: 'อก.รย.(ก3)',
  signerDate: '',

  hasRoutingStamps: true,
  stampHpKrDate: '',
  stampCpKrDate: '',

  budgetAmount: 147906.00,
  budgetCostCenter: '7001257238',

  isThaiNumerals: false,
};

/**
 * แม่แบบที่ 3: กฟจ.สมุทรสาคร (งานย้ายแนว 115 kV คลองท่าแร้ง)
 */
export const SAMPLE_PRESET_SAMUT: JobOpenFormData = {
  docFrom: 'กรย.(ก3)',
  docTo: 'กฟจ.สมุทรสาคร',
  docNo: 'ก.3 กรย.(กร)',
  docDate: '',
  subject: 'ขอแจ้งเข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง 115 เควี คลองท่าแร้ง ฝั่งขาออก กทม. จ.สมุทรสาคร',
  salutation: 'ผจก.กฟจ.สมุทรสาคร',

  refDocNo: 'ก.3 สค.(ปบ) 3105/2569',
  refDocDate: '25 กันยายน 2569',
  refJobDescription: 'ขอให้ กรย.(ก3) เข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง 115 เควี บริเวณคลองท่าแร้ง จ.สมุทรสาคร โดยงานดังกล่าวให้ กรย.(ก3) เป็นผู้เปิดงานก่อสร้างฯ',

  actionDescription: 'กรย.(ก3) จึงขอแจ้งเข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง 115 เควี บริเวณคลองท่าแร้ง จ.สมุทรสาคร',
  wbsNumber: 'I-69-I-SM269.M4.1105',

  supervisorName: 'นายอนันต์ กาญจนอุปถัมภ์',
  supervisorPosition: 'รก.รย.(ก3)',

  requestClosingText: 'และให้ กฟจ.สมุทรสาคร อนุมัติเปิดงาน และดำเนินการในส่วนที่เกี่ยวข้องให้ต่อไป',

  signerName: 'นายกำพล ตุ้ยเต็มวงค์',
  signerPosition: 'อก.รย.(ก3)',
  signerDate: '',

  hasRoutingStamps: true,
  stampHpKrDate: '',
  stampCpKrDate: '',

  budgetAmount: 320000.00,
  budgetCostCenter: '7001264890',

  isThaiNumerals: false,
};

/**
 * สร้าง HTML สำหรับเปิดใน Microsoft Word (.doc) หรือ Copy Clipboard (หน้าเดียวจบ)
 */
export function generateJobOpenWordHtml(data: JobOpenFormData): string {
  const isThai = data.isThaiNumerals;
  const tn = (val: string | number | undefined | null) => isThai ? toThaiNumerals(val) : (val?.toString() || '');

  const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>บันทึกข้อความขอแจ้งเข้าดำเนินการงานก่อสร้าง (ขอเปิดงาน)</title>
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

  <p class="indent">
    ตามหนังสือเลขที่ ${tn(data.refDocNo)} ลงวันที่ ${tn(data.refDocDate)} ${data.refJobDescription}
  </p>

  <p class="indent">
    ${data.actionDescription} หมายเลขงาน WBS : ${tn(data.wbsNumber)} โดยมอบหมายให้ ${data.supervisorName} ${data.supervisorPosition} เป็นผู้ควบคุมงาน ${data.requestClosingText}
  </p>

  <p class="indent">
    จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการในส่วนที่เกี่ยวข้องต่อไป
  </p>

  <!-- ผู้ลงนาม -->
  <table style="width: 100%; margin-top: 40pt;">
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
  <table style="width: 100%; margin-top: 50pt;">
    <tr>
      <td style="width: 50%;"></td>
      <td style="width: 50%;">
        <table style="border: 1pt solid #000; border-collapse: collapse; width: 100%; font-size: 13pt;">
          <tr>
            <td style="border: 1pt solid #000; padding: 4pt 6pt; width: 35%;">รก.รย.(ก3)</td>
            <td style="border: 1pt solid #000; padding: 4pt 6pt;">ลงชื่อ ............................... วันที่ ....................</td>
          </tr>
          <tr>
            <td style="border: 1pt solid #000; padding: 4pt 6pt;">หผ.กร.(ก3)</td>
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
export function downloadJobOpenWordDocument(data: JobOpenFormData): void {
  const htmlContent = generateJobOpenWordHtml(data);
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `บันทึกขอแจ้งเปิดงาน_${data.wbsNumber || 'โครงการ'}_${Date.now()}.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * คัดลอกตารางและข้อความแบบ Rich HTML เพื่อนำไปวางลงใน Microsoft Word โดยตรง
 */
export async function copyFormattedJobOpenWord(data: JobOpenFormData): Promise<boolean> {
  const htmlContent = generateJobOpenWordHtml(data);
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
      const textBlob = new Blob([generateJobOpenPlainText(data)], { type: 'text/plain' });
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob,
        })
      ]);
      return true;
    } else {
      await navigator.clipboard.writeText(generateJobOpenPlainText(data));
      return true;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    try {
      await navigator.clipboard.writeText(generateJobOpenPlainText(data));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * สร้าง Plain Text สำหรับแชร์ใน LINE หรืออีเมล
 */
export function generateJobOpenPlainText(data: JobOpenFormData): string {
  let text = `📋 บันทึกข้อความ: ${data.subject}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `ที่: ${data.docNo}    วันที่: ${data.docDate}\n`;
  text += `จาก: ${data.docFrom}    ถึง: ${data.docTo} (${data.salutation})\n`;
  text += `เรื่อง: ${data.subject}\n\n`;

  text += `📌 หนังสืออ้างถึง:\n`;
  text += `ตามหนังสือเลขที่ ${data.refDocNo} ลงวันที่ ${data.refDocDate} ${data.refJobDescription}\n\n`;

  text += `⚡ การเข้าดำเนินการของ กรย.(ก3):\n`;
  text += `${data.actionDescription} หมายเลขงาน WBS : ${data.wbsNumber}\n`;
  text += `ผู้ควบคุมงาน: ${data.supervisorName} (${data.supervisorPosition})\n`;
  text += `${data.requestClosingText}\n\n`;

  text += `จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการในส่วนที่เกี่ยวข้องต่อไป\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `ผู้ลงนาม: (${data.signerName}) ${data.signerPosition} วันที่ ${data.signerDate}\n`;

  return text;
}
