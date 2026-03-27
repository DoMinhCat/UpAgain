import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreatePost,
  DeletePost,
  GetAllPosts,
  GetPostsStats,
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
