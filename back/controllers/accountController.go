package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"regexp"
)

func CreateAccount(w http.ResponseWriter, r *http.Request) {
	var newAccount models.CreateAccountRequest

	var err = json.NewDecoder(r.Body).Decode(&newAccount)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occurred while creating an account for you.")
		slog.Debug("invalid JSON request body", "error", err)
		return
	}

	// validate
	if len(newAccount.Username) < 4 || len(newAccount.Username) > 20 {
		utils.RespondWithError(w, http.StatusBadRequest, "Username must be between 4 and 20 characters.")
		return
	}

	if len(newAccount.Password) < 12 || len(newAccount.Password) > 60 {
		utils.RespondWithError(w, http.StatusBadRequest, "Password must be between 12 and 60 characters.")
		return
	}

	emailRegex := `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`
	emailMatch, _ := regexp.MatchString(emailRegex, newAccount.Email)
	if !emailMatch {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid email format.")
		return
	}

	passwordMatch, _ := regexp.Match("[A-Z]", []byte(newAccount.Password))
	if !passwordMatch {
		utils.RespondWithError(w, http.StatusBadRequest, "Password must contain at least one capital character")
		return
	}
	passwordMatch, _ = regexp.Match("[0-9]", []byte(newAccount.Password))
	if !passwordMatch {
		utils.RespondWithError(w, http.StatusBadRequest, "Password must contain at least one digit")
		return
	}
	passwordMatch, _ = regexp.Match("\\W", []byte(newAccount.Password))
	if !passwordMatch {
		utils.RespondWithError(w, http.StatusBadRequest, "Password must contain at least one special character.")
		return
	}

	if newAccount.Phone != "" {
		phoneRegex := `^\+?[0-9]{10,15}$`
		phoneMatch, _ := regexp.MatchString(phoneRegex, newAccount.Phone)
		if !phoneMatch {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid phone number.")
			return
		}
	}

	if newAccount.Role != "user" && newAccount.Role != "pro" && newAccount.Role != "employee" {
		utils.RespondWithError(w, http.StatusBadRequest, "An error occured while creating an account for you.")
		slog.Error("Invalid role", "role", newAccount.Role)
		return
	}

	// Check for existed username
	usernameExists, err := db.CheckUsernameExists(newAccount.Username)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while creating an account for you.")
		return
	}
	if usernameExists {
		utils.RespondWithError(w, http.StatusConflict, fmt.Sprintf("'%s' has been taken, please choose another username.", newAccount.Username))
		return
	}
	// Check for existed email
	emailExists, err := db.CheckEmailExists(newAccount.Email)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while creating an account for you.")
		return
	}
	if emailExists {
		utils.RespondWithError(w, http.StatusConflict, "An account has been already registered with this email.")
		return
	}

	err = db.CreateAccountUser(newAccount)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "An error occured while creating an account for you.")
		slog.Debug("CreateAccountUser() failed", "error", err)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
