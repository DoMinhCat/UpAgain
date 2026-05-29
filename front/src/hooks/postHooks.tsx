import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AddComment,
  CreatePost,
  CreateProjectStep,
  DeleteComment,
  DeletePost,
  DeleteProjectStep,
  GetAllPosts,
  GetMyPosts,
  GetPostComments,
  GetPostDetails,
  GetPostsStats,
  GetProjectStepsByPostId,
  GetSavedPosts,
  GetUserPostComments,
  GetUserPostDetails,
  GetUserPosts,
  IncrementPostView,
  LikeComment,
  LikePost,
  SavePost,
  UpdatePost,
} from "../api/postModule";
import type {
  AddCommentPayload,
  PostsListPagination,
} from "../api/interfaces/post";
import { showSuccessNotification } from "../components/common/NotificationToast";

const STALE_TIME = 60 * 1000;

export const useGetPostsStats = () => {
  return useQuery({
    queryKey: ["postStats"],
    queryFn: GetPostsStats,
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_fetching_stats",
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CreatePost,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_creating_post",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
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
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_fetching_posts",
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_post: number) => DeletePost(id_post),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_deleting_post",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      showSuccessNotification(
        "community:notifications.delete_post_success_title",
        "community:notifications.delete_post_success_message",
      );
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
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_fetching_details",
    },
  });
};

export const useUpdatePost = (id_post: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => UpdatePost(id_post, payload),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_updating_post",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postDetails", id_post] });
      queryClient.invalidateQueries({ queryKey: ["userPostDetails", id_post] });

      queryClient.invalidateQueries({ queryKey: ["histories"] });
      showSuccessNotification(
        "community:notifications.update_post_success_title",
        "community:notifications.update_post_success_message",
      );
    },
  });
};

export const useGetPostComments = (
  id_post: number,
  isValidId: boolean,
  page?: number,
  limit?: number,
) => {
  return useQuery({
    queryKey: ["postComments", id_post, page, limit],
    queryFn: () => GetPostComments(id_post, page, limit),
    staleTime: STALE_TIME,
    enabled: isValidId,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_fetching_comments",
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_comment: number) => DeleteComment(id_comment),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_deleting_comment",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postComments"] });
      queryClient.invalidateQueries({ queryKey: ["userPostComments"] });
      queryClient.invalidateQueries({ queryKey: ["postDetails"] });
      queryClient.invalidateQueries({ queryKey: ["userPostDetails"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      showSuccessNotification(
        "community:notifications.delete_comment_success_title",
        "community:notifications.delete_comment_success_message",
      );
    },
  });
};

export const useGetProjectStepsByPostId = (
  id_post: number,
  isValidId: boolean,
) => {
  return useQuery({
    queryKey: ["projectSteps", id_post],
    queryFn: () => GetProjectStepsByPostId(id_post),
    staleTime: STALE_TIME,
    enabled: isValidId,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_fetching_steps",
    },
  });
};

export const useDeleteProjectStep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_step: number) => DeleteProjectStep(id_step),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_deleting_step",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectSteps"] });
      queryClient.invalidateQueries({ queryKey: ["postDetails"] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      showSuccessNotification(
        "community:notifications.delete_step_success_title",
        "community:notifications.delete_step_success_message",
      );
    },
  });
};

// --- User-facing hooks ---

export const useGetUserPosts = (
  page?: number,
  limit?: number,
  category?: string,
  sort?: string,
  search?: string,
) => {
  return useQuery<PostsListPagination>({
    queryKey: ["userPosts", page, limit, category, sort, search],
    queryFn: () => GetUserPosts(page, limit, category, sort, search),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_fetching_posts",
    },
  });
};

export const useGetUserPostDetails = (id_post: number, enabled: boolean) => {
  return useQuery({
    queryKey: ["userPostDetails", id_post],
    queryFn: () => GetUserPostDetails(id_post),
    staleTime: STALE_TIME,
    enabled,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_fetching_details",
    },
  });
};

export const useGetUserPostComments = (
  id_post: number,
  enabled: boolean,
  page?: number,
  limit?: number,
) => {
  return useQuery({
    queryKey: ["userPostComments", id_post, page, limit],
    queryFn: () => GetUserPostComments(id_post, page, limit),
    staleTime: STALE_TIME,
    enabled,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_fetching_comments",
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_post: number) => LikePost(id_post),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_liking_post",
    },
    onSuccess: (_, id_post) => {
      queryClient.invalidateQueries({ queryKey: ["userPostDetails", id_post] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_post: number) => SavePost(id_post),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_saving_post",
    },
    onSuccess: (_, id_post) => {
      queryClient.invalidateQueries({ queryKey: ["userPostDetails", id_post] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
    },
  });
};

export const useIncrementPostView = () => {
  return useMutation({
    mutationFn: (id_post: number) => IncrementPostView(id_post),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_tracking_view",
    },
  });
};

export const useAddComment = (id_post: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddCommentPayload) => AddComment(id_post, payload),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_posting_comment",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userPostComments", id_post],
      });
      queryClient.invalidateQueries({ queryKey: ["userPostDetails", id_post] });
    },
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_comment: number) => LikeComment(id_comment),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_liking_comment",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPostComments"] });
    },
  });
};

export const useGetSavedPosts = (
  page?: number,
  limit?: number,
  category?: string,
) => {
  return useQuery({
    queryKey: ["savedPosts", page, limit, category],
    queryFn: () => GetSavedPosts(page, limit, category),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_fetching_posts",
    },
  });
};

export const useGetMyPosts = (
  page?: number,
  limit?: number,
  category?: string,
) => {
  return useQuery({
    queryKey: ["myPosts", page, limit, category],
    queryFn: () => GetMyPosts(page, limit, category),
    staleTime: STALE_TIME,
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "community:notifications.error_fetching_posts",
    },
  });
};

export const useCreateProjectStep = (id_post: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => CreateProjectStep(id_post, payload),
    meta: {
      errorTitle: "common:notifications.error",
      errorMessage: "marketplace:my_item_detail.project_steps.notifications.error_creating",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectSteps", id_post] });
      queryClient.invalidateQueries({ queryKey: ["postDetails", id_post] });
      queryClient.invalidateQueries({ queryKey: ["userPostDetails", id_post] });
      showSuccessNotification(
        "marketplace:my_item_detail.project_steps.notifications.created_title",
        "marketplace:my_item_detail.project_steps.notifications.created_msg",
      );
    },
  });
};
