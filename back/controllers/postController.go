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

func GetPostsStats(w http.ResponseWriter, r *http.Request){
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
		TotalPosts: total,
		TotalNewPostsSince: totalSince,
		EngagementRate: engagementRate,
		InteractionPerPost: interactionPerPost,
		CategoryCounts: categoryCounts,
	}
	utils.RespondWithJSON(w, http.StatusOK, response)
}

func CreatePost(w http.ResponseWriter, r *http.Request){
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
	validation := validations.ValidatePostCreation(payload)
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

	utils.RespondWithJSON(w, http.StatusCreated, "Post created successfully")
}

func GetAllPosts(w http.ResponseWriter, r *http.Request){
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
		Search: query.Get("search"),
		Sort:   query.Get("sort"),
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
		Posts:       posts,
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

func DeletePost(w http.ResponseWriter, r *http.Request){
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

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

func GetPostDetailsById(w http.ResponseWriter, r *http.Request){
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