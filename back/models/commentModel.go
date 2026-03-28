package models

import (
	"time"
)

type Comment struct {
	Id int `json:"id"`
	Content string `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	LikeCount int `json:"like_count"`
	IdPost int `json:"id_post"`
	IdAccount int `json:"id_account"`
	IsDeleted bool `json:"is_deleted"`
}