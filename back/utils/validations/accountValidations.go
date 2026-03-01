package validations

import (
	"backend/db"
	"backend/models"
	"fmt"
	"net/http"
	"regexp"
)

// basic validations for creating an account
func ValidateAccountCreation(newAccount models.CreateAccountRequest) models.ValidationResponse {
	var response models.ValidationResponse
	
	if len(newAccount.Username) < 4 || len(newAccount.Username) > 20 {
		response = models.ValidationResponse{
			Success: false,
			Message: "Username must be between 4 and 20 characters.",
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if len(newAccount.Password) < 12 || len(newAccount.Password) > 60 {
		response = models.ValidationResponse{
			Success: false,
			Message: "Password must be between 12 and 60 characters.",
			Error:   http.StatusBadRequest,
		}
		return response
	}

	emailRegex := `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`
	emailMatch, _ := regexp.MatchString(emailRegex, newAccount.Email)
	if !emailMatch {
		response = models.ValidationResponse{
			Success: false,
			Message: "Invalid email format.",
			Error:   http.StatusBadRequest,
		}
		return response
	}

	passwordMatch, _ := regexp.Match("[A-Z]", []byte(newAccount.Password))
	if !passwordMatch {
		response = models.ValidationResponse{
			Success: false,
			Message: "Password must contain at least one capital character.",
			Error:   http.StatusBadRequest,
		}
		return response
	}
	passwordMatch, _ = regexp.Match("[0-9]", []byte(newAccount.Password))
	if !passwordMatch {
		response = models.ValidationResponse{
			Success: false,
			Message: "Password must contain at least one digit.",
			Error:   http.StatusBadRequest,
		}
		return response
	}
	passwordMatch, _ = regexp.Match("\\W", []byte(newAccount.Password))
	if !passwordMatch {
		response = models.ValidationResponse{
			Success: false,
			Message: "Password must contain at least one special character.",
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newAccount.Phone != "" {
		phoneRegex := `^\+?[0-9]{10,15}$`
		phoneMatch, _ := regexp.MatchString(phoneRegex, newAccount.Phone)
		if !phoneMatch {
			response = models.ValidationResponse{
				Success: false,
				Message: "Invalid phone number.",
				Error:   http.StatusBadRequest,
			}
			return response
		}
	}

	if newAccount.Role != "user" && newAccount.Role != "pro" && newAccount.Role != "employee" && newAccount.Role != "admin" {
		response = models.ValidationResponse{
			Success: false,
			Message: "Invalid role.",
			Error:   http.StatusBadRequest,
		}
		return response
	}

	// Check for existed username
	usernameExists, err := db.CheckUsernameExists(newAccount.Username)
	if err != nil {
		response = models.ValidationResponse{
			Success: false,
			Message: "An error occured while creating an account for you.",
			Error:   http.StatusInternalServerError,
		}
		return response
	}
	if usernameExists {
		response = models.ValidationResponse{
			Success: false,
			Message: fmt.Sprintf("'%s' has been taken, please choose another username.", newAccount.Username),
			Error:   http.StatusConflict,
		}
		return response
	}
	// Check for existed email
	emailExists, err := db.CheckEmailExists(newAccount.Email)
	if err != nil {
		response = models.ValidationResponse{
			Success: false,
			Message: "An error occured while creating an account for you.",
			Error:   http.StatusInternalServerError,
		}
		return response
	}
	if emailExists {
		response = models.ValidationResponse{
			Success: false,
			Message: "An account has been already registered with this email.",
			Error:   http.StatusConflict,
		}
		return response
	}

	response = models.ValidationResponse{
		Success: true,
		Message: "",
		Error:   http.StatusOK,
	}
	return response
}
