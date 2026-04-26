package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

// GetAllItems godoc
// @Summary      Get all items
// @Description  Get a paginated list of all items with optional filters for search, sort, status, material, and category.
// @Tags         item
// @Produce      json
// @Param        page      query     int     false  "Page number"
// @Param        limit     query     int     false  "Items per page"
// @Param        search    query     string  false  "Search by title or username"
// @Param        sort      query     string  false  "Sort order"
// @Param        status    query     string  false  "Filter by status"
// @Param        material  query     string  false  "Filter by material"
// @Param        category  query     string  false  "Filter by category (listing or deposit)"
// @Success      200       {object}  models.ItemListPagination
// @Failure      400       {object}  nil  "Invalid query parameters"
// @Failure      500       {object}  nil  "Internal server error"
// @Router       /admin/items/ [get]
func GetAllItems(w http.ResponseWriter, r *http.Request) {
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
		Status:   query.Get("status"),
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

// GetAllItemsStats godoc
// @Summary      Get item statistics
// @Description  Get admin-level statistics for items including counts by status, material, category, and timeframe.
// @Tags         item
// @Security     ApiKeyAuth
// @Produce      json
// @Param        timeframe  query     string  false  "Timeframe filter: today, last_3_days, last_week, last_month, last_year, all"
// @Success      200        {object}  models.ItemAdminStats
// @Failure      400        {object}  nil  "Invalid timeframe"
// @Failure      401        {object}  nil  "Unauthorized"
// @Failure      500        {object}  nil  "Internal server error"
// @Router       /admin/items/count/ [get]
func GetAllItemsStats(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	var timeParam *time.Time
	var err error
	timeUrl := r.URL.Query().Get("timeframe")
	if timeUrl != "" && timeUrl != "all" {
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
	status = "purchased"
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

// DeleteItemById godoc
// @Summary      Delete item
// @Description  Soft-delete an item (listing or deposit) by its ID. Admin can delete any item; users can only delete their own. Item that is reserved or completed can't be deleted
// @Tags         item
// @Security     ApiKeyAuth
// @Produce      json
// @Param        item_id  path      int  true  "Item ID"
// @Success      204      {object}  nil  "No Content"
// @Failure      400      {object}  nil  "Invalid ID"
// @Failure      401      {object}  nil  "Unauthorized"
// @Failure      404      {object}  nil  "Item not found"
// @Failure      500      {object}  nil  "Internal server error"
// @Router       /admin/items/{item_id}/ [delete]
func DeleteItemById(w http.ResponseWriter, r *http.Request) {
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

	// check status
	status, err := db.GetItemStatusByItemId(id_item)
	if err != nil {
		slog.Error("GetItemStatusByItemId() failed", "controller", "DeleteItemById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
		return
	}
	if status == "completed" {
		utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+idString+" has already been purchased.")
		return
	}
	transaction, err := db.GetTransactionsByItemId(id_item, -1, -1)
	if err != nil {
		slog.Error("GetTransactionsByItemId() failed", "controller", "DeleteItemById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
		return
	}

	if len(transaction) != 0 {
		latestTransaction := transaction[0]
		slog.Debug("latestTransaction", "controller", "DeleteItemById", "latestTransaction", latestTransaction)

		if status == "completed" || latestTransaction.Action == "reserved" || latestTransaction.Action == "purchased" {
			utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+idString+" is already purchased or reserved.")
			return
		}
	}

	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID "+idString+" not found.")
		return
	}

	// err = db.DeleteItemById(id_item)
	// if err != nil {
	// 	slog.Error("DeleteItemById() failed", "controller", "DeleteItemById", "error", err)
	// 	utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
	// 	return
	// }

	// var entityType string
	// isListing, err := db.CheckListingOrDepositByItemId(id_item)
	// if err != nil {
	// 	slog.Error("CheckListingOrDepositByItemId() failed", "controller", "DeleteItemById", "error", err)
	// 	utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
	// 	return
	// }
	// if isListing {
	// 	entityType = "listing"
	// } else {
	// 	entityType = "deposit"
	// }

	// err = db.InsertHistory(entityType, id_item, "delete", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"is_deleted": false}, map[string]interface{}{"is_deleted": true})
	// if err != nil {
	// 	slog.Error("InsertHistory() failed", "controller", "DeleteItemById", "error", err)
	// 	utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
	// 	return
	// }

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// GetItemDetails godoc
// @Summary      Get item details
// @Description  Get detailed information for a specific item including photos and owner username.
// @Tags         item
// @Security     ApiKeyAuth
// @Produce      json
// @Param        item_id  path      int  true  "Item ID"
// @Success      200      {object}  models.Item
// @Failure      400      {object}  nil  "Invalid ID"
// @Failure      404      {object}  nil  "Item not found"
// @Failure      500      {object}  nil  "Internal server error"
// @Router       /admin/items/{item_id}/ [get]
func GetItemDetails(w http.ResponseWriter, r *http.Request) {
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
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID "+idString+" not found.")
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

// UpdateItemStatusById godoc
// @Summary      Update item status
// @Description  Update the status of an item (pending, approved, refused, deleted, completed). Admin and users only.
// @Tags         item
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        item_id  path      int                          true  "Item ID"
// @Param        body     body      models.ItemStatusUpdateRequest  true  "New status"
// @Success      200      {object}  map[string]string  "Item status updated successfully"
// @Failure      400      {object}  nil  "Invalid ID or status"
// @Failure      401      {object}  nil  "Unauthorized"
// @Failure      404      {object}  nil  "Item not found"
// @Failure      500      {object}  nil  "Internal server error"
// @Router       /admin/items/{item_id}/ [patch]
func UpdateItemStatusById(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role == "employee" {
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
		slog.Error("Atoi() failed", "controller", "UpdateItemStatusById", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid item ID.")
		return
	}

	// check exist
	exist, err := db.CheckItemExistByItemId(id_item)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "UpdateItemStatusById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating item.")
		return
	}

	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID "+idString+" not found.")
		return
	}

	var payload models.ItemStatusUpdateRequest
	err = json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		slog.Error("Decode() failed", "controller", "UpdateItemStatusById", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body.")
		return
	}

	if payload.Status != "pending" && payload.Status != "approved" && payload.Status != "refused" && payload.Status != "deleted" && payload.Status != "completed" {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid status.")
		return
	}

	// validate if request delete
	if payload.Status == "deleted" {
		// check status
		status, err := db.GetItemStatusByItemId(id_item)
		if err != nil {
			slog.Error("GetItemStatusByItemId() failed", "controller", "DeleteItemById", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
			return
		}
		if status == "completed" {
			utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+idString+" has already been purchased.")
			return
		}
		transaction, err := db.GetTransactionsByItemId(id_item, -1, -1)
		if err != nil {
			slog.Error("GetTransactionsByItemId() failed", "controller", "DeleteItemById", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
			return
		}

		if len(transaction) != 0 {
			latestTransaction := transaction[0]
			if latestTransaction.Action == "reserved" || latestTransaction.Action == "purchased" {
				utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+idString+" is already purchased or reserved.")
				return
			}
		}
	}

	oldStatus, _ := db.GetItemStatusByItemId(id_item)

	err = db.UpdateItemStatusById(id_item, payload.Status)
	if err != nil {
		slog.Error("UpdateItemStatusById() failed", "controller", "UpdateItemStatusById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating item.")
		return
	}

	if role == "admin" {
		isListing, err := db.CheckListingOrDepositByItemId(id_item)
		if err != nil {
			slog.Error("CheckListingOrDepositByItemId() failed", "controller", "UpdateItemStatusById", "error", err)
		} else {
			entityType := "deposit"
			if isListing {
				entityType = "listing"
			}
			if payload.Status != "deleted" {
				db.InsertHistory(entityType, id_item, "update", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"status": oldStatus}, map[string]interface{}{"status": payload.Status})
			} else {
				db.InsertHistory(entityType, id_item, "delete", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"is_deleted": false}, map[string]interface{}{"is_deleted": true})
			}
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Item status updated successfully."})
}
