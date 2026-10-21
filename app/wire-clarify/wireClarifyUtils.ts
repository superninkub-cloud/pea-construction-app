// app/wire-clarify/wireClarifyUtils.ts
/**
 * Utility functions, types, and document generators for Wire Return Clarification Program
 * (โปรแกรมชี้แจงส่งคืนเศษสายไม่ครบ 100%)
 * PEA Construction Department (ผกร.กรย.กฟก.3)
 */

export interface WireItem {
  id: string;
  wireType: string;             // ชนิดสาย เช่น เศษสายอลูมิเนียมแกนเหล็ก, เศษสายเคเบิลอากาศ SAC
  estimatedKg: number;          // ประมาณการส่งคืน (KG)
  actualKg: number;             // จำนวนส่งคืน (KG)
  remarks?: string;             // หมายเหตุเพิ่มเติม (ถ้ามี)
}

export type DocLevelType = 'division_memo' | 'supervisor_report';

export interface WireClarifyFormData {
  // เอกสารระดับ: กอง กรย. ขออนุมัติ ผวบ. หรือ ผู้ควบคุมงาน รายงาน ผกร.
  docLevel: DocLevelType;

  // ข้อมูลทั่วไปของโครงการ
  wbsNo: string;                // หมายเลขงาน WBS เช่น P-TDD02.3-I-LYAIA.0016
  projectName: string;          // ชื่องาน เช่น ปรับปรุงระบบจำหน่าย ๒๒ เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง ๒ อ.ศรีสวัสดิ์ จ.กาญจนบุรี
  approvalDocRef: string;       // หนังสืออนุมัติงาน เช่น ก.๓ กวว.(วร) ๑๘๔๗/๒๕๖๗ ลงวันที่ ๑๖ สิงหาคม ๒๕๖๗
  networkNo: string;            // หมายเลขโครงข่าย เช่น โครงข่ายรื้อถอนแรงสูงภายนอก ๖๐๐๑๓๘๑๔๗๘
  
  // ข้อมูลส่วนหัวหนังสือ (บันทึกข้อความ)
  docFrom: string;              // จาก เช่น กรย.(ก๓) หรือ พชง.ผู้ควบคุมงาน (อุดมศักดิ์)
  docTo: string;                // ถึง เช่น ผวบ.(ก๓) หรือ ผกร.กรย.(ก๓)
  docNo: string;                // เลขที่หนังสือ (เว้นว่างไว้ตามที่ผู้ใช้ร้องขอ)
  docDate: string;              // วันที่ (เว้นว่างไว้ตามที่ผู้ใช้ร้องขอ)
  subject: string;              // เรื่อง
  salutation: string;           // เรียน เช่น อผ.วบ.(ก๓) ผ่าน รผ.วบ.(ก๓) หรือ ผห.กร.กรย.(ก๓) ผ่าน ชผ.กร.กรย.(ก๓)

  // เนื้อหาบันทึกข้อความ ๓ ตอน (แบบที่ ๑: บันทึกกอง กรย.)
  memoBackground: string;       // ๑. เรื่องเดิม
  memoFacts: string;            // ๒. ข้อเท็จจริง
  memoConsideration: string;    // ๓. ข้อพิจารณา
  memoClosing: string;          // ข้อความปิดท้าย

  // เนื้อหาบันทึกข้อความ (แบบที่ ๒: บันทึกผู้ควบคุมงาน)
  supervisorBody: string;       // เนื้อความรายงานของผู้ควบคุมงาน
  supervisorClosing: string;    // ข้อความปิดท้ายของผู้ควบคุมงาน

  // ผู้ควบคุมงาน
  supervisorName: string;       // นายอุดมศักดิ์ จันทร์กลิ่น
  supervisorPosition: string;   // พชง.๗ ผกร.กรย.(ก๓)

  // ผู้ลงนามหลัก (ผกร. หรือ รก.กรย.)
  signerName: string;           // นายอนันต์ กาญจนอุปถัมภ์
  signerTitle: string;          // รก.กรย.(ก๓) ปฏิบัติงานแทน อก.กรย.(ก๓)
  signerDate: string;           // วันที่กำกับลายเซ็น (เว้นว่างไว้ตามค่าเริ่มต้น)

  // เกษียน / ผู้ตรวจทาน / ผู้อนุมัติ
  headOfSectionName: string;    // นายชานินทร์ ศรีสวัสดิ์
  headOfSectionTitle: string;   // ชผ.กร.กรย.(ก๓) ปฏิบัติงานแทน ผห.กร.กรย.(ก๓)
  approverName: string;         // นายเมธี สุกก่ำ
  approverTitle: string;        // อผ.วบ.(ก๓)

  // ท้ายกระดาษ (Footer)
  contactDepartment: string;    // แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา
  contactPhone: string;         // ๑๐๓๙๑

  // รายการเศษสาย
  items: WireItem[];
}

/**
 * Common wire types used in PEA construction & dismantling
 */
export const POPULAR_WIRE_TYPES = [
  'เศษสายอลูมิเนียมแกนเหล็ก',
  'เศษสายอลูมิเนียมแกนเหล็กหุ้มฉนวน (PIC)',
  'เศษสายอลูมิเนียมตีเกลียวเปลือย (AAC)',
  'เศษสายเคเบิลอากาศ (Space Aerial Cable - SAC)',
  'เศษสายเคเบิลใต้ดิน (Underground XLPE Cable)',
  'เศษสายอลูมิเนียมหุ้มฉนวนแรงต่ำ (0.4 kV THW/ABC)',
  'เศษสายตัวนำทองแดงเปลือย (Bare Copper)',
  'เศษสายบริการ (Service Drop Cable)',
];

/**
 * Standard pre-filled sample matching the official scanned memo provided by user
 */
export const SAMPLE_WIRE_CLARIFY_DATA: WireClarifyFormData = {
  docLevel: 'division_memo',

  wbsNo: 'P-TDD02.3-I-LYAIA.0016',
  projectName: 'ปรับปรุงระบบจำหน่าย ๒๒ เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง ๒ อ.ศรีสวัสดิ์ จ.กาญจนบุรี',
  approvalDocRef: 'ก.๓ กวว.(วร) ๑๘๔๗/๒๕๖๗ ลงวันที่ ๑๖ สิงหาคม ๒๕๖๗',
  networkNo: 'โครงข่ายรื้อถอนแรงสูงภายนอก ๖๐๐๑๓๘๑๔๗๘',

  docFrom: 'กรย.(ก๓)',
  docTo: 'ผวบ.(ก๓)',
  docNo: '',                    // Blank by default as requested
  docDate: '',                  // Blank by default as requested
  subject: 'ขออนุมัตินำส่งคืนพัสดุชำรุดประเภทสายจากการรื้อถอนส่งคืนคลังไม่ครบตามประมาณการรื้อถอน',
  salutation: 'อผ.วบ.(ก๓) ผ่าน รผ.วบ.(ก๓)',

  // ๓ ตอนมาตรฐานตามเอกสารสแกนหน้า ๑
  memoBackground: 'ตามหนังสือที่ ก.๓ กวว.(วร) ๑๘๔๗/๒๕๖๗ ลงวันที่ ๑๖ สิงหาคม ๒๕๖๗ อนุมัติให้ปรับปรุงระบบจำหน่าย ๒๒ เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง ๒ อ.ศรีสวัสดิ์ จ.กาญจนบุรี หมายเลขงาน (WBS) : P-TDD02.3-I-LYAIA.0016 โดยมีนายอุดมศักดิ์ จันทร์กลิ่น พชง.๗ ผกร.กรย.(ก๓) เป็นผู้ควบคุมงาน นั้น',

  memoFacts: 'เนื่องจาก ผกร.กรย.(ก๓) มีแผนงานก่อสร้างปรับปรุงระบบจำหน่าย ๒๒ เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง ๒ อ.ศรีสวัสดิ์ จ.กาญจนบุรี ให้แล้วเสร็จโดยเร็ว ตามแผนงานที่กำหนด ทั้งนี้ปริมาณงานของงานก่อสร้าง มีปริมาณมากในการทำการรื้อถอนจะมีเศษสายบางส่วนที่จำเป็นต้องตัดทิ้งเป็น เศษสั้นๆ เช่น อุปกรณ์การเข้าปลายสาย อุปกรณ์ช่วงต่อสาย และอุปกรณ์ต่อแยกสาย เพื่อความสะดวกรวดเร็วในการรื้อถอน จึงทำให้ไม่สามารถส่งคืนพัสดุรื้อถอน ได้ครบตามประมาณการ',

  memoConsideration: 'กรย.(ก๓) พิจารณาแล้ว เนื่องจากต้องดำเนินการก่อสร้างภายใต้ระยะเวลาที่จำกัดเพื่อจ่ายไฟคืนให้กับผู้ใช้ไฟฟ้าภายในระยะเวลาที่กำหนด เพื่อสร้างความเชื่อมั่น สามารถปรับปรุงระบบจำหน่ายได้แล้วเสร็จตามที่แผนงานกำหนด และภาพลักษณ์ที่ดีของ กฟภ. โดย กรย.(ก๓) จึงขออนุมัตินำส่งคืนพัสดุรื้อถอนเศษสายชำรุดไม่ครบถ้วนตามประมาณการ โดยส่งคืนเท่าจำนวนที่สามารถรื้อถอนได้จริงตามสภาพหน้างาน ดังนี้ ทั้งนี้ ได้แนบเอกสารใบรับคืนและเอกสารส่งคืนของคณะกรรมการรื้อถอน มาด้วยแล้ว',

  memoClosing: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',

  // เนื้อหาสำหรับบันทึกผู้ควบคุมงาน (เอกสารสแกนหน้า ๒)
  supervisorBody: 'ด้วยข้าพเจ้าได้ดำเนินการงานก่อสร้างปรับปรุงระบบจำหน่าย ๒๒ เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง ๒ อ.ศรีสวัสดิ์ จ.กาญจนบุรี ปัจจุบันดำเนินการก่อสร้างแล้วเสร็จ ตามแผนงานที่กำหนด ทั้งนี้ปริมาณงานของงานก่อสร้าง มีปริมาณมากในการทำการรื้อถอนจะมีเศษสายบางส่วนที่จำเป็นต้องตัดทิ้งเป็น เศษสั้น ๆ เช่น อุปกรณ์การเข้าปลายสาย อุปกรณ์ช่วงต่อสาย และอุปกรณ์ต่อแยกสาย เพื่อความสะดวกรวดเร็วในการรื้อถอน โดยมีรายละเอียดการส่งคืนพัสดุรื้อถอนดังนี้',

  supervisorClosing: 'ทั้งนี้จึงขอรายงานผลการนำส่งคืนพัสดุชำรุดประเภทสายจากการรื้อถอนส่งคืนคลังไม่ครบตามประมาณการรื้อถอน เพื่อให้ส่วนเกี่ยวข้องช่วยพิจารณาดำเนินการต่อไป\n\nจึงเรียนมาเพื่อโปรดทราบและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',

  supervisorName: 'นายอุดมศักดิ์ จันทร์กลิ่น',
  supervisorPosition: 'พชง.๗ ผกร.กรย.(ก๓)',

  signerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  signerTitle: 'รก.กรย.(ก๓) ปฏิบัติงานแทน อก.กรย.(ก๓)',
  signerDate: '',

  headOfSectionName: 'นายชานินทร์ ศรีสวัสดิ์',
  headOfSectionTitle: 'ชผ.กร.กรย.(ก๓) ปฏิบัติงานแทน ผห.กร.กรย.(ก๓)',
  approverName: 'นายเมธี สุกก่ำ',
  approverTitle: 'อผ.วบ.(ก๓)',

  contactDepartment: 'แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา',
  contactPhone: '๑๐๓๙๑',

  items: [
    {
      id: 'wire-1',
      wireType: 'เศษสายอลูมิเนียมแกนเหล็ก',
      estimatedKg: 1121.13,
      actualKg: 1070.00,
      remarks: 'รื้อถอนตามสภาพหน้างานจริง'
    }
  ]
};

/**
 * Format currency or weights with commas and decimals
 */
export function formatKg(val: number | string | undefined | null, decimals: number = 2): string {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Calculate Percentage: (actual / estimated) * 100
 */
export function calculateWirePercent(actual: number, estimated: number): number {
  if (!estimated || estimated <= 0) return 0;
  return (actual / estimated) * 100;
}

/**
 * Format Percentage string (e.g. 95.44 %)
 */
export function formatPercent(val: number, decimals: number = 2): string {
  if (isNaN(val)) return '0.00 %';
  return `${val.toFixed(decimals)} %`;
}

/**
 * Convert Arabic digits to Thai digits (optional display)
 */
export function toThaiNum(str: string | number): string {
  if (str === undefined || str === null) return '';
  return str.toString().replace(/\d/g, (d) => '๐๑๒๓๔๕๖๗๘๙'[parseInt(d, 10)]);
}

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

  if (type === 'thai_num') {
    return `${toThaiNum(day)} ${monthNamesShort[now.getMonth()]} ${toThaiNum(shortYear)}`;
  }

  if (type === 'full') {
    return `${day} ${monthNamesFull[now.getMonth()]} ${yearBE}`;
  }

  return `${day} ${monthNamesShort[now.getMonth()]} ${shortYear}`;
}

// ============================================================================
// MICROSOFT WORD & EXCEL EXPORT / COPY GENERATORS
// ============================================================================

/**
 * Generate Plain Text for Memo (Optimized for quick pasting into Word)
 */
export function generateWireClarifyMemoPlainText(data: WireClarifyFormData): string {
  const totalEst = data.items.reduce((s, i) => s + (Number(i.estimatedKg) || 0), 0);
  const totalAct = data.items.reduce((s, i) => s + (Number(i.actualKg) || 0), 0);
  const totalPct = calculateWirePercent(totalAct, totalEst);

  const isDiv = data.docLevel === 'division_memo';

  let bodyText = '';
  if (isDiv) {
    bodyText = `๑. เรื่องเดิม
    ${data.memoBackground || ''}

๒. ข้อเท็จจริง
    ${data.memoFacts || ''}

๓. ข้อพิจารณา
    ${data.memoConsideration || ''}

    จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป`;
  } else {
    bodyText = `    ${data.supervisorBody || ''}
${data.networkNo ? `    ${data.networkNo}\n` : ''}
    ${data.supervisorClosing || ''}`;
  }

  const signerBlock = isDiv 
    ? `\n\n                                        (${data.signerName || ''})\n                             ${data.signerTitle || ''}\n                             ${data.signerDate || ''}`
    : `\n\n                                        (${data.supervisorName || ''})\n                             ${data.supervisorPosition || ''}`;

  return `การไฟฟ้าส่วนภูมิภาค
PROVINCIAL ELECTRICITY AUTHORITY

จาก: ${data.docFrom || ''}\t\tถึง: ${data.docTo || ''}
เลขที่: ${data.docNo || ''}\t\tวันที่: ${data.docDate || ''}
เรื่อง: ${data.subject || ''}
เรียน: ${data.salutation || ''}

${bodyText}
${signerBlock}
`;
}

/**
 * Generate Native HTML Table for pasting into Microsoft Word
 * Creates a clean 5-column table with borders and right-aligned weights and percentage
 */
export function generateWireClarifyTableHtmlForWord(data: WireClarifyFormData): string {
  const totalEst = data.items.reduce((s, i) => s + (Number(i.estimatedKg) || 0), 0);
  const totalAct = data.items.reduce((s, i) => s + (Number(i.actualKg) || 0), 0);
  const totalPct = calculateWirePercent(totalAct, totalEst);

  const rowsHtml = data.items.map((item, idx) => {
    const pct = calculateWirePercent(Number(item.actualKg) || 0, Number(item.estimatedKg) || 0);
    return `
      <tr>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid black;">${idx + 1}</td>
        <td style="text-align: left; padding: 6px 10px; border: 1px solid black;">${item.wireType || ''}</td>
        <td style="text-align: right; padding: 6px 10px; border: 1px solid black;">${formatKg(item.estimatedKg)}</td>
        <td style="text-align: right; padding: 6px 10px; border: 1px solid black;">${formatKg(item.actualKg)}</td>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid black; font-weight: bold;">${formatPercent(pct)}</td>
      </tr>
    `;
  }).join('');

  return `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: 'TH Sarabun New', 'Cordia New', sans-serif; font-size: 15pt; margin: 15px 0;">
      <thead>
        <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
          <th style="border: 1px solid black; width: 8%; text-align: center; padding: 6px;">ลำดับ</th>
          <th style="border: 1px solid black; width: 44%; text-align: center; padding: 6px;">ชนิดสาย</th>
          <th style="border: 1px solid black; width: 18%; text-align: center; padding: 6px;">ประมาณการส่งคืน (KG)</th>
          <th style="border: 1px solid black; width: 18%; text-align: center; padding: 6px;">จำนวนส่งคืน (KG)</th>
          <th style="border: 1px solid black; width: 12%; text-align: center; padding: 6px;">คิดเป็นเปอร์เซ็นต์</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr style="font-weight: bold; background-color: #f8fafc;">
          <td colspan="2" style="border: 1px solid black; text-align: center; padding: 6px;">รวม</td>
          <td style="border: 1px solid black; text-align: right; padding: 6px 10px;">${formatKg(totalEst)}</td>
          <td style="border: 1px solid black; text-align: right; padding: 6px 10px;">${formatKg(totalAct)}</td>
          <td style="border: 1px solid black; text-align: center; padding: 6px; color: #1e293b;">${formatPercent(totalPct)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

/**
 * Generate full HTML Document for downloading as Microsoft Word (.doc)
 */
export function generateWireClarifyWordDocument(data: WireClarifyFormData): string {
  const tableHtml = generateWireClarifyTableHtmlForWord(data);
  const isDiv = data.docLevel === 'division_memo';

  let bodyContent = '';
  if (isDiv) {
    bodyContent = `
      <p style="font-weight: bold; margin-top: 14pt;"><u>๑. เรื่องเดิม</u></p>
      <p style="text-indent: 40px; text-align: justify;">${data.memoBackground || ''}</p>

      <p style="font-weight: bold; margin-top: 14pt;"><u>๒. ข้อเท็จจริง</u></p>
      <p style="text-indent: 40px; text-align: justify;">${data.memoFacts || ''}</p>

      <p style="font-weight: bold; margin-top: 14pt;"><u>๓. ข้อพิจารณา</u></p>
      <p style="text-indent: 40px; text-align: justify;">${data.memoConsideration || ''}</p>

      ${tableHtml}

      <p style="text-indent: 40px; text-align: justify; margin-top: 12pt;">${data.memoClosing || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป'}</p>

      <div style="margin-top: 40px; margin-left: 50%; text-align: center;">
        <p style="margin-bottom: 25px;"><br/></p>
        <p>(${data.signerName || ''})</p>
        <p>${data.signerTitle || ''}</p>
        ${data.signerDate ? `<p>${data.signerDate}</p>` : ''}
      </div>

      <!-- Approver Endorsement Block -->
      <table style="width: 100%; border: none; margin-top: 50px; font-size: 14pt;">
        <tr>
          <td style="width: 50%; vertical-align: top; border: none;">
            <p><b>อก.บฟ.(ก๓)</b></p>
            <p style="margin-top: 8px;">อนุมัติ แจ้งส่วนเกี่ยวข้องดำเนินการต่อไป</p>
            <p style="margin-top: 35px;"><br/></p>
            <p>(${data.approverName || 'นายเมธี สุกก่ำ'})</p>
            <p>${data.approverTitle || 'อผ.วบ.(ก๓)'}</p>
          </td>
          <td style="width: 50%; vertical-align: top; border: none; text-align: right;">
            <p>ผห.กร.(ก๓) .............................. วันที่ ....../....../......</p>
            <p style="margin-top: 10px;">ชผ.กร.(ก๓) .............................. วันที่ ....../....../......</p>
          </td>
        </tr>
      </table>
    `;
  } else {
    bodyContent = `
      <p style="text-indent: 40px; text-align: justify;">${data.supervisorBody || ''}</p>
      ${data.networkNo ? `<p style="text-align: center; font-weight: bold; margin: 10pt 0;">${data.networkNo}</p>` : ''}

      ${tableHtml}

      <p style="text-indent: 40px; text-align: justify; margin-top: 12pt;">
        ทั้งนี้จึงขอรายงานผลการนำส่งคืนพัสดุชำรุดประเภทสายจากการรื้อถอนส่งคืนคลังไม่ครบตามประมาณการรื้อถอน เพื่อให้ส่วนเกี่ยวข้องช่วยพิจารณาดำเนินการต่อไป
      </p>
      <p style="text-indent: 40px; text-align: justify; margin-top: 6pt;">
        จึงเรียนมาเพื่อโปรดทราบและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
      </p>

      <div style="margin-top: 40px; margin-left: 50%; text-align: center;">
        <p style="margin-bottom: 25px;"><br/></p>
        <p>(${data.supervisorName || ''})</p>
        <p>${data.supervisorPosition || ''}</p>
      </div>

      <div style="margin-top: 40px; margin-left: 50%; text-align: center;">
        <p>ทราบ ดำเนินการต่อไป</p>
        <p style="margin-bottom: 25px;"><br/></p>
        <p>(${data.headOfSectionName || 'นายชานินทร์ ศรีสวัสดิ์'})</p>
        <p>${data.headOfSectionTitle || 'ชผ.กร. ปฏิบัติงานแทน ผห.กร.(ก๓)'}</p>
      </div>

      <div style="margin-top: 60px; font-size: 11pt; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 8px;">
        <p>${data.contactDepartment || 'แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา'}</p>
        <p>โทรศัพท์ ${data.contactPhone || '๑๐๓๙๑'}</p>
      </div>
    `;
  }

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>บันทึกชี้แจงส่งคืนเศษสายไม่ครบ</title>
      <style>
        body { font-family: 'TH Sarabun New', 'Cordia New', sans-serif; font-size: 16pt; line-height: 1.35; margin: 2cm; }
        p { margin: 4pt 0; text-align: justify; }
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

      ${bodyContent}
    </body>
    </html>
  `;
}

/**
 * Generate TSV for copying table into Microsoft Excel
 */
export function generateWireClarifyTsvForExcel(data: WireClarifyFormData): string {
  const header = ['ลำดับ', 'ชนิดสาย', 'ประมาณการส่งคืน (KG)', 'จำนวนส่งคืน (KG)', 'คิดเป็นเปอร์เซ็นต์ (%)'].join('\t');
  
  const rows = data.items.map((item, idx) => {
    const pct = calculateWirePercent(Number(item.actualKg) || 0, Number(item.estimatedKg) || 0);
    return [
      idx + 1,
      item.wireType,
      item.estimatedKg,
      item.actualKg,
      pct.toFixed(2)
    ].join('\t');
  }).join('\n');

  const totalEst = data.items.reduce((s, i) => s + (Number(i.estimatedKg) || 0), 0);
  const totalAct = data.items.reduce((s, i) => s + (Number(i.actualKg) || 0), 0);
  const totalPct = calculateWirePercent(totalAct, totalEst);

  const totalRow = ['รวม', '', totalEst, totalAct, totalPct.toFixed(2)].join('\t');

  return `${header}\n${rows}\n${totalRow}`;
}
