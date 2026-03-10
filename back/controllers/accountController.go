package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	validations "backend/utils/validations"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
)

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

	if newAccount.Role == "admin" || newAccount.Role == "employee" {
		if role != "admin" {
			utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to create an admin or employee account.")
			return
		}
	}

	validationResponse := validations.ValidateAccountCreation(newAccount)
	if !validationResponse.Success {
		utils.RespondWithError(w, validationResponse.Error, validationResponse.Message)
		return
	}

	err = db.CreateAccount(newAccount)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while creating an account for you.")
		slog.Error("CreateAccount() failed", "controller", "CreateAccount", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, nil)
}

func GetAllAccountsAdmin(w http.ResponseWriter, r *http.Request) {
	role := r.Context().Value("user").(models.AuthClaims).Role
	if role != "admin" {
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this request.")
		return
	}

	param := r.URL.Query().Get("is_deleted")
	isDeleted, err := strconv.ParseBool(param)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while fetching accounts.")
		slog.Error("ParseBool() failed", "controller", "GetAllAccountsAdmin", "error", err)
		return
	}
	
	slog.Debug("isDeleted", "isDeleted", isDeleted)
	accounts, err := db.GetAllAccounts(isDeleted)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while fetching accounts.")
		slog.Error("GetAllAccounts() failed", "controller", "GetAllAccountsAdmin", "error", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, accounts)
}

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

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

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

	deleteRole, err := db.GetRoleById(id_account)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating password.")
		slog.Error("GetRoleById() failed", "controller", "UpdatePassword", "error", err)
		return
	}
	// an admin changes password of another admin
	if deleteRole == "admin" && id_account != userID {
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

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

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

	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

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
	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}

// GetAccountStats gets the stats based on account's role to display in admin user's detail view
// Frontend route: /admin/users/:id, in the section "Activities"
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
	if reqRole !="admin" && reqID != id_account{
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to update another's account.")
		return
	}
	if role == "admin" && reqID != id_account{
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

	payload.Id = id_account
	err = db.UpdateAccount(payload, role)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while updating an account.")
		slog.Error("UpdateAccount() failed", "controller", "UpdateAccount", "error", err)
		return
	}
	
	utils.RespondWithJSON(w, http.StatusNoContent, nil)
}