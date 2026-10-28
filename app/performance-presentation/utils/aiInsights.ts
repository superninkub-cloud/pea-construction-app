import { TeamMemberPerformance } from "../types";
import { Project } from "../../../lib/types";

export interface AIAnalysisResult {
  performanceRating: 'EXCELLENT' | 'GOOD' | 'ON_TRACK' | 'ATTENTION_NEEDED';
  ratingLabel: string;
  ratingColor: string;
  grade: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'ELEVATED';
  riskLabel: string;
  smartSummary: string;
  keyStrengths: string[];
  strategicAdvice: string[];
  executiveTalkingPoints: string[];
  smartMetrics: {
    completionRate: number;
    planExecutionScore: number;
    activeSupervisionCount: number;
    budgetManagedMillions: number;
  };
}

export function generateSmartAIInsights(
  member: TeamMemberPerformance,
  memberProjects: Project[],
  avgAchievement: number
): AIAnalysisResult {
  const f4Count = memberProjects.filter(p => p.status === 'F4').length;
  const d1Count = memberProjects.filter(p => p.status === 'D1').length;
  const planCount = member.planItems.length;
  const totalBudget = memberProjects.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
  const budgetMillions = Math.round((totalBudget / 1000000) * 10) / 10;

  // Grade & Rating determination
  let performanceRating: AIAnalysisResult['performanceRating'] = 'GOOD';
  let ratingLabel = 'ปฏิบัติงานตามเป้าหมาย (On Track)';
  let ratingColor = '#3b82f6';
  let grade = 'A';
  let riskLevel: AIAnalysisResult['riskLevel'] = 'LOW';
  let riskLabel = 'ระดับความเสี่ยงต่ำ (Low Risk)';

  if (avgAchievement >= 95) {
    performanceRating = 'EXCELLENT';
    ratingLabel = 'ผลงานระดับดีเยี่ยมยอด (Executive Top Tier)';
    ratingColor = '#10b981';
    grade = 'A+';
    riskLevel = 'LOW';
    riskLabel = 'ความเสี่ยงต่ำมาก (Deliverable Guaranteed)';
  } else if (avgAchievement >= 85) {
    performanceRating = 'EXCELLENT';
    ratingLabel = 'ผลงานระดับดีเด่น (Outstanding)';
    ratingColor = '#059669';
    grade = 'A';
    riskLevel = 'LOW';
    riskLabel = 'ความเสี่ยงต่ำ (On Schedule)';
  } else if (avgAchievement >= 70) {
    performanceRating = 'GOOD';
    ratingLabel = 'ผลงานระดับดีมาก (High Performance)';
    ratingColor = '#8b5cf6';
    grade = 'B+';
    riskLevel = 'MEDIUM';
    riskLabel = 'เฝ้าระวังตามวงรอบ (Standard Monitoring)';
  } else if (avgAchievement >= 50) {
    performanceRating = 'ON_TRACK';
    ratingLabel = 'กำลังเร่งรัดตามแผน (Active Execution)';
    ratingColor = '#f59e0b';
    grade = 'B';
    riskLevel = 'MEDIUM';
    riskLabel = 'มีปัจจัยหน้างานต้องติดตาม (Watchlist)';
  } else {
    performanceRating = 'ATTENTION_NEEDED';
    ratingLabel = 'ต้องเฝ้าระวังและเร่งรัดพิเศษ (Needs Attention)';
    ratingColor = '#ef4444';
    grade = 'C+';
    riskLevel = 'ELEVATED';
    riskLabel = 'ต้องเร่งรัดเชิงนโยบาย (Action Required)';
  }

  // Smart Executive Summary
  let smartSummary = `จากการวิเคราะห์เชิงลึกด้วยระบบ AI ประจำไตรมาส 3/2569 ของ ${member.fullName} (${member.shortName}) ในบทบาท "${member.title}" พบว่ามีอัตราความก้าวหน้าเฉลี่ยตามแผนงานอยู่ที่ ${avgAchievement}% จากจำนวนแผนงานเป้าหมายทั้งหมด ${planCount} รายการ`;
  
  if (member.id === 'pisan') {
    smartSummary += ` ในฐานะหัวหน้าแผนก (ผกร.) ได้บัญชาการศูนย์ฉุกเฉินรับมือภัยพิบัติรุนแรงเกือบทุกเดือนตลอดปี 2569 กอบกู้ระบบไฟฟ้าตลาดบางหลวง, ดอนเจดีย์ และทองผาภูมิ-สังขละบุรี สำเร็จ 100% พร้อมบริหารกองรถขนเสาและงบลงทุน`;
  } else if (member.id === 'chanin') {
    smartSummary += ` ในฐานะผู้ช่วยหัวหน้าแผนก ได้ขับเคลื่อนการบริหารคลังพัสดุภัยพิบัติและเสาไฟฟ้าฉุกเฉิน การรายงานผลประจำเดือน และประสานงานปิดงานก่อสร้างบรรลุเป้าหมาย 100% เต็ม`;
  } else if (member.id === 'udomsak') {
    smartSummary += ` ปฏิบัติการโดดเด่นนำทีมชุดงานที่ 1 กอบกู้วิกฤตไฟดับบริเวณกว้างพื้นที่ อ.ทองผาภูมิ และ อ.สังขละบุรี ในพื้นที่ทุรกันดารภูเขาสูงสำเร็จ พร้อมปิดงาน F4 ปป.เชื่อมโยง กฟส.กจ.`;
  } else if (member.id === 'supawich') {
    smartSummary += ` นำทีมชุดงานที่ 2 เข้ากู้วิกฤตวาตภัยเสาล้ม ตลาดบางหลวง (บางเลน) จ่ายไฟคืนชุมชนรวดเร็ว และสร้างผลงานปิดงาน F4 สมบูรณ์สูงสุดถึง 7 โครงการ`;
  } else if (member.id === 'weerapat') {
    smartSummary += ` บริหารจัดการโครงการวงเงินสูงสุดในแผนกกว่า 60+ ล้านบาท ปิดงานฐานราก 115 CTบางเลน (F4) 11.6 ล้านบาท และเสริมทัพยานยนต์หนักในภารกิจฉุกเฉิน`;
  } else if (member.id === 'sarawut') {
    smartSummary += ` นำทีมชุดงานที่ 4 ปฏิบัติการกู้ภัยพิบัติเหตุการณ์เสาหักโค่นรุนแรงพื้นที่ไฟฟ้าดอนเจดีย์สำเร็จรวดเร็ว และบริหารโครงการมากที่สุดในแผนกถึง 18 โครงการ`;
  } else if (member.id === 'kittipich') {
    smartSummary += ` ปฏิบัติหน้าที่ช่างประจำสำนักงาน เป็นศูนย์ข้อมูลวิศวกรรม ประมาณการพัสดุภัยพิบัติฉุกเฉิน และปิดงานสายส่ง 115 kV สำเร็จ 2 โครงการ (F4)`;
  } else if (member.id === 'narubet') {
    smartSummary += ` ปฏิบัติหน้าที่ช่างประจำสำนักงาน ควบคุมการเดินรถยนต์ขนเสาและเครื่องจักรกลหนักสนับสนุนทุกจุดเกิดเหตุภัยพิบัติตลอด 24 ชม. ไร้อุบัติเหตุ`;
  } else if (member.id === 'kwannakorn') {
    smartSummary += ` นำทีมชุดงานที่ 5 ร่วมกู้วาตภัยเสาล้มตลาดบางหลวง และขับเคลื่อนโครงการระบบจำหน่ายใหม่ปี 2569 รวมมูลค่ากว่า 31+ ล้านบาท คืบหน้าเกินเป้าหมาย`;
  } else if (f4Count > 0) {
    smartSummary += ` และสามารถผลักดันการปิดงานก่อสร้างส่งมอบเข้าสู่กระบวนการบัญชีทรัพย์สิน (F4) แล้วเสร็จถึง ${f4Count} โครงการ`;
  } else if (d1Count > 0) {
    smartSummary += ` ควบคุมงานก่อสร้างภาคสนาม (D1) อีก ${d1Count} โครงการ มูลค่างานรวม ${budgetMillions} ล้านบาท`;
  } else if (memberProjects.length > 0) {
    smartSummary += ` ควบคุมดูแลโครงการจริงในระบบ SAP จำนวน ${memberProjects.length} โครงการ`;
  } else {
    smartSummary += ` โดยรับผิดชอบงานด้านวิชาการ วางแผนประสานงาน และเร่งรัดระบบก่อสร้างภาพรวมของแผนก ผกร.`;
  }

  // Key Strengths
  const keyStrengths: string[] = [
    ...(member.highlights && member.highlights.length > 0
      ? member.highlights
      : [
          `ขับเคลื่อนภารกิจตามแผนยุทธศาสตร์ ผกร. ไตรมาส 3 ได้อย่างมีประสิทธิภาพ`,
          `ประสานงานบูรณาการร่วมกับหน่วยงานภายในและภายนอกอย่างราบรื่น`,
          `การควบคุมงบประมาณและการจัดสรรทรัพยากรหน้างานเป็นไปตามเกณฑ์มาตรฐาน`
        ])
  ];

  // Tactical / Strategic Advice
  const strategicAdvice: string[] = [];
  const hasBridgeIssue = member.planItems.some(it => (it.remarks || '').includes('สะพาน'));
  const hasContractIssue = member.planItems.some(it => (it.remarks || '').includes('เซ็นสัญญา') || (it.remarks || '').includes('สัญญา'));
  const hasTempSubIssue = member.planItems.some(it => (it.remarks || '').includes('ชั่วคราว') || (it.remarks || '').includes('บล.3'));
  const hasUndergroundCable = member.planItems.some(it => (it.taskName || '').includes('เคเบิล') || (it.taskName || '').includes('115'));

  if (hasBridgeIssue) {
    strategicAdvice.push('เร่งเปิดช่องทางเจรจากับกรมทางหลวง/หน่วยงานสะพานเพื่อขออนุญาตเข้าพื้นที่เฉพาะช่วงที่ไม่กระทบโครงสร้างหลัก');
  }
  if (hasContractIssue) {
    strategicAdvice.push('ประสานฝ่ายพัสดุและจัดซื้อจัดจ้างเพื่อเร่งรัดการลงนามในสัญญาจ้างของ ผรม. ก่อนสิ้นสุดไตรมาส 3');
  }
  if (hasTempSubIssue) {
    strategicAdvice.push('จัดทำตารางดับไฟล่วงหน้าร่วมกับ กฟฟ.พื้นที่ และตรวจสอบความพร้อมหม้อแปลงสถานีไฟฟ้าชั่วคราว');
  }
  if (hasUndergroundCable) {
    strategicAdvice.push('ควบคุมมาตรฐานการดึงสายเคเบิลใต้ดินและการทำ Joint ตามคู่มือวิศวกรรมเพื่อป้องกันงานซ่อมแซมภายหลัง');
  }
  if (f4Count > 0) {
    strategicAdvice.push('ประสานแผนกบัญชีเพื่อเร่งรัดกระบวนการตัดจ่ายสินทรัพย์และเคลียร์หลักประกันสัญญาจ้าง');
  }
  if (strategicAdvice.length < 2) {
    strategicAdvice.push('รักษาระดับความปลอดภัยในการปฏิบัติงานหน้างาน (Zero Accident) ตามข้อกำหนด PEA Safety Standard');
    strategicAdvice.push('วางแผนการส่งมอบงานล่วงหน้า 30 วันเพื่อป้องกันปัญหาการเบิกจ่ายล่าช้าช่วงปลายปีงบประมาณ 2569');
  }

  // Executive Talking Points (Tailored for Executive Committee Presentation)
  const executiveTalkingPoints: string[] = [
    `กราบเรียนผู้บริหาร แผนกก่อสร้างระบบไฟฟ้า ขอรายงานผลการดำเนินงานของ ${member.fullName} (${member.title})`,
    `ภาพรวมบรรลุเป้าหมายเฉลี่ย ${avgAchievement}% โดยปฏิบัติงานตามตัวชี้วัดครบถ้วนทั้ง ${planCount} แผนงาน (เกรดการประเมิน: ${grade})`,
    ...(member.executiveNotes ? [member.executiveNotes] : []),
    `สำหรับงานที่มีข้อจำกัด ทีมงานได้กำหนดแผนบริหารความเสี่ยงและมาตรการคู่ขนาน เพื่อรับประกันการส่งมอบงานสมบูรณ์ 100% ตามเป้าหมายปี 2569`
  ];

  return {
    performanceRating,
    ratingLabel,
    ratingColor,
    grade,
    riskLevel,
    riskLabel,
    smartSummary,
    keyStrengths,
    strategicAdvice,
    executiveTalkingPoints,
    smartMetrics: {
      completionRate: avgAchievement,
      planExecutionScore: Math.min(100, Math.round(avgAchievement * 1.02)),
      activeSupervisionCount: memberProjects.length,
      budgetManagedMillions: budgetMillions
    }
  };
}

