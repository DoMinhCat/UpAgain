import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";
import type { PostStats } from "../interfaces/post";

export const GetPostsStats = async (): Promise<PostStats> => {
  const response = await api.get(ENDPOINTS.ADMIN.POSTS.STATS);
  return response.data;
};

export const CreatePost = async (payload: FormData) => {
  const response = await api.post(ENDPOINTS.ADMIN.POSTS.ALL, payload);
  return response.data;
};
