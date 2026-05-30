package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	helpers "backend/utils/helpers"
	validations "backend/utils/validations"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"strconv"
	"strings"
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
// @Router /posts/count/ [get]
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
// @Router /posts/ [post]
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
	payload.Title = strings.TrimSpace(r.FormValue("title"))
	payload.Content = strings.TrimSpace(r.FormValue("content"))
	payload.Category = strings.TrimSpace(r.FormValue("category"))
	files := r.MultipartForm.File["images"]
	for _, file := range files {
		path, err := helpers.SaveUploadedFile(file, "images/posts")
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
		err = db.InsertHistory("post", idPost, "create", r.Context().Value("user").(models.AuthClaims).Id, nil, payload)
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "CreatePost", "id", idPost, "error", err)
		}
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
// @Router /posts/ [get]
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

	idAccount := 0
	if userCtx := r.Context().Value("user"); userCtx != nil {
		if claims, ok := userCtx.(models.AuthClaims); ok {
			idAccount = claims.Id
		}
	}

	posts, total, err := db.GetAllPosts(page, limit, filters, idAccount)
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
// @Router /posts/{id_post}/delete/ [patch]
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
		err = db.InsertHistory("post", id, "delete", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"is_deleted": false}, map[string]interface{}{"is_deleted": true})
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "DeletePost", "id", id, "error", err)
		}
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
// @Router /posts/{id_post}/ [get]
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

	idAccount := r.Context().Value("user").(models.AuthClaims).Id
	post, err := db.GetPostDetailsById(id, idAccount)
	if err != nil {
		slog.Error("db.GetPostDetailsById() failed", "controller", "GetPostDetailsById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get post details")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, post)
}

// ViewPost godoc
// @Summary Increment post view count
// @Description Increments the view counter of a post by 1.
// @Tags Posts
// @Security ApiKeyAuth
// @Produce json
// @Param id_post path int true "Post ID"
// @Success 204 "No Content"
// @Failure 400 {string} string "Bad Request"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts/{id_post}/view/ [post]
func ViewPost(w http.ResponseWriter, r *http.Request) {
	idAccount := r.Context().Value("user").(models.AuthClaims).Id
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "user" && role != "pro" && role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this action")
		return
	}

	id, err := strconv.Atoi(r.PathValue("id_post"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	exists, err := db.CheckPostExistsById(id)
	if err != nil {
		slog.Error("db.CheckPostExistsById() failed", "controller", "ViewPost", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to register view")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Post not found")
		return
	}

	counted, err := db.IncrementPostView(id, idAccount)
	if err != nil {
		slog.Error("db.IncrementPostView() failed", "controller", "ViewPost", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to register view")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]bool{"counted": counted})
}

// LikePost godoc
// @Summary Toggle like on a post
// @Description Like or unlike a post. Returns the new like state.
// @Tags Posts
// @Security ApiKeyAuth
// @Produce json
// @Param id_post path int true "Post ID"
// @Success 200 {object} map[string]bool
// @Failure 400 {string} string "Bad Request"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts/{id_post}/like/ [post]
func LikePost(w http.ResponseWriter, r *http.Request) {
	idAccount := r.Context().Value("user").(models.AuthClaims).Id

	id, err := strconv.Atoi(r.PathValue("id_post"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	exists, err := db.CheckPostExistsById(id)
	if err != nil {
		slog.Error("db.CheckPostExistsById() failed", "controller", "LikePost", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to toggle like")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Post not found")
		return
	}

	isLiked, err := db.ToggleLikePost(id, idAccount)
	if err != nil {
		slog.Error("db.ToggleLikePost() failed", "controller", "LikePost", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to toggle like")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]bool{"is_liked": isLiked})
}

// SavePost godoc
// @Summary Toggle save on a post
// @Description Save or unsave a post. Returns the new save state.
// @Tags Posts
// @Security ApiKeyAuth
// @Produce json
// @Param id_post path int true "Post ID"
// @Success 200 {object} map[string]bool
// @Failure 400 {string} string "Bad Request"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts/{id_post}/save/ [post]
func SavePost(w http.ResponseWriter, r *http.Request) {
	idAccount := r.Context().Value("user").(models.AuthClaims).Id

	id, err := strconv.Atoi(r.PathValue("id_post"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	exists, err := db.CheckPostExistsById(id)
	if err != nil {
		slog.Error("db.CheckPostExistsById() failed", "controller", "SavePost", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to toggle save")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Post not found")
		return
	}

	isSaved, err := db.ToggleSavePost(id, idAccount)
	if err != nil {
		slog.Error("db.ToggleSavePost() failed", "controller", "SavePost", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to toggle save")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]bool{"is_saved": isSaved})
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
// @Router /posts/{id_post}/ [put]
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

	currentImages, err := db.GetPhotosPathsByObjectId(id, "post")
	if err != nil {
		slog.Error("db.GetPhotosPathsByObjectId() failed", "controller", "UpdatePostById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update post.")
		return
	}

	// Determine which DB images were removed so we can clean them up
	keepSet := make(map[string]struct{}, len(keepImages))
	for _, p := range keepImages {
		keepSet[p] = struct{}{}
	}
	for _, dbImg := range currentImages {
		if _, kept := keepSet[dbImg]; !kept {
			if err = db.DeleteImageByPath(dbImg); err != nil {
				slog.Error("db.DeleteImageByPath() failed", "controller", "UpdatePostById", "error", err)
				utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update post.")
				return
			}
		}
	}

	// Handle physical files + collect final path list
	finalImages, delErrs, err := helpers.ProcessPhotoUpdate("images/posts", currentImages, keepImages, newImg)
	for _, delErr := range delErrs {
		slog.Error("ProcessPhotoUpdate() deletion failed", "controller", "UpdatePostById", "error", delErr)
	}
	if err != nil {
		slog.Error("ProcessPhotoUpdate() save failed", "controller", "UpdatePostById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to save images to server.")
		return
	}

	// Insert newly-added images into the DB
	newPathsStart := len(keepImages) // finalImages[:newPathsStart] are kept; rest are new
	for i, path := range finalImages[newPathsStart:] {
		imagePayload := models.PhotoInsertRequest{
			Path:       path,
			IsPrimary:  i == 0 && len(keepImages) == 0,
			ObjectType: "post",
			FkId:       id,
		}
		if err = db.InsertImage(imagePayload); err != nil {
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
		err = db.InsertHistory("post", id, "update", r.Context().Value("user").(models.AuthClaims).Id, oldPost, payload)
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "UpdatePostById", "id", id, "error", err)
		}
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
// @Router /posts/{id_post}/comments/ [get]
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

	idAccount := r.Context().Value("user").(models.AuthClaims).Id

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

		if idAccount != 0 {
			isLiked, err := db.IsCommentLikedByUser(comment.Id, idAccount)
			if err != nil {
				slog.Error("db.IsCommentLikedByUser() failed", "controller", "GetPostCommentsByPostId", "error", err)
				utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get post comments")
				return
			}
			comments[i].IsLiked = isLiked
		}
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

// GetProjectStepsByPostId godoc
// @Summary      Get project steps
// @Description  Returns all project steps associated with a specific post.
// @Tags         Posts
// @Security     ApiKeyAuth
// @Produce      json
// @Param        id_post  path      int  true  "Post ID"
// @Success      200      {object}  []models.ProjectStep
// @Failure      400      {string}  string  "Invalid or missing post ID"
// @Failure      500      {string}  string  "Internal Server Error"
// @Router       /posts/{id_post}/steps/ [get]
func GetProjectStepsByPostId(w http.ResponseWriter, r *http.Request) {
	idPost, err := strconv.Atoi(r.PathValue("id_post"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	exists, err := db.CheckPostExistsById(idPost)
	if err != nil {
		slog.Error("db.CheckPostExistsById() failed", "controller", "GetProjectStepsByPostId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get project steps")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Post ID "+strconv.Itoa(idPost)+" not found")
		return
	}

	steps, err := db.GetProjectStepsByPostId(idPost)
	if err != nil {
		slog.Error("db.GetProjectStepsByPostId() failed", "controller", "GetProjectStepsByPostId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get project details")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, steps)
}

// DeleteProjectStepByPostId godoc
// @Summary      Delete a project step
// @Description  Deletes a specific project step by its ID. Admin only.
// @Tags         Posts
// @Security     ApiKeyAuth
// @Produce      json
// @Param        id_post   path      int  true  "Post ID"
// @Param        step_id   path      int  true  "Step ID"
// @Success      200       {object}  nil     "Deleted successfully"
// @Failure      400       {string}  string  "Invalid ID or step not found"
// @Failure      401       {string}  string  "Unauthorized"
// @Failure      500       {string}  string  "Internal Server Error"
// @Router       /posts/steps/{step_id}/ [delete]
func DeleteProjectStep(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	idStep, err := strconv.Atoi(r.PathValue("step_id"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid step ID")
		return
	}

	exists, err := db.CheckProjectStepExistsById(idStep)
	if err != nil {
		slog.Error("db.CheckProjectStepExistsById() failed", "controller", "DeleteProjectStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to delete project step")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Step ID "+strconv.Itoa(idStep)+" not found")
		return
	}

	if role != "admin" {
		postDetails, err := db.GetPostDetailsByStepId(idStep)
		if err != nil {
			slog.Error("db.GetPostDetailsByStepId() failed", "controller", "DeleteProjectStep", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to delete project step")
			return
		}
		if postDetails.IdAccount != r.Context().Value("user").(models.AuthClaims).Id {
			utils.RespondWithError(w, http.StatusForbidden, "You can only modify your own projects")
			return
		}
	}

	err = db.DeleteProjectStepByStepId(idStep)
	if err != nil {
		slog.Error("db.DeleteProjectStepByStepId() failed", "controller", "DeleteProjectStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to delete project step")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, nil)
}

// GetPostsByAccountId godoc
// @Summary Get posts by account ID
// @Description Get a paginated list of posts created by the authenticated account.
// @Tags Posts
// @Security ApiKeyAuth
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Param category query string false "Filter by category"
// @Success 200 {array} models.Post
// @Failure 400 {string} string "Bad Request"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts/me/ [get]
func GetPostsByAccountId(w http.ResponseWriter, r *http.Request) {
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id

	deleted := false
	exists, err := db.CheckAccountExistsById(idRequestor, &deleted)
	if err != nil {
		slog.Error("db.CheckAccountExistsById() failed", "controller", "GetPostsByAccountId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get posts")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Account ID "+strconv.Itoa(idRequestor)+" not found")
		return
	}

	page, limit := -1, 10
	query := r.URL.Query()
	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetPostsByAccountId", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid page.")
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetPostsByAccountId", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid limit.")
			return
		}
	}

	category := query.Get("category")
	if category != "" && !slices.Contains(db.PostCategories, category){
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid category")
	}

	posts, err := db.GetPostsByAccountId(idRequestor, page, limit, category)
	if err != nil {
		slog.Error("db.GetPostsByAccountId() failed", "controller", "GetPostsByAccountId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get posts")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, posts)
}

// GetSavedPosts godoc
// @Summary Get saved posts
// @Description Get a paginated list of posts saved by the authenticated account.
// @Tags Posts
// @Security ApiKeyAuth
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Param category query string false "Filter by category"
// @Success 200 {array} models.Post
// @Failure 400 {string} string "Bad Request"
// @Failure 500 {string} string "Internal Server Error"
// @Router /posts/saved/ [get]
func GetSavedPosts(w http.ResponseWriter, r *http.Request) {
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id

	deleted := false
	exists, err := db.CheckAccountExistsById(idRequestor, &deleted)
	if err != nil {
		slog.Error("db.CheckAccountExistsById() failed", "controller", "GetPostsByAccountId", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get posts")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Account ID "+strconv.Itoa(idRequestor)+" not found")
		return
	}

	page, limit := -1, 10
	query := r.URL.Query()
	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetSavedPosts", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid page.")
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetSavedPosts", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid limit.")
			return
		}
	}
	category := query.Get("category")
	if category != "" && !slices.Contains(db.PostCategories, category){
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid category")
	}


	posts, err := db.GetSavedPosts(idRequestor, page, limit, category)
	if err != nil {
		slog.Error("db.GetSavedPosts() failed", "controller", "GetSavedPosts", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get saved posts")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, posts)
}

// CreatePostStep godoc
// @Summary      Create a new step for a post
// @Description  Add a new project step with title, description, associated items, and images. Only available for the post owner (pro).
// @Tags         Posts
// @Security     ApiKeyAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        id_post      path      int      true   "Post ID"
// @Param        title        formData  string   true   "Step Title"
// @Param        description  formData  string   true   "Step Description"
// @Param        item_ids     formData  []int    false  "Associated Item IDs"
// @Param        images       formData  file     false  "Step Images"
// @Success      200          {object}  map[string]string "Step added to your project"
// @Failure      400          {string}  string   "Bad Request"
// @Failure      401          {string}  string   "Unauthorized"
// @Failure      403          {string}  string   "Forbidden"
// @Failure      500          {string}  string   "Internal Server Error"
// @Router       /posts/{id_post}/steps [post]
func CreatePostStep(w http.ResponseWriter, r *http.Request) {
	idPost, err := strconv.Atoi(r.PathValue("id_post"))
	if err != nil {
		slog.Error("Atoi() failed", "controller", "CreatePostStep", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	exists, err := db.CheckPostExistsById(idPost)
	if err != nil {
		slog.Error("db.CheckPostExistsById() failed", "controller", "CreatePostStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to check post existence")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Post not found")
		return
	}

	postDetails, err := db.GetPostDetailsById(idPost)
	if err != nil {
		slog.Error("GetPostDetailsById() failed", "controller", "CreatePostStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while adding the step to the project")
		return
	}
	if postDetails.Category != "project" {
		utils.RespondWithError(w, http.StatusBadRequest, "Steps can only be added to posts in the 'project' category")
		return
	}
	if postDetails.IdAccount != r.Context().Value("user").(models.AuthClaims).Id {
		utils.RespondWithError(w, http.StatusForbidden, "You can only modify your own project")
		return
	}

	// decode payload
	err = r.ParseMultipartForm(32 << 20)
	if err != nil {
		slog.Error("r.ParseMultipartForm() failed", "controller", "CreatePostStep", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Upload size exceeds 32MB.")
		return
	}
	var dbPayload models.StepInsertPayload

	dbPayload.Title = strings.TrimSpace(r.FormValue("title"))
	dbPayload.Description = strings.TrimSpace(r.FormValue("description"))
	itemIdsStrings := r.MultipartForm.Value["item_ids"]
	for _, itemIdStr := range itemIdsStrings {
		itemId, err := strconv.Atoi(itemIdStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "CreatePostStep", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid item ID")
			return
		}
		exists, err := db.CheckItemExistByItemId(itemId)
		if err != nil {
			slog.Error("db.CheckItemExistByItemId() failed", "controller", "CreatePostStep", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to create step")
			return
		}
		if !exists {
			utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+strconv.Itoa(itemId)+" not found")
			return
		}
		dbPayload.ItemIds = append(dbPayload.ItemIds, itemId)
	}

	files := r.MultipartForm.File["images"]
	for _, file := range files {
		path, err := helpers.SaveUploadedFile(file, "images/posts")
		if err != nil {
			slog.Error("SaveUploadedFile() failed", "controller", "CreatePostStep", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Unable to save images to server.")
			return
		}
		dbPayload.Images = append(dbPayload.Images, path)
	}

	// validate
	validation := validations.ValidateProjectStepCreation(dbPayload)
	if !validation.Success {
		utils.RespondWithError(w, validation.Error, validation.Message.Error())
		return
	}
	dbPayload.IdPost = idPost

	// insert into project_steps
	idStepInserted, err := db.InsertStep(dbPayload)
	if err != nil {
		slog.Error("InsertStep() failed", "controller", "CreatePostStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while adding the step to the project")
		return
	}

	// insert into step_items
	err = db.InsertItemsOfSteps(idStepInserted, dbPayload.ItemIds)
	if err != nil {
		slog.Error("InsertItemsOfSteps() failed", "controller", "CreatePostStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while adding the step to the project")
		return
	}

	// insert images
	for i, imgPath := range dbPayload.Images {
		imagePayload := models.PhotoInsertRequest{
			Path:       imgPath,
			IsPrimary:  i == 0,
			ObjectType: "step",
			FkId:       idStepInserted,
		}
		err = db.InsertImage(imagePayload)
		if err != nil {
			slog.Error("db.InsertImage() failed", "controller", "CreatePostStep", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to save images.")
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Step added to your project"})
}

// UpdateStep godoc
// @Summary      Update a project step
// @Description  Allows a user (pro or admin) to update a step in their project timeline.
// @Tags         posts
// @Accept       multipart/form-data
// @Produce      json
// @Param        step_id      path      int      true   "Step ID"
// @Param        title        formData  string   true   "Step Title"
// @Param        description  formData  string   true   "Step Description"
// @Param        item_ids     formData  []int    false  "Associated Item IDs"
// @Param        existing_images formData []string false "Existing image paths to keep"
// @Param        new_images   formData  file     false  "New Step Images"
// @Success      200          {object}  map[string]string "Step updated successfully"
// @Failure      400          {string}  string   "Bad Request"
// @Failure      401          {string}  string   "Unauthorized"
// @Failure      403          {string}  string   "Forbidden"
// @Failure      500          {string}  string   "Internal Server Error"
// @Router       /posts/steps/{step_id} [put]
func UpdateStep(w http.ResponseWriter, r *http.Request) {
	idStep, err := strconv.Atoi(r.PathValue("step_id"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid step ID")
		return
	}

	exists, err := db.CheckProjectStepExistsById(idStep)
	if err != nil {
		slog.Error("db.CheckProjectStepExistsById() failed", "controller", "UpdateStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update project step")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Step ID "+strconv.Itoa(idStep)+" not found")
		return
	}

	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		postDetails, err := db.GetPostDetailsByStepId(idStep)
		if err != nil {
			slog.Error("db.GetPostDetailsByStepId() failed", "controller", "UpdateStep", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update project step")
			return
		}
		if postDetails.IdAccount != r.Context().Value("user").(models.AuthClaims).Id {
			utils.RespondWithError(w, http.StatusForbidden, "You can only modify your own projects")
			return
		}
	}

	err = r.ParseMultipartForm(32 << 20)
	if err != nil {
		slog.Error("r.ParseMultipartForm() failed", "controller", "UpdateStep", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Upload size exceeds 32MB.")
		return
	}

	var dbPayload models.StepInsertPayload
	dbPayload.Title = strings.TrimSpace(r.FormValue("title"))
	dbPayload.Description = strings.TrimSpace(r.FormValue("description"))
	itemIdsStrings := r.MultipartForm.Value["item_ids"]
	for _, itemIdStr := range itemIdsStrings {
		itemId, err := strconv.Atoi(itemIdStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "UpdateStep", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid item ID")
			return
		}
		exists, err := db.CheckItemExistByItemId(itemId)
		if err != nil {
			slog.Error("db.CheckItemExistByItemId() failed", "controller", "UpdateStep", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update step")
			return
		}
		if !exists {
			utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+strconv.Itoa(itemId)+" not found")
			return
		}
		dbPayload.ItemIds = append(dbPayload.ItemIds, itemId)
	}

	// validate text fields
	validation := validations.ValidateProjectStepCreation(dbPayload)
	if !validation.Success {
		utils.RespondWithError(w, validation.Error, validation.Message.Error())
		return
	}

	// update project steps
	err = db.UpdateStep(dbPayload, idStep)
	if err != nil {
		slog.Error("db.UpdateStep() failed", "controller", "UpdateStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update project step")
		return
	}

	// Photo update management
	keepImages := r.MultipartForm.Value["existing_images"]
	newImg := r.MultipartForm.File["new_images"]

	currentImages, err := db.GetPhotosPathsByObjectId(idStep, "step")
	if err != nil {
		slog.Error("db.GetPhotosPathsByObjectId() failed", "controller", "UpdateStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update step.")
		return
	}

	keepSet := make(map[string]struct{}, len(keepImages))
	for _, p := range keepImages {
		keepSet[p] = struct{}{}
	}
	for _, dbImg := range currentImages {
		if _, kept := keepSet[dbImg]; !kept {
			if err = db.DeleteImageByPath(dbImg); err != nil {
				slog.Error("db.DeleteImageByPath() failed", "controller", "UpdateStep", "error", err)
				utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update step.")
				return
			}
		}
	}

	// Handle physical files + collect final path list using ProcessPhotoUpdate helper
	finalImages, delErrs, err := helpers.ProcessPhotoUpdate("images/posts", currentImages, keepImages, newImg)
	for _, delErr := range delErrs {
		slog.Error("ProcessPhotoUpdate() deletion failed", "controller", "UpdateStep", "error", delErr)
	}
	if err != nil {
		slog.Error("ProcessPhotoUpdate() save failed", "controller", "UpdateStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to save images to server.")
		return
	}

	// Insert newly-added images into the DB
	newPathsStart := len(keepImages) // finalImages[:newPathsStart] are kept; rest are new
	for i, path := range finalImages[newPathsStart:] {
		imagePayload := models.PhotoInsertRequest{
			Path:       path,
			IsPrimary:  i == 0 && len(keepImages) == 0,
			ObjectType: "step",
			FkId:       idStep,
		}
		if err = db.InsertImage(imagePayload); err != nil {
			slog.Error("db.InsertImage() failed", "controller", "UpdateStep", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update step.")
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Step updated successfully"})
}

// ReorderStep godoc
// @Summary      Reorder a project step
// @Description  Allows a user (pro) to reorder a step in their project timeline.
// @Tags         posts
// @Accept       json
// @Produce      json
// @Param        step_id  path      int  true  "Step ID"
// @Param        payload  body      models.ReorderStepPayload true "Reorder details"
// @Success      200      {object}  map[string]string "Step reordered successfully"
// @Failure      400      {string}  string   "Bad Request"
// @Failure      401      {string}  string   "Unauthorized"
// @Failure      403      {string}  string   "Forbidden"
// @Failure      500      {string}  string   "Internal Server Error"
// @Router       /posts/steps/{step_id}/reorder [put]
func ReorderStep(w http.ResponseWriter, r *http.Request) {
	idStep, err := strconv.Atoi(r.PathValue("step_id"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid step ID")
		return
	}

	exists, err := db.CheckProjectStepExistsById(idStep)
	if err != nil {
		slog.Error("db.CheckProjectStepExistsById() failed", "controller", "ReorderStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to reorder project step")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Step not found")
		return
	}

	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		postDetails, err := db.GetPostDetailsByStepId(idStep)
		if err != nil {
			slog.Error("db.GetPostDetailsByStepId() failed", "controller", "ReorderStep", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to reorder project step")
			return
		}
		if postDetails.IdAccount != r.Context().Value("user").(models.AuthClaims).Id {
			utils.RespondWithError(w, http.StatusForbidden, "You can only reorder steps of your own projects")
			return
		}
	}

	var payload models.ReorderStepPayload
	err = json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	err = db.UpdateStepOrder(idStep, payload.PrevStepId, payload.NextStepId)
	if err != nil {
		slog.Error("db.UpdateStepOrder() failed", "controller", "ReorderStep", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to reorder project step")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Step order updated successfully"})
}