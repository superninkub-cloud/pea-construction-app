export interface EstimationItem {
  code: string;
  name: string;
  unit: string;
  qty: number;
}

export interface Assembly {
  assemblyName: string;
  items: EstimationItem[];
}

export interface SavedEstimation {
  id?: string;
  pole_name: string;
  assembly_type: string;
  items: EstimationItem[];
  created_at?: string;
  user_id?: string;
}
