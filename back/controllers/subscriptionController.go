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
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	query := r.URL.Query()
	page, limit := 1, 10 // default value

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
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to fetch subscriptions.")
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
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid subscription ID.")
		return
	}

	exist, err := db.CheckSubscriptionExistById(id)
	if err != nil {
		slog.Error("CheckSubscriptionExistById() failed", "controller", "GetSubscriptionByIDHandler", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to fetch subscription.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Subscription with ID " + strconv.Itoa(id) + " not found.")
		return
	}

	sub, err := db.GetSubscriptionByID(id)
	if err != nil {
		slog.Error("GetSubscriptionByID() failed", "controller", "GetSubscriptionByIDHandler", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusNotFound, "Failed to fetch subscription.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, sub)
}

func CancelSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id
	if role != "admin" && role != "pro" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid subscription ID.")
		return
	}

	exist, err := db.CheckSubscriptionExistById(id)
	if err != nil {
		slog.Error("CheckSubscriptionExistById() failed", "controller", "CancelSubscriptionHandler", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to cancel subscription.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Subscription with ID " + strconv.Itoa(id) + " not found.")
		return
	}

	sub, err := db.GetSubscriptionByID(id)
	if err != nil {
		slog.Error("GetSubscriptionByID() failed", "controller", "GetSubscriptionByIDHandler", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusNotFound, "Failed to fetch subscription.")
		return
	}

	// if not admin then can cancel only his subscription
	if role != "admin" && sub.IdPro != idRequestor {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	var payload models.RevokeSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.CancelReason == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "You have to provide a cancel reason.")
		return
	}

	if err := db.RevokeSubscription(id, payload.CancelReason); err != nil {
		slog.Error("RevokeSubscription() failed", "controller", "CancelSubscriptionHandler", "id", id, "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to cancel subscription.")
		return
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

func UpdateSubscriptionPriceHandler(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	var payload models.UpdateSubscriptionPriceRequest
	// we can set as much as we want to
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "You have to provide a price.")
		return
	}

	if payload.Price < 0 {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid price.")
		return
	}

	if err := db.UpdateFinanceSettingByKey("subscription_price", payload.Price); err != nil {
		slog.Error("UpdateFinanceSettingByKey() failed", "controller", "UpdateSubscriptionPriceHandler", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update subscription price.")
		return
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// TODO: refactor this to finance route that get all finance settings based on query param ?key=key1/2/3/...
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
