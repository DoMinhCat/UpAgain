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
	_, err := utils.Conn.Exec(query, content, id_post, id_account)
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

func CheckCommentExistsById(id_comment int) (bool, error) {
	var exist bool
	query := `SELECT EXISTS(SELECT 1 FROM comments c WHERE c.id = $1);`
	err := utils.Conn.QueryRow(query, id_comment).Scan(&exist)
	if err != nil {
		return false, err
	}
	return exist, nil
}

func IsCommentLikedByUser(id_comment int, id_account int) (bool, error) {
	var exists bool
	err := utils.Conn.QueryRow(`SELECT EXISTS(SELECT 1 FROM liked_comments WHERE id_comment = $1 AND id_account = $2);`, id_comment, id_account).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("IsCommentLikedByUser() failed: '%v'", err)
	}
	return exists, nil
}

func ToggleLikeComment(id_comment int, id_account int) (bool, error) {
	liked, err := IsCommentLikedByUser(id_comment, id_account)
	if err != nil {
		return false, err
	}
	if liked {
		_, err = utils.Conn.Exec(`DELETE FROM liked_comments WHERE id_comment = $1 AND id_account = $2;`, id_comment, id_account)
		if err != nil {
			return false, fmt.Errorf("ToggleLikeComment() delete failed: '%v'", err)
		}
		_, err = utils.Conn.Exec(`UPDATE comments SET like_count = like_count - 1 WHERE id = $1;`, id_comment)
		if err != nil {
			return false, fmt.Errorf("ToggleLikeComment() decrement failed: '%v'", err)
		}
		return false, nil
	}
	_, err = utils.Conn.Exec(`INSERT INTO liked_comments (id_account, id_comment) VALUES ($1, $2);`, id_account, id_comment)
	if err != nil {
		return false, fmt.Errorf("ToggleLikeComment() insert failed: '%v'", err)
	}
	_, err = utils.Conn.Exec(`UPDATE comments SET like_count = like_count + 1 WHERE id = $1;`, id_comment)
	if err != nil {
		return false, fmt.Errorf("ToggleLikeComment() increment failed: '%v'", err)
	}
	return true, nil
}

func GetCommentDetails(id_comment int) (models.Comment, error) {
	var comment models.Comment
	query := `SELECT c.id, c.content, c.created_at, c.like_count, c.id_post, c.id_account 
	FROM comments c WHERE c.id = $1 AND is_deleted=false;`
	err := utils.Conn.QueryRow(query, id_comment).Scan(&comment.Id, &comment.Content, &comment.CreatedAt, &comment.LikeCount, &comment.IdPost, &comment.IdAccount)
	if err != nil {
		return models.Comment{}, fmt.Errorf("GetCommentDetails() failed: '%v'", err)
	}
	return comment, nil
}
