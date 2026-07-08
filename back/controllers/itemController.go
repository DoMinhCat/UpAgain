package controllers

import (
	"backend/cron"
	"backend/db"
	"backend/models"
	"backend/utils"
	"backend/utils/geocode"
	helpers "backend/utils/helpers"
	"backend/utils/onesignal"
	stripe "backend/utils/stripe"
	validations "backend/utils/validations"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

// GetAllItems godoc
// @Summary      Get all items
// @Description  Get a paginated list of all items with optional filters for search, sort, status, material, and category.
// @Tags         item
// @Security     ApiKeyAuth
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
// @Router       /items/ [get]
func GetAllItems(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
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

	if role == "admin" {
		filters.IncludePurchased = query.Get("include_purchased")
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
// @Router       /items/count/ [get]
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
// @Router       /items/{item_id}/ [delete]
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
		if status == "completed" || latestTransaction.Action == "reserved" || latestTransaction.Action == "purchased" {
			utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+idString+" is already purchased or reserved.")
			return
		}
	}

	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, "Item with ID "+idString+" not found.")
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

	if role == "admin" {
		err = db.InsertHistory(entityType, id_item, "delete", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"is_deleted": false}, map[string]interface{}{"is_deleted": true})
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "DeleteItemById", "error", err)
		}
	}

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
// @Router       /items/{item_id}/ [get]
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

	// calculate item score
	score, err := helpers.CalculateScore(item.Material, item.Weight)
	if err != nil {
		slog.Error("CalculateScore() failed", "controller", "GetItemDetails", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while fetching item.")
		return
	}
	item.Score = score

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
// @Router       /items/{item_id}/ [patch]
func UpdateItemStatusById(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role == "employee" || role == "pro" {
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

	itemDetails, err := db.GetItemDetailsByItemId(id_item)
	if err != nil {
		slog.Error("GetItemDetailsByItemId() failed", "controller", "DeleteItemById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating item's status.")
		return
	}
	status := itemDetails.Status

	statusLatestTx, err := db.GetTransactionLatestStatusByItemId(id_item)
	if err != nil {
		slog.Error("GetTransactionLatestStatusByItemId() failed", "controller", "DeleteItemById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while deleting item.")
		return
	}

	if statusLatestTx == "reserved" || statusLatestTx == "purchased" {
		utils.RespondWithError(w, http.StatusConflict, "This item is already purchased or reserved.")
		return
	}

	// validate status flow
	switch payload.Status {
	case "deleted":
		// check status
		if status == "completed" {
			utils.RespondWithError(w, http.StatusConflict, "Item with ID "+idString+" has already been purchased.")
			return
		}

	case "pending":
		if status == "completed" {
			utils.RespondWithError(w, http.StatusConflict, "Item with ID "+idString+" has already been purchased.")
			return
		}
	case "approved":
		if status != "refused" && status != "pending" {
			utils.RespondWithError(w, http.StatusConflict, "Item with ID "+idString+" can't be approved at the moment.")
			return
		}
	}
	oldStatus, _ := db.GetItemStatusByItemId(id_item)

	err = db.UpdateItemStatusById(id_item, payload.Status, "")
	if err != nil {
		slog.Error("UpdateItemStatusById() failed", "controller", "UpdateItemStatusById", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating item.")
		return
	}

	if payload.Status == "refused" || payload.Status == "approved" {
		// onesignal to user about item status update
		notiPayload := onesignal.HandleItemNotiPayload{
			ItemId:    id_item,
			AccountId: itemDetails.IdUser,
			Status:    payload.Status,
		}
		go func() {
			errNoti := onesignal.HandleItemStatusChangeNoti(notiPayload)
			if errNoti != nil {
				slog.Warn("HandleItemStatusChangeNoti failed", "controller", "UpdateItemStatusById", "error", errNoti)
			}
		}()
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

	if payload.Status == "approved" && itemDetails.Category == "listing" {
		// Notify premium pros subscribed to this material
		// Error should not block the status update, log a warning if it fails
		go func() {
			errNoti := onesignal.HandleSmartAlertsNoti(id_item)
			if errNoti != nil {
				slog.Warn("HandleSmartAlertsNoti failed", "controller", "UpdateItemStatusById", "error", errNoti)
			}
		}()
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Item status updated successfully."})
}

// CreateItem godoc
// @Summary      Create a new item
// @Description  Create a new item (listing or deposit). Supports multipart/form-data for image uploads.
// @Tags         item
// @Security     ApiKeyAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        title          formData  string  true   "Item title"
// @Param        description    formData  string  true   "Item description"
// @Param        price          formData  int     true   "Item price"
// @Param        weight         formData  int     true   "Item weight"
// @Param        material       formData  string  true   "Item material"
// @Param        state          formData  string  true   "Item state"
// @Param        category       formData  string  true   "Item category (listing or deposit)"
// @Param        images         formData  file    true   "Item images"
// @Param        id_container   formData  int     false  "Container ID (for deposit)"
// @Param        street         formData  string  false  "Street (for listing)"
// @Param        city_name      formData  string  false  "City name (for listing)"
// @Param        postal_code    formData  string  false  "Postal code (for listing)"
// @Success      200            {object}  map[string]string  "Item created successfully"
// @Failure      400            {object}  nil  "Invalid request body or parameters"
// @Failure      401            {object}  nil  "Unauthorized"
// @Failure      500            {object}  nil  "Internal server error"
// @Router       /items/ [post]
func CreateItem(w http.ResponseWriter, r *http.Request) {
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id

	var payload models.ItemCreateRequest
	err := r.ParseMultipartForm(32 << 20) // 32MB limit
	if err != nil {
		slog.Error("r.ParseMultipartForm() failed", "controller", "CreateItem", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Upload size exceeds 32MB.")
		return
	}
	payload.Title = r.FormValue("title")
	payload.Description = r.FormValue("description")
	payload.Category = r.FormValue("category")
	payload.Material = r.FormValue("material")
	payload.State = r.FormValue("state")
	price, err := strconv.ParseFloat(r.FormValue("price"), 64)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "CreateItem", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid price.")
		return
	}
	payload.Price = float64(price)
	weight, err := strconv.ParseFloat(r.FormValue("weight"), 64)
	if err != nil {
		slog.Error("Atoi() failed", "controller", "CreateItem", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid weight.")
		return
	}
	payload.Weight = weight
	payload.IdUser = idRequestor

	// sanitize payload
	payload.Title = strings.TrimSpace(payload.Title)
	payload.Description = strings.TrimSpace(payload.Description)
	payload.Category = strings.ToLower(strings.TrimSpace(payload.Category))
	payload.Material = strings.ToLower(strings.TrimSpace(payload.Material))
	payload.State = strings.ToLower(strings.TrimSpace(payload.State))

	// validate payload
	validation := validations.ValidateItemCreation(payload)
	if !validation.Success {
		utils.RespondWithError(w, validation.Error, validation.Message.Error())
		return
	}

	// at least one photo
	files := r.MultipartForm.File["images"]
	if len(files) == 0 {
		utils.RespondWithError(w, http.StatusBadRequest, "At least one photo is required.")
		return
	}

	// call to db to insert into items
	id_item, err := db.CreateItem(payload)
	if err != nil {
		slog.Error("CreateItem() failed", "controller", "CreateItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating item.")
		return
	}

	// upload and insert images
	for _, file := range files {
		path, err := helpers.SaveUploadedFile(file, "images/items")
		if err != nil {
			slog.Error("SaveUploadedFile() failed", "controller", "CreateItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "Error saving images.")
			return
		}
		payload.Photos = append(payload.Photos, path)
	}
	for i, imgPath := range payload.Photos {
		imagePayload := models.PhotoInsertRequest{
			Path:       imgPath,
			IsPrimary:  i == 0,
			ObjectType: "item",
			FkId:       id_item,
		}
		err = db.InsertImage(imagePayload)
		if err != nil {
			slog.Error("db.InsertImage() failed", "controller", "CreateItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating the item.")
			return
		}
	}

	// insert into deposit or listing based on category
	if payload.Category == "deposit" {
		idContainer, err := strconv.Atoi(r.FormValue("id_container"))
		if err != nil {
			slog.Error("Atoi() failed", "controller", "CreateItem", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid container ID.")
			return
		}
		payload.DepositInfo.IdContainer = idContainer
		payload.DepositInfo.IdItem = id_item

		// check container
		exist, err := db.CheckContainerExistById(idContainer)
		if err != nil {
			slog.Error("CheckContainerExistById() failed", "controller", "CreateItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating item.")
			return
		}
		if !exist {
			utils.RespondWithError(w, http.StatusBadRequest, "Container with ID "+strconv.Itoa(idContainer)+" does not exist.")
			return
		}
		status, err := db.GetContainerStatusById(idContainer)
		if err != nil {
			slog.Error("GetContainerStatusById() failed", "controller", "CreateItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating item.")
			return
		}
		if status == "maintenance" {
			utils.RespondWithError(w, http.StatusBadRequest, "Container with ID "+strconv.Itoa(idContainer)+" is currently under maintenance. Please try again later.")
			return
		}
		err = db.CreateDeposit(payload.DepositInfo)
		if err != nil {
			slog.Error("CreateDeposit() failed", "controller", "CreateItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating item.")
			return
		}
	} else {
		payload.ListingInfo.Street = r.FormValue("street")
		payload.ListingInfo.CityName = r.FormValue("city_name")
		payload.ListingInfo.PostalCode = r.FormValue("postal_code")
		payload.ListingInfo.IdItem = id_item

		// resolve coordinates
		addressToResolve := models.Address{
			Street:     payload.ListingInfo.Street,
			PostalCode: payload.ListingInfo.PostalCode,
			City:       payload.ListingInfo.CityName,
		}
		coordinates, err := geocode.AddressToCoor(addressToResolve)
		if err != nil {
			if err.Error() == "ZERO_RESULTS" {
				utils.RespondWithError(w, http.StatusBadRequest, "Invalid address")
				return
			}
			if err.Error() == "INVALID_ADDRESS" {
				utils.RespondWithError(w, http.StatusBadRequest, "L'adresse fournie n'est pas assez précise, veuillez fournir une autre adresse.")
				return
			}
			slog.Error("AddressToCoor() failed", "controller", "CreateItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating item.")
			return
		}
		payload.ListingInfo.Lat = coordinates.Lat
		payload.ListingInfo.Lng = coordinates.Lng
		err = db.CreateListing(payload.ListingInfo)
		if err != nil {
			slog.Error("CreateListing() failed", "controller", "CreateItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating item.")
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Item created successfully."})
}

// GetMyItems godoc
// @Summary      Get my items
// @Description  Get a paginated list of items belonging to the current user (or items interacted with if pro).
// @Tags         item
// @Security     ApiKeyAuth
// @Produce      json
// @Param        page      query     int     false  "Page number"
// @Param        limit     query     int     false  "Items per page"
// @Param        search    query     string  false  "Search by title"
// @Param        sort      query     string  false  "Sort order"
// @Param        status    query     string  false  "Filter by status (user: pending/approved/refused/reserved/sold/to_drop_off | pro: reserved/bought/to_retrieve)"
// @Param        material  query     string  false  "Filter by material"
// @Param        category  query     string  false  "Filter by category (listing or deposit)"
// @Success      200       {object}  models.ItemListPagination
// @Failure      400       {object}  nil  "Invalid query parameters"
// @Failure      401       {object}  nil  "Unauthorized"
// @Failure      500       {object}  nil  "Internal server error"
// @Router       /items/me/ [get]
func GetMyItems(w http.ResponseWriter, r *http.Request) {
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id
	var err error
	// default pagination
	page := -1
	limit := -1

	query := r.URL.Query()
	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetMyItems", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching items.")
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			slog.Error("Atoi() failed", "controller", "GetMyItems", "error", err)
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching items.")
			return
		}
	}

	filters := models.ItemFilters{
		Search:   query.Get("search"),
		Status:   query.Get("status"),
		Material: query.Get("material"),
		Category: query.Get("category"),
		Sort:     query.Get("sort"),
	}

	role := r.Context().Value("user").(models.AuthClaims).Role
	var items []models.Item
	var total int
	if role == "pro" {
		items, total, err = db.GetProItemsPaginated(idRequestor, page, limit, filters)
	} else {
		items, total, err = db.GetUserItemsPaginated(idRequestor, page, limit, filters)
	}

	if err != nil {
		slog.Error("GetMyItemsPaginated() failed", "controller", "GetMyItems", "error", err)
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

// ReserveItem godoc
// @Summary      Reserve an item
// @Description  Allows a professional to reserve an item if it is approved and not already reserved/purchased.
// @Tags         item
// @Security     ApiKeyAuth
// @Produce      json
// @Param        item_id  path      int  true  "Item ID"
// @Success      200      {object}  map[string]string  "Returns success message"
// @Failure      400      {object}  nil                "Item not found, invalid status, or already reserved/purchased"
// @Failure      401      {object}  nil                "Unauthorized"
// @Failure      500      {object}  nil                "Internal server error"
// @Router       /items/{item_id}/reserve [post]
func ReserveItem(w http.ResponseWriter, r *http.Request) {
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id
	proDetails, err := db.GetProDetailsById(idRequestor)
	if err != nil {
		slog.Error("GetProDetailsById() failed", "controller", "ReserveItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while reserving item.")
		return
	}
	if !proDetails.IsPremium {
		count, err := db.GetProPurchasedCountInLastMonth(idRequestor)
		if err != nil {
			slog.Error("GetProPurchasedCountInLastMonth() failed", "controller", "ReserveItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while reserving item.")
			return
		}
		if count >= 10 {
			utils.RespondWithError(w, http.StatusForbidden, "You have reached the monthly purchase limit for freemium users.")
			return
		}
	}

	item_id, err := strconv.Atoi(r.PathValue("item_id"))
	if err != nil {
		slog.Error("Atoi() failed", "controller", "ReserveItem", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while reserving item.")
		return
	}

	exist, err := db.CheckItemExistByItemId(item_id)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "ReserveItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while reserving item.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+strconv.Itoa(item_id)+" does not exist.")
		return
	}
	status, err := db.GetItemStatusByItemId(item_id)
	if err != nil {
		slog.Error("GetItemStatusByItemId() failed", "controller", "ReserveItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while reserving item.")
		return
	}
	if status != "approved" {
		utils.RespondWithError(w, http.StatusBadRequest, "Item can't be reserved at the moment.")
		return
	}

	// check if item is already reserved or purchased
	latestTx, err := db.GetTransactionLatestStatusByItemId(item_id)
	if err != nil {
		slog.Error("GetTransactionLatestStatusByItemId() failed", "controller", "ReserveItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while reserving item.")
		return
	}
	if latestTx == "reserved" {
		utils.RespondWithError(w, http.StatusBadRequest, "Item is already reserved.")
		return
	} else if latestTx == "purchased" {
		utils.RespondWithError(w, http.StatusBadRequest, "Item is already purchased.")
		return
	}

	_, err = db.InsertTransaction(models.TransactionInsert{
		Action: "reserved",
		IdItem: item_id,
		IdPro:  idRequestor,
	})
	if err != nil {
		slog.Error("InsertTransaction() failed", "controller", "ReserveItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while reserving item.")
		return
	}

	// onesignal to user about item reservation
	itemDetails, err := db.GetItemDetailsByItemId(item_id)
	if err != nil {
		slog.Error("GetItemDetailsByItemId() failed", "controller", "ReserveItem", "error", err)
	} else {
		notiPayload := onesignal.HandleItemNotiPayload{
			ItemId:    item_id,
			AccountId: itemDetails.IdUser,
			Status:    "reserved",
		}
		go func() {
			errNoti := onesignal.HandleItemStatusChangeNoti(notiPayload)
			if errNoti != nil {
				slog.Warn("HandleItemStatusChangeNoti failed for reservation", "controller", "ReserveItem", "error", errNoti)
			}
		}()
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Item reserved successfully."})
}

// PurchaseItem godoc
// @Summary      Purchase an item
// @Description  Initiates or confirms purchase of an item. For paid items, it generates a Stripe checkout URL on the first call, and registers the transaction details on the second call once paid.
// @Tags         item
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        item_id  path      int  true  "Item ID"
// @Param        body     body      models.ItemPurchaseRequest  false  "Stripe verification / checkout details"
// @Success      200      {object}  map[string]string  "Checkout URL for payment page redirect or confirmation message"
// @Failure      400      {object}  nil                "Invalid requests or validation errors"
// @Failure      409      {object}  nil                "Item already purchased"
// @Failure      500      {object}  nil                "Internal server error"
// @Router       /items/{item_id}/purchase [post]
func PurchaseItem(w http.ResponseWriter, r *http.Request) {
	item_id, err := strconv.Atoi(r.PathValue("item_id"))
	if err != nil {
		slog.Error("Atoi() failed", "controller", "PurchaseItem", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while purchasing item.")
		return
	}

	// validations
	exist, err := db.CheckItemExistByItemId(item_id)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "PurchaseItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+strconv.Itoa(item_id)+" does not exist.")
		return
	}
	status, err := db.GetItemStatusByItemId(item_id)
	if err != nil {
		slog.Error("GetItemStatusByItemId() failed", "controller", "PurchaseItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
		return
	}
	if status != "approved" {
		utils.RespondWithError(w, http.StatusBadRequest, "Item can't be purchased at the moment.")
		return
	}
	latestTx, err := db.GetTransactionLatestStatusByItemId(item_id)
	if err != nil {
		slog.Error("GetTransactionLatestStatusByItemId() failed", "controller", "PurchaseItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
		return
	}
	if latestTx == "purchased" {
		utils.RespondWithError(w, http.StatusConflict, "Item is already purchased.")
		return
	}

	// get meta data
	itemDetails, err := db.GetItemDetailsByItemId(item_id)
	if err != nil {
		slog.Error("GetItemDetailsByItemId() failed", "controller", "PurchaseItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
		return
	}
	depositDetails, err := db.GetDepositDetailsById(item_id)
	if err != nil {
		slog.Error("GetDepositDetailsById() failed", "controller", "PurchaseItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
		return
	}
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id

	proDetails, err := db.GetProDetailsById(idRequestor)
	if err != nil {
		slog.Error("GetProDetailsById() failed", "controller", "PurchaseItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
		return
	}
	if !proDetails.IsPremium {
		count, err := db.GetProPurchasedCountInLastMonth(idRequestor)
		if err != nil {
			slog.Error("GetProPurchasedCountInLastMonth() failed", "controller", "PurchaseItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
			return
		}
		if count >= 10 {
			utils.RespondWithError(w, http.StatusForbidden, "You have reached the monthly purchase limit for freemium users.")
			return
		}
	}

	latestTxOfPro, err := db.GetLatestTransactionOfPro(idRequestor, item_id)
	if err != nil {
		slog.Error("GetLatestTransactionOfPro() failed", "controller", "PurchaseItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
		return
	}
	if latestTxOfPro.Action == "purchased" {
		utils.RespondWithError(w, http.StatusConflict, "You already purchased this item.")
		return
	}
	// if already reserved, get existing transactions's uuid to insert later
	txUuid := ""
	if latestTxOfPro.Action == "reserved" {
		txUuid = latestTxOfPro.IdTransaction
		// if buy right away without reservation, start new transaction with new uuid
	} else {
		txUuid = uuid.New().String()
	}
	itemCategory := itemDetails.Category
	sellerId := itemDetails.IdUser

	// get container schedule to calculate next available date
	nextAvailableDateContainer := time.Time{}
	if itemCategory == "deposit" {
		containerSchedule, err := db.GetContainerScheduleByContainerId(depositDetails.ContainerId)
		if err != nil {
			slog.Error("GetContainerScheduleByContainerId() failed", "controller", "PurchaseItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
			return
		}
		nextAvailableDateContainer = helpers.FindNextAvailableDate(containerSchedule)
	}

	// price are in euros here
	totalPriceToInsert := 0.0
	commissionRateToInsert := 0.0 // in %

	// PAID BRANCH
	if itemDetails.Price > 0 {
		// only when not free then request contain a payload
		var payload models.ItemPurchaseRequest
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload.")
			return
		}
		// handle price adjustment (commission rate of stripe and UpAgain at moment of purchase)
		itemPriceInCents := itemDetails.Price * 100
		stripeCommissionTotal := itemPriceInCents*stripe.StripeCommissionRatePercentEU + float64(stripe.StripeCommissionFixedInCentsEU)
		// our rate is store in %
		upAgainCommissionRate, err := db.GetFinanceSettingByKey("commission_rate")
		if err != nil {
			slog.Error("GetFinanceSettingByKey() failed", "controller", "PurchaseItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
			return
		}
		upAgainCommTotal := itemPriceInCents * (upAgainCommissionRate / 100)
		// vat
		vatTotalInCents := itemPriceInCents * stripe.VatRate
		finalPriceToPayInCents := itemPriceInCents + upAgainCommTotal + stripeCommissionTotal + vatTotalInCents

		// 1st phase: redirect user to stripe to pay by returning a checkout link to stripe
		if !payload.Paid {
			frontendOrigin := utils.GetFrontOrigin()
			if payload.OriginUrl == "" || (!strings.HasPrefix(payload.OriginUrl, frontendOrigin) && !strings.HasPrefix(payload.OriginUrl, "upagain://")) {
				utils.RespondWithError(w, http.StatusBadRequest, "Invalid origin URL.")
				return
			}
			successUrlSeparator := "?"
			if strings.Contains(payload.OriginUrl, "?") {
				successUrlSeparator = "&"
			}
			checkoutUrl, err := stripe.CreateStripeSession(stripe.CheckoutRequest{
				EntityName:   itemDetails.Title,
				PriceInCents: int64(finalPriceToPayInCents),
				// return to the origin URL with param, frontend will check for that params to handle next steps
				SuccessURL: payload.OriginUrl + successUrlSeparator + "payment=success&sessionid={CHECKOUT_SESSION_ID}",
				CancelURL:  payload.OriginUrl + successUrlSeparator + "payment=cancel",
			})
			if err != nil {
				slog.Error("CreateStripeSession() failed", "controller", "PurchaseItem", "error", err)
				utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating checkout session.")
				return
			}
			utils.RespondWithJSON(w, http.StatusOK, map[string]string{"checkout_url": checkoutUrl})
			return
		} else {
			// 2nd call: user got redirected back after having paid in stripe
			commissionRateToInsert = upAgainCommissionRate
			totalPriceToInsert = finalPriceToPayInCents / 100
		}
	}

	// init dynamic variables to be inserted into transaction based on price and listing/deposit
	confirm_code := ""
	barcodePath := ""
	code6 := ""
	// handle genertion of confirm code or barcode
	if itemCategory == "listing" {
		confirm_code = helpers.GenerateRandom6CharCode()
	} else {
		code6 = helpers.GenerateRandom6CharCode()
	}

	insertedTxId, err := db.InsertTransaction(models.TransactionInsert{
		IdTransaction:  txUuid,
		Action:         "purchased",
		IdItem:         item_id,
		IdPro:          idRequestor,
		ItemPrice:      &itemDetails.Price,
		CommissionRate: &commissionRateToInsert,
		TotalPrice:     &totalPriceToInsert,
		ConfirmCode:    &confirm_code,
	})
	if err != nil {
		slog.Error("InsertTransaction() failed", "controller", "PurchaseItem", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
		return
	}

	if itemCategory == "deposit" {
		barcodePath, err = helpers.GenerateAndSaveBarcode(models.BarCodeData{
			Id:            insertedTxId,
			IdTransaction: txUuid,
			UserType:      "u",
			IdAccount:     sellerId,
		})
		if err != nil {
			slog.Error("GenerateAndSaveBarcode() failed", "controller", "PurchaseItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
			return
		}

		err = db.InsertBarcode(models.BarCodeInsert{
			Code6Digit:    code6,
			BarcodePath:   barcodePath,
			UserType:      "user",
			IdAccount:     sellerId,
			IdDeposit:     item_id,
			IdTransaction: txUuid,
			ValidFrom:     nextAvailableDateContainer,
		})
		if err != nil {
			slog.Error("InsertBarcode() failed", "controller", "PurchaseItem", "error", err)
			utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while purchasing item.")
			return
		}

		// trigger cron job right now to update container status in case available date for container is now
		go cron.UpdateActiveCode()
	}
	// onesignal to user about item purchase
	notiPayload := onesignal.HandleItemNotiPayload{
		ItemId:    item_id,
		AccountId: sellerId,
		Status:    "purchased",
	}
	go func() {
		errNoti := onesignal.HandleItemStatusChangeNoti(notiPayload)
		if errNoti != nil {
			slog.Warn("HandleItemStatusChangeNoti failed for purchase", "controller", "PurchaseItem", "error", errNoti)
		}
	}()

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Item purchased successfully."})
}

// CancelItemReservation godoc
// @Summary      Cancel an item reservation
// @Description  Allows a professional or an admin to cancel a previously held item reservation.
// @Tags         item
// @Security     ApiKeyAuth
// @Produce      json
// @Param        item_id  path      int  true  "Item ID"
// @Success      200      {object}  map[string]string  "Returns success message"
// @Failure      400      {object}  nil                "Invalid request or item does not exist"
// @Failure      409      {object}  nil                "Item is not reserved"
// @Failure      500      {object}  nil                "Internal server error"
// @Router       /items/{item_id}/cancel [post]
func CancelItemReservation(w http.ResponseWriter, r *http.Request) {
	idRequestor := r.Context().Value("user").(models.AuthClaims).Id
	item_id, err := strconv.Atoi(r.PathValue("item_id"))
	if err != nil {
		slog.Error("Atoi() failed", "controller", "CancelItemReservation", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while cancelling item.")
		return
	}
	exist, err := db.CheckItemExistByItemId(item_id)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "CancelItemReservation", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while cancelling item.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+strconv.Itoa(item_id)+" does not exist.")
		return
	}
	status, err := db.GetItemStatusByItemId(item_id)
	if err != nil {
		slog.Error("GetItemStatusByItemId() failed", "controller", "CancelItemReservation", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while cancelling item.")
		return
	}
	if status != "approved" {
		utils.RespondWithError(w, http.StatusBadRequest, "Item can't be cancelled at the moment.")
		return
	}
	latestTx, err := db.GetTransactionLatestStatusByItemId(item_id)
	if err != nil {
		slog.Error("GetTransactionLatestStatusByItemId() failed", "controller", "CancelItemReservation", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while cancelling item.")
		return
	}
	if latestTx != "reserved" {
		utils.RespondWithError(w, http.StatusConflict, "Item can't be cancelled at the moment.")
		return
	}

	// get uuid
	uuid, err := db.GetTransactionLatestUuidOfPro(idRequestor, item_id)
	if err != nil {
		slog.Error("GetTransactionLatestUuidOfPro() failed", "controller", "CancelItemReservation", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while cancelling item.")
		return
	}
	// cancel transaction
	_, err = db.InsertTransaction(models.TransactionInsert{
		IdTransaction: uuid.String(),
		Action:        "cancelled",
		IdItem:        item_id,
		IdPro:         idRequestor,
	})
	if err != nil {
		slog.Error("InsertTransaction() failed", "controller", "CancelItemReservation", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while cancelling item.")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Item cancelled successfully."})
}

// ConfirmListingRetrieval godoc
// @Summary      Confirm listing retrieval
// @Description  Verifies the confirmation code provided by a user upon retrieving a purchased listing item and completes the transaction status.
// @Tags         item
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        item_id  path      int  true  "Item ID"
// @Param        body     body      models.ConfirmCodeRequest  true  "Confirmation code payload"
// @Success      200      {object}  map[string]string  "Returns success message"
// @Failure      400      {object}  nil                "Invalid payload or item does not exist"
// @Failure      403      {object}  nil                "Incorrect confirmation code"
// @Failure      409      {object}  nil                "Item not purchased or transaction cancelled"
// @Failure      500      {object}  nil                "Internal server error"
// @Router       /items/{item_id}/confirm [post]
func ConfirmListingRetrieval(w http.ResponseWriter, r *http.Request) {
	item_id, err := strconv.Atoi(r.PathValue("item_id"))
	if err != nil {
		slog.Error("Atoi() failed", "controller", "ConfirmListingRetrieval", "error", err)
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while confirming retrieval.")
		return
	}

	exist, err := db.CheckItemExistByItemId(item_id)
	if err != nil {
		slog.Error("CheckItemExistByItemId() failed", "controller", "ConfirmListingRetrieval", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while confirming retrieval.")
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusBadRequest, "Item with ID "+strconv.Itoa(item_id)+" does not exist.")
		return
	}

	// check if item is already purchased
	latestTx, err := db.GetTransactionLatestStatusByItemId(item_id)
	if err != nil {
		slog.Error("GetTransactionLatestStatusByItemId() failed", "controller", "ConfirmListingRetrieval", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while confirming retrieval.")
		return
	}
	if latestTx == "cancelled" {
		utils.RespondWithError(w, http.StatusConflict, "This transaction has been cancelled.")
		return
	}
	if latestTx != "purchased" {
		utils.RespondWithError(w, http.StatusConflict, "This item has not been purchased yet.")
		return
	}

	//extract payload
	var payload models.ConfirmCodeRequest
	err = json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}
	payload.ConfirmCode = strings.TrimSpace(payload.ConfirmCode)

	dbCode, err := db.GetLatestConfirmCodeByItemId(item_id)
	if err != nil {
		slog.Error("GetLatestConfirmCodeByItemId() failed", "controller", "ConfirmListingRetrieval", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while confirming retrieval.")
		return
	}
	if payload.ConfirmCode != dbCode {
		utils.RespondWithError(w, http.StatusForbidden, "Incorrect confirm code, please try again.")
		return
	}

	// all passed, change item's status to completed
	err = db.UpdateItemStatusById(item_id, "completed", "")
	if err != nil {
		slog.Error("UpdateItemStatusById() failed", "controller", "ConfirmListingRetrieval", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while confirming retrieval.")
		return
	}

	// update item owner's score
	item, err := db.GetItemDetailsByItemId(item_id)
	if err != nil {
		slog.Error("GetItemDetailsByItemId() failed", "controller", "ConfirmListingRetrieval", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while confirming retrieval.")
		return
	}

	score, err := helpers.CalculateScore(item.Material, item.Weight)
	if err != nil {
		slog.Error("CalculateScore() failed", "controller", "ConfirmListingRetrieval", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating user's score.")
		return
	}
	err = db.UpdateUpcyclingScore(r.Context().Value("user").(models.AuthClaims).Id, score)
	if err != nil {
		slog.Error("UpdateUpcyclingScore() failed", "controller", "ConfirmListingRetrieval", "error", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while updating user's score.")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Retrieval confirmed."})
}
