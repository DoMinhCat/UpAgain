package models

// "time"

type PostCountStatsResponse struct {
	TotalPosts         int     `json:"total_posts"`
	TotalNewPostsSince int     `json:"total_new_posts_since"`
	EngagementRate     float64 `json:"engagement_rate"`
	Pending            int     `json:"pending"`
}

type CreatePostRequest struct {
	Title string
	Content string
	Category string
	Image []string
	CreatorId int
}