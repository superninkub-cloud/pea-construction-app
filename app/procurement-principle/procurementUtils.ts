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
  docFrom: string;                  // จาก เช่น กรย.(ก๓)
  docTo: string;                    // ถึง เช่น ผวบ.(ก๓)
  docNo: string;                    // เลขที่หนังสือ (เว้นว่างไว้ตามค่าเริ่มต้น)
  docDate: string;                  // วันที่ (เว้นว่างไว้ตามค่าเริ่มต้น)
  subject: string;                  // เรื่อง
  salutation: string;               // เรียน เช่น อผ.วบ.(ก๓) ผ่าน รผ.วบ.(ก๓)

  // ข้อมูลโครงการ
  wbsNo: string;                    // หมายเลขงาน WBS เช่น I-69-I-PSCXX.19.3909 หรือ I-69-I-KCI69.M4.1114
  networkNo: string;                // โครงข่าย เช่น 7001210932 หรือ เว้นว่าง
  activityNo: string;               // กิจกรรม เช่น 0050 หรือ เว้นว่าง
  approvalDocRef: string;           // ตามอนุมัติเลขที่ เช่น ก.๓ กวว.(วร) ๓๓๒/๒๕๖๙ ลงวันที่ ๒๙ มกราคม ๒๕๖๙
  projectName: string;              // ชื่องาน เช่น แผนงานพาดเพิ่ม ๒๒ เควี รองรับสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม
  workOpenerName: string;           // ผู้เปิดงาน เช่น นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓) หรือ นายอุดมศักดิ์ จันทร์กลิ่น พชง.๗ ผกร.กรย.(ก๓)

  // รายละเอียดสิ่งของหรือบริการที่จัดซื้อ/จัดจ้าง
  itemDescription: string;          // เช่น ดอกสว่าน BDS HKK-N ๐๒๒ ดอกเจ็ทบอช ๒๒ mm. เจาะลึก ๓๐ mm. จำนวน ๒ ดอก หรือ รถแบคโฮหัวกระแทก PC ๕๕ จำนวน ๑ คัน
  targetDateOrPeriod: string;       // วันเวลาดำเนินการ เช่น ในวันจันทร์ที่ ๑๙ ตุลาคม ๒๕๖๙ หรือ ภายในกำหนดแผนงาน
  procurementMethod: string;        // วิธีจัดหา เช่น โดยวิธีเฉพาะเจาะจง

  // เนื้อหา ๓ ตอน
  backgroundText: string;           // ๑. เรื่องเดิม
  factsText: string;                // ๒. ข้อเท็จจริง (เหตุผลความจำเป็น)
  proposalText: string;             // ๓. ข้อเสนอเพื่อพิจารณา
  delegationOrderText: string;      // ข้อความคำสั่งมอบอำนาจ กฟภ.
  closingText: string;              // จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป

  // ผู้ลงนามหลัก
  signerName: string;               // นายกำพล ตุ้ยเต็มวงศ์ หรือ นายอนันต์ กาญจนอุปถัมภ์
  signerTitle: string;              // อก.รย.(ก๓) หรือ รก.กรย.(ก๓) ปฏิบัติงานแทน อก.กรย.(ก๓)
  signerDate: string;               // วันที่กำกับลายเซ็น (เว้นว่างไว้)

  // เกษียน / ผู้อนุมัติ
  approverName: string;             // นายเมธี สุกก่ำ
  approverTitle: string;            // อผ.วบ.(ก๓)
  approverDivisionText: string;     // อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง
}

/**
 * Standard PEA Delegation of Authority text
 */
export const DEFAULT_DELEGATION_ORDER = 
  'ตามคำสั่งการไฟฟ้าส่วนภูมิภาคที่ พ.(ม) ๒๘/๒๕๖๘ ลงวันที่ ๑๗ พฤศจิกายน ๒๕๖๘ ซึ่งมอบอำนาจให้ ผู้อำนวยการกอง หรือ ผู้รักษาการแทนตำแหน่งดังกล่าว เป็นผู้มีอำนาจดำเนินการอนุมัติสั่งซื้อ/สั่งจ้าง/สั่งเช่า โดยวิธีเฉพาะเจาะจง ในวงเงินครั้งหนึ่งไม่เกิน ๑,๐๐๐,๐๐๐.-บาท (หนึ่งล้านบาทถ้วน) ตามข้อ ๕.๓';

/**
 * Sample 1: ขออนุมัติหลักการจัดซื้อ (Purchasing Materials/Tools - matching Image 1)
 */
export const SAMPLE_BUY_DATA: ProcurementFormData = {
  procurementType: 'buy',

  docFrom: 'กรย.(ก๓)',
  docTo: 'ผวบ.(ก๓)',
  docNo: '',                        // Blank by default
  docDate: '',                      // Blank by default
  subject: 'ขออนุมัติหลักการจัดซื้อดอกสว่านสำหรับเจาะเหล็กดัดแปลงอุปกรณ์หัวเสา โดยวิธีเฉพาะเจาะจง',
  salutation: 'อผ.วบ.(ก๓) ผ่าน รผ.วบ.(ก๓)',

  wbsNo: 'I-69-I-PSCXX.19.3909',
  networkNo: '7001210932',
  activityNo: '0050',
  approvalDocRef: 'ก.๓ กวว.(วร) ๓๓๒/๒๕๖๙ ลงวันที่ ๒๙ มกราคม ๒๕๖๙',
  projectName: 'แผนงานพาดเพิ่ม ๒๒ เควี รองรับสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม',
  workOpenerName: 'นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓)',

  itemDescription: 'ดอกสว่าน BDS HKK-N ๐๒๒ ดอกเจ็ทบอช ๒๒ mm. เจาะลึก ๓๐ mm. จำนวน ๒ ดอก',
  targetDateOrPeriod: '',
  procurementMethod: 'โดยวิธีเฉพาะเจาะจง',

  backgroundText: 'ตามอนุมัติเลขที่ ก.๓ กวว.(วร) ๓๓๒/๒๕๖๙ ลงวันที่ ๒๙ มกราคม ๒๕๖๙ ด้วย กรย.(ก๓) มีแผนงานพาดเพิ่ม ๒๒ เควี รองรับสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม โดยมีนายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓) เป็นผู้เปิดงาน',

  factsText: `๒.๑ งานก่อสร้างดังกล่าวออกแบบให้ใช้เหล็กรางน้ำขนาด ๔.๕๐ เมตร ในการติดตั้งอุปกรณ์ประกอบหัวเสา ซึ่งการนำเหล็กรางน้ำไปใช้งานนั้น จำเป็นต้องเจาะรูเพื่อให้นำไปติดตั้งใช้งานได้\n๒.๒ ดอกสว่านที่ใช้งานร่วมกับสว่านไฟฟ้า ที่ ผกร.กรย.(ก๓) มีใช้งานอยู่ปัจจุบันมีสภาพชำรุดไม่สามารถใช้งานได้ จึงจำเป็นต้องจัดหาทดแทน`,

  proposalText: 'กรย.(ก๓) พิจารณาแล้ว เพื่อให้การก่อสร้างเป็นไปตามแผนงานและไม่กระทบงานก่อสร้างสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม เห็นควรให้อนุมัติจัดซื้อดอกสว่าน BDS HKK-N ๐๒๒ ดอกเจ็ทบอช ๒๒ mm. เจาะลึก ๓๐ mm. จำนวน ๒ ดอก โดยให้เบิกจ่ายจากหมายเลขงาน WBS: I-69-I-PSCXX.19.3909 โครงข่าย 7001210932 กิจกรรม 0050',

  delegationOrderText: DEFAULT_DELEGATION_ORDER,
  closingText: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',

  signerName: 'นายกำพล ตุ้ยเต็มวงศ์',
  signerTitle: 'อก.รย.(ก๓)',
  signerDate: '',

  approverName: 'นายเมธี สุกก่ำ',
  approverTitle: 'อผ.วบ.(ก๓)',
  approverDivisionText: 'อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง'
};

/**
 * Sample 2: ขออนุมัติหลักการจัดจ้าง (Hiring Machinery/Contractor - matching Image 2)
 */
export const SAMPLE_HIRE_DATA: ProcurementFormData = {
  procurementType: 'hire',

  docFrom: 'กรย.(ก๓)',
  docTo: 'ผวบ.(ก๓)',
  docNo: '',                        // Blank by default
  docDate: '',                      // Blank by default
  subject: 'ขออนุมัติหลักการจัดจ้างรถแบคโฮหัวกระแทก PC ๕๕ จำนวน ๑ คัน เพื่อเข้างานก่อสร้างงานย้ายแนวระบบสายส่ง ๑๑๕ kV. บริเวณตรงข้ามวัดท่าน้ำตื้นถึงเมืองไทยสินเชื่อเงินด่วน ต.ท่ามะขาม อ.เมือง จ.กาญจนบุรี',
  salutation: 'อผ.วบ.(ก๓) ผ่าน รผ.วบ.(ก๓)',

  wbsNo: 'I-69-I-KCI69.M4.1114',
  networkNo: '',
  activityNo: '',
  approvalDocRef: 'ก.๓ กวว.(ปร) ๖๑๔/๒๕๖๙ ลงวันที่ ๒๘ เมษายน ๒๕๖๙',
  projectName: 'งานก่อสร้างย้ายแนวระบบสายส่ง ๑๑๕ kV. บริเวณตรงข้ามวัดท่าน้ำตื้นถึงเมืองไทยสินเชื่อเงินด่วน ต.ท่ามะขาม อ.เมือง จ.กาญจนบุรี',
  workOpenerName: 'นายอุดมศักดิ์ จันทร์กลิ่น พชง.๗ ผกร.กรย.(ก๓)',

  itemDescription: 'รถแบคโฮหัวกระแทก PC ๕๕ จำนวน ๑ คัน',
  targetDateOrPeriod: 'ในวันจันทร์ที่ ๑๙ ตุลาคม ๒๕๖๙',
  procurementMethod: 'โดยวิธีเฉพาะเจาะจง',

  backgroundText: 'ตามอนุมัติเลขที่ ก.๓ กวว.(ปร) ๖๑๔/๒๕๖๙ ลงวันที่ ๒๘ เมษายน ๒๕๖๙ ด้วย กรย.(ก๓) มีแผนงานก่อสร้างย้ายแนวระบบสายส่ง ๑๑๕ kV. บริเวณตรงข้ามวัดท่าน้ำตื้นถึงเมืองไทยสินเชื่อเงินด่วน ต.ท่ามะขาม อ.เมือง จ.กาญจนบุรี โดยมีนายอุดมศักดิ์ จันทร์กลิ่น พชง.๗ ผกร.กรย.(ก๓) เป็นผู้เปิดงาน',

  factsText: 'ด้วย กรย.(ก๓) ได้ดำเนินการย้ายแนวระบบสายส่ง ๑๑๕ เควี บริเวณตรงข้ามวัดท่าน้ำตื้นถึง เมืองไทยสินเชื่อเงินด่วน แล้วเสร็จ ปัจจุบันยังคงเหลืองานรื้อถอนฐานรากชนิด F๒ จำนวน ๓ ฐาน และชนิด F๑/๑ จำนวน ๑ ฐาน ในการปฏิบัติงาน กรย.(ก๓) ไม่มีรถแบคโฮหัวกระแทก เพื่อให้งานรื้อถอนแล้วเสร็จตามแผนงานของกรมทางหลวง จำเป็นต้องดำเนินการโดยวิธีจ้างเหมาบุคคลภายนอกต่อไป เพื่อให้งานก่อสร้างย้ายแนวสายส่ง ๑๑๕ เควี แล้วเสร็จทันตามแผนงานและวันเวลาที่กำหนด จึงจัดจ้างรถแบคโฮหัวกระแทก PC ๕๕ จำนวน ๑ คัน ในวันจันทร์ที่ ๑๙ ตุลาคม ๒๕๖๙',

  proposalText: 'กรย.(ก๓) พิจารณาแล้ว เพื่อให้งานก่อสร้างย้ายแนวสายส่ง ๑๑๕ เควี เป็นไปด้วยความเรียบร้อย ในงานก่อสร้างย้ายแนวสายส่ง ๑๑๕ เควี ทันตามกำหนดตามแผนงานที่กำหนดไว้ จึงขออนุมัติหลักการจ้างรถแบคโฮหัวกระแทก PC ๕๕ จำนวน ๑ คัน ในวันจันทร์ที่ ๑๙ ตุลาคม ๒๕๖๙ โดยเบิกค่าใช้จ่ายจากงานก่อสร้างย้ายแนวระบบสายส่ง ๑๑๕ kV. บริเวณตรงข้ามวัดท่าน้ำตื้นถึงเมืองไทยสินเชื่อเงินด่วน ต.ท่ามะขาม อ.เมือง จ.กาญจนบุรี หมายเลขงาน WBS: I-69-I-KCI69.M4.1114',

  delegationOrderText: DEFAULT_DELEGATION_ORDER,
  closingText: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป',

  signerName: 'นายอนันต์ กาญจนอุปถัมภ์',
  signerTitle: 'รก.รย.(ก๓) ปฏิบัติงานแทน อก.รย.(ก๓)',
  signerDate: '',

  approverName: 'นายเมธี สุกก่ำ',
  approverTitle: 'อผ.วบ.(ก๓)',
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
  const proposalCombined = `${data.proposalText || ''}\n\n    ${data.delegationOrderText || ''}`;

  return `การไฟฟ้าส่วนภูมิภาค
PROVINCIAL ELECTRICITY AUTHORITY

จาก: ${data.docFrom || ''}\t\tถึง: ${data.docTo || ''}
เลขที่: ${data.docNo || ''}\t\tวันที่: ${data.docDate || ''}
เรื่อง: ${data.subject || ''}
เรียน: ${data.salutation || ''}

๑. เรื่องเดิม
    ${data.backgroundText || ''}

๒. ข้อเท็จจริง
    ${data.factsText || ''}

๓. ข้อเสนอเพื่อพิจารณา
    ${proposalCombined}

    ${data.closingText || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป'}



                                        (${data.signerName || ''})
                             ${data.signerTitle || ''}
                             ${data.signerDate || ''}


- ${data.docFrom || 'กรย.(ก๓)'}
  ${data.approverDivisionText || 'อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง'}


                                        (${data.approverName || 'นายเมธี สุกก่ำ'})
                             ${data.approverTitle || 'อผ.วบ.(ก๓)'}
`;
}

/**
 * Generate HTML Document for downloading as Microsoft Word (.doc)
 */
export function generateProcurementWordDocument(data: ProcurementFormData): string {
  const proposalCombined = `${data.proposalText || ''}<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${data.delegationOrderText || ''}`;

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${data.subject || 'บันทึกขออนุมัติหลักการจัดซื้อจัดจ้าง'}</title>
      <style>
        body { font-family: 'TH Sarabun New', 'Cordia New', 'Sarabun', sans-serif; font-size: 16pt; line-height: 1.35; margin: 2cm; }
        p { margin: 4pt 0; text-align: justify; }
        .indent { text-indent: 40px; text-align: justify; }
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
      <p style="font-weight: bold; margin-top: 14pt;"><u>๑. เรื่องเดิม</u></p>
      <p class="indent">${data.backgroundText || ''}</p>

      <p style="font-weight: bold; margin-top: 14pt;"><u>๒. ข้อเท็จจริง</u></p>
      <p class="indent" style="white-space: pre-wrap;">${data.factsText || ''}</p>

      <p style="font-weight: bold; margin-top: 14pt;"><u>๓. ข้อเสนอเพื่อพิจารณา</u></p>
      <p class="indent">${proposalCombined}</p>

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
            <p>- ${data.docFrom || 'กรย.(ก๓)'}</p>
            <p style="margin-top: 6px;">${data.approverDivisionText || 'อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง'}</p>
            <p style="margin-top: 35px;"><br/></p>
            <p>(${data.approverName || 'นายเมธี สุกก่ำ'})</p>
            <p>${data.approverTitle || 'อผ.วบ.(ก๓)'}</p>
          </td>
          <td style="width: 45%; vertical-align: top; border: none; text-align: right;">
            <p>รผ.วบ.(ก๓) .............................. วันที่ ....../....../......</p>
            <p style="margin-top: 10px;">ผห.กร.(ก๓) .............................. วันที่ ....../....../......</p>
            <p style="margin-top: 10px;">ชผ.กร.(ก๓) .............................. วันที่ ....../....../......</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
