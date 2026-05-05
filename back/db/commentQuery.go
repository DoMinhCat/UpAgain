package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
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

func CreateComment(id_post int, id_account int, content string) (models.Comment, error) {
	var comment models.Comment
	query := `INSERT INTO comments (content, id_post, id_account) VALUES ($1, $2, $3) RETURNING id, content, created_at, like_count, id_post, id_account;`
	err := utils.Conn.QueryRow(query, content, id_post, id_account).Scan(&comment.Id, &comment.Content, &comment.CreatedAt, &comment.LikeCount, &comment.IdPost, &comment.IdAccount)
	if err != nil {
		return models.Comment{}, fmt.Errorf("CreateComment() failed: '%v'", err)
	}
	return comment, nil
}

func DeleteCommentById(id int) error {
	query := `update comments set is_deleted = true where id = $1;`
	_, err := utils.Conn.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
