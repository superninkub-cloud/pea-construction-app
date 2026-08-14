export interface Project {
  id: string;
  wbs: string;
  name: string;
  supervisor: string;
  remarks: string;
  status: string;
  project_type: string;
  value: number;
  year_criteria: string;
  open_year: string;
  p_tracking: string;
  action_plan?: string;
  closing_plan?: string;
  construction_type?: string;
  step1_target?: number;
  step1_done?: number;
  step2_target?: number;
  step2_done?: number;
  step3_target?: number;
  step3_done?: number;
  step4_target?: number;
  step4_done?: number;
  step5_target?: number;
  step5_done?: number;
  step6_target?: number;
  step6_done?: number;
  manual_progress?: number;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  check4: boolean;
  check5: boolean;
  check6: boolean;
  check7: boolean;
  check8: boolean;
  image_url: string;
  updated_at?: string;
  scrap_wire_type?: string;
  scrap_wire_length?: number;
  scrap_returned_weight?: number;
  scrap_wires_data?: ScrapWireData[];
}

export interface ScrapWireData {
  id: string;
  type: string;
  length: number;
  returned_weight: number;
}

export interface Personnel {
  id: string;
  full_name: string;
  position: string;
  phone: string;
  team: string;
  image_url: string;
  created_at: string;
}
