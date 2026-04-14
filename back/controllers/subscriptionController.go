package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"encoding/json"
	"log/slog"
	"math"
	"net/http"
	"strconv"
)

func GetAllSubscriptionsHandler(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized.")
		return
	}

	query := r.URL.Query()
	page, limit := -1, -1

	if p := query.Get("page"); p != "" {
		page, _ = strconv.Atoi(p)
	}
	if l := query.Get("limit"); l != "" {
		limit, _ = strconv.Atoi(l)
	}

	onlyActive := query.Get("active") == "true"

	subs, total, err := db.GetAllSubscriptions(page, limit, onlyActive)
	if err != nil {
		slog.Error("GetAllSubscriptions() failed", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not fetch subscriptions.")
		return
	}

	lastPage := 1
	if limit > 0 {
		lastPage = int(math.Ceil(float64(total) / float64(limit)))
	}

	result := models.SubscriptionListPagination{
		Subscriptions: subs,
		CurrentPage:   page,
		LastPage:      lastPage,
		Limit:         limit,
		TotalRecords:  total,
	}
	if page == -1 || limit == -1 {
		result.CurrentPage = 1
		result.LastPage = 1
	}

	utils.RespondWithJSON(w, http.StatusOK, result)
}

func GetSubscriptionByIDHandler(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized.")
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid ID.")
		return
	}

	sub, err := db.GetSubscriptionByID(id)
	if err != nil {
		slog.Error("GetSubscriptionByID() failed", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusNotFound, "Subscription not found.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, sub)
}

func RevokeSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized.")
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid ID.")
		return
	}

	var payload models.RevokeSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.CancelReason == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "cancel_reason is required.")
		return
	}

	if err := db.RevokeSubscription(id, payload.CancelReason); err != nil {
		slog.Error("RevokeSubscription() failed", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not revoke subscription.")
		return
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

func UpdateSubscriptionPriceHandler(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized.")
		return
	}

	var payload models.UpdateSubscriptionPriceRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.Price < 15 || payload.Price > 30 {
		utils.RespondWithError(w, http.StatusBadRequest, "Price must be between 15 and 30.")
		return
	}

	if err := db.UpdateFinanceSettingByKey("subscription_price", payload.Price); err != nil {
		slog.Error("UpdateFinanceSettingByKey() failed", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not update subscription price.")
		return
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

func GetSubscriptionPriceHandler(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized.")
		return
	}

	price, err := db.GetFinanceSettingByKey("subscription_price")
	if err != nil {
		slog.Error("GetFinanceSettingByKey() failed", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not fetch subscription price.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]float64{"price": price})
}
