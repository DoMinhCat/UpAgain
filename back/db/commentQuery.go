package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
)

func GetPostCommentsByPostId(id int, page int, limit int) ([]models.Comment, error) {
	query := `
		SELECT c.id, c.content, c.created_at, c.like_count, c.id_post, c.id_account, c.is_deleted
		FROM comments c
		WHERE 
			c.id_post = $1
			AND c.is_deleted = false
		ORDER BY 
			c.created_at DESC
	`

	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += " LIMIT $2 OFFSET $3"
		rows, err := utils.Conn.Query(query, id, limit, offset)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		return scanComments(rows)
	}

	rows, err := utils.Conn.Query(query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanComments(rows)
}

func scanComments(rows *sql.Rows) ([]models.Comment, error) {
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

func GetTotalCommentsByPostId(id int) (int, error) {
	var total int
	query := `select count(*) from comments c where c.id_post = $1 and c.is_deleted = false;`
	err := utils.Conn.QueryRow(query, id).Scan(&total)
	if err != nil {
		return 0, err
	}
	return total, nil
}

func DeleteCommentById(id int) error {
	query := `update comments c set c.is_deleted = true where c.id = $1;`
	_, err := utils.Conn.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
