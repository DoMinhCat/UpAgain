export interface CreateAdsRequest {
  id_post: number;
  from: Date;
  duration: number;
}

export interface UpdateAdsRequest {
  from: Date;
  to: Date;
}
