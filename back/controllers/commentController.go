package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
)

// CreateComment godoc
// @Summary      Add a comment to a post
// @Description  Create a new comment on a post.
// @Tags         comment
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id_post  path      int                   true  "Post ID"
// @Param        body     body      models.CreateCommentRequest  true  "Comment content"
// @Success      201      {object}  models.Comment
// @Failure      400      {string}  string  "Bad Request"
// @Failure      500      {string}  string  "Internal Server Error"
// @Router       /posts/{id_post}/comments [post]
func CreateComment(w http.ResponseWriter, r *http.Request) {
	idAccount := r.Context().Value("user").(models.AuthClaims).Id

	idPost, err := strconv.Atoi(r.PathValue("id_post"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid post ID.")
		return
	}

	exists, err := db.CheckPostExistsById(idPost)
	if err != nil {
		slog.Error("db.CheckPostExistsById() failed", "controller", "CreateComment", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to create comment.")
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusBadRequest, "Post not found.")
		return
	}

	var payload models.CreateCommentRequest
	if err = json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		return
	}
	if len([]rune(payload.Content)) == 0 {
		utils.RespondWithError(w, http.StatusBadRequest, "Content is required.")
		return
	}

	comment, err := db.CreateComment(idPost, idAccount, payload.Content)
	if err != nil {
		slog.Error("db.CreateComment() failed", "controller", "CreateComment", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to create comment.")
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, comment)
}

// DeleteCommentById godoc
// @Summary      Delete a comment
// @Description  Delete a comment by ID. Admins and employees can delete any comment; users can only delete their own.
// @Tags         comment
// @Security     ApiKeyAuth
// @Produce      json
// @Param        id_comment  path      int  true  "Comment ID"
// @Success      200         {string}  string  "Comment deleted successfully"
// @Failure      400         {object}  nil     "Invalid ID"
// @Failure      401         {object}  nil     "Unauthorized"
// @Failure      500         {object}  nil     "Internal server error"
// @Router       /posts/comments/{id_comment}/ [delete]
func DeleteCommentById(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role

	id_comment, err := strconv.Atoi(r.PathValue("id_comment"))
	if err != nil {
		slog.Error("strconv.Atoi() failed", "controller", "DeleteCommentById", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid comment ID.")
		return
	}

	// only admin or emp can delete all comments
	if role != "admin" && role != "employee" {
		if r.Context().Value("user").(models.AuthClaims).Id != id_comment {
			utils.RespondWithError(w, http.StatusUnauthorized, "You can only delete your own comment.")
			return
		}
	}

	err = db.DeleteCommentById(id_comment)
	if err != nil {
		slog.Error("db.DeleteCommentById() failed", "controller", "DeleteCommentById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to delete comment.")
		return
	}

	if role == "admin" {
		err = db.InsertHistory("comment", id_comment, "delete", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"is_deleted": false}, map[string]interface{}{"is_deleted": true})
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "DeleteCommentById", "error", err)
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, "Comment deleted successfully.")
}
