package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
)

func GetAllAdminHistory(w http.ResponseWriter, r *http.Request) {
	var err error
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	// default pagination
	page := -1
	limit := -1

	query := r.URL.Query()
	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching history.")
			slog.Error("Atoi() failed", "controller", "GetAllAdminHistory", "error", err)
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching history.")
			slog.Error("Atoi() failed", "controller", "GetAllAdminHistory", "error", err)
			return
		}
	}

	filters := models.HistoryFilters{
		Search: query.Get("search"),
		Sort:   query.Get("sort"),
		Module: query.Get("module"),
		Action: query.Get("action"),
	}

	histories, total, err := db.GetAllAdminHistory(page, limit, filters)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while fetching history.")
		slog.Error("GetAllAdminHistory() failed", "controller", "GetAllAdminHistory", "error", err)
		return
	}

	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}

	result := models.HistoryListPagination{
		Histories:    histories,
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

func GetHistoryDetails(w http.ResponseWriter, r *http.Request) {
	var err error
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	historyIDStr := r.PathValue("history_id")
	if historyIDStr == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "History ID is required.")
		return
	}

	historyID, err := strconv.Atoi(historyIDStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid history ID.")
		slog.Error("Atoi() failed", "controller", "GetHistoryDetails", "error", err)
		return
	}

	history, err := db.GetHistoryDetailsById(historyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while fetching history.")
		slog.Error("GetHistoryDetails() failed", "controller", "GetHistoryDetails", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, history)
}
