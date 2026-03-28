export interface PostStats {
  total_posts: number;
  total_new_posts_since: number;
  engagement_rate: number;
  pending: number;
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
  photos?: string[];
}

export interface PostsListPagination {
  posts: Post[];
  current_page: number;
  last_page: number;
  limit: number;
  total_records: number;
}
