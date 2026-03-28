import { api } from "../axios";
import { ENDPOINTS } from "../endpoints";
import type { Post, PostsListPagination, PostStats } from "../interfaces/post";

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

export const DeletePost = async (id_post: number) => {
  const response = await api.patch(ENDPOINTS.ADMIN.POSTS.DELETE(id_post));
  return response.data;
};

export const GetPostDetails = async (id_post: number): Promise<Post> => {
  const response = await api.get(ENDPOINTS.ADMIN.POSTS.DETAILS(id_post));
  return response.data;
};

export const UpdatePost = async (id_post: number, payload: FormData) => {
  const response = await api.put(
    ENDPOINTS.ADMIN.POSTS.UPDATE(id_post),
    payload,
  );
  return response.data;
};
