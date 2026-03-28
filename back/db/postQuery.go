package db

import (
	"backend/models"
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

// Posts don't require validation, therefore has no field 'status' in database
func CreatePost(payload models.CreatePostRequest) (int, error) {
	query := `
		insert into posts (title, content, category, id_account) values ($1, $2, $3, $4) returning id;
	`
	var idPost int
	err := utils.Conn.QueryRow(query, payload.Title, payload.Content, payload.Category, payload.CreatorId).Scan(&idPost)
	if err != nil {
		return 0, fmt.Errorf("CreatePost() failed: '%v'", err)
	}
	return idPost, nil
}

// get only posts that are not deleted
func GetAllPosts(page int, limit int, filters models.PostFilters) ([]models.Post, int, error) {
	var results []models.Post
	var params []interface{}
	var countParams []interface{}
	whereClause := "WHERE p.is_deleted = false"
	paramIndex := 1

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(" AND (p.title ILIKE $%d OR a.username ILIKE $%d OR CAST(p.id AS TEXT) ILIKE $%d)", paramIndex, paramIndex, paramIndex)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}

	if filters.Category != "" {
		whereClause += fmt.Sprintf(" AND p.category = $%d", paramIndex)
		params = append(params, filters.Category)
		countParams = append(countParams, filters.Category)
		paramIndex++
	}

	var totalRecords int
	countQuery := "SELECT COUNT(*) FROM posts p JOIN accounts a ON p.id_account=a.id " + whereClause
	err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords)
	if err != nil {
		return nil, 0, fmt.Errorf("GetAllPosts() count failed: %v", err)
	}

	orderBy := "ORDER BY p.id ASC" // Default sorting
	if filters.Sort != "" {
		switch filters.Sort {
		case "highest_view":
			orderBy = "ORDER BY p.view_count ASC"
		case "lowest_view":
			orderBy = "ORDER BY p.view_count DESC"
		case "most_recent_creation":
			orderBy = "ORDER BY p.created_at DESC"
		case "oldest_creation":
			orderBy = "ORDER BY p.created_at ASC"
		case "highest_like":
			orderBy = "ORDER BY p.like_count DESC"
		case "lowest_like":
			orderBy = "ORDER BY p.like_count ASC"
		default:
			orderBy = "ORDER BY p.id ASC"
		}
	}

	query := `
		SELECT p.id, p.created_at, p.title, p.content, p.category, p.view_count, p.like_count, p.id_account, a.username 
		FROM posts p 
		JOIN accounts a ON p.id_account=a.id 
		` + whereClause + " " + orderBy

	// pagination
	if limit != -1 && page != -1 {
		offset := (page - 1) * limit
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
		params = append(params, limit, offset)
	}

	rows, err := utils.Conn.Query(query, params...)

	if err != nil {
		return nil, 0, fmt.Errorf("GetAllPosts() query failed: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var event models.Post
		err := rows.Scan(&event.Id, &event.CreatedAt, &event.Title, &event.Content, &event.Category, &event.ViewCount, &event.LikeCount, &event.IdAccount, &event.Creator)
		if err != nil {
			return nil, 0, fmt.Errorf("GetAllPosts() scan failed: %v", err.Error())
		}
		results = append(results, event)
	}

	return results, totalRecords, nil
}

func DeletePostById(id int) error {
	query := `update posts p set is_deleted = true where p.id = $1;`
	_, err := utils.Conn.Exec(query, id)
	if err != nil {
		return fmt.Errorf("DeletePostById() failed: '%v'", err)
	}
	return nil
}

func CheckPostExistsById(id int) (bool, error) {
	var exists bool
	query := `select exists(select 1 from posts p where p.id = $1 and p.is_deleted = false);`
	err := utils.Conn.QueryRow(query, id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("CheckPostExistsById() failed: '%v'", err)
	}
	return exists, nil
}

func GetPostCreatorIdByPostId(id_post int) (int, error) {
	var id_account int
	query := `select p.id_account from posts p where p.id = $1 and p.is_deleted = false;`
	err := utils.Conn.QueryRow(query, id_post).Scan(&id_account)
	if err != nil {
		return 0, fmt.Errorf("GetPostCreatorIdByPostId() failed: '%v'", err)
	}
	return id_account, nil
}

func GetPostDetailsById(id int) (models.Post, error) {
	var post models.Post
	query := `select p.id, p.created_at, p.title, p.content, p.category, p.view_count, p.like_count, p.id_account, a.username from posts p join accounts a on p.id_account=a.id where p.id = $1 and p.is_deleted = false;`
	err := utils.Conn.QueryRow(query, id).Scan(&post.Id, &post.CreatedAt, &post.Title, &post.Content, &post.Category, &post.ViewCount, &post.LikeCount, &post.IdAccount, &post.Creator)
	if err != nil {
		return models.Post{}, fmt.Errorf("GetPostDetailsById() failed: '%v'", err)
	}

	photos, err := GetPhotosPathsByObjectId(id, "post")
	if err != nil {
		return models.Post{}, fmt.Errorf("GetPostDetailsById() failed: '%v'", err)
	}
	post.Photos = photos

	return post, nil
}