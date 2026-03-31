package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
)

func GetAllItems(w http.ResponseWriter, r *http.Request){
	var err error
	// default pagination
	page := -1
	limit := -1

	query := r.URL.Query()
	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetAllItems", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching items.")
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetAllItems", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching items.")
			return
		}
	}

	filters := models.ItemFilters{
		Search:   query.Get("search"),
		Sort:     query.Get("sort"),
		Category: query.Get("category"),
		Status: query.Get("status"),
		Material: query.Get("material"),
	}

	items, total, err := db.GetAllItems(page, limit, filters)
	if err != nil {
		slog.Error("GetAllItems() failed", "controller", "GetAllItems", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}

	result := models.ItemListPagination{
		Items:        items,
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