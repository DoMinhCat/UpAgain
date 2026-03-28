import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreatePost,
  DeletePost,
  GetAllPosts,
  GetPostDetails,
  GetPostsStats,
  UpdatePost,
} from "../api/admin/postModule";
import type { PostsListPagination } from "../api/interfaces/post";

const STALE_TIME = 60 * 1000;

export const useGetPostsStats = () => {
  return useQuery({
    queryKey: ["postStats"],
    queryFn: GetPostsStats,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error fetching post stats",
      errorMessage: "Failed to fetch post stats",
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CreatePost,
    meta: {
      errorTitle: "Error creating post",
      errorMessage: "Failed to create post",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useGetAllPosts = (
  page?: number,
  limit?: number,
  search?: string,
  category?: string,
  sort?: string,
) => {
  return useQuery<PostsListPagination>({
    queryKey: ["posts", page, limit, search, category, sort],
    queryFn: () => GetAllPosts(page, limit, search, category, sort),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "Error",
      errorMessage: "Failed to fetch posts.",
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_post: number) => DeletePost(id_post),
    meta: {
      errorTitle: "Error deleting post",
      errorMessage: "Failed to delete post",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useGetPostDetails = (id_post: number, isValidId: boolean) => {
  return useQuery({
    queryKey: ["postDetails", id_post],
    queryFn: () => GetPostDetails(id_post),
    staleTime: STALE_TIME,
    enabled: isValidId,
    meta: {
      errorTitle: "Error fetching post details",
      errorMessage: "Failed to fetch post details",
    },
  });
};

export const useUpdatePost = (id_post: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => UpdatePost(id_post, payload),
    meta: {
      errorTitle: "Error updating post",
      errorMessage: "Failed to update post",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postDetails", id_post] });
    },
  });
};
