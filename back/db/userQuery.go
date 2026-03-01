package db

import (
	"backend/models"
	"backend/utils"
	"database/sql"
	"fmt"
)

func CreateUser(newAccount models.CreateAccountRequest, accountID int) error {
	var err error
	if newAccount.Phone != "" {
		_, err = utils.Conn.Exec("INSERT INTO users(id_account, phone) VALUES ($1, $2);", accountID, newAccount.Phone)
	} else {
		_, err = utils.Conn.Exec("INSERT INTO users(id_account) VALUES ($1);", accountID)
	}
	if err != nil {
		err = DeleteAccount(accountID)
		if err != nil {
			return fmt.Errorf("error rolling back after failed insertion into 'users': %w", err)
		}
		return fmt.Errorf("CreateUser() failed: %w", err)
	}
	return nil
}

func GetUserDetailsById(id_account int) (models.UserDetails, error){
	var userDetails models.UserDetails
	err := utils.Conn.QueryRow("SELECT phone, up_score FROM users WHERE id_account=$1", id_account).Scan(&userDetails.Phone, &userDetails.Score)
	if err!=nil{
		if err == sql.ErrNoRows{
			return models.UserDetails{}, nil
		}
		return models.UserDetails{}, fmt.Errorf("GetUserDetailsById() failed: %v", err.Error())
	}
	return userDetails, nil
}