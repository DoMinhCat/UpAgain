import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";
import type { PostStats } from "../interfaces/post";

export const GetPostsStats = async (): Promise<PostStats> => {
  const response = await api.get(ENDPOINTS.ADMIN.POSTS.STATS);
  return response.data;
};
