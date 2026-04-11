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
}
