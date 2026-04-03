package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"log/slog"
	"net/http"
	"strconv"
	"time"
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

func GetAllItemsStats(w http.ResponseWriter, r *http.Request){
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	var timeParam *time.Time
	var err error
	timeUrl := r.URL.Query().Get("timeframe")
	if timeUrl != "" && timeUrl != "all"{
		var t time.Time
		switch timeUrl {
		case "today":
			t = time.Now().AddDate(0, 0, -1)
		case "last_3_days":
			t = time.Now().AddDate(0, 0, -3)
		case "last_week":
			t = time.Now().AddDate(0, 0, -7)
		case "last_month":
			t = time.Now().AddDate(0, -1, 0)
		case "last_year":
			t = time.Now().AddDate(-1, 0, 0)
		default:
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid timeframe.")
			return
		}
		timeParam = &t
	}
	
	slog.Debug("debug", "timeParam", timeParam)
	
	// total active items
	status := "approved"
	activeItems, err := db.GetItemsCountByStatus(&status)
	if err != nil {
		slog.Error("GetActiveItemsCount() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	// total new items since last month
	newItemsSince, err := db.GetTotalItemsSince(time.Now().AddDate(0, -1, 0))
	if err != nil {
		slog.Error("GetTotalItemsSince() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	// total pending items
	status = "pending"
	pendingItems, err := db.GetItemsCountByStatus(&status)
	if err != nil {
		slog.Error("GetItemsCountByStatus() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	// total transactions since last month
	newTransactionsSince, err := db.GetTotalTransactionsSince(time.Now().AddDate(0, -1, 0))
	if err != nil {
		slog.Error("GetTotalTransactionsSince() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	// total transactions
	status="purchased"
	totalTransactions, err := db.GetTotalTransactionsByStatus(status, timeParam)
	if err != nil {
		slog.Error("GetTotalTransactions() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	totalListings, err := db.GetTotalListings(timeParam)
	if err != nil {
		slog.Error("GetTotalListings() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}
	totalDeposits, err := db.GetTotalDeposits(timeParam)
	if err != nil {
		slog.Error("GetTotalDeposits() failed", "controller", "GetAllItemsStats", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
		return
	}

	materials := []string{"wood", "metal", "textile", "glass", "plastic", "other", "mixed"}
	var totalMaterials []int
	for _, material := range materials {
		count, err := db.GetTotalItemsByMaterialSince(material, timeParam)
		if err != nil {
			slog.Error("GetTotalItemsByMaterialSince() failed", "controller", "GetAllItemsStats", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching items.")
			return
		}
		totalMaterials = append(totalMaterials, count)
	}

	result := models.ItemAdminStats{
		ActiveItems:          activeItems,
		PendingItems:         pendingItems,
		NewItemsSince:        newItemsSince,
		NewTransactionsSince: newTransactionsSince,
		TotalTransactions:    totalTransactions,
		TotalListings:        totalListings,
		TotalDeposits:        totalDeposits,
		TotalWood:            totalMaterials[0],
		TotalMetal:           totalMaterials[1],
		TotalTextile:         totalMaterials[2],
		TotalGlass:           totalMaterials[3],
		TotalPlastic:         totalMaterials[4],
		TotalOther:           totalMaterials[5],
		TotalMixed:           totalMaterials[6],
	}

	utils.RespondWithJSON(w, http.StatusOK, result)
}

func DeleteItemById(w http.ResponseWriter, r *http.Request){
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" && role != "user" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	idString := r.PathValue("item_id")
	if idString == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Item ID is required.")
		return
	}

	id_item, err := strconv.Atoi(idString)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "DeleteItemById", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid item ID.")
		return
	}

	// check exist
	exist, err := db.CheckItemExistByItemId(id_item)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "DeleteItemById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
		return
	}

	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID " + idString + " not found.")
		return
	}

	err = db.DeleteItemById(id_item)
	if err != nil {
		slog.Error("DeleteItemById() failed", "controller", "DeleteItemById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
		return
	}

	var entityType string
	isListing, err := db.CheckListingOrDepositByItemId(id_item)
	if err != nil {
		slog.Error("CheckListingOrDepositByItemId() failed", "controller", "DeleteItemById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
		return
	}
	if isListing {
		entityType = "listing"
	} else {
		entityType = "deposit"
	}

	err = db.InsertHistory(entityType, id_item, "delete", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"is_deleted": false}, map[string]interface{}{"is_deleted": true})
	if err != nil {
		slog.Error("InsertHistory() failed", "controller", "DeleteItemById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
		return
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}


func GetItemDetails(w http.ResponseWriter, r *http.Request){
	idString := r.PathValue("item_id")
	if idString == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Item ID is required.")
		return
	}

	id_item, err := strconv.Atoi(idString)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "GetItemDetails", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid item ID.")
		return
	}

	exist, err := db.CheckItemExistByItemId(id_item)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "GetItemDetails", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching item.")
		return
	}

	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID " + idString + " not found.")
		return
	}

	item, err := db.GetItemDetailsByItemId(id_item)
	if err != nil {
		slog.Error("GetItemDetailsByItemId() failed", "controller", "GetItemDetails", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching item.")
		return
	}
	
	// get photo
	photos, err := db.GetPhotosPathsByObjectId(id_item, "item")
	if err != nil {
		slog.Error("GetPhotosPathsByObjectId() failed", "controller", "GetItemDetails", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching item.")
		return
	}
	item.Photos = photos

	// get username of user who posted the item
	username, err := db.GetUsernameById(item.IdUser)
	if err != nil {
		slog.Error("GetUsernameById() failed", "controller", "GetItemDetails", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching item.")
		return
	}
	item.Username = username

	utils.RespondWithJSON(w, http.StatusOK, item)
}