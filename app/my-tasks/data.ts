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
}

export const mockTasks: Task[] = [
  {
    id: 'T-001',
    title: 'ตรวจตู้ควบคุมไฟฟ้า อาคาร B',
    location: 'อาคาร B สำนักงานใหญ่',
    time: 'วันนี้ 10:00 น.',
    status: 'not_started',
    priority: 'normal',
    isTracked: false,
    type: 'maintenance',
  },
  {
    id: 'T-002',
    title: 'สำรวจแนวสายไฟฟ้า',
    location: 'ถนนสุขุมวิทซอย 12',
    time: 'วันนี้ 14:00 น.',
    status: 'in_progress',
    priority: 'normal',
    isTracked: false,
    type: 'survey',
  },
  {
    id: 'T-003',
    title: 'ตรวจสอบหม้อแปลง',
    location: 'หมู่บ้านเพชรเกษม',
    time: 'วันนี้ 16:00 น.',
    status: 'not_started',
    priority: 'normal',
    isTracked: false,
    type: 'inspection',
  },
  {
    id: 'T-004',
    title: 'แก้ไขระบบไฟฟ้า อาคาร B',
    location: 'อาคาร B สำนักงานใหญ่',
    time: 'ครบกำหนด วันนี้ 17:00 น.',
    status: 'in_progress',
    priority: 'high',
    isTracked: true,
    type: 'maintenance',
  },
  {
    id: 'T-005',
    title: 'จัดทำรายงานประจำเดือน',
    location: 'สำนักงานเขต',
    time: 'ครบกำหนด วันนี้ 17:00 น.',
    status: 'waiting_for_review',
    priority: 'urgent',
    isTracked: true,
    type: 'other',
  },
];
