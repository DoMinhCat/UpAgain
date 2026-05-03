package db

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"slices"
)

func GetSavedPosts(idAccount int, page int, limit int, category string) (models.PostListPagination, error) {
	result := models.PostListPagination{}
	if !slices.Contains(PostCategories, category) && category != ""{
		return result, fmt.Errorf("GetSavedPosts() failed: invalid category '%v'", category)
	}
	var posts []models.Post

	var params []interface{}
	params = append(params, idAccount)
	whereClause := " WHERE sp.id_account = $1"

	if category != ""{
		whereClause +=  " AND p.category = $2"
		params = append(params, category)
	}

	query := fmt.Sprintf(`
		SELECT p.id, p.created_at, p.title, p.content, p.category, p.view_count, p.like_count, p.id_account, a.username
		FROM saved_posts sp
		JOIN posts p ON sp.id_post = p.id
		JOIN accounts a ON p.id_account=a.id 
		%v
		ORDER BY p.created_at DESC
	`, whereClause)
	rows, err := utils.Conn.Query(query, params...)
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

	queryCount := fmt.Sprintf(`
	SELECT COUNT(*) as count 
	FROM saved_posts sp 
	JOIN posts p on p.id = sp.id_post
	%v`, whereClause)
	row := utils.Conn.QueryRow(queryCount, params...)
	if err := row.Scan(&result.TotalRecords); err != nil {
		return result, fmt.Errorf("GetSavedPosts() scan failed: '%v'", err)
	}

	result.Posts = posts
	return result, nil
}