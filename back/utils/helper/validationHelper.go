package helper

import (
	"backend/models"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

func ParseValidationPayload(r *http.Request) (*models.ValidationActionRequest, string, error) {
	var payload models.ValidationActionRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		return nil, "", err
	}

	var newStatus string
	if payload.Action == "approve" {
		newStatus = "approved"
	} else if payload.Action == "refuse" {
		if payload.Reason == "" {
			return nil, "", fmt.Errorf("reason is required for refusal")
		}
		newStatus = "refused"
	} else {
		return nil, "", fmt.Errorf("invalid action, must be approve or refuse")
	}

	return &payload, newStatus, nil
}

// parsePaginationAndFilters extracts page, limit, search, sort from query params.
//
// page and limit default to -1 (no pagination).
func ParsePaginationAndFilters(r *http.Request) (page, limit int, filters models.ValidationFilters, err error) {
	page = -1
	limit = -1
	query := r.URL.Query()

	if pageStr := query.Get("page"); pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			return
		}
	}
	if limitStr := query.Get("limit"); limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			return
		}
	}
	filters = models.ValidationFilters{
		Search: query.Get("search"),
		Sort:   query.Get("sort"),
		Status: query.Get("status"),
		Type:   query.Get("type"),
	}
	return
}

// buildPaginatedResult computes last_page and returns a standardized map.
func BuildPaginatedResult(page, limit, total int) map[string]interface{} {
	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}
	currentPage := page
	if page == -1 || limit == -1 {
		currentPage = 1
		lastPage = 1
	}
	return map[string]interface{}{
		"current_page":  currentPage,
		"last_page":     lastPage,
		"limit":         limit,
		"total_records": total,
	}
}