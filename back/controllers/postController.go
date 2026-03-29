package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	helper "backend/utils/helper"
	validations "backend/utils/validations"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

// GetPostsStats godoc
// @Summary Get post statistics
// @Description Get general statistics about posts, including total count, new posts, engagement rate, and counts per category.
// @Tags Posts
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {object} models.PostCountStatsResponse
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Failed to get stats of posts"
// @Router /posts/stats [get]
func GetPostsStats(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request")
		return
	}

	// get overall stats for admin stats card
	is_deleted := false
	total, err := db.GetTotalPosts(&is_deleted, nil)
	if err != nil {
		slog.Error("GetTotalPosts() failed", "controller", "GetPostsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get stats of posts")
		return
	}

	totalSince, err := db.GetTotalNewPostsSince(time.Now().AddDate(0, -1, 0))
	if err != nil {
		slog.Error("GetTotalNewPostsSince() failed", "controller", "GetPostsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get stats of posts")
		return
	}

	// engagement rate across all post = total interactions/total view
	totalViews, err := db.TotalViewsByPostId(nil)
	if err != nil {
		slog.Error("TotalViewsByPostId() failed", "controller", "GetPostsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get stats of posts")
		return
	}
	totalLikes, err := db.TotalLikesByPostId(nil)
	if err != nil {
		slog.Error("TotalLikesByPostId() failed", "controller", "GetPostsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get stats of posts")
		return
	}
	totalComments, err := db.TotalCommentsByPostId(nil)
	if err != nil {
		slog.Error("TotalCommentsByPostId() failed", "controller", "GetPostsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get stats of posts")
		return
	}

	totalSaves, err := db.TotalSavesByPostId(nil)
	if err != nil {
		slog.Error("TotalSavesByPostId() failed", "controller", "GetPostsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get stats of posts")
		return
	}

	totalInteractions := totalComments + totalLikes + totalSaves
	engagementRate := 0.0
	if totalViews > 0 {
		engagementRateStr := fmt.Sprintf("%.2f", float64(totalInteractions)/float64(totalViews)*100)
		engagementRate, _ = strconv.ParseFloat(engagementRateStr, 64)
	}

	interactionPerPost := 0.0
	if total > 0 {
		interactionPerPostStr := fmt.Sprintf("%.2f", float64(totalInteractions)/float64(total))
		interactionPerPost, _ = strconv.ParseFloat(interactionPerPostStr, 64)
	}

	// counts by category
	categories := []string{"tutorial", "project", "tips", "news", "case_study", "other"}
	categoryCounts := make(map[string]int)
	for _, cat := range categories {
		count, err := db.GetTotalPosts(&is_deleted, &cat)
		if err != nil {
			slog.Error("GetTotalPosts by category failed", "category", cat, "error", err)
			categoryCounts[cat] = 0
		} else {
			categoryCounts[cat] = count
		}
	}

	response := models.PostCountStatsResponse{
		TotalPosts:         total,
		TotalNewPostsSince: totalSince,
		EngagementRate:     engagementRate,
		InteractionPerPost: interactionPerPost,
		CategoryCounts:     categoryCounts,
	}
	utils.RespondWithJSON(w, http.StatusOK, response)
}

// CreatePost godoc
// @Summary Create a new post
// @Description Create a new post with title, content, category, and images.
// @Tags Posts
// @Security ApiKeyAuth
// @Accept multipart/form-data
// @Produce json
// @Param title formData string true "Post Title"
// @Param content formData string true "Post Content (HTML allowed)"
// @Param category formData string true "Post Category"
// @Param images formData file false "Post Images"
// @Success 201 {string} string "Post created successfully"
// @Failure 400 {string} string "Bad Request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts [post]
func CreatePost(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "employee" && role != "pro" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		slog.Error("r.ParseMultipartForm() failed", "controller", "CreatePost", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Upload size exceeds 32MB.")
		return
	}

	var payload models.CreatePostRequest
	payload.Title = r.FormValue("title")
	payload.Content = r.FormValue("content")
	payload.Category = r.FormValue("category")
	files := r.MultipartForm.File["images"]
	for _, file := range files {
		path, err := helper.SaveUploadedFile(file, "images/posts")
		if err != nil {
			slog.Error("SaveUploadedFile() failed", "controller", "CreatePost", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Unable to save images to server.")
			return
		}
		payload.Image = append(payload.Image, path)
	}

	// validate
	validation := validations.ValidatePostCreationOrUpdate(payload)
	if !validation.Success {
		utils.RespondWithError(w, validation.Error, validation.Message.Error())
		return
	}

	payload.CreatorId = r.Context().Value("user").(models.AuthClaims).Id

	idPost, err := db.CreatePost(payload)
	if err != nil {
		slog.Error("db.CreatePost() failed", "controller", "CreatePost", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to create post.")
		return
	}

	for i, imgPath := range payload.Image {
		imagePayload := models.PhotoInsertRequest{
			Path:       imgPath,
			IsPrimary:  i == 0,
			ObjectType: "post",
			FkId:       idPost,
		}
		err = db.InsertImage(imagePayload)
		if err != nil {
			slog.Error("db.InsertImage() failed", "controller", "CreatePost", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to create post.")
			return
		}
	}

	if role == "admin" {
		db.InsertHistory("post", idPost, "create", r.Context().Value("user").(models.AuthClaims).Id, nil, payload)
	}

	utils.RespondWithJSON(w, http.StatusCreated, "Post created successfully")
}

// GetAllPosts godoc
// @Summary Get all posts
// @Description Get a paginated list of all posts with filters for search, category, and sorting.
// @Tags Posts
// @Security ApiKeyAuth
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Param search query string false "Search query"
// @Param category query string false "Filter by category"
// @Param sort query string false "Sort by (highest_view, lowest_view, most_recent_creation, oldest_creation, highest_like, lowest_like)"
// @Success 200 {object} models.PostListPagination
// @Failure 400 {string} string "Bad Request"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts [get]
func GetAllPosts(w http.ResponseWriter, r *http.Request) {
	var err error
	// default pagination
	page := -1
	limit := -1

	query := r.URL.Query()
	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetAllPosts", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching posts.")
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetAllPosts", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching posts.")
			return
		}
	}

	filters := models.PostFilters{
		Search:   query.Get("search"),
		Sort:     query.Get("sort"),
		Category: query.Get("category"),
	}

	posts, total, err := db.GetAllPosts(page, limit, filters)
	if err != nil {
		slog.Error("GetAllPosts() failed", "controller", "GetAllPosts", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching posts.")
		return
	}

	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}

	result := models.PostListPagination{
		Posts:        posts,
		CurrentPage:  page,
		LastPage:     lastPage,
		Limit:        limit,
		TotalRecords: total,
	}
	if page == -1 || limit == -1 {
		result.CurrentPage = 1
		result.LastPage = 1
	}
	utils.RespondWithJSON(w, http.StatusOK, result)
}

// DeletePost godoc
// @Summary Delete a post
// @Description Delete a post by ID. Users can only delete their own posts unless they are admin.
// @Tags Posts
// @Security ApiKeyAuth
// @Produce json
// @Param id_post path int true "Post ID"
// @Success 204 "No Content"
// @Failure 400 {string} string "Bad Request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts/{id_post}/delete [patch]
func DeletePost(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role

	idStr := r.PathValue("id_post")
	if idStr == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing post ID")
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "DeletePost", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	exists, err := db.CheckPostExistsById(id)
	if err != nil {
		slog.Error("db.CheckPostExistsById() failed", "controller", "DeletePost", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to delete post")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Post not found")
		return
	}

	// not admin can only delete their own posts
	if role != "admin" {
		id_account, err := db.GetPostCreatorIdByPostId(id)
		if err != nil {
			slog.Error("db.GetPostCreatorIdByPostId() failed", "controller", "DeletePost", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to delete post")
			return
		}
		if id_account != r.Context().Value("user").(models.AuthClaims).Id {
			utils.RespondWithError(w, http.StatusUnauthorized, "You can only delete your own posts.")
			return
		}
	}

	err = db.DeletePostById(id)
	if err != nil {
		slog.Error("db.DeletePostById() failed", "controller", "DeletePost", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to delete post")
		return
	}

	if role == "admin" {
		db.InsertHistory("post", id, "delete", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"is_deleted": false}, map[string]interface{}{"is_deleted": true})
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// GetPostDetailsById godoc
// @Summary Get post details
// @Description Get detailed information about a single post by ID.
// @Tags Posts
// @Security ApiKeyAuth
// @Produce json
// @Param id_post path int true "Post ID"
// @Success 200 {object} models.Post
// @Failure 400 {string} string "Bad Request"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts/{id_post} [get]
func GetPostDetailsById(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id_post")
	if idStr == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing post ID")
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "GetPostDetailsById", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	exists, err := db.CheckPostExistsById(id)
	if err != nil {
		slog.Error("db.CheckPostExistsById() failed", "controller", "GetPostDetailsById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get post details")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Post not found")
		return
	}

	post, err := db.GetPostDetailsById(id)
	if err != nil {
		slog.Error("db.GetPostDetailsById() failed", "controller", "GetPostDetailsById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get post details")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, post)
}

// UpdatePostById godoc
// @Summary Update a post
// @Description Update an existing post's data and images.
// @Tags Posts
// @Security ApiKeyAuth
// @Accept multipart/form-data
// @Produce json
// @Param id_post path int true "Post ID"
// @Param title formData string true "Post Title"
// @Param content formData string true "Post Content"
// @Param category formData string true "Post Category"
// @Param existing_images formData []string false "Image paths to keep"
// @Param new_images formData file false "New images to upload"
// @Success 204 "No Content"
// @Failure 400 {string} string "Bad Request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts/{id_post} [put]
func UpdatePostById(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role == "user" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to update this post.")
		return
	}
	idStr := r.PathValue("id_post")
	if idStr == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing post ID")
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "UpdatePostById", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	exists, err := db.CheckPostExistsById(id)
	if err != nil {
		slog.Error("db.CheckPostExistsById() failed", "controller", "UpdatePostById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update post")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Post not found")
		return
	}

	oldPost, _ := db.GetPostDetailsById(id)
	err = r.ParseMultipartForm(32 << 20)
	if err != nil {
		slog.Error("r.ParseMultipartForm() failed", "controller", "UpdatePostById", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Upload size exceeds 32MB.")
		return
	}

	// create model just to validate
	var payload models.CreatePostRequest
	payload.Title = r.FormValue("title")
	payload.Content = r.FormValue("content")
	payload.Category = r.FormValue("category")
	// validate
	validation := validations.ValidatePostCreationOrUpdate(payload)
	if !validation.Success {
		utils.RespondWithError(w, validation.Error, validation.Message.Error())
		return
	}

	// Photo update management
	keepImages := r.MultipartForm.Value["existing_images"]
	newImg := r.MultipartForm.File["new_images"]

	// 1. Handle deletion of removed images
	currentImages, err := db.GetPhotosPathsByObjectId(id, "post")
	if err != nil {
		slog.Error("db.GetPhotosPathsByObjectId() failed", "controller", "UpdatePostById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update post.")
		return
	}

	for _, dbImg := range currentImages {
		isKept := false
		for _, keepPath := range keepImages {
			if dbImg == keepPath {
				isKept = true
				break
			}
		}
		if !isKept {
			err = helper.DeleteFileByPath("images/posts", dbImg)
			if err != nil {
				slog.Error("helper.DeleteFileByPath() failed", "controller", "UpdatePostById", "error", err)
			}
			err = db.DeleteImageByPath(dbImg)
			if err != nil {
				slog.Error("db.DeleteImageByPath() failed", "controller", "UpdatePostById", "error", err)
				utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update post.")
				return
			}
		}
	}

	// 2. Save and insert new images
	for i, file := range newImg {
		path, err := helper.SaveUploadedFile(file, "images/posts")
		if err != nil {
			slog.Error("SaveUploadedFile() failed", "controller", "UpdatePostById", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Unable to save images to server.")
			return
		}

		imagePayload := models.PhotoInsertRequest{
			Path:       path,
			IsPrimary:  i == 0 && len(keepImages) == 0, // Only primary if it's the first and no others are being kept
			ObjectType: "post",
			FkId:       id,
		}
		err = db.InsertImage(imagePayload)
		if err != nil {
			slog.Error("db.InsertImage() failed", "controller", "UpdatePostById", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update post.")
			return
		}
	}

	err = db.UpdatePostById(id, payload)
	if err != nil {
		slog.Error("db.UpdatePostById() failed", "controller", "UpdatePostById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update post")
		return
	}

	if role == "admin" {
		db.InsertHistory("post", id, "update", r.Context().Value("user").(models.AuthClaims).Id, oldPost, payload)
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// GetPostCommentsByPostId godoc
// @Summary Get post comments
// @Description Get a paginated list of comments for a specific post.
// @Tags Posts
// @Security ApiKeyAuth
// @Produce json
// @Param id_post path int true "Post ID"
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} models.PostCommentsResponse
// @Failure 400 {string} string "Bad Request"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts/{id_post}/comments [get]
func GetPostCommentsByPostId(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id_post")
	if idStr == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing post ID")
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "GetPostCommentsByPostId", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	exists, err := db.CheckPostExistsById(id)
	if err != nil {
		slog.Error("db.CheckPostExistsById() failed", "controller", "GetPostCommentsByPostId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get post comments")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Post not found")
		return
	}

	// pagination
	page := -1
	limit := -1

	query := r.URL.Query()
	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetPostCommentsByPostId", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching comments.")
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetPostCommentsByPostId", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching comments.")
			return
		}
	}

	comments, err := db.GetPostCommentsByPostId(id, page, limit)
	if err != nil {
		slog.Error("db.GetPostCommentsByPostId() failed", "controller", "GetPostCommentsByPostId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get post comments")
		return
	}

	total, err := db.GetTotalCommentsByPostId(id)
	if err != nil {
		slog.Error("db.GetTotalCommentsByPostId() failed", "controller", "GetPostCommentsByPostId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get post comments")
		return
	}

	for i, comment := range comments {
		avatar, err := db.GetPhotosPathsByObjectId(comment.IdAccount, "avatar")
		if err != nil {
			slog.Error("db.GetPhotosPathsByObjectId() failed", "controller", "GetPostCommentsByPostId", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get post comments")
			return
		}
		if len(avatar) > 0 {
			comments[i].Avatar = avatar[0]
		}

		username, err := db.GetUsernameById(comments[i].IdAccount)
		if err != nil {
			slog.Error("db.GetUsernameById() failed", "controller", "GetPostCommentsByPostId", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get post comments")
			return
		}
		comments[i].UserName = username
	}

	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}

	response := models.PostCommentsResponse{
		TotalComments: total,
		Comments:      comments,
		CurrentPage:   page,
		LastPage:      lastPage,
		Limit:         limit,
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}
