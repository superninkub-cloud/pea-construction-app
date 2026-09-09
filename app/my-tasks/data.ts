export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'waiting_for_review';
export type TaskPriority = 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  location: string;
  time: string;
  status: TaskStatus;
  priority: TaskPriority;
  isTracked: boolean;
  type: 'maintenance' | 'survey' | 'inspection' | 'other';
  assigneeName?: string;
}

export const mockTasks: Task[] = [
  {
    id: 'T-IMG2-001',
    title: 'ทำเอกสารจ้างโมโนโพล ประกาศจัดจ้าง',
    location: 'วันที่มอบหมาย 7 ก.ย. 69',
    time: '11 ก.ย. 69',
    status: 'in_progress',
    priority: 'normal',
    isTracked: true,
    type: 'other',
    assigneeName: 'กิตติพิชญ์ ประกอบทรัพย์ พชง.5'
  },
  {
    id: 'T-IMG2-002',
    title: 'จัดซื้อกรวยยาง กระบองไฟ เสื้อสะท้อนแสง ใบสั่งซื้อ',
    location: 'วันที่มอบหมาย 7 ก.ย. 69',
    time: '11 ก.ย. 69',
    status: 'in_progress',
    priority: 'normal',
    isTracked: true,
    type: 'other',
    assigneeName: 'กิตติพิชญ์ พุ่มกำพล พนง.Office'
  },
  {
    id: 'T-IMG2-003',
    title: 'จัดทำเอกสารปิดงานลาดหญ้า 2 งาน',
    location: 'วันที่มอบหมาย 8 ก.ย. 69',
    time: '11 ก.ย. 69',
    status: 'in_progress',
    priority: 'normal',
    isTracked: true,
    type: 'other',
    assigneeName: 'สิริวัชญ์ ภิรมย์มาก พนง.Office'
  }
];
