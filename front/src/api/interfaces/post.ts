export interface PostStats {
  total_posts: number;
  total_new_posts_since: number;
  engagement_rate: number;
  interaction_per_post: number;
  category_counts: Record<string, number>;
}

export interface Post {
  id: number;
  created_at: string;
  title: string;
  content: string;
  category: string;
  view_count: number;
  save_count: number;
  comment_count: number;
  like_count: number;
  id_account: number;
  creator: string;
  creator_id: number;
  photos?: string[];
  ads_id: number | null;
}

export interface PostsListPagination {
  posts: Post[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}

export interface PostComment {
  id: number;
  content: string;
  created_at: string;
  like_count: number;
  id_post: number;
  id_account: number;
  user_name: string;
  user_avatar: string;
  is_deleted: boolean;
}

export interface PostCommentsResponse {
  total_comments: number;
  comments: PostComment[];
  current_page: number;
  last_page: number;
  limit: number;
}
