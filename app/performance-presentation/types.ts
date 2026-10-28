import { Project } from "../../lib/types";

export interface PlanTargetItem {
  id: string;
  orderNumber?: number;
  taskName: string;
  accumulatedPercent: number | null; // สะสม (ร้อยละ)
  targetPercent: number | null;      // เป้าหมาย/ตัวชี้วัด (ร้อยละ)
  remarks?: string;                  // หมายเหตุ
  connectedWbsList?: string[];       // WBS ของโครงการในระบบที่เชื่อมโยง
  category?: '115kv' | '22kv' | 'close_job' | 'office' | 'urgent' | 'general';
}

export interface MemberDisasterMission {
  roleTitle: string;        // บทบาทในภารกิจภัยพิบัติ & รถขนเสา
  incidentFocus: string;    // เหตุการณ์หลักที่รับผิดชอบ (บางหลวง / ดอนเจดีย์ / ทองผาภูมิ-สังขละบุรี / กองรถขนเสา)
  description: string;      // รายละเอียดผลการปฏิบัติการกู้ภัย
  fleetSupport?: string;    // ภารกิจกองยานยนต์ขนเสาและเครื่องจักรกลหนัก
  statusBadge: string;      // สถานะความสำเร็จ เช่น สำเร็จ 100% (Zero Accident)
}

export interface TeamMemberPerformance {
  id: string;
  order: number;
  fullName: string;
  shortName: string;
  title: string;
  position: string;
  teamName: string;
  teamType: 'leadership' | 'field_team' | 'coordination';
  imageUrl?: string;
  highlights: string[];
  challenges: string[];
  planItems: PlanTargetItem[];
  executiveNotes?: string;
  disasterMission?: MemberDisasterMission;
}

export interface ConnectedDBProjectSummary {
  totalCount: number;
  totalValue: number;
  f4Count: number;
  d1Count: number;
  year2569Count: number;
  projects: Project[];
}
