package db

import (
	"backend/models"
	"backend/utils"
)

func GetPostCommentsById(id int) ([]models.Comment, error) {
	query := `
		SELECT c.id, c.content, c.created_at, c.like_count, c.id_post, c.id_account, c.is_deleted
		FROM comments c
		WHERE 
			c.id_post = $1
			AND c.is_deleted = false
		ORDER BY 
			c.created_at DESC
	`

	rows, err := utils.Conn.Query(query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var comment models.Comment
		if err := rows.Scan(&comment.Id, &comment.Content, &comment.CreatedAt, &comment.LikeCount, &comment.IdPost, &comment.IdAccount, &comment.IsDeleted); err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}