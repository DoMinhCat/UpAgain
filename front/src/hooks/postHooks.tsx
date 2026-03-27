import { useQuery, useMutation } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { CreatePost, GetPostsStats } from "../api/admin/postModule";

export const useGetPostsStats = () => {
  return useQuery({
    queryKey: ["postStats"],
    queryFn: GetPostsStats,
    meta: {
      errorTitle: "Error fetching post stats",
      errorMessage: "Failed to fetch post stats",
    },
  });
};

export const useCreatePost = () => {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: CreatePost,
    meta: {
      errorTitle: "Error creating post",
      errorMessage: "Failed to create post",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats"] });
      // TODO: anything else to invalidate? all posts?
    },
  });
};
