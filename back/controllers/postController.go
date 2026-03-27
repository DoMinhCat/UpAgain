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
	total, err := db.GetTotalPosts(&is_deleted)
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
	engagementRateStr := fmt.Sprintf("%.2f", float64(totalInteractions)/float64(totalViews)*100)
	engagementRate, _ := strconv.ParseFloat(engagementRateStr, 64)

	// pending approval
	status := "pending"
	totalPending, err := db.GetTotalEventsByStatus(&status)
	if err != nil {
		slog.Error("GetTotalEventsByStatus() failed", "controller", "GetPostsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get stats of posts")
		return
	}

	response := models.PostCountStatsResponse{
		TotalPosts: total,
		TotalNewPostsSince: totalSince,
		EngagementRate: engagementRate,
		Pending: totalPending,
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