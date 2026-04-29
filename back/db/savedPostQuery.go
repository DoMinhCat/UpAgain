package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
)

func GetSavedPosts(idAccount int, page int, limit int) (models.PostListPagination, error) {
	result := models.PostListPagination{}
	var posts []models.Post
	query := `
		SELECT p.id, p.created_at, p.title, p.content, p.category, p.view_count, p.like_count, p.id_account, a.username
		FROM saved_posts sp
		JOIN posts p ON sp.id_post = p.id
		JOIN accounts a ON p.id_account=a.id 
		WHERE sp.id_account = $1
		ORDER BY sp.created_at DESC
	`
	rows, err := utils.Conn.Query(query, idAccount)
	if err != nil {
		return result, fmt.Errorf("GetSavedPosts() failed: '%v'", err)
	}
	defer rows.Close()
	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.Id, &post.CreatedAt, &post.Title, &post.Content, &post.Category, &post.ViewCount, &post.LikeCount, &post.IdAccount, &post.Creator)
		if err != nil {
			return result, fmt.Errorf("GetSavedPosts() scan failed: '%v'", err)
		}
		photos, err := GetPhotosPathsByObjectId(post.Id, "post")
		if err != nil {
			return result, fmt.Errorf("GetSavedPosts() failed: '%v'", err)
		}
		post.Photos = photos
		posts = append(posts, post)
	}

	queryCount := `SELECT COUNT(*) as count FROM saved_posts WHERE id_account = $1`
	row := utils.Conn.QueryRow(queryCount, idAccount)
	if err := row.Scan(&result.TotalRecords); err != nil {
		return result, fmt.Errorf("GetSavedPosts() scan failed: '%v'", err)
	}

	result.Posts = posts
	return result, nil
}