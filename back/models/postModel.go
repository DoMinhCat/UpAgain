package models

import (
	"time"
)

type PostCountStatsResponse struct {
	TotalPosts         int            `json:"total_posts"`
	TotalNewPostsSince int            `json:"total_new_posts_since"`
	EngagementRate     float64        `json:"engagement_rate"`
	InteractionPerPost float64        `json:"interaction_per_post"`
	CategoryCounts     map[string]int `json:"category_counts"`
}

type CreatePostRequest struct {
	Title     string
	Content   string
	Category  string
	Image     []string
	CreatorId int
}

type Post struct {
	Id           int       `json:"id"`
	CreatedAt    time.Time `json:"created_at"`
	Title        string    `json:"title"`
	Content      string    `json:"content"`
	Category     string    `json:"category"`
	ViewCount    int       `json:"view_count"`
	LikeCount    int       `json:"like_count"`
	SaveCount    int       `json:"save_count"`
	CommentCount int       `json:"comment_count"`
	IdAccount    int       `json:"id_account"`
	Creator      string    `json:"creator"`
	CreatorId    int       `json:"creator_id"`
	Photos       []string  `json:"photos"`
}

type PostListPagination struct {
	Posts        []Post `json:"posts"`
	CurrentPage  int    `json:"current_page"`
	LastPage     int    `json:"last_page"`
	Limit        int    `json:"limit"`
	TotalRecords int    `json:"total_records"`
}

type PostFilters struct {
	Search   string `json:"search"`
	Sort     string `json:"sort"`
	Category string `json:"category"`
}
