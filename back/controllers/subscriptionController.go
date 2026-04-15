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

// GetAllSubscriptionsHandler godoc
// @Summary      Get all subscriptions
// @Description  Get a paginated list of all subscriptions with filtering by active status
// @Tags         subscription
// @Produce      json
// @Param        page    query     int     false  "Page number"
// @Param        limit   query     int     false  "Limit"
// @Param        active  query     bool    false  "Filter by active status"
// @Success      200     {object}  models.SubscriptionListPagination
// @Failure      401     {object}  nil  "Unauthorized"
// @Failure      500     {object}  nil  "Internal server error"
// @Router       /subscriptions/ [get]
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

// GetSubscriptionByIDHandler godoc
// @Summary      Get subscription by ID
// @Description  Get details of a specific subscription including user information
// @Tags         subscription
// @Produce      json
// @Param        id   path      int  true  "Subscription ID"
// @Success      200  {object}  models.SubscriptionWithUser
// @Failure      400  {object}  nil  "Invalid subscription ID"
// @Failure      401  {object}  nil  "Unauthorized"
// @Failure      404  {object}  nil  "Subscription not found"
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /subscriptions/{id}/ [get]
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
		utils.RespondWithError(w, http.StatusNotFound, "Subscription with ID "+strconv.Itoa(id)+" not found.")
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

// CancelSubscriptionHandler godoc
// @Summary      Cancel subscription
// @Description  Cancel an active subscription. Admin can cancel any, users can cancel their own.
// @Tags         subscription
// @Accept       json
// @Produce      json
// @Param        id    path      int     true  "Subscription ID"
// @Param        body  body      models.RevokeSubscriptionRequest  true  "Cancel reason payload"
// @Success      204   {object}  nil     "No Content"
// @Failure      400   {object}  nil     "Invalid request or missing cancel reason"
// @Failure      401   {object}  nil     "Unauthorized or forbidden"
// @Failure      404   {object}  nil     "Subscription not found"
// @Failure      500   {object}  nil     "Internal server error"
// @Router       /subscriptions/{id}/revoke/ [put]
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
		utils.RespondWithError(w, http.StatusNotFound, "Subscription with ID "+strconv.Itoa(id)+" not found.")
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

// UpdateSubscriptionPriceHandler godoc
// @Summary      Update subscription price
// @Description  Update the price of the premium subscription. Admin only.
// @Tags         subscription
// @Accept       json
// @Produce      json
// @Param        body  body      models.UpdateSubscriptionPriceRequest  true  "New price payload"
// @Success      204   {object}  nil     "No Content"
// @Failure      400   {object}  nil     "Invalid price"
// @Failure      401   {object}  nil     "Unauthorized"
// @Failure      500   {object}  nil     "Internal server error"
// @Router       /subscriptions/price/ [put]
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
// GetSubscriptionPriceHandler godoc
// @Summary      Get subscription price
// @Description  Get the current price of the premium subscription
// @Tags         subscription
// @Produce      json
// @Success      200  {object}  map[string]float64  "Current price"
// @Failure      401  {object}  nil                 "Unauthorized"
// @Failure      500  {object}  nil                 "Internal server error"
// @Router       /subscriptions/price/ [get]
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
