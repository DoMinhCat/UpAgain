package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	validations "backend/utils/validations"
	"encoding/json"
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
		utils.RespondWithError(w, http.StatusUnauthorized, "You are not authorized to create an account.")
		return
	}
	accounts, err := db.GetAllAccounts()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while fetching accounts.")
		slog.Error("GetAllAccountsAdmin() failed", "controller", "GetAllAccountsAdmin", "error", err)
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
	exists, err := db.CheckAccountExistsById(id_account)
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