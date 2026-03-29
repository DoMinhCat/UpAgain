package models

import (
	"time"
)

type Comment struct {
	Id        int       `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	LikeCount int       `json:"like_count"`
	IdPost    int       `json:"id_post"`
	IdAccount int       `json:"id_account"`
	Avatar    string    `json:"user_avatar"`
	UserName  string    `json:"user_name"`
	IsDeleted bool      `json:"is_deleted"`
}

type PostCommentsResponse struct {
	TotalComments int       `json:"total_comments"`
	Comments      []Comment `json:"comments"`
	CurrentPage   int       `json:"current_page"`
	LastPage      int       `json:"last_page"`
	Limit         int       `json:"limit"`
}
