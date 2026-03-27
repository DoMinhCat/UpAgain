import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";
import type { PostsListPagination, PostStats } from "../interfaces/post";

export const GetPostsStats = async (): Promise<PostStats> => {
  const response = await api.get(ENDPOINTS.ADMIN.POSTS.STATS);
  return response.data;
};

export const CreatePost = async (payload: FormData) => {
  const response = await api.post(ENDPOINTS.ADMIN.POSTS.ALL, payload);
  return response.data;
};

export const GetAllPosts = async (
  page?: number,
  limit?: number,
  search?: string,
  category?: string,
  sort?: string,
): Promise<PostsListPagination> => {
  const response = await api.get(ENDPOINTS.ADMIN.POSTS.ALL, {
    params: { page, limit, search, category, sort },
  });
  return response.data;
};
