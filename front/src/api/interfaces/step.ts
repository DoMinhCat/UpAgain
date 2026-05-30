interface StepItem {
  id: number;
  title: string;
}

export interface Step {
  id: number;
  id_post: number;
  title: string;
  description: string;
  created_at: string;
  photos: string[];
  items: StepItem[];
  order: number;
}

export interface UpdateStepPayload {
  id_post: number;
  title: string;
  description: string;
  item_ids: number[];
  images: string[];
  prev_step_id?: number | null;
  next_step_id?: number | null;
}
