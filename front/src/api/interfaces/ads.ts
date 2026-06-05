export interface CreateAdsRequest {
  id_post: number;
  from: Date;
  duration: number;
  origin_url?: string;
  paid?: boolean;
}

export interface UpdateAdsRequest {
  from: Date;
  to: Date;
}
