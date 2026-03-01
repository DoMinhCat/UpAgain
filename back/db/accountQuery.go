package db

import (
	"backend/models"
	"backend/utils"
	authUtils "backend/utils/auth"
	"database/sql"
	"fmt"
)

// ALL QUERY TO TABLE 'ACCOUNTS'
func GetAccountCredsByEmail(email string) (*models.AccountCreds, error) {
	var user models.AccountCreds

	row := utils.Conn.QueryRow("SELECT id, email, password, role FROM accounts WHERE email=$1", email)
	err := row.Scan(&user.Id, &user.Email, &user.Password, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Return nothing found without an error
		}
		return nil, fmt.Errorf("error getting user by email from DB: %v", err.Error())
	}

	return &user, nil
}

func CheckUsernameExists(username string) (bool, error) {
	var exists bool

	err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM accounts WHERE username=$1)", username).Scan(&exists)
	return exists, err
}

func CheckEmailExists(email string) (bool, error) {
	var exists bool

	err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM accounts WHERE email=$1)", email).Scan(&exists)
	return exists, err
}

func CreateAccount(newAccount models.CreateAccountRequest) error {
	//hash password
	isAdmin := false
	hashedPassword := authUtils.HashPassword(newAccount.Password)

	if newAccount.Role == "admin" || newAccount.Role == "employee" {
		newAccount.Phone = ""
	}
	if newAccount.Role == "admin" {
		isAdmin = true
		newAccount.Role = "employee"
	}

	// insert into 'accounts'
	var insertedId int
	err := utils.Conn.QueryRow(
		"INSERT INTO accounts(email, username, password, role) VALUES ($1,$2,$3,$4) RETURNING id;",
		newAccount.Email, newAccount.Username, hashedPassword, newAccount.Role).Scan(&insertedId)
	if err != nil {
		return fmt.Errorf("error inserting new account into database: %v", err.Error())
	}

	// insert into 'users/pros/employees'
	switch newAccount.Role {
	case "user":
		err = CreateUser(newAccount, insertedId)
		if err != nil {
			return err
		}

	case "pro":
		err = CreatePro(newAccount, insertedId)
		if err != nil {
			return err
		}

	case "employee":
		err = CreateEmployee(insertedId, isAdmin)
		if err != nil {
			return err
		}

	default:
		return fmt.Errorf("invalid role '%s'.", newAccount.Role)
	}

	return nil
}

// DO NOT use for endpoints, only for api internal use, all records should be soft deleted
func DeleteAccount(id int) error {

	_, err := utils.Conn.Exec("DELETE FROM accounts WHERE id=$1;", id)
	if err != nil {
		return fmt.Errorf("DeleteAccount() failed: %v", err.Error())
	}
	return nil
}

// get account not soft deleted
func GetAllAccounts() ([]models.Account, error) {
	var accounts []models.Account

	rows, err := utils.Conn.Query("SELECT id, email, username, role, is_banned, created_at FROM accounts WHERE deleted_at IS NULL")
	if err != nil {
		return nil, fmt.Errorf("GetAllAccounts() failed: %v", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var account models.Account
		if err := rows.Scan(&account.Id, &account.Email, &account.Username, &account.Role, &account.IsBanned, &account.CreatedAt); err != nil {
			return nil, fmt.Errorf("GetAllAccounts() failed: %v", err.Error())
		}
		if account.Role == "employee" {
			isAdmin, err := CheckIsAdmin(account.Id)
			if err != nil {
				return nil, fmt.Errorf("GetAllAccounts() failed: %v", err.Error())
			}
			if isAdmin {
				account.Role = "admin"
			}
		}
		accounts = append(accounts, account)
	}

	return accounts, nil
}

func GetAccountDetailsById(id_account int) (models.AccountDetails, error) {
	var account models.AccountDetails

	row := utils.Conn.QueryRow("SELECT id, email, username, role, is_banned, created_at FROM accounts WHERE id=$1 AND deleted_at IS NULL", id_account)
	err := row.Scan(&account.Id, &account.Email, &account.Username, &account.Role, &account.IsBanned, &account.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows{
			return models.AccountDetails{}, nil
		}
		return models.AccountDetails{}, fmt.Errorf("GetAccountById() failed: %v", err.Error())
	}
	if account.Role == "employee" {
		isAdmin, err := CheckIsAdmin(account.Id)
		if err != nil {
			return models.AccountDetails{}, fmt.Errorf("GetAccountById() failed: %v", err.Error())
		}
		if isAdmin {
			account.Role = "admin"
		}
	}
	if account.Role == "pro"{
		proDetails, err := GetProDetailsById(id_account)
		if err != nil {
			return models.AccountDetails{}, fmt.Errorf("GetAccountById() failed: %v", err.Error())
		}
		account.Phone = proDetails.Phone
		account.IsPremium = proDetails.IsPremium
	}

	if account.Role == "user"{
		userDetail, err := GetUserDetailsById(id_account)
		if err != nil {
			return models.AccountDetails{}, fmt.Errorf("GetAccountById() failed: %v", err.Error())
		}
		account.Phone = userDetail.Phone
		account.Score = userDetail.Score
	}
	return account, nil
}

func CheckAccountExistsById(id_account int) (bool, error) {
	var exists bool

	err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM accounts WHERE id=$1 AND deleted_at IS NULL)", id_account).Scan(&exists)
	return exists, err
}

func SoftDeleteAccount(id_account int) error {
	_, err := utils.Conn.Exec("UPDATE accounts SET deleted_at=NOW() WHERE id=$1;", id_account)
	if err != nil {
		return fmt.Errorf("SoftDeleteAccount() failed: %v", err.Error())
	}
	return nil
}