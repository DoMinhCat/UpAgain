package db

import (
	"backend/utils"
	"database/sql"
	"fmt"
	"time"
)

// if param category is nil => get all kind of category
func GetTotalPostsByIdAccountByCategory(id int, category *string) (int, error) {
	var total int
	param := ""
	if category != nil {
		switch *category {
		case "tutorial":
			param = " and category = 'tutorial'"
		case "project":
			param = " and category = 'project'"
		case "tips":
			param = " and category = 'tips'"
		case "news":
			param = " and category = 'news'"
		case "case_study":
			param = " and category = 'case_study'"
		case "other":
			param = " and category = 'other'"
		default:
			return 0, fmt.Errorf("GetTotalPostsByIdAccountByCategory() failed: invalid category '%v'", *category)
		}
	}

	query := `
		select count(*) from posts p
		where p.id_account = $1 and p.is_deleted = false
	`
	row := utils.Conn.QueryRow(query+param+";", id)
	err := row.Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalPostsByIdAccountByCategory() failed: '%v'", err)
	}

	return total, nil
}

func GetTotalPosts(is_deleted *bool) (int, error) {
	var total int
	var query string
	var err error

	if is_deleted != nil {
		query = `select count(*) from posts p where p.is_deleted = $1;`
		err = utils.Conn.QueryRow(query, *is_deleted).Scan(&total)
	} else {
		query = `select count(*) from posts p;`
		err = utils.Conn.QueryRow(query).Scan(&total)
	}
	
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, fmt.Errorf("GetTotalPosts() failed: '%v'", err)
	}
	return total, nil
}

func GetTotalNewPostsSince(since time.Time) (int, error) {
	var total int
	query := `
		select count(*) from posts p
		where p.is_deleted = false and p.created_at >= $1;
	`
	err := utils.Conn.QueryRow(query, since).Scan(&total)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, fmt.Errorf("GetTotalNewPostsSince() failed: '%v'", err)
	}
	return total, nil
}

// if id == nil then get total views across all posts
func TotalViewsByPostId(id *int) (int, error) {
	var total int
	var query string
	var err error

	if id != nil{
		query = `select view_count from posts p where p.is_deleted = false and p.id = $1;`
		err = utils.Conn.QueryRow(query, *id).Scan(&total)
	}else{
		query = `select COALESCE(sum(view_count), 0) from posts p where p.is_deleted = false;`
		err = utils.Conn.QueryRow(query).Scan(&total)
	}
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, fmt.Errorf("TotalViewsByPostId() failed: '%v'", err)
	}
	return total, nil
}

func TotalLikesByPostId(id *int) (int, error) {
	var total int
	var query string
	var err error

	if id != nil{
		query = `select like_count from posts p where p.is_deleted = false and p.id = $1;`
		err = utils.Conn.QueryRow(query, *id).Scan(&total)
	}else{
		query = `select COALESCE(sum(like_count), 0) from posts p where p.is_deleted = false;`
		err = utils.Conn.QueryRow(query).Scan(&total)
	}
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, fmt.Errorf("TotalLikesByPostId() failed: '%v'", err)
	}
	return total, nil
}

func TotalCommentsByPostId(id *int) (int, error) {
	var total int
	var query string
	var err error

	if id != nil{
		query = `select count(*) from comments c where c.is_deleted = false and c.id_post = $1;`
		err = utils.Conn.QueryRow(query, *id).Scan(&total)
	}else{
		query = `select count(*) from comments c where c.is_deleted = false;`
		err = utils.Conn.QueryRow(query).Scan(&total)
	}
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, fmt.Errorf("TotalCommentsByPostId() failed: '%v'", err)
	}
	return total, nil
}

func TotalSavesByPostId(id *int) (int, error) {
	var total int
	var query string
	var err error

	if id != nil{
		query = `select count(*) from saved_posts s where s.id_post = $1;`
		err = utils.Conn.QueryRow(query, *id).Scan(&total)
	}else{
		query = `select count(*) from saved_posts s;`
		err = utils.Conn.QueryRow(query).Scan(&total)
	}
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, fmt.Errorf("TotalSavesByPostId() failed: '%v'", err)
	}
	return total, nil
}