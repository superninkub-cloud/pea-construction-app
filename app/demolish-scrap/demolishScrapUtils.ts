// app/demolish-scrap/demolishScrapUtils.ts
/**
 * Data structures, default presets, catalogs, Thai numeral converters,
 * and Word export generators for Dismantled Materials Scrapping Request Program
 * (โปรแกรมขอส่งคืนพัสดุรื้อถอนแบบทำลาย)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export interface DemolishScrapItem {
  id: string;
  itemNo?: number;
  materialCode: string;         // เช่น 1-00-002-0102
  description: string;          // เช่น เสาคอนกรีต คอร. ขนาด 14.30 เมตร
  quantity: string | number;    // เช่น 1
  unit: string;                 // เช่น ต้น หรือ ชุด
  actionMethod: string;         // เช่น ตัดเป็นท่อน หรือ ทุบทำลาย
  remarks?: string;
}

export interface DemolishScrapFormData {
  // บันทึกข้อความส่วนหัว
  docFrom: string;              // เช่น ผกร.กรย.(ก3)
  docTo: string;                // เช่น กรย.(ก3)
  docNo: string;                // เช่น ก.3 กรย.(กร) 1638/2569
  docDate: string;              // เช่น 8 ต.ค. 2569
  subject: string;              // เช่น ขอส่งคืนพัสดุรื้อถอน ประเภทเสา คอร., และเสาตอม่อ คอร. หักชำรุดและทุบทำลาย งานปรับปรุงระบบจำหน่าย 22 เควี ช่วงทางรถไฟทุ่งบัว ถึง แยก ม.เกษตรศาสตร์ อ.กำแพงแสน จ.นครปฐม ตามแผนงาน คพจ.2.3
  salutation: string;           // เช่น อก.รย.(ก3) ผ่าน รก.รย.(ก3)

  // หนังสืออ้างถึงเดิม & ข้อมูลโครงการ (วรรคที่ ๑)
  refDocNo: string;             // เช่น ก.3 กวว.(วร) 3058/2566
  refDocDate: string;           // เช่น 13 ธันวาคม 2566
  projectName: string;          // เช่น ปรับปรุงระบบจำหน่าย 22 เควี ช่วงทางรถไฟทุ่งบัว ถึง ม.เกษตรศาสตร์ อ.กำแพงแสน จ.นครปฐม
  wbsNumber: string;            // เช่น P-TDD02.3-I-KPNIA.0027

  // สภาพปัญหาหน้างานและเหตุผล (วรรคที่ ๒)
  distanceFromRoad: string;     // เช่น 18 เมตร
  warehouseLocation: string;    // เช่น คลังพัสดุ กฟจ.นครปฐม
  justificationReason: string;  // จากสภาพหน้างานมีระยะห่างจากถนนประมาณ 18 เมตร และระบบสื่อสารเป็นจำนวนมาก จึงไม่สามารถดำเนินการรื้อถอน เสา คอร. ขนาด 14.30 เมตร, เสา คอร. ขนาด 14 เมตร, เสา คอร. ขนาด 12 เมตร, เสา คอร. ขนาด 9 เมตร ได้เต็มต้น จำเป็นต้องตัดเป็นท่อน ท่อนละ 5-8 เมตร ส่งคืนคลังพัสดุ กฟจ.นครปฐม เสาตอม่อ คอร. ขนาด 0.30x0.30 เมตร ยาว 4.50 เมตร, เสาตอม่อ คอร. ขนาด 0.35x0.35 เมตร ยาว 4.50 เมตร เป็นการรื้อถอนแบบวิธีทุบทำลาย ไม่สามารถนำพัสดุส่งคืนคลังพัสดุได้ เพื่อให้สามารถปิดงานก่อสร้างได้ตามกำหนด กรย.(ก3) จึงขอนำส่งคืนพัสดุรื้อถอน (ส่งคืนชำรุด)

  // ตารางรายการพัสดุรื้อถอน
  items: DemolishScrapItem[];

  // ผู้เสนอลงนาม (หน้า 2 - ผู้จัดทำบันทึก)
  proposerName: string;         // นายพิสันติ์ จิตต์ปลื้ม
  proposerPosition: string;     // หผ.กร.กรย.(ก3)

  // คำสั่งการอนุมัติของ อก.รย. (ส่วนท้าย)
  approverOrderNote: string;    // เช่น เรียน ผจก.กฟจ.นฐ. ผจก.กฟส.กพส. อนุมัติ และแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
  approverName: string;         // นายอนันต์ กาญจนอุปถัมภ์
  approverPosition: string;     // รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
  approverDate: string;         // 8 ต.ค. 69

  // ท้ายกระดาษ
  contactDepartment: string;    // แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3
  contactPhone: string;         // 10171

  // เกษียน ชผ. (มุมขวาล่าง)
  hasRoutingStamps: boolean;    // true
  stampCpKrDate: string;        // เช่น 8 ต.ค. 69

  // ตัวเลือกเลขไทย
  isThaiNumerals: boolean;
}

/**
 * แคตตาล็อกรหัสพัสดุคอนกรีตรื้อถอนยอดนิยม
 */
export const POPULAR_SCRAP_ITEMS = [
  { materialCode: '1-00-002-0102', description: 'เสาคอนกรีต คอร. ขนาด 14.30 เมตร', defaultAction: 'ตัดเป็นท่อน', unit: 'ต้น' },
  { materialCode: '1-00-001-0006', description: 'เสาคอนกรีต คอร. ขนาด 14 เมตร', defaultAction: 'ตัดเป็นท่อน', unit: 'ต้น' },
  { materialCode: '1-00-001-0004', description: 'เสาคอนกรีต คอร. ขนาด 12 เมตร', defaultAction: 'ตัดเป็นท่อน', unit: 'ต้น' },
  { materialCode: '1-00-001-0002', description: 'เสาคอนกรีต คอร. ขนาด 9 เมตร', defaultAction: 'ตัดเป็นท่อน', unit: 'ต้น' },
  { materialCode: '1-00-006-0102', description: 'เสาตอม่อ คอร. ขนาด 0.30x0.30 เมตร ยาว 4.50 เมตร', defaultAction: 'ทุบทำลาย', unit: 'ต้น' },
  { materialCode: '1-00-006-0201', description: 'เสาตอม่อ คอร. ขนาด 0.35x0.35 เมตร ยาว 4.50 เมตร', defaultAction: 'ทุบทำลาย', unit: 'ต้น' },
  { materialCode: '1-00-006-0301', description: 'เสาตอม่อ คอร. ขนาด 0.40x0.40 เมตร ยาว 4.50 เมตร', defaultAction: 'ทุบทำลาย', unit: 'ต้น' },
  { materialCode: '1-00-005-0013', description: 'ตอม่อเสา คอร. CONC. FOOTING 0.90x2.20x2.30 M.', defaultAction: 'ทุบทำลาย', unit: 'ตัว' },
];

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
 * แม่แบบที่ 1: กำแพงแสน (ทุ่งบัว - ม.เกษตรศาสตร์)
 * ตรงตาม PDF ตัวอย่างเป๊ะ 100%!
 */
export const SAMPLE_PRESET_KAMPHAENGSAEN: DemolishScrapFormData = {
  docFrom: 'ผกร.กรย.(ก3)',
  docTo: 'กรย.(ก3)',
  docNo: 'ก.3 กรย.(กร) 1638/2569',
  docDate: '8 ต.ค. 2569',
  subject: 'ขอส่งคืนพัสดุรื้อถอน ประเภทเสา คอร., และเสาตอม่อ คอร. หักชำรุดและทุบทำลาย งานปรับปรุงระบบจำหน่าย 22 เควี ช่วงทางรถไฟทุ่งบัว ถึง แยก ม.เกษตรศาสตร์ อ.กำแพงแสน จ.นครปฐม ตามแผนงาน คพจ.2.3',
  salutation: 'อก.รย.(ก3) ผ่าน รก.รย.(ก3)',

  refDocNo: 'ก.3 กวว.(วร) 3058/2566',
  refDocDate: '13 ธันวาคม 2566',
  projectName: 'ปรับปรุงระบบจำหน่าย 22 เควี ช่วงทางรถไฟทุ่งบัว ถึง ม.เกษตรศาสตร์ อ.กำแพงแสน จ.นครปฐม',
  wbsNumber: 'P-TDD02.3-I-KPNIA.0027',

  distanceFromRoad: '18 เมตร',
  warehouseLocation: 'คลังพัสดุ กฟจ.นครปฐม',
  justificationReason: 'จากสภาพหน้างานมีระยะห่างจากถนนประมาณ 18 เมตร และระบบสื่อสารเป็นจำนวนมาก จึงไม่สามารถดำเนินการรื้อถอน เสา คอร. ขนาด 14.30 เมตร, เสา คอร. ขนาด 14 เมตร, เสา คอร. ขนาด 12 เมตร, เสา คอร. ขนาด 9 เมตร ได้เต็มต้น จำเป็นต้องตัดเป็นท่อน ท่อนละ 5-8 เมตร ส่งคืนคลังพัสดุ กฟจ.นครปฐม เสาตอม่อ คอร. ขนาด 0.30x0.30 เมตร ยาว 4.50 เมตร, เสาตอม่อ คอร. ขนาด 0.35x0.35 เมตร ยาว 4.50 เมตร เป็นการรื้อถอนแบบวิธีทุบทำลาย ไม่สามารถนำพัสดุส่งคืนคลังพัสดุได้ เพื่อให้สามารถปิดงานก่อสร้างได้ตามกำหนด กรย.(ก3) จึงขอนำส่งคืนพัสดุรื้อถอน (ส่งคืนชำรุด)',

  items: [
    {
      id: 'scrap-1',
      materialCode: '1-00-002-0102',
      description: 'เสาคอนกรีต คอร. ขนาด 14.30 เมตร',
      quantity: 1,
      unit: 'ต้น',
      actionMethod: 'ตัดเป็นท่อน',
      remarks: 'ตัดเป็นท่อน'
    },
    {
      id: 'scrap-2',
      materialCode: '1-00-001-0006',
      description: 'เสาคอนกรีต คอร. ขนาด 14 เมตร',
      quantity: 89,
      unit: 'ต้น',
      actionMethod: 'ตัดเป็นท่อน',
      remarks: 'ตัดเป็นท่อน'
    },
    {
      id: 'scrap-3',
      materialCode: '1-00-001-0004',
      description: 'เสาคอนกรีต คอร. ขนาด 12 เมตร',
      quantity: 24,
      unit: 'ต้น',
      actionMethod: 'ตัดเป็นท่อน',
      remarks: 'ตัดเป็นท่อน'
    },
    {
      id: 'scrap-4',
      materialCode: '1-00-001-0002',
      description: 'เสาคอนกรีต คอร. ขนาด 9 เมตร',
      quantity: 3,
      unit: 'ต้น',
      actionMethod: 'ตัดเป็นท่อน',
      remarks: 'ตัดเป็นท่อน'
    },
    {
      id: 'scrap-5',
      materialCode: '1-00-006-0102',
      description: 'เสาตอม่อ คอร. ขนาด 0.30x0.30 เมตร ยาว 4.50 เมตร',
      quantity: 19,
      unit: 'ต้น',
      actionMethod: 'ทุบทำลาย',
      remarks: 'ทุบทำลาย'
    },
    {
      id: 'scrap-6',
      materialCode: '1-00-006-0201',
      description: 'เสาตอม่อ คอร. ขนาด 0.35x0.35 เมตร ยาว 4.50 เมตร',
      quantity: 83,
      unit: 'ต้น',
      actionMethod: 'ทุบทำลาย',
      remarks: 'ทุบทำลาย'
    }
  ],

  proposerName: 'นายพิสันติ์ จิตต์ปลื้ม',
  proposerPosition: 'หผ.กร.กรย.(ก3)',

  approverOrderNote: 'เรียน ผจก.กฟจ.นฐ. ผจก.กฟส.กพส.\nอนุมัติ และแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',
  approverName: 'นายอนันต์ กาญจนอุปถัมภ์',
  approverPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)',
  approverDate: '8 ต.ค. 69',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3',
  contactPhone: '10171',

  hasRoutingStamps: true,
  stampCpKrDate: '8 ต.ค. 69',

  isThaiNumerals: false,
};

/**
 * แม่แบบที่ 2: สามชุก (สะพานลอย ม.ราชมงคลสุวรรณภูมิ)
 */
export const SAMPLE_PRESET_SAMCHUK_SCRAP: DemolishScrapFormData = {
  docFrom: 'ผกร.กรย.(ก3)',
  docTo: 'กรย.(ก3)',
  docNo: 'ก.3 กรย.(กร) 1712/2569',
  docDate: '15 ต.ค. 2569',
  subject: 'ขอส่งคืนพัสดุรื้อถอน ประเภทเสา คอร., และเสาตอม่อ คอร. หักชำรุดและทุบทำลาย งานย้ายแนวระบบสายส่ง 115 เควี หลบสะพานลอย ม.ราชมงคลสุวรรณภูมิ สุพรรณบุรี',
  salutation: 'อก.รย.(ก3) ผ่าน รก.รย.(ก3)',

  refDocNo: 'ก.3 สช.(ปร) 1040/2569',
  refDocDate: '17 กันยายน 2569',
  projectName: 'งานก่อสร้างย้ายแนวระบบสายส่ง 115 เควี หลบสะพานลอยหน้า ม.ราชมงคลสุวรรณภูมิศูนย์สุพรรณบุรี จ.สุพรรณบุรี',
  wbsNumber: 'I-69-I-SMG69.M4.1116',

  distanceFromRoad: '15 เมตร',
  warehouseLocation: 'คลังพัสดุ กฟส.สามชุก',
  justificationReason: 'เนื่องจากสภาพหน้างานแนวสายส่งติดสิ่งปลูกสร้างสะพานลอยและมีสายสื่อสารจำนวนมาก ไม่สามารถถอนเสา คอร. 22 เมตร และ 14 เมตร ขึ้นเต็มต้นได้ จำเป็นต้องตัดเป็นท่อนเพื่อความปลอดภัยในการปฏิบัติงาน และเสาตอม่อ คอร. 0.90x2.20x2.30 เมตร เป็นการรื้อถอนแบบทุบทำลายหน้างาน ไม่สามารถนำส่งคืนคลังพัสดุได้',

  items: [
    {
      id: 'sc-1',
      materialCode: '1-00-001-0016',
      description: 'เสาคอนกรีต คอร. ขนาด 22 เมตร',
      quantity: 4,
      unit: 'ต้น',
      actionMethod: 'ตัดเป็นท่อน',
      remarks: 'ตัดเป็นท่อน'
    },
    {
      id: 'sc-2',
      materialCode: '1-00-001-0006',
      description: 'เสาคอนกรีต คอร. ขนาด 14 เมตร',
      quantity: 12,
      unit: 'ต้น',
      actionMethod: 'ตัดเป็นท่อน',
      remarks: 'ตัดเป็นท่อน'
    },
    {
      id: 'sc-3',
      materialCode: '1-00-005-0013',
      description: 'เสาตอม่อ คอร. CONC. FOOTING 0.90x2.20x2.30 M.',
      quantity: 4,
      unit: 'ตัว',
      actionMethod: 'ทุบทำลาย',
      remarks: 'ทุบทำลาย'
    }
  ],

  proposerName: 'นายพิสันติ์ จิตต์ปลื้ม',
  proposerPosition: 'หผ.กร.กรย.(ก3)',

  approverOrderNote: 'เรียน ผจก.กฟส.สามชุก\nอนุมัติ และแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',
  approverName: 'นายกำพล ตุ้ยเต็มวงค์',
  approverPosition: 'อก.รย.(ก3)',
  approverDate: '15 ต.ค. 69',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3',
  contactPhone: '10171',

  hasRoutingStamps: true,
  stampCpKrDate: '15 ต.ค. 69',

  isThaiNumerals: false,
};

/**
 * สร้าง HTML สำหรับเปิดใน Microsoft Word (.doc) หรือ Copy Clipboard
 */
export function generateDemolishScrapWordHtml(data: DemolishScrapFormData): string {
  const isThai = data.isThaiNumerals;
  const tn = (val: string | number | undefined | null) => isThai ? toThaiNumerals(val) : (val?.toString() || '');

  const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>บันทึกข้อความขอส่งคืนพัสดุรื้อถอนแบบทำลาย</title>
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
    .memo-table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
    .memo-table th, .memo-table td {
      border: 1pt solid #000;
      padding: 5pt 8pt;
      font-size: 15pt;
      vertical-align: middle;
    }
    .memo-table th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
    .text-center { text-align: center; }
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

  <!-- วรรคที่ ๑: โครงการ & อ้างถึง -->
  <p class="indent">
    ด้วย ${data.docFrom} ได้ดำเนินการ${data.projectName} ตามหนังสือเลขที่ ${tn(data.refDocNo)} ลงวันที่ ${tn(data.refDocDate)} ตามหมายเลข (WBS) : ${tn(data.wbsNumber)} ซึ่งปัจจุบันได้ดำเนินการก่อสร้างแล้วเสร็จ และ อยู่ระหว่างการจัดทำเอกสารเพื่อปิด กส. นั้น
  </p>

  <!-- วรรคที่ ๒: สภาพปัญหาหน้างาน & วิธีการรื้อถอน -->
  <p class="indent">
    ปัจจุบัน ${data.docFrom} ได้ตรวจสอบพบว่า ${data.justificationReason} ตามรายละเอียดดังนี้
  </p>

  <!-- ตารางรายการพัสดุรื้อถอน -->
  <table class="memo-table">
    <thead>
      <tr>
        <th style="width: 25%;">รหัสพัสดุ</th>
        <th style="width: 47%;">รายการ</th>
        <th style="width: 13%;">จำนวน</th>
        <th style="width: 15%;">หมายเหตุ</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map((item) => `
      <tr>
        <td class="text-center">${tn(item.materialCode)}</td>
        <td>${item.description}</td>
        <td class="text-center">${tn(item.quantity)} ${item.unit}</td>
        <td class="text-center">${item.actionMethod || item.remarks || '-'}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <p class="indent">
    จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
  </p>

  <!-- ผู้เสนอลงนาม (หผ.กร.) -->
  <table style="width: 100%; margin-top: 25pt;">
    <tr>
      <td style="width: 45%;"></td>
      <td style="width: 55%; text-align: center;">
        <br><br>
        (${data.proposerName})<br>
        ${data.proposerPosition}
      </td>
    </tr>
  </table>

  <!-- คำสั่งการอนุมัติของ อก.รย. (ท้ายบันทึก) -->
  <div style="margin-top: 35pt; border-top: 1pt solid #000; padding-top: 15pt;">
    <p style="font-size: 15pt; white-space: pre-line; margin-bottom: 20pt;">
      ${data.approverOrderNote}
    </p>

    <table style="width: 100%;">
      <tr>
        <td style="width: 45%;"></td>
        <td style="width: 55%; text-align: center;">
          <br>
          (${data.approverName})<br>
          ${data.approverPosition}<br>
          ${tn(data.approverDate)}
        </td>
      </tr>
    </table>
  </div>

  <!-- ข้อมูลท้ายกระดาษ -->
  <table style="width: 100%; margin-top: 40pt; font-size: 13pt;">
    <tr>
      <td style="width: 60%; vertical-align: bottom;">
        ${data.contactDepartment}<br>
        โทรศัพท์ ${tn(data.contactPhone)}
      </td>
      <td style="width: 40%; text-align: right; vertical-align: bottom;">
        ชผ.กร.(ก3) ลงชื่อ ................... วันที่ ${tn(data.stampCpKrDate)}
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  return html.trim();
}

/**
 * ดาวน์โหลดเอกสารเป็นไฟล์ Word (.doc)
 */
export function downloadDemolishScrapWordDocument(data: DemolishScrapFormData): void {
  const htmlContent = generateDemolishScrapWordHtml(data);
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `บันทึกขอส่งคืนพัสดุรื้อถอนแบบทำลาย_${data.wbsNumber || 'โครงการ'}_${Date.now()}.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * คัดลอกตารางและข้อความแบบ Rich HTML เพื่อนำไปวางลงใน Microsoft Word โดยตรง
 */
export async function copyFormattedDemolishScrapWord(data: DemolishScrapFormData): Promise<boolean> {
  const htmlContent = generateDemolishScrapWordHtml(data);
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
      const textBlob = new Blob([generateDemolishScrapPlainText(data)], { type: 'text/plain' });
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob,
        })
      ]);
      return true;
    } else {
      await navigator.clipboard.writeText(generateDemolishScrapPlainText(data));
      return true;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    try {
      await navigator.clipboard.writeText(generateDemolishScrapPlainText(data));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * สร้าง Plain Text สำหรับแชร์ใน LINE หรืออีเมล
 */
export function generateDemolishScrapPlainText(data: DemolishScrapFormData): string {
  let text = `📋 บันทึกข้อความ: ${data.subject}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `ที่: ${data.docNo}    วันที่: ${data.docDate}\n`;
  text += `จาก: ${data.docFrom}    ถึง: ${data.docTo} (${data.salutation})\n`;
  text += `เรื่อง: ${data.subject}\n\n`;

  text += `📌 โครงการและ WBS:\n`;
  text += `งาน: ${data.projectName}\n`;
  text += `WBS: ${data.wbsNumber}\n`;
  text += `อ้างถึง: หนังสือเลขที่ ${data.refDocNo} ลงวันที่ ${data.refDocDate}\n\n`;

  text += `📦 รายการพัสดุรื้อถอน (ตัดเป็นท่อน / ทุบทำลาย):\n`;
  data.items.forEach((item, idx) => {
    text += `  ${idx + 1}. [${item.materialCode}] ${item.description} จำนวน ${item.quantity} ${item.unit} (${item.actionMethod})\n`;
  });
  text += `\n`;

  text += `ผู้เสนอ: ${data.proposerName} (${data.proposerPosition})\n`;
  text += `ผู้อนุมัติ: ${data.approverName} (${data.approverPosition})\n`;
  text += `คำสั่งการ: ${data.approverOrderNote.replace(/\n/g, ' ')}\n`;

  return text;
}
