import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type {
  Post,
  PostCommentsResponse,
  PostsListPagination,
  PostStats,
} from "./interfaces/post";

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

export const GetPostComments = async (
  id_post: number,
  page?: number,
  limit?: number,
): Promise<PostCommentsResponse> => {
  const response = await api.get(ENDPOINTS.ADMIN.POSTS.COMMENTS(id_post), {
    params: { page, limit },
  });
  return response.data;
};

export const DeleteComment = async (id_comment: number) => {
  const response = await api.delete(
    ENDPOINTS.ADMIN.POSTS.DELETE_COMMENT(id_comment),
  );
  return response.data;
};
