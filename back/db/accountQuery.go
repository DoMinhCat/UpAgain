package db

import (
	"backend/models"
	"backend/utils"
	authUtils "backend/utils/auth"
	"database/sql"
	"fmt"
)

func GetAccountCredsByEmail(email string) (*models.AccountCreds, error){
	var user models.AccountCreds

	row := utils.Conn.QueryRow("SELECT email, password, role FROM accounts WHERE email=$1", email)
	err := row.Scan(&user.Email, &user.Password, &user.Role)
	if err!=nil{
		if err == sql.ErrNoRows {
            return nil, nil // Return nothing found without an error
        }
		return nil, fmt.Errorf("error getting user by email from DB: %v", err.Error())
	}

	return &user, nil
}

func CheckUsernameExists(username string) (bool, error){
	var exists bool

    err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM accounts WHERE username=$1)", username).Scan(&exists)
    return exists, err
}

func CheckEmailExists(email string) (bool, error){
	var exists bool

    err := utils.Conn.QueryRow("SELECT EXISTS(SELECT 1 FROM accounts WHERE email=$1)", email).Scan(&exists)
    return exists, err
}

func CreateAccount(newAccount models.CreateAccountRequest) error{
	//hash password
	hashedPassword := authUtils.HashPassword(newAccount.Password)

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
		_, err := utils.Conn.Exec("INSERT INTO users(id_account) VALUES ($1);", insertedId)
		if err != nil {
			err = DeleteAccount(insertedId)
			if err!=nil {
				return fmt.Errorf("error rolling back after failed insertion into 'users': %w", err)
			}
			return fmt.Errorf("error inserting into users table: %w", err)
		}

	case "pro":
		_, err := utils.Conn.Exec("INSERT INTO pros(id_account) VALUES ($1);", insertedId)
		if err != nil {
			err = DeleteAccount(insertedId)
			if err!=nil {
				return fmt.Errorf("error rolling back after failed insertion into 'pros': %w", err)
			}
			return fmt.Errorf("error inserting into pros table: %w", err)
		}

	case "employee":
		_, err := utils.Conn.Exec("INSERT INTO employees(id_account) VALUES ($1);", insertedId)
		if err != nil {
			err = DeleteAccount(insertedId)
			if err!=nil {
				return fmt.Errorf("error rolling back after failed insertion into 'employees': %w", err)
			}
			return fmt.Errorf("error inserting into employees table: %w", err)
		}

	default:
		return fmt.Errorf("invalid role '%s'", newAccount.Role)
	}
	
	return nil
}

// DO NOT use for endpoints, only for internal use, all records should be soft deleted
func DeleteAccount(id int) error {

	_, err := utils.Conn.Exec("DELETE FROM accounts WHERE id=$1;", id)
	if err != nil {
		return fmt.Errorf("error deleting account from database: %v", err.Error())
	}
	return nil
}