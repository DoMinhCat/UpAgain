import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type {
  AddCommentPayload,
  AddCommentResponse,
  Post,
  PostCommentsResponse,
  PostsListPagination,
  PostStats,
} from "./interfaces/post";
import type { Step } from "./interfaces/step";

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

export const GetProjectStepsByPostId = async (
  id_post: number,
): Promise<Step[]> => {
  const response = await api.get(ENDPOINTS.ADMIN.POSTS.STEPS(id_post));
  return response.data;
};

export const DeleteProjectStep = async (id_step: number) => {
  const response = await api.delete(ENDPOINTS.ADMIN.POSTS.DELETE_STEP(id_step));
  return response.data;
};

// --- User-facing post actions ---

export const GetUserPosts = async (
  page?: number,
  limit?: number,
  category?: string,
  sort?: string,
): Promise<PostsListPagination> => {
  const response = await api.get(ENDPOINTS.USER.POSTS.ALL, {
    params: { page, limit, category, sort },
  });
  return response.data;
};

export const GetUserPostDetails = async (id_post: number): Promise<Post> => {
  const response = await api.get(ENDPOINTS.USER.POSTS.DETAILS(id_post));
  return response.data;
};

export const GetUserPostComments = async (
  id_post: number,
  page?: number,
  limit?: number,
): Promise<PostCommentsResponse> => {
  const response = await api.get(ENDPOINTS.USER.POSTS.COMMENTS(id_post), {
    params: { page, limit },
  });
  return response.data;
};

export const LikePost = async (id_post: number) => {
  const response = await api.post(ENDPOINTS.USER.POSTS.LIKE(id_post));
  return response.data;
};

export const SavePost = async (id_post: number) => {
  const response = await api.post(ENDPOINTS.USER.POSTS.SAVE(id_post));
  return response.data;
};

export const IncrementPostView = async (id_post: number) => {
  const response = await api.post(ENDPOINTS.USER.POSTS.VIEW(id_post));
  return response.data;
};

export const AddComment = async (
  id_post: number,
  payload: AddCommentPayload,
): Promise<AddCommentResponse> => {
  const response = await api.post(
    ENDPOINTS.USER.POSTS.ADD_COMMENT(id_post),
    payload,
  );
  return response.data;
};

export const LikeComment = async (id_comment: number) => {
  const response = await api.post(
    ENDPOINTS.USER.POSTS.LIKE_COMMENT(id_comment),
  );
  return response.data;
};
