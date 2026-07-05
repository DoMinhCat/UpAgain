package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
	"slices"
	"time"
)

var PostCategories = []string{"tutorial", "tips", "news", "case_study", "other", "project"}

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

func GetTotalPosts(is_deleted *bool, category *string) (int, error) {
	var total int
	query := `select count(*) from posts p where p.id is not null`
	var err error
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
			return 0, fmt.Errorf("GetTotalPosts() failed: invalid category '%v'", *category)
		}
	}
	if is_deleted != nil {
		param += ` and p.is_deleted = $1;`
		err = utils.Conn.QueryRow(query+param, *is_deleted).Scan(&total)
	} else {
		err = utils.Conn.QueryRow(query + param).Scan(&total)
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

	if id != nil {
		query = `select view_count from posts p where p.is_deleted = false and p.id = $1;`
		err = utils.Conn.QueryRow(query, *id).Scan(&total)
	} else {
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

	if id != nil {
		query = `select like_count from posts p where p.is_deleted = false and p.id = $1;`
		err = utils.Conn.QueryRow(query, *id).Scan(&total)
	} else {
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

	if id != nil {
		query = `select count(*) from comments c where c.is_deleted = false and c.id_post = $1;`
		err = utils.Conn.QueryRow(query, *id).Scan(&total)
	} else {
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

	if id != nil {
		query = `select count(*) from saved_posts s where s.id_post = $1;`
		err = utils.Conn.QueryRow(query, *id).Scan(&total)
	} else {
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
	if payload.Category != "tips" {
		payload.EndDate.Valid = false
	}
	query := `
		insert into posts (title, content, category, id_account, end_date) values ($1, $2, $3, $4, $5) returning id;
	`
	var idPost int
	err := utils.Conn.QueryRow(query, payload.Title, payload.Content, payload.Category, payload.CreatorId, payload.EndDate).Scan(&idPost)
	if err != nil {
		return 0, fmt.Errorf("CreatePost() failed: '%v'", err)
	}
	return idPost, nil
}

// get only posts that are not deleted
func GetAllPosts(page int, limit int, filters models.PostFilters, idAccount int) ([]models.Post, int, error) {
	var results []models.Post
	var params []interface{}
	var countParams []interface{}
	whereClause := "WHERE p.is_deleted = false AND (p.category != 'tips' OR p.end_date IS NULL OR p.end_date > NOW())"
	paramIndex := 1

	if filters.Search != "" {
		searchParam := "%" + filters.Search + "%"
		whereClause += fmt.Sprintf(" AND (p.title ILIKE $%d OR a.username ILIKE $%d OR CAST(p.id AS TEXT) ILIKE $%d)", paramIndex, paramIndex, paramIndex)
		params = append(params, searchParam)
		countParams = append(countParams, searchParam)
		paramIndex++
	}

	fromJoinClause := " FROM posts p JOIN accounts a ON p.id_account=a.id LEFT JOIN ads ad ON p.id=ad.id_post AND ad.status = 'active'"

	if filters.Category != "" {
		if filters.Category == "sponsored" {
			whereClause += " AND ad.id IS NOT NULL"
		} else {
			whereClause += fmt.Sprintf(" AND p.category = $%d", paramIndex)
			params = append(params, filters.Category)
			countParams = append(countParams, filters.Category)
			paramIndex++
		}
	}

	var totalRecords int
	countQuery := "SELECT COUNT(*) " + fromJoinClause + " " + whereClause
	err := utils.Conn.QueryRow(countQuery, countParams...).Scan(&totalRecords)
	if err != nil {
		return nil, 0, fmt.Errorf("GetAllPosts() count failed: %v", err)
	}

	orderBy := "ORDER BY (ad.id IS NOT NULL) DESC, p.id ASC" // Default sorting
	if filters.Sort != "" {
		switch filters.Sort {
		case "highest_view":
			orderBy = "ORDER BY (ad.id IS NOT NULL) DESC, p.view_count DESC"
		case "lowest_view":
			orderBy = "ORDER BY (ad.id IS NOT NULL) DESC, p.view_count ASC"
		case "most_recent_creation":
			orderBy = "ORDER BY (ad.id IS NOT NULL) DESC, p.created_at DESC"
		case "oldest_creation":
			orderBy = "ORDER BY (ad.id IS NOT NULL) DESC, p.created_at ASC"
		case "highest_like":
			orderBy = "ORDER BY (ad.id IS NOT NULL) DESC, p.like_count DESC"
		case "lowest_like":
			orderBy = "ORDER BY (ad.id IS NOT NULL) DESC, p.like_count ASC"
		default:
			orderBy = "ORDER BY (ad.id IS NOT NULL) DESC, p.id ASC"
		}
	}

	query := `
		SELECT p.id, p.created_at, p.title, p.content, p.category, p.view_count, p.like_count, p.id_account, a.username, ad.id, a.avatar, p.end_date
		` + fromJoinClause + `
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
		var post models.Post
		err := rows.Scan(&post.Id, &post.CreatedAt, &post.Title, &post.Content, &post.Category, &post.ViewCount, &post.LikeCount, &post.IdAccount, &post.Creator, &post.AdsId, &post.CreatorAvatar, &post.EndDate)
		if err != nil {
			return nil, 0, fmt.Errorf("GetAllPosts() scan failed: %v", err.Error())
		}

		// get photos of post
		photos, err := GetPhotosPathsByObjectId(post.Id, "post")
		if err != nil {
			return nil, 0, fmt.Errorf("GetAllPosts() photos failed: %v", err.Error())
		}
		post.Photos = photos

		if idAccount != 0 {
			post.IsLiked, _ = IsPostLikedByUser(post.Id, idAccount)
			post.IsSaved, _ = IsPostSavedByUser(post.Id, idAccount)
		}
		results = append(results, post)
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

func GetTotalSavesByPostId(id int) (int, error) {
	var total int
	query := `select count(*) from saved_posts s where s.id_post = $1;`
	err := utils.Conn.QueryRow(query, id).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("GetTotalSavesByPostId() failed: '%v'", err)
	}
	return total, nil
}

func GetPostDetailsById(id int, id_account ...int) (models.Post, error) {
	var post models.Post
	query := `
	select p.id, p.created_at, p.title, p.content, p.category, p.view_count, p.like_count, p.id_account, a.username, a.id, ad.id, ad.start_date, ad.end_date, p.end_date
	from posts p 
	join accounts a on p.id_account=a.id 
	left join ads ad on p.id=ad.id_post and ad.status = 'active'
	where p.id = $1 and p.is_deleted = false;
	`
	err := utils.Conn.QueryRow(query, id).Scan(&post.Id, &post.CreatedAt, &post.Title, &post.Content, &post.Category, &post.ViewCount, &post.LikeCount, &post.IdAccount, &post.Creator, &post.CreatorId, &post.AdsId, &post.AdsFrom, &post.AdsTo, &post.EndDate)
	if err != nil {
		return models.Post{}, fmt.Errorf("GetPostDetailsById() failed: '%v'", err)
	}

	photos, err := GetPhotosPathsByObjectId(id, "post")
	if err != nil {
		return models.Post{}, fmt.Errorf("GetPostDetailsById() failed: '%v'", err)
	}
	post.Photos = photos

	comments, err := GetTotalCommentsByPostId(id)
	if err != nil {
		return models.Post{}, fmt.Errorf("GetPostDetailsById() failed: '%v'", err)
	}
	post.CommentCount = comments

	saves, err := GetTotalSavesByPostId(id)
	if err != nil {
		return models.Post{}, fmt.Errorf("GetPostDetailsById() failed: '%v'", err)
	}
	post.SaveCount = saves

	if len(id_account) > 0 {
		post.IsLiked, err = IsPostLikedByUser(id, id_account[0])
		if err != nil {
			return models.Post{}, fmt.Errorf("GetPostDetailsById() failed: '%v'", err)
		}
		post.IsSaved, err = IsPostSavedByUser(id, id_account[0])
		if err != nil {
			return models.Post{}, fmt.Errorf("GetPostDetailsById() failed: '%v'", err)
		}
	}

	return post, nil
}

func GetPostDetailsByStepId(step_id int) (models.Post, error) {
	var post models.Post
	query := `
	select p.id, p.created_at, p.title, p.content, p.category, p.view_count, p.like_count, p.id_account, a.username, a.id, ad.id, ad.start_date, ad.end_date, p.end_date
	from posts p 
	join accounts a on p.id_account=a.id 
	left join ads ad on p.id=ad.id_post and ad.status = 'active'
	JOIN project_steps ps on ps.id_post = p.id
	where ps.id = $1 and p.is_deleted = false;
	`
	err := utils.Conn.QueryRow(query, step_id).Scan(&post.Id, &post.CreatedAt, &post.Title, &post.Content, &post.Category, &post.ViewCount, &post.LikeCount, &post.IdAccount, &post.Creator, &post.CreatorId, &post.AdsId, &post.AdsFrom, &post.AdsTo, &post.EndDate)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Post{}, nil
		}
		return models.Post{}, fmt.Errorf("GetPostDetailsById() failed: '%v'", err)
	}
	return post, nil
}

// returns true if view was counted, once account can increase view count many times
func IncrementPostView(id_post int, id_account int) (bool, error) {
	_, err := utils.Conn.Exec(`INSERT INTO viewed_posts (id_account, id_post) VALUES ($1, $2);`, id_account, id_post)
	if err != nil {
		return false, fmt.Errorf("IncrementPostView() insert failed: '%v'", err)
	}
	_, err = utils.Conn.Exec(`UPDATE posts SET view_count = view_count + 1 WHERE id = $1 AND is_deleted = false;`, id_post)
	if err != nil {
		return false, fmt.Errorf("IncrementPostView() update failed: '%v'", err)
	}
	return true, nil
}

func IsPostLikedByUser(id_post int, id_account int) (bool, error) {
	var exists bool
	err := utils.Conn.QueryRow(`SELECT EXISTS(SELECT 1 FROM liked_posts WHERE id_post = $1 AND id_account = $2);`, id_post, id_account).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("IsPostLikedByUser() failed: '%v'", err)
	}
	return exists, nil
}

// returns true if now liked, false if unliked
func ToggleLikePost(id_post int, id_account int) (bool, error) {
	liked, err := IsPostLikedByUser(id_post, id_account)
	if err != nil {
		return false, err
	}
	if liked {
		_, err = utils.Conn.Exec(`DELETE FROM liked_posts WHERE id_post = $1 AND id_account = $2;`, id_post, id_account)
		if err != nil {
			return false, fmt.Errorf("ToggleLikePost() delete failed: '%v'", err)
		}
		_, err = utils.Conn.Exec(`UPDATE posts SET like_count = like_count - 1 WHERE id = $1;`, id_post)
		if err != nil {
			return false, fmt.Errorf("ToggleLikePost() decrement failed: '%v'", err)
		}
		return false, nil
	}
	_, err = utils.Conn.Exec(`INSERT INTO liked_posts (id_account, id_post) VALUES ($1, $2);`, id_account, id_post)
	if err != nil {
		return false, fmt.Errorf("ToggleLikePost() insert failed: '%v'", err)
	}
	_, err = utils.Conn.Exec(`UPDATE posts SET like_count = like_count + 1 WHERE id = $1;`, id_post)
	if err != nil {
		return false, fmt.Errorf("ToggleLikePost() increment failed: '%v'", err)
	}
	return true, nil
}

func IsPostSavedByUser(id_post int, id_account int) (bool, error) {
	var exists bool
	err := utils.Conn.QueryRow(`SELECT EXISTS(SELECT 1 FROM saved_posts WHERE id_post = $1 AND id_account = $2);`, id_post, id_account).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("IsPostSavedByUser() failed: '%v'", err)
	}
	return exists, nil
}

// returns true if now saved, false if unsaved
func ToggleSavePost(id_post int, id_account int) (bool, error) {
	saved, err := IsPostSavedByUser(id_post, id_account)
	if err != nil {
		return false, err
	}
	if saved {
		_, err = utils.Conn.Exec(`DELETE FROM saved_posts WHERE id_post = $1 AND id_account = $2;`, id_post, id_account)
		if err != nil {
			return false, fmt.Errorf("ToggleSavePost() delete failed: '%v'", err)
		}
		return false, nil
	}
	_, err = utils.Conn.Exec(`INSERT INTO saved_posts (id_account, id_post) VALUES ($1, $2);`, id_account, id_post)
	if err != nil {
		return false, fmt.Errorf("ToggleSavePost() insert failed: '%v'", err)
	}
	return true, nil
}

func UpdatePostById(id_post int, payload models.CreatePostRequest) error {
	if !slices.Contains(PostCategories, payload.Category) {
		return fmt.Errorf("UpdatePostById() failed: invalid post category '%v'", payload.Category)
	}
	if payload.Category != "tips" {
		payload.EndDate.Valid = false
	}
	query := `update posts set title = $1, content = $2, category = $3, end_date = $4 where id = $5 and is_deleted = false;`
	_, err := utils.Conn.Exec(query, payload.Title, payload.Content, payload.Category, payload.EndDate, id_post)
	if err != nil {
		return fmt.Errorf("UpdatePostById() failed: '%v'", err)
	}
	return nil
}

// default page: 1
//
// default limit: 10
//
// query by all category by passing "" in category
func GetPostsByAccountId(id_account int, page int, limit int, category string, search string) (models.PostListPagination, error) {
    var result models.PostListPagination
    if category != "" && !slices.Contains(PostCategories, category) {
        return result, fmt.Errorf("GetPostsByAccountId() failed: invalid post category '%v'", category)
    }
    if page <= 0 {
        page = 1
    }
    if limit <= 0 {
        limit = 10
    }
    offset := (page - 1) * limit

    var params []interface{}
    params = append(params, id_account)
    paramCount := 2

    dynamicWhere := ""

    if category != "" {
        dynamicWhere += fmt.Sprintf(" AND p.category = $%d", paramCount)
        params = append(params, category)
        paramCount++ // Increment counter to track the next index position
    }

    if search != "" {
        dynamicWhere += fmt.Sprintf(" AND (p.title ILIKE $%d OR p.content ILIKE $%d)", paramCount, paramCount)
        params = append(params, "%"+search+"%")
        paramCount++
    }

    countParams := append([]interface{}{}, params...)
    queryCount := fmt.Sprintf(`
        SELECT COUNT(*) 
        FROM posts p 
        WHERE p.is_deleted = false AND p.id_account = $1 %v;
    `, dynamicWhere)
    
    err := utils.Conn.QueryRow(queryCount, countParams...).Scan(&result.TotalRecords)
    if err != nil {
        return result, fmt.Errorf("GetPostsByAccountId() count query failed: '%v'", err)
    }

    if result.TotalRecords == 0 {
        result.Posts = []models.Post{}
        result.CurrentPage = page
        result.Limit = limit
        result.LastPage = 1
        return result, nil
    }

    limitPlaceholder := fmt.Sprintf("$%d", paramCount)
    offsetPlaceholder := fmt.Sprintf("$%d", paramCount+1)
    params = append(params, limit, offset)

    query := fmt.Sprintf(`
        SELECT p.id, p.created_at, p.title, p.content, p.category, p.view_count, p.like_count, p.id_account, a.username, ad.id, p.end_date
        FROM posts p 
        JOIN accounts a ON p.id_account = a.id 
        LEFT JOIN ads ad ON p.id = ad.id_post AND ad.status = 'active'
        WHERE p.is_deleted = false AND p.id_account = $1 %v
        ORDER BY p.created_at DESC
        LIMIT %v OFFSET %v
    `, dynamicWhere, limitPlaceholder, offsetPlaceholder)

    rows, err := utils.Conn.Query(query, params...)
    if err != nil {
        return result, fmt.Errorf("GetPostsByAccountId() query failed: '%v'", err)
    }
    defer rows.Close()

    var posts []models.Post
    for rows.Next() {
        var post models.Post
        err := rows.Scan(&post.Id, &post.CreatedAt, &post.Title, &post.Content, &post.Category, &post.ViewCount, &post.LikeCount, &post.IdAccount, &post.Creator, &post.AdsId, &post.EndDate)
        if err != nil {
            return result, fmt.Errorf("GetPostsByAccountId() scan failed: '%v'", err)
        }
        
        photos, err := GetPhotosPathsByObjectId(post.Id, "post")
        if err != nil {
            return result, fmt.Errorf("GetPostsByAccountId() photos lookup failed: '%v'", err)
        }
        post.Photos = photos
        
        if id_account != 0 {
            post.IsLiked, _ = IsPostLikedByUser(post.Id, id_account)
            post.IsSaved, _ = IsPostSavedByUser(post.Id, id_account)
        }
        posts = append(posts, post)
    }

    result.Posts = posts
    result.CurrentPage = page
    result.Limit = limit
    result.LastPage = result.TotalRecords / limit
    if result.TotalRecords%limit != 0 {
        result.LastPage++
    }
    
    return result, nil
}

func GetSavedPosts(idAccount int, page int, limit int, category string) (models.PostListPagination, error) {
	result := models.PostListPagination{}
	if !slices.Contains(PostCategories, category) && category != "" {
		return result, fmt.Errorf("GetSavedPosts() failed: invalid category '%v'", category)
	}
	if page <= 0 {
        page = 1
    }
    if limit <= 0 {
        limit = 10
    }

	var posts []models.Post

	var params []interface{}
	params = append(params, idAccount)
	whereClause := " WHERE sp.id_account = $1"

	if category != "" {
		whereClause += " AND p.category = $2"
		params = append(params, category)
	}

	queryCount := fmt.Sprintf(`
        SELECT COUNT(*) as count 
        FROM saved_posts sp 
        JOIN posts p on p.id = sp.id_post
        %v`, whereClause)
    row := utils.Conn.QueryRow(queryCount, params...)
    if err := row.Scan(&result.TotalRecords); err != nil {
        return result, fmt.Errorf("GetSavedPosts() count failed: '%v'", err)
    }

	result.CurrentPage = page
    result.Limit = limit
    if result.TotalRecords > 0 {
        // Calculate the maximum number of pages available (ceiling division)
        result.LastPage = (result.TotalRecords + limit - 1) / limit
    } else {
        result.LastPage = 1
    }

	paramCount := len(params)
    limitPlaceholder := fmt.Sprintf("$%d", paramCount+1)
    offsetPlaceholder := fmt.Sprintf("$%d", paramCount+2)

    offset := (page - 1) * limit
    params = append(params, limit, offset)

	query := fmt.Sprintf(`
		SELECT p.id, p.created_at, p.title, p.content, p.category, p.view_count, p.like_count, p.id_account, a.username
		FROM saved_posts sp
		JOIN posts p ON sp.id_post = p.id
		JOIN accounts a ON p.id_account=a.id 
		%v
		ORDER BY p.created_at DESC
		LIMIT %v OFFSET %v
	`, whereClause, limitPlaceholder, offsetPlaceholder)
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
		post.IsSaved = true
		post.IsLiked, _ = IsPostLikedByUser(post.Id, idAccount)
		posts = append(posts, post)
	}

	result.Posts = posts

	return result, nil
}