package validations

import (
	"backend/db"
	"backend/models"
	"fmt"
	"net/http"
	"regexp"
)

// basic validations for creating/updating an account
func ValidateAccountCreation(newAccount models.CreateAccountRequest) models.ValidationResponse {
	var response models.ValidationResponse

	isValidUsername, errMsg := validateUsername(newAccount.Username, 0) 
	if !isValidUsername{
		response = models.ValidationResponse{
			Success: false,
			Message: errMsg,
			Error:   http.StatusBadRequest,
		}
		return response
	}

	isValidPassword, errMsg := validatePassword(newAccount.Password)
	if !isValidPassword{
		response = models.ValidationResponse{
			Success: false,
			Message: errMsg,
			Error:   http.StatusBadRequest,
		}
		return response
	}

	isValidEmail, errMsg := validateEmail(newAccount.Email, 0)
	if !isValidEmail{
		response = models.ValidationResponse{
			Success: false,
			Message: errMsg,
			Error:   http.StatusBadRequest,
		}
		return response
	}

	if newAccount.Phone != "" {
		isValidPhone, errMsg := validatePhone(newAccount.Phone)
		if !isValidPhone{
			response = models.ValidationResponse{
				Success: false,
				Message: errMsg,
				Error:   http.StatusBadRequest,
			}
			return response
		}
	}

	isValidRole, errMsg := validateRole(newAccount.Role)
	if !isValidRole{
		response = models.ValidationResponse{
			Success: false,
			Message: errMsg,
			Error:   http.StatusBadRequest,
		}
		return response
	}

	return models.ValidationResponse{
		Success: true,
		Message: "",
		Error:   http.StatusOK,
	}
}

func ValidateAccountUpdate(newAccount models.UpdateAccountRequest) models.ValidationResponse {
	var response models.ValidationResponse

	if newAccount.Username != "" {
		isValidUsername, errMsg := validateUsername(newAccount.Username, newAccount.Id)
		if !isValidUsername{
			response = models.ValidationResponse{
				Success: false,
				Message: errMsg,
				Error:   http.StatusBadRequest,
			}
			return response
		}
	}

	if newAccount.Email != "" {
		isValidEmail, errMsg := validateEmail(newAccount.Email, newAccount.Id)
		if !isValidEmail{
			response = models.ValidationResponse{
				Success: false,
				Message: errMsg,
				Error:   http.StatusBadRequest,
			}
			return response
		}
	}

	if newAccount.Phone != "" {
		isValidPhone, errMsg := validatePhone(newAccount.Phone)
		if !isValidPhone{
			response = models.ValidationResponse{
				Success: false,
				Message: errMsg,
				Error:   http.StatusBadRequest,
			}
			return response
		}
	}



	return models.ValidationResponse{
		Success: true,
		Message: "",
		Error:   http.StatusOK,
	}
}

func validateUsername(username string, reqId int) (bool, string) {
	if len(username) < 4 || len(username) > 20 {
		return false, "Username must be between 4 and 20 characters."
	}
	// Check for existed username
	usernameExists, err := db.CheckUsernameExists(username)
	if err != nil {
		return false, "An error occured while creating/updating an account for you."
	}
	if usernameExists {
		if reqId != 0{
			// check if same username as ANOTHER user
			dupId, err := db.GetIdByUsernameByEmail(&username, nil)
			if err != nil {
				return false, "An error occured while creating/updating an account for you."
			}
			if dupId != reqId{
				return false, fmt.Sprintf("'%s' has been taken, please choose another username.", username)
			}
		} else {
			return false, fmt.Sprintf("'%s' has been taken, please choose another username.", username)
		}
	}
	return true, ""
}

func validatePassword(password string) (bool, string) {
	if len(password) < 12 || len(password) > 60 {
		return false, "Password must be between 12 and 60 characters."
	}
	passwordMatch, _ := regexp.Match("[A-Z]", []byte(password))
	if !passwordMatch {
		return false, "Password must contain at least one capital character."
	}
	passwordMatch, _ = regexp.Match("[0-9]", []byte(password))
	if !passwordMatch {
		return false, "Password must contain at least one digit."
	}
	passwordMatch, _ = regexp.Match("\\W", []byte(password))
	if !passwordMatch {
		return false, "Password must contain at least one special character."
	}
	return true, ""
}

func validateEmail(email string, reqId int) (bool, string) {
	emailRegex := `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`
	emailMatch, _ := regexp.MatchString(emailRegex, email)
	if !emailMatch {
		return false, "Invalid email format."
	}
	emailExists, err := db.CheckEmailExists(email)
	if err != nil {
		return false, "An error occured while creating/updating an account for you."
	}
	if emailExists {
		if reqId != 0{
			// check if same username as ANOTHER user
			dupId, err := db.GetIdByUsernameByEmail(nil, &email)
			if err != nil {
				return false, "An error occured while creating/updating an account for you."
			}
			if dupId != reqId{
				return false, fmt.Sprintf("'%s' has been taken, please choose another email.", email)
			}
		} else{
			return false, fmt.Sprintf("'%s' has been taken, please choose another email.", email)
		}
	}

	return true, ""
}

func validatePhone(phone string) (bool, string) {
	phoneRegex := `^\+?[0-9]{10,15}$`
	phoneMatch, _ := regexp.MatchString(phoneRegex, phone)
	if !phoneMatch {
		return false, "Invalid phone number."
	}
	return true, ""
}

func validateRole(role string) (bool, string) {
	if role != "user" && role != "pro" && role != "employee" && role != "admin" {
		return false, "Invalid role."
	}
	return true, ""
}

