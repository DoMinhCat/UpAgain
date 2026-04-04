package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
)

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
