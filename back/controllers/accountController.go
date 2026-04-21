package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	validations "backend/utils/validations"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

// CreateAccount godoc
// @Summary      Create an account
// @Description  Creates a new account
// @Tags         account
// @Accept       json
// @Produce      json
// @Param        account body models.CreateAccountRequest true "Account details"
// @Success      201  {object}  nil  "Account created successfully"
// @Failure      400  {object}  nil  "Invalid request body or validation failed"
// @Failure      401  {object}  nil  "Unauthorized to create admin/employee account"
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /register/ [post]
func CreateAccount(w http.ResponseWriter, r *http.Request) {
	var newAccount models.CreateAccountRequest

	var err = json.NewDecoder(r.Body).Decode(&newAccount)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while creating an account for you.")
		slog.Error("invalid JSON request body", "error", err)
		return
	}

	role := "guest"
	if claims, ok := r.Context().Value("user").(models.AuthClaims); ok {
		role = claims.Role
	}

	if role == "employee" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to create an account.")
		return
	}

	validationResponse := validations.ValidateAccountCreation(newAccount)
	if !validationResponse.Success {
		utils.RespondWithError(w, validationResponse.Error, validationResponse.Message.Error())
		return
	}

	if newAccount.Role == "pro" && (newAccount.IsPremium == nil || newAccount.IsTrial == nil) {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing premium and/or trial status.")
		return
	}

	id_inserted, err := db.CreateAccount(newAccount)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while creating an account for you.")
		slog.Error("CreateAccount() failed", "controller", "CreateAccount", "error", err)
		return
	}

	roleToInsert := newAccount.Role
	if role == "admin" {
		roleToInsert = "employee"
	}
	err = db.InsertHistory(roleToInsert, id_inserted, "create", r.Context().Value("user").(models.AuthClaims).Id, nil, newAccount)
	if err != nil {
		slog.Error("InsertHistory() failed", "controller", "CreateAccount", "error", err)
	}

	utils.RespondWithJSON(w, http.StatusCreated, nil)
}

// GetAllAccountsAdmin godoc
// @Summary      Get all accounts (Admin)
// @Description  Get a list of all accounts with filters and pagination
// @Tags         account
// @Produce      json
// @Param        is_deleted  query     bool    true   "Fetch deleted accounts"
// @Param        page        query     int     false  "Page number"
// @Param        limit       query     int     false  "Limit"
// @Param        search      query     string  false  "Search query"
// @Param        sort        query     string  false  "Sort order"
// @Param        role        query     string  false  "Filter by role"
// @Param        status      query     string  false  "Filter by status"
// @Success      200         {object}  map[string]interface{}  "List of accounts and pagination info"
// @Failure      400         {object}  nil                     "Invalid parameters"
// @Failure      401         {object}  nil                     "Unauthorized"
// @Failure      500         {object}  nil                     "Internal server error"
// @Router       /accounts/ [get]
func GetAllAccountsAdmin(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	query := r.URL.Query()
	param := query.Get("is_deleted")
	isDeleted, err := strconv.ParseBool(param)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching accounts.")
		slog.Error("ParseBool() failed", "controller", "GetAllAccountsAdmin", "error", err)
		return
	}

	// default pagination
	page := -1
	limit := -1

	pageStr := query.Get("page")
	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching accounts.")
			slog.Error("Atoi() failed", "controller", "GetAllAccountsAdmin", "error", err)
			return
		}
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching accounts.")
			slog.Error("Atoi() failed", "controller", "GetAllAccountsAdmin", "error", err)
			return
		}
	}

	filters := models.AccountFilters{
		Search: query.Get("search"),
		Sort:   query.Get("sort"),
		Role:   query.Get("role"),
		Status: query.Get("status"),
	}

	accounts, total, err := db.GetAllAccounts(isDeleted, page, limit, filters)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while fetching accounts.")
		slog.Error("GetAllAccounts() failed", "controller", "GetAllAccountsAdmin", "error", err)
		return
	}

	lastPage := 1
	if limit > 0 {
		lastPage = (total + limit - 1) / limit
		if lastPage == 0 {
			lastPage = 1
		}
	}

	result := models.AccountsListPagination{
		Accounts:     accounts,
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

// SoftDeleteAccount godoc
// @Summary      Soft delete account
// @Description  Marks an account as deleted
// @Tags         account
// @Produce      json
// @Param        id_account  path      int  true  "Account ID"
// @Success      204         {object}  nil  "No Content"
// @Failure      400         {object}  nil  "Invalid ID"
// @Failure      401         {object}  nil  "Unauthorized"
// @Failure      403         {object}  nil  "Forbidden"
// @Failure      404         {object}  nil  "Account not found"
// @Failure      500         {object}  nil  "Internal server error"
// @Router       /accounts/{id_account}/ [delete]
func SoftDeleteAccount(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to delete an account.")
		return
	}
	role := claims.Role
	userID := claims.Id

	id_input := r.PathValue("id_account")
	id_account, err := strconv.Atoi(id_input)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while soft deleting an account.")
		slog.Error("SoftDeleteAccount() failed", "controller", "SoftDeleteAccount", "error", err)
		return
	}

	if role != "admin" && id_account != userID {
		utils.RespondWithError(w, http.StatusForbidden, "You can only delete your own account.")
		return
	}

	// does account exists/not already deleted?
	is_deleted := false
	exists, err := db.CheckAccountExistsById(id_account, &is_deleted)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while soft deleting an account.")
		slog.Error("SoftDeleteAccount() failed", "controller", "SoftDeleteAccount", "error", err)
		return
	}
	if !exists {
		utils.RespondWithError(w, http.StatusNotFound, "Account not found or already deleted.")
		slog.Error("SoftDeleteAccount() failed", "controller", "SoftDeleteAccount", "error", "account not found")
		return
	}

	// can't delete admins
	isAdmin, err := db.CheckIsAdmin(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while soft deleting an account.")
		slog.Error("SoftDeleteAccount() failed", "controller", "SoftDeleteAccount", "error", err)
		return
	}
	if isAdmin {
		utils.RespondWithError(w, http.StatusForbidden, "Admins cannot be soft deleted.")
		slog.Error("SoftDeleteAccount() failed", "controller", "SoftDeleteAccount", "error", "admin cannot be soft deleted")
		return
	}

	err = db.SoftDeleteAccount(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while soft deleting an account.")
		slog.Error("SoftDeleteAccount() failed", "controller", "SoftDeleteAccount", "error", err)
		return
	}

	role_deleted, err := db.GetRoleById(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while soft deleting an account.")
		slog.Error("SoftDeleteAccount() failed", "controller", "SoftDeleteAccount", "error", err)
		return
	}
	if role_deleted == "admin"{
		role_deleted = "employee"
	}
	if role == "admin" {
		err = db.InsertHistory(role_deleted, id_account, "delete", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"is_deleted": false}, map[string]interface{}{"is_deleted": true})
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "SoftDeleteAccount", "error", err)
		}
	}
	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// GetAccountDetails godoc
// @Summary      Get account details
// @Description  Get details of a specific account
// @Tags         account
// @Produce      json
// @Param        id_account  path      int  true  "Account ID"
// @Success      200         {object}  models.AccountDetails
// @Failure      400         {object}  nil  "Invalid ID"
// @Failure      401         {object}  nil  "Unauthorized"
// @Failure      403         {object}  nil  "Forbidden"
// @Failure      500         {object}  nil  "Internal server error"
// @Router       /accounts/{id_account}/ [get]
func GetAccountDetails(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to get account details.")
		return
	}
	role := claims.Role
	userID := claims.Id

	id_input := r.PathValue("id_account")
	id_account, err := strconv.Atoi(id_input)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while getting account details.")
		slog.Error("GetAccountDetails() failed", "controller", "GetAccountDetails", "error", err)
		return
	}

	if role != "admin" && id_account != userID {
		utils.RespondWithError(w, http.StatusForbidden, "You can only get your own account details.")
		return
	}

	account, err := db.GetAccountDetailsById(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while getting account details.")
		slog.Error("GetAccountDetails() failed", "controller", "GetAccountDetails", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, account)
}

// UpdatePassword godoc
// @Summary      Update password
// @Description  Update the password of a specific account
// @Tags         account
// @Accept       json
// @Produce      json
// @Param        id_account  path      int                          true  "Account ID"
// @Param        body        body      models.UpdatePasswordRequest true  "New password"
// @Success      204         {object}  nil  "No Content"
// @Failure      400         {object}  nil  "Invalid request"
// @Failure      401         {object}  nil  "Unauthorized"
// @Failure      403         {object}  nil  "Forbidden"
// @Failure      404         {object}  nil  "Account not found"
// @Failure      500         {object}  nil  "Internal server error"
// @Router       /accounts/{id_account}/password/ [patch]
func UpdatePassword(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to get account details.")
		return
	}
	role := claims.Role
	userID := claims.Id
	var newPassword models.UpdatePasswordRequest

	id_input := r.PathValue("id_account")
	id_account, err := strconv.Atoi(id_input)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating password.")
		slog.Error("Atoi() failed", "controller", "UpdatePassword", "error", err)
		return
	}

	// a user changes another's password
	if role != "admin" && id_account != userID {
		utils.RespondWithError(w, http.StatusForbidden, "You can only update your own account's password.")
		return
	}

	updateRole, err := db.GetRoleById(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating password.")
		slog.Error("GetRoleById() failed", "controller", "UpdatePassword", "error", err)
		return
	}
	// an admin changes password of another admin
	if updateRole == "admin" && id_account != userID {
		utils.RespondWithError(w, http.StatusForbidden, "Only the admin himself/herself can update his/her account's password.")
		return
	}

	err = json.NewDecoder(r.Body).Decode(&newPassword)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating account's password.")
		slog.Error("invalid JSON request body", "error", err)
		return
	}

	is_deleted := false
	exist, err := db.CheckAccountExistsById(id_account, &is_deleted)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating account's password.")
		slog.Error("CheckAccountExistsById() failed", "controller", "UpdatePassword", "error", err)
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, fmt.Sprintf("Account with ID '%v' not found.", id_account))
		return
	}

	err = db.UpdatePassword(id_account, newPassword.Password)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating account's password.")
		slog.Error("UpdatePassword() failed", "controller", "UpdatePassword", "error", err)
		return
	}

	if role == "admin" {
		err = db.InsertHistory(updateRole, id_account, "update", r.Context().Value("user").(models.AuthClaims).Id, nil, nil)
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "UpdatePassword", "error", err)
		}
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// ToggleBanAccount godoc
// @Summary      Toggle ban status
// @Description  Ban or unban an account
// @Tags         account
// @Accept       json
// @Produce      json
// @Param        id_account  path      int                      true  "Account ID"
// @Param        body        body      models.ToggleBanRequest  true  "Current ban status"
// @Success      204         {object}  nil  "No Content"
// @Failure      400         {object}  nil  "Invalid request"
// @Failure      401         {object}  nil  "Unauthorized"
// @Failure      403         {object}  nil  "Forbidden"
// @Failure      404         {object}  nil  "Account not found"
// @Failure      500         {object}  nil  "Internal server error"
// @Router       /accounts/{id_account}/ban/ [patch]
func ToggleBanAccount(w http.ResponseWriter, r *http.Request) {
	// defensive auth check
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to ban/unban an account.")
		return
	}
	role := claims.Role
	userID := claims.Id
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to ban/unban an account.")
		return
	}
	var currentStatus models.ToggleBanRequest
	id_input := r.PathValue("id_account")

	err := json.NewDecoder(r.Body).Decode(&currentStatus)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while banning/unbanning account.")
		slog.Error("invalid JSON request body", "error", err)
		return
	}
	var errMsg string
	if currentStatus.CurrentlyBanned {
		errMsg = "An error occurred while unbanning account."
	} else {
		errMsg = "An error occurred while banning account."
	}
	oldState := models.ToggleBanRequest{CurrentlyBanned: currentStatus.CurrentlyBanned}
	newState := models.ToggleBanRequest{CurrentlyBanned: !currentStatus.CurrentlyBanned}

	id_account, err := strconv.Atoi(id_input)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, errMsg)
		slog.Error("Atoi() failed", "controller", "ToggleBanAccount", "error", err)
		return
	}

	banRole, err := db.GetRoleById(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, errMsg)
		slog.Error("GetRoleById() failed", "controller", "ToggleBanAccount", "error", err)
		return
	}
	// an admin bans another admin or ban himself
	if banRole == "admin" {
		utils.RespondWithError(w, http.StatusForbidden, "You cannot ban an admin.")
		return
	}
	if id_account == userID {
		utils.RespondWithError(w, http.StatusForbidden, "You cannot ban yourself.")
		return
	}

	is_deleted := false
	exist, err := db.CheckAccountExistsById(id_account, &is_deleted)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, errMsg)
		slog.Error("CheckAccountExistsById() failed", "controller", "ToggleBanAccount", "error", err)
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, fmt.Sprintf("Account with ID '%v' not found.", id_account))
		return
	}

	err = db.ToggleBanAccount(id_account, currentStatus.CurrentlyBanned)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, errMsg)
		slog.Error("BanAccount() failed", "controller", "ToggleBanAccount", "error", err)
		return
	}

	if role == "admin" {
		err = db.InsertHistory(banRole, id_account, "update", r.Context().Value("user").(models.AuthClaims).Id, oldState, newState)
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "ToggleBanAccount", "error", err)
		}
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// RecoverAccount godoc
// @Summary      Recover account
// @Description  Restore a soft-deleted account
// @Tags         account
// @Produce      json
// @Param        id_account  path      int  true  "Account ID"
// @Success      204         {object}  nil  "No Content"
// @Failure      400         {object}  nil  "Invalid ID"
// @Failure      401         {object}  nil  "Unauthorized"
// @Failure      404         {object}  nil  "Account not found"
// @Failure      500         {object}  nil  "Internal server error"
// @Router       /accounts/{id_account}/recover/ [patch]
func RecoverAccount(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to recover an account.")
		return
	}
	role := claims.Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to recover an account.")
		return
	}
	id_input := r.PathValue("id_account")
	id_account, err := strconv.Atoi(id_input)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while recovering an account.")
		slog.Error("Atoi() failed", "controller", "RecoverAccount", "error", err)
		return
	}

	is_deleted := true
	exist, err := db.CheckAccountExistsById(id_account, &is_deleted)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while recovering an account.")
		slog.Error("CheckAccountExistsById() failed", "controller", "RecoverAccount", "error", err)
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, fmt.Sprintf("Deleted account with ID '%v' not found.", id_account))
		return
	}
	err = db.RecoverAccount(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while recovering an account.")
		slog.Error("RecoverAccount() failed", "controller", "RecoverAccount", "error", err)
		return
	}

	role_recovered, err := db.GetRoleById(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while recovering an account.")
		slog.Error("GetRoleById() failed", "controller", "RecoverAccount", "error", err)
		return
	}
	if role == "admin" {
		err = db.InsertHistory(role_recovered, id_account, "update", r.Context().Value("user").(models.AuthClaims).Id, map[string]interface{}{"is_deleted": true}, map[string]interface{}{"is_deleted": false})
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "RecoverAccount", "error", err)
		}
	}
	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// GetAccountStats godoc
// @Summary      Get account stats
// @Description  Get activity statistics for a specific account based on its role
// @Tags         account
// @Produce      json
// @Param        id_account  path      int  true  "Account ID"
// @Success      200         {object}  interface{}  "Stats (UserStats, ProStats, or EmployeeStats)"
// @Failure      400         {object}  nil          "Invalid request or role"
// @Failure      401         {object}  nil          "Unauthorized"
// @Failure      404         {object}  nil          "Account not found"
// @Failure      500         {object}  nil          "Internal server error"
// @Router       /accounts/{id_account}/stats/ [get]
func GetAccountStats(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to get account stats.")
		return
	}
	reqRole := claims.Role

	id_input := r.PathValue("id_account")
	id_account, err := strconv.Atoi(id_input)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while getting account stats.")
		slog.Error("Atoi() failed", "controller", "GetAccountStats", "error", err)
		return
	}

	// if not admin then can only get his/her own stats
	if reqRole != "admin" && claims.Id != id_account {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to get another account's stats.")
		return
	}

	exist, err := db.CheckAccountExistsById(id_account, nil)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while getting account stats.")
		slog.Error("CheckAccountExistsById() failed", "controller", "GetAccountStats", "error", err)
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, fmt.Sprintf("Account with ID '%v' not found.", id_account))
		return
	}

	role, err := db.GetRoleById(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while getting account stats.")
		slog.Error("GetRoleById() failed", "controller", "GetAccountStats", "error", err)
		return
	}

	switch role {
	case "user":
		stats, err := db.GetUserStatsById(id_account)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while getting account stats.")
			slog.Error("GetUserStatsById() failed", "controller", "GetAccountStats", "error", err)
			return
		}
		utils.RespondWithJSON(w, http.StatusOK, stats)
	case "pro":
		stats, err := db.GetProStatsById(id_account)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while getting account stats.")
			slog.Error("GetProStatsById() failed", "controller", "GetAccountStats", "error", err)
			return
		}
		utils.RespondWithJSON(w, http.StatusOK, stats)
	case "employee":
		stats, err := db.GetEmployeeStatsById(id_account)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while getting account stats.")
			slog.Error("GetEmployeeStatsById() failed", "controller", "GetAccountStats", "error", err)
			return
		}
		utils.RespondWithJSON(w, http.StatusOK, stats)
	default:
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid role.")
		return
	}
}

// UpdateAccount godoc
// @Summary      Update account
// @Description  Update details of a specific account
// @Tags         account
// @Accept       json
// @Produce      json
// @Param        id_account  path      int                          true  "Account ID"
// @Param        body        body      models.UpdateAccountRequest  true  "Account updates"
// @Success      204         {object}  nil     "No Content"
// @Failure      400         {object}  nil     "Invalid request"
// @Failure      401         {object}  nil     "Unauthorized"
// @Failure      409         {object}  nil     "Email or Username already exists"
// @Failure      500         {object}  nil     "Internal server error"
// @Router       /accounts/{id_account}/update/ [patch]
func UpdateAccount(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(models.AuthClaims)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to update an account.")
		return
	}
	reqRole := claims.Role
	reqID := claims.Id
	id_input := r.PathValue("id_account")
	id_account, err := strconv.Atoi(id_input)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating an account.")
		slog.Error("Atoi() failed", "controller", "UpdateAccount", "error", err)
		return
	}

	exist, err := db.CheckAccountExistsById(id_account, nil)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating an account.")
		slog.Error("CheckAccountExistsById() failed", "controller", "UpdateAccount", "error", err)
		return
	}
	if !exist {
		utils.RespondWithError(w, http.StatusNotFound, fmt.Sprintf("Account with ID '%v' not found.", id_account))
		return
	}

	role, err := db.GetRoleById(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating an account.")
		slog.Error("GetRoleById() failed", "controller", "UpdateAccount", "error", err)
		return
	}

	// check role for update
	if reqRole != "admin" && reqID != id_account {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to update another's account.")
		return
	}
	if role == "admin" && reqID != id_account {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to update another admin's account.")
		return
	}

	var payload models.UpdateAccountRequest
	err = json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating an account.")
		slog.Error("NewDecoder() failed", "controller", "UpdateAccount", "error", err)
		return
	}

	// check if email already exists
	id, err := db.GetAccountIdByEmail(payload.Email)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating an account.")
		slog.Error("GetAccountIdByEmail() failed", "controller", "UpdateAccount", "error", err)
		return
	}
	if id != 0 && id != id_account {
		utils.RespondWithError(w, http.StatusConflict, "Email already exists.")
		return
	}

	username_id, err := db.GetAccountIdByUsername(payload.Username)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating an account.")
		slog.Error("GetAccountIdByUsername() failed", "controller", "UpdateAccount", "error", err)
		return
	}
	if username_id != 0 && username_id != id_account {
		utils.RespondWithError(w, http.StatusConflict, "Username already exists.")
		return
	}

	// Get old state for history before update
	oldAccount, err := db.GetAccountDetailsById(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating an account.")
		slog.Error("GetAccountDetailsById() failed", "controller", "UpdateAccount", "error", err)
		return
	}

	payload.Id = id_account
	err = db.UpdateAccount(payload, role)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating an account.")
		slog.Error("UpdateAccount() failed", "controller", "UpdateAccount", "error", err)
		return
	}

	if claims.Role == "admin" {
		err = db.InsertHistory(role, id_account, "update", claims.Id, oldAccount, payload)
		if err != nil {
			slog.Error("InsertHistory() failed", "controller", "UpdateAccount", "error", err)
		}
	}

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// GetAccountCount godoc
// @Summary      Get account count stats
// @Description  Get total count of accounts and increase since last month
// @Tags         account
// @Produce      json
// @Success      200  {object}  models.AccountCountStats
// @Failure      401  {object}  nil  "Unauthorized"
// @Failure      500  {object}  nil  "Internal server error"
// @Router       /accounts/count/ [get]
func GetAccountCount(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	count, err := db.GetAccountCount()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while getting account count.")
		slog.Error("GetAccountCount() failed", "controller", "GetAccountCount", "error", err)
		return
	}

	// increase since last month
	intIncrease, err := db.GetAccountIncreaseSince(time.Now().AddDate(0, -1, 0))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while getting account count.")
		slog.Error("GetAccountIncreaseSince() failed", "controller", "GetAccountCount", "error", err)
		return
	}

	stats := models.AccountCountStats{
		Total:    count,
		Increase: intIncrease,
	}

	utils.RespondWithJSON(w, http.StatusOK, stats)
}


// ExportAccountsCsv godoc
// @Summary      Export accounts to CSV
// @Description  Exports a list of all accounts into a CSV file downloaded by the client. Admin only.
// @Tags         account
// @Security     ApiKeyAuth
// @Produce      text/csv
// @Success      200  {file}    file  "CSV file containing accounts"
// @Failure      500  {object}  nil   "Internal server error"
// @Router       /accounts/export/ [get]
func ExportAccountsCsv(w http.ResponseWriter, r *http.Request) {
	accounts, _, err := db.GetAllAccounts(false, -1, -1, models.AccountFilters{})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while exporting accounts.")
		slog.Error("GetAllAccounts() failed", "controller", "ExportAccountsCsv", "error", err)
		return
	}

	w.Header().Set("Content-Type", "text/csv")
    w.Header().Set("Content-Disposition", "attachment; filename=UpAgain_accounts.csv")

	writer := csv.NewWriter(w)
	defer writer.Flush()

	writer.Write([]string{"Registered on", "ID", "Username", "Role", "Status", "Email", "Phone"})

	for _, a := range accounts {
		status := "active"
		if a.IsBanned {
			status = "banned"
		}

		// get Phone
		phone := "N/A"
		if a.Role == "user"{
			user, err := db.GetUserDetailsById(a.Id)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while exporting accounts.")
				slog.Error("GetUserDetailsById() failed", "controller", "ExportAccountsCsv", "error", err)
				return
			}
			if user.Phone.Valid{
				phone = user.Phone.String
			}
		}
		if a.Role == "pro"{
			pro, err := db.GetProDetailsById(a.Id)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "An error occurred while exporting accounts.")
				slog.Error("GetProDetailsById() failed", "controller", "ExportAccountsCsv", "error", err)
				return
			}
			if pro.Phone.Valid{
				phone = pro.Phone.String
			}
		}
		err :=writer.Write([]string{
			a.CreatedAt.Format("2006-01-02 15:04:05"),
			strconv.Itoa(a.Id),
			a.Username,
			a.Role,
			status,
			a.Email,
			phone,
		})
		if err != nil {
            slog.Error("Write() failed", "controller", "ExportAccountsCsv", "error", err)
            return
        }
	}
}